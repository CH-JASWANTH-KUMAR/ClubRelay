import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  Campus,
  AcademicTerm,
  User,
  Club,
  Membership,
  ClubPosition,
  ClubMembership,
  ClubPositionAssignment,
  ClubInvitation,
  CampusRequest,
} from '../models/index.js';
import { migrateLegacyClub } from '../services/migrationService.js';

describe('Organization Onboarding, Custom Structure Builder & Capability RBAC Suite', () => {
  let campusA;
  let campusB;
  let termCurrent;
  let termNext;
  let facultyUser;
  let campusAdmin;
  let studentOwner;
  let studentDesigner;
  let studentMember;
  let studentCampusB;
  let ownerCookie;
  let designerCookie;
  let memberCookie;
  let campusBCookie;
  let adminCookie;

  async function loginAs(email, password = 'Password123!') {
    const res = await request(app).post('/api/v1/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    return res.headers['set-cookie'];
  }

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret_org_rbac_suite';
    await connectDB();
    await mongoose.connection.dropDatabase();

    campusA = await Campus.create({
      name: 'Alpha Institute of Technology',
      slug: 'alpha-tech',
      domain: 'alpha.edu',
      settings: {
        allowSelfRegistration: true,
        allowStudentClubCreation: true,
        requireFacultyApprovalForNewClubs: false,
        requireFacultyAdvisorOnClubs: false,
      },
    });

    campusB = await Campus.create({
      name: 'Beta State University',
      slug: 'beta-state',
      domain: 'beta.edu',
    });

    termCurrent = await AcademicTerm.create({
      campusId: campusA._id,
      name: '2025-2026',
      startDate: new Date('2025-08-01'),
      endDate: new Date('2026-05-31'),
      isCurrent: true,
    });

    termNext = await AcademicTerm.create({
      campusId: campusA._id,
      name: '2026-2027',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2027-05-31'),
      isCurrent: false,
    });

    const passwordHash = await User.hashPassword('Password123!');

    campusAdmin = await User.create({
      campusId: campusA._id,
      fullName: 'Dean Admin',
      email: 'admin@alpha.edu',
      passwordHash,
      campusRole: 'CAMPUS_ADMIN',
    });

    facultyUser = await User.create({
      campusId: campusA._id,
      fullName: 'Dr. Priya Nair',
      email: 'priya@alpha.edu',
      passwordHash,
      campusRole: 'FACULTY_COORDINATOR',
      department: 'Design & CS',
    });

    studentOwner = await User.create({
      campusId: campusA._id,
      fullName: 'Aarav Founder',
      email: 'aarav@alpha.edu',
      passwordHash,
      campusRole: 'STUDENT',
    });

    studentDesigner = await User.create({
      campusId: campusA._id,
      fullName: 'Maya Designer',
      email: 'maya@alpha.edu',
      passwordHash,
      campusRole: 'STUDENT',
    });

    studentMember = await User.create({
      campusId: campusA._id,
      fullName: 'Rohan Builder',
      email: 'rohan@alpha.edu',
      passwordHash,
      campusRole: 'STUDENT',
    });

    studentCampusB = await User.create({
      campusId: campusB._id,
      fullName: 'Nina Outsider',
      email: 'nina@beta.edu',
      passwordHash,
      campusRole: 'STUDENT',
    });

    ownerCookie = await loginAs('aarav@alpha.edu');
    designerCookie = await loginAs('maya@alpha.edu');
    memberCookie = await loginAs('rohan@alpha.edu');
    campusBCookie = await loginAs('nina@beta.edu');
    adminCookie = await loginAs('admin@alpha.edu');
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('Personal Accounts & Onboarding Summary', () => {
    it('supports personal account signup/login (Scenario E), onboarding summary, and campus setup request', async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send({
        fullName: 'Solo Organizer',
        email: 'solo.organizer@gmail.com',
        password: 'Password123!',
        accountType: 'PERSONAL',
      });
      expect(regRes.status).toBe(201);
      expect(regRes.body.data.accountType).toBe('PERSONAL');

      const personalCookie = await loginAs('solo.organizer@gmail.com');

      const summaryRes = await request(app)
        .get('/api/v1/onboarding/summary')
        .set('Cookie', personalCookie);
      expect(summaryRes.status).toBe(200);
      expect(summaryRes.body.data.accountType).toBe('PERSONAL');
      expect(summaryRes.body.data.templates.length).toBeGreaterThanOrEqual(8);
      expect(summaryRes.body.data.permissionsCatalogue.length).toBeGreaterThan(5);

      const reqCampusRes = await request(app)
        .post('/api/v1/onboarding/campus-request')
        .set('Cookie', personalCookie)
        .send({
          universityName: 'Indie Innovation Hub',
          domain: 'indiehub.org',
          city: 'Hyderabad',
        });
      expect(reqCampusRes.status).toBe(201);
      expect(await CampusRequest.countDocuments({ domain: 'indiehub.org' })).toBe(1);

      // Personal account can still create a private standalone organization
      const draftRes = await request(app)
        .post('/api/v1/clubs/wizard/draft')
        .set('Cookie', personalCookie)
        .send({
          name: 'Indie Builders Guild',
          code: 'IBG',
          category: 'CUSTOM',
          customCategory: 'Makers',
          visibility: 'PRIVATE',
          joinPolicy: 'INVITE_ONLY',
        });
      expect(draftRes.status).toBe(201);
      const actRes = await request(app)
        .post(`/api/v1/clubs/${draftRes.body.data.club._id}/wizard/activate`)
        .set('Cookie', personalCookie)
        .send({});
      expect(actRes.status).toBe(200);
      expect(actRes.body.data.club.status).toBe('ACTIVE');
    });
  });

  describe('8-Step Organization Creation Wizard & Custom Structure Guards', () => {
    let customClubId;
    let stewardPosId;
    let designLeadPosId;
    let docsScribePosId;
    let limitedChildPosId;

    it('creates draft club, saves progress, applies custom template, and activates without President role', async () => {
      const draftRes = await request(app)
        .post('/api/v1/clubs/wizard/draft')
        .set('Cookie', ownerCookie)
        .send({
          name: 'Craft & Design Collective',
          shortName: 'CraftCo',
          code: 'CRAFT',
          category: 'CULTURAL',
          mission: 'Student product design and studio critiques.',
          visibility: 'PUBLIC_CAMPUS',
          joinPolicy: 'REQUEST_APPROVAL',
          joinCode: 'CRAFT26',
          facultyCoordinatorId: facultyUser._id.toString(),
          defaultMemberPermissions: ['club.view_overview'],
        });

      expect(draftRes.status).toBe(201);
      customClubId = draftRes.body.data.club._id;
      expect(draftRes.body.data.club.status).toBe('DRAFT');
      expect(draftRes.body.data.club.workspaceOwnerId).toBe(studentOwner._id.toString());

      // Step 3: apply blank Custom / Start From Scratch template (zero mandatory hardcoded roles)
      const applyRes = await request(app)
        .post(`/api/v1/clubs/${customClubId}/wizard/apply-template`)
        .set('Cookie', ownerCookie)
        .send({ templateKey: 'custom' });
      expect(applyRes.status).toBe(200);
      expect(applyRes.body.data.positions).toHaveLength(0);

      // Step 4/5: Create arbitrary org positions and optional department
      const deptRes = await request(app)
        .post(`/api/v1/clubs/${customClubId}/departments`)
        .set('Cookie', ownerCookie)
        .send({ name: 'Studio Guild', color: '#315BDB' });
      expect(deptRes.status).toBe(201);

      const stewardRes = await request(app)
        .post(`/api/v1/clubs/${customClubId}/positions`)
        .set('Cookie', ownerCookie)
        .send({
          name: 'Studio Steward',
          departmentId: deptRes.body.data.department._id,
          isLeadership: true,
          maxHolders: 1,
          permissions: [
            'club.view_overview',
            'club.manage_structure',
            'events.view',
            'events.create',
            'members.view',
            'members.assign_positions',
            'members.invite',
            'members.approve_requests',
            'handover.manage_all',
            'handover.approve',
          ],
        });
      expect(stewardRes.status).toBe(201);
      stewardPosId = stewardRes.body.data.position._id;

      // Custom role: Design Lead with strict narrow capabilities
      const designRes = await request(app)
        .post(`/api/v1/clubs/${customClubId}/positions`)
        .set('Cookie', ownerCookie)
        .send({
          name: 'Design Lead',
          parentPositionId: stewardPosId,
          isLeadership: true,
          maxHolders: 1,
          permissions: ['events.view', 'projects.view', 'knowledge.create'],
        });
      expect(designRes.status).toBe(201);
      designLeadPosId = designRes.body.data.position._id;

      // Child under Design Lead has NO parent inheritance and Design Lead gets NO child permissions
      const childRes = await request(app)
        .post(`/api/v1/clubs/${customClubId}/positions`)
        .set('Cookie', ownerCookie)
        .send({
          name: 'Critique Archivist',
          parentPositionId: designLeadPosId,
          permissions: ['decisions.view'],
        });
      expect(childRes.status).toBe(201);
      limitedChildPosId = childRes.body.data.position._id;

      // Extra position to test multiple positions per member
      const docsRes = await request(app)
        .post(`/api/v1/clubs/${customClubId}/positions`)
        .set('Cookie', ownerCookie)
        .send({
          name: 'Playbook Scribe',
          permissions: ['knowledge.view', 'knowledge.edit'],
        });
      expect(docsRes.status).toBe(201);
      docsScribePosId = docsRes.body.data.position._id;

      // Activate organization and assign founder as Studio Steward
      const actRes = await request(app)
        .post(`/api/v1/clubs/${customClubId}/wizard/activate`)
        .set('Cookie', ownerCookie)
        .send({
          termId: termCurrent._id.toString(),
          creatorPositionIds: [stewardPosId],
        });
      expect(actRes.status).toBe(200);
      expect(actRes.body.data.club.status).toBe('ACTIVE');
    });

    it('blocks circular parent hierarchy and enforces holder limits & deletion guards', async () => {
      // Trying to make Studio Steward report to Design Lead creates cycle Steward -> Design Lead -> Steward
      const cycleRes = await request(app)
        .put(`/api/v1/clubs/${customClubId}/positions/${stewardPosId}`)
        .set('Cookie', ownerCookie)
        .send({ parentPositionId: designLeadPosId });
      expect(cycleRes.status).toBe(400);
      expect(cycleRes.body.error.code).toBe('CIRCULAR_POSITION_HIERARCHY');

      // Cannot delete Studio Steward while Aarav holds active assignment
      const delRes = await request(app)
        .delete(`/api/v1/clubs/${customClubId}/positions/${stewardPosId}`)
        .set('Cookie', ownerCookie);
      expect(delRes.status).toBe(409);
      expect(delRes.body.error.code).toBe('POSITION_HAS_ACTIVE_HOLDERS');
    });

    it('handles join discovery, join request approval, multi-position capabilities, and strict 403s', async () => {
      // Campus discovery via joinCode
      const discRes = await request(app)
        .get('/api/v1/onboarding/discover?joinCode=CRAFT26')
        .set('Cookie', designerCookie);
      expect(discRes.status).toBe(200);
      expect(discRes.body.data.organizations).toHaveLength(1);
      expect(discRes.body.data.organizations[0].code).toBe('CRAFT');

      // Campus B user cannot join Campus A org
      const crossCampusJoin = await request(app)
        .post(`/api/v1/clubs/${customClubId}/join-requests`)
        .set('Cookie', campusBCookie)
        .send({ message: 'Trying from Beta' });
      expect(crossCampusJoin.status).toBe(403);
      expect(crossCampusJoin.body.error.code).toBe('TENANT_MISMATCH');

      // Designer submits join request and owner approves with Design Lead role
      const reqRes = await request(app)
        .post(`/api/v1/clubs/${customClubId}/join-requests`)
        .set('Cookie', designerCookie)
        .send({ message: 'Would love to lead studio design critiques!' });
      expect(reqRes.status).toBe(201);
      const requestId = reqRes.body.data.joinRequest._id;

      const approveRes = await request(app)
        .post(`/api/v1/clubs/${customClubId}/join-requests/${requestId}/review`)
        .set('Cookie', ownerCookie)
        .send({ decision: 'APPROVED', assignPositionIds: [designLeadPosId] });
      expect(approveRes.status).toBe(200);

      // maxHolders: 1 enforced if attempting to assign another person to Design Lead
      await ClubMembership.create({
        campusId: campusA._id,
        clubId: customClubId,
        userId: studentMember._id,
        status: 'ACTIVE',
      });
      const capErr = await request(app)
        .post(`/api/v1/clubs/${customClubId}/assignments`)
        .set('Cookie', ownerCookie)
        .send({ userId: studentMember._id.toString(), positionId: designLeadPosId });
      expect(capErr.status).toBe(409);
      expect(capErr.body.error.code).toBe('HOLDER_LIMIT_REACHED');

      // Design Lead capabilities test: allowed [events.view, projects.view, knowledge.create]
      const okEvents = await request(app)
        .get(`/api/v1/clubs/${customClubId}/events`)
        .set('Cookie', designerCookie);
      expect(okEvents.status).toBe(200);

      const okKnowledgeCreate = await request(app)
        .post(`/api/v1/clubs/${customClubId}/knowledge`)
        .set('Cookie', designerCookie)
        .send({ title: 'Design System Guide', category: 'SOP', content: 'Brand tokens and components.' });
      expect(okKnowledgeCreate.status).toBe(201);

      // Disallowed endpoints MUST return 403 (even though parent Steward has them and child has decisions.view!)
      const deniedCreateEvent = await request(app)
        .post(`/api/v1/clubs/${customClubId}/events`)
        .set('Cookie', designerCookie)
        .send({
          title: 'Unauthorized Hackathon',
          eventType: 'HACKATHON',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        });
      expect(deniedCreateEvent.status).toBe(403);

      const deniedDecisions = await request(app)
        .get(`/api/v1/clubs/${customClubId}/decisions`)
        .set('Cookie', designerCookie);
      expect(deniedDecisions.status).toBe(403);

      const deniedContacts = await request(app)
        .get(`/api/v1/clubs/${customClubId}/contacts`)
        .set('Cookie', designerCookie);
      expect(deniedContacts.status).toBe(403);

      // Assign second custom position (Playbook Scribe: knowledge.view, knowledge.edit) -> multi-role union!
      const secondAssign = await request(app)
        .post(`/api/v1/clubs/${customClubId}/assignments`)
        .set('Cookie', ownerCookie)
        .send({ userId: studentDesigner._id.toString(), positionId: docsScribePosId });
      expect(secondAssign.status).toBe(201);

      const nowAllowedKnowledgeRead = await request(app)
        .get(`/api/v1/clubs/${customClubId}/knowledge`)
        .set('Cookie', designerCookie);
      expect(nowAllowedKnowledgeRead.status).toBe(200);
    });

    it('immediately blocks suspended members and expired position assignments', async () => {
      // Rohan gets Critique Archivist (decisions.view) with expired effectiveTo date -> should NOT authorize decisions.view
      const expiredAssign = await ClubPositionAssignment.create({
        campusId: campusA._id,
        clubId: customClubId,
        membershipId: (await ClubMembership.findOne({ clubId: customClubId, userId: studentMember._id }))._id,
        userId: studentMember._id,
        positionId: limitedChildPosId,
        academicTermId: termCurrent._id,
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: new Date('2024-12-31'),
        status: 'ACTIVE',
      });
      expect(expiredAssign).toBeTruthy();

      const expiredAccess = await request(app)
        .get(`/api/v1/clubs/${customClubId}/decisions`)
        .set('Cookie', memberCookie);
      expect(expiredAccess.status).toBe(403);

      // Suspend designer -> immediately blocked even from events.view
      const suspRes = await request(app)
        .post(`/api/v1/clubs/${customClubId}/members/${studentDesigner._id}/suspend`)
        .set('Cookie', ownerCookie)
        .send({ reason: 'Temporary leave' });
      expect(suspRes.status).toBe(200);

      const blockedRes = await request(app)
        .get(`/api/v1/clubs/${customClubId}/events`)
        .set('Cookie', designerCookie);
      expect(blockedRes.status).toBe(403);
      expect(blockedRes.body.error.code).toBe('MEMBERSHIP_SUSPENDED');

      // Reinstate designer for downstream tests
      const reinstRes = await request(app)
        .post(`/api/v1/clubs/${customClubId}/members/${studentDesigner._id}/reinstate`)
        .set('Cookie', ownerCookie);
      expect(reinstRes.status).toBe(200);
    });

    it('enforces single-use hashed expiring invitations, recipient validation, and revocation', async () => {
      // Assign Maya fresh unused temp position via invitation
      const inviteRes = await request(app)
        .post(`/api/v1/clubs/${customClubId}/invitations`)
        .set('Cookie', ownerCookie)
        .send({
          email: 'rohan@alpha.edu',
          intendedPositionIds: [limitedChildPosId],
          message: 'Welcome to the archivist team',
        });
      expect(inviteRes.status).toBe(201);
      const rawToken = inviteRes.body.data.inviteToken;
      expect(rawToken).toBeTruthy();

      // DB must store hash, never plaintext token
      const storedInvite = await ClubInvitation.findById(inviteRes.body.data.invitation._id).lean();
      expect(storedInvite.tokenHash).not.toBe(rawToken);

      // Wrong user accepting token -> 403 INVITATION_EMAIL_MISMATCH
      const wrongUserRes = await request(app)
        .post('/api/v1/invitations/accept')
        .set('Cookie', designerCookie)
        .send({ token: rawToken });
      expect(wrongUserRes.status).toBe(403);
      expect(wrongUserRes.body.error.code).toBe('INVITATION_EMAIL_MISMATCH');

      // Intended recipient accepts -> succeeds and grants Critique Archivist
      const okAccept = await request(app)
        .post('/api/v1/invitations/accept')
        .set('Cookie', memberCookie)
        .send({ token: rawToken });
      expect(okAccept.status).toBe(200);
      expect(okAccept.body.data.assignedPositions.some((p) => p._id === limitedChildPosId)).toBe(true);

      // Replay fails -> 409 INVITATION_ALREADY_USED
      const replay = await request(app)
        .post('/api/v1/invitations/accept')
        .set('Cookie', memberCookie)
        .send({ token: rawToken });
      expect(replay.status).toBe(409);

      // Revoked invite fails with 410
      const inv2 = await request(app)
        .post(`/api/v1/clubs/${customClubId}/invitations`)
        .set('Cookie', ownerCookie)
        .send({ email: 'maya@alpha.edu' });
      const tok2 = inv2.body.data.inviteToken;
      await request(app)
        .post(`/api/v1/clubs/${customClubId}/invitations/${inv2.body.data.invitation._id}/revoke`)
        .set('Cookie', ownerCookie);
      const revAttempt = await request(app)
        .post('/api/v1/invitations/accept')
        .set('Cookie', designerCookie)
        .send({ token: tok2 });
      expect(revAttempt.status).toBe(410);
      expect(revAttempt.body.error.code).toBe('INVITATION_REVOKED');
    });

    it('supports position-level handover continuity, historical term preservation, and ownership transfer', async () => {
      // Ensure Maya holds docsScribePosId active before handover
      await request(app)
        .post(`/api/v1/clubs/${customClubId}/assignments`)
        .set('Cookie', ownerCookie)
        .send({ userId: studentDesigner._id.toString(), positionId: docsScribePosId });

      // Initiate position-level handover for Playbook Scribe from Maya to Rohan across terms
      const hInit = await request(app)
        .post(`/api/v1/clubs/${customClubId}/handovers`)
        .set('Cookie', ownerCookie)
        .send({
          outgoingLeaderEmail: 'maya@alpha.edu',
          incomingLeaderEmail: 'rohan@alpha.edu',
          positionId: docsScribePosId,
          fromTermId: termCurrent._id.toString(),
          toTermId: termNext._id.toString(),
        });
      expect(hInit.status).toBe(201);
      const handoverId = hInit.body.data.handover._id;

      // Mark all 8 structured handover sections completed
      const sectionNames = [
        'roleResponsibilities',
        'outstandingTasks',
        'pendingCommitments',
        'futureEventSchedules',
        'importantDocuments',
        'contactsAndPartners',
        'reusablePlaybooks',
        'recommendationsAndAdvice',
      ];
      for (const sectionName of sectionNames) {
        const secRes = await request(app)
          .put(`/api/v1/clubs/${customClubId}/handovers/${handoverId}/section`)
          .set('Cookie', ownerCookie)
          .send({ sectionName, content: `Notes for ${sectionName}`, completed: true });
        expect(secRes.status).toBe(200);
      }

      // Incoming Rohan acknowledges
      const ackRes = await request(app)
        .post(`/api/v1/clubs/${customClubId}/handovers/${handoverId}/acknowledge`)
        .set('Cookie', memberCookie)
        .send({ reviewNotes: 'Reviewed all playbook conventions.' });
      expect(ackRes.status).toBe(200);

      // Owner completes position handover atomically
      const compRes = await request(app)
        .post(`/api/v1/clubs/${customClubId}/handovers/${handoverId}/complete`)
        .set('Cookie', ownerCookie);
      expect(compRes.status).toBe(200);

      // Verify Rohan holds active assignment in termNext, Maya's previous assignment is ENDED (historical preserved!)
      const [rohanAssign, mayaPastAssign] = await Promise.all([
        ClubPositionAssignment.findOne({
          clubId: customClubId,
          userId: studentMember._id,
          positionId: docsScribePosId,
          status: 'ACTIVE',
        }),
        ClubPositionAssignment.findOne({
          clubId: customClubId,
          userId: studentDesigner._id,
          positionId: docsScribePosId,
          status: 'ENDED',
        }),
      ]);
      expect(rohanAssign).toBeTruthy();
      expect(mayaPastAssign).toBeTruthy();

      // Transfer workspace ownership to Rohan
      const transferRes = await request(app)
        .post(`/api/v1/clubs/${customClubId}/transfer-ownership`)
        .set('Cookie', ownerCookie)
        .send({ newOwnerId: studentMember._id.toString() });
      expect(transferRes.status).toBe(200);
      expect(transferRes.body.data.club.workspaceOwnerId).toBe(studentMember._id.toString());
    });

    it('runs legacy membership migration idempotently without duplicating records', async () => {
      const legacyClub = await Club.create({
        campusId: campusA._id,
        name: 'Legacy Robotics Club',
        code: 'LRC',
        category: 'TECHNICAL',
      });
      await Membership.create({
        campusId: campusA._id,
        clubId: legacyClub._id,
        userId: studentOwner._id,
        academicTermId: termCurrent._id,
        clubRole: 'PRESIDENT',
        status: 'ACTIVE',
      });

      const firstRun = await migrateLegacyClub(legacyClub._id);
      expect(firstRun.migratedMembers).toBe(1);
      expect(firstRun.migratedAssignments).toBe(1);

      const secondRun = await migrateLegacyClub(legacyClub._id);
      expect(secondRun.migratedMembers).toBe(0);
      expect(secondRun.migratedAssignments).toBe(0);

      expect(await ClubMembership.countDocuments({ clubId: legacyClub._id })).toBe(1);
      expect(await ClubPositionAssignment.countDocuments({ clubId: legacyClub._id })).toBe(1);
      expect(await ClubPosition.countDocuments({ clubId: legacyClub._id })).toBe(1);
    });
  });

  describe('Campus Policy Overrides', () => {
    it('places student-created clubs into PENDING_REVIEW when campus requires approval and enforces faculty advisor', async () => {
      await Campus.findByIdAndUpdate(campusA._id, {
        $set: {
          'settings.requireFacultyApprovalForNewClubs': true,
          'settings.requireFacultyAdvisorOnClubs': true,
        },
      });

      // Renew Maya's cookie user snapshot with updated campus settings by creating draft without advisor
      const draftRes = await request(app)
        .post('/api/v1/clubs/wizard/draft')
        .set('Cookie', designerCookie)
        .send({
          name: 'Policy Gated Club',
          code: 'POLG',
          category: 'ACADEMIC',
        });
      expect(draftRes.status).toBe(201);
      const gatedId = draftRes.body.data.club._id;

      // Activation fails without facultyCoordinatorId
      const missingAdvisor = await request(app)
        .post(`/api/v1/clubs/${gatedId}/wizard/activate`)
        .set('Cookie', designerCookie)
        .send({});
      expect(missingAdvisor.status).toBe(400);
      expect(missingAdvisor.body.error.code).toBe('FACULTY_ADVISOR_REQUIRED');

      // Assign advisor then activate -> enters PENDING_REVIEW
      await request(app)
        .put(`/api/v1/clubs/${gatedId}/wizard/draft`)
        .set('Cookie', designerCookie)
        .send({ facultyCoordinatorId: facultyUser._id.toString() });

      const pendingRes = await request(app)
        .post(`/api/v1/clubs/${gatedId}/wizard/activate`)
        .set('Cookie', designerCookie)
        .send({});
      expect(pendingRes.status).toBe(200);
      expect(pendingRes.body.data.club.status).toBe('PENDING_REVIEW');

      // Campus Admin still retains governance inspection permission
      const adminStruct = await request(app)
        .get(`/api/v1/clubs/${gatedId}/structure`)
        .set('Cookie', adminCookie);
      expect(adminStruct.status).toBe(200);
    });
  });
});
