import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { runSeed } from '../scripts/seed.js';
import { User, Club, Event, Handover, Membership, Campus, AcademicTerm } from '../models/index.js';

describe('ClubRelay Production Engineering Hardening Test Suite', () => {
  let sarahToken = '';
  let sarahCookie = '';
  let alexToken = '';
  let alexCookie = '';
  let facultyChenCookie = '';
  let campusAdminCookie = '';
  let generalMemberCookie = '';

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
    sarahToken = sarahAuth.token;

    const alexAuth = await loginPersona('alex.incoming@pcu.edu');
    alexCookie = alexAuth.cookie;
    alexToken = alexAuth.token;

    const facultyAuth = await loginPersona('advisor.chen@pcu.edu');
    facultyChenCookie = facultyAuth.cookie;

    const adminAuth = await loginPersona('admin@pcu.edu');
    campusAdminCookie = adminAuth.cookie;

    const generalAuth = await loginPersona('sam.member@pcu.edu');
    generalMemberCookie = generalAuth.cookie;
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
});
