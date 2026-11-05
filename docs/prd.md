# ClubRelay — Product Requirements Document (PRD)

**Product Name:** ClubRelay  
**Tagline:** *The work continues. The knowledge stays.*  
**Status:** In Active Implementation  
**Version:** 1.0.0 (Production Architecture)

---

## 1. Problem Statement & Core Value Proposition

### 1.1 The Annual Leadership Turnover Crisis
In universities and technical institutes globally, student organizations (IEEE chapters, ACM student chapters, Google Developer Groups (GDG), AWS Cloud Clubs, entrepreneurship cells, robotic clubs) operate under a recurring failure mode: **100% annual executive turnover**.

Every 12 months, graduating officers step down. A new team is elected or appointed, and virtually all institutional memory evaporates:
- Past event budgets, speaker fee agreements, and attendance figures are buried in personal Google Drives.
- Relationships with sponsors, vendors, and keynote speakers are lost because personal WhatsApp or personal Gmail inboxes were used.
- Critical university compliance protocols (how to book a central auditorium, faculty advisor sign-offs, security clearance) have to be re-discovered by trial and error.
- Event post-mortems ("What broke during the hackathon WiFi?", "Which catering vendor failed?") are never recorded, causing incoming teams to repeat costly mistakes.

### 1.2 What ClubRelay Is and Is NOT
- **ClubRelay is:** A multi-tenant operational continuity platform and institutional memory repository designed specifically for campus student organizations, faculty advisors, and university student affairs.
- **ClubRelay is NOT:** An event registration/ticketing platform (Eventbrite/Luma), a team chat app (Slack/Discord), or an LMS (Canvas/Blackboard). It integrates around execution, governance, accountability, and seamless leadership succession.

---

## 2. Target Personas & Stakeholders

| Persona | Role | Key Goals & Needs |
| :--- | :--- | :--- |
| **Campus Administrator** | Dean / Director of Student Affairs | Campus-wide visibility into club compliance, active organizations, risk management, and annual audit reports. |
| **Faculty Coordinator** | Faculty Advisor assigned to a club | Review and approve/reject event proposals with auditable feedback; track budget allocations and verify leadership eligibility. |
| **Club President** | Outgoing / Incoming Executive Officer | Oversee entire club lifecycle, initiate and verify leadership handovers, assign core officers, track milestones. |
| **Club Secretary** | Executive Officer | Manage meeting decisions, maintain minutes, maintain vendor/sponsor directory, organize event logistics and tasks. |
| **Core Team Member** | Lead of Technical, Design, or PR Sub-teams | Own specific event tasks, link deliverables, view playbooks and SOPs. |
| **General Member** | Active Club Member | View upcoming events, access public club SOPs, join teams and tasks when assigned. |

---

## 3. Product Modules & Functional Requirements

### Module 1: Campus & Organization Multi-Tenant Management
- **Campus Workspaces:** Independent tenant scoping. Multi-campus support (e.g. Stanford University vs MIT) where users and data cannot cross boundaries.
- **Club Registry:** Register clubs with official name, acronym, category (Technical, Cultural, Entrepreneurship, Academic), description, logo, and active academic year.
- **Academic Term Management:** Define terms (e.g. `2025-2026`, `2026-2027`) to anchor leadership tenures, event archives, and handover packages.
- **Role-Based Access Control (RBAC):** Server-enforced permissions for Campus Admin, Faculty Coordinator, Club President, Club Secretary, Core Member, and General Member.

### Module 2: Executive Dashboard
- **Real Metrics:** Live counters for active clubs, upcoming events, outstanding tasks, pending faculty approvals, and handover completion progress.
- **Operational Widgets:**
  - *Upcoming Event Flight Deck:* Next 30 days of scheduled events with approval status and completion bars.
  - *Task Health Monitor:* Overdue, in-progress, and unassigned execution tasks across the organization.
  - *Succession Tracker:* Handover status alert indicating missing sections or unacknowledged transitions.
  - *Audit Stream:* Recent governance decisions, approvals, and role updates.

### Module 3: Event Execution Workspace
- **7-Stage Event Lifecycle:**
  `Draft` → `Proposed` → `Approved` → `Planning` → `In Progress` → `Completed` → `Archived`.
- **Task & Subtask Dependency Management:**
  - Task owner, priority (Low, Medium, High, Urgent), due date, status (Todo, In Progress, Blocked, Done).
  - Dependencies: Tasks can declare prerequisite tasks.
- **Reusable Event Templates:**
  - Technical Workshop
  - 48-Hour Hackathon
  - Guest Lecture / Keynote
  - Developer Meetup
  - Competitive Coding Contest
  - Community Networking Mixer
- **Post-Event Retrospectives & Evidence:**
  - Attendance recording (expected vs actual attendees).
  - Budget breakdown (allocated vs actual spent).
  - Lessons learned, incident post-mortems, and supporting links/documents.

### Module 4: Organization Memory (Institutional Knowledge Base)
- **Categorized Operational Records:**
  - Standard Operating Procedures (SOPs)
  - Previous Event Documentation & Playbooks
  - Speaker & Mentor Directory
  - Vendor & Sponsor Registry (pricing, contact, lead time, reliability score)
  - Campus Venue Database (seating capacity, AV specs, booking lead time, restrictions)
  - Meeting Decisions & Resolutions Log
- **Version Tracking & Auditing:** Record author, created term, last modified date, revision notes.
- **Full-Text Search & Tagging:** Fast filtering by category, academic year, club, and keywords.
- **Security Constraint:** Never store plain passwords or secrets; store secure links or password manager vault instructions instead.

### Module 5: Handover Center (The Core Differentiator)
- **Structured Handover Package:**
  1. *Role Responsibilities & Authority Scope*
  2. *Outstanding Tasks & Immediate Obligations*
  3. *Pending Commitments & External Contracts*
  4. *Future Event Schedules & Roadmap*
  5. *Key Documents, Blueprints, & Cloud Folder References*
  6. *Vendor, Sponsor, & Faculty Contact Network*
  7. *Reusable Operational Playbooks*
  8. *Lessons Learned & Strategic Advice*
- **Succession Workflow:**
  - Initiated by outgoing President/Secretary for a designated incoming officer.
  - Section-by-section completion tracking (percentage completion indicator).
  - Review and formal digital acknowledgment by incoming leader.
  - PDF Handover Export for university archives and faculty sign-off.

### Module 6: Faculty Approval Workflow
- **Proposal Review:** Faculty coordinators review submitted events with budget, venue, and speaker details.
- **Action State Machine:**
  - *Approve:* Moves event to `Approved` and unlocks `Planning` workspace.
  - *Request Modification:* Moves event back with specific actionable revision feedback.
  - *Reject:* Closes proposal with formal reason.
- **Audit Log:** Complete history of decisions, reviewers, timestamps, and comments.

### Module 7: Annual Organization Reports
- **Data Aggregation:** Conducted events, attendee reach, volunteer hours, financial summary, vendor reliability, and handover completion status.
- **Exports:**
  - Structured printable/PDF export formatted for University Student Affairs.
  - CSV data export for institutional audits and accreditation (e.g. ABET/NAAC).

---

## 4. Non-Functional Requirements

- **Security:** HTTP-only cookies, JWT verification, Bcrypt password hashing (salt factor 12), Helmet security headers, CORS strict whitelist, Rate limiting on sensitive endpoints, strict tenant isolation preventing cross-campus and cross-club data leakage.
- **Performance:** Sub-100ms API response time, compound indexed MongoDB queries, lazy loaded client routes, lightweight animation engine (Anime.js) respecting `prefers-reduced-motion`.
- **Serverless Compatibility:** Vercel serverless Express handler with reusable Mongoose connection pooling.
- **Design Authenticity:** Bespoke B2B productivity SaaS aesthetic (Warm Ivory `#FBFBF9`, Deep Forest Green `#1B4332`, Charcoal `#1F2421`), clean typography, zero AI template slop.
