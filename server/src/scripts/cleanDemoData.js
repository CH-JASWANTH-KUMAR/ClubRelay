import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import {
  Campus,
  User,
  AcademicTerm,
  Club,
  Membership,
  Event,
  EventTask,
  EventTemplate,
  Approval,
  KnowledgeItem,
  Contact,
  Decision,
  Handover,
  Notification,
  AuditLog,
  Attachment,
  FederatedIdentity,
} from '../models/index.js';

/**
 * Safe Demo Data Cleanup Utility for ClubRelay
 *
 * Requirements & Invariants:
 * 1. Operates in dry-run mode by default (--dry-run or no flags).
 * 2. Refuses execution if NODE_ENV === 'production'.
 * 3. Refuses execution if connected to remote, unknown, or production database host.
 * 4. Displays targeted campuses, detailed record counts, and sample record identifiers.
 * 5. Explicitly warns that deleting a demo campus deletes all user-created records within that campus.
 * 6. Requires a verified backup notice and explicit confirmation (--confirm) for live execution.
 * 7. Incorporates Attachment and FederatedIdentity records.
 * 8. Queries AuditLog using actorId (never non-existent userId).
 * 9. Uses a MongoDB transaction when supported by the deployment, rolling back on failure.
 * 10. Deletes records in strict dependency order to prevent orphaned records.
 */

export const DEMO_CAMPUS_SLUGS = ['pcu', 'mti'];
export const DEMO_CAMPUS_DOMAINS = ['pcu.edu', 'mti.edu'];

export async function cleanDemoData({
  dryRun = true,
  confirm = false,
  skipDisconnect = false,
  isTest = false,
} = {}) {
  console.log('='.repeat(72));
  console.log(' ClubRelay: Safe Local Demo Data Cleanup Utility');
  console.log('='.repeat(72));

  // Security Guard 1: Refuse production execution
  if (process.env.NODE_ENV === 'production' || env.NODE_ENV === 'production') {
    const errorMsg = '[SAFETY ERROR] Execution strictly prohibited when NODE_ENV is "production".';
    console.error(`\n${errorMsg}\n`);
    if (isTest) throw new Error(errorMsg);
    process.exit(1);
  }

  // Connect to DB if not already connected
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  const dbUri = mongoose.connection.client?.s?.url || env.MONGODB_URI || 'unknown';

  // Security Guard 2: Verify database host safety
  const isLocalHost =
    dbUri.includes('127.0.0.1') ||
    dbUri.includes('localhost') ||
    dbUri.startsWith('mongodb-memory-server') ||
    dbUri.includes('testset');

  if (!isLocalHost) {
    const errorMsg = `[SAFETY ERROR] Connected to non-local or unknown MongoDB host: ${dbUri}. Cleanup is strictly restricted to local development environments.`;
    console.error(`\n${errorMsg}\n`);
    if (!skipDisconnect) await disconnectDB();
    if (isTest) throw new Error(errorMsg);
    process.exit(1);
  }

  console.log(`[Target Database] Verified local host: ${dbUri}`);
  console.log(`[Mode] ${dryRun || !confirm ? 'DRY RUN (Simulated: No database records will be modified)' : 'LIVE EXECUTION (Destructive Deletion)'}`);

  // Step 1: Identify target demo campuses
  const demoCampuses = await Campus.find({
    $or: [{ slug: { $in: DEMO_CAMPUS_SLUGS } }, { domain: { $in: DEMO_CAMPUS_DOMAINS } }],
  });

  if (demoCampuses.length === 0) {
    console.log('\n[Result] No seeded demo campuses found. Database contains zero default demo records.');
    if (!skipDisconnect) await disconnectDB();
    return { cleaned: 0, dryRun };
  }

  const demoCampusIds = demoCampuses.map((c) => c._id);
  console.log(`\nIdentified ${demoCampuses.length} demo campus(es):`);
  demoCampuses.forEach((c) => console.log(` - ${c.name} (slug: ${c.slug}, domain: ${c.domain}, ID: ${c._id})`));

  console.log('\n[IMPACT WARNING] Deleting a demo campus permanently deletes all records linked to it, including all user-created events, handovers, and memberships within that campus.');
  console.log('[BACKUP REQUIREMENT] A verified full database backup must be created and verified before proceeding with live execution.\n');

  // Step 2: Query all linked demo records in dependency order
  const demoUsers = await User.find({ campusId: { $in: demoCampusIds } });
  const demoUserIds = demoUsers.map((u) => u._id);

  const demoTerms = await AcademicTerm.find({ campusId: { $in: demoCampusIds } });
  const demoTermIds = demoTerms.map((t) => t._id);

  const demoClubs = await Club.find({ campusId: { $in: demoCampusIds } });
  const demoClubIds = demoClubs.map((c) => c._id);

  const demoMemberships = await Membership.find({
    $or: [{ campusId: { $in: demoCampusIds } }, { clubId: { $in: demoClubIds } }],
  });
  const demoMembershipIds = demoMemberships.map((m) => m._id);

  const demoEvents = await Event.find({
    $or: [{ campusId: { $in: demoCampusIds } }, { clubId: { $in: demoClubIds } }],
  });
  const demoEventIds = demoEvents.map((e) => e._id);

  const demoEventTasks = await EventTask.find({
    $or: [{ clubId: { $in: demoClubIds } }, { eventId: { $in: demoEventIds } }],
  });
  const demoEventTaskIds = demoEventTasks.map((t) => t._id);

  const demoTemplates = await EventTemplate.find({ clubId: { $in: demoClubIds } });
  const demoTemplateIds = demoTemplates.map((t) => t._id);

  const demoApprovals = await Approval.find({
    $or: [{ campusId: { $in: demoCampusIds } }, { clubId: { $in: demoClubIds } }, { eventId: { $in: demoEventIds } }],
  });
  const demoApprovalIds = demoApprovals.map((a) => a._id);

  const demoKnowledge = await KnowledgeItem.find({
    $or: [{ campusId: { $in: demoCampusIds } }, { clubId: { $in: demoClubIds } }],
  });
  const demoKnowledgeIds = demoKnowledge.map((k) => k._id);

  const demoContacts = await Contact.find({
    $or: [{ campusId: { $in: demoCampusIds } }, { clubId: { $in: demoClubIds } }],
  });
  const demoContactIds = demoContacts.map((c) => c._id);

  const demoDecisions = await Decision.find({
    $or: [{ campusId: { $in: demoCampusIds } }, { clubId: { $in: demoClubIds } }],
  });
  const demoDecisionIds = demoDecisions.map((d) => d._id);

  const demoHandovers = await Handover.find({
    $or: [{ campusId: { $in: demoCampusIds } }, { clubId: { $in: demoClubIds } }],
  });
  const demoHandoverIds = demoHandovers.map((h) => h._id);

  const demoNotifications = await Notification.find({ userId: { $in: demoUserIds } });
  const demoNotificationIds = demoNotifications.map((n) => n._id);

  // Correct AuditLog query using actorId
  const demoAuditLogs = await AuditLog.find({
    $or: [{ campusId: { $in: demoCampusIds } }, { clubId: { $in: demoClubIds } }, { actorId: { $in: demoUserIds } }],
  });
  const demoAuditLogIds = demoAuditLogs.map((a) => a._id);

  // FederatedIdentity records associated with demo users
  const demoFederated = await FederatedIdentity.find({ userId: { $in: demoUserIds } });
  const demoFederatedIds = demoFederated.map((f) => f._id);

  // Attachment records associated with demo campus, clubs, or uploaders
  const demoAttachments = await Attachment.find({
    $or: [{ campusId: { $in: demoCampusIds } }, { clubId: { $in: demoClubIds } }, { uploaderId: { $in: demoUserIds } }],
  });
  const demoAttachmentIds = demoAttachments.map((a) => a._id);

  const sampleFormat = (docs) => docs.slice(0, 3).map((d) => String(d._id)).join(', ');

  const recordSummary = [
    { name: 'Campuses', count: demoCampuses.length, sample: sampleFormat(demoCampuses) },
    { name: 'Users', count: demoUsers.length, sample: sampleFormat(demoUsers) },
    { name: 'FederatedIdentity', count: demoFederated.length, sample: sampleFormat(demoFederated) },
    { name: 'AcademicTerms', count: demoTerms.length, sample: sampleFormat(demoTerms) },
    { name: 'Clubs', count: demoClubs.length, sample: sampleFormat(demoClubs) },
    { name: 'Memberships', count: demoMemberships.length, sample: sampleFormat(demoMemberships) },
    { name: 'Events', count: demoEvents.length, sample: sampleFormat(demoEvents) },
    { name: 'EventTasks', count: demoEventTasks.length, sample: sampleFormat(demoEventTasks) },
    { name: 'EventTemplates', count: demoTemplates.length, sample: sampleFormat(demoTemplates) },
    { name: 'Approvals', count: demoApprovals.length, sample: sampleFormat(demoApprovals) },
    { name: 'KnowledgeItems', count: demoKnowledge.length, sample: sampleFormat(demoKnowledge) },
    { name: 'Contacts', count: demoContacts.length, sample: sampleFormat(demoContacts) },
    { name: 'Decisions', count: demoDecisions.length, sample: sampleFormat(demoDecisions) },
    { name: 'Handovers', count: demoHandovers.length, sample: sampleFormat(demoHandovers) },
    { name: 'Notifications', count: demoNotifications.length, sample: sampleFormat(demoNotifications) },
    { name: 'AuditLogs', count: demoAuditLogs.length, sample: sampleFormat(demoAuditLogs) },
    { name: 'Attachments', count: demoAttachments.length, sample: sampleFormat(demoAttachments) },
  ];

  const totalRecords = recordSummary.reduce((acc, curr) => acc + curr.count, 0);

  console.log('Record Counts & Sample Identifiers:');
  console.log('-'.repeat(72));
  recordSummary.forEach((r) => {
    const sampleText = r.sample ? ` (Sample: ${r.sample})` : '';
    console.log(`  ${r.name.padEnd(18)}: ${String(r.count).padStart(4)} records${sampleText}`);
  });
  console.log('-'.repeat(72));
  console.log(`  TOTAL IDENTIFIED  : ${String(totalRecords).padStart(4)} records\n`);

  if (dryRun || !confirm) {
    console.log('[DRY RUN COMPLETE] Zero records deleted.');
    console.log('To execute live deletion against this verified development database, run with confirmation:');
    console.log('  node src/scripts/cleanDemoData.js --confirm\n');
    if (!skipDisconnect) await disconnectDB();
    return { dryRun: true, recordSummary, totalRecords, cleaned: 0 };
  }

  // Live Destructive Execution using Transaction (when replica set supported)
  console.log('[LIVE EXECUTION] Commencing atomic deletion of identified demo records...');

  let session = null;
  try {
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // Delete in strict reverse dependency order to preserve referential integrity
      await AuditLog.deleteMany({ _id: { $in: demoAuditLogIds } }, { session });
      await Notification.deleteMany({ _id: { $in: demoNotificationIds } }, { session });
      await Attachment.deleteMany({ _id: { $in: demoAttachmentIds } }, { session });
      await FederatedIdentity.deleteMany({ _id: { $in: demoFederatedIds } }, { session });
      await Handover.deleteMany({ _id: { $in: demoHandoverIds } }, { session });
      await Decision.deleteMany({ _id: { $in: demoDecisionIds } }, { session });
      await Contact.deleteMany({ _id: { $in: demoContactIds } }, { session });
      await KnowledgeItem.deleteMany({ _id: { $in: demoKnowledgeIds } }, { session });
      await Approval.deleteMany({ _id: { $in: demoApprovalIds } }, { session });
      await EventTemplate.deleteMany({ _id: { $in: demoTemplateIds } }, { session });
      await EventTask.deleteMany({ _id: { $in: demoEventTaskIds } }, { session });
      await Event.deleteMany({ _id: { $in: demoEventIds } }, { session });
      await Membership.deleteMany({ _id: { $in: demoMembershipIds } }, { session });
      await Club.deleteMany({ _id: { $in: demoClubIds } }, { session });
      await AcademicTerm.deleteMany({ _id: { $in: demoTermIds } }, { session });
      await User.deleteMany({ _id: { $in: demoUserIds } }, { session });
      await Campus.deleteMany({ _id: { $in: demoCampusIds } }, { session });
    });
  } catch (err) {
    console.error('[CLEANUP TRANSACTION FAILED] Transaction aborted and rolled back. Zero records deleted.', err);
    if (!skipDisconnect) await disconnectDB();
    throw err;
  } finally {
    if (session) {
      await session.endSession();
    }
  }

  console.log(`\n[CLEANUP SUCCESSFUL] Successfully removed ${totalRecords} demo records.`);
  console.log('All non-demo campuses and production/user workspaces remain intact.\n');

  if (!skipDisconnect) await disconnectDB();
  return { dryRun: false, recordSummary, totalRecords, cleaned: totalRecords };
}

// Direct CLI invocation
if (process.argv[1]?.endsWith('cleanDemoData.js')) {
  const isConfirm = process.argv.includes('--confirm') || process.argv.includes('--force');
  const isDryRun = process.argv.includes('--dry-run') || !isConfirm;

  cleanDemoData({ dryRun: isDryRun, confirm: isConfirm }).catch((err) => {
    console.error('[CLEAN ERROR]', err);
    process.exit(1);
  });
}
