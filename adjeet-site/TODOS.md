# AD-JEET Site: Design TODOs

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
**Done 2026-05-02 (v2).** Sharp rectangular plates (no rounded corners), amber 3px left-border for national brands (Airtel, Jio, Havells, Vivo, OYO, Emami, Adani), rule-color left-border for regional brands. Fraunces for brand name, JetBrains Mono for sector tag. Ink-fill primary button replacing blue rounded button. Sector-color mapping removed.

### [ ] Integrate HeroSandbox into page.tsx as second section
**Deferred 2026-05-02** (removed from homepage per /plan-eng-review). HeroSandbox kept in repo as untracked files. B2B signage buyers convert via WhatsApp, not interactive demos. The three "Before shipping HeroSandbox" issues must be resolved before it can ship anywhere.

---

## From 2026-05-02 plan-design-review

### [x] Redesign Hero (clean slate)
**Done 2026-05-02.** Full rewrite of Hero.tsx + Hero.module.css. Single decorative element: 4px amber left bar (::before). Photo as texture at brightness(0.18). Large Khand heading "North / Bengal's / sign maker." Districts paragraph. Amber-fill WhatsApp primary CTA, outlined secondary, text tertiary. metaBar / copyStack / processBar three-row grid. No blueprint grid, signal field, specimen box, or competing effects.

### [x] SelectedWork: empty state (0 photos)
**Done 2026-05-02.** Added `if (featured.length === 0)` early return with warm copy "Photographing recent projects, see our work in person." and a WhatsApp link.

### [ ] SelectedWork: partial state (1–3 photos)
**Low priority.** The current layout already shows PlaceholderBox for empty supporting cells, so the grid does not have "empty" cells, it has placeholder boxes. This is acceptable. Address if visually insufficient after real photos are added.

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
**Done 2026-05-02.** `.hiddenInput` uses the visually-hidden pattern (position: absolute; width: 1px; height: 1px; clip; etc.), not display:none.

---

## Before shipping HeroSandbox

HeroSandbox is built but not on the homepage (removed 2026-05-02 per /plan-eng-review). These issues must be resolved before it ships anywhere.

### [x] Fix AnimatePresence key scheme: mid-string edit re-animation bug
**Done 2026-05-02.** Replaced `key={`${i}-${char}`}` (position-based) with `key={entry.id}` (stable UUID per character). State changed from `string` to `CharEntry[] = { id: string; char: string }[]`. Added `getUpdatedChars()` using longest-common-prefix/suffix diffing to preserve IDs for unchanged characters on edit.

### [x] Fix mobile spec card height on HeroSandbox at 375px
**Done 2026-05-02.** Added `max-height: 280px; overflow-y: auto` to `.specCard` inside the `@media (max-width: 640px)` block in Hero.sandbox.module.css.

### [ ] Verify next/font/google in 'use client' component on Next.js 16
**Pending.** Confirm in `next build` output that Khand and Anek Latin declared in Hero.sandbox.tsx ('use client') produce correct preload `<link>` tags. Reference: Hero.tsx (server component) loads the same fonts correctly.

**Depends on:** TypeScript build passing.

---

## From 2026-09-20 plan-design-review (regional pages)

Plan: `design/regional-pages-2026-09-20.md`. Scope is the 27 programmatic
service-area pages at `app/(programmatic)/[slug]/page.tsx`.

### [ ] Doc rot: this file contradicts DESIGN.md
**Flagged 2026-09-20.** Everything above dated May 2026 describes amber accents,
Khand headings, Fraunces and JetBrains Mono. `DESIGN.md` (7 September 2026)
supersedes all of it with Cesura display, Hind Siliguri body and the
cyan/yellow `--signal` pair. DESIGN.md wins. Prune or date-stamp the May entries.

### [ ] DESIGN.md calls `--radius-button` a "pill radius"
**Flagged 2026-09-20.** The token is `2px` (`design/tokens.css:3`). The wording
sets the wrong expectation for anyone implementing chips. Fix the sentence, not
the token.

### [ ] Invert the regional page content hierarchy
Templated `body` is cut; `localBrief` becomes the unheaded lead paragraph. The
two shared blocks merge under one `About {service}` h2. See plan §1.

### [ ] Delete the `.regional-spec` panel and its 34px `dd` rule
`design/fieldwork.css:118` sets every definition value at 34px display type, so
"Confirmed for your site" is the largest text on a 390px screen. Three of the
four rows are filler. See plan §3.

### [ ] Point JSON-LD description at `localBrief`
`buildServiceJsonLd` consumes `page.body`. Once `body` stops rendering, the
schema describes invisible content on 27 pages. See plan §2.

### [ ] Caption fallback gallery photos with their provenance
Only 8 of 109 gallery photos carry a city; none carry Gangtok. ~25 of 27 pages
show photos from elsewhere. See plan §4.

### [ ] Add `defaultCity` / `defaultService` props to LeadForm
Currently takes no props and reads `?city=` from `window.location`. See plan §5.

### [ ] Regional gallery has no empty state
`photos.length > 0 &&` drops the section silently. Unreachable for today's five
services, reachable the moment `PROG_SERVICES` grows. See plan state table.

### [ ] U1: how are the three related cities chosen?
**Open.** No city-to-city distance data exists. Recommendation in the plan is
declared order. Blocks plan task 7 only.
