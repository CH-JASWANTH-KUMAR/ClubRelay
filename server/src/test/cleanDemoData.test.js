import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  Campus,
  User,
  Club,
  Event,
  Attachment,
  FederatedIdentity,
  AuditLog,
  AcademicTerm,
} from '../models/index.js';
import { cleanDemoData } from '../scripts/cleanDemoData.js';
import { env } from '../config/env.js';

describe('Clean Demo Data Utility Suite', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // Clean all collections before each test
    await AuditLog.deleteMany({});
    await Attachment.deleteMany({});
    await FederatedIdentity.deleteMany({});
    await Event.deleteMany({});
    await Club.deleteMany({});
    await User.deleteMany({});
    await AcademicTerm.deleteMany({});
    await Campus.deleteMany({});
  });

  it('operates in dry-run mode by default and does not delete any records', async () => {
    const demoCampus = await Campus.create({
      name: 'Pacific Coast University',
      slug: 'pcu',
      domain: 'pcu.edu',
    });

    const demoUser = await User.create({
      campusId: demoCampus._id,
      fullName: 'Demo Student',
      email: 'student@pcu.edu',
      campusRole: 'STUDENT',
    });

    const demoClub = await Club.create({
      campusId: demoCampus._id,
      name: 'Google Developer Group',
      code: 'GDG-PCU',
      slug: 'gdg-pcu',
      category: 'TECHNICAL',
      facultyAdvisor: { name: 'Dr. Advisor', email: 'advisor@pcu.edu' },
    });

    const demoAttachment = await Attachment.create({
      campusId: demoCampus._id,
      clubId: demoClub._id,
      uploaderId: demoUser._id,
      fileName: 'test.pdf',
      originalName: 'test.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      fileUrl: 'https://example.com/test.pdf',
      fileKey: 'uploads/test.pdf',
      relatedType: 'EVENT',
      relatedId: demoClub._id,
    });

    const demoFederated = await FederatedIdentity.create({
      userId: demoUser._id,
      provider: 'GOOGLE',
      providerUserId: 'google-sub-demo-1',
      email: 'student@pcu.edu',
    });

    const demoAudit = await AuditLog.create({
      campusId: demoCampus._id,
      clubId: demoClub._id,
      actorId: demoUser._id,
      action: 'DEMO_ACTION',
      targetType: 'User',
      targetId: demoUser._id,
    });

    const result = await cleanDemoData({
      dryRun: true,
      confirm: false,
      isTest: true,
      skipDisconnect: true,
    });

    expect(result.dryRun).toBe(true);
    expect(result.cleaned).toBe(0);

    // Verify all records still exist
    expect(await Campus.countDocuments({ _id: demoCampus._id })).toBe(1);
    expect(await User.countDocuments({ _id: demoUser._id })).toBe(1);
    expect(await Club.countDocuments({ _id: demoClub._id })).toBe(1);
    expect(await Attachment.countDocuments({ _id: demoAttachment._id })).toBe(1);
    expect(await FederatedIdentity.countDocuments({ _id: demoFederated._id })).toBe(1);
    expect(await AuditLog.countDocuments({ _id: demoAudit._id })).toBe(1);
  });

  it('refuses execution when NODE_ENV is production', async () => {
    const originalEnv = process.env.NODE_ENV;
    const originalConfigEnv = env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      env.NODE_ENV = 'production';

      await expect(
        cleanDemoData({
          dryRun: false,
          confirm: true,
          isTest: true,
          skipDisconnect: true,
        })
      ).rejects.toThrow(/Execution strictly prohibited when NODE_ENV is "production"/);
    } finally {
      process.env.NODE_ENV = originalEnv;
      env.NODE_ENV = originalConfigEnv;
    }
  });

  it('refuses execution when connected to a remote or non-local database host', async () => {
    const originalUrl = mongoose.connection.client?.s?.url;
    try {
      if (!mongoose.connection.client) mongoose.connection.client = {};
      if (!mongoose.connection.client.s) mongoose.connection.client.s = {};
      mongoose.connection.client.s.url = 'mongodb+srv://prod-cluster.mongodb.net/production-db';

      await expect(
        cleanDemoData({
          dryRun: true,
          confirm: false,
          isTest: true,
          skipDisconnect: true,
        })
      ).rejects.toThrow(/Connected to non-local or unknown MongoDB host/);
    } finally {
      if (mongoose.connection.client?.s) {
        mongoose.connection.client.s.url = originalUrl;
      }
    }
  });

  it('queries AuditLog using actorId (not non-existent userId)', async () => {
    const demoCampus = await Campus.create({
      name: 'Pacific Coast University',
      slug: 'pcu',
      domain: 'pcu.edu',
    });

    const demoUser = await User.create({
      campusId: demoCampus._id,
      fullName: 'Actor User',
      email: 'actor@pcu.edu',
      campusRole: 'STUDENT',
    });

    const audit = await AuditLog.create({
      campusId: demoCampus._id,
      actorId: demoUser._id, // uses actorId
      action: 'TEST_ACTOR_AUDIT',
      targetType: 'User',
      targetId: demoUser._id,
    });

    const result = await cleanDemoData({
      dryRun: true,
      confirm: false,
      isTest: true,
      skipDisconnect: true,
    });

    const auditSummary = result.recordSummary.find((r) => r.name === 'AuditLogs');
    expect(auditSummary).toBeTruthy();
    expect(auditSummary.count).toBe(1);
    expect(auditSummary.sample).toContain(String(audit._id));
  });

  it('executes live deletion with confirmation and preserves non-demo campus data', async () => {
    // 1. Seed non-demo campus (must be preserved!)
    const realCampus = await Campus.create({
      name: 'Real University of Washington',
      slug: 'uw-real',
      domain: 'uw.edu',
    });

    const realUser = await User.create({
      campusId: realCampus._id,
      fullName: 'Real Student',
      email: 'student@uw.edu',
      campusRole: 'STUDENT',
    });

    const realClub = await Club.create({
      campusId: realCampus._id,
      name: 'Husky Coding Society',
      code: 'HCS',
      slug: 'husky-coding',
      category: 'TECHNICAL',
      facultyAdvisor: { name: 'Dr. Real', email: 'real@uw.edu' },
    });

    // 2. Seed demo campus (target for cleanup)
    const demoCampus = await Campus.create({
      name: 'Pacific Coast University',
      slug: 'pcu',
      domain: 'pcu.edu',
    });

    const demoUser = await User.create({
      campusId: demoCampus._id,
      fullName: 'Demo Student',
      email: 'student@pcu.edu',
      campusRole: 'STUDENT',
    });

    const demoClub = await Club.create({
      campusId: demoCampus._id,
      name: 'GDG Demo',
      code: 'GDG-DEMO',
      slug: 'gdg-demo',
      category: 'TECHNICAL',
      facultyAdvisor: { name: 'Dr. Demo', email: 'demo@pcu.edu' },
    });

    const demoAttachment = await Attachment.create({
      campusId: demoCampus._id,
      clubId: demoClub._id,
      uploaderId: demoUser._id,
      fileName: 'demo.pdf',
      originalName: 'demo.pdf',
      fileSize: 2048,
      mimeType: 'application/pdf',
      fileUrl: 'https://example.com/demo.pdf',
      fileKey: 'uploads/demo.pdf',
      relatedType: 'EVENT',
      relatedId: demoClub._id,
    });

    const demoFederated = await FederatedIdentity.create({
      userId: demoUser._id,
      provider: 'GITHUB',
      providerUserId: 'gh-demo-999',
      email: 'student@pcu.edu',
    });

    const demoAudit = await AuditLog.create({
      campusId: demoCampus._id,
      actorId: demoUser._id,
      action: 'DEMO_LOGIN',
      targetType: 'User',
      targetId: demoUser._id,
    });

    // 3. Execute Live Cleanup
    const result = await cleanDemoData({
      dryRun: false,
      confirm: true,
      isTest: true,
      skipDisconnect: true,
    });

    expect(result.dryRun).toBe(false);
    expect(result.cleaned).toBeGreaterThan(0);

    // 4. Verify Demo Records are DELETED
    expect(await Campus.countDocuments({ _id: demoCampus._id })).toBe(0);
    expect(await User.countDocuments({ _id: demoUser._id })).toBe(0);
    expect(await Club.countDocuments({ _id: demoClub._id })).toBe(0);
    expect(await Attachment.countDocuments({ _id: demoAttachment._id })).toBe(0);
    expect(await FederatedIdentity.countDocuments({ _id: demoFederated._id })).toBe(0);
    expect(await AuditLog.countDocuments({ _id: demoAudit._id })).toBe(0);

    // 5. Verify Non-Demo Records are 100% PRESERVED
    expect(await Campus.countDocuments({ _id: realCampus._id })).toBe(1);
    expect(await User.countDocuments({ _id: realUser._id })).toBe(1);
    expect(await Club.countDocuments({ _id: realClub._id })).toBe(1);

    const savedRealUser = await User.findById(realUser._id);
    expect(savedRealUser.email).toBe('student@uw.edu');
    expect(savedRealUser.campusId.toString()).toBe(realCampus._id.toString());
  });
});
