import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { User, Campus, FederatedIdentity } from '../models/index.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { handleFederatedLogin } from '../controllers/authController.js';

describe('OAuth & Social Authentication Suite', () => {
  let pcuCampus;
  let existingUser;

  beforeAll(async () => {
    await connectDB();

    pcuCampus = await Campus.create({
      name: 'Pacific Coast University',
      slug: 'pcu-oauth',
      domain: 'pcu.edu',
      settings: {
        allowSelfRegistration: true,
      },
    });

    await Campus.create({
      name: 'Closed University',
      slug: 'closed-oauth',
      domain: 'closed.edu',
      settings: {
        allowSelfRegistration: false,
      },
    });

    existingUser = await User.create({
      campusId: pcuCampus._id,
      fullName: 'Alice Existing',
      email: 'alice.existing@pcu.edu',
      passwordHash: await User.hashPassword('Password123!'),
      campusRole: 'STUDENT',
      isActive: true,
    });
  });

  afterAll(async () => {
    await FederatedIdentity.deleteMany({});
    await User.deleteMany({});
    await Campus.deleteMany({});
    await disconnectDB();
  });

  describe('GET /api/v1/auth/providers', () => {
    it('returns available social authentication providers status', async () => {
      const res = await request(app).get('/api/v1/auth/providers');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('google');
      expect(res.body.data).toHaveProperty('github');
      expect(typeof res.body.data.google.enabled).toBe('boolean');
      expect(typeof res.body.data.github.enabled).toBe('boolean');
    });
  });

  describe('OAuth Initiation Endpoints', () => {
    it('returns 503 if Google OAuth is unconfigured', async () => {
      const res = await request(app).get('/api/v1/auth/google');
      if (res.status === 503) {
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('OAUTH_NOT_CONFIGURED');
      } else {
        expect(res.status).toBe(302);
      }
    });

    it('returns 503 if GitHub OAuth is unconfigured', async () => {
      const res = await request(app).get('/api/v1/auth/github');
      if (res.status === 503) {
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('OAUTH_NOT_CONFIGURED');
      } else {
        expect(res.status).toBe(302);
      }
    });
  });

  describe('OAuth State Validation in Callbacks', () => {
    it('rejects Google callback without state or code with invalid_state error redirect', async () => {
      const res = await request(app).get('/api/v1/auth/google/callback');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=invalid_state');
    });

    it('rejects GitHub callback with mismatched state cookie with invalid_state error redirect', async () => {
      const res = await request(app)
        .get('/api/v1/auth/github/callback?code=mock_code&state=forged_state')
        .set('Cookie', ['cr_oauth_state=real_state']);
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=invalid_state');
    });

    it('propagates provider error query parameter directly to frontend redirect', async () => {
      const res = await request(app).get('/api/v1/auth/google/callback?error=access_denied');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=access_denied');
    });
  });

  describe('handleFederatedLogin Core Invariants', () => {
    it('links federated identity to existing user matching primary verified email', async () => {
      const mockReq = {};
      let redirectLocation = null;
      let setCookies = [];

      const mockRes = {
        cookie: (name, val, opts) => {
          setCookies.push({ name, val, opts });
        },
        redirect: (loc) => {
          redirectLocation = loc;
        },
      };

      await handleFederatedLogin(mockReq, mockRes, {
        provider: 'GOOGLE',
        providerUserId: 'google-sub-12345',
        email: 'alice.existing@pcu.edu',
        fullName: 'Alice Google',
        avatarUrl: 'https://example.com/alice.jpg',
      });

      expect(redirectLocation).toBeTruthy();
      expect(redirectLocation).not.toContain('error=');
      expect(setCookies.some((c) => c.name === 'cr_auth_token')).toBe(true);

      const link = await FederatedIdentity.findOne({
        provider: 'GOOGLE',
        providerUserId: 'google-sub-12345',
      });
      expect(link).toBeTruthy();
      expect(link.userId.toString()).toBe(existingUser._id.toString());
      expect(link.email).toBe('alice.existing@pcu.edu');
    });

    it('authenticates existing linked federated identity directly', async () => {
      const mockReq = {};
      let redirectLocation = null;
      let setCookies = [];

      const mockRes = {
        cookie: (name, val, opts) => {
          setCookies.push({ name, val, opts });
        },
        redirect: (loc) => {
          redirectLocation = loc;
        },
      };

      await handleFederatedLogin(mockReq, mockRes, {
        provider: 'GOOGLE',
        providerUserId: 'google-sub-12345',
        email: 'alice.existing@pcu.edu',
      });

      expect(redirectLocation).toBeTruthy();
      expect(redirectLocation).not.toContain('error=');
      expect(setCookies.some((c) => c.name === 'cr_auth_token')).toBe(true);
    });

    it('registers new user with strictly STUDENT role and matches campus domain', async () => {
      const mockReq = {};
      let redirectLocation = null;
      let setCookies = [];

      const mockRes = {
        cookie: (name, val, opts) => {
          setCookies.push({ name, val, opts });
        },
        redirect: (loc) => {
          redirectLocation = loc;
        },
      };

      await handleFederatedLogin(mockReq, mockRes, {
        provider: 'GITHUB',
        providerUserId: 'github-id-998877',
        email: 'bob.newstudent@pcu.edu',
        fullName: 'Bob Builder',
        avatarUrl: 'https://avatars.githubusercontent.com/u/998877',
      });

      expect(redirectLocation).toContain('/my-work');
      expect(setCookies.some((c) => c.name === 'cr_auth_token')).toBe(true);

      const createdUser = await User.findOne({ email: 'bob.newstudent@pcu.edu' });
      expect(createdUser).toBeTruthy();
      expect(createdUser.fullName).toBe('Bob Builder');
      expect(createdUser.campusId.toString()).toBe(pcuCampus._id.toString());
      expect(createdUser.campusRole).toBe('STUDENT'); // STRICT SECURITY CHECK
      expect(createdUser.passwordHash).toBeNull(); // No password required for OAuth user

      const federatedLink = await FederatedIdentity.findOne({
        provider: 'GITHUB',
        providerUserId: 'github-id-998877',
      });
      expect(federatedLink).toBeTruthy();
      expect(federatedLink.userId.toString()).toBe(createdUser._id.toString());
    });

    it('rejects registration if campus self-registration is disabled', async () => {
      const mockReq = {};
      let redirectLocation = null;
      const mockRes = {
        cookie: () => {},
        redirect: (loc) => {
          redirectLocation = loc;
        },
      };

      await handleFederatedLogin(mockReq, mockRes, {
        provider: 'GOOGLE',
        providerUserId: 'google-sub-closed-1',
        email: 'student@closed.edu',
        fullName: 'Closed Campus Student',
      });

      expect(redirectLocation).toContain('error=registration_disabled');
    });

    it('rejects login for deactivated users with account_deactivated error', async () => {
      await User.create({
        campusId: pcuCampus._id,
        fullName: 'Deactivated Dan',
        email: 'dan.deactivated@pcu.edu',
        campusRole: 'STUDENT',
        isActive: false,
      });

      const mockReq = {};
      let redirectLocation = null;
      const mockRes = {
        cookie: () => {},
        redirect: (loc) => {
          redirectLocation = loc;
        },
      };

      await handleFederatedLogin(mockReq, mockRes, {
        provider: 'GOOGLE',
        providerUserId: 'google-sub-dan-deactivated',
        email: 'dan.deactivated@pcu.edu',
      });

      expect(redirectLocation).toContain('error=account_deactivated');
    });

    it('enforces compound index uniqueness on FederatedIdentity', async () => {
      await expect(
        FederatedIdentity.create({
          userId: existingUser._id,
          provider: 'GOOGLE',
          providerUserId: 'google-sub-12345', // duplicate
          email: 'duplicate@pcu.edu',
        })
      ).rejects.toThrow();
    });
  });
});
