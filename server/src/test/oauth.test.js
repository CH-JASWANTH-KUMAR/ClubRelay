import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { User, Campus, FederatedIdentity, Membership, Club } from '../models/index.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { handleFederatedLogin } from '../controllers/authController.js';
import { env } from '../config/env.js';

describe('OAuth & Social Authentication Suite', () => {
  let pcuCampus;
  let existingUser;
  let facultyUser;
  let adminUser;
  let originalEnvGoogleClientId;
  let originalEnvGoogleClientSecret;
  let originalEnvGitHubClientId;
  let originalEnvGitHubClientSecret;
  let originalFetch;

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

    facultyUser = await User.create({
      campusId: pcuCampus._id,
      fullName: 'Prof. Marcus Vance',
      email: 'marcus.vance@pcu.edu',
      passwordHash: await User.hashPassword('Password123!'),
      campusRole: 'FACULTY_COORDINATOR',
      isActive: true,
    });

    adminUser = await User.create({
      campusId: pcuCampus._id,
      fullName: 'Dean Admin',
      email: 'dean.admin@pcu.edu',
      passwordHash: await User.hashPassword('Password123!'),
      campusRole: 'CAMPUS_ADMIN',
      isActive: true,
    });

    // Save original env values
    originalEnvGoogleClientId = env.GOOGLE_CLIENT_ID;
    originalEnvGoogleClientSecret = env.GOOGLE_CLIENT_SECRET;
    originalEnvGitHubClientId = env.GITHUB_CLIENT_ID;
    originalEnvGitHubClientSecret = env.GITHUB_CLIENT_SECRET;
    originalFetch = global.fetch;
  });

  afterAll(async () => {
    env.GOOGLE_CLIENT_ID = originalEnvGoogleClientId;
    env.GOOGLE_CLIENT_SECRET = originalEnvGoogleClientSecret;
    env.GITHUB_CLIENT_ID = originalEnvGitHubClientId;
    env.GITHUB_CLIENT_SECRET = originalEnvGitHubClientSecret;
    global.fetch = originalFetch;

    await FederatedIdentity.deleteMany({});
    await Membership.deleteMany({});
    await Club.deleteMany({});
    await User.deleteMany({});
    await Campus.deleteMany({});
    await disconnectDB();
  });

  beforeEach(() => {
    // Configure mock OAuth env vars for controller callback testing
    env.GOOGLE_CLIENT_ID = 'mock-google-client-id';
    env.GOOGLE_CLIENT_SECRET = 'mock-google-client-secret';
    env.GITHUB_CLIENT_ID = 'mock-github-client-id';
    env.GITHUB_CLIENT_SECRET = 'mock-github-client-secret';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
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
      env.GOOGLE_CLIENT_ID = '';
      env.GOOGLE_CLIENT_SECRET = '';
      const res = await request(app).get('/api/v1/auth/google');
      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('OAUTH_NOT_CONFIGURED');
    });

    it('returns 503 if GitHub OAuth is unconfigured', async () => {
      env.GITHUB_CLIENT_ID = '';
      env.GITHUB_CLIENT_SECRET = '';
      const res = await request(app).get('/api/v1/auth/github');
      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('OAUTH_NOT_CONFIGURED');
    });

    it('sets cr_oauth_state_google cookie and redirects when Google is configured', async () => {
      const res = await request(app).get('/api/v1/auth/google');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('accounts.google.com/o/oauth2/v2/auth');
      const cookies = res.headers['set-cookie'] || [];
      expect(cookies.some((c) => c.startsWith('cr_oauth_state_google='))).toBe(true);
    });

    it('sets cr_oauth_state_github cookie and redirects when GitHub is configured', async () => {
      const res = await request(app).get('/api/v1/auth/github');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('github.com/login/oauth/authorize');
      const cookies = res.headers['set-cookie'] || [];
      expect(cookies.some((c) => c.startsWith('cr_oauth_state_github='))).toBe(true);
    });
  });

  describe('Google Callback Workflow (GET /api/v1/auth/google/callback)', () => {
    it('propagates provider error query parameter directly to frontend redirect', async () => {
      const res = await request(app).get('/api/v1/auth/google/callback?error=access_denied');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=access_denied');
    });

    it('rejects Google callback without state or code with invalid_state error redirect', async () => {
      const res = await request(app).get('/api/v1/auth/google/callback');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=invalid_state');
    });

    it('rejects Google callback with mismatched state cookie with invalid_state error redirect', async () => {
      const res = await request(app)
        .get('/api/v1/auth/google/callback?code=mock_code&state=forged_state')
        .set('Cookie', ['cr_oauth_state_google=real_state']);
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=invalid_state');
    });

    it('rejects when token exchange fails', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        text: async () => 'Internal token error',
      });

      const res = await request(app)
        .get('/api/v1/auth/google/callback?code=valid_code&state=valid_state')
        .set('Cookie', ['cr_oauth_state_google=valid_state']);

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=token_exchange_failed');
    });

    it('rejects when userinfo fetch fails', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          text: async () => 'Userinfo failure',
        });

      const res = await request(app)
        .get('/api/v1/auth/google/callback?code=valid_code&state=valid_state')
        .set('Cookie', ['cr_oauth_state_google=valid_state']);

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=userinfo_failed');
    });

    it('rejects when Google userinfo is missing sub identifier', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ email: 'test@pcu.edu', email_verified: true }),
        });

      const res = await request(app)
        .get('/api/v1/auth/google/callback?code=valid_code&state=valid_state')
        .set('Cookie', ['cr_oauth_state_google=valid_state']);

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=userinfo_failed');
    });

    it('rejects when Google email is unverified', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ sub: 'google-sub-unverified', email: 'unverified@pcu.edu', email_verified: false }),
        });

      const res = await request(app)
        .get('/api/v1/auth/google/callback?code=valid_code&state=valid_state')
        .set('Cookie', ['cr_oauth_state_google=valid_state']);

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=unverified_email');
    });

    it('successfully completes Google OAuth login for verified account', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            sub: 'google-sub-verified-1',
            email: 'alice.existing@pcu.edu',
            email_verified: true,
            name: 'Alice Google',
            picture: 'https://example.com/alice.jpg',
          }),
        });

      const res = await request(app)
        .get('/api/v1/auth/google/callback?code=valid_code&state=valid_state')
        .set('Cookie', ['cr_oauth_state_google=valid_state']);

      expect(res.status).toBe(302);
      expect(res.headers.location).not.toContain('error=');
      const cookies = res.headers['set-cookie'] || [];
      expect(cookies.some((c) => c.startsWith('cr_auth_token='))).toBe(true);
    });
  });

  describe('GitHub Callback Workflow (GET /api/v1/auth/github/callback)', () => {
    it('propagates provider error query parameter directly to frontend redirect', async () => {
      const res = await request(app).get('/api/v1/auth/github/callback?error=access_denied');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=access_denied');
    });

    it('rejects GitHub callback without state or code with invalid_state error redirect', async () => {
      const res = await request(app).get('/api/v1/auth/github/callback');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=invalid_state');
    });

    it('rejects GitHub callback with mismatched state cookie with invalid_state error redirect', async () => {
      const res = await request(app)
        .get('/api/v1/auth/github/callback?code=mock_code&state=forged_state')
        .set('Cookie', ['cr_oauth_state_github=real_state']);
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=invalid_state');
    });

    it('rejects when token exchange fails with non-ok status', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        text: async () => 'Token endpoint down',
      });

      const res = await request(app)
        .get('/api/v1/auth/github/callback?code=valid_code&state=valid_state')
        .set('Cookie', ['cr_oauth_state_github=valid_state']);

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=token_exchange_failed');
    });

    it('rejects when token response contains error property', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 'bad_verification_code', error_description: 'Code is expired' }),
      });

      const res = await request(app)
        .get('/api/v1/auth/github/callback?code=expired_code&state=valid_state')
        .set('Cookie', ['cr_oauth_state_github=valid_state']);

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=bad_verification_code');
    });

    it('rejects when /user profile fetch fails', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_gh_token' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          text: async () => 'User profile failed',
        });

      const res = await request(app)
        .get('/api/v1/auth/github/callback?code=valid_code&state=valid_state')
        .set('Cookie', ['cr_oauth_state_github=valid_state']);

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=userinfo_failed');
    });

    it('rejects when /user profile is missing id', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_gh_token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'octocat' }), // missing id
        });

      const res = await request(app)
        .get('/api/v1/auth/github/callback?code=valid_code&state=valid_state')
        .set('Cookie', ['cr_oauth_state_github=valid_state']);

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=userinfo_failed');
    });

    it('rejects when /user/emails endpoint fails with non-ok status', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_gh_token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 123456, login: 'octocat', email: 'profile@pcu.edu' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 403,
          text: async () => 'Scope read:user insufficient',
        });

      const res = await request(app)
        .get('/api/v1/auth/github/callback?code=valid_code&state=valid_state')
        .set('Cookie', ['cr_oauth_state_github=valid_state']);

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=unverified_email');
    });

    it('STRICT INVARIANT: rejects when public profile email exists but /user/emails has NO verified email', async () => {
      // Security test: public profile email gitHubUser.email must NEVER be used as a fallback
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_gh_token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 123456,
            login: 'octocat',
            email: 'spoofed_profile_email@pcu.edu', // Public profile email present
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { email: 'unverified1@pcu.edu', primary: true, verified: false },
            { email: 'unverified2@pcu.edu', primary: false, verified: false },
          ],
        });

      const res = await request(app)
        .get('/api/v1/auth/github/callback?code=valid_code&state=valid_state')
        .set('Cookie', ['cr_oauth_state_github=valid_state']);

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('error=unverified_email');
    });

    it('accepts secondary verified email when primary email is unverified', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_gh_token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 789101,
            login: 'studentdev',
            name: 'Student Dev',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { email: 'primary_unverified@gmail.com', primary: true, verified: false },
            { email: 'alice.existing@pcu.edu', primary: false, verified: true }, // Secondary verified matches existing user
          ],
        });

      const res = await request(app)
        .get('/api/v1/auth/github/callback?code=valid_code&state=valid_state')
        .set('Cookie', ['cr_oauth_state_github=valid_state']);

      expect(res.status).toBe(302);
      expect(res.headers.location).not.toContain('error=');
      const cookies = res.headers['set-cookie'] || [];
      expect(cookies.some((c) => c.startsWith('cr_auth_token='))).toBe(true);

      const link = await FederatedIdentity.findOne({
        provider: 'GITHUB',
        providerUserId: '789101',
      });
      expect(link).toBeTruthy();
      expect(link.email).toBe('alice.existing@pcu.edu');
    });

    it('accepts primary verified email and successfully completes GitHub login', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'mock_gh_token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 887766,
            login: 'verifiedstudent',
            name: 'Verified Student',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { email: 'alice.existing@pcu.edu', primary: true, verified: true },
          ],
        });

      const res = await request(app)
        .get('/api/v1/auth/github/callback?code=valid_code&state=valid_state')
        .set('Cookie', ['cr_oauth_state_github=valid_state']);

      expect(res.status).toBe(302);
      expect(res.headers.location).not.toContain('error=');
      const cookies = res.headers['set-cookie'] || [];
      expect(cookies.some((c) => c.startsWith('cr_auth_token='))).toBe(true);
    });
  });

  describe('Multi-Tenant Campus Resolution & Account Linking Invariants', () => {
    it('rejects with ambiguous_campus when multiple campuses share the email domain', async () => {
      // Create duplicate domain campus
      const duplicateCampus = await Campus.create({
        name: 'Pacific Coast University Satellite',
        slug: 'pcu-satellite',
        domain: 'pcu.edu', // duplicate domain
        settings: { allowSelfRegistration: true },
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
        providerUserId: 'google-sub-ambiguous-campus',
        email: 'student@pcu.edu',
        fullName: 'Student Ambiguous',
      });

      expect(redirectLocation).toContain('error=ambiguous_campus');

      await Campus.deleteOne({ _id: duplicateCampus._id });
    });

    it('rejects with no_campus_found when domain does not match any campus (ZERO arbitrary fallback)', async () => {
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
        providerUserId: 'google-sub-unknown-domain',
        email: 'outsider@unknown-university.edu',
        fullName: 'Outsider Person',
      });

      expect(redirectLocation).toContain('error=no_campus_found');

      // Verify no user was created under pcuCampus or closedCampus
      const outsider = await User.findOne({ email: 'outsider@unknown-university.edu' });
      expect(outsider).toBeNull();
    });

    it('rejects with ambiguous_account when candidate accounts exist across multiple campuses', async () => {
      // Create second campus
      const otherCampus = await Campus.create({
        name: 'Other State University',
        slug: 'osu-oauth',
        domain: 'osu.edu',
        settings: { allowSelfRegistration: true },
      });

      // Create a user in otherCampus with the same email as an existing user in pcuCampus
      const conflictingEmail = 'shared.conflict@pcu.edu';
      const userA = await User.create({
        campusId: pcuCampus._id,
        fullName: 'Conflict A',
        email: conflictingEmail,
        campusRole: 'STUDENT',
        isActive: true,
      });

      const userB = await User.create({
        campusId: otherCampus._id,
        fullName: 'Conflict B',
        email: conflictingEmail,
        campusRole: 'STUDENT',
        isActive: true,
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
        providerUserId: 'google-sub-conflict-account',
        email: conflictingEmail,
        fullName: 'Conflict User',
      });

      expect(redirectLocation).toContain('error=ambiguous_account');

      await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
      await Campus.deleteOne({ _id: otherCampus._id });
    });

    it('preserves FACULTY_COORDINATOR role and routes to /faculty/approvals without alteration', async () => {
      const mockReq = {};
      let redirectLocation = null;
      const setCookies = [];
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
        providerUserId: 'google-sub-faculty-marcus',
        email: 'marcus.vance@pcu.edu',
        fullName: 'Marcus Vance',
      });

      expect(redirectLocation).toContain('/faculty/approvals');
      expect(setCookies.some((c) => c.name === 'cr_auth_token')).toBe(true);

      const user = await User.findById(facultyUser._id);
      expect(user.campusRole).toBe('FACULTY_COORDINATOR'); // Role must NOT be demoted or changed
    });

    it('preserves CAMPUS_ADMIN role and routes to /campus without alteration', async () => {
      const mockReq = {};
      let redirectLocation = null;
      const setCookies = [];
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
        providerUserId: 'google-sub-admin-dean',
        email: 'dean.admin@pcu.edu',
        fullName: 'Dean Admin',
      });

      expect(redirectLocation).toContain('/campus');
      expect(setCookies.some((c) => c.name === 'cr_auth_token')).toBe(true);

      const user = await User.findById(adminUser._id);
      expect(user.campusRole).toBe('CAMPUS_ADMIN'); // Role must NOT be changed
    });

    it('registers new student user with strictly STUDENT role and matches campus domain', async () => {
      const mockReq = {};
      let redirectLocation = null;
      const setCookies = [];

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
        providerUserId: 'github-id-charlie-student',
        email: 'charlie.freshman@pcu.edu',
        fullName: 'Charlie Freshman',
        avatarUrl: 'https://avatars.githubusercontent.com/u/888',
      });

      expect(redirectLocation).toContain('/my-work');
      expect(setCookies.some((c) => c.name === 'cr_auth_token')).toBe(true);

      const createdUser = await User.findOne({ email: 'charlie.freshman@pcu.edu' });
      expect(createdUser).toBeTruthy();
      expect(createdUser.campusId.toString()).toBe(pcuCampus._id.toString());
      expect(createdUser.campusRole).toBe('STUDENT'); // STRICT SECURITY CHECK
      expect(createdUser.passwordHash).toBeNull();

      const federatedLink = await FederatedIdentity.findOne({
        provider: 'GITHUB',
        providerUserId: 'github-id-charlie-student',
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
        providerUserId: 'google-sub-closed-student',
        email: 'student@closed.edu',
        fullName: 'Closed Campus Student',
      });

      expect(redirectLocation).toContain('error=registration_disabled');
    });

    it('rejects login for deactivated users with account_deactivated error', async () => {
      const deactivatedUser = await User.create({
        campusId: pcuCampus._id,
        fullName: 'Deactivated User',
        email: 'deactivated@pcu.edu',
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
        providerUserId: 'google-sub-deactivated',
        email: 'deactivated@pcu.edu',
      });

      expect(redirectLocation).toContain('error=account_deactivated');

      await User.deleteOne({ _id: deactivatedUser._id });
    });

    it('enforces compound index uniqueness on FederatedIdentity', async () => {
      await expect(
        FederatedIdentity.create({
          userId: existingUser._id,
          provider: 'GOOGLE',
          providerUserId: 'google-sub-verified-1', // duplicate provider & providerUserId
          email: 'duplicate@pcu.edu',
        })
      ).rejects.toThrow();
    });
  });
});
