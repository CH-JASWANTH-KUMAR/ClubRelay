# ClubRelay — UI Component Inventory & Design Sources

This document provides a component-by-component inventory of all primitives and marketing components created or refactored for the **Campus Energy** visual transformation.

---

## 1. Brand & Marketing Components

### `RelayMascot` (`client/src/components/brand/RelayMascot.jsx`)
- **Purpose**: Original interactive vector mascot character representing institutional memory and continuity.
- **Props**:
  - `size`: `'sm'` (36px), `'md'` (56px), `'lg'` (88px), `'xl'` (128px), `'hero'` (220px). Default: `'md'`.
  - `interactive`: Boolean. Enables RAF pointer tracking. Default: `true`.
  - `className`: Custom style overrides.
- **Mechanics**:
  - Pointer tracking with trigonometric angle/radius calculation.
  - Linear interpolation (`lerp = 0.15`) running in `requestAnimationFrame`.
  - Automatic eye blink loop with dynamic 4-6 second intervals.
  - Accessibility: `aria-hidden="true"`, reduced-motion and touch device detection.

### `MarketingNavbar` (`client/src/components/marketing/MarketingNavbar.jsx`)
- **Purpose**: Responsive top navigation with brand identity, anchor links, and auth-state-aware action button.
- **Props**: None (uses `useAuth()` and `useNavigate()`).
- **Features**: Desktop horizontal menu, mobile slide-down drawer, backdrop blur with `--color-surface/90`.

### `MarketingHero` (`client/src/components/marketing/MarketingHero.jsx`)
- **Purpose**: High-energy hero section with the core value proposition and interactive mascot pairing.
- **Features**: Balanced headline typography, floating live status cards, dual CTAs.

### `ProblemSection` (`client/src/components/marketing/ProblemSection.jsx`)
- **Purpose**: Articulates the four failure modes of student organizations (Leadership Amnesia, Tool Sprawl, Orphaned Projects, Vanished Partners).
- **Features**: 4-column responsive grid with color-coded impact pills.

### `BentoFeatures` (`client/src/components/marketing/BentoFeatures.jsx`)
- **Purpose**: 4-pillar bento grid detailing Community, Operations, Engineering, and Continuity.
- **Features**: 12-column responsive layout with embedded mini-previews.

### `HowItWorks` (`client/src/components/marketing/HowItWorks.jsx`)
- **Purpose**: 3-step sequential journey through semester operations and leadership handovers.
- **Features**: High-contrast numbered headers and phase progress tags.

### `CampusCommunities` (`client/src/components/marketing/CampusCommunities.jsx`)
- **Purpose**: Showcase the collegiate domains supported by ClubRelay.
- **Features**: Interactive cards for Developer Collectives, Robotics, E-Cells, Design Societies, and Student Councils.

### `ProductPreview` (`client/src/components/marketing/ProductPreview.jsx`)
- **Purpose**: Tabbed preview of actual workspace screens.
- **Features**: 5 pill tabs (Club Workspace, Event Cockpit, My Work, Handover Center, Campus Operations) with real UI states.

### `DragCards` (`client/src/components/marketing/DragCards.jsx`)
- **Purpose**: Interactive draggable showcase representing the Four Pillars of High-Performing Clubs (Community, Operations, Engineering, Continuity).
- **Source Pattern**: Adapted from Hover.dev draggable physics card pattern, styled exclusively within Campus Energy palette.
- **Features**:
  - Pointer Event tracking with coordinate clamping (`Math.max(-280, Math.min(280, ...))`) to prevent card loss.
  - Dynamic Z-Index elevation on drag and focus.
  - Accessible keyboard tab controls (`role="tablist"`) with explicit "Bring to Front" and "Reset Positions" triggers.
  - Mobile responsive grid fallback with zero horizontal overflow.

### `MarketingFooter` (`client/src/components/marketing/MarketingFooter.jsx`)
- **Purpose**: Final conversion banner, product pillar directory, and university security trust statement.

---

## 2. React Bits Animation Components

### `SplitText` (`client/src/components/ui/SplitText.jsx`)
- **Purpose**: Word-by-word staggered entrance animation for hero headlines.
- **Source Pattern**: React Bits text animation primitive rewritten in zero-dependency React + CSS keyframes.
- **Features**: Configurable word stagger delay, automatic `prefers-reduced-motion` detection, balanced word wrapping.

### `Magnet` (`client/src/components/ui/Magnet.jsx`)
- **Purpose**: Subtle magnetic cursor pull interaction for primary conversion CTAs.
- **Source Pattern**: React Bits magnetic interaction primitive.
- **Features**: Radius proximity detection, smooth cubic-bezier spring return, honors reduced-motion preferences.

### `AnimatedContent` (`client/src/components/ui/AnimatedContent.jsx`)
- **Purpose**: Viewport scroll reveal container.
- **Source Pattern**: React Bits scroll reveal primitive using native `IntersectionObserver`.
- **Features**: Distance and threshold configuration, automatic unobservation once revealed, jsdom/SSR safety fallback.

---

## 3. Dark Grid Auth Experience

### `Login` (`client/src/pages/Login.jsx`)
- **Purpose**: Multi-tenant institutional authentication screen.
- **Source Pattern**: Adapted from Hover.dev Dark Grid design pattern into the Campus Energy visual system.
- **Aesthetic**:
  - Deep Ink Navy background (`#192B42`).
  - High-precision Electric Blue grid lines (`#315BDB` with radial focal glow).
  - Frosted dark container (`#122033/90 backdrop-blur-md`).
- **Features**:
  - Provider status polling via `/api/v1/auth/providers`.
  - Google and GitHub single-sign-on triggers with official SVGs.
  - Institutional email credentials login.
  - Zero pre-filled demo data (clean empty defaults).
  - OAuth redirect error banner mapping query codes (`invalid_state`, `unverified_email`, etc.).
  - Responsive layout with interactive Relay Mascot.

---

## 4. Evaluation Notes: Hover.dev Pro & Testimonials
- **Hover.dev Pro Restrictions**: Components requiring proprietary Pro licenses (such as Flip Calendar and Stagger Testimonials) were evaluated and explicitly not copied. Instead, genuine full-fidelity components were developed natively.
- **Anti-Fabrication Policy**: In accordance with product design ethics, no fake customer quotes, fabricated testimonials, or simulated endorsements were introduced. Future student organization testimonials will be integrated from authenticated campus reviews.

---

## 5. Design System UI Primitives

### `Button` (`client/src/components/ui/Button.jsx`)
- **Variants**: `primary` (Electric Blue `#315BDB`), `secondary` (Surface with `#E5E9E8` border), `outline` (Transparent with Electric Blue border), `ghost` (Minimalist muted hover), `danger` (Crimson `#DC2626`).
- **Sizes**: `sm`, `md`, `lg`.
- **Border Radius**: `rounded-xl`.
- **Focus Ring**: `focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2`.

### `Badge` (`client/src/components/ui/Badge.jsx`)
- **Variants**: `default`, `draft`, `proposed`, `approved`, `planning`, `inProgress`, `completed`, `archived`, `urgent`, `high`, `medium`, `low`.
- **Pill Shape**: `rounded-full` with custom matched background and border tints.

### `Card` & `CardHeader` (`client/src/components/ui/Card.jsx`)
- **Border Radius**: `rounded-2xl`.
- **Background**: `bg-surface` (`#FCFDFD`) with subtle shadow and transition.

### `Input` & `Textarea` (`client/src/components/ui/Input.jsx`)
- **Focus State**: `focus:border-brand-500 focus:ring-1 focus:ring-brand-500`.
- **Typography**: Labels in `text-ink font-semibold`, placeholder in `text-mutedSlate/60`.

### `Select` (`client/src/components/ui/Select.jsx`)
- **Focus State**: `focus:border-brand-500 focus:ring-1 focus:ring-brand-500`.

### `Modal` (`client/src/components/ui/Modal.jsx`)
- **Features**: Portal-ready modal dialog with `Escape` key capture, body scroll lock, backdrop blur, and accessible focus outlines.

### `Progress` (`client/src/components/ui/Progress.jsx`)
- **Bar Color**: `bg-brand-500`.
- **Animation**: Smooth CSS transform transition.

### `EmptyState` & `Avatar` (`client/src/components/ui/EmptyState.jsx`)
- **EmptyState**: Dashed border container with icon capsule in `bg-brand-50 text-brand-600`.
- **Avatar**: Two-letter uppercase initials on `bg-brand-100 text-brand-800` border capsule.

### `CommandPalette` (`client/src/components/ui/CommandPalette.jsx`)
- **Features**: Keyboard shortcut `⌘K`, real-time query filtering, active organization navigation, arrow key traversal.

---

## 3. Reference & Framework Sources

1. **21st.dev Design Catalog**:
   - Studied open bento layout structures, interactive pill switchers, and subtle card borders.
2. **Tailwind CSS 3.4**:
   - Modern semantic token variables mapped in `tailwind.config.js`.
3. **Lucide React**:
   - Consistent stroke-width (`2px`) icon system.
4. **Google Fonts (Outfit & DM Sans)**:
   - High readability display pairing for modern educational applications.

