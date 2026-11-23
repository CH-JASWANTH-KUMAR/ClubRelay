# ClubRelay — Design Reference Sources & Attributions

This document records the external design references, motion mechanics, and component patterns studied and adapted for ClubRelay's **Campus Energy** visual transformation.

---

## 1. Interactive Mascot Pointer Mechanics

- **Pattern**: Scoped 2D Vector Eye Tracking & Damped Interpolation.
- **Inspirations & References**:
  - *Interactive SVG Eye-Tracking Pupil Controller* (CodePen / CSS-Tricks, Chris Coyier & Jhey Tompkins).
  - *Damped Cursor Following Mechanics* (Linear interpolation `current += (target - current) * factor` using `requestAnimationFrame`).
- **Mathematical Implementation in ClubRelay**:
  - Bounded pupil offset:
    $$\theta = \operatorname{atan2}(\Delta y, \Delta x)$$
    $$d = \min(\sqrt{\Delta x^2 + \Delta y^2}, r_{\max})$$
    $$\text{offset}_x = \cos(\theta) \times d, \quad \text{offset}_y = \sin(\theta) \times d$$
  - Damping: `lerp(curr, target, 0.15)` executed on each frame.
  - Accessibility: Respects `window.matchMedia('(prefers-reduced-motion: reduce)')` by halting the animation loop and fixing pupils at resting eye level. Also disables mouse move listeners on coarse pointer touch devices.

---

## 2. Bento Grid & Layout Patterns

- **Pattern**: Multi-tiered Bento Grid with embedded live UI previews.
- **Inspirations & References**:
  - *21st.dev Component Catalog*: Clean cards, subtle border highlights, pill tags, and interactive preview micro-widgets.
  - *shadcn/ui Dashboard Architecture*: Balanced typography, consistent border radius scale (`rounded-xl` / `rounded-2xl`), accessible modal focus rings.
- **Adaptation**:
  - Custom Tailwind 3.4 implementation without heavy runtime dependencies.
  - 4 Pillars: Community (6-col), Operations (6-col), Engineering (6-col), Continuity (6-col).
  - Sub-widgets rendered directly inside cards showcasing real platform screens (event status pills, repository links, handover sign-offs).

---

## 3. Hallmark Design Guidelines & Gate Compliance

All marketing and dashboard interfaces were verified with the Hallmark mechanical gate checker (`sloplint.mjs`), ensuring zero AI design tropes:
- **No Floating Blurred Orbs**: Removed all `blur-3xl` absolute color blobs in favor of crisp elevation, borders, and clean radial gradient backdrops.
- **No Over-tracked Uppercase Eyebrows**: Replaced uppercase micro-tags with natural sentence case pills (`text-xs font-semibold`).
- **No Glued Arrows in Links**: Link text uses clear verbs (`Sign In to Account`, `Open Your Workspace`) without trailing `→` glued to the label.
- **Balanced Headlines**: Enabled CSS `text-wrap: balance` across display headings (`h1`, `h2`, `h3`, `h4`, `.font-heading`).
- **Concise Button Labels**: Every action button conforms to $\le 24$ characters.
- **Typographic Characters**: Uses proper typographic quotes (`’`, `“`, `”`) rather than straight quotes in prose copy.
