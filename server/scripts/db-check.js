import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load server/.env if present without modifying process overrides
const serverEnvPath = path.resolve(process.cwd(), '.env');
const workspaceServerEnvPath = path.resolve(process.cwd(), 'server/.env');
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else if (fs.existsSync(workspaceServerEnvPath)) {
  dotenv.config({ path: workspaceServerEnvPath });
} else {
  dotenv.config();
}

/**
 * Classifies a database connection error into one of the four safe categories:
 * - "auth failure"
 * - "DNS"
 * - "timeout/network or allowlist"
 * - "other"
 */
export function classifyDbError(err) {
  if (!err) return 'other';

  const code = err.code;
  const name = String(err.name || '');
  const message = String(err.message || '');
  const causeMsg = String(err.cause?.message || '');
  const combined = `${name} ${message} ${causeMsg}`;

  if (
    code === 18 ||
    code === 8000 ||
    /AuthenticationFailed|Authentication failed|bad auth|SASL|SCRAM/i.test(combined)
  ) {
    return 'auth failure';
  }

  if (
    code === 'ENOTFOUND' ||
    code === 'ESERVFAIL' ||
    code === 'ENODATA' ||
    /querySrv|ENOTFOUND|getaddrinfo|DNS/i.test(combined)
  ) {
    return 'DNS';
  }

  if (
    name === 'MongooseServerSelectionError' ||
    name === 'MongoServerSelectionError' ||
    /ServerSelectionError|Could not reach MongoDB Atlas|Could not connect to any servers|timed out|timeout|ECONNREFUSED|ECONNRESET|ETIMEDOUT|TLSV1_ALERT|SSL|allowlist|whitelist/i.test(
      combined
    )
  ) {
    return 'timeout/network or allowlist';
  }

  return 'other';
}

/**
 * Runs a read-only connection check against MONGODB_URI using configured timeout.
 * Prints ONLY CONNECTED + host + db, or FAILED + classified cause.
 * Never logs URIs, credentials, or TopologyDescription dumps.
 */
export async function runDbCheck(options = process.env) {
  const uri = (options.MONGODB_URI || '').trim();
  if (!uri) {
    console.log('FAILED cause=other (MONGODB_URI is not set)');
    return { ok: false, cause: 'other' };
  }

  const parsedTimeout = Number(options.DB_SERVER_SELECTION_TIMEOUT_MS);
  const serverSelectionTimeoutMS =
    Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 15000;

  try {
    const conn = await mongoose
      .createConnection(uri, {
        serverSelectionTimeoutMS,
        socketTimeoutMS: 10000,
        maxPoolSize: 2,
      })
      .asPromise();

    const safeHost = conn.host || 'unknown';
    const safeDb = conn.name || 'unknown';
    await conn.close();

    console.log(`CONNECTED host=${safeHost} db=${safeDb}`);
    return { ok: true, host: safeHost, db: safeDb };
  } catch (err) {
    const cause = classifyDbError(err);
    console.log(`FAILED cause=${cause}`);
    return { ok: false, cause };
  }
}

if (process.argv[1] && process.argv[1].endsWith('db-check.js')) {
  runDbCheck()
    .then((result) => {
      process.exit(result.ok ? 0 : 1);
    })
    .catch(() => {
      console.log('FAILED cause=other');
      process.exit(1);
    });
}
