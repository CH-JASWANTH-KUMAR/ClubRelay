import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import { env } from './env.js';

let mongod = null;

/**
 * Redacts username and password credentials from MongoDB connection strings.
 */
export function redactConnectionString(str) {
  if (typeof str !== 'string') return str;
  // Match mongodb:// or mongodb+srv:// followed by credentials up to the last @ before the host/path
  return str.replace(/(mongodb(?:\+srv)?:\/\/)[^/\s?]+@/gi, '$1***:***@');
}

export const ATLAS_UNREACHABLE_MESSAGE =
  'Could not reach MongoDB Atlas. Most likely causes: (1) your current IP is not in Atlas Network Access, (2) your network blocks outbound port 27017 (try a phone hotspot), (3) wrong database user or password in MONGODB_URI. No credentials are shown here.';

/**
 * Checks whether a Mongoose/MongoDB error represents a server selection failure.
 */
export function isServerSelectionError(err) {
  if (!err) return false;
  const name = err.name || '';
  const msg = err.message || '';
  return (
    name === 'MongooseServerSelectionError' ||
    name === 'MongoServerSelectionError' ||
    /ServerSelectionError/i.test(name) ||
    /Could not connect to any servers/i.test(msg)
  );
}

/**
 * Sanitizes an error by redacting connection credentials and replacing verbose
 * server selection topology dumps with a clear actionable message.
 */
export function sanitizeError(err) {
  if (!err) return err;
  if (isServerSelectionError(err)) {
    return new Error(ATLAS_UNREACHABLE_MESSAGE);
  }
  if (err instanceof Error) {
    err.message = redactConnectionString(err.message);
    if (err.stack) {
      err.stack = redactConnectionString(err.stack);
    }
    return err;
  }
  if (typeof err === 'string') {
    return redactConnectionString(err);
  }
  return err;
}

/**
 * Helper to retrieve or initialize the serverless mongoose connection cache on globalThis.
 */
export function getCache() {
  if (!globalThis.mongoose) {
    globalThis.mongoose = { conn: null, promise: null };
  }
  return globalThis.mongoose;
}

/**
 * Connect to MongoDB with connection caching for serverless environments.
 * - In development, falls back to an in-memory replica set if MONGODB_URI is not set.
 * - In production, refuses to start without MONGODB_URI.
 * - Caches the connection promise on globalThis to reuse across warm serverless invocations.
 */
export async function connectDB(customUri = null) {
  const cached = getCache();

  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return cached.conn;
  }

  const useMemoryDb =
    (!customUri && env.NODE_ENV === 'test' && process.env.TEST_USE_EXTERNAL_DB !== 'true') ||
    (env.NODE_ENV !== 'production' &&
      (process.env.CLUBRELAY_USE_MEMORY_DB === 'true' ||
        process.env.CLUBRELAY_USE_MEMORY_DB === '1' ||
        env.CLUBRELAY_USE_MEMORY_DB === 'true' ||
        env.CLUBRELAY_USE_MEMORY_DB === '1'));

  let uri = useMemoryDb ? '' : (customUri || env.MONGODB_URI || '').trim();

  if (!uri) {
    if (env.NODE_ENV === 'production') {
      throw new Error(
        '[FATAL DATABASE ERROR] Production environment must configure MONGODB_URI. In-memory database fallback is strictly prohibited in production.'
      );
    }

    if (!mongod) {
      const cacheDir = path.resolve(process.cwd(), '.cache/mongo-mem');
      fs.mkdirSync(cacheDir, { recursive: true });

      mongod = await MongoMemoryReplSet.create({
        replSet: {
          count: 1,
          storageEngine: 'wiredTiger',
        },
        instanceOpts: [
          {
            tmpDir: cacheDir,
          },
        ],
      });
    }
    uri = mongod.getUri();
    console.warn('\n********************************************************************');
    console.warn('[WARNING] Using in-memory database: all data is lost on restart. Set MONGODB_URI for persistence.');
    console.warn('********************************************************************\n');
    console.log(
      '[Database] Active database: Ephemeral local MongoDB Memory Server (replica set). Data will be lost on restart.'
    );
  } else {
    console.log('[Database] Connecting to MongoDB database...');
  }

  const parsedTimeout = Number(process.env.DB_SERVER_SELECTION_TIMEOUT_MS);
  const serverSelectionTimeoutMS =
    Number.isFinite(parsedTimeout) && parsedTimeout > 0
      ? parsedTimeout
      : env.DB_SERVER_SELECTION_TIMEOUT_MS || 15000;

  const opts = {
    serverSelectionTimeoutMS,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
    autoIndex: env.NODE_ENV !== 'production',
  };

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, opts)
      .then((m) => {
        const safeHost = m.connection.host || 'unknown';
        const safeDb = m.connection.name || 'unknown';
        console.log(`[Database] MongoDB connected successfully to host: ${safeHost}, db: ${safeDb}`);
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        const cleanErr = sanitizeError(err);
        if (isServerSelectionError(err)) {
          console.error(`\n[Database Error] ${ATLAS_UNREACHABLE_MESSAGE}\n`);
        }
        throw cleanErr;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw sanitizeError(err);
  }

  return cached.conn;
}

/**
 * Disconnect from MongoDB and reset cache.
 */
export async function disconnectDB() {
  const cached = getCache();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  cached.conn = null;
  cached.promise = null;
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
}
