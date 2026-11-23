# ClubRelay — Social Authentication Setup & Architecture Guide

This document outlines the setup, architecture, and security policies governing Google and GitHub OAuth authentication in ClubRelay.

---

## 1. Architecture Overview

ClubRelay supports multi-tenant social sign-in alongside password authentication. Social logins map incoming federated accounts to university campus users under strict security invariants.

### Federated Identity Model (`server/src/models/FederatedIdentity.js`)
Federated identities are separated from the core `User` model to support multiple providers per user and clean account linking:

- **`provider`**: `'GOOGLE'` | `'GITHUB'`
- **`providerUserId`**: String (Google `sub`, GitHub `id`)
- **`userId`**: ObjectId ref to `User`
- **`email`**: Verified email address at time of linking

### Compound Unique Indexes
1. `{ provider: 1, providerUserId: 1 }` (unique) — Guarantees a social identity maps to exactly one account link globally.
2. `{ userId: 1, provider: 1 }` (unique) — Prevents multiple accounts from the same provider being linked to the same campus user.

### Role & Multi-Tenant Invariants
- **Strict Role Lock**: Newly registered users via OAuth are **strictly assigned `STUDENT` role**. Permissions are never elevated to `CAMPUS_ADMIN` or `FACULTY_COORDINATOR` during OAuth signup. Existing accounts preserve their pre-assigned administrative or faculty privileges upon linking.
- **Unambiguous Campus Domain Matching**: New users are matched against active campuses whose `domain` exactly matches their verified email domain (e.g. `@pcu.edu` -> Pacific Coast University).
  - If 0 campuses match the domain, the callback halts with `error=no_campus_found`. There is **zero arbitrary fallback** to other campuses.
  - If $>1$ campuses share the domain, the callback halts with `error=ambiguous_campus` to prevent cross-tenant contamination.
- **Account Linking Safety**: When an unlinked social identity signs in with a verified email:
  - If matching user accounts exist across multiple campuses, auto-linking is refused with `error=ambiguous_account`.
  - Linking occurs exclusively when exactly 1 account exists in the resolved campus domain.
- **Atomic Creation & Linking**: User account creation and `FederatedIdentity` creation are executed inside a MongoDB replica-set transaction (`session.withTransaction`) to guarantee zero partial records or orphaned accounts.
- **Registration Policy Enforcement**: If a campus has `settings.allowSelfRegistration: false`, automated signup is blocked (`error=registration_disabled`).
- **Deactivated Account Defense**: If a linked user's `isActive` flag is `false`, the session is immediately aborted (`error=account_deactivated`).
- **Provider-Specific CSRF State Cookies**: OAuth initiation sets dedicated cookies per provider:
  - Google: `cr_oauth_state_google` (`httpOnly`, `sameSite: lax`, 10-minute expiry).
  - GitHub: `cr_oauth_state_github` (`httpOnly`, `sameSite: lax`, 10-minute expiry).
  Callbacks strictly verify state matching against their respective cookie and clear the cookie upon validation.
- **GitHub Verified Email Policy**: GitHub authentication queries the authenticated `/user/emails` endpoint and requires `verified: true`. Public profile emails (`gitHubUser.email`) are never accepted as fallbacks. If no verified email is found, the flow halts with `error=unverified_email`.
- **Production Callback Requirements**: In production (`NODE_ENV === 'production'`), explicit HTTPS callback URLs (`GOOGLE_CALLBACK_URL` and `GITHUB_CALLBACK_URL`) are strictly required. Deriving callback URIs from dynamic request Host headers is completely disabled to prevent host-header poisoning.

---

## 2. Google OAuth 2.0 Setup

### Step 1: Create Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project (e.g. `ClubRelay-Campus`).

### Step 2: Configure OAuth Consent Screen
1. Navigate to **APIs & Services** > **OAuth consent screen**.
2. Select User Type:
   - **Internal** (if deploying strictly within a Google Workspace educational domain).
   - **External** (for multi-campus or public testing).
3. Fill in App Name (`ClubRelay`), User Support Email, and Developer Contact Email.
4. Add the following scopes:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

### Step 3: Create Credentials
1. Navigate to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Select Application Type: **Web application**.
4. Name: `ClubRelay Web Client`.
5. Under **Authorized redirect URIs**, add:
   - Development: `http://localhost:5000/api/v1/auth/google/callback`
   - Production: `https://your-domain.edu/api/v1/auth/google/callback`
6. Copy the **Client ID** and **Client Secret**.

---

## 3. GitHub OAuth App Setup

### Step 1: Register GitHub OAuth Application
1. Sign in to GitHub and navigate to [Settings > Developer Settings > OAuth Apps](https://github.com/settings/developers).
2. Click **New OAuth App**.
3. Fill in the fields:
   - **Application name**: `ClubRelay`
   - **Homepage URL**: `http://localhost:5173` (or production URL)
   - **Authorization callback URL**:
     - Development: `http://localhost:5000/api/v1/auth/github/callback`
     - Production: `https://your-domain.edu/api/v1/auth/github/callback`
4. Click **Register application**.
5. Generate a **Client Secret** and copy both the **Client ID** and **Client Secret**.

---

## 4. Environment Variables Configuration

Add the following keys to `server/.env` (and configure them in production environments):

```bash
# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# GitHub OAuth App
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/v1/auth/github/callback
```

*Note: If credentials are not configured, `/api/v1/auth/providers` reports `enabled: false`. The frontend Dark Grid login screen will cleanly indicate that social login is awaiting campus IT configuration without crashing or breaking institutional login.*

---

## 5. API Endpoints Reference

| Endpoint | Method | Rate Limited | Description |
|---|---|---|---|
| `/api/v1/auth/providers` | `GET` | No | Returns enabled status for Google and GitHub. |
| `/api/v1/auth/google` | `GET` | Yes (30/15m) | Initiates Google OAuth consent redirect. |
| `/api/v1/auth/google/callback` | `GET` | No | Validates state, exchanges code, issues session. |
| `/api/v1/auth/github` | `GET` | Yes (30/15m) | Initiates GitHub OAuth authorization redirect. |
| `/api/v1/auth/github/callback` | `GET` | No | Validates state, fetches primary verified email, issues session. |

---

## 6. Verification and Automated Testing

Automated tests covering all OAuth routes, state validation, unverified email rejection, and role-lock guarantees are located in:
- `server/src/test/oauth.test.js`
- `client/src/test/auth_components.test.jsx`

Run them with:
```bash
npm run test --workspace=server -- src/test/oauth.test.js
npm run test --workspace=client -- src/test/auth_components.test.jsx
```

