import crypto from 'crypto';
import { z } from 'zod';
import { env } from '../config/env.js';
import { User, Campus, Membership, FederatedIdentity } from '../models/index.js';
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

// Helper: Determine origin and construct client redirect URL
export function getClientRedirectUrl(pathAndQuery = '') {
  const rawOrigin = (env.CLIENT_ORIGIN || '').split(',')[0].trim();
  const origin = rawOrigin || 'http://localhost:5173';
  const cleanPath = pathAndQuery.startsWith('/') ? pathAndQuery : `/${pathAndQuery}`;
  return `${origin}${cleanPath}`;
}

const OAUTH_STATE_COOKIE = 'cr_oauth_state';
const STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 10 * 60 * 1000, // 10 minutes
};
const CLEAR_STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

export function getProviders(req, res) {
  return res.json({
    success: true,
    data: {
      google: {
        enabled: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
      },
      github: {
        enabled: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
      },
    },
  });
}

export function googleAuth(req, res) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'OAUTH_NOT_CONFIGURED',
        message: 'Google authentication is not configured on this server.',
      },
    });
  }

  const state = crypto.randomBytes(24).toString('hex');
  res.cookie(OAUTH_STATE_COOKIE, state, STATE_COOKIE_OPTIONS);

  const redirectUri =
    env.GOOGLE_CALLBACK_URL ||
    `${req.protocol}://${req.get('host')}/api/v1/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
    access_type: 'online',
  });

  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

export async function googleCallback(req, res, next) {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      res.clearCookie(OAUTH_STATE_COOKIE, CLEAR_STATE_COOKIE_OPTIONS);
      return res.redirect(getClientRedirectUrl(`/login?error=${encodeURIComponent(oauthError)}`));
    }

    const savedState = req.cookies[OAUTH_STATE_COOKIE];
    res.clearCookie(OAUTH_STATE_COOKIE, CLEAR_STATE_COOKIE_OPTIONS);

    if (!code || !state || !savedState || state !== savedState) {
      return res.redirect(getClientRedirectUrl('/login?error=invalid_state'));
    }

    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      return res.redirect(getClientRedirectUrl('/login?error=oauth_not_configured'));
    }

    const redirectUri =
      env.GOOGLE_CALLBACK_URL ||
      `${req.protocol}://${req.get('host')}/api/v1/auth/google/callback`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('[Google OAuth] Token exchange failed:', await tokenRes.text());
      return res.redirect(getClientRedirectUrl('/login?error=token_exchange_failed'));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const userInfoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoRes.ok) {
      console.error('[Google OAuth] Userinfo request failed:', await userInfoRes.text());
      return res.redirect(getClientRedirectUrl('/login?error=userinfo_failed'));
    }

    const userInfo = await userInfoRes.json();

    if (!userInfo.email || !userInfo.email_verified) {
      return res.redirect(getClientRedirectUrl('/login?error=unverified_email'));
    }

    return await handleFederatedLogin(req, res, {
      provider: 'GOOGLE',
      providerUserId: String(userInfo.sub),
      email: userInfo.email,
      fullName: userInfo.name || userInfo.given_name || 'Google User',
      avatarUrl: userInfo.picture || '',
    });
  } catch (err) {
    console.error('[Google OAuth Callback Error]:', err);
    return res.redirect(getClientRedirectUrl('/login?error=oauth_failed'));
  }
}

export function githubAuth(req, res) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'OAUTH_NOT_CONFIGURED',
        message: 'GitHub authentication is not configured on this server.',
      },
    });
  }

  const state = crypto.randomBytes(24).toString('hex');
  res.cookie(OAUTH_STATE_COOKIE, state, STATE_COOKIE_OPTIONS);

  const redirectUri =
    env.GITHUB_CALLBACK_URL ||
    `${req.protocol}://${req.get('host')}/api/v1/auth/github/callback`;

  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
    state,
  });

  return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}

export async function githubCallback(req, res, next) {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      res.clearCookie(OAUTH_STATE_COOKIE, CLEAR_STATE_COOKIE_OPTIONS);
      return res.redirect(getClientRedirectUrl(`/login?error=${encodeURIComponent(oauthError)}`));
    }

    const savedState = req.cookies[OAUTH_STATE_COOKIE];
    res.clearCookie(OAUTH_STATE_COOKIE, CLEAR_STATE_COOKIE_OPTIONS);

    if (!code || !state || !savedState || state !== savedState) {
      return res.redirect(getClientRedirectUrl('/login?error=invalid_state'));
    }

    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
      return res.redirect(getClientRedirectUrl('/login?error=oauth_not_configured'));
    }

    const redirectUri =
      env.GITHUB_CALLBACK_URL ||
      `${req.protocol}://${req.get('host')}/api/v1/auth/github/callback`;

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code: String(code),
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      console.error('[GitHub OAuth] Token exchange failed:', await tokenRes.text());
      return res.redirect(getClientRedirectUrl('/login?error=token_exchange_failed'));
    }

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      console.error('[GitHub OAuth] Token response error:', tokenData);
      return res.redirect(getClientRedirectUrl(`/login?error=${encodeURIComponent(tokenData.error)}`));
    }

    const accessToken = tokenData.access_token;

    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'ClubRelay-App',
      },
    });

    if (!userRes.ok) {
      console.error('[GitHub OAuth] User profile fetch failed:', await userRes.text());
      return res.redirect(getClientRedirectUrl('/login?error=userinfo_failed'));
    }

    const gitHubUser = await userRes.json();

    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'ClubRelay-App',
      },
    });

    let verifiedEmail = null;
    if (emailsRes.ok) {
      const emails = await emailsRes.json();
      if (Array.isArray(emails)) {
        const primary = emails.find((e) => e.primary && e.verified);
        if (primary) {
          verifiedEmail = primary.email;
        } else {
          const anyVerified = emails.find((e) => e.verified);
          if (anyVerified) {
            verifiedEmail = anyVerified.email;
          }
        }
      }
    }

    if (!verifiedEmail && gitHubUser.email) {
      verifiedEmail = gitHubUser.email;
    }

    if (!verifiedEmail) {
      return res.redirect(getClientRedirectUrl('/login?error=unverified_email'));
    }

    return await handleFederatedLogin(req, res, {
      provider: 'GITHUB',
      providerUserId: String(gitHubUser.id),
      email: verifiedEmail,
      fullName: gitHubUser.name || gitHubUser.login || 'GitHub User',
      avatarUrl: gitHubUser.avatar_url || '',
    });
  } catch (err) {
    console.error('[GitHub OAuth Callback Error]:', err);
    return res.redirect(getClientRedirectUrl('/login?error=oauth_failed'));
  }
}

export async function handleFederatedLogin(req, res, { provider, providerUserId, email, fullName, avatarUrl }) {
  const normalizedEmail = email.toLowerCase().trim();
  const stringId = String(providerUserId);

  // 1. Check if federated identity exists
  let federated = await FederatedIdentity.findOne({
    provider,
    providerUserId: stringId,
  }).populate('userId');

  let user = federated ? federated.userId : null;

  // 2. If not linked, check existing user by email
  if (!user) {
    const existingUsers = await User.find({ email: normalizedEmail });
    if (existingUsers.length > 0) {
      // Pick existing user
      user = existingUsers[0];
      // Create federated link
      await FederatedIdentity.create({
        userId: user._id,
        provider,
        providerUserId: stringId,
        email: normalizedEmail,
      });
    }
  }

  // 3. If still no user, register a new student user
  if (!user) {
    const emailDomain = normalizedEmail.split('@')[1];

    let campus = null;
    if (emailDomain) {
      campus = await Campus.findOne({ domain: emailDomain.toLowerCase() });
    }

    if (!campus) {
      // Look for any campus allowing self registration
      campus = await Campus.findOne({ 'settings.allowSelfRegistration': { $ne: false } });
    }

    if (!campus) {
      return res.redirect(getClientRedirectUrl('/login?error=no_campus_found'));
    }

    if (campus.settings && campus.settings.allowSelfRegistration === false) {
      return res.redirect(getClientRedirectUrl('/login?error=registration_disabled'));
    }

    // STRICT INVARIANT: OAuth user is always assigned STUDENT role; never elevated
    user = await User.create({
      campusId: campus._id,
      fullName: fullName || 'Student Member',
      email: normalizedEmail,
      campusRole: 'STUDENT',
      avatarUrl: avatarUrl || '',
      isActive: true,
      lastLoginAt: new Date(),
    });

    await FederatedIdentity.create({
      userId: user._id,
      provider,
      providerUserId: stringId,
      email: normalizedEmail,
    });
  }

  if (!user.isActive) {
    return res.redirect(getClientRedirectUrl('/login?error=account_deactivated'));
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user);
  res.cookie('cr_auth_token', token, COOKIE_OPTIONS);

  // Determine redirect landing page based on role and club memberships
  let destination = '/my-work';
  if (user.campusRole === 'CAMPUS_ADMIN') {
    destination = '/campus';
  } else if (user.campusRole === 'FACULTY_COORDINATOR') {
    destination = '/faculty/approvals';
  } else {
    const memberships = await Membership.find({ userId: user._id, status: 'ACTIVE' });
    if (memberships.length > 0 && memberships[0].clubId) {
      destination = `/clubs/${memberships[0].clubId}`;
    }
  }

  return res.redirect(getClientRedirectUrl(destination));
}
