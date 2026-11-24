import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { Campus, User } from '../models/index.js';
import { validateSeedGuard, validateSeedEnv } from '../../scripts/seed-dev.js';

describe('Development Seeding Safety Guards & Login Tenant Isolation', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Campus.deleteMany({});
  });

  describe('Seed Dev Safety Guards (validateSeedGuard & validateSeedEnv)', () => {
    it('refuses to run when NODE_ENV is "production"', () => {
      expect(() => {
        validateSeedGuard({
          NODE_ENV: 'production',
          MONGODB_URI: 'mongodb://127.0.0.1:27017/dev',
        });
      }).toThrow(/Refusing to seed in production environment/);
    });

    it('refuses to run when MONGODB_URI is missing or empty', () => {
      expect(() => {
        validateSeedGuard({
          NODE_ENV: 'development',
          MONGODB_URI: '',
        });
      }).toThrow(/MONGODB_URI is missing/);

      expect(() => {
        validateSeedGuard({
          NODE_ENV: 'development',
        });
      }).toThrow(/MONGODB_URI is missing/);
    });

    it('refuses to run against remote MongoDB URI unless ALLOW_SEED=1 is set', () => {
      const remoteUri = 'mongodb+srv://user:pass@cluster0.mongodb.net/testdb';

      expect(() => {
        validateSeedGuard({
          NODE_ENV: 'development',
          MONGODB_URI: remoteUri,
          ALLOW_SEED: '0',
        });
      }).toThrow(/targets a remote host\. Set ALLOW_SEED=1/);

      // With ALLOW_SEED=1, it should not throw
      expect(() => {
        validateSeedGuard({
          NODE_ENV: 'development',
          MONGODB_URI: remoteUri,
          ALLOW_SEED: '1',
        });
      }).not.toThrow();
    });

    it('allows localhost and 127.0.0.1 without ALLOW_SEED', () => {
      expect(() => {
        validateSeedGuard({
          NODE_ENV: 'development',
          MONGODB_URI: 'mongodb://localhost:27017/clubrelay_dev',
        });
      }).not.toThrow();

      expect(() => {
        validateSeedGuard({
          NODE_ENV: 'development',
          MONGODB_URI: 'mongodb://127.0.0.1:27017/clubrelay_dev',
        });
      }).not.toThrow();
    });

    it('refuses to run when any SEED_* variable is missing', () => {
      const validConfig = {
        SEED_CAMPUS_NAME: 'GITAM University',
        SEED_CAMPUS_SLUG: 'gitam',
        SEED_CAMPUS_DOMAIN: 'student.gitam.edu',
        SEED_USER_EMAIL: 'admin@student.gitam.edu',
        SEED_USER_FULL_NAME: 'System Admin',
        SEED_USER_PASSWORD: 'SecurePassword123!',
      };

      expect(() => validateSeedEnv(validConfig)).not.toThrow();

      // Missing password
      const withoutPassword = { ...validConfig, SEED_USER_PASSWORD: '' };
      expect(() => validateSeedEnv(withoutPassword)).toThrow(/Missing required seed environment variables: SEED_USER_PASSWORD/);

      // Missing domain & email
      const withoutDomainAndEmail = { ...validConfig, SEED_CAMPUS_DOMAIN: '', SEED_USER_EMAIL: '' };
      expect(() => validateSeedEnv(withoutDomainAndEmail)).toThrow(/SEED_CAMPUS_DOMAIN, SEED_USER_EMAIL/);
    });
  });

  describe('Login Multi-Tenant Resolution & Cross-Tenant Isolation', () => {
    let campusA;
    let campusB;

    beforeEach(async () => {
      campusA = await Campus.create({
        name: 'Campus Alpha',
        slug: 'alpha',
        domain: 'alpha.edu',
        settings: { allowSelfRegistration: true },
      });

      campusB = await Campus.create({
        name: 'Campus Beta',
        slug: 'beta',
        domain: 'beta.edu',
        settings: { allowSelfRegistration: true },
      });
      expect(campusB._id).toBeDefined();

      const passwordHash = await User.hashPassword('Secret123!');

      // Create user on Campus Alpha
      await User.create({
        campusId: campusA._id,
        fullName: 'Alpha User',
        email: 'shared.name@alpha.edu',
        passwordHash,
        campusRole: 'STUDENT',
        isActive: true,
      });
    });

    it('rejects login with generic error when email domain does not match any campus', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@nonexistent-domain.edu', password: 'Secret123!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('Invalid email or password.');
    });

    it('rejects login with generic error when user exists on Campus A but attempts login with Campus B domain', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'shared.name@beta.edu', password: 'Secret123!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('Invalid email or password.');
    });

    it('rejects login with generic error when password is wrong', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'shared.name@alpha.edu', password: 'WrongPassword!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('Invalid email or password.');
    });

    it('authenticates successfully when email domain matches campus and credentials are valid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'shared.name@alpha.edu', password: 'Secret123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('shared.name@alpha.edu');
      expect(res.body.data.user.campusId._id.toString()).toBe(campusA._id.toString());

      // Sets HttpOnly cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const authCookie = cookies.find((c) => c.startsWith('cr_auth_token='));
      expect(authCookie).toBeDefined();
      expect(authCookie).toContain('HttpOnly');
    });
  });
});
