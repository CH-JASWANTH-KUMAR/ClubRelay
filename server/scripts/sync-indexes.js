import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB, disconnectDB } from '../src/config/db.js';
import * as models from '../src/models/index.js';

// Load local server .env if present
const serverEnvPath = path.resolve(process.cwd(), '.env');
const localServerEnvPath = path.resolve(process.cwd(), 'server/.env');
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else if (fs.existsSync(localServerEnvPath)) {
  dotenv.config({ path: localServerEnvPath });
} else {
  dotenv.config();
}

/**
 * Validates safety guards before synchronizing database indexes.
 * - Refuses execution in production unless ALLOW_INDEX_SYNC=1.
 * - Refuses execution against remote cluster (mongodb+srv) unless ALLOW_INDEX_SYNC=1.
 */
export function validateSyncGuard(options = process.env) {
  const { NODE_ENV, MONGODB_URI, ALLOW_INDEX_SYNC } = options;

  if (NODE_ENV === 'production' && ALLOW_INDEX_SYNC !== '1') {
    throw new Error(
      '[SYNC-INDEXES GUARD] Refusing to sync indexes in production environment without ALLOW_INDEX_SYNC=1.'
    );
  }

  const isRemoteCluster = typeof MONGODB_URI === 'string' && MONGODB_URI.includes('mongodb+srv');
  if (isRemoteCluster && ALLOW_INDEX_SYNC !== '1') {
    throw new Error(
      '[SYNC-INDEXES GUARD] Refusing to sync indexes against remote cluster (mongodb+srv) without ALLOW_INDEX_SYNC=1.'
    );
  }
}

/**
 * Synchronizes schema indexes with MongoDB across all registered models.
 * Prints only model names and index counts.
 */
export async function syncIndexes(options = process.env) {
  validateSyncGuard(options);

  console.log('[Sync Indexes] Connecting to database...');
  await connectDB();

  console.log('[Sync Indexes] Synchronizing indexes across all models...');
  const results = [];

  const modelEntries = Object.entries(models).filter(
    ([, model]) => model && typeof model.syncIndexes === 'function'
  );

  for (const [name, model] of modelEntries) {
    await model.syncIndexes();
    const activeIndexes = await model.collection.indexes();
    const count = activeIndexes.length;
    results.push({ name, count });
    console.log(`[Sync Indexes] ${name}: synced (${count} indexes)`);
  }

  console.log(`[Sync Indexes] Completed successfully. Synced indexes for ${results.length} models.`);
  await disconnectDB();

  return results;
}

if (process.argv[1] && process.argv[1].endsWith('sync-indexes.js')) {
  syncIndexes()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Sync Indexes Fatal Error]:', err.message);
      process.exit(1);
    });
}
