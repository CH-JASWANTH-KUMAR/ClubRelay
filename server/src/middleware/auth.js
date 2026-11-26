import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/index.js';
import { buildEnrichedUserMemberships } from '../services/rbacService.js';

const JWT_SECRET = env.JWT_SECRET;

export async function requireAuth(req, res, next) {
  try {
    let token = req.cookies?.cr_auth_token;

    // Bearer token fallback for programmatic/test API clients
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required to access this resource.',
        },
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('campusId');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'User session invalid or user inactive.',
        },
      });
    }

    // Attach user and campus to request
    req.user = user;
    req.campusId = user.campusId?._id || user.campusId || null;

    // Load enriched memberships (combining custom position assignments & legacy records)
    const { memberships, draftClubs, pendingInvitationsCount } = await buildEnrichedUserMemberships(user);
    req.user.memberships = memberships;
    req.draftClubs = draftClubs;
    req.pendingInvitationsCount = pendingInvitationsCount;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Your session has expired. Please sign in again.',
        },
      });
    }
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token.',
      },
    });
  }
}

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      campusId: user.campusId?._id || user.campusId || null,
      campusRole: user.campusRole,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
