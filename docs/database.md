# MongoDB Atlas Operations & Security Guide

This document outlines the architecture, security practices, backup routines, and operational procedures for running ClubRelay with MongoDB Atlas.

---

## 1. Environment & Cluster Isolation

To prevent accidental data loss and protect institutional user data, **development and production environments must remain strictly isolated**.

- **Separate Clusters / Projects**: Development and production must not share the same Atlas cluster. Production should run on its own designated Atlas cluster (or dedicated project).
- **Dedicated Database Users**: Each environment must use a distinct database user account with unique credentials. Never use the same database user in development and production.
- **Principle of Least Privilege**:
  - The production database user should only have `readWrite` privileges scoped to the application database (e.g. `clubrelay_prod`).
  - Do not assign `atlasAdmin` or administrative roles to the application connection user.
- **Script Safety Guards**:
  - All automated seeding scripts (`npm run seed`, `npm run seed:dev`, `npm run clean-demo`) are programmed to strictly refuse execution when `NODE_ENV === 'production'`.
  - Remote Atlas clusters (`mongodb+srv://`) require explicit environment overrides (`ALLOW_SEED=1`, `ALLOW_INDEX_SYNC=1`, `ALLOW_CLEAN_DEMO=1`) to prevent accidental destruction or modification of remote environments.

---

## 2. Zero-Downtime Database Password Rotation

When rotating database credentials in production, perform a dual-user rotation to prevent application downtime:

1. **Create New User**: In MongoDB Atlas, go to **Security > Database Access > Add New Database User**.
   - Set Authentication Method to **Password**.
   - Generate a strong, secure random password (minimum 32 characters).
   - Assign the **Built-in Role** `readWrite` on the production database.
   - Name the user e.g. `clubrelay-app-v2`.
2. **Update Application Environment**:
   - In your deployment dashboard (e.g. Vercel Project Settings > Environment Variables), update `MONGODB_URI` with the new credentials:
     ```
     mongodb+srv://clubrelay-app-v2:<new_password>@<cluster>.mongodb.net/clubrelay_prod?retryWrites=true&w=majority
     ```
   - Redeploy or trigger a rolling deployment so new runtime instances connect using the new credentials.
3. **Verify Application Health**:
   - Query the health check endpoint:
     ```bash
     curl -s https://<your-domain>/api/v1/health
     # Expected response: {"ok":true,"db":"up"}
     ```
4. **Remove Old User**:
   - Once all server instances and background tasks have rolled over and are healthy, return to **Database Access** in Atlas and delete the previous user (`clubrelay-app-v1`).

---

## 3. Atlas Free Tier (M0 Sandbox) Operational Limits

If operating on the Atlas Free Tier (M0 Sandbox) for evaluation or staging, be mindful of the following platform constraints:

- **Storage Limit**: 512 MB total data storage. If usage exceeds 512 MB, the cluster is automatically locked to read-only operations until storage is freed.
- **Connection Limits**: M0 Sandbox clusters support up to 500 concurrent connections. The ClubRelay backend configures a conservative `maxPoolSize: 10` per serverless instance to prevent connection starvation.
- **No Automated Continuous Backups**: Free tier clusters do **not** support continuous cloud backups or Point-In-Time Recovery (PITR).
- **Idle Sleep**: Shared tier clusters may introduce minor cold start latency if unaccessed for prolonged periods.
- **Recommendation**: Always perform a manual backup (`mongodump`) prior to any major schema change, index synchronization, or release deployment.

---

## 4. Manual Backup Routine (`mongodump`)

Before executing database maintenance or index synchronization against remote databases, generate a timestamped local backup:

```bash
# Create timestamped backup directory
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups/${TIMESTAMP}"
mkdir -p "${BACKUP_DIR}"

# Run mongodump using Atlas connection URI
mongodump --uri="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>" \
  --out="${BACKUP_DIR}" \
  --gzip
```

Verify that the output directory contains the BSON and metadata JSON files for all collections (`campuses`, `users`, `memberships`, `clubs`, etc.).

---

## 5. Database Restore Routine (`mongorestore`)

To restore database state from a gzip-compressed backup:

```bash
# Target specific backup directory
BACKUP_DIR="./backups/<TIMESTAMP>/<database>"

# Execute mongorestore
# WARNING: --drop removes existing collections before restoring!
mongorestore --uri="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>" \
  --drop \
  --gzip \
  --dir="${BACKUP_DIR}"
```

> [!CAUTION]
> The `--drop` flag deletes collections before restoring data. Use only during disaster recovery or controlled staging resets.

---

## 6. Vercel Serverless IP Allowlist (`0.0.0.0/0`)

Vercel functions execute in dynamic, multi-tenant AWS Lambda environments without static outbound IP addresses.

### Configuration in Atlas:
1. In MongoDB Atlas, navigate to **Security > Network Access**.
2. Click **Add IP Address**.
3. Select **Allow Access From Anywhere** (`0.0.0.0/0`).
4. Set the comment to `Vercel Serverless Functions`.

### Mandatory Security Controls with Open Allowlist:
Because network access is open to any IP address with valid credentials, the following security measures are strictly enforced:
- **Strong Random Passwords**: Use a high-entropy password (at least 32 alphanumeric and symbol characters) generated via a cryptographically secure generator.
- **No Admin Roles**: The application user must only have `readWrite` permissions on its specific database.
- **Credential Redaction in Application Logs**: The backend connection layer (`server/src/config/db.js`) automatically masks credentials (`***:***`) in logs and exception stack traces.
- **Zero Secrets in Version Control**: `.env` and `.env.*` files are included in `.gitignore` and must never be committed to git.

---

## 7. Schema Indexes Synchronization

ClubRelay manages MongoDB indexes declaratively in Mongoose schemas. In production, automatic index creation at startup is disabled (`autoIndex: false`) to avoid performance degradation.

To synchronize indexes in staging or production:

```bash
# Development (local database)
npm run db:indexes

# Staging / Production (requires explicit safety override flag)
ALLOW_INDEX_SYNC=1 npm run db:indexes
```

The script inspects all models (`Campus`, `User`, `Membership`, `Club`, etc.), applies missing compound and unique indexes, drops obsolete indexes, and reports model names and index counts.

---

## 8. Health Check Verification

The API exposes a lightweight database health endpoint at `GET /api/v1/health`:

```bash
curl -i https://<your-domain>/api/v1/health
```

- **Database Connected**: Returns HTTP `200 OK` with `{"ok":true,"db":"up"}`.
- **Database Disconnected**: Returns HTTP `503 Service Unavailable` with `{"ok":false,"db":"down"}`.
- **Security**: The health endpoint performs a lightweight MongoDB `{ ping: 1 }` command and does **not** expose database names, server hostnames, or collection statistics.
