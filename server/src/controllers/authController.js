import { z } from 'zod';
import { env } from '../config/env.js';
import { User, Campus, Membership } from '../models/index.js';
import { generateToken } from '../middleware/auth.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  campusId: z.string(),
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  department: z.string().optional(),
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email: email.toLowerCase() }).populate('campusId');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user);

    // Set secure HttpOnly cookie
    res.cookie('cr_auth_token', token, COOKIE_OPTIONS);

    const memberships = await Membership.find({
      userId: user._id,
      status: 'ACTIVE',
    }).populate('clubId');

    const userObj = user.toObject();
    delete userObj.passwordHash;
    userObj.memberships = memberships;

    // Production hardening: Token is transported exclusively in HttpOnly cookie
    return res.json({
      success: true,
      data: {
        user: userObj,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);

    const campus = await Campus.findById(data.campusId);
    if (!campus) {
      return res.status(404).json({
        success: false,
        error: { code: 'CAMPUS_NOT_FOUND', message: 'Selected campus was not found.' },
      });
    }

    // Enforce campus registration policy
    if (campus.settings && campus.settings.allowSelfRegistration === false) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'REGISTRATION_DISABLED',
          message: 'Self-registration is disabled for this campus. Please contact your campus administrator.',
        },
      });
    }

    // Verify campus email domain rule
    const emailLower = data.email.toLowerCase();
    const emailDomain = emailLower.split('@')[1];
    if (campus.domain && emailDomain !== campus.domain.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CAMPUS_DOMAIN',
          message: `Email must belong to the campus domain (@${campus.domain}).`,
        },
      });
    }

    const existingUser = await User.findOne({
      campusId: campus._id,
      email: emailLower,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'A user with this email already exists on this campus.' },
      });
    }

    const passwordHash = await User.hashPassword(data.password);

    const user = await User.create({
      campusId: campus._id,
      fullName: data.fullName,
      email: emailLower,
      passwordHash,
      department: data.department || '',
      campusRole: 'STUDENT',
    });

    const token = generateToken(user);

    res.cookie('cr_auth_token', token, COOKIE_OPTIONS);

    const userObj = user.toObject();
    delete userObj.passwordHash;
    userObj.memberships = [];

    return res.status(201).json({
      success: true,
      data: {
        user: userObj,
      },
    });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  res.clearCookie('cr_auth_token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export async function getCurrentUser(req, res, next) {
  try {
    const userObj = req.user.toObject();
    delete userObj.passwordHash;

    const memberships = await Membership.find({
      userId: req.user._id,
      status: 'ACTIVE',
    }).populate('clubId');

    userObj.memberships = memberships;

    return res.json({
      success: true,
      data: {
        user: userObj,
      },
    });
  } catch (err) {
    next(err);
  }
}
