import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB, redactConnectionString, sanitizeError } from '../config/db.js';
import { env } from '../config/env.js';
import { validateSyncGuard } from '../../scripts/sync-indexes.js';
import { Campus, Membership, User } from '../models/index.js';

describe('MongoDB Atlas Readiness Suite', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Connection Handling & Production Refusal', () => {
    it('refuses to start in production environment when MONGODB_URI is missing', async () => {
      const originalNodeEnv = env.NODE_ENV;
      const originalUri = env.MONGODB_URI;

      try {
        env.NODE_ENV = 'production';
        env.MONGODB_URI = '';

        // Disconnect temporarily to test initial connection refusal
        await disconnectDB();

        await expect(connectDB()).rejects.toThrow(
          /Production environment must configure MONGODB_URI/
        );
      } finally {
        env.NODE_ENV = originalNodeEnv;
        env.MONGODB_URI = originalUri;
        // Re-establish connection for following tests
        await connectDB();
      }
    });

    it('reuses cached connection across warm invocations via globalThis', async () => {
      expect(globalThis.mongoose).toBeDefined();
      expect(globalThis.mongoose.conn).toBeDefined();

      const conn1 = await connectDB();
      const conn2 = await connectDB();

      expect(conn1).toBe(conn2);
      expect(conn1.connection.readyState).toBe(1);
    });
  });

  describe('2. Credential Redaction & Log Sanitization', () => {
    it('redacts credentials from mongodb+srv and standard mongodb URIs', () => {
      const atlasUri =
        'mongodb+srv://admin_user:SuperSecretPassword123!@cluster0.abcde.mongodb.net/clubrelay?retryWrites=true&w=majority';
      const redactedAtlas = redactConnectionString(atlasUri);
      expect(redactedAtlas).toBe(
        'mongodb+srv://***:***@cluster0.abcde.mongodb.net/clubrelay?retryWrites=true&w=majority'
      );
      expect(redactedAtlas).not.toContain('admin_user');
      expect(redactedAtlas).not.toContain('SuperSecretPassword123!');

      const localAuthUri = 'mongodb://app_db_user:my_secret_pass@127.0.0.1:27017/clubrelay_test';
      const redactedLocal = redactConnectionString(localAuthUri);
      expect(redactedLocal).toBe('mongodb://***:***@127.0.0.1:27017/clubrelay_test');
      expect(redactedLocal).not.toContain('app_db_user');
      expect(redactedLocal).not.toContain('my_secret_pass');
    });

    it('sanitizes Error objects containing connection strings', () => {
      const err = new Error(
        'Connection timeout connecting to mongodb+srv://db_admin:P@ssword999@cluster.xyz.mongodb.net/prod'
      );
      const sanitized = sanitizeError(err);
      expect(sanitized.message).toBe(
        'Connection timeout connecting to mongodb+srv://***:***@cluster.xyz.mongodb.net/prod'
      );
      expect(sanitized.message).not.toContain('P@ssword999');
    });
  });

  describe('3. Rate-Limited Health Check (GET /api/v1/health)', () => {
    it('returns 200 with { ok: true, db: "up" } when database ping succeeds', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ok: true,
        db: 'up',
      });

      // Strictly verify no internal details are exposed
      expect(res.body.host).toBeUndefined();
      expect(res.body.version).toBeUndefined();
      expect(res.body.collections).toBeUndefined();
      expect(res.body.counts).toBeUndefined();
      expect(res.body.name).toBeUndefined();
    });

    it('returns 503 with { ok: false, db: "down" } when database is disconnected or ping fails', async () => {
      const readyStateSpy = vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(0);

      try {
        const res = await request(app).get('/api/v1/health');

        expect(res.status).toBe(503);
        expect(res.body).toEqual({
          ok: false,
          db: 'down',
        });
      } finally {
        readyStateSpy.mockRestore();
      }
    });
  });

  describe('4. Index Sync Safety Guards', () => {
    it('refuses to sync indexes in production without ALLOW_INDEX_SYNC=1', () => {
      expect(() => {
        validateSyncGuard({
          NODE_ENV: 'production',
          MONGODB_URI: 'mongodb://127.0.0.1:27017/test',
          ALLOW_INDEX_SYNC: '0',
        });
      }).toThrow(/Refusing to sync indexes in production environment without ALLOW_INDEX_SYNC=1/);
    });

    it('refuses to sync indexes against remote mongodb+srv cluster without ALLOW_INDEX_SYNC=1', () => {
      expect(() => {
        validateSyncGuard({
          NODE_ENV: 'development',
          MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/test',
          ALLOW_INDEX_SYNC: '0',
        });
      }).toThrow(/Refusing to sync indexes against remote cluster/);
    });

    it('allows index sync when ALLOW_INDEX_SYNC=1 is explicitly set', () => {
      expect(() => {
        validateSyncGuard({
          NODE_ENV: 'production',
          MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/test',
          ALLOW_INDEX_SYNC: '1',
        });
      }).not.toThrow();
    });
  });

  describe('5. Model Indexes Verification', () => {
    it('verifies User has unique compound index on { campusId, email }', () => {
      const userIndexes = User.schema.indexes();
      const hasUniqueCampusEmail = userIndexes.some(
        ([fields, options]) => fields.campusId === 1 && fields.email === 1 && options?.unique === true
      );
      expect(hasUniqueCampusEmail).toBe(true);
    });

    it('verifies Campus has unique slug and indexed domain', () => {
      const slugIndex = Campus.schema.path('slug')._index;
      expect(slugIndex?.unique).toBe(true);

      const domainIndex = Campus.schema.path('domain')._index;
      expect(domainIndex).toBeTruthy();
    });

    it('verifies Membership has compound index on { userId, status }', () => {
      const membershipIndexes = Membership.schema.indexes();
      const hasUserStatusIndex = membershipIndexes.some(
        ([fields]) => fields.userId === 1 && fields.status === 1
      );
      expect(hasUserStatusIndex).toBe(true);
    });
  });
});
