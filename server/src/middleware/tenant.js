import { Club, Membership } from '../models/index.js';
import { resolveClubAccess } from '../services/rbacService.js';

export function requireCampusRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    if (!allowedRoles.includes(req.user.campusRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_CAMPUS_ROLE',
          message: 'You do not have the required campus permissions for this action.',
        },
      });
    }

    next();
  };
}

const ROLE_MINIMUM_PERMISSION = {
  GENERAL_MEMBER: ['club.view_overview'],
  CORE_TEAM: [
    'events.create',
    'events.edit',
    'projects.create',
    'projects.edit',
    'tasks.manage',
    'knowledge.create',
    'knowledge.edit',
    'contacts.create',
    'contacts.edit',
    'handover.manage_own',
  ],
  SECRETARY: ['members.invite', 'members.manage', 'decisions.record', 'handover.manage_all'],
  PRESIDENT: ['club.manage_settings', 'club.manage_structure', 'club.transfer_ownership', 'handover.approve'],
};

const ROLE_HIERARCHY = {
  GENERAL_MEMBER: 1,
  CORE_TEAM: 2,
  SECRETARY: 3,
  PRESIDENT: 4,
};

function attachAccessContext(req, access) {
  req.club = access.club;
  req.clubAccess = access;
  req.membership = access.legacyMembership || access.clubMembership || null;
  req.clubMembership = access.clubMembership || null;
  req.userCapabilities = access.capabilities;
  req.isCampusAdmin = access.isCampusAdmin;
  req.isAssignedFaculty = access.isAssignedFaculty;
  req.isWorkspaceOwner = access.isWorkspaceOwner;
  if (access.isCampusAdmin) {
    req.userClubRole = 'CAMPUS_ADMIN';
  } else if (access.isAssignedFaculty) {
    req.userClubRole = 'FACULTY_COORDINATOR';
  } else {
    req.userClubRole = access.legacyRoleEquivalent || 'GENERAL_MEMBER';
  }
}

/**
 * Capability-based middleware enforcing strict multi-tenant boundaries and
 * explicit organization permissions.
 *
 * Accepts a capability string or array of capabilities. By default succeeds
 * if the user has AT LEAST ONE required capability (or set options.requireAll = true).
 */
export function requireClubPermission(requiredPermissions = [], options = { allowCampusAdmin: true, allowAssignedFaculty: false, requireAll: false }) {
  const perms = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

  return async (req, res, next) => {
    try {
      const clubId = req.params.clubId || req.body?.clubId;
      if (!clubId) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_CLUB_ID', message: 'Club ID is required.' },
        });
      }

      const access = await resolveClubAccess(req.user, clubId, options);
      if (!access.club) {
        return res.status(404).json({
          success: false,
          error: { code: 'CLUB_NOT_FOUND', message: 'Club not found.' },
        });
      }

      if (access.tenantMismatch) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'TENANT_MISMATCH',
            message: 'Access denied: Organization belongs to another campus workspace.',
          },
        });
      }

      if (access.suspended) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'MEMBERSHIP_SUSPENDED',
            message: 'Your membership in this organization is suspended.',
          },
        });
      }

      if (!access.allowed) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'NOT_A_MEMBER',
            message: 'You are not an active member of this organization.',
          },
        });
      }

      if (perms.length > 0) {
        const hasPerm = options.requireAll
          ? perms.every((p) => access.capabilities.has(p))
          : perms.some((p) => access.capabilities.has(p));

        if (!hasPerm) {
          return res.status(403).json({
            success: false,
            error: {
              code: options.errorCode || 'INSUFFICIENT_PERMISSION',
              message: 'You do not have the required capability in this organization.',
            },
          });
        }
      }

      attachAccessContext(req, access);
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireClubMember(options = { allowCampusAdmin: true, allowAssignedFaculty: true }) {
  return requireClubPermission(['club.view_overview'], options);
}

/**
 * Legacy-compatible middleware wrapper backed by resolveClubAccess.
 * Enforces:
 * - Campus isolation
 * - Active membership (blocks SUSPENDED / LEFT / non-members)
 * - Position-based capabilities OR legacy Membership rank
 */
export function requireClubRole(minRole = 'GENERAL_MEMBER', options = { allowCampusAdmin: false, allowAssignedFaculty: false }) {
  return async (req, res, next) => {
    try {
      const clubId = req.params.clubId || req.body?.clubId;
      if (!clubId) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_CLUB_ID', message: 'Club ID is required.' },
        });
      }

      const access = await resolveClubAccess(req.user, clubId, options);

      if (!access.club) {
        return res.status(404).json({
          success: false,
          error: { code: 'CLUB_NOT_FOUND', message: 'Club not found.' },
        });
      }

      if (access.tenantMismatch) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'TENANT_MISMATCH',
            message: 'Access denied: Organization belongs to another campus workspace.',
          },
        });
      }

      if (access.isCampusAdmin && options.allowCampusAdmin) {
        attachAccessContext(req, access);
        return next();
      }

      if (access.isAssignedFaculty && options.allowAssignedFaculty) {
        attachAccessContext(req, access);
        return next();
      }

      if (access.suspended) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'MEMBERSHIP_SUSPENDED',
            message: 'Your membership in this organization is suspended.',
          },
        });
      }

      if (!access.allowed || !access.isActiveMember) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'NOT_A_MEMBER',
            message: 'You are not an active member of this organization.',
          },
        });
      }

      const requiredRank = ROLE_HIERARCHY[minRole] || 0;
      const legacyRank = access.legacyMembership
        ? ROLE_HIERARCHY[access.legacyMembership.clubRole] || 0
        : 0;
      const derivedRank = ROLE_HIERARCHY[access.legacyRoleEquivalent] || 0;

      // In CUSTOM position mode, explicit capability match or equivalent rank determines privilege.
      const neededCaps = ROLE_MINIMUM_PERMISSION[minRole] || ['club.view_overview'];
      const hasCustomCap = neededCaps.some((cap) => access.capabilities.has(cap));

      const hasRank =
        access.assignments.length > 0
          ? hasCustomCap || access.isWorkspaceOwner
          : Math.max(legacyRank, derivedRank) >= requiredRank || hasCustomCap;

      if (!hasRank) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_CLUB_ROLE',
            message: `Requires ${minRole} privilege or corresponding organization capability.`,
          },
        });
      }

      attachAccessContext(req, access);
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Enforces that reviewer is either Campus Admin (campus-wide authority)
 * or the assigned Faculty Coordinator for this specific club.
 */
export async function verifyFacultyReviewerForClub(req, clubId) {
  const club = await Club.findById(clubId);
  if (!club) return { allowed: false, reason: 'CLUB_NOT_FOUND' };

  if (!req.campusId || !club.campusId || club.campusId.toString() !== req.campusId.toString()) {
    return { allowed: false, reason: 'TENANT_MISMATCH' };
  }

  if (req.user.campusRole === 'CAMPUS_ADMIN') {
    return { allowed: true, club };
  }

  if (
    req.user.campusRole === 'FACULTY_COORDINATOR' &&
    club.facultyCoordinatorId &&
    club.facultyCoordinatorId.toString() === req.user._id.toString()
  ) {
    return { allowed: true, club };
  }

  return { allowed: false, reason: 'NOT_ASSIGNED_FACULTY_COORDINATOR' };
}
