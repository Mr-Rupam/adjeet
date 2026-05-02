# AD-JEET Site — Design TODOs

Tracked from /plan-design-review session (2026-05-01). See DESIGN.md for the design system rules.

---

## Critical (blocks shipping)

### [x] Write CSS for Hero.sandbox.tsx
**Done 2026-05-02.** Hero.sandbox.module.css created with full OKLCH dark editorial styling, three material themes (glowsign/acpled/wallpaint), all class names implemented.

---

## High priority

### [x] Create DESIGN.md
**Done 2026-05-02.** DESIGN.md created at adjeet-site/DESIGN.md with font pairing, CSS approach matrix, token colors, corner radius, animation, accessibility, Hero CTA hierarchy, SectionLabel spec, and section transition rules.

### [x] Redesign ClientShowcase to match editorial system
**Done 2026-05-02.** Rounded-full pills removed, star emoji badge removed, heading updated to "Airtel. Jio. Havells. They chose AD-JEET for North Bengal.", layout left-aligned, keyframe animations moved to ClientShowcase.module.css with prefers-reduced-motion + pause-on-hover.

### [ ] Integrate HeroSandbox into page.tsx as second section
**Deferred 2026-05-02** (removed from homepage per /plan-eng-review). HeroSandbox kept in repo as untracked files. B2B signage buyers convert via WhatsApp, not interactive demos. The three "Before shipping HeroSandbox" issues must be resolved before it can ship anywhere.

---

## From 2026-05-02 plan-design-review

### [x] Fix Hero CTA visual hierarchy
**Done 2026-05-02.** Swapped CSS treatments in Hero.module.css: `.whatsappAction` now has `background: var(--hero-paper); color: var(--hero-ink)` (visually dominant paper fill). `.primaryAction` ("Our Services") now has dark semi-transparent treatment.

### [x] SelectedWork: empty state (0 photos)
**Done 2026-05-02.** Added `if (featured.length === 0)` early return with warm copy "Photographing recent projects — see our work in person." and a WhatsApp link.

### [ ] SelectedWork: partial state (1–3 photos)
**Low priority.** The current layout already shows PlaceholderBox for empty supporting cells, so the grid does not have "empty" cells — it has placeholder boxes. This is acceptable. Address if visually insufficient after real photos are added.

### [x] Extract SectionLabel component
**Done 2026-05-02.** Created `adjeet-site/components/ui/SectionLabel.tsx` + `SectionLabel.module.css`. Replaced inline style objects in ServicesIndex, TheStandard, SelectedWork, and ByTheNumbers.

### [x] Fix Lightbox counter text contrast
**Done 2026-05-02.** Changed `text-ink-muted` to `text-white/60` on the `{idx + 1} / {total}` counter `<p>` in Lightbox.tsx.

---

## Standard

### [x] Add blurDataURL to Hero Image
**Done 2026-05-02.** Added `placeholder="blur"` and a 1×1 dark blue-grey base64 blurDataURL to the full-viewport `<Image>` in Hero.tsx.

### [x] Add character counter to HeroSandbox input
**Done 2026-05-02.** Counter `{text.length} / {MAX_CHARS}` implemented in Hero.sandbox.tsx with `.counter` / `.counterWarn` CSS classes in Hero.sandbox.module.css. Color shifts to amber (sb-accent) at ≥10 chars.

### [x] Add prefers-reduced-motion to ClientShowcase animations
**Done 2026-05-02.** `@media (prefers-reduced-motion: reduce)` block added to ClientShowcase.module.css. Also added pause-on-hover and pause-on-focus-within via `.carouselWrap:hover` / `:focus-within` selectors.

### [x] Write mobile responsive CSS for HeroSandbox
**Done 2026-05-02.** `@media (max-width: 640px)` block added to Hero.sandbox.module.css: single-column stage, full-width sign, horizontal-scroll material picker row, full-width CTA buttons.

### [x] Audit hidden-input accessibility in HeroSandbox
**Done 2026-05-02.** `.hiddenInput` uses the visually-hidden pattern (position: absolute; width: 1px; height: 1px; clip; etc.) — not display:none.

---

## Before shipping HeroSandbox

HeroSandbox is built but not on the homepage (removed 2026-05-02 per /plan-eng-review). These issues must be resolved before it ships anywhere.

### [x] Fix AnimatePresence key scheme — mid-string edit re-animation bug
**Done 2026-05-02.** Replaced `key={`${i}-${char}`}` (position-based) with `key={entry.id}` (stable UUID per character). State changed from `string` to `CharEntry[] = { id: string; char: string }[]`. Added `getUpdatedChars()` using longest-common-prefix/suffix diffing to preserve IDs for unchanged characters on edit.

### [x] Fix mobile spec card height on HeroSandbox at 375px
**Done 2026-05-02.** Added `max-height: 280px; overflow-y: auto` to `.specCard` inside the `@media (max-width: 640px)` block in Hero.sandbox.module.css.

### [ ] Verify next/font/google in 'use client' component on Next.js 16
**Pending.** Confirm in `next build` output that Khand and Anek Latin declared in Hero.sandbox.tsx ('use client') produce correct preload `<link>` tags. Reference: Hero.tsx (server component) loads the same fonts correctly.

**Depends on:** TypeScript build passing.
