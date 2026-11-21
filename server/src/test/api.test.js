import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { spawnSync } from 'child_process';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { runSeed } from '../scripts/seed.js';
import {
  User,
  Club,
  Event,
  Handover,
  Membership,
  Campus,
  AcademicTerm,
  KnowledgeItem,
  AuditLog,
} from '../models/index.js';

describe('ClubRelay Production Engineering Hardening Test Suite', () => {
  let sarahCookie = '';
  let alexCookie = '';
  let facultyChenCookie = '';
  let campusAdminCookie = '';
  let generalMemberCookie = '';
  let ieeePresidentCookie = '';
  let unassignedFacultySharmaCookie = '';

  let pcuCampusId = '';
  let mtiCampusId = '';
  let gdgClubId = '';
  let ieeeClubId = '';
  let mtiAwsClubId = '';

  beforeAll(async () => {
    await connectDB();
    await runSeed();

    // Cache campus and club IDs for multi-tenant isolation testing
    const pcu = await Campus.findOne({ slug: 'pcu' });
    const mti = await Campus.findOne({ slug: 'mti' });
    pcuCampusId = pcu._id.toString();
    mtiCampusId = mti._id.toString();

    const gdg = await Club.findOne({ code: 'GDG' });
    const ieee = await Club.findOne({ code: 'IEEE' });
    const aws = await Club.findOne({ code: 'AWSCC' });
    gdgClubId = gdg._id.toString();
    ieeeClubId = ieee._id.toString();
    mtiAwsClubId = aws._id.toString();

    // Authenticate test personas and capture HttpOnly cookies
    const loginPersona = async (email, password = 'Password123!') => {
      const res = await request(app).post('/api/v1/auth/login').send({ email, password });
      const cookie = res.headers['set-cookie']?.find((c) => c.startsWith('cr_auth_token='));
      const token = cookie ? cookie.match(/cr_auth_token=([^;]+)/)?.[1] : null;
      return { res, cookie, token };
    };

    const sarahAuth = await loginPersona('sarah.gdg@pcu.edu');
    sarahCookie = sarahAuth.cookie;

    const alexAuth = await loginPersona('alex.incoming@pcu.edu');
    alexCookie = alexAuth.cookie;

    const facultyAuth = await loginPersona('advisor.chen@pcu.edu');
    facultyChenCookie = facultyAuth.cookie;

    const adminAuth = await loginPersona('admin@pcu.edu');
    campusAdminCookie = adminAuth.cookie;

    const generalAuth = await loginPersona('sam.member@pcu.edu');
    generalMemberCookie = generalAuth.cookie;

    const ieeeAuth = await loginPersona('raj.ieee@pcu.edu');
    ieeePresidentCookie = ieeeAuth.cookie;

    const sharmaAuth = await loginPersona('advisor.sharma@pcu.edu');
    unassignedFacultySharmaCookie = sharmaAuth.cookie;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  // ==========================================
  // Priority 1: Authentication & Security
  // ==========================================
  describe('Priority 1: Authentication & Security Hardening', () => {
    it('returns 200 OK from health check with environment status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('ClubRelay API');
    });

    it('authenticates user and returns NO raw JWT token in JSON response body', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'sarah.gdg@pcu.edu', password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('sarah.gdg@pcu.edu');
      // Hardening Guarantee: Token removed from response payload
      expect(res.body.data.token).toBeUndefined();

      // Verified: Transported strictly via HttpOnly cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const authCookie = cookies.find((c) => c.startsWith('cr_auth_token='));
      expect(authCookie).toBeDefined();
      expect(authCookie).toContain('HttpOnly');
    });

    it('rejects authentication with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'sarah.gdg@pcu.edu', password: 'WrongPassword999!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('retrieves user profile via /api/v1/auth/me using HttpOnly cookie', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', sarahCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.fullName).toContain('Sarah');
    });

    it('rejects access to protected endpoints without authentication token/cookie', async () => {
      const res = await request(app).get('/api/v1/clubs');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects access when authentication token is malformed', async () => {
      const res = await request(app)
        .get('/api/v1/clubs')
        .set('Authorization', 'Bearer invalid_signature_token_xyz');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });

    it('clears authentication cookie on logout', async () => {
      const res = await request(app).post('/api/v1/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const cookies = res.headers['set-cookie'];
      const clearedCookie = cookies.find((c) => c.startsWith('cr_auth_token=;'));
      expect(clearedCookie).toBeDefined();
    });

    it('enforces campus domain restrictions during registration', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          campusId: pcuCampusId,
          fullName: 'Intruder User',
          email: 'intruder@gmail.com', // Not @pcu.edu
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_CAMPUS_DOMAIN');
    });
  });

  // ==========================================
  // Priority 2: RBAC & Tenant Isolation
  // ==========================================
  describe('Priority 2: RBAC & Tenant Isolation', () => {
    it('prevents cross-campus access to workspace metrics (Negative Test)', async () => {
      // Sarah belongs to PCU, tries to query MTI campus metrics
      const res = await request(app)
        .get(`/api/v1/campuses/${mtiCampusId}/stats`)
        .set('Cookie', sarahCookie);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('TENANT_MISMATCH');
    });

    it('prevents cross-club access within the same campus (Negative Test)', async () => {
      // Sarah is President of GDG, but has no active membership in IEEE club
      const res = await request(app)
        .get(`/api/v1/clubs/${ieeeClubId}/events`)
        .set('Cookie', sarahCookie);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('NOT_A_MEMBER');
    });

    it('prohibits General Members from performing executive actions (creating events)', async () => {
      const res = await request(app)
        .post(`/api/v1/clubs/${gdgClubId}/events`)
        .set('Cookie', generalMemberCookie)
        .send({
          title: 'Unauthorized Member Event',
          eventType: 'MEETUP',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 90000000).toISOString(),
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INSUFFICIENT_CLUB_ROLE');
    });

    it('prohibits General Members from recording governance decisions', async () => {
      const res = await request(app)
        .post(`/api/v1/clubs/${gdgClubId}/decisions`)
        .set('Cookie', generalMemberCookie)
        .send({
          title: 'Unauthorized Budget Motion',
          context: 'Test context',
          decisionOutcome: 'APPROVED',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INSUFFICIENT_CLUB_ROLE');
    });

    it('allows Core Team and President to create events', async () => {
      const res = await request(app)
        .post(`/api/v1/clubs/${gdgClubId}/events`)
        .set('Cookie', sarahCookie)
        .send({
          title: 'Automated Test Hackathon 2026',
          description: 'Production verification test event',
          eventType: 'HACKATHON',
          startDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          endDate: new Date(Date.now() + 8 * 86400000).toISOString(),
          venueName: 'Engineering Hall 101',
          estimatedBudget: 3500,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event.status).toBe('DRAFT');
    });

    it('restricts Faculty Coordinator approvals to their assigned organizations only', async () => {
      // Dr. Evelyn Chen is assigned to GDG, but NOT assigned to IEEE
      const term = await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: true });
      const ieeePresident = await User.findOne({ email: 'raj.ieee@pcu.edu' });

      const ieeeEvent = await Event.create({
        campusId: pcuCampusId,
        clubId: ieeeClubId,
        academicTermId: term._id,
        leadOrganizerId: ieeePresident._id,
        title: 'IEEE Robotics Showcase',
        eventType: 'WORKSHOP',
        status: 'PROPOSED',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 90000000),
      });

      // Dr. Chen attempts to review IEEE's proposal -> Must be FORBIDDEN
      const res = await request(app)
        .post(`/api/v1/approvals/events/${ieeeEvent._id}/review`)
        .set('Cookie', facultyChenCookie)
        .send({
          decision: 'APPROVED',
          comments: 'Attempted unauthorized faculty approval.',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN_REVIEWER');
    });

    it('allows Campus Administrator campus-wide approval oversight', async () => {
      const ieeeEvent = await Event.findOne({ title: 'IEEE Robotics Showcase' });

      const res = await request(app)
        .post(`/api/v1/approvals/events/${ieeeEvent._id}/review`)
        .set('Cookie', campusAdminCookie)
        .send({
          decision: 'APPROVED',
          comments: 'Campus Administrator verified proposal.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event.status).toBe('APPROVED');
    });
  });

  // ==========================================
  // Priority 3: Event Workflow Security & State Machine
  // ==========================================
  describe('Priority 3: Event Workflow Security & State Transitions', () => {
    let testEventId = '';

    beforeAll(async () => {
      const event = await Event.findOne({ title: 'Automated Test Hackathon 2026' });
      testEventId = event._id.toString();
    });

    it('submits a DRAFT event into PROPOSED status', async () => {
      const res = await request(app)
        .post(`/api/v1/events/${testEventId}/submit`)
        .set('Cookie', sarahCookie)
        .send({ submissionNotes: 'Ready for faculty review.' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event.status).toBe('PROPOSED');
    });

    it('rejects resubmitting an already PROPOSED event (Invalid State Transition)', async () => {
      const res = await request(app)
        .post(`/api/v1/events/${testEventId}/submit`)
        .set('Cookie', sarahCookie);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_EVENT_STATE');
    });

    it('rejects jumping directly from PROPOSED to PLANNING without faculty approval', async () => {
      const res = await request(app)
        .put(`/api/v1/events/${testEventId}`)
        .set('Cookie', sarahCookie)
        .send({ status: 'PLANNING' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });

    it('rejects jumping directly to COMPLETED without submitting a retrospective', async () => {
      const res = await request(app)
        .put(`/api/v1/events/${testEventId}`)
        .set('Cookie', sarahCookie)
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_COMPLETION_FLOW');
    });

    it('allows designated faculty coordinator to approve the PROPOSED event', async () => {
      const res = await request(app)
        .post(`/api/v1/approvals/events/${testEventId}/review`)
        .set('Cookie', facultyChenCookie)
        .send({
          decision: 'APPROVED',
          comments: 'Logistics and safety plans confirmed. Approved.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.event.status).toBe('APPROVED');
    });

    it('allows board to advance an APPROVED event to PLANNING and IN_PROGRESS', async () => {
      // APPROVED -> PLANNING
      const planningRes = await request(app)
        .put(`/api/v1/events/${testEventId}`)
        .set('Cookie', sarahCookie)
        .send({ status: 'PLANNING' });

      expect(planningRes.status).toBe(200);
      expect(planningRes.body.data.event.status).toBe('PLANNING');

      // PLANNING -> IN_PROGRESS
      const progressRes = await request(app)
        .put(`/api/v1/events/${testEventId}`)
        .set('Cookie', sarahCookie)
        .send({ status: 'IN_PROGRESS' });

      expect(progressRes.status).toBe(200);
      expect(progressRes.body.data.event.status).toBe('IN_PROGRESS');
    });

    it('records retrospective and marks event as COMPLETED', async () => {
      const res = await request(app)
        .post(`/api/v1/events/${testEventId}/retrospective`)
        .set('Cookie', sarahCookie)
        .send({
          actualAttendance: 185,
          actualBudget: 3200,
          summary: 'Exceeded expected participation with 45 projects submitted.',
          whatWentWell: 'Smooth check-in and strong sponsor engagement.',
          whatCouldImprove: 'More power strips needed for the hacking arena.',
          sponsorSatisfaction: 'Very High',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.event.status).toBe('COMPLETED');
      expect(res.body.data.event.actualAttendance).toBe(185);
    });

    it('locks COMPLETED events against scalar detail modification (Immutability)', async () => {
      const res = await request(app)
        .put(`/api/v1/events/${testEventId}`)
        .set('Cookie', sarahCookie)
        .send({ title: 'Tampered Title Attempt' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('EVENT_LOCKED');
    });

    it('rejects arbitrary unknown fields (Zod strict validation)', async () => {
      const term = await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: true });
      const newEvent = await Event.create({
        campusId: pcuCampusId,
        clubId: gdgClubId,
        academicTermId: term._id,
        leadOrganizerId: (await User.findOne({ email: 'sarah.gdg@pcu.edu' }))._id,
        title: 'Draft Event For Schema Test',
        eventType: 'MEETUP',
        status: 'DRAFT',
        startDate: new Date(),
        endDate: new Date(),
      });

      const res = await request(app)
        .put(`/api/v1/events/${newEvent._id}`)
        .set('Cookie', sarahCookie)
        .send({
          $where: 'malicious injection',
          arbitraryField: true,
        });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // Priority 4: Handover Workflow Integrity
  // ==========================================
  describe('Priority 4: Handover Workflow Integrity', () => {
    let testHandoverId = '';

    it('rejects initiating a handover to an incoming user from a different campus or not in club', async () => {
      // Elena from MTI AWSCC attempting to be assigned as GDG President
      const mtiUser = await User.findOne({ email: 'elena.aws@mti.edu' });

      const res = await request(app)
        .post(`/api/v1/clubs/${gdgClubId}/handovers`)
        .set('Cookie', sarahCookie)
        .send({
          incomingLeaderEmail: mtiUser.email,
          roleHandover: 'PRESIDENT',
          fromTermId: (await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: true }))._id.toString(),
          toTermId: (await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: true }))._id.toString(),
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('allows authorized outgoing president to initiate handover for active club member', async () => {
      const term = await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: true });

      const res = await request(app)
        .post(`/api/v1/clubs/${gdgClubId}/handovers`)
        .set('Cookie', sarahCookie)
        .send({
          incomingLeaderEmail: 'alex.incoming@pcu.edu',
          roleHandover: 'PRESIDENT',
          fromTermId: term._id.toString(),
          toTermId: term._id.toString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.handover.status).toBe('DRAFT');
      testHandoverId = res.body.data.handover._id;
    });

    it('prevents incoming officer or unauthorized member from editing outgoing handover sections', async () => {
      // Alex (incoming officer) attempts to edit outgoing section
      const res = await request(app)
        .put(`/api/v1/clubs/${gdgClubId}/handovers/${testHandoverId}/section`)
        .set('Cookie', alexCookie)
        .send({
          sectionName: 'roleResponsibilities',
          content: 'Tampered outgoing responsibilities content.',
          completed: true,
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN_SECTION_EDIT');
    });

    it('allows outgoing president to update sections and enforces valid section names', async () => {
      // Invalid section name test
      const invalidSecRes = await request(app)
        .put(`/api/v1/clubs/${gdgClubId}/handovers/${testHandoverId}/section`)
        .set('Cookie', sarahCookie)
        .send({
          sectionName: 'nonExistentSection',
          content: 'Data',
        });
      expect(invalidSecRes.status).toBe(400);

      // Populate all 8 mandatory sections to reach 100% completion
      const sections = [
        'roleResponsibilities',
        'outstandingTasks',
        'pendingCommitments',
        'futureEventSchedules',
        'importantDocuments',
        'contactsAndPartners',
        'reusablePlaybooks',
        'recommendationsAndAdvice',
      ];

      for (const sectionName of sections) {
        const updateRes = await request(app)
          .put(`/api/v1/clubs/${gdgClubId}/handovers/${testHandoverId}/section`)
          .set('Cookie', sarahCookie)
          .send({
            sectionName,
            content: `Documented details for section ${sectionName}`,
            completed: true,
          });

        expect(updateRes.status).toBe(200);
      }

      // Verify completion reaches 100%
      const getRes = await request(app)
        .get(`/api/v1/clubs/${gdgClubId}/handovers/${testHandoverId}`)
        .set('Cookie', sarahCookie);

      expect(getRes.body.data.handover.completionPercentage).toBe(100);
    });

    it('rejects completion before incoming officer acknowledgment', async () => {
      const res = await request(app)
        .post(`/api/v1/clubs/${gdgClubId}/handovers/${testHandoverId}/complete`)
        .set('Cookie', sarahCookie);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('HANDOVER_NOT_ACKNOWLEDGED');
    });

    it('prevents anyone other than the designated incoming officer from acknowledging (Negative Test)', async () => {
      // Sarah (outgoing officer) tries to self-acknowledge
      const res = await request(app)
        .post(`/api/v1/clubs/${gdgClubId}/handovers/${testHandoverId}/acknowledge`)
        .set('Cookie', sarahCookie)
        .send({ reviewNotes: 'Self acknowledgment attempt' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN_NOT_INCOMING_LEADER');
    });

    it('allows designated incoming officer to formally acknowledge the handover package', async () => {
      const res = await request(app)
        .post(`/api/v1/clubs/${gdgClubId}/handovers/${testHandoverId}/acknowledge`)
        .set('Cookie', alexCookie)
        .send({ reviewNotes: 'Reviewed and confirmed all operational credentials.' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.handover.status).toBe('ACKNOWLEDGED');
    });

    it('executes safe leadership role transfer upon final completion', async () => {
      const res = await request(app)
        .post(`/api/v1/clubs/${gdgClubId}/handovers/${testHandoverId}/complete`)
        .set('Cookie', sarahCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.handover.status).toBe('COMPLETED');

      // Verify Alex is now PRESIDENT of GDG in database
      const alexUser = await User.findOne({ email: 'alex.incoming@pcu.edu' });
      const alexMembership = await Membership.findOne({
        campusId: pcuCampusId,
        clubId: gdgClubId,
        userId: alexUser._id,
      });
      expect(alexMembership.clubRole).toBe('PRESIDENT');

      // Verify Sarah is transitioned to Senior Advisor / CORE_TEAM
      const sarahUser = await User.findOne({ email: 'sarah.gdg@pcu.edu' });
      const sarahMembership = await Membership.findOne({
        campusId: pcuCampusId,
        clubId: gdgClubId,
        userId: sarahUser._id,
      });
      expect(sarahMembership.clubRole).toBe('CORE_TEAM');
    });

    it('rejects duplicate and repeated handover completion (Idempotency Guard)', async () => {
      const res = await request(app)
        .post(`/api/v1/clubs/${gdgClubId}/handovers/${testHandoverId}/complete`)
        .set('Cookie', sarahCookie);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('HANDOVER_ALREADY_COMPLETED');
    });

    it('locks completed handover sections from further modification', async () => {
      const res = await request(app)
        .put(`/api/v1/clubs/${gdgClubId}/handovers/${testHandoverId}/section`)
        .set('Cookie', sarahCookie)
        .send({
          sectionName: 'roleResponsibilities',
          content: 'Attempt to tamper with closed historical handover',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('HANDOVER_LOCKED');
    });
  });

  // ==========================================
  // Priority 5: Security Regressions & ACID Handover Integrity
  // ==========================================
  describe('Priority 5: Cross-Club Read Authorization & Handover Transaction Integrity', () => {
    let gdgKnowledgeId = '';
    let gdgEventId = '';

    beforeAll(async () => {
      const gdgDoc = await KnowledgeItem.findOne({ clubId: gdgClubId });
      if (gdgDoc) gdgKnowledgeId = gdgDoc._id.toString();

      const gdgEvent = await Event.findOne({ clubId: gdgClubId });
      if (gdgEvent) gdgEventId = gdgEvent._id.toString();
    });

    describe('CORS Origin Controls & Production Configuration', () => {
      it('permits development/test localhost requests', async () => {
        const res = await request(app)
          .get('/api/health')
          .set('Origin', 'http://localhost:5173');
        expect(res.status).toBe(200);
        expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
      });

      it('rejects unpermitted third-party origins under CORS policy', async () => {
        const res = await request(app)
          .get('/api/health')
          .set('Origin', 'https://malicious-cross-origin.com');
        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('CORS_FORBIDDEN');
      });

      it('enforces strict production environment configuration schema (requires non-localhost CLIENT_ORIGIN, 32-char JWT, and MONGODB_URI)', () => {
        const testRes = spawnSync(
          'node',
          ['-e', 'import("./src/config/env.js");'],
          {
            cwd: process.cwd(),
            env: {
              ...process.env,
              NODE_ENV: 'production',
              JWT_SECRET: 'a_very_long_production_secret_32_characters_minimum!',
              CLIENT_ORIGIN: 'http://localhost:5173',
              MONGODB_URI: 'mongodb+srv://user:pass@cluster0.mongodb.net/prod',
            },
          }
        );
        expect(testRes.status).not.toBe(0);
        const errOutput = testRes.stderr.toString() + testRes.stdout.toString();
        expect(errOutput).toContain('Localhost origins are restricted to development');

        const validRes = spawnSync(
          'node',
          ['-e', 'import("./src/config/env.js");'],
          {
            cwd: process.cwd(),
            env: {
              ...process.env,
              NODE_ENV: 'production',
              JWT_SECRET: 'a_very_long_production_secret_32_characters_minimum!',
              CLIENT_ORIGIN: 'https://clubrelay.edu,https://admin.clubrelay.edu',
              MONGODB_URI: 'mongodb+srv://user:pass@cluster0.mongodb.net/prod',
            },
          }
        );
        expect(validRes.status).toBe(0);
      });
    });

    describe('Cross-Club Read Authorization Isolation', () => {
      it('prevents same-campus user from accessing another club private knowledge list (Negative Test)', async () => {
        const res = await request(app)
          .get(`/api/v1/clubs/${gdgClubId}/knowledge`)
          .set('Cookie', ieeePresidentCookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('NOT_A_MEMBER');
      });

      it('prevents same-campus user from accessing another club private knowledge item detail (Negative Test)', async () => {
        const res = await request(app)
          .get(`/api/v1/clubs/${gdgClubId}/knowledge/${gdgKnowledgeId}`)
          .set('Cookie', ieeePresidentCookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('NOT_A_MEMBER');
      });

      it('prevents same-campus user from accessing another club vendor contacts (Negative Test)', async () => {
        const res = await request(app)
          .get(`/api/v1/clubs/${gdgClubId}/contacts`)
          .set('Cookie', ieeePresidentCookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('NOT_A_MEMBER');
      });

      it('prevents same-campus user from accessing another club meeting decisions (Negative Test)', async () => {
        const res = await request(app)
          .get(`/api/v1/clubs/${gdgClubId}/decisions`)
          .set('Cookie', ieeePresidentCookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('NOT_A_MEMBER');
      });

      it('prevents same-campus user from accessing another club annual reports (Negative Test)', async () => {
        const res = await request(app)
          .get(`/api/v1/clubs/${gdgClubId}/reports/annual`)
          .set('Cookie', ieeePresidentCookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('NOT_A_MEMBER');
      });

      it('prevents same-campus user from exporting another club annual reports CSV (Negative Test)', async () => {
        const res = await request(app)
          .get(`/api/v1/clubs/${gdgClubId}/reports/export/csv`)
          .set('Cookie', ieeePresidentCookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('NOT_A_MEMBER');
      });

      it('prevents unauthorized same-campus non-member from accessing another club event details (Negative Test)', async () => {
        const res = await request(app)
          .get(`/api/v1/events/${gdgEventId}`)
          .set('Cookie', ieeePresidentCookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
      });

      it('prevents unauthorized same-campus non-member from accessing another club event approval history (Negative Test)', async () => {
        const res = await request(app)
          .get(`/api/v1/approvals/events/${gdgEventId}`)
          .set('Cookie', ieeePresidentCookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
      });

      it('prevents unassigned faculty coordinator from accessing another club event tasks (Negative Test)', async () => {
        // advisor.sharma is assigned to IEEE, but unassigned to GDG
        const res = await request(app)
          .get(`/api/v1/events/${gdgEventId}/tasks`)
          .set('Cookie', unassignedFacultySharmaCookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
      });

      it('allows assigned faculty coordinator, club member, and campus admin intended access', async () => {
        // Assigned faculty (Chen) can access GDG tasks and event details
        const facultyTasksRes = await request(app)
          .get(`/api/v1/events/${gdgEventId}/tasks`)
          .set('Cookie', facultyChenCookie);
        expect(facultyTasksRes.status).toBe(200);

        const facultyEventRes = await request(app)
          .get(`/api/v1/events/${gdgEventId}`)
          .set('Cookie', facultyChenCookie);
        expect(facultyEventRes.status).toBe(200);

        // Campus admin has campus-wide oversight
        const adminEventRes = await request(app)
          .get(`/api/v1/events/${gdgEventId}`)
          .set('Cookie', campusAdminCookie);
        expect(adminEventRes.status).toBe(200);

        const adminTasksRes = await request(app)
          .get(`/api/v1/events/${gdgEventId}/tasks`)
          .set('Cookie', campusAdminCookie);
        expect(adminTasksRes.status).toBe(200);

        // Active member (Alex) can access event details and tasks
        const memberEventRes = await request(app)
          .get(`/api/v1/events/${gdgEventId}`)
          .set('Cookie', alexCookie);
        expect(memberEventRes.status).toBe(200);
      });

      it('returns sanitized response for non-member accessing club details (Preserves public directory without leaking PII or handover data)', async () => {
        const res = await request(app)
          .get(`/api/v1/clubs/${gdgClubId}`)
          .set('Cookie', ieeePresidentCookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.isAuthorized).toBe(false);
        // Sensitive private handover information is hidden from non-members
        expect(res.body.data.metrics.handoverProgress).toBeNull();
        expect(res.body.data.metrics.latestHandoverStatus).toBeNull();
        // Faculty email and phone are not exposed to unrelated users
        if (res.body.data.club.facultyCoordinatorId) {
          expect(res.body.data.club.facultyCoordinatorId.email).toBeUndefined();
          expect(res.body.data.club.facultyCoordinatorId.phone).toBeUndefined();
        }
        // Leadership contacts are sanitized (no emails or phones exposed)
        res.body.data.leadership.forEach((leader) => {
          expect(leader.userId?.email).toBeUndefined();
          expect(leader.userId?.phone).toBeUndefined();
        });
      });

      it('prevents non-member from accessing club member rosters (Negative Test)', async () => {
        const res = await request(app)
          .get(`/api/v1/clubs/${gdgClubId}/members`)
          .set('Cookie', ieeePresidentCookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('NOT_A_MEMBER');
      });

      it('allows authorized member to access their club roster', async () => {
        const res = await request(app)
          .get(`/api/v1/clubs/${gdgClubId}/members`)
          .set('Cookie', alexCookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data.members)).toBe(true);
        expect(res.body.data.members.length).toBeGreaterThan(0);
      });

      it('allows campus administrator to access authorized campus clubs and full details', async () => {
        const clubRes = await request(app)
          .get(`/api/v1/clubs/${gdgClubId}`)
          .set('Cookie', campusAdminCookie);

        expect(clubRes.status).toBe(200);
        expect(clubRes.body.data.isAuthorized).toBe(true);
        expect(clubRes.body.data.metrics.handoverProgress).not.toBeNull();

        const membersRes = await request(app)
          .get(`/api/v1/clubs/${gdgClubId}/members`)
          .set('Cookie', campusAdminCookie);

        expect(membersRes.status).toBe(200);
        expect(Array.isArray(membersRes.body.data.members)).toBe(true);
        expect(membersRes.body.data.members.length).toBeGreaterThan(0);
      });
    });

    describe('Handover Transaction Integrity & Concurrency', () => {
      let rollbackHandoverId = '';
      let concurrentHandoverId = '';

      beforeAll(async () => {
        const currentTerm = await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: true });
        const pastTerm = await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: false });
        const rajUser = await User.findOne({ email: 'raj.ieee@pcu.edu' });
        const samUser = await User.findOne({ email: 'sam.member@pcu.edu' });

        // Ensure Raj has active PRESIDENT membership for pastTerm (outgoing term)
        await Membership.findOneAndUpdate(
          {
            campusId: pcuCampusId,
            clubId: ieeeClubId,
            userId: rajUser._id,
            academicTermId: pastTerm._id,
          },
          {
            clubRole: 'PRESIDENT',
            status: 'ACTIVE',
            title: 'Branch Chairperson',
          },
          { upsert: true, new: true }
        );

        // Ensure Sam has an active CORE_TEAM membership in IEEE for currentTerm (incoming term)
        await Membership.findOneAndUpdate(
          {
            campusId: pcuCampusId,
            clubId: ieeeClubId,
            userId: samUser._id,
            academicTermId: currentTerm._id,
          },
          {
            clubRole: 'CORE_TEAM',
            title: 'Incoming Test Officer',
            status: 'ACTIVE',
          },
          { upsert: true, new: true }
        );

        const sectionsComplete = {
          roleResponsibilities: { content: 'Done', completed: true },
          outstandingTasks: { content: 'Done', completed: true },
          pendingCommitments: { content: 'Done', completed: true },
          futureEventSchedules: { content: 'Done', completed: true },
          importantDocuments: { content: 'Done', completed: true },
          contactsAndPartners: { content: 'Done', completed: true },
          reusablePlaybooks: { content: 'Done', completed: true },
          recommendationsAndAdvice: { content: 'Done', completed: true },
        };

        // 1. Create a handover for failure/rollback test
        const rollbackHandover = await Handover.create({
          campusId: pcuCampusId,
          clubId: ieeeClubId,
          fromTermId: pastTerm._id,
          toTermId: currentTerm._id,
          outgoingLeaderId: rajUser._id,
          incomingLeaderId: samUser._id,
          roleHandover: 'PRESIDENT',
          status: 'ACKNOWLEDGED',
          sections: sectionsComplete,
          completionPercentage: 100,
          acknowledgedAt: new Date(),
        });
        rollbackHandoverId = rollbackHandover._id.toString();

        // 2. Create another handover for concurrent completion test
        const concurrentHandover = await Handover.create({
          campusId: pcuCampusId,
          clubId: ieeeClubId,
          fromTermId: pastTerm._id,
          toTermId: currentTerm._id,
          outgoingLeaderId: rajUser._id,
          incomingLeaderId: samUser._id,
          roleHandover: 'PRESIDENT',
          status: 'ACKNOWLEDGED',
          sections: sectionsComplete,
          completionPercentage: 100,
          acknowledgedAt: new Date(),
        });
        concurrentHandoverId = concurrentHandover._id.toString();
      });

      it('aborts cleanly and leaves zero partial state upon handover transaction failure', async () => {
        // Temporarily spy on AuditLog.create to simulate an unexpected error during the transaction
        const originalAuditCreate = AuditLog.create;
        let failTriggered = false;

        AuditLog.create = async function (...args) {
          if (!failTriggered) {
            failTriggered = true;
            throw new Error('Simulated database write error inside atomic transaction');
          }
          return originalAuditCreate.apply(this, args);
        };

        try {
          const res = await request(app)
            .post(`/api/v1/clubs/${ieeeClubId}/handovers/${rollbackHandoverId}/complete`)
            .set('Cookie', ieeePresidentCookie);

          // Should have failed and rolled back
          expect(res.status).toBe(500);

          // VERIFY ACID TRANSACTION GUARANTEES:
          // 1. Handover status must NOT be COMPLETED
          const checkHandover = await Handover.findById(rollbackHandoverId);
          expect(checkHandover.status).toBe('ACKNOWLEDGED');
          expect(checkHandover.completedAt).toBeNull();

          // 2. Outgoing leader (Raj) must still be PRESIDENT (NOT demoted to CORE_TEAM)
          const rajUser = await User.findOne({ email: 'raj.ieee@pcu.edu' });
          const rajMembership = await Membership.findOne({
            campusId: pcuCampusId,
            clubId: ieeeClubId,
            userId: rajUser._id,
          });
          expect(rajMembership.clubRole).toBe('PRESIDENT');

          // 3. Incoming leader (Sam) must NOT have received PRESIDENT role
          const samUser = await User.findOne({ email: 'sam.member@pcu.edu' });
          const samMembership = await Membership.findOne({
            campusId: pcuCampusId,
            clubId: ieeeClubId,
            userId: samUser._id,
          });
          expect(samMembership.clubRole).not.toBe('PRESIDENT');

          // 4. No transfer audit record was recorded
          const auditRecord = await AuditLog.findOne({
            targetId: rollbackHandoverId,
            action: 'HANDOVER_COMPLETED_ROLES_TRANSFERRED',
          });
          expect(auditRecord).toBeNull();
        } finally {
          AuditLog.create = originalAuditCreate;
        }
      });

      it('prevents concurrent duplicate handover completion and preserves single role transition', async () => {
        // Dispatch 2 concurrent completion requests for the exact same handover
        const [res1, res2] = await Promise.all([
          request(app)
            .post(`/api/v1/clubs/${ieeeClubId}/handovers/${concurrentHandoverId}/complete`)
            .set('Cookie', ieeePresidentCookie),
          request(app)
            .post(`/api/v1/clubs/${ieeeClubId}/handovers/${concurrentHandoverId}/complete`)
            .set('Cookie', ieeePresidentCookie),
        ]);

        const statuses = [res1.status, res2.status].sort();
        // One must succeed with 200, one must fail with 400
        expect(statuses).toEqual([200, 400]);

        const successRes = res1.status === 200 ? res1 : res2;
        const rejectedRes = res1.status === 400 ? res1 : res2;

        expect(successRes.body.success).toBe(true);
        expect(rejectedRes.body.error.code).toBe('HANDOVER_ALREADY_COMPLETED');

        // Verify final state in database
        const finalHandover = await Handover.findById(concurrentHandoverId);
        expect(finalHandover.status).toBe('COMPLETED');

        // Audit log must have recorded exactly one transition event for this handover
        const auditCount = await AuditLog.countDocuments({
          targetId: concurrentHandoverId,
          action: 'HANDOVER_COMPLETED_ROLES_TRANSFERRED',
        });
        expect(auditCount).toBe(1);
      });

      it('rejects handover completion when incoming member is revoked and leaves zero partial changes', async () => {
        const currentTerm = await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: true });
        const pastTerm = await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: false });
        const rajUser = await User.findOne({ email: 'raj.ieee@pcu.edu' });
        const mayaUser = await User.findOne({ email: 'maya.tech@pcu.edu' });

        // Ensure Raj is PRESIDENT for this test in pastTerm
        await Membership.updateOne(
          { campusId: pcuCampusId, clubId: ieeeClubId, userId: rajUser._id, academicTermId: pastTerm._id },
          { clubRole: 'PRESIDENT', status: 'ACTIVE' }
        );

        // Create an inactive/revoked membership for Maya in IEEE
        await Membership.findOneAndUpdate(
          {
            campusId: pcuCampusId,
            clubId: ieeeClubId,
            userId: mayaUser._id,
          },
          {
            clubRole: 'GENERAL_MEMBER',
            status: 'REVOKED',
            academicTermId: currentTerm._id,
          },
          { upsert: true, new: true }
        );

        const sectionsComplete = {
          roleResponsibilities: { content: 'Done', completed: true },
          outstandingTasks: { content: 'Done', completed: true },
          pendingCommitments: { content: 'Done', completed: true },
          futureEventSchedules: { content: 'Done', completed: true },
          importantDocuments: { content: 'Done', completed: true },
          contactsAndPartners: { content: 'Done', completed: true },
          reusablePlaybooks: { content: 'Done', completed: true },
          recommendationsAndAdvice: { content: 'Done', completed: true },
        };

        const revokedTestHandover = await Handover.create({
          campusId: pcuCampusId,
          clubId: ieeeClubId,
          fromTermId: pastTerm._id,
          toTermId: currentTerm._id,
          outgoingLeaderId: rajUser._id,
          incomingLeaderId: mayaUser._id,
          roleHandover: 'PRESIDENT',
          status: 'ACKNOWLEDGED',
          sections: sectionsComplete,
          completionPercentage: 100,
          acknowledgedAt: new Date(),
        });

        const res = await request(app)
          .post(`/api/v1/clubs/${ieeeClubId}/handovers/${revokedTestHandover._id}/complete`)
          .set('Cookie', ieeePresidentCookie);

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('INCOMING_MEMBER_INACTIVE');

        // ZERO PARTIAL CHANGES VERIFICATION:
        // 1. Handover status remained ACKNOWLEDGED
        const checkHandover = await Handover.findById(revokedTestHandover._id);
        expect(checkHandover.status).toBe('ACKNOWLEDGED');
        expect(checkHandover.completedAt).toBeNull();

        // 2. Outgoing leader remained PRESIDENT
        const checkRajMembership = await Membership.findOne({
          campusId: pcuCampusId,
          clubId: ieeeClubId,
          userId: rajUser._id,
          academicTermId: pastTerm._id,
        });
        expect(checkRajMembership.clubRole).toBe('PRESIDENT');

        // 3. Incoming member remained REVOKED
        const checkMayaMembership = await Membership.findOne({
          campusId: pcuCampusId,
          clubId: ieeeClubId,
          userId: mayaUser._id,
        });
        expect(checkMayaMembership.status).toBe('REVOKED');
        expect(checkMayaMembership.clubRole).not.toBe('PRESIDENT');

        // 4. Zero transfer audit log recorded
        const auditLog = await AuditLog.findOne({
          targetId: revokedTestHandover._id,
          action: 'HANDOVER_COMPLETED_ROLES_TRANSFERRED',
        });
        expect(auditLog).toBeNull();
      });

      it('rejects handover completion when outgoing membership record is missing and leaves zero partial changes', async () => {
        const currentTerm = await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: true });
        const pastTerm = await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: false });
        const samUser = await User.findOne({ email: 'sam.member@pcu.edu' });

        // Ensure Sam is CORE_TEAM (not PRESIDENT) for this test in currentTerm
        await Membership.updateOne(
          { campusId: pcuCampusId, clubId: ieeeClubId, userId: samUser._id, academicTermId: currentTerm._id },
          { clubRole: 'CORE_TEAM', status: 'ACTIVE' }
        );

        // Use a dummy user ID that has NO membership record in IEEE
        const dummyOutgoingUserId = new (await import('mongoose')).default.Types.ObjectId();

        const sectionsComplete = {
          roleResponsibilities: { content: 'Done', completed: true },
          outstandingTasks: { content: 'Done', completed: true },
          pendingCommitments: { content: 'Done', completed: true },
          futureEventSchedules: { content: 'Done', completed: true },
          importantDocuments: { content: 'Done', completed: true },
          contactsAndPartners: { content: 'Done', completed: true },
          reusablePlaybooks: { content: 'Done', completed: true },
          recommendationsAndAdvice: { content: 'Done', completed: true },
        };

        const missingOutgoingHandover = await Handover.create({
          campusId: pcuCampusId,
          clubId: ieeeClubId,
          fromTermId: pastTerm._id,
          toTermId: currentTerm._id,
          outgoingLeaderId: dummyOutgoingUserId,
          incomingLeaderId: samUser._id,
          roleHandover: 'PRESIDENT',
          status: 'ACKNOWLEDGED',
          sections: sectionsComplete,
          completionPercentage: 100,
          acknowledgedAt: new Date(),
        });

        // Campus admin attempts completion on this inconsistent record
        const res = await request(app)
          .post(`/api/v1/clubs/${ieeeClubId}/handovers/${missingOutgoingHandover._id}/complete`)
          .set('Cookie', campusAdminCookie);

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('OUTGOING_MEMBERSHIP_INVALID');

        // ZERO PARTIAL CHANGES VERIFICATION:
        // 1. Handover status remained ACKNOWLEDGED
        const checkHandover = await Handover.findById(missingOutgoingHandover._id);
        expect(checkHandover.status).toBe('ACKNOWLEDGED');
        expect(checkHandover.completedAt).toBeNull();

        // 2. Incoming member was NOT promoted to PRESIDENT
        const checkSamMembership = await Membership.findOne({
          campusId: pcuCampusId,
          clubId: ieeeClubId,
          userId: samUser._id,
          academicTermId: currentTerm._id,
        });
        expect(checkSamMembership.clubRole).not.toBe('PRESIDENT');

        // 3. Zero transfer audit log recorded
        const auditLog = await AuditLog.findOne({
          targetId: missingOutgoingHandover._id,
          action: 'HANDOVER_COMPLETED_ROLES_TRANSFERRED',
        });
        expect(auditLog).toBeNull();
      });
    });

    describe('Handover Workflow Role Mapping & Academic Term Integrity', () => {
      it('transitions CORE_LEAD to CORE_TEAM with proper titles and never SECRETARY', async () => {
        const currentTerm = await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: true });
        const mayaUser = await User.findOne({ email: 'maya.tech@pcu.edu' });
        const samUser = await User.findOne({ email: 'sam.member@pcu.edu' });

        // Ensure Maya is active CORE_TEAM in GDG for currentTerm
        await Membership.findOneAndUpdate(
          {
            campusId: pcuCampusId,
            clubId: gdgClubId,
            userId: mayaUser._id,
            academicTermId: currentTerm._id,
          },
          {
            clubRole: 'CORE_TEAM',
            title: 'Lead Workshop Organizer',
            status: 'ACTIVE',
          },
          { upsert: true, new: true }
        );

        // Ensure Sam is active GENERAL_MEMBER in GDG for currentTerm
        await Membership.findOneAndUpdate(
          {
            campusId: pcuCampusId,
            clubId: gdgClubId,
            userId: samUser._id,
            academicTermId: currentTerm._id,
          },
          {
            clubRole: 'GENERAL_MEMBER',
            title: 'General Member',
            status: 'ACTIVE',
          },
          { upsert: true, new: true }
        );

        const sectionsComplete = {
          roleResponsibilities: { content: 'Responsibilities transferred', completed: true },
          outstandingTasks: { content: 'No open tasks', completed: true },
          pendingCommitments: { content: 'All commitments fulfilled', completed: true },
          futureEventSchedules: { content: 'Upcoming workshop calendar finalized', completed: true },
          importantDocuments: { content: 'Drive folders shared', completed: true },
          contactsAndPartners: { content: 'Speaker contacts listed', completed: true },
          reusablePlaybooks: { content: 'SOPs up to date', completed: true },
          recommendationsAndAdvice: { content: 'Handover complete', completed: true },
        };

        const coreLeadHandover = await Handover.create({
          campusId: pcuCampusId,
          clubId: gdgClubId,
          fromTermId: currentTerm._id,
          toTermId: currentTerm._id,
          outgoingLeaderId: mayaUser._id,
          incomingLeaderId: samUser._id,
          roleHandover: 'CORE_LEAD',
          status: 'ACKNOWLEDGED',
          sections: sectionsComplete,
          completionPercentage: 100,
          acknowledgedAt: new Date(),
        });

        // Campus admin completes handover
        const res = await request(app)
          .post(`/api/v1/clubs/${gdgClubId}/handovers/${coreLeadHandover._id}/complete`)
          .set('Cookie', campusAdminCookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        // Verify incoming membership is CORE_TEAM, NEVER SECRETARY
        const updatedSam = await Membership.findOne({
          campusId: pcuCampusId,
          clubId: gdgClubId,
          userId: samUser._id,
          academicTermId: currentTerm._id,
        });
        expect(updatedSam.clubRole).toBe('CORE_TEAM');
        expect(updatedSam.clubRole).not.toBe('SECRETARY');
        expect(updatedSam.title).toBe('Core Team Lead');

        // Verify outgoing membership is CORE_TEAM with Former Core Lead title
        const updatedMaya = await Membership.findOne({
          campusId: pcuCampusId,
          clubId: gdgClubId,
          userId: mayaUser._id,
          academicTermId: currentTerm._id,
        });
        expect(updatedMaya.clubRole).toBe('CORE_TEAM');
        expect(updatedMaya.title).toBe('Former Core Lead / Senior Advisor');

        // Verify audit log metadata
        const auditLog = await AuditLog.findOne({
          targetId: coreLeadHandover._id,
          action: 'HANDOVER_COMPLETED_ROLES_TRANSFERRED',
        });
        expect(auditLog).not.toBeNull();
        expect(auditLog.metadata.roleHandover).toBe('CORE_LEAD');
        expect(auditLog.metadata.incomingRole).toBe('CORE_TEAM');
        expect(auditLog.metadata.outgoingRole).toBe('CORE_TEAM');
      });

      it('transitions SECRETARY role mapping correctly', async () => {
        const currentTerm = await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: true });
        const davidUser = await User.findOne({ email: 'david.sec@pcu.edu' });
        const samUser = await User.findOne({ email: 'sam.member@pcu.edu' });

        // Ensure David is active SECRETARY in GDG for currentTerm
        await Membership.findOneAndUpdate(
          {
            campusId: pcuCampusId,
            clubId: gdgClubId,
            userId: davidUser._id,
            academicTermId: currentTerm._id,
          },
          {
            clubRole: 'SECRETARY',
            title: 'General Secretary',
            status: 'ACTIVE',
          },
          { upsert: true, new: true }
        );

        // Ensure Sam is active GENERAL_MEMBER in GDG for currentTerm
        await Membership.findOneAndUpdate(
          {
            campusId: pcuCampusId,
            clubId: gdgClubId,
            userId: samUser._id,
            academicTermId: currentTerm._id,
          },
          {
            clubRole: 'GENERAL_MEMBER',
            title: 'General Member',
            status: 'ACTIVE',
          },
          { upsert: true, new: true }
        );

        const sectionsComplete = {
          roleResponsibilities: { content: 'Responsibilities transferred', completed: true },
          outstandingTasks: { content: 'No open tasks', completed: true },
          pendingCommitments: { content: 'All commitments fulfilled', completed: true },
          futureEventSchedules: { content: 'Minutes and calendar documented', completed: true },
          importantDocuments: { content: 'Drive folders shared', completed: true },
          contactsAndPartners: { content: 'Faculty contacts listed', completed: true },
          reusablePlaybooks: { content: 'Meeting templates up to date', completed: true },
          recommendationsAndAdvice: { content: 'Handover complete', completed: true },
        };

        const secretaryHandover = await Handover.create({
          campusId: pcuCampusId,
          clubId: gdgClubId,
          fromTermId: currentTerm._id,
          toTermId: currentTerm._id,
          outgoingLeaderId: davidUser._id,
          incomingLeaderId: samUser._id,
          roleHandover: 'SECRETARY',
          status: 'ACKNOWLEDGED',
          sections: sectionsComplete,
          completionPercentage: 100,
          acknowledgedAt: new Date(),
        });

        const res = await request(app)
          .post(`/api/v1/clubs/${gdgClubId}/handovers/${secretaryHandover._id}/complete`)
          .set('Cookie', campusAdminCookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const updatedSam = await Membership.findOne({
          campusId: pcuCampusId,
          clubId: gdgClubId,
          userId: samUser._id,
          academicTermId: currentTerm._id,
        });
        expect(updatedSam.clubRole).toBe('SECRETARY');
        expect(updatedSam.title).toBe('Club Secretary');

        const updatedDavid = await Membership.findOne({
          campusId: pcuCampusId,
          clubId: gdgClubId,
          userId: davidUser._id,
          academicTermId: currentTerm._id,
        });
        expect(updatedDavid.clubRole).toBe('CORE_TEAM');
        expect(updatedDavid.title).toBe('Past Secretary / Advisor');
      });

      it('rejects handover initiation when foreign-campus academic term IDs are provided', async () => {
        const pcuTerm = await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: true });
        const mtiTerm = await AcademicTerm.findOne({ campusId: mtiCampusId, isCurrent: true });

        const res = await request(app)
          .post(`/api/v1/clubs/${gdgClubId}/handovers`)
          .set('Cookie', sarahCookie)
          .send({
            incomingLeaderEmail: 'alex.incoming@pcu.edu',
            roleHandover: 'PRESIDENT',
            fromTermId: pcuTerm._id.toString(),
            toTermId: mtiTerm._id.toString(), // Foreign campus term
          });

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('ACADEMIC_TERM_NOT_FOUND');
      });

      it('rejects handover initiation when academic terms are nonexistent or invalid', async () => {
        const dummyTermId = new (await import('mongoose')).default.Types.ObjectId().toString();

        const res = await request(app)
          .post(`/api/v1/clubs/${gdgClubId}/handovers`)
          .set('Cookie', sarahCookie)
          .send({
            incomingLeaderEmail: 'alex.incoming@pcu.edu',
            roleHandover: 'PRESIDENT',
            fromTermId: 'invalid-id-format',
            toTermId: dummyTermId,
          });

        expect(res.status).toBe(400);
        expect(['INVALID_ACADEMIC_TERM', 'ACADEMIC_TERM_NOT_FOUND']).toContain(res.body.error.code);
      });

      it('rejects handover completion when membership is for incorrect academic term', async () => {
        const currentTerm = await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: true });
        const rajUser = await User.findOne({ email: 'raj.ieee@pcu.edu' });
        const samUser = await User.findOne({ email: 'sam.member@pcu.edu' });

        // Raj has membership in pastTerm, but NOT in currentTerm for IEEE
        await Membership.deleteMany({
          campusId: pcuCampusId,
          clubId: ieeeClubId,
          userId: rajUser._id,
          academicTermId: currentTerm._id,
        });

        // Ensure Sam is active in currentTerm
        await Membership.findOneAndUpdate(
          {
            campusId: pcuCampusId,
            clubId: ieeeClubId,
            userId: samUser._id,
            academicTermId: currentTerm._id,
          },
          {
            clubRole: 'CORE_TEAM',
            status: 'ACTIVE',
            title: 'Incoming Member',
          },
          { upsert: true, new: true }
        );

        const sectionsComplete = {
          roleResponsibilities: { content: 'Done', completed: true },
          outstandingTasks: { content: 'Done', completed: true },
          pendingCommitments: { content: 'Done', completed: true },
          futureEventSchedules: { content: 'Done', completed: true },
          importantDocuments: { content: 'Done', completed: true },
          contactsAndPartners: { content: 'Done', completed: true },
          reusablePlaybooks: { content: 'Done', completed: true },
          recommendationsAndAdvice: { content: 'Done', completed: true },
        };

        // Handover specifies fromTermId = currentTerm, where Raj has NO membership
        const mismatchHandover = await Handover.create({
          campusId: pcuCampusId,
          clubId: ieeeClubId,
          fromTermId: currentTerm._id,
          toTermId: currentTerm._id,
          outgoingLeaderId: rajUser._id,
          incomingLeaderId: samUser._id,
          roleHandover: 'PRESIDENT',
          status: 'ACKNOWLEDGED',
          sections: sectionsComplete,
          completionPercentage: 100,
          acknowledgedAt: new Date(),
        });

        const res = await request(app)
          .post(`/api/v1/clubs/${ieeeClubId}/handovers/${mismatchHandover._id}/complete`)
          .set('Cookie', campusAdminCookie);

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('OUTGOING_MEMBERSHIP_INVALID');

        // Verify handover remained ACKNOWLEDGED with zero partial state
        const checkHandover = await Handover.findById(mismatchHandover._id);
        expect(checkHandover.status).toBe('ACKNOWLEDGED');
      });

      it('ensures multiple term-specific memberships do not cause arbitrary records to be modified', async () => {
        const currentTerm = await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: true });
        const pastTerm = await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: false });
        const sarahUser = await User.findOne({ email: 'sarah.gdg@pcu.edu' });
        const alexUser = await User.findOne({ email: 'alex.incoming@pcu.edu' });

        // Sarah has memberships in BOTH pastTerm (PRESIDENT) and currentTerm (PRESIDENT)
        await Membership.findOneAndUpdate(
          {
            campusId: pcuCampusId,
            clubId: gdgClubId,
            userId: sarahUser._id,
            academicTermId: pastTerm._id,
          },
          {
            clubRole: 'PRESIDENT',
            status: 'ACTIVE',
            title: 'Past Term President',
          },
          { upsert: true, new: true }
        );

        await Membership.findOneAndUpdate(
          {
            campusId: pcuCampusId,
            clubId: gdgClubId,
            userId: sarahUser._id,
            academicTermId: currentTerm._id,
          },
          {
            clubRole: 'PRESIDENT',
            status: 'ACTIVE',
            title: 'Current Term President',
          },
          { upsert: true, new: true }
        );

        // Alex has memberships in BOTH pastTerm (CORE_TEAM) and currentTerm (CORE_TEAM)
        await Membership.findOneAndUpdate(
          {
            campusId: pcuCampusId,
            clubId: gdgClubId,
            userId: alexUser._id,
            academicTermId: pastTerm._id,
          },
          {
            clubRole: 'CORE_TEAM',
            status: 'ACTIVE',
            title: 'Past Term Core',
          },
          { upsert: true, new: true }
        );

        await Membership.findOneAndUpdate(
          {
            campusId: pcuCampusId,
            clubId: gdgClubId,
            userId: alexUser._id,
            academicTermId: currentTerm._id,
          },
          {
            clubRole: 'CORE_TEAM',
            status: 'ACTIVE',
            title: 'Current Term Core',
          },
          { upsert: true, new: true }
        );

        const sectionsComplete = {
          roleResponsibilities: { content: 'Done', completed: true },
          outstandingTasks: { content: 'Done', completed: true },
          pendingCommitments: { content: 'Done', completed: true },
          futureEventSchedules: { content: 'Done', completed: true },
          importantDocuments: { content: 'Done', completed: true },
          contactsAndPartners: { content: 'Done', completed: true },
          reusablePlaybooks: { content: 'Done', completed: true },
          recommendationsAndAdvice: { content: 'Done', completed: true },
        };

        // Handover specifies transition for pastTerm -> pastTerm only
        const termSpecificHandover = await Handover.create({
          campusId: pcuCampusId,
          clubId: gdgClubId,
          fromTermId: pastTerm._id,
          toTermId: pastTerm._id,
          outgoingLeaderId: sarahUser._id,
          incomingLeaderId: alexUser._id,
          roleHandover: 'PRESIDENT',
          status: 'ACKNOWLEDGED',
          sections: sectionsComplete,
          completionPercentage: 100,
          acknowledgedAt: new Date(),
        });

        const res = await request(app)
          .post(`/api/v1/clubs/${gdgClubId}/handovers/${termSpecificHandover._id}/complete`)
          .set('Cookie', sarahCookie);

        expect(res.status).toBe(200);

        // 1. pastTerm memberships were updated
        const pastSarah = await Membership.findOne({
          campusId: pcuCampusId,
          clubId: gdgClubId,
          userId: sarahUser._id,
          academicTermId: pastTerm._id,
        });
        expect(pastSarah.clubRole).toBe('CORE_TEAM');

        const pastAlex = await Membership.findOne({
          campusId: pcuCampusId,
          clubId: gdgClubId,
          userId: alexUser._id,
          academicTermId: pastTerm._id,
        });
        expect(pastAlex.clubRole).toBe('PRESIDENT');

        // 2. currentTerm memberships remained UNTOUCHED
        const currentSarah = await Membership.findOne({
          campusId: pcuCampusId,
          clubId: gdgClubId,
          userId: sarahUser._id,
          academicTermId: currentTerm._id,
        });
        expect(currentSarah.clubRole).toBe('PRESIDENT');
        expect(currentSarah.title).toBe('Current Term President');

        const currentAlex = await Membership.findOne({
          campusId: pcuCampusId,
          clubId: gdgClubId,
          userId: alexUser._id,
          academicTermId: currentTerm._id,
        });
        expect(currentAlex.clubRole).toBe('CORE_TEAM');
        expect(currentAlex.title).toBe('Current Term Core');
      });

      it('enforces campus-admin initiation policy requiring explicit officer nomination', async () => {
        const currentTerm = await AcademicTerm.findOne({ campusId: pcuCampusId, isCurrent: true });
        const sarahUser = await User.findOne({ email: 'sarah.gdg@pcu.edu' });

        // 1. Campus admin initiates WITHOUT outgoingLeaderEmail -> Rejection 400
        const noNominationRes = await request(app)
          .post(`/api/v1/clubs/${gdgClubId}/handovers`)
          .set('Cookie', campusAdminCookie)
          .send({
            incomingLeaderEmail: 'alex.incoming@pcu.edu',
            roleHandover: 'PRESIDENT',
            fromTermId: currentTerm._id.toString(),
            toTermId: currentTerm._id.toString(),
          });

        expect(noNominationRes.status).toBe(400);
        expect(noNominationRes.body.error.code).toBe('OUTGOING_LEADER_REQUIRED');

        // 2. Campus admin initiates with nonexistent outgoing officer -> Rejection 404
        const nonExistentRes = await request(app)
          .post(`/api/v1/clubs/${gdgClubId}/handovers`)
          .set('Cookie', campusAdminCookie)
          .send({
            outgoingLeaderEmail: 'ghost.officer@pcu.edu',
            incomingLeaderEmail: 'alex.incoming@pcu.edu',
            roleHandover: 'PRESIDENT',
            fromTermId: currentTerm._id.toString(),
            toTermId: currentTerm._id.toString(),
          });

        expect(nonExistentRes.status).toBe(404);
        expect(nonExistentRes.body.error.code).toBe('USER_NOT_FOUND');

        // 3. Campus admin initiates with valid outgoing president nomination -> 201 Created
        const successRes = await request(app)
          .post(`/api/v1/clubs/${gdgClubId}/handovers`)
          .set('Cookie', campusAdminCookie)
          .send({
            outgoingLeaderEmail: 'sarah.gdg@pcu.edu',
            incomingLeaderEmail: 'alex.incoming@pcu.edu',
            roleHandover: 'PRESIDENT',
            fromTermId: currentTerm._id.toString(),
            toTermId: currentTerm._id.toString(),
          });

        expect(successRes.status).toBe(201);
        expect(successRes.body.success).toBe(true);
        // Outgoing leader is Sarah, NOT the campus admin!
        expect(successRes.body.data.handover.outgoingLeaderId).toBe(sarahUser._id.toString());
      });
    });
  });
});
