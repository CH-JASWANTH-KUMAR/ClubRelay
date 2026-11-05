# ClubRelay — University Organization Continuity & Handover SaaS

> **Tagline:** *The work continues. The knowledge stays.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stack: MERN + Vite](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Mongoose-1B4332.svg)]()
[![Motion: Anime.js v4](https://img.shields.io/badge/Motion-Anime.js%20v4-2D6A4F.svg)]()

ClubRelay is a production-quality, multi-tenant SaaS platform built to solve the **annual leadership turnover crisis** in university technical clubs, IEEE/ACM chapters, GDG communities, and AWS Cloud Clubs. Every 12 months, graduating student leaders step down and vital operational memory is lost. ClubRelay provides a persistent institutional memory engine, structured 8-stage leadership transition workflows, faculty proposal governance, and event execution flight decks.

---

## 🌟 Core Modules

### 1. Leadership Handover Center (Core Differentiator)
- **8 Structured Transition Sections:** Role responsibilities, outstanding tasks, pending vendor commitments, tentative future calendar, official cloud vault ownership links, key contacts, and strategic recommendations.
- **Completion Tracking:** Real-time percentage indicator based on section verification.
- **Digital Sign-Off:** Incoming officer review notes and formal acknowledgment.
- **One-Click Role Transition:** Automatically updates active club leadership in the database upon completion.
- **Printable Dossier (PDF):** Formatted for university student affairs archives.

### 2. Organization Memory (Institutional Knowledge Base)
- Searchable repository for **Standard Operating Procedures (SOPs)**, event playbooks, lab protocols, and vendor pricing.
- **Document Versioning:** Every revision creates an auditable record with change summaries and timestamps.
- **Tagging & Categories:** SOP, Event Playbook, Process, Lessons Learned, Budget Guide, Venue Intel.
- **Strict Credential Policy:** Password manager vault ownership instructions rather than plaintext credentials.

### 3. Event Execution Workspace
- **7-Stage Lifecycle:** `Draft` → `Proposed` → `Approved` → `Planning` → `In Progress` → `Completed` → `Archived`.
- **Reusable Event Templates:** Technical Workshop, 48-Hour Hackathon, Guest Lecture, Meetup, Competition, Mixer.
- **Task & Dependency Management:** Priorities, assignees, deadlines, and blocker tracking.
- **Post-Event Retrospectives:** Attendance recording (expected vs actual), budget reconciliation, and lessons learned.

### 4. Faculty Approval Workflow
- Dedicated triage portal for faculty coordinators and campus advisors.
- Actionable state machine: **Approve**, **Request Modifications** with feedback, or **Reject**.
- Complete revision history and audit trail for campus compliance.

### 5. Annual Organization Reports
- Real database-backed metrics aggregated across the academic year.
- Interactive participation analytics with **Recharts**.
- One-click **CSV data export** for accreditation (ABET, NAAC) and university student affairs.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript ES2023, Tailwind CSS, Anime.js (v4 scoped motion engine), Lucide React, Recharts, TanStack Query, React Hook Form, Zod |
| **Backend** | Node.js, Express.js (ES Modules), RESTful API v1, Mongoose, MongoDB Atlas (with in-memory fallback for testing) |
| **Security** | Helmet, CORS, Cookie-Parser, HttpOnly JWT cookies, Bcrypt password hashing (salt 12), Rate limiting, strict multi-tenant scoping |
| **Deployment** | Vercel Serverless Express architecture (`api/index.js`, `vercel.json`), MongoDB Atlas |
| **Quality** | Vitest, Supertest, React Testing Library, ESLint |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+` or `v11+`

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/CH-JASWANTH-KUMAR/ClubRelay.git
cd ClubRelay
npm install
```

### 2. Seed Database with Realistic Data
The database seed creates 2 isolated university campuses (`Pacific Coast University` and `Metro Tech Institute`), 4 technical clubs (`GDG`, `IEEE`, `ACM`, `AWS Cloud Club`), 8 student/faculty users, sample events, tasks, SOPs, and an active handover package:
```bash
npm run seed
```

### 3. Run Development Servers
Start both the backend Express API (port 5000) and the frontend Vite server (port 5173) concurrently:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 👥 Instant Demo Logins

All pre-seeded demo accounts use the standard password: **`Password123!`**

| Persona | Email | Role / Campus |
| :--- | :--- | :--- |
| **Sarah Jenkins** | `sarah.gdg@pcu.edu` | Outgoing President (GDG · Pacific Coast Univ) |
| **Alex Rivera** | `alex.incoming@pcu.edu` | Incoming President (GDG · Pacific Coast Univ) |
| **Dr. Evelyn Chen** | `advisor.chen@pcu.edu` | Faculty Coordinator (Computer Science) |
| **Dean Marcus Vance** | `admin@pcu.edu` | Campus Administrator (Student Affairs) |
| **Elena Rostova** | `elena.aws@mti.edu` | President (AWS Cloud Club · Metro Tech) |

---

## 🧪 Testing

Execute both backend integration tests and frontend component tests:
```bash
# Run all tests across workspaces
npm run test

# Run backend API tests only (Supertest + Vitest)
npm run test --workspace=server

# Run client component tests only (React Testing Library + Vitest)
npm run test --workspace=client
```

---

## 🏛️ System Architecture

```
ClubRelay/
├── .agents/skills/            # Agent Skills (frontend-design, web-design-guidelines, hallmark)
├── api/                       # Vercel Serverless Entry Point (api/index.js)
├── client/                    # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/        # Design system UI primitives (Button, Card, Badge, Modal, etc.)
│   │   ├── context/           # AuthContext, ToastContext
│   │   ├── hooks/             # useAnimeScope (Anime.js v4 lifecycle wrapper)
│   │   ├── pages/             # 12 Major Screen Implementations
│   │   └── index.css          # Hallmark design tokens & base stylesheet
│   └── vite.config.js         # Chunking and proxy config
├── docs/                      # Architectural & Product Specifications
│   ├── prd.md                 # Product Requirements Document
│   ├── system-architecture.md # Architecture Diagram & Tenancy Model
│   ├── entity-relationship-diagram.md # MongoDB ERD & Index Strategy
│   ├── api-specification.md   # Complete REST API v1 Endpoint Spec
│   ├── component-inventory.md # Page & Component Roster
│   ├── design-system.md       # High-fidelity Design Tokens Specification
│   └── implementation-plan.md # Phased Milestones Breakdown
├── server/                    # Express REST API (ES Modules)
│   ├── src/
│   │   ├── config/            # Cached MongoDB connection for Serverless
│   │   ├── controllers/       # Auth, Campus, Club, Event, Task, Handover, etc.
│   │   ├── middleware/        # Tenant Scoping, Auth, Error Handler
│   │   ├── models/            # 16 Mongoose Domain Models
│   │   ├── routes/            # REST API v1 Route Mounts
│   │   ├── scripts/seed.js    # Multi-tenant Seed Script
│   │   └── app.js             # Express App Configuration
│   └── package.json
├── package.json               # Root Workspace Orchestration
└── vercel.json                # Vercel Serverless Routing Rules
```

---

## 📄 License
MIT License. Built for university student organization continuity.

