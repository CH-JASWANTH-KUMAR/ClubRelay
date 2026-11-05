# Open-Source Repository Reconnaissance & Reverse Engineering Analysis

## 1. Executive Summary

As part of Phase 0 for **ClubRelay**, we conducted an architectural reconnaissance of three open-source campus organization and event management repositories:
1. **`majortom-39/uniclub`** — React/Vite + Express/Mongoose campus club & event discovery platform.
2. **`quockhanh41/club-management-system`** — Microservices-based club and event system with Next.js, Express, Kong API gateway, and dual PostgreSQL/MongoDB.
3. **`HardikRaut26/College-Event-Management-System`** — Typical MERN prototype highlighting common architectural anti-patterns.

Our goal was to extract actionable architectural strengths, identify critical design anti-patterns, and uncover the major industry gap that ClubRelay directly solves: **annual leadership turnover and catastrophic loss of institutional memory**.

---

## 2. Detailed Reference Repository Evaluations

### 2.1 Repository 1: `majortom-39/uniclub`
- **Repository URL:** `https://github.com/majortom-39/uniclub`
- **Owner:** `majortom-39`
- **Tech Stack:** React (Vite), Tailwind CSS, Radix UI, Node.js + Express (ES Modules), Mongoose / MongoDB Atlas, Capacitor (mobile wrapping).
- **Core Purpose:** Student activity portal, news curation, club discovery, and social student interaction.
- **Why Selected:** Architecture matches our core stack (React/Vite + Express/Mongoose ES Modules).

#### Architectural Strengths
- **Clean modular backend directory structure:** Separation into `models`, `routes`, `middleware`, and `services`.
- **Modern tooling:** Uses Vite, ES Modules throughout, and Radix UI primitives.
- **Mobile responsiveness:** Integrates responsive layouts with Capacitor consideration.

#### Weaknesses & Anti-Patterns to Avoid
- **Consumer/Social focus rather than B2B operational execution:** Focuses heavily on social feeds, public comments, and news aggregation rather than internal club operations.
- **Lack of Multi-Tenant Isolation:** Single-tier campus assumption. Does not scope queries to isolated campus workspaces or enforce strict club tenant boundaries at the database layer.
- **Coarse Role Enforcement:** Relies mostly on simple boolean admin flags (`isAdmin`) without distinguishing between Campus Admins, Faculty Coordinators, Club Presidents, Club Secretaries, and Core Team Members.
- **Absence of Continuity Workflows:** No leadership transition mechanism, no handover checklists, no asset inventory or playbook transfer.

---

### 2.2 Repository 2: `quockhanh41/club-management-system`
- **Repository URL:** `https://github.com/quockhanh41/club-management-system`
- **Owner:** `quockhanh41`
- **Tech Stack:** Next.js, Express, Kong API Gateway, PostgreSQL (Auth), MongoDB (Clubs, Events), RabbitMQ.
- **Core Purpose:** Club administration, membership tracking, recruitment drives, and event ticketing.
- **Why Selected:** Deep separation of club, event, and membership domain models.

#### Architectural Strengths
- **Domain Entity Boundary Clarity:** Clearly distinguished the relationship between Club, Club Membership, Event, and Event Registration.
- **Attendance Mechanism:** Explores QR code validation for event check-in.

#### Weaknesses & Anti-Patterns to Avoid
- **Over-engineered Microservice Sprawl:** Running separate auth, club, event, image, and notification services through Kong API gateway introduces immense operational complexity, network latency, and deployment headaches for university IT contexts.
- **Dual-Database Fragmentation:** Storing user credentials in PostgreSQL while storing club records in MongoDB creates distributed transaction hazards and data orphan risks.
- **No Governance or Approvals:** Events are created and published without university faculty review pipelines or audit logs.
- **No Memory Retention:** Once an event is marked done, all context (planning budgets, vendor contacts, venue friction, lessons learned) is lost.

---

### 2.3 Repository 3: `HardikRaut26/College-Event-Management-System`
- **Repository URL:** `https://github.com/HardikRaut26/College-Event-Management-System`
- **Owner:** `HardikRaut26`
- **Tech Stack:** MERN (React SPA, Express, MongoDB, Multer).
- **Core Purpose:** College event booking and basic PDF report generation prototype.
- **Why Selected:** Case study in typical junior MERN mistakes.

#### Anti-Patterns & Critical Pitfalls Identified
- **Ephemeral Filesystem Dependencies (`uploads/` folder):** Saves user uploads directly to local disk with Multer, completely breaking in modern serverless and containerized environments like Vercel or AWS Lambda.
- **Unprotected Routes & Missing Authorization:** Route handlers perform operations without verifying user token or verifying whether the user owns the club resource.
- **Missing Schema Validation:** MongoDB documents lack schema-level validation, enum constraints, and indexed lookups, causing full table scans and corrupted states.
- **Lack of Centralized Error Handling:** Raw exceptions thrown directly into route handlers causing unhandled promise rejections.

---

## 3. The Unsolved Industry Gap: The Leadership Turnover Crisis

Across all three repositories and existing campus management platforms, the core operational failure of student organizations remains unaddressed:
> **The Annual Leadership Churn Problem:** Every 12 months, the entire executive board of a club graduates or steps down. The incoming team starts from scratch, losing:
> 1. Vendor relationships and pricing history.
> 2. Faculty sponsor approval channels and compliance protocols.
> 3. Event budgets, attendance metrics, and retrospective post-mortems ("What failed? What succeeded?").
> 4. SOPs (Standard Operating Procedures) for organizing hackathons, securing campus venues, and running elections.
> 5. Pending commitments and multi-year sponsorships.

Existing tools operate either as **public event sign-up sites** (like Eventbrite / Luma) or **social club portals**. None serve as a **persistent operational memory and handover operating system**.

---

## 4. Architectural Lessons Applied to ClubRelay

| Architectural Area | Reference Repos Pitfall | ClubRelay Production Design |
| :--- | :--- | :--- |
| **Multi-Tenancy** | Single campus or un-scoped queries | Strict Multi-Tenant scoping by `campusId` and `clubId` on every authenticated request and Mongoose query. |
| **Architecture** | Overly complex microservices or tangled monolith | Modular Monolith (RESTful Express ES Modules) with clean controller-service-model separation, ready for Vercel Serverless. |
| **Database** | Split DBs (Postgres + Mongo) or unindexed models | Unified MongoDB Atlas with compound indexes (`campusId`, `clubId`, `academicYearId`), schema validation, and reference integrity. |
| **File Storage** | Local disk `/uploads` crashing on serverless | External Object Storage adapter pattern (Cloudinary/S3/Base64 data URIs with URL persistence) with strict MIME & size validation. |
| **Role & Permissions**| Binary boolean flags (`isAdmin`) | Tiered RBAC: Campus Admin & Faculty Coordinator (Campus-level); President, Secretary, Core, General Member (Club-level) enforced via middleware. |
| **Leadership Continuity** | Completely absent | **Handover Center**: structured transition packages, section-wise checklist, incoming officer acknowledgment, change audit log, PDF export. |
| **Approvals** | No oversight or untracked changes | **Faculty Approval Workflow**: proposal state machine, modification requests, auditable feedback history. |
| **Operational Memory** | None (only ephemeral events) | **Organization Memory**: SOPs, previous event retrospectives, vendor/mentor directory, searchable decision logs. |
