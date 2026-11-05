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

export function requireClubRole(minRole = 'GENERAL_MEMBER') {
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

      // Campus Admin has elevated override for management
      if (req.user.campusRole === 'CAMPUS_ADMIN') {
        req.club = club;
        req.userClubRole = 'PRESIDENT';
        return next();
      }

      // Faculty Coordinator assigned to this club has override
      if (
        req.user.campusRole === 'FACULTY_COORDINATOR' &&
        club.facultyCoordinatorId &&
        club.facultyCoordinatorId.toString() === req.user._id.toString()
      ) {
        req.club = club;
        req.userClubRole = 'PRESIDENT';
        return next();
      }

      // Check student's membership in this club
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
            message: `Requires ${minRole} privilege or above.`,
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
