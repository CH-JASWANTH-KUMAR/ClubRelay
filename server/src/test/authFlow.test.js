import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { AuditLog, Campus, User } from '../models/index.js';
import { getCandidateDomains } from '../utils/campusDomain.js';

describe('Authentication Flow & Registration Hardening (Memory Server)', () => {
  let primaryCampus;
  let secondaryCampus;
  let sharedCampusA;
  let sharedCampusB;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await AuditLog.deleteMany({});
    await User.deleteMany({});
    await Campus.deleteMany({});

    primaryCampus = await Campus.create({
      name: 'State University',
      slug: 'state-univ',
      domain: 'state.edu',
      settings: { allowSelfRegistration: true },
    });

    secondaryCampus = await Campus.create({
      name: 'Tech Institute',
      slug: 'tech-inst',
      domain: 'tech.edu',
      settings: { allowSelfRegistration: true },
    });

    await Campus.create({
      name: 'Private Academy',
      slug: 'private-acad',
      domain: 'private.edu',
      settings: { allowSelfRegistration: false },
    });

    sharedCampusA = await Campus.create({
      name: 'Metro Main',
      slug: 'metro-main',
      domain: 'metro.edu',
      settings: { allowSelfRegistration: true },
    });

    sharedCampusB = await Campus.create({
      name: 'Metro North',
      slug: 'metro-north',
      domain: 'metro.edu',
      settings: { allowSelfRegistration: true },
    });
  });

  describe('Health Check & Database Readiness', () => {
    it('GET /api/v1/health returns HTTP 200 and { ok: true, db: "up" }', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true, db: 'up' });
    });
  });

  describe('GET /api/v1/campuses/resolve', () => {
    it('returns only { id, name } when exactly one campus matches the domain', async () => {
      const res = await request(app).get('/api/v1/campuses/resolve?domain=State.EDU');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.campus).toEqual({
        id: primaryCampus._id.toString(),
        name: 'State University',
      });
      expect(Object.keys(res.body.data.campus)).toEqual(['id', 'name']);
    });

    it('resolves institutional subdomain emails to the parent campus domain', async () => {
      const res = await request(app).get('/api/v1/campuses/resolve?domain=student.state.edu');
      expect(res.status).toBe(200);
      expect(res.body.data.campus).toEqual({
        id: primaryCampus._id.toString(),
        name: 'State University',
      });
    });

    it('rejects lookalike non-subdomain domains such as evil-state.edu', async () => {
      const res = await request(app).get('/api/v1/campuses/resolve?domain=evil-state.edu');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('CAMPUS_NOT_FOUND');
    });

    it('does not generate generic two-label public suffix candidates (e.g. ac.in, co.uk)', () => {
      expect(getCandidateDomains('student.iitb.ac.in')).toEqual(['student.iitb.ac.in', 'iitb.ac.in']);
      expect(getCandidateDomains('student.gitam.edu')).toEqual(['student.gitam.edu', 'gitam.edu']);
    });

    it('returns generic 404 when no campus matches the domain', async () => {
      const res = await request(app).get('/api/v1/campuses/resolve?domain=unknown.edu');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CAMPUS_NOT_FOUND');
    });

    it('returns generic 404 when multiple campuses share the domain (ambiguous)', async () => {
      const res = await request(app).get('/api/v1/campuses/resolve?domain=metro.edu');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CAMPUS_NOT_FOUND');
    });

    it('returns 400 when domain query parameter is missing', async () => {
      const res = await request(app).get('/api/v1/campuses/resolve');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_DOMAIN');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('registers a student without setting an auth cookie or returning a token/user object, hashes password, and writes an audit log', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: '  Alex Rivera  ',
          email: '  Alex.Rivera@State.EDU  ',
          password: 'StrongPassword123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Account created. Sign in to continue.');
      expect(res.body.data.registered).toBe(true);
      expect(res.body.data.campus).toEqual({
        id: primaryCampus._id.toString(),
        name: 'State University',
      });
      expect(res.body.data.token).toBeUndefined();
      expect(res.body.data.user).toBeUndefined();

      // Must NOT set authentication cookie on registration
      const cookies = res.headers['set-cookie'] || [];
      expect(cookies.some((c) => c.startsWith('cr_auth_token='))).toBe(false);

      // Verify persisted user in DB
      const savedUser = await User.findOne({ email: 'alex.rivera@state.edu' });
      expect(savedUser).toBeTruthy();
      expect(savedUser.fullName).toBe('Alex Rivera');
      expect(savedUser.campusId.toString()).toBe(primaryCampus._id.toString());
      expect(savedUser.campusRole).toBe('STUDENT');
      expect(savedUser.passwordHash).toBeTruthy();
      expect(savedUser.passwordHash).not.toBe('StrongPassword123!');
      expect(await savedUser.comparePassword('StrongPassword123!')).toBe(true);

      // Verify AuditLog entry (no email or password in metadata)
      const audit = await AuditLog.findOne({ actorId: savedUser._id, action: 'USER_REGISTERED' });
      expect(audit).toBeTruthy();
      expect(audit.campusId.toString()).toBe(primaryCampus._id.toString());
      expect(audit.targetType).toBe('User');
      expect(audit.targetId.toString()).toBe(savedUser._id.toString());
      expect(JSON.stringify(audit.metadata)).not.toContain('alex.rivera@state.edu');
      expect(JSON.stringify(audit.metadata)).not.toContain('StrongPassword123!');
    });

    it('prevents role injection and forces STUDENT role', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Privilege Escalator',
          email: 'escalator@state.edu',
          password: 'ValidPassword123!',
          campusRole: 'CAMPUS_ADMIN',
          role: 'CAMPUS_ADMIN',
        });

      expect(res.status).toBe(201);
      const savedUser = await User.findOne({ email: 'escalator@state.edu' });
      expect(savedUser.campusRole).toBe('STUDENT');
    });

    it('ignores mismatched client campusId and resolves campus from email domain', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          campusId: secondaryCampus._id.toString(),
          fullName: 'Domain Resolver',
          email: 'resolver@state.edu',
          password: 'ValidPassword123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.campus.id).toBe(primaryCampus._id.toString());

      const savedUser = await User.findOne({ email: 'resolver@state.edu' });
      expect(savedUser.campusId.toString()).toBe(primaryCampus._id.toString());
    });

    it('enforces minimum 8-character password rule', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Short Pass',
          email: 'short@state.edu',
          password: '1234567',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects invalid email format with 400', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Bad Email',
          email: 'not-an-email',
          password: 'ValidPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects unsupported campus email domain with 400 INVALID_CAMPUS_DOMAIN', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'External User',
          email: 'person@gmail.com',
          password: 'ValidPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_CAMPUS_DOMAIN');
    });

    it('rejects registration when campus disables self-registration', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Closed User',
          email: 'student@private.edu',
          password: 'ValidPassword123!',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('REGISTRATION_DISABLED');
    });

    it('rejects duplicate email registration on same campus with 409 USER_EXISTS', async () => {
      await request(app).post('/api/v1/auth/register').send({
        fullName: 'First User',
        email: 'dup@state.edu',
        password: 'ValidPassword123!',
      });

      const dupRes = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Second User',
        email: 'DUP@state.edu',
        password: 'AnotherPassword123!',
      });

      expect(dupRes.status).toBe(409);
      expect(dupRes.body.error.code).toBe('USER_EXISTS');
    });

    it('handles shared-domain campuses safely when campusId matches or is ambiguous', async () => {
      // Without campusId -> ambiguous
      const ambigRes = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Metro Student',
        email: 'student@metro.edu',
        password: 'ValidPassword123!',
      });
      expect(ambigRes.status).toBe(400);
      expect(ambigRes.body.error.code).toBe('AMBIGUOUS_CAMPUS');

      // With valid matching campusId -> succeeds
      const okRes = await request(app).post('/api/v1/auth/register').send({
        campusId: sharedCampusB._id.toString(),
        fullName: 'Metro North Student',
        email: 'student@metro.edu',
        password: 'ValidPassword123!',
      });
      expect(okRes.status).toBe(201);
      expect(okRes.body.data.campus.id).toBe(sharedCampusB._id.toString());
      expect(sharedCampusA._id).toBeDefined();
    });
  });

  describe('Full Sign Up -> Sign In -> /auth/me -> Tenant Isolation -> Signout Lifecycle', () => {
    it('completes end-to-end register, signin, /auth/me, cross-tenant rejection, and logout', async () => {
      // 1. Sign up
      const signupRes = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Maya Patel',
        email: 'maya.patel@state.edu',
        password: 'MayaPassword123!',
      });
      expect(signupRes.status).toBe(201);

      // 2. Unauthenticated /me returns 401
      const unauthMe = await request(app).get('/api/v1/auth/me');
      expect(unauthMe.status).toBe(401);

      // 3. Wrong password returns 401
      const badLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'maya.patel@state.edu',
        password: 'WrongPassword123!',
      });
      expect(badLogin.status).toBe(401);

      // 4. Nonexistent user returns 401
      const ghostLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'nobody@state.edu',
        password: 'MayaPassword123!',
      });
      expect(ghostLogin.status).toBe(401);

      // 5. Valid signin issues HttpOnly cookie and omits passwordHash
      const loginRes = await request(app).post('/api/v1/auth/login').send({
        email: 'maya.patel@state.edu',
        password: 'MayaPassword123!',
      });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.user.passwordHash).toBeUndefined();
      expect(loginRes.body.data.user.email).toBe('maya.patel@state.edu');

      const cookies = loginRes.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const authCookie = cookies.find((c) => c.startsWith('cr_auth_token='));
      expect(authCookie).toBeDefined();
      expect(authCookie).toContain('HttpOnly');
      expect(authCookie).toContain('SameSite=Lax');
      expect(authCookie).not.toContain('Secure'); // local dev/test over HTTP

      // 6. Authenticated /auth/me returns user profile
      const meRes = await request(app).get('/api/v1/auth/me').set('Cookie', authCookie);
      expect(meRes.status).toBe(200);
      expect(meRes.body.data.user.email).toBe('maya.patel@state.edu');
      expect(meRes.body.data.user.passwordHash).toBeUndefined();

      // 7. Tenant isolation: State University student cannot query Tech Institute stats
      const crossTenantRes = await request(app)
        .get(`/api/v1/campuses/${secondaryCampus._id}/stats`)
        .set('Cookie', authCookie);
      expect(crossTenantRes.status).toBe(403);
      expect(crossTenantRes.body.error.code).toBe('TENANT_MISMATCH');

      // 8. Signout clears cookie
      const logoutRes = await request(app).post('/api/v1/auth/logout').set('Cookie', authCookie);
      expect(logoutRes.status).toBe(200);
      const clearedCookie = (logoutRes.headers['set-cookie'] || []).find((c) =>
        c.startsWith('cr_auth_token=;')
      );
      expect(clearedCookie).toBeDefined();
    });

    it('supports full signup, login, and /auth/me using an institutional subdomain email (e.g. student.state.edu)', async () => {
      const signupRes = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Subdomain Student',
        email: 'sub.student@student.state.edu',
        password: 'StudentPassword123!',
      });
      expect(signupRes.status).toBe(201);
      expect(signupRes.body.data.campus).toEqual({
        id: primaryCampus._id.toString(),
        name: 'State University',
      });

      const loginRes = await request(app).post('/api/v1/auth/login').send({
        email: 'sub.student@student.state.edu',
        password: 'StudentPassword123!',
      });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.user.email).toBe('sub.student@student.state.edu');
      expect(loginRes.body.data.user.campusId._id.toString()).toBe(primaryCampus._id.toString());
    });
  });
});

