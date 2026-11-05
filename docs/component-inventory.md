# ClubRelay — Complete Page & Component Inventory

## 1. Application Routes & Screen Inventory

ClubRelay delivers 12 comprehensive screens designed with a professional, restrained B2B productivity SaaS visual identity:

| # | Route | Screen Name | Intended Users | Primary Action & Key Content |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `/login`, `/register` | **Authentication & Onboarding** | All users | Authenticate, select campus, join club via code or invite. |
| **2** | `/campus` | **Campus Dashboard** | Campus Admin, Faculty | View all active clubs, pending faculty approvals, campus-wide stats, and registered terms. |
| **3** | `/clubs/:clubId` | **Club Executive Dashboard** | Club Board, Members | Flight deck: upcoming event countdowns, task health monitor, handover alert widget, recent activity stream. |
| **4** | `/clubs/:clubId/events` | **Events Directory** | All club members | Filter events by status (Draft to Archived), create new event from template, view calendar timeline. |
| **5** | `/clubs/:clubId/events/:id` | **Event Execution Workspace** | Lead Organizers, Board | 7-stage lifecycle tracker, budget tracker, venue coordinator, faculty feedback banner, post-mortem retrospective. |
| **6** | `/clubs/:clubId/events/:id/tasks` | **Event Task Management** | Core Team, Assignees | Task board / dependency list with priority tags, assignee avatars, deadlines, and completion checkboxes. |
| **7** | `/clubs/:clubId/memory` | **Organization Memory & SOPs** | All club members | Searchable institutional repository: SOPs, playbooks, event debriefs, version selector, tag filters. |
| **8** | `/clubs/:clubId/directory` | **Sponsor & Vendor Directory** | Club Board, Core Leads | Contacts table with vendor ratings (1-5 stars), pricing notes, lead time, services offered, and quick contact action. |
| **9** | `/clubs/:clubId/decisions` | **Executive Decision Log** | Club Board | Official record of executive committee meetings, quorum, voting decisions, and assigned follow-up actions. |
| **10** | `/faculty/approvals` | **Faculty Approval Workspace** | Faculty Coordinators | Triage incoming club event proposals, examine budgets and speaker profiles, request revisions or approve. |
| **11** | `/clubs/:clubId/handover` | **Leadership Handover Center** | Outgoing & Incoming Leads | Section-by-section completion tracker, role playbooks, key cloud references, digital acknowledgment, PDF exporter. |
| **12** | `/clubs/:clubId/reports` | **Annual Organization Reports** | Board, Faculty, Admin | Conducted events summary, reach/attendance metrics, budget utilization, CSV download, printable PDF report view. |
| **13** | `/clubs/:clubId/members` | **Members & Permissions** | Club President, Secretary | Member roster with roles, tenure term, status toggles, and role invitation modal. |
| **14** | `/clubs/:clubId/settings` | **Club & Campus Settings** | Club Board, Admin | Profile info, logo update, academic term switcher, audit logs. |

---

## 2. Reusable Component Hierarchy

```
client/src/
├── components/
│   ├── ui/                    # Base UI Primitives (Design System)
│   │   ├── Button.jsx         # Primary (Forest Green), Secondary, Outline, Ghost, Danger
│   │   ├── Badge.jsx          # Status pills (Draft, Approved, In Progress, High, Urgent)
│   │   ├── Card.jsx           # Warm Ivory background, subtle border, no heavy drop-shadows
│   │   ├── Modal.jsx          # Accessible dialog with backdrop and escape key handler
│   │   ├── Input.jsx          # Form input with floating label & Zod error states
│   │   ├── Select.jsx         # Custom select with keyboard navigation
│   │   ├── Textarea.jsx       # Auto-expanding text area
│   │   ├── Tabs.jsx           # Accessible tab navigation with Anime.js indicator
│   │   ├── Progress.jsx       # Linear progress bar for handover & event health
│   │   ├── Skeleton.jsx       # Subtle pulsating placeholder loading states
│   │   ├── Toast.jsx          # Feedback notifications (Success, Info, Error)
│   │   └── Avatar.jsx         # Initials/photo fallback avatar
│   ├── layout/                # Shell & Structural Chrome
│   │   ├── AppLayout.jsx      # Persistent sidebar, contextual topbar, user dropdown
│   │   ├── Sidebar.jsx        # Navigation links with active states & club switcher
│   │   ├── Topbar.jsx         # Campus badge, search trigger, notifications popover, profile
│   │   ├── PageHeader.jsx     # Standardized title, breadcrumbs, action button group
│   │   └── EmptyState.jsx     # Actionable empty state with icon, copy, and primary action
│   ├── motion/                # Anime.js Scoped Animation Wrappers
│   │   ├── MotionContainer.jsx # Scoped wrapper for staggered card reveals
│   │   ├── TransitionFade.jsx  # Route / tab switch fade transition
│   │   └── useAnimeScope.js   # Custom hook encapsulating Anime.js createScope & revert
│   ├── modules/               # Domain-Specific Module Components
│   │   ├── dashboard/
│   │   │   ├── MetricStatCard.jsx
│   │   │   ├── UpcomingEventsWidget.jsx
│   │   │   ├── TaskHealthWidget.jsx
│   │   │   └── SuccessionAlertWidget.jsx
│   │   ├── events/
│   │   │   ├── EventCard.jsx
│   │   │   ├── EventLifecycleBar.jsx
│   │   │   ├── EventTemplatePicker.jsx
│   │   │   ├── EventTaskItem.jsx
│   │   │   └── RetrospectiveModal.jsx
│   │   ├── memory/
│   │   │   ├── KnowledgeCard.jsx
│   │   │   ├── KnowledgeEditorModal.jsx
│   │   │   ├── VersionHistoryDrawer.jsx
│   │   │   └── SearchFilterBar.jsx
│   │   ├── handover/
│   │   │   ├── HandoverProgressCard.jsx
│   │   │   ├── HandoverSectionEditor.jsx
│   │   │   ├── AcknowledgmentBanner.jsx
│   │   │   └── HandoverPdfPreview.jsx
│   │   ├── approvals/
│   │   │   ├── ProposalReviewCard.jsx
│   │   │   └── ModificationDialog.jsx
│   │   └── reports/
│   │       ├── AnnualReportSummary.jsx
│   │       └── MetricsExportBar.jsx
```
