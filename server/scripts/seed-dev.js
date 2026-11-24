import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Campus, User } from '../src/models/index.js';

/**
 * Validates environment safety guards before running dev seeding.
 */
export function validateSeedGuard(options = process.env) {
  const { NODE_ENV, MONGODB_URI, ALLOW_SEED } = options;

  if (NODE_ENV === 'production') {
    throw new Error('[SEED-DEV GUARD] Refusing to seed in production environment (NODE_ENV=production).');
  }

  if (!MONGODB_URI || MONGODB_URI.trim().length === 0) {
    throw new Error('[SEED-DEV GUARD] Refusing to run: MONGODB_URI is missing. Please configure MONGODB_URI.');
  }

  const isLocalhost = MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1');
  if (!isLocalhost && ALLOW_SEED !== '1') {
    throw new Error(
      '[SEED-DEV GUARD] Refusing to run: MONGODB_URI targets a remote host. Set ALLOW_SEED=1 if this is intended.'
    );
  }
}

/**
 * Validates that all required SEED_* variables are present.
 */
export function validateSeedEnv(options = process.env) {
  const required = [
    'SEED_CAMPUS_NAME',
    'SEED_CAMPUS_SLUG',
    'SEED_CAMPUS_DOMAIN',
    'SEED_USER_EMAIL',
    'SEED_USER_FULL_NAME',
    'SEED_USER_PASSWORD',
  ];

  const missing = required.filter((v) => !options[v] || options[v].trim().length === 0);
  if (missing.length > 0) {
    throw new Error(`[SEED-DEV CONFIG] Missing required seed environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Idempotently seeds ONE campus and ONE admin user.
 */
export async function seedDev(options = process.env) {
  validateSeedGuard(options);
  validateSeedEnv(options);

  const {
    SEED_CAMPUS_NAME,
    SEED_CAMPUS_SLUG,
    SEED_CAMPUS_DOMAIN,
    SEED_USER_EMAIL,
    SEED_USER_FULL_NAME,
    SEED_USER_PASSWORD,
    MONGODB_URI,
  } = options;

  // Connect to persistent MongoDB instance
  await mongoose.connect(MONGODB_URI);

  let campusCreated = false;
  let userCreated = false;

  try {
    const slugLower = SEED_CAMPUS_SLUG.trim().toLowerCase();
    const domainLower = SEED_CAMPUS_DOMAIN.trim().toLowerCase();
    const emailLower = SEED_USER_EMAIL.trim().toLowerCase();

    // 1. Idempotent Campus check/create
    let campus = await Campus.findOne({
      $or: [{ slug: slugLower }, { domain: domainLower }],
    });

    if (!campus) {
      campus = await Campus.create({
        name: SEED_CAMPUS_NAME.trim(),
        slug: slugLower,
        domain: domainLower,
        settings: {
          allowSelfRegistration: true,
          requireFacultyApprovalForEvents: true,
          defaultAcademicYear: '2025-2026',
        },
      });
      campusCreated = true;
      console.log('[seed:dev] Created campus.');
    } else {
      console.log('[seed:dev] Campus already exists.');
    }

    // 2. Idempotent User check/create
    let user = await User.findOne({
      campusId: campus._id,
      email: emailLower,
    });

    if (!user) {
      const passwordHash = await User.hashPassword(SEED_USER_PASSWORD);
      user = await User.create({
        campusId: campus._id,
        fullName: SEED_USER_FULL_NAME.trim(),
        email: emailLower,
        passwordHash,
        campusRole: 'CAMPUS_ADMIN',
        isActive: true,
      });
      userCreated = true;
      console.log('[seed:dev] Created admin user.');
    } else {
      console.log('[seed:dev] Admin user already exists.');
    }

    console.log(
      `[seed:dev] Verification complete. (Campus: ${campusCreated ? 'created' : 'already existed'}, Admin User: ${
        userCreated ? 'created' : 'already existed'
      })`
    );

    return { campusCreated, userCreated, campusId: campus._id, userId: user._id };
  } finally {
    await mongoose.disconnect();
  }
}

// CLI entrypoint
if (process.argv[1] && process.argv[1].endsWith('seed-dev.js')) {
  // Load .env from server/ or cwd
  const candidates = [
    path.resolve(process.cwd(), 'server/.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(path.dirname(process.argv[1]), '../.env'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      dotenv.config({ path: candidate });
      break;
    }
  }

  seedDev(process.env)
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
