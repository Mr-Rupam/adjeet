# Design System: AD JEET

**Rewritten 2026-09-04 from the shipped code.** The previous version described
an earlier era of this site: Khand/Anek Latin/Source Serif 4 fonts that are no
longer installed, an amber accent that is now blue, and five components
(`ClientShowcase`, `SelectedWork`, `TheStandard`, `ByTheNumbers`,
`ServicesIndex`) that no longer exist. Everything below was read out of the
current source. **The code is the authority; when they disagree, fix this file.**

---

## The world

Street signage, seen from the pavement. Sharp cut edges, hard plate shadows like
layered acrylic, a cutting-mat grid, paper grain, and letterforms that belong on
a North Bengal shopfront. Two states: **Day** (warm paper) and **Night** (the
street after dark, where signs glow). The night is not a dark-mode
afterthought. It is when the product is judged.

---

## Type

| Face | Role | CSS var | Where |
|---|---|---|---|
| **Anton** | Display | `--font-anton` | `.display`, for headlines, wordmark, numerals |
| **Inter** | Body / UI | `--font-inter` | Default on `body` |
| **JetBrains Mono** | Spec labels | `--font-mono` | `.spec`, the workshop voice |

Anton is a single weight (400), effectively all-caps by usage. It was chosen as
"the letterform of Indian street hoardings, flex banners, and painted shop
boards". See `app/fonts.ts`.

`.spec` is mono, uppercase, `letter-spacing: 0.2em`, 10px. It is the site's
entire label system. **It is small, so its colour must clear 4.5:1**. See below.

Scale lives in `design/tokens.css`: `--text-mega` (hero wordmark),
`--text-display-1`, `--text-display-2`, then body sizes.

---

## Colour

Defined in `design/tokens.css`, exposed to Tailwind through `@theme`
(`bg-paper`, `text-ink`, `border-rule`, …). Dark values live under
`:root[data-theme="dark"]`.

| Token | Day | Night | Notes |
|---|---|---|---|
| `--paper` | `#F4EFE5` | `#0A0D15` | Page ground |
| `--ink` | `#16130C` | `#F2EDE0` | Primary text |
| `--ink-muted` | `#524B3C` | `#BFB7A5` | Secondary, 7.54:1 on paper |
| `--ink-subtle` | `#72695A` | `#837C6D` | Tertiary, 4.72:1 on paper |
| `--signal` | `#176A96` | `#3FA6DE` | The accent. Signage blue |
| `--signal-ink` | `#FFFFFF` | `#0A0D15` | **Foreground for anything ON `--signal`** |
| `--rule` | `#DCD2BE` | `#242B3D` | Borders |

### The one colour rule that is easy to get wrong

**Never put `text-ink` on `bg-signal`.** Both `--signal` and `--ink` flip
*lighter* between day and night, so they move together and the pair collapses.
It measured **2.33:1** in night mode on the primary WhatsApp CTA and across the
whole `CommissionCTA` panel.

Use `--signal-ink`, which is set per theme specifically for this: white on the
day blue (5.93:1), near-black on the night blue (7.14:1).

This one recurs. It was fixed in two components, then found in eight more
(the submit button, `Button`, `Badge`, `SkipLink`, the Contact and service CTAs,
the success tick, and the closing panel on every city page). Before shipping any
surface that sits on the accent, grep for `bg-signal` and check what colour the
text on it resolves to in **both** themes.

Related: don't reach for alpha (`text-ink/70`) on a saturated ground. Reduced
alpha over `--signal` is what dragged the supporting copy under the floor. Use a
solid token and get hierarchy from the type scale.

### Contrast floor

Body and label text ≥ 4.5:1; large display text ≥ 3:1. `.spec` is 10px, so it never
counts as "large text" and needs the full 4.5:1. Both `--ink-subtle` and
`--signal` were deepened in Sept 2026 for exactly this reason; check any new
value with the WCAG relative-luminance formula rather than by eye.

---

## Shape and elevation

**No rounded corners on UI.** Sharp edges only: buttons, plates, cards.
`border-radius: 0`. The one exception is a 2px radius on photo crops.

Depth is a hard offset plate shadow, not a soft glow:
`--plate-shadow: 6px 6px 0 0 var(--ink)`. On a `--signal` ground use a black
alpha shadow instead, because `var(--ink)` inverts to near-white at night and vanishes.

---

## Motion

`framer-motion` for entrance and hover choreography; CSS keyframes for the
marquees (`animate-marquee`). Every animation must respect
`prefers-reduced-motion`, via `useReducedMotion()` in JS, `motion-reduce:` variants
in CSS, and the reduced path must preserve the state change, not just delete it.

**WCAG 2.2.2 is satisfied by `MarqueePause`** (mounted in the footer). It sets
`data-marquees="paused"` on the root and `app/globals.css` halts every
`.animate-marquee` from there, so one control stops all five. Any new marquee
must use the `animate-marquee` class to inherit this, and sit inside a
`.marquee-track` wrapper to get hover and focus pausing.

---

## Accessibility invariants

These are load-bearing; a change that breaks one is a regression, and each has a
test.

- **`ShutterText` must contribute its string as text exactly once.** It draws
  every character up to four times; the decorative copies are painted from
  `data-char` via `.shutter-char::before` and fenced behind one `aria-hidden`
  wrapper, with the readable string in an `.sr-only` span. Rendering those
  copies as text nodes put `"AAAADDDD JJJJEEEEEEEETTTT"` into the `<h1>`.
  **Do not reintroduce `role="text"`**. It is not in the ARIA spec.
- **Touch targets ≥ 44×44** at 375px. The footer WhatsApp/Call links and the
  header controls are the ones that regress; raise the hit area with
  `inline-flex min-h-11` rather than changing type size.
- **The mobile header must always carry a contact action.** It is the product's
  entire purpose; it once sat 545px down the page.

---

## Content invariants

Coverage and tenure numbers come from **`lib/coverage.ts`**: `FOUNDED_YEAR`,
`YEARS_ACTIVE`, `COVERAGE_AREAS`, `DISTRICTS_SERVED`. Never type them inline.
They previously drifted into four different district counts across nine files,
and a hardcoded "35 years" that had already gone stale.

`areaServed` in the LocalBusiness JSON-LD derives from `COVERAGE_AREAS`, so the
structured data cannot under-claim what the page says.

**One `LocalBusiness` per page**, emitted once from the root layout
(`app/layout.tsx`) so programmatic city pages are covered too.

---

## Current structure

- `components/street/` holds the homepage acts, in order: `StreetHero`,
  `ClientStreet`, `ServicesBoard`, `NightWork`, `StandardPlates`,
  `CoverageBoard`, `CommissionCTA`. Plus `PageMasthead` and `ShutterText`.
- `components/ui/` holds `QuoteCTA` (the primary conversion action; reuse it
  rather than hand-rolling another), `Button`, `Accordion`, `Lightbox`, `ThemeToggle`,
  `ConsentBanner`, form controls.
- `components/sections/` holds `LeadForm` and `GalleryStrip`.
- `design/tokens.css` holds all tokens. `app/globals.css` holds element styles and
  effects (`.display`, `.spec`, `.glow-tube`, `.grid-mat`, `.grain`,
  `.shutter-char`).

### Known drift, not yet resolved

- The eyebrow/kicker above a heading appears ~14 times site-wide. It is the one
  item Impeccable's craft floor bans outright rather than merely defaults
  against. Not yet addressed, because removing it is a composition decision
  per section, not a find-and-replace.
- Decorative sequence numbering (`01–10`, `STD-01`, `R-01`) appears in five
  different costumes and carries no information in any of them.
