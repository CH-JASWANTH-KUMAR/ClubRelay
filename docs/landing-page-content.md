# ClubRelay — Landing Page Content & Copy Architecture

This document documents the content strategy, section hierarchy, and complete copy architecture for the ClubRelay public landing page (`client/src/pages/LandingPage.jsx`).

---

## 1. Top Navigation Bar (`MarketingNavbar.jsx`)

- **Brand Logo**: Vector Relay Mascot icon + "ClubRelay" wordmark (`font-heading font-extrabold text-lg text-ink`).
- **Pill Eyebrow**: *"Build the club. Keep the momentum."*
- **Navigation Links**:
  - `Pillars` $\to$ `#product-pillars`
  - `How It Works` $\to$ `#how-it-works`
  - `Communities` $\to$ `#communities`
  - `Preview` $\to$ `#preview`
- **Dynamic Action**:
  - Guest: "Sign In" button $\to$ `/login`.
  - Authenticated Member: "Open Workspace" button $\to$ User's primary club or `/campus`.
  - Mobile Drawer: Full overlay with accessible dismiss control.

---

## 2. Hero Section (`MarketingHero.jsx`)

- **Eyebrow**: `Campus Energy` · `Built for Student Clubs`
- **Headline**:
  > **Build the club.**
  > **Keep the momentum.**
- **Sub-headline**:
  > *The institutional memory and operations platform for collegiate organizations and student clubs.*
- **Tagline Banner**:
  > *The work continues. The knowledge stays.*
- **Actions**:
  - Primary CTA: "Open Your Workspace" (authenticated) or "Explore Platform" (guest).
  - Secondary CTA: "Sign In to Account" $\to$ `/login`.
- **Hero Visual**:
  - Interactive **Relay** mascot with cursor tracking.
  - Floating live preview cards: "85% Handover Ready" pill and "DevFest 2026 Summit (Approved)" badge.

---

## 3. The Problem Section (`ProblemSection.jsx`)

- **Eyebrow**: `The student club dilemma`
- **Headline**: *The semester ends. The work shouldn’t.*
- **Intro**: Every academic term, incredible university clubs lose their momentum due to chaotic leadership handovers and fragmented personal tools.
- **4 Critical Failure Modes**:
  1. **Leadership Amnesia**: Outgoing seniors graduate, taking context, passwords, and sponsor contacts with them. (*Result: 60% loss of continuity*).
  2. **Tool Sprawl**: Spreadsheets, personal Google Drives, WhatsApp groups, and lost Notion links scattered across student laptops. (*Result: Fractured documents*).
  3. **Orphaned Technical Projects**: Hackathon projects and open-source campus apps abandoned without maintainer transition. (*Result: Dead GitHub repos*).
  4. **Vanished Industry Partners**: Companies that sponsored last semester's hackathon can't be reached because contact info was in someone's private email. (*Result: Lost sponsorship pipeline*).
- **Contrast Banner**: *Turn annual leadership transitions into an advantage.*

---

## 4. Bento Feature Grid (`BentoFeatures.jsx`)

- **Eyebrow**: `Core Platform Architecture`
- **Headline**: *Four pillars of student club momentum*
- **Sub-headline**: Everything student organizations need to build active teams, execute ambitious technical initiatives, and guarantee smooth continuity.
- **The Four Pillars**:
  - **Pillar 01 — Community & Leadership Rosters**: Discover campus organizations, manage active student memberships, structure sub-team leads, and maintain privacy-hardened rosters across term boundaries.
  - **Pillar 02 — Event Execution Cockpit**: Orchestrate workshops, hackathons, and guest keynotes with a 7-stage lifecycle stepper, faculty approvals, budget variance trackers, and delegation boards.
  - **Pillar 03 — Engineering Projects & Repositories**: Link GitHub projects, open-source repositories, and technical deliverables directly to club workspaces so code ownership stays alive across graduating batches.
  - **Pillar 04 — Institutional Memory & Handover**: Preserve compliance SOPs, vendor contracts, and meeting decisions in an institutional memory vault. Complete 8-section handovers with atomic role transfers and digital sign-off.

---

## 5. Three-Step Continuity Journey (`HowItWorks.jsx`)

- **Eyebrow**: `Three step transition`
- **Headline**: *How ClubRelay keeps the momentum*
- **Step 01: Organise & Align**: Centralize student membership rosters, assign executive board roles, and map out academic semester goals.
- **Step 02: Build & Execute**: Run events, track budget approvals, coordinate sub-team task boards, and document meeting minutes in real time.
- **Step 03: Pass It Forward**: Run guided 8-section handovers, complete cryptographic digital sign-offs, and promote the incoming board atomically.

---

## 6. Target Campus Ecosystems (`CampusCommunities.jsx`)

- **Eyebrow**: `Target ecosystems`
- **Headline**: *Built for technical and collegiate communities*
- **Ecosystem Cards**:
  1. **Developer Collectives & Open Source** (Google Developer Groups, ACM, open-source guilds).
  2. **Engineering & Robotics Chapters** (IEEE branches, aero-design teams, hardware hackers).
  3. **Entrepreneurship Cells** (Pitch decks, founder speaker sessions, demo days, angel networks).
  4. **Cultural & Design Societies** (Campus festivals, graphic branding kits, audio-visual stage productions).
  5. **Campus Governance & Councils** (Student body councils, faculty oversight, cross-club policy alignments).

---

## 7. Interactive Product Preview (`ProductPreview.jsx`)

- **Eyebrow**: `Live preview`
- **Headline**: *Designed for student leaders. Built to last.*
- **Interactive Tabs**:
  - `Club Workspace`: Flight deck with upcoming events, succession health widget, and quick actions.
  - `Event Cockpit`: 7-stage stepper (Draft $\to$ Proposed $\to$ Approved $\to$ Planning $\to$ In Progress $\to$ Completed), 7 sub-tabs.
  - `My Work`: Cross-club personal task cockpit with Kanban cards.
  - `Handover Center`: Outgoing to Incoming officer pairing, verified section status tracker.
  - `Campus Operations`: Multi-club compliance overview, active term indicators, and quick reviews.

---

## 8. Footer (`MarketingFooter.jsx`)

- **Call to Action**: *Your next batch should start ahead, not from scratch.*
- **Action Buttons**: "Bring your club to ClubRelay" / "Open Your Workspace".
- **Security & Platform Trust**: Multi-tenant campus isolation, strict roster role verification, atomic succession transactions.
- **Copyright & Tagline**: *© 2026 ClubRelay Systems. The work continues. The knowledge stays.*
