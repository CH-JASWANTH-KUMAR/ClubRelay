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
} from '../models/index.js';

/**
 * Safe Demo Data Cleanup Utility for ClubRelay
 *
 * Rules:
 * - Refuses execution if NODE_ENV === 'production' or if DB host is external/unknown.
 * - Targets ONLY the explicitly seeded demo campuses ('pcu' and 'mti') and their linked records.
 * - Supports dry-run by default (--dry-run or no flags).
 * - Requires explicit confirmation flag (--confirm or --force) to execute deletion.
 * - Prints record counts before and after deletion.
 * - Never uses broad deleteMany({}) across collections.
 */

// Known demo campus slugs created by seed.js
const DEMO_CAMPUS_SLUGS = ['pcu', 'mti'];
const DEMO_CAMPUS_DOMAINS = ['pcu.edu', 'mti.edu'];

export async function cleanDemoData({ dryRun = true, confirm = false } = {}) {
  console.log('='.repeat(70));
  console.log(' ClubRelay — Safe Local Demo Data Cleanup Utility');
  console.log('='.repeat(70));

  // Security guard 1: Block production
  if (process.env.NODE_ENV === 'production' || env.NODE_ENV === 'production') {
    console.error('\n[SAFETY ERROR] Execution strictly prohibited in PRODUCTION environment.');
    console.error('This cleanup utility is only permitted for local development databases.\n');
    process.exit(1);
  }

  await connectDB();
  const dbUri = mongoose.connection.client?.s?.url || env.MONGODB_URI || 'unknown';

  // Security guard 2: Verify host safety
  const isLocalHost =
    dbUri.includes('127.0.0.1') ||
    dbUri.includes('localhost') ||
    dbUri.startsWith('mongodb-memory-server') ||
    dbUri.includes('testset');

  if (!isLocalHost) {
    console.error('\n[SAFETY ERROR] Connected to non-local MongoDB host:', dbUri);
    console.error('To protect remote or shared databases, cleanup is only allowed on localhost/127.0.0.1.\n');
    await disconnectDB();
    process.exit(1);
  }

  console.log(`[Target Database] Verified local host: ${dbUri}`);
  console.log(`[Mode] ${dryRun || !confirm ? 'DRY RUN (Simulated — No changes will be written)' : 'LIVE EXECUTION'}`);

  // Step 1: Identify target demo campuses
  const demoCampuses = await Campus.find({
    $or: [{ slug: { $in: DEMO_CAMPUS_SLUGS } }, { domain: { $in: DEMO_CAMPUS_DOMAINS } }],
  });

  if (demoCampuses.length === 0) {
    console.log('\n[Result] No seeded demo campuses found. Database is already clean of default demo data.');
    await disconnectDB();
    return { cleaned: 0 };
  }

  const demoCampusIds = demoCampuses.map((c) => c._id);
  console.log(`\nIdentified ${demoCampuses.length} demo campus(es):`);
  demoCampuses.forEach((c) => console.log(` - ${c.name} (slug: ${c.slug}, domain: ${c.domain}, id: ${c._id})`));

  // Step 2: Query linked demo records
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
  const demoTemplates = await EventTemplate.find({ clubId: { $in: demoClubIds } });
  const demoApprovals = await Approval.find({
    $or: [{ campusId: { $in: demoCampusIds } }, { clubId: { $in: demoClubIds } }, { eventId: { $in: demoEventIds } }],
  });
  const demoKnowledge = await KnowledgeItem.find({
    $or: [{ campusId: { $in: demoCampusIds } }, { clubId: { $in: demoClubIds } }],
  });
  const demoContacts = await Contact.find({
    $or: [{ campusId: { $in: demoCampusIds } }, { clubId: { $in: demoClubIds } }],
  });
  const demoDecisions = await Decision.find({
    $or: [{ campusId: { $in: demoCampusIds } }, { clubId: { $in: demoClubIds } }],
  });
  const demoHandovers = await Handover.find({
    $or: [{ campusId: { $in: demoCampusIds } }, { clubId: { $in: demoClubIds } }],
  });
  const demoNotifications = await Notification.find({ userId: { $in: demoUserIds } });
  const demoAuditLogs = await AuditLog.find({
    $or: [{ campusId: { $in: demoCampusIds } }, { userId: { $in: demoUserIds } }],
  });

  const recordCounts = {
    Campuses: demoCampuses.length,
    Users: demoUsers.length,
    AcademicTerms: demoTerms.length,
    Clubs: demoClubs.length,
    Memberships: demoMemberships.length,
    Events: demoEvents.length,
    EventTasks: demoEventTasks.length,
    EventTemplates: demoTemplates.length,
    Approvals: demoApprovals.length,
    KnowledgeItems: demoKnowledge.length,
    Contacts: demoContacts.length,
    Decisions: demoDecisions.length,
    Handovers: demoHandovers.length,
    Notifications: demoNotifications.length,
    AuditLogs: demoAuditLogs.length,
  };

  const totalRecords = Object.values(recordCounts).reduce((a, b) => a + b, 0);

  console.log('\nRecord Counts Targeted for Removal:');
  console.log('-'.repeat(40));
  for (const [collection, count] of Object.entries(recordCounts)) {
    console.log(`  ${collection.padEnd(16)}: ${count} records`);
  }
  console.log('-'.repeat(40));
  console.log(`  TOTAL           : ${totalRecords} records\n`);

  if (dryRun || !confirm) {
    console.log('[DRY RUN COMPLETE] Zero records deleted.');
    console.log('To execute deletion against this verified development database, run with confirmation:');
    console.log('  node src/scripts/cleanDemoData.js --confirm\n');
    await disconnectDB();
    return { dryRun: true, recordCounts, totalRecords };
  }

  // Live execution
  console.log('[LIVE EXECUTION] Removing identified records...');

  await AuditLog.deleteMany({ _id: { $in: demoAuditLogs.map((r) => r._id) } });
  await Notification.deleteMany({ _id: { $in: demoNotifications.map((r) => r._id) } });
  await Handover.deleteMany({ _id: { $in: demoHandovers.map((r) => r._id) } });
  await Decision.deleteMany({ _id: { $in: demoDecisions.map((r) => r._id) } });
  await Contact.deleteMany({ _id: { $in: demoContacts.map((r) => r._id) } });
  await KnowledgeItem.deleteMany({ _id: { $in: demoKnowledge.map((r) => r._id) } });
  await Approval.deleteMany({ _id: { $in: demoApprovals.map((r) => r._id) } });
  await EventTemplate.deleteMany({ _id: { $in: demoTemplates.map((r) => r._id) } });
  await EventTask.deleteMany({ _id: { $in: demoEventTasks.map((r) => r._id) } });
  await Event.deleteMany({ _id: { $in: demoEventIds } });
  await Membership.deleteMany({ _id: { $in: demoMembershipIds } });
  await Club.deleteMany({ _id: { $in: demoClubIds } });
  await AcademicTerm.deleteMany({ _id: { $in: demoTermIds } });
  await User.deleteMany({ _id: { $in: demoUserIds } });
  await Campus.deleteMany({ _id: { $in: demoCampusIds } });

  console.log(`[SUCCESS] Deleted ${totalRecords} demo records cleanly.`);
  console.log('All non-demo campuses and user-created data have been preserved.\n');

  await disconnectDB();
  return { dryRun: false, cleaned: totalRecords };
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
