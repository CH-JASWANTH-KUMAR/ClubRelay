# ClubRelay — Campus Energy Brand System & Design Tokens

## 1. Brand Identity Overview

- **Product**: ClubRelay — The institutional memory and operations platform for university clubs and technical societies.
- **Brand Purpose**: University student organizations lose momentum every graduation cycle. ClubRelay turns annual leadership transitions into an advantage by preserving operational memory, tasks, contacts, and technical assets across graduating batches.
- **Creative Direction**: **Campus Energy** — bright, optimistic, collaborative, technically ambitious, youthful yet professional for university administrations.
- **Taglines**:
  - Primary: *"Build the club. Keep the momentum."*
  - Supporting: *"The work continues. The knowledge stays."*

---

## 2. Palette & Design Tokens

The color architecture is built around vibrant campus energy anchored by deep institutional ink navy:

| Token Name | Hex Code | Role & Usage | Contrast vs White / Canvas |
|---|---|---|---|
| **Ink Navy** (`ink-500` / `--color-ink`) | `#192B42` | Primary text, high-contrast headings, active dark elements | 13.8:1 (AAA) |
| **Electric Blue** (`brand-500` / `--color-brand-primary`) | `#315BDB` | Primary brand accent, primary CTA buttons, focus rings | 5.2:1 (AA) |
| **Electric Blue Soft** (`brand-50` / `--color-brand-primary-soft`) | `#EEF2FD` | Brand tints, active list items, selected pills | Background tint |
| **Fresh Mint** (`mint-500` / `--color-mint`) | `#2CBF9B` | Success states, approved statuses, verified handovers | 3.2:1 (graphical/pill) |
| **Mint Soft** (`mint-50` / `--color-mint-soft`) | `#EAF8F5` | Approved badge backgrounds, status pill tints | Background tint |
| **Warm Coral** (`coral-500` / `--color-coral`) | `#FF886B` | Urgent priorities, problem callouts, technical deliverables | 2.5:1 (pill/accent) |
| **Warm Coral Dark** (`coral-700` / `--color-coral-dark`) | `#D95E41` | High-priority text, alert status typography | 4.8:1 (AA) |
| **Sunny Yellow** (`sunshine-500` / `--color-sunshine`) | `#F6C85F` | Pending approvals, warning banners, sparkles, highlights | 1.6:1 (pill/accent) |
| **Sunny Yellow Dark** (`sunshine-800` / `--color-sunshine-dark`) | `#B88D22` | Proposed badge typography, amber warnings | 4.6:1 (AA) |
| **Soft Canvas** (`canvas` / `--color-canvas`) | `#F7F8F4` | Global viewport background, off-white page body | Neutral base |
| **Surface White** (`surface` / `--color-surface`) | `#FCFDFD` | Card backgrounds, modals, elevated panels (tinted base) | Clean elevation |
| **Subtle Neutral** (`subtle` / `--color-subtle`) | `#F1F3EE` | Inactive pill backgrounds, secondary hover states | Surface level 2 |
| **Fine Border** (`border` / `--color-border`) | `#E5E9E8` | Card outlines, tab dividers, hairline separators | Subtle border |
| **Muted Slate** (`mutedSlate` / `--color-muted`) | `#68788B` | Secondary body text, captions, metadata | 4.9:1 (AA) |

---

## 3. Typography Architecture

ClubRelay pairs two Google Fonts loaded with `preconnect` and `display=swap`:

### Heading Font: **Outfit** (`font-heading`)
- **Weights**: 600 (SemiBold), 700 (Bold), 800 (ExtraBold).
- **Usage**: Page titles (`h1`, `h2`, `h3`, `h4`), hero headlines, card titles, modal headers.
- **Rule**: Equipped with `text-wrap: balance` to prevent orphaned words on display titles.

### Body Font: **DM Sans** (`font-sans`)
- **Weights**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold).
- **Usage**: Paragraphs, table contents, form labels, buttons, navigation items.

### Code Font: System Monospace (`font-mono`)
- **Usage**: Keyboard shortcuts (`⌘K`), technical tags, commit hashes.

---

## 4. Relay — The Interactive Mascot

### Character Geometry
- **Form**: Friendly rounded collegiate robot with antenna, expressive rounded OLED screen visor, interactive pupils, and warm cheeks.
- **Antenna**: Features a bright cyan pulsing connectivity nodule representing live knowledge synchronization.
- **Visor Face**: Dark Navy (`#192B42`) recessed face shield with dual dynamic eyes.
- **Cheeks**: Soft Coral blush circles (`#FF886B`) giving the character warmth and approachable campus charm.

### Interaction Mechanics
- **Eye Tracking**: Pupils calculate pointer offset relative to the character center using trigonometric `Math.atan2` and `Math.min(distance, maxRadius)`.
- **Smooth Animation**: Movement interpolated smoothly via `requestAnimationFrame` with a linear damping factor (`lerp = 0.15`).
- **Periodic Blinking**: Subtle automatic eye blink cycle triggers every 4 to 6 seconds using SVG `transform: scaleY(...)`.
- **Accessibility**:
  - `aria-hidden="true"` so screen readers bypass decorative graphics.
  - Obeys `prefers-reduced-motion`: pauses tracking and blinking loops for users requesting reduced motion.
  - Disables pointer-tracking listeners on touch-only coarse pointer devices to save mobile battery life.

---

## 5. Component Style Guidelines

- **Buttons**:
  - Border radius: `rounded-xl` (`12px`).
  - Minimum touch target: `36px` sm, `40px` md, `44px` lg.
  - Labels: Concise action verbs ($\le 24$ characters). No glued decorative arrows inside links.
- **Cards**:
  - Background: `bg-surface` (`#FCFDFD`), border `border-border` (`#E5E9E8`), shadow `shadow-card`.
  - Corner radius: `rounded-2xl` (`16px`).
- **Badges**:
  - Pill shape: `rounded-full`, padding `px-2.5 py-0.5`.
  - Semantic variants: Approved (`#EAF8F5` / `#1F8A70`), Planning (`#EEF2FD` / `#1F3EA8`), Proposed (`#FEF8EB` / `#B88D22`), Urgent (`#FFF3F0` / `#D95E41`).
- **Focus Rings**:
  - Strict high-visibility keyboard outline: `focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2`.
