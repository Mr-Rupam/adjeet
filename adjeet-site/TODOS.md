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

### [x] Invert the regional page content hierarchy
**Done 2026-09-20** (PR: regional-pages-inversion). `localBrief` is the unheaded lead; the two shared blocks merged under one `About {service}` h2.

Templated `body` is cut; `localBrief` becomes the unheaded lead paragraph. The
two shared blocks merge under one `About {service}` h2. See plan §1.

### [x] Delete the `.regional-spec` panel and its 34px `dd` rule
**Done 2026-09-20.** Panel and `dd` rule deleted, not restyled. Replaced by a "Send us" list and one inline `Nearby:` line at body scale.

`design/fieldwork.css:118` sets every definition value at 34px display type, so
"Confirmed for your site" is the largest text on a 390px screen. Three of the
four rows are filler. See plan §3.

### [x] Point JSON-LD description at `localBrief`
**Done 2026-09-20.** `buildServiceJsonLd` now receives `page.localBrief`; `body` deleted from the interface and the builder.

`buildServiceJsonLd` consumes `page.body`. Once `body` stops rendering, the
schema describes invisible content on 27 pages. See plan §2.

### [x] Caption fallback gallery photos with their provenance
**Done 2026-09-20.** `GalleryStrip` gained an optional `note` prop, rendered only on the `cityPhotos.length === 0` path.

Only 8 of 109 gallery photos carry a city; none carry Gangtok. ~25 of 27 pages
show photos from elsewhere. See plan §4.

### [x] Add `defaultCity` / `defaultService` props to LeadForm
**Done 2026-09-20.** Optional typed props; the `?city=` fallback still works (verified: `/contact?city=Malda` prefills, plain `/contact` stays empty).

Currently takes no props and reads `?city=` from `window.location`. See plan §5.

### [x] Regional gallery has no empty state
**Done 2026-09-20.** `photos.length === 0` renders a heading, a sentence and a WhatsApp link. Still unreachable for the 5 current PROG_SERVICES.

`photos.length > 0 &&` drops the section silently. Unreachable for today's five
services, reachable the moment `PROG_SERVICES` grows. See plan state table.

### [x] U1: how are the three related cities chosen?
**Resolved 2026-09-20.** Rotated declared order via `rotateFrom()`. Plain declared order would have orphaned both Gangtok pages, which sort last. Verified: 3 chips per page, Gangtok linked from 3 pages.

**Open.** No city-to-city distance data exists. Recommendation in the plan is
declared order. Blocks plan task 7 only.

---

## E2E suite (P0) — found during /ship 2026-09-20

16 e2e tests fail on `origin/main`. Verified pre-existing: reverting the five
source files of `regional-pages-inversion` to main reproduces the same failures,
so none are caused by that branch. Three distinct root causes.

### [ ] P0: Turnstile unreachable in the e2e environment (lead-form x2)
`tests/e2e/lead-form.spec.ts:32` and `:48` wait for
`iframe[src*="challenges.cloudflare.com"]` and time out at 10s. Probing
`/contact` live: **0 Turnstile iframes render**, console shows
`ERR_CONNECTION_REFUSED` plus a CSP entry for challenges.cloudflare.com. The
`cf-turnstile-response` field renders, so the component mounts; the widget
never loads. Environmental, not an app bug. Either allow the host in the dev
CSP, or stub Turnstile in the e2e run.

### [ ] P0: Homepage e2e asserts a DOM the site no longer has (x12)
`home-responsive.spec.ts:4` (5 viewports), `home.spec.ts:11/68/75/82`,
`fieldwork.spec.ts:16/181`, `navigation-footer.spec.ts:8`.
Two concrete mismatches:
- `#hero-section + #client-history` resolves to **0 elements** (the adjacent-sibling
  relationship the test asserts no longer exists)
- `#client-history li` has **21** entries, the test expects **19**
These look like the tests lagging the deliberate homepage/client-strip changes
rather than a regression. Decide which DOM is correct, then update the specs.

### [ ] P0: services.spec heading selector is too loose (x1)
`tests/e2e/services.spec.ts:31` uses
`getByRole('heading', { name: /Glow Sign Boards/ })`, which now matches two
elements and trips Playwright strict mode: the `h1` "Glow Sign Boards in
Siliguri" and the gallery `h2` "Glow Sign Boards: 9 project photos". Anchor the
regex or scope it to the `h1`.

---

## Regional pages: remaining coverage (from /ship 2026-09-20)

Coverage audit put the branch at 78% of changed paths (25/32), passing the 60%
minimum and missing the 80% target. Five of the seven gaps are cosmetic or
unreachable. Two are not.

### [ ] P1: e2e the prefilled lead form on a regional page, success path
`tests/e2e/lead-form.spec.ts` covers submit-success on `/contact` only. The form
is new on the 27 regional pages and those carry the highest-intent search
traffic, so a break there costs leads while `/contact` stays green and nothing
flags it. Blocked on the same Turnstile problem as the existing e2e P0: the
widget never loads in this environment, so it needs stubbing or a CSP allowance
first.

### [ ] P1: e2e the prefilled form against a 500 from /api/lead
Same file, same gap. Assert the visitor sees the `role="alert"` banner and the
WhatsApp fallback, and can recover. Covered on `/contact`, not on a regional page.

### [ ] P3: viewport check either side of the 1024px grid switch
`.regional-body` is a single column below 1024px and a `1.6fr 1fr` grid above it.
Verified by hand at 320/390/768/1440, not automated.

### [ ] P3: assert heading order on a regional page
"Send us" was briefly a 12px `<h2>`, an outline peer of the 40px `About` heading.
Fixed, but nothing stops it regressing. One test asserting the h1/h2 sequence
would hold it.
