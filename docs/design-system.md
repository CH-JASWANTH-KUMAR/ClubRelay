/* Hallmark · v2.0.0 · ClubRelay B2B Productivity System */
/* theme: bespoke-forest · genre: modern-minimal · job: continuity and handover */

# ClubRelay — Design System & Visual Specification

## 1. Visual Direction & Brand Philosophy

ClubRelay is designed as an established, high-trust **B2B Productivity SaaS** for university leadership teams. It embodies institutional permanence, clarity, and calm efficiency.

- **Background:** Warm Ivory / Muted Canvas (`#FBFBF9` primary background, `#F3F2EE` subtle surface contrast). Never cold clinical stark white (`#FFFFFF`) or artificial gradient soups.
- **Primary Accent:** Deep Forest Green (`#1B4332` primary, `#2D6A4F` hover/active, `#D8F3DC` soft tint). Represents continuity, organic longevity, and institutional stability.
- **Typography Tone:** Charcoal (`#1F2421` primary body, `#141716` display headings, `#5A625E` secondary label). Strong typographic hierarchy following Robert Bringhurst’s *Elements of Typographic Style*.
- **Secondary Signals:**
  - Amber Gold (`#B07D14` / `#FEF3C7`) for Pending Approvals & Modification Requests.
  - Rust Red (`#B91C1C` / `#FEE2E2`) for Overdue Tasks & Blocker Alerts.
  - Slate Blue (`#2B4C6F` / `#E0EDF8`) for Documentation & Version History.
- **Borders & Elevation:** Restrained 1px structural hairline borders (`#E4E2DC`), subtle crisp shadow (`0 1px 2px 0 rgba(27, 67, 50, 0.05)`). Never heavy cards-inside-cards or drop-shadow mush.

---

## 2. Design Tokens (`tokens.css`)

```css
:root {
  /* Color Tokens - Surfaces */
  --cr-bg-canvas: #FBFBF9;
  --cr-bg-surface: #FFFFFF;
  --cr-bg-subtle: #F4F3F0;
  --cr-bg-muted: #EAE8E3;
  --cr-border: #E2E0D8;
  --cr-border-focus: #1B4332;

  /* Color Tokens - Brand Forest Accent */
  --cr-primary: #1B4332;
  --cr-primary-hover: #2D6A4F;
  --cr-primary-active: #143326;
  --cr-primary-soft: #E8F5EE;
  --cr-primary-contrast: #FFFFFF;

  /* Color Tokens - Typography */
  --cr-text-heading: #141716;
  --cr-text-body: #242926;
  --cr-text-muted: #5F6662;
  --cr-text-faint: #8E9692;

  /* Color Tokens - Status Badges */
  --cr-status-draft-bg: #F1F1EF;
  --cr-status-draft-fg: #5F6662;
  --cr-status-proposed-bg: #FEF3C7;
  --cr-status-proposed-fg: #92400E;
  --cr-status-approved-bg: #E8F5EE;
  --cr-status-approved-fg: #1B4332;
  --cr-status-progress-bg: #E0EDF8;
  --cr-status-progress-fg: #1E40AF;
  --cr-status-danger-bg: #FEE2E2;
  --cr-status-danger-fg: #991B1B;

  /* Typography Scale */
  --cr-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --cr-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  --cr-text-xs: 0.75rem;    /* 12px */
  --cr-text-sm: 0.84375rem; /* 13.5px */
  --cr-text-base: 0.9375rem;/* 15px */
  --cr-text-lg: 1.0625rem;  /* 17px */
  --cr-text-xl: 1.25rem;    /* 20px */
  --cr-text-2xl: 1.5rem;    /* 24px */
  --cr-text-3xl: 1.875rem;  /* 30px */

  /* Spacing Scale */
  --cr-radius-sm: 4px;
  --cr-radius-md: 6px;
  --cr-radius-lg: 8px;

  /* Transitions */
  --cr-transition-fast: 150ms cubic-bezier(0.16, 1, 0.3, 1);
  --cr-transition-normal: 250ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 3. Hallmark Quality Floor Rules Adhered To

1. **Every color and font goes through declared tokens:** No raw inline hex values scattered in components.
2. **Never `transition: all`:** Explicitly animate only `opacity` and `transform`.
3. **No tracked capitals or all-caps eyebrows:** Section labels, headers, and badge pills use sentence or lower case in the body face.
4. **Hero discipline:** Main workspace and flight deck headers are clear, immediate, and visible at 1280x800 without scrolling.
5. **No AI clichés:**
   - No purple-to-blue gradients.
   - No generic cards inside cards.
   - No fake counting marks or artificial logo walls.
   - Real campus club terminology: IEEE, GDG, ACM, AWS Cloud Clubs, Dean of Student Affairs.

---

## 4. Anime.js Motion Guidelines

Motion in ClubRelay must be **subtle, fast, and purposeful**:

- **Staggered Card Intros:**
  When loading the dashboard, event list, or memory repository, card elements fade in with a 20ms stagger:
  `opacity: [0, 1]`, `translateY: [6, 0]`, `duration: 350`, `ease: 'easeOutQuad'`.
- **Handover Step Sign-Off:**
  When a section is marked complete, the progress bar animates to its new percentage smoothly over 400ms.
- **Accessibility:**
  Always honor `prefers-reduced-motion: reduce`. The `useAnimeScope` hook immediately skips animation when active.
