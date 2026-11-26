import {
  Club,
  Membership,
  ClubPosition,
  ClubMembership,
  ClubPositionAssignment,
} from '../models/index.js';
import {
  LEGACY_ROLE_PERMISSIONS,
  LEGACY_ROLE_DISPLAY,
} from '../constants/permissions.js';

/**
 * Idempotently migrates legacy Membership records for a single club into
 * ClubMembership, starter legacy-equivalent ClubPositions (only for roles actually present
 * on this legacy club), and ClubPositionAssignments.
 *
 * Safe to run multiple times without creating duplicate records or removing historical data.
 */
export async function migrateLegacyClub(clubId) {
  const club = await Club.findById(clubId);
  if (!club) return null;

  const memberships = await Membership.find({ clubId: club._id }).sort({ createdAt: 1 });
  if (memberships.length === 0) {
    return { clubId: club._id, migratedMembers: 0, migratedAssignments: 0 };
  }

  const positionCache = new Map();
  let migratedMembers = 0;
  let migratedAssignments = 0;

  async function ensureLegacyPosition(roleKey) {
    if (positionCache.has(roleKey)) return positionCache.get(roleKey);
    const meta = LEGACY_ROLE_DISPLAY[roleKey] || LEGACY_ROLE_DISPLAY.GENERAL_MEMBER;
    const perms = LEGACY_ROLE_PERMISSIONS[roleKey] || LEGACY_ROLE_PERMISSIONS.GENERAL_MEMBER;

    let pos = await ClubPosition.findOne({ clubId: club._id, slug: meta.slug });
    if (!pos) {
      pos = await ClubPosition.create({
        campusId: club.campusId || null,
        clubId: club._id,
        name: meta.name,
        slug: meta.slug,
        description: meta.description,
        parentPositionId: null,
        isLeadership: meta.isLeadership,
        maxHolders: meta.maxHolders,
        permissions: perms,
        sortOrder: meta.sortOrder,
        isActive: true,
      });
    }
    positionCache.set(roleKey, pos);
    return pos;
  }

  // Ensure workspaceOwnerId points to an active PRESIDENT if unset
  if (!club.workspaceOwnerId) {
    const activePresident = memberships.find((m) => m.clubRole === 'PRESIDENT' && m.status === 'ACTIVE');
    const fallbackLeader = memberships.find((m) => m.status === 'ACTIVE');
    const chosen = activePresident || fallbackLeader;
    if (chosen) {
      club.workspaceOwnerId = chosen.userId;
      await club.save();
    }
  }

  for (const legacy of memberships) {
    const mappedStatus =
      legacy.status === 'ACTIVE'
        ? 'ACTIVE'
        : legacy.status === 'INVITED'
        ? 'INVITED'
        : legacy.status === 'REVOKED'
        ? 'SUSPENDED'
        : 'LEFT';

    let clubMembership = await ClubMembership.findOne({
      clubId: club._id,
      userId: legacy.userId,
    });

    if (!clubMembership) {
      clubMembership = await ClubMembership.create({
        campusId: club.campusId || null,
        clubId: club._id,
        userId: legacy.userId,
        status: mappedStatus,
        joinedAt: legacy.joinedAt || legacy.createdAt || new Date(),
        legacyRole: legacy.clubRole,
      });
      migratedMembers++;
    } else if (mappedStatus === 'ACTIVE' && clubMembership.status !== 'ACTIVE' && !clubMembership.suspendedAt) {
      clubMembership.status = 'ACTIVE';
      await clubMembership.save();
    }

    const pos = await ensureLegacyPosition(legacy.clubRole);
    const assignmentStatus = legacy.status === 'ACTIVE' ? 'ACTIVE' : legacy.status === 'REVOKED' ? 'REVOKED' : 'ENDED';

    const existingAssignment = await ClubPositionAssignment.findOne({
      clubId: club._id,
      userId: legacy.userId,
      positionId: pos._id,
      academicTermId: legacy.academicTermId || null,
    });

    if (!existingAssignment) {
      await ClubPositionAssignment.create({
        campusId: club.campusId || null,
        clubId: club._id,
        membershipId: clubMembership._id,
        userId: legacy.userId,
        positionId: pos._id,
        academicTermId: legacy.academicTermId || null,
        effectiveFrom: legacy.joinedAt || legacy.createdAt || new Date(),
        effectiveTo: assignmentStatus === 'ACTIVE' ? null : legacy.updatedAt || new Date(),
        status: assignmentStatus,
        endedReason: assignmentStatus === 'ACTIVE' ? '' : 'Migrated historical tenure',
      });
      migratedAssignments++;
    }
  }

  return {
    clubId: club._id,
    migratedMembers,
    migratedAssignments,
  };
}

export async function migrateAllLegacyClubs() {
  const clubs = await Club.find({}).select('_id');
  const results = [];
  for (const c of clubs) {
    const r = await migrateLegacyClub(c._id);
    if (r) results.push(r);
  }
  return results;
}

