# ClubRelay — REST API Specification (`/api/v1`)

All endpoints are versioned under `/api/v1`.  
All protected routes require an active session via an `HttpOnly` cookie or `Authorization: Bearer <token>` header.  
All request bodies and query parameters are strictly validated using Zod.  
Responses follow a standard JSON envelope:
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```
Error responses follow:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed",
    "details": []
  }
}
```

---

## 1. Authentication & Session Endpoints

| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a new user account with campus association | Public |
| `POST` | `/api/v1/auth/login` | Authenticate user & set secure `HttpOnly` token cookie | Public |
| `POST` | `/api/v1/auth/logout` | Revoke token & clear session cookie | Authenticated |
| `GET` | `/api/v1/auth/me` | Fetch active user profile, campus, and memberships | Authenticated |
| `PUT` | `/api/v1/auth/profile` | Update profile information and password | Authenticated |

---

## 2. Campus & Academic Term Endpoints

| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/campuses` | List all campuses (or user's campus) | Public / Auth |
| `POST` | `/api/v1/campuses` | Create a new campus workspace | System / Campus Admin |
| `GET` | `/api/v1/campuses/:campusId` | Get campus details and settings | Campus Member |
| `GET` | `/api/v1/campuses/:campusId/terms` | List academic terms for the campus | Campus Member |
| `POST` | `/api/v1/campuses/:campusId/terms` | Create academic term (e.g. 2025-2026) | Campus Admin |
| `GET` | `/api/v1/campuses/:campusId/stats` | Campus executive overview metrics | Campus Admin / Faculty |

---

## 3. Club & Membership Endpoints

| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/clubs` | List clubs in campus (filterable by category) | Campus Member |
| `POST` | `/api/v1/clubs` | Register new student organization | Campus Admin |
| `GET` | `/api/v1/clubs/:clubId` | Get club details, active board, and stats | Campus Member |
| `PUT` | `/api/v1/clubs/:clubId` | Update club profile, logo, and faculty advisor | Club President / Admin |
| `GET` | `/api/v1/clubs/:clubId/members` | List club members with roles and terms | Campus Member |
| `POST` | `/api/v1/clubs/:clubId/members` | Add/Invite member with role assignment | Club President / Secretary |
| `PUT` | `/api/v1/clubs/:clubId/members/:memberId` | Update member role or title | Club President |
| `DELETE` | `/api/v1/clubs/:clubId/members/:memberId`| Revoke membership | Club President |

---

## 4. Event Execution Workspace Endpoints

| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/clubs/:clubId/events` | List club events (filter by status, term) | Campus Member |
| `POST` | `/api/v1/clubs/:clubId/events` | Create new event (from scratch or template) | Club Board |
| `GET` | `/api/v1/clubs/:clubId/events/:eventId` | Get full event workspace (tasks, details) | Campus Member |
| `PUT` | `/api/v1/clubs/:clubId/events/:eventId` | Update event details and logistics | Club Board |
| `POST` | `/api/v1/clubs/:clubId/events/:eventId/submit` | Submit event for faculty approval | Club Board |
| `POST` | `/api/v1/clubs/:clubId/events/:eventId/retrospective` | Save post-event outcome, attendance, budget | Club Board |
| `GET` | `/api/v1/event-templates` | List reusable event templates | Authenticated |

---

## 5. Event Task Management Endpoints

| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/events/:eventId/tasks` | List all tasks for an event | Club Member |
| `POST` | `/api/v1/events/:eventId/tasks` | Create task with assignee & deadline | Core Member & above |
| `PUT` | `/api/v1/events/:eventId/tasks/:taskId` | Update task status, priority, or owner | Assignee or Board |
| `DELETE` | `/api/v1/events/:eventId/tasks/:taskId` | Delete task | Club Board |

---

## 6. Faculty Approval Endpoints

| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/approvals/pending` | List pending event proposals for faculty | Faculty Coordinator |
| `GET` | `/api/v1/events/:eventId/approvals` | Approval history and audit trail for an event | Campus Member |
| `POST` | `/api/v1/events/:eventId/approvals` | Submit review decision (Approve / Request Mods / Reject) | Faculty Coordinator |

---

## 7. Organization Memory & Directory Endpoints

| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/clubs/:clubId/knowledge` | Search knowledge items (SOPs, playbooks) | Club Member |
| `POST` | `/api/v1/clubs/:clubId/knowledge` | Create SOP or knowledge record | Core Member & above |
| `GET` | `/api/v1/clubs/:clubId/knowledge/:id` | Get knowledge item with version history | Club Member |
| `PUT` | `/api/v1/clubs/:clubId/knowledge/:id` | Update knowledge item (creates new version) | Core Member & above |
| `GET` | `/api/v1/clubs/:clubId/contacts` | List sponsor, vendor, and speaker contacts | Club Member |
| `POST` | `/api/v1/clubs/:clubId/contacts` | Add new contact with rating & pricing notes | Core Member & above |
| `PUT` | `/api/v1/clubs/:clubId/contacts/:id` | Update contact | Core Member & above |
| `GET` | `/api/v1/clubs/:clubId/decisions` | List executive meeting decisions & minutes | Club Member |
| `POST` | `/api/v1/clubs/:clubId/decisions` | Record meeting decision with action items | Club Secretary / Pres |

---

## 8. Handover Center Endpoints

| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/clubs/:clubId/handovers` | List active & past leadership transitions | Club Board |
| `POST` | `/api/v1/clubs/:clubId/handovers` | Initiate a new handover transition | Club President |
| `GET` | `/api/v1/clubs/:clubId/handovers/:id` | Get full handover transition package | Outgoing / Incoming Lead |
| `PUT` | `/api/v1/clubs/:clubId/handovers/:id/section` | Save/update a handover section | Outgoing / Incoming Lead |
| `POST` | `/api/v1/clubs/:clubId/handovers/:id/acknowledge` | Incoming officer formal sign-off | Incoming Leader |
| `POST` | `/api/v1/clubs/:clubId/handovers/:id/complete` | Complete transition and transfer roles | Outgoing Leader / Faculty |
| `GET` | `/api/v1/clubs/:clubId/handovers/:id/export` | Download structured Handover PDF document | Club Board / Faculty |

---

## 9. Reports & Exports Endpoints

| Method | Endpoint | Description | Access Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/clubs/:clubId/reports/annual` | Aggregate annual organization performance data | Club Board / Faculty |
| `GET` | `/api/v1/clubs/:clubId/reports/export/csv` | Export events and outcomes as CSV | Club Board / Faculty |
| `GET` | `/api/v1/campuses/:campusId/audit-logs` | Campus-level audit trail stream | Campus Admin |
| `GET` | `/api/v1/notifications` | Get user notifications | Authenticated |
| `PUT` | `/api/v1/notifications/:id/read` | Mark notification as read | Authenticated |
