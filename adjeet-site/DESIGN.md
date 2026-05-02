# Design System — AD-JEET Site

## Font Pairing

| Font | Weights | Role | Where Used |
|------|---------|------|------------|
| **Khand** | 500 / 600 / 700 | Display / headings | Hero, HeroSandbox **only** |
| **Anek Latin** | 400 / 500 / 600 / 700 | Body / labels | Hero, HeroSandbox **only** |
| **Fraunces** | variable | Serif headings | All other sections |
| **Inter** | variable | Body / UI | All other sections |

**Rule:** Khand and Anek Latin are hero-zone fonts. Do not use them outside `Hero.tsx` or `Hero.sandbox.tsx`. If you're building a new section that is not a dark editorial hero, use Fraunces + Inter.

Both hero fonts are loaded with `variable` CSS custom properties (`--font-hero-display`, `--font-hero-body`) and applied as className on the hero section root element so they cascade only within that section.

---

## CSS Approach — Module vs. Tailwind

| Section type | CSS approach | Reason |
|---|---|---|
| Dark / editorial / full-bleed | **CSS Modules** | Needs OKLCH colors, layered backgrounds, complex `text-shadow`, isolated custom properties |
| Light / content sections | **Tailwind utilities** | Design-token colors available via `@theme` (see `design/tokens.css`), standard layout |

**Rule:** If a section has a dark or cinematic aesthetic, create a `.module.css` file. If it sits on the paper background with standard layout, use Tailwind utilities. Do not mix approaches in the same component — pick one per component.

**Known examples:**
- `Hero.module.css` — dark editorial, OKLCH
- `Hero.sandbox.module.css` — dark editorial, OKLCH, three material themes
- `ClientShowcase.module.css` — **exception**: Tailwind layout + a module file for global keyframe animations only (keyframes cannot live in Tailwind)

---

## Token Color System

Defined in `design/tokens.css`. Available as Tailwind utilities via `@theme` (e.g. `bg-paper`, `text-ink`, `border-rule`).

| Token | Hex | Semantic meaning |
|-------|-----|-----------------|
| `paper` | `#F7F3EC` | Warm white — default page background |
| `paper-elevated` | `#FBF8F3` | Slightly lighter — cards, hover states |
| `ink` | `#1A1916` | Near-black — primary text |
| `ink-muted` | `#4A4741` | Secondary text |
| `ink-subtle` | `#8A857C` | Tertiary / placeholder text |
| `rule` | `#E4DDD0` | Borders, dividers |
| `blue` (adjeet-blue) | `#1E7FB8` | Brand blue — primary actions, links |
| `blue-deep` | `#134C70` | Darker brand blue — hover states |
| `ochre` | `#C9962E` | Warm accent — highlights, badges |
| `clay` | `#A6503A` | Earth accent — tags, sector pills |
| `sage` | `#6B7C5A` | Cool accent — success states, nature |
| `slate` | `#455362` | Neutral dark — neutral sector tags |
| `success` | `#3F7A4E` | Positive states |
| `warning` | `#B8862A` | Warning states |
| `error` | `#A63D3D` | Error states |

Dark mode equivalents are defined in `design/tokens.css` under `[data-theme="dark"]`.

---

## Corner Radius Policy

**No `rounded-full`** anywhere in this codebase. The design language is industrial / editorial — sharp or minimally-rounded corners only.

Allowed: `rounded` (4px), `rounded-sm` (2px), or no rounding. Never `rounded-full` (pill shape).

---

## Animation Policy

| Animation driver | Where used | Notes |
|---|---|---|
| **framer-motion** | Hero, HeroSandbox | Per-character stagger, material switch, entry/exit. Use `<MotionConfig reducedMotion="user">` to respect OS motion preference. |
| **CSS keyframes** | ClientShowcase | Infinite scroll carousels. Defined in `ClientShowcase.module.css`, not in a `<style>` tag. |
| **CSS transitions** | All sections | Hover states, opacity changes. |

**Rule:** framer-motion is restricted to the hero/sandbox zone. Do not add framer-motion dependencies to light content sections. CSS transitions are preferred everywhere else.

---

## Section Transitions

**Editorial cut rule:** The Hero section terminates with a single `border-bottom: 1px solid var(--rule)` line. The ClientShowcase section opens on the paper background immediately below. The dark-to-light contrast is intentional editorial design — the cinematic hero gives way to evidence and copy. **Do not add a bridge section, gradient fade, or transition element between Hero and ClientShowcase.**

This is a documented design decision (2026-05-02). The contrast IS the rhythm.

---

## Hero CTA Hierarchy

The Hero has three CTAs in `.actionRow`:
1. **Primary: "Get Quote on WhatsApp"** — filled button, adjeet-blue or paper fill, highest visual weight. B2B signage buyers convert via WhatsApp call first.
2. **Secondary: "Our Services →"** — outlined/ghost button, border-rule, ink text.
3. **Tertiary: "View Portfolio"** — text-only link, inline.

**Current state (as of 2026-05-02):** The CSS class names are semantically correct (`primaryAction`, `whatsappAction`, `textAction`) but the visual treatment is reversed — `primaryAction` ("Our Services") has the filled paper treatment and `whatsappAction` has the dark semi-transparent treatment. **This needs to be fixed: swap the visual treatments so WhatsApp is the visually dominant CTA.**

---

## SectionLabel Component

The section label bar (mono font, 11px, 0.14em tracking, `var(--ink-subtle)` color, border-bottom `var(--rule)`) is a signature pattern used in ServicesIndex, TheStandard, SelectedWork, and ByTheNumbers.

**Pattern:** Extract to `adjeet-site/components/ui/SectionLabel.tsx` with a matching `.module.css`. Props: `number` (e.g. "01"), `label` (e.g. "Services"), optional `href` + `linkText` for the right-side "View all →" link. The inline `style={{}}` objects in each section component should be replaced with this component.

---

## Accessibility Policy

### `prefers-reduced-motion`
All animations must be disabled when the user's OS is set to prefer reduced motion.

- **framer-motion**: wrap the component with `<MotionConfig reducedMotion="user">` — this disables all `motion.*` animations automatically.
- **CSS keyframes**: add `@media (prefers-reduced-motion: reduce) { animation: none; }` in the relevant module file.
- **CSS transitions**: add `transition: none` in the same media query.

### Visually-hidden inputs
Hidden interactive elements (e.g. a text input that is visually replaced by a styled element) must use the visually-hidden CSS pattern — never `display: none` or `visibility: hidden`, which remove the element from the accessibility tree.

```css
.hidden-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Auto-scrolling content
Auto-scrolling carousels must pause on hover and on keyboard focus (`focus-within`). Use `animation-play-state: paused` triggered by CSS `:hover` and `:focus-within` on the carousel wrapper. See `ClientShowcase.module.css` for the pattern.
