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

/**
 * Sanitizes an error by redacting connection credentials from its message and stack trace.
 */
export function sanitizeError(err) {
  if (!err) return err;
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

  let uri = customUri || env.MONGODB_URI;

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
    console.log('[Database] Using isolated in-memory replica set MongoDB');
  } else {
    console.log('[Database] Connecting to MongoDB database...');
  }

  const opts = {
    serverSelectionTimeoutMS: 8000,
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
        throw sanitizeError(err);
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
