import crypto from 'crypto';
import mongoose from 'mongoose';
import {
  Club,
  ClubMembership,
  ClubPosition,
  ClubPositionAssignment,
  ClubInvitation,
  Membership,
} from '../models/index.js';
import {
  ALL_PERMISSIONS,
  LEGACY_ROLE_PERMISSIONS,
  normalizePermissions,
} from '../constants/permissions.js';

export function hashInvitationToken(rawToken) {
  return crypto.createHash('sha256').update(String(rawToken)).digest('hex');
}

export function generateRawToken() {
  return crypto.randomBytes(32).toString('hex');
}

const OWNER_BASE_PERMISSIONS = [
  'club.view_overview',
  'club.manage_settings',
  'club.manage_structure',
  'club.manage_terms',
  'club.transfer_ownership',
  'members.view',
  'members.view_sensitive',
  'members.invite',
  'members.approve_requests',
  'members.manage',
  'members.assign_positions',
  'handover.view',
  'handover.manage_all',
  'handover.approve',
];

const CAMPUS_ADMIN_PERMISSIONS = [
  'club.view_overview',
  'club.manage_settings',
  'club.manage_structure',
  'club.manage_terms',
  'club.transfer_ownership',
  'members.view',
  'members.view_sensitive',
  'members.invite',
  'members.approve_requests',
  'members.manage',
  'members.assign_positions',
  'events.view',
  'events.create',
  'events.edit',
  'events.delete',
  'events.submit_for_approval',
  'events.approve_internal',
  'projects.view',
  'projects.create',
  'projects.edit',
  'projects.assign_tasks',
  'tasks.view',
  'tasks.manage',
  'knowledge.view',
  'knowledge.create',
  'knowledge.edit',
  'knowledge.delete',
  'contacts.view',
  'contacts.create',
  'contacts.edit',
  'decisions.view',
  'decisions.record',
  'announcements.view',
  'announcements.publish',
  'reports.view',
  'reports.export',
  'handover.view',
  'handover.manage_all',
  'handover.approve',
];

const FACULTY_ADVISORY_PERMISSIONS = [
  'club.view_overview',
  'members.view',
  'events.view',
  'projects.view',
  'tasks.view',
  'knowledge.view',
  'contacts.view',
  'decisions.view',
  'announcements.view',
  'reports.view',
  'handover.view',
];

function deriveLegacyEquivalent(capabilities, isWorkspaceOwner, legacyRole) {
  if (legacyRole) return legacyRole;
  if (isWorkspaceOwner || capabilities.has('club.manage_structure')) return 'PRESIDENT';
  if (capabilities.has('members.manage') || capabilities.has('decisions.record')) return 'SECRETARY';
  if (capabilities.has('events.create') || capabilities.has('projects.create') || capabilities.has('knowledge.create')) {
    return 'CORE_TEAM';
  }
  if (capabilities.has('club.view_overview')) return 'GENERAL_MEMBER';
  return null;
}

/**
 * Resolves full multi-tenant & capability access for a user within a club.
 *
 * Security invariants:
 * - Campus tenant boundaries cannot be crossed.
 * - Suspended or left ClubMembership immediately blocks all capabilities.
 * - Parent/child positions NEVER inherit or leak permissions automatically.
 * - Multiple position assignments union explicitly assigned permissions.
 * - Expired position assignments (by effectiveTo date) are ignored.
 */
export async function resolveClubAccess(user, clubOrId, options = {}) {
  if (!user) {
    return { allowed: false, reason: 'UNAUTHORIZED', capabilities: new Set(), capabilitiesList: [] };
  }

  let club = clubOrId;
  if (!club || typeof club === 'string' || club instanceof mongoose.Types.ObjectId) {
    club = await Club.findById(clubOrId);
  }

  if (!club) {
    return { allowed: false, reason: 'CLUB_NOT_FOUND', capabilities: new Set(), capabilitiesList: [] };
  }

  const userCampusId = user.campusId?._id?.toString() || user.campusId?.toString() || null;
  const clubCampusId = club.campusId?._id?.toString() || club.campusId?.toString() || null;

  // Strict multi-tenant isolation:
  // If club belongs to a campus, user from another campus NEVER gets access.
  if (clubCampusId && userCampusId && clubCampusId !== userCampusId) {
    return {
      club,
      allowed: false,
      tenantMismatch: true,
      reason: 'TENANT_MISMATCH',
      capabilities: new Set(),
      capabilitiesList: [],
    };
  }

  // If club belongs to a campus and user has no campus at all, block campus admin/faculty claims
  // and check explicit membership below (standalone/personal user invited explicitly could join if campus policy permits).
  const sameCampus = (!clubCampusId && !userCampusId) || (clubCampusId && userCampusId && clubCampusId === userCampusId);

  const isCampusAdmin = Boolean(sameCampus && clubCampusId && user.campusRole === 'CAMPUS_ADMIN');
  const isAssignedFaculty = Boolean(
    sameCampus &&
      clubCampusId &&
      user.campusRole === 'FACULTY_COORDINATOR' &&
      club.facultyCoordinatorId &&
      (club.facultyCoordinatorId._id || club.facultyCoordinatorId).toString() === user._id.toString()
  );

  const isWorkspaceOwner = Boolean(
    club.workspaceOwnerId &&
      (club.workspaceOwnerId._id || club.workspaceOwnerId).toString() === user._id.toString()
  );

  // Fetch new ClubMembership and legacy Membership
  const [clubMembership, legacyMembership] = await Promise.all([
    ClubMembership.findOne({ clubId: club._id, userId: user._id }),
    Membership.findOne({
      clubId: club._id,
      userId: user._id,
      status: 'ACTIVE',
    }).sort({ createdAt: -1 }),
  ]);

  if (clubMembership && (clubMembership.status === 'SUSPENDED' || clubMembership.status === 'LEFT')) {
    // Unless user has Campus Admin override with allowCampusAdmin
    if (!(isCampusAdmin && options.allowCampusAdmin)) {
      return {
        club,
        allowed: false,
        suspended: clubMembership.status === 'SUSPENDED',
        notMember: true,
        clubMembership,
        reason: clubMembership.status === 'SUSPENDED' ? 'MEMBERSHIP_SUSPENDED' : 'NOT_A_MEMBER',
        capabilities: new Set(),
        capabilitiesList: [],
      };
    }
  }

  const hasActiveClubMembership = Boolean(clubMembership && clubMembership.status === 'ACTIVE');
  const hasActiveLegacyMembership = Boolean(
    legacyMembership && legacyMembership.status === 'ACTIVE' && (!clubMembership || clubMembership.status === 'ACTIVE')
  );
  const isActiveMember = hasActiveClubMembership || hasActiveLegacyMembership;

  // A campusless user cannot view another campus's organization unless actively a member or owner
  if (clubCampusId && !userCampusId && !isActiveMember && !isWorkspaceOwner) {
    return {
      club,
      allowed: false,
      tenantMismatch: true,
      reason: 'TENANT_MISMATCH',
      capabilities: new Set(),
      capabilitiesList: [],
    };
  }

  // An independent org (clubCampusId === null) rejects users from unrelated workspaces unless active member or owner
  if (!clubCampusId && !isActiveMember && !isWorkspaceOwner) {
    return {
      club,
      allowed: false,
      notMember: true,
      reason: 'NOT_A_MEMBER',
      capabilities: new Set(),
      capabilitiesList: [],
    };
  }

  const now = new Date();
  let activeAssignments = [];
  if (isActiveMember || isWorkspaceOwner) {
    const rawAssignments = await ClubPositionAssignment.find({
      clubId: club._id,
      userId: user._id,
      status: 'ACTIVE',
    })
      .populate('positionId')
      .sort({ createdAt: 1 });

    activeAssignments = rawAssignments.filter((a) => {
      if (!a.positionId || a.positionId.isActive === false) return false;
      if (a.effectiveFrom && new Date(a.effectiveFrom) > now) return false;
      if (a.effectiveTo && new Date(a.effectiveTo) < now) return false;
      if (
        club.activeTermId &&
        a.academicTermId &&
        a.academicTermId.toString() !== club.activeTermId.toString()
      ) {
        return false;
      }
      return true;
    });
  }

  const capabilities = new Set();

  if (isActiveMember) {
    if (activeAssignments.length > 0) {
      // Explicit position-driven capabilities: base overview + union of assigned position capabilities.
      // Parent hierarchy never implicitly adds capabilities.
      capabilities.add('club.view_overview');
      for (const assignment of activeAssignments) {
        for (const perm of assignment.positionId.permissions || []) {
          capabilities.add(perm);
        }
      }
    } else if (hasActiveLegacyMembership && legacyMembership.clubRole && club.structureMode !== 'CUSTOM') {
      // Unmigrated legacy role fallback
      const legacyPerms = LEGACY_ROLE_PERMISSIONS[legacyMembership.clubRole] || LEGACY_ROLE_PERMISSIONS.GENERAL_MEMBER;
      for (const perm of legacyPerms) capabilities.add(perm);
    } else {
      // Active general member without explicit positions uses club's configured default member permissions
      const defaults = Array.isArray(club.defaultMemberPermissions)
        ? normalizePermissions(club.defaultMemberPermissions)
        : LEGACY_ROLE_PERMISSIONS.GENERAL_MEMBER;
      for (const perm of defaults) capabilities.add(perm);
      capabilities.add('club.view_overview');
    }
  }

  if (isWorkspaceOwner) {
    for (const perm of OWNER_BASE_PERMISSIONS) {
      capabilities.add(perm);
    }
    // Note: if creator created a brand new club and hasn't assigned themselves a specific operational position yet,
    // allow full creator stewardship when they hold no position or in draft mode
    if (club.status === 'DRAFT' || activeAssignments.length === 0) {
      for (const perm of ALL_PERMISSIONS) {
        capabilities.add(perm);
      }
    }
  }

  if (isCampusAdmin && options.allowCampusAdmin) {
    for (const perm of CAMPUS_ADMIN_PERMISSIONS) {
      capabilities.add(perm);
    }
  }

  if (isAssignedFaculty && options.allowAssignedFaculty) {
    for (const perm of FACULTY_ADVISORY_PERMISSIONS) {
      capabilities.add(perm);
    }
  }

  const canEnterClub =
    isActiveMember ||
    isWorkspaceOwner ||
    Boolean(isCampusAdmin && options.allowCampusAdmin) ||
    Boolean(isAssignedFaculty && options.allowAssignedFaculty);

  const positions = activeAssignments.map((a) => ({
    assignmentId: a._id,
    positionId: a.positionId._id,
    name: a.positionId.name,
    slug: a.positionId.slug,
    isLeadership: Boolean(a.positionId.isLeadership),
    departmentId: a.positionId.departmentId || null,
    parentPositionId: a.positionId.parentPositionId || null,
    academicTermId: a.academicTermId || null,
    termLabel: a.termLabel || '',
    permissions: a.positionId.permissions || [],
  }));

  const legacyRoleEquivalent = deriveLegacyEquivalent(
    capabilities,
    isWorkspaceOwner,
    legacyMembership?.clubRole || null
  );

  return {
    club,
    allowed: canEnterClub,
    reason: canEnterClub ? null : 'NOT_A_MEMBER',
    tenantMismatch: false,
    notMember: !isActiveMember && !isWorkspaceOwner,
    isCampusAdmin,
    isAssignedFaculty,
    isWorkspaceOwner,
    isActiveMember,
    clubMembership,
    legacyMembership,
    assignments: activeAssignments,
    positions,
    capabilities,
    capabilitiesList: Array.from(capabilities),
    legacyRoleEquivalent,
  };
}

/**
 * Prevents cycles when setting parentPositionId on a position inside a club.
 */
export async function wouldCreatePositionCycle(clubId, positionId, candidateParentId) {
  if (!candidateParentId) return false;
  if (positionId && positionId.toString() === candidateParentId.toString()) {
    return true;
  }

  const allPositions = await ClubPosition.find({ clubId }).select('_id parentPositionId').lean();
  const parentMap = new Map(
    allPositions.map((p) => [p._id.toString(), p.parentPositionId ? p.parentPositionId.toString() : null])
  );

  const targetIdStr = positionId ? positionId.toString() : null;
  let current = candidateParentId.toString();
  const visited = new Set();

  while (current) {
    if (targetIdStr && current === targetIdStr) {
      return true;
    }
    if (visited.has(current)) {
      return true;
    }
    visited.add(current);
    current = parentMap.get(current) || null;
  }

  return false;
}

/**
 * Loads deduplicated active memberships across ClubMembership and legacy Membership,
 * enriched with position titles, capabilities, and draft/pending invitation metadata.
 */
export async function buildEnrichedUserMemberships(user) {
  const [clubMemberships, legacyMemberships, blockedDocs, ownedDraftClubs, pendingInvitesCount] =
    await Promise.all([
      ClubMembership.find({ userId: user._id, status: 'ACTIVE' })
        .populate({
          path: 'clubId',
          populate: { path: 'activeTermId', select: 'name startDate endDate isCurrent' },
        })
        .sort({ createdAt: 1 }),
      Membership.find({ userId: user._id, status: 'ACTIVE' })
        .populate({
          path: 'clubId',
          populate: { path: 'activeTermId', select: 'name startDate endDate isCurrent' },
        })
        .sort({ createdAt: 1 }),
      ClubMembership.find({ userId: user._id, status: { $in: ['SUSPENDED', 'LEFT'] } })
        .select('clubId')
        .lean(),
      Club.find({ workspaceOwnerId: user._id, status: { $in: ['DRAFT', 'PENDING_REVIEW'] } })
        .select('_id name code category status setupStep templateKey campusId updatedAt')
        .sort({ updatedAt: -1 })
        .lean(),
      user.email
        ? ClubInvitation.countDocuments({
            email: user.email.toLowerCase(),
            status: 'PENDING',
            expiresAt: { $gt: new Date() },
          })
        : 0,
    ]);

  const blockedClubIds = new Set(blockedDocs.map((m) => m.clubId.toString()));
  const byClubId = new Map();

  for (const cm of clubMemberships) {
    if (!cm.clubId) continue;
    const cid = cm.clubId._id.toString();
    byClubId.set(cid, { clubDoc: cm.clubId, clubMembership: cm, legacyMembership: null });
  }

  for (const lm of legacyMemberships) {
    if (!lm.clubId) continue;
    const cid = lm.clubId._id.toString();
    if (blockedClubIds.has(cid)) continue;
    const existing = byClubId.get(cid);
    if (existing) {
      existing.legacyMembership = lm;
    } else {
      byClubId.set(cid, { clubDoc: lm.clubId, clubMembership: null, legacyMembership: lm });
    }
  }

  const memberships = [];
  for (const entry of byClubId.values()) {
    if (entry.clubDoc.status === 'DRAFT' || entry.clubDoc.status === 'INACTIVE') {
      continue;
    }
    const access = await resolveClubAccess(user, entry.clubDoc, {
      allowCampusAdmin: true,
      allowAssignedFaculty: true,
    });
    if (!access.allowed) continue;

    memberships.push({
      _id: entry.clubMembership?._id || entry.legacyMembership?._id,
      clubId: entry.clubDoc,
      clubRole: entry.legacyMembership?.clubRole || access.legacyRoleEquivalent || 'GENERAL_MEMBER',
      status: 'ACTIVE',
      isWorkspaceOwner: access.isWorkspaceOwner,
      capabilities: access.capabilitiesList,
      positions: access.positions,
      membershipId: entry.clubMembership?._id || null,
    });
  }

  return {
    memberships,
    draftClubs: ownedDraftClubs,
    pendingInvitationsCount: pendingInvitesCount,
  };
}
