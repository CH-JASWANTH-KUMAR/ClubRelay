import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(5000),
    JWT_SECRET: z
      .string()
      .min(16, 'JWT_SECRET must be at least 16 characters in development/test and 32 in production'),
    MONGODB_URI: z.string().optional(),
    CLIENT_ORIGIN: z.string().optional(),
    ALLOW_SEED_IN_PROD: z.string().optional().default('false'),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CALLBACK_URL: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GITHUB_CALLBACK_URL: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === 'production') {
        return !!data.MONGODB_URI && data.MONGODB_URI.trim().length > 0;
      }
      return true;
    },
    {
      message: 'MONGODB_URI is strictly required when NODE_ENV is "production". In-memory MongoDB is forbidden in production.',
      path: ['MONGODB_URI'],
    }
  )
  .refine(
    (data) => {
      if (data.NODE_ENV === 'production') {
        return !!data.JWT_SECRET && data.JWT_SECRET.length >= 32;
      }
      return true;
    },
    {
      message: 'JWT_SECRET must be at least 32 characters long in production.',
      path: ['JWT_SECRET'],
    }
  )
  .refine(
    (data) => {
      if (data.NODE_ENV === 'production') {
        if (!data.CLIENT_ORIGIN || data.CLIENT_ORIGIN.trim().length === 0) {
          return false;
        }
        const origins = data.CLIENT_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
        if (origins.length === 0) return false;
        return origins.every((o) => !o.includes('localhost') && !o.includes('127.0.0.1'));
      }
      return true;
    },
    {
      message: 'CLIENT_ORIGIN must be explicitly configured with valid non-localhost production origins when NODE_ENV is "production". Localhost origins are restricted to development.',
      path: ['CLIENT_ORIGIN'],
    }
  );

// Safe fallback for dev/test environments only, NEVER in production
const devFallbackSecret =
  process.env.NODE_ENV === 'production'
    ? undefined
    : 'clubrelay_dev_test_secret_key_32_chars_min_length!';

const rawEnv = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '5000',
  JWT_SECRET: process.env.JWT_SECRET || devFallbackSecret,
  MONGODB_URI: process.env.MONGODB_URI,
  CLIENT_ORIGIN:
    process.env.CLIENT_ORIGIN ||
    (process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:5173'),
  ALLOW_SEED_IN_PROD: process.env.ALLOW_SEED_IN_PROD || 'false',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  const errorDetails = parsed.error.issues
    .map((issue) => `[${issue.path.join('.')}]: ${issue.message}`)
    .join('\n  ');
  console.error('[CRITICAL CONFIG ERROR] Startup environment validation failed:\n  ' + errorDetails);
  throw new Error(`Startup environment validation failed:\n  ${errorDetails}`);
}

export const env = parsed.data;

