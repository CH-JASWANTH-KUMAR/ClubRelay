import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import { env } from './env.js';

let mongod = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  let uri = env.MONGODB_URI;

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
    console.log(`[Database] Using isolated in-memory replica set MongoDB at: ${uri}`);
  } else {
    console.log(`[Database] Connecting to MongoDB Atlas cluster...`);
  }

  const opts = {
    serverSelectionTimeoutMS: 5000,
    autoIndex: env.NODE_ENV !== 'production',
  };

  await mongoose.connect(uri, opts);
  console.log('[Database] MongoDB connected successfully');
  return mongoose.connection;
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
}
