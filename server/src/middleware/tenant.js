import { Club, Membership } from '../models/index.js';

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

const ROLE_HIERARCHY = {
  GENERAL_MEMBER: 1,
  CORE_TEAM: 2,
  SECRETARY: 3,
  PRESIDENT: 4,
};

/**
 * Enforces club-level role permissions and strict multi-tenant campus boundaries.
 * 
 * Rules:
 * - Campus Admin and Faculty Coordinators do NOT automatically receive President powers.
 * - Campus Admin is granted explicit management access only when allowCampusAdmin is true.
 * - Faculty Coordinators are advisors, not student officers.
 * - Only verified active club members with sufficient rank can perform actions.
 */
export function requireClubRole(minRole = 'GENERAL_MEMBER', options = { allowCampusAdmin: false, allowAssignedFaculty: false }) {
  return async (req, res, next) => {
    try {
      const clubId = req.params.clubId || req.body.clubId;

      if (!clubId) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_CLUB_ID', message: 'Club ID is required.' },
        });
      }

      // First check if club belongs to user's campus
      const club = await Club.findById(clubId);
      if (!club) {
        return res.status(404).json({
          success: false,
          error: { code: 'CLUB_NOT_FOUND', message: 'Club not found.' },
        });
      }

      // Campus isolation check!
      if (club.campusId.toString() !== req.campusId.toString()) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'TENANT_MISMATCH',
            message: 'Access denied: Organization belongs to another campus workspace.',
          },
        });
      }

      // Campus Admin has elevated override for campus governance if permitted
      if (req.user.campusRole === 'CAMPUS_ADMIN') {
        if (options.allowCampusAdmin) {
          req.club = club;
          req.isCampusAdmin = true;
          req.userClubRole = 'CAMPUS_ADMIN';
          return next();
        }
      }

      // Faculty Coordinator has advisor rights if assigned and permitted
      if (
        req.user.campusRole === 'FACULTY_COORDINATOR' &&
        club.facultyCoordinatorId &&
        club.facultyCoordinatorId.toString() === req.user._id.toString()
      ) {
        if (options.allowAssignedFaculty) {
          req.club = club;
          req.isAssignedFaculty = true;
          req.userClubRole = 'FACULTY_COORDINATOR';
          return next();
        }
      }

      // Check student's active membership in this club
      const membership = await Membership.findOne({
        campusId: req.campusId,
        clubId: club._id,
        userId: req.user._id,
        status: 'ACTIVE',
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'NOT_A_MEMBER',
            message: 'You are not an active member of this organization.',
          },
        });
      }

      const userRank = ROLE_HIERARCHY[membership.clubRole] || 0;
      const requiredRank = ROLE_HIERARCHY[minRole] || 0;

      if (userRank < requiredRank) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_CLUB_ROLE',
            message: `Requires ${minRole} privilege or above. General members cannot perform executive actions.`,
          },
        });
      }

      req.club = club;
      req.membership = membership;
      req.userClubRole = membership.clubRole;

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

  if (club.campusId.toString() !== req.campusId.toString()) {
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
