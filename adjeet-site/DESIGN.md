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
- `ClientShowcase.module.css` — light section, but uses CSS Module for button styles + client plate styles + carousel keyframes (complex enough to warrant a module)

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

**No rounded corners on UI elements.** The design language is industrial / editorial — sharp edges only on buttons, plates, and cards.

- **Buttons:** `border-radius: 0` — never use `rounded`, `rounded-sm`, or `rounded-full`
- **Client plates:** sharp (`border-radius: 0`)
- **Image containers only:** `border-radius: 2px` is acceptable for photo crops (SelectedWork grid)
- **Never:** `rounded-full` (pill shapes), `rounded-lg`, `rounded-md`

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
1. **Primary: "Get Quote on WhatsApp"** — amber fill (`var(--hero-amber)`), dark ink text. Highest visual weight. B2B signage buyers convert via WhatsApp first.
2. **Secondary: "Our Services →"** — outlined/ghost, `border: 1px solid var(--hero-rule)`, paper text.
3. **Tertiary: "View Portfolio"** — text only, muted color, no border.

**Fixed 2026-05-02.** `.whatsappAction` now carries the amber fill. `.servicesAction` is the outlined secondary.

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

---

## Accent Color Policy (2026-05-02 redesign)

**Amber/ochre (`oklch(0.72 0.13 74)` / `#C9962E`) is the sole accent.** It replaces blue as the primary action indicator in the hero zone and as the left-border accent on national brand plates.

Amber appears as:
1. **Hero `::before`** — 4px left bar, full height
2. **Hero primary CTA** — amber fill (`var(--hero-amber)`)
3. **ClientShowcase national brand plates** — 3px left border (`border-left-color: oklch(0.72 0.13 74)`)

Blue (`--blue`) remains in the token system for links and focus rings (accessibility) but is no longer used for filled action buttons or section accents.

---

## ClientShowcase — Plate Design (2026-05-02)

Client plates are sharp rectangular containers. No color-per-sector.

- **All plates:** `background: var(--paper-elevated)`, `border: 1px solid var(--rule)`, `border-left-width: 3px`
- **National brands** (Airtel, Jio, Havells, Vivo, OYO, Emami, Adani Cement): amber left border
- **Regional brands:** `var(--rule)` left border (same as other three sides — visually plain)
- **Brand name:** Fraunces, 0.88rem, 700 weight, `var(--ink)`
- **Sector tag:** JetBrains Mono, 9px, 600 weight, `letter-spacing: 0.14em`, uppercase, `var(--ink-subtle)`

No `rounded`, no color-coded backgrounds, no sector-based color mapping.

---

## What We Don't Do

- No emoji in production UI
- No gradient backgrounds on content sections (fade edges on carousel are acceptable)
- No drop shadows on text
- No per-sector color coding in client plates
- No `rounded-full` pill shapes
- No blue/green/clay/sage UI accents (reserved for future data viz only)
- No competing decorative effects in the same section
- No inline `style={{}}` objects for visual design (dynamic values only)
