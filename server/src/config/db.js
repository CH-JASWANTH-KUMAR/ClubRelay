import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

// Cache connection across serverless warm starts
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      if (!mongod) {
        mongod = await MongoMemoryServer.create();
      }
      uri = mongod.getUri();
      console.log(`[Database] Using in-memory MongoDB at: ${uri}`);
    } else {
      console.log(`[Database] Connecting to MongoDB Atlas / cluster...`);
    }

    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log('[Database] MongoDB connected successfully');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function disconnectDB() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
}
