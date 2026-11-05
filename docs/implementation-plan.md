# ClubRelay — Phased Implementation Plan

## Phase 0: Environment, Skills, Design, and Repository Reconnaissance ✅
- [x] Inspect OS, Node v24, npm v11, git environment.
- [x] Install project-scoped Agent Skills: `frontend-design`, `web-design-guidelines`, `hallmark`.
- [x] Inspect Anime.js v4 API (`createScope`, `animate`, `revert`).
- [x] Conduct open-source repository reconnaissance on `uniclub`, `club-management-system`, `College-Event-Management-System`.
- [x] Author core architecture deliverables: PRD, Architecture Diagram, ERD, API Spec, Component Inventory, Design System, Implementation Plan.

---

## Milestone 1: Data Model, Project Structure, Design Tokens & Foundation
- [ ] Initialize monorepo project structure: `client/`, `server/`, `api/`, root scripts.
- [ ] Configure Tailwind CSS with bespoke ClubRelay design tokens (`warm ivory`, `forest green`, `charcoal`).
- [ ] Install dependencies for React frontend and Express backend.
- [ ] Define backend configuration: central error handler, environment validation, Mongoose connection caching helper for Vercel serverless.
- [ ] Implement all 16 Mongoose domain models with indexes and validation:
  `User`, `Campus`, `Club`, `Membership`, `AcademicTerm`, `Event`, `EventTask`, `EventTemplate`, `KnowledgeItem`, `Contact`, `Decision`, `Approval`, `Handover`, `Notification`, `AuditLog`, `Attachment`.
- [ ] Implement robust seed script generating realistic university data for 2 independent campuses (e.g. Pacific Coast University & Metro Tech Institute) with realistic clubs (GDG, IEEE, ACM, AWS Cloud Club), leadership rosters, events, tasks, SOPs, and handovers.

---

## Milestone 2: Frontend Shell, Authentication, Campus & Club Dashboards
- [ ] Build reusable UI primitives: `Button`, `Input`, `Select`, `Modal`, `Card`, `Badge`, `Progress`, `Toast`, `EmptyState`.
- [ ] Build persistent `AppLayout`: Sidebar with club switcher, contextual Topbar with notifications popover and user profile.
- [ ] Build Anime.js React integration hook (`useAnimeScope`) with `prefers-reduced-motion` detection and automatic cleanup.
- [ ] Implement Authentication screens: Login, Register, Campus Selection, and Club Join code.
- [ ] Implement Campus Executive Dashboard: campus-wide metrics, active clubs directory, pending approvals triage.
- [ ] Implement Club Executive Dashboard: upcoming events flight deck, task health breakdown, succession alert widget, live audit stream.

---

## Milestone 3: Express REST API, Multi-Tenant Isolation & Authentication
- [ ] Implement security middleware: `helmet`, `cors`, `cookie-parser`, `express-rate-limit`.
- [ ] Implement JWT authentication with `HttpOnly` secure cookies.
- [ ] Implement strict Multi-Tenant isolation middleware (`campusGuard`, `clubGuard`) ensuring users can only read/write records within their authorized campus and club.
- [ ] Implement Role-Based Access Control (RBAC) middleware verifying actions for Campus Admin, Faculty Coordinator, Club President, Secretary, Core Member, and General Member.
- [ ] Implement Zod validation schemas for all requests.
- [ ] Connect client TanStack Query hooks to live REST API endpoints.

---

## Milestone 4: Event Management, Tasks, Approvals & Organization Memory
- [ ] Implement 7-stage Event Lifecycle state machine (`Draft` → `Proposed` → `Approved` → `Planning` → `In Progress` → `Completed` → `Archived`).
- [ ] Event Templates selector (Technical Workshop, Hackathon, Guest Lecture, Meetup, Competition, Mixer).
- [ ] Event Task & Subtask management with priorities, assignees, deadlines, and dependency resolution.
- [ ] Faculty Approval Workflow: proposal submission, faculty review queue, modification requests with auditable comments, and approval decision triggers.
- [ ] Post-event retrospective recording: actual attendance, budget spend, lessons learned.
- [ ] Organization Memory: Full-text searchable knowledge base for SOPs, playbooks, meeting decisions, and vendor/sponsor directory.

---

## Milestone 5: Handover Center, Annual Reports & Exports
- [ ] Complete Leadership Handover Center:
  - 8 structured handover sections.
  - Section-by-section progress calculation and completion toggling.
  - Role responsibilities, outstanding obligations, future schedules, external asset vault instructions.
  - Formal digital acknowledgment by incoming officer.
  - Leadership transition role swap execution.
- [ ] Annual Organization Report Generator:
  - Aggregate statistics across academic year (events conducted, total attendees, budget efficiency, handover status).
  - Print-ready PDF view layout.
  - CSV export for institutional accreditation and audits.

---

## Milestone 6: Automated Testing, Security Verification & Deployment Readiness
- [ ] Vitest unit & component tests for frontend components and hooks.
- [ ] Supertest integration tests for Express API: auth, multi-tenant isolation, role permission checks, event lifecycle, and handover completion.
- [ ] Hallmark audit / lint pass on CSS and UI tokens.
- [ ] Vercel serverless entry point configuration (`api/index.js`, `vercel.json`).
- [ ] Comprehensive documentation: README.md, .env.example, seed instructions, API documentation, deployment guide.
