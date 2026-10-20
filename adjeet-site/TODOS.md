# AD-JEET Site: Design TODOs

See DESIGN.md for the design system rules. DESIGN.md wins wherever this file
and it disagree.

## Storefront homepage (2026-10-20)

### [x] May 2026 entries pruned
**Done 2026-10-20.** Everything this file tracked from the May 2026
plan-design-review (Hero.sandbox, HeroSandbox, ClientShowcase, SectionLabel,
SelectedWork, amber accents, Khand, Fraunces and JetBrains Mono) described a
design that was replaced on 7 September 2026 and no longer exists in the code.
Those entries are deleted rather than kept as open items; git history before
this date still has them. Two were still open and are closed as obsolete: the
HeroSandbox integration (the component is gone) and the next/font check in a
`'use client'` component (the site loads its fonts from `app/fonts`).

### [ ] Owner: the workshop film left the homepage
**Decided 2026-10-20, reversible.** The storefront homepage shows the workshop
through the real site photograph of the gate, not the day/night visualisation
film, which stays on /about and still follows the theme switch there. If the
owner wants the film back on the homepage, it belongs inside the process
section, labelled as a visualisation.

### [ ] /areas link depends on the areas pull request
The homepage's "Every area we serve" link points at /areas, which a separate
pull request creates. Until it merges, that link returns the 404 page.

### [ ] Owner: confirm the three shopfront examples
The homepage shows tanyamakeovers-154, acc-125 and anchor-by-panasonic-112
(recorded in DESIGN.md). Swap them in `components/home/ShopfrontExamples.tsx`
when newer finished shopfronts are photographed, and claim a place only when
the gallery records one.

---

## From 2026-09-20 plan-design-review (regional pages)

Plan: `design/regional-pages-2026-09-20.md`. Scope is the 27 programmatic
service-area pages at `app/(programmatic)/[slug]/page.tsx`.

### [x] Doc rot: this file contradicts DESIGN.md
**Done 2026-10-20:** the May entries are pruned (see the top of this file).
**Flagged 2026-09-20.** Everything above dated May 2026 describes amber accents,
Khand headings, Fraunces and JetBrains Mono. `DESIGN.md` (7 September 2026)
supersedes all of it with Cesura display, Hind Siliguri body and the
cyan/yellow `--signal` pair. DESIGN.md wins. Prune or date-stamp the May entries.

### [x] DESIGN.md calls `--radius-button` a "pill radius"
**Done 2026-10-20:** DESIGN.md now gives the 2px value and says buttons, chips and icon buttons share it.
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

## E2E suite (P0), found during /ship 2026-09-20

16 e2e tests fail on `origin/main`. Verified pre-existing: reverting the five
source files of `regional-pages-inversion` to main reproduces the same failures,
so none are caused by that branch. Three distinct root causes.

**Resolved 2026-09-24.** All three are fixed below, and the suite can no longer
rot unnoticed: the `e2e` job in `.github/workflows/ci.yml` now runs every spec
against a production build on every push and pull request. It never ran in CI
before, which is how 16 failures piled up.

### [x] P0: Turnstile unreachable in the e2e environment (lead-form x2)
Fixed 2026-09-24. The original diagnosis (connection refused, CSP) was wrong:
Cloudflare's script loads fine here and the dev CSP allows the host in
`script-src`, `frame-src` and `connect-src`. The real cause is that Cloudflare's
current `api.js` mounts its challenge iframe inside a **closed** shadow root, so
`iframe[src*="challenges.cloudflare.com"]` could never match, even with the
widget working. The CSP entry in the console was a different host
(`va.vercel-scripts.com`, dev only). `tests/e2e/support/turnstile.ts` now
stubs Turnstile inside the e2e run, served from the URLs the real widget uses so
the CSP still applies, and the lead form specs answer `/api/lead` themselves.

### [x] P0: Homepage e2e asserts a DOM the site no longer has (x12)
Fixed 2026-09-24. Ten of the twelve were the specs lagging deliberate changes,
each traced to its commit: 1612d04 (the redesign moved the client history below
the selected work, and changed the h1, the hero link, the services heading and
the "Workshop visualisation" label), 5956e23 (SD Lion TMT and Dish TV took the
clients from 19 to 21) and 068759d (new selected-work photos). The specs now
check the section order and read the client list from `ClientStreet.tsx`, so
the next client added needs no test edit. `fieldwork.spec.ts` also failed on the
chat bubble because `next dev` draws its dev tools button on top of it; that
test hides the button.

The other two, `navigation-footer.spec.ts:8` at 390px and 1280px, were not DOM
drift but a real bug, next entry.

### [x] P0: pages opened at the previous page's scroll position
Fixed 2026-09-24. Live on adjeet.in from 7ca85ee (the site motion commit)
until this fix: at 390px, 5 of the 20 page-to-page navigations opened where
the last page was scrolled, not at the top. Every route into `/portfolio`,
and `/portfolio` to the homepage (at its own bottom, 9607px). Before 7ca85ee
only the dev server showed it, so it was first logged here as dev only.

Cause, traced with stack traces and an instrumented GSAP build: Next resets
the scroll, then `ScrollTrigger.refresh()` (run by SiteMotion after every route
change, and by HomeMotion) scrolls back to a position it recorded from the old
page. Two ways that record goes stale: HomeMotion's `gsap.matchMedia()` records
the scroll in a layout effect, before Next resets it; and GSAP 3.15 invalidates
its cached scroll with `++cacheID`, which lands on the same number as its
scroll-event counter after exactly one scroll event, the one Next's reset
fires, so the old cached value is read as fresh. `/portfolio` creates no
ScrollTriggers, so nothing re-reads the scroll before the refresh.
`ScrollTrigger.clearScrollMemory()` alone does not fix it (it bumps both
counters). `SiteMotion` now clears the memory and sets GSAP's cached scroll to
the real position on each route change, after Next's reset and before any
refresh; the 20-navigation matrix then lands at the top at 390px and 1280px.
`navigation-footer.spec.ts` covers the `/portfolio` and homepage routes and
checks the top still holds after the refresh window.

### [ ] P3: DESIGN.md and design-loop.md describe the pre-redesign homepage
**DESIGN.md done 2026-10-20:** it now describes the storefront homepage. design-loop.md still says 19 clients.
`DESIGN.md:42` still gives the section order from before 1612d04 and calls the
workshop scene "Workshop illustration" (the site says "visualisation");
`design-loop.md:28` still says 19 clients. DESIGN.md is the design authority,
so these are worth correcting.

### [x] P0: services.spec heading selector is too loose (x1)
Fixed 2026-09-24. `tests/e2e/services.spec.ts` matched both the `h1` "Glow Sign
Boards in Siliguri" and the gallery `h2` "Glow Sign Boards: 9 project photos",
tripping strict mode. The test was wrong, not the site: it is now scoped to
`level: 1`.

---

## Regional pages: remaining coverage (from /ship 2026-09-20)

Coverage audit put the branch at 78% of changed paths (25/32), passing the 60%
minimum and missing the 80% target. Five of the seven gaps are cosmetic or
unreachable. Two are not.

### [x] P1: e2e the prefilled lead form on a regional page, success path
Done 2026-09-24 in `tests/e2e/lead-form.spec.ts`, on `/glow-sign-board-in-siliguri`:
asserts the city and trade arrive prefilled and the posted body carries both.
These pages carry the highest-intent search traffic, so a break there used to
cost leads while `/contact` stayed green.

### [x] P1: e2e the prefilled form against a 500 from /api/lead
Done 2026-09-24, same file: the alert is announced, every field survives, and a
retry with a fresh token reaches the success state.

### [x] P2: the lead form's error banner names WhatsApp but does not link to it
Fixed 2026-09-24. After a failed submit the banner said "Something went wrong.
Please try WhatsApp instead." with no link in it. It now carries "WhatsApp your
brief", prefilled with the town and services from the brief that failed, and
tracked as `lead-form-error` so recoveries show up in analytics. Both lead
form 500 tests assert it, on `/contact` and on a regional page.

### [x] P3: Next's image optimizer wedges an image size after an aborted request
Fixed 2026-09-24 with `patches/next+16.2.6.patch`, applied by `patch-package`
on every install. Abort a `/_next/image` request while the source file is still
streaming in and every later request for that exact URL hung until the server
restarted. adjeet.in was never affected (Vercel resizes with its own service);
`next dev`, `next start` and the e2e suite were.

Cause: `fetchInternalImage` builds a mocked request and response that share
the client's socket. When the client aborts, `send` (via `on-finished`) sees
the response's socket as no longer writable, treats the response as finished
and stops streaming without ending it, so `mocked.res.hasStreamed` never
settles, and Next's response cache hands that pending promise to every later
request for the same key. The patch gives the mocked response no socket.
Before: 3 of 24 aborted sizes wedged; after: 0 of 24, twice.
`tests/e2e/image-optimizer.spec.ts` guards it.

Still present in next 16.2.12 and 16.3.6. **Fixed upstream in 16.4.2**
(2026-10-20): `fetchInternalImage` now builds the mocked response without the
client's socket, so `patches/next+16.2.6.patch` was deleted with the upgrade
(16.3.7 and earlier carry the advisories `npm audit --omit=dev` reported on
16.2.6). The `patch-package` postinstall stays and finds no patches. If a later
Next release brings the hang back, `tests/e2e/image-optimizer.spec.ts` fails on
a fresh production server; regenerate a patch with `npx patch-package next`.

### [ ] P2: `/api/lead` server checks are no longer covered by e2e
The e2e lead form specs now answer `/api/lead` themselves (the real route
verifies the token with Cloudflare from Node, and with `.env.local` loaded it
would store a real lead and send notifications). The route's origin check,
schema validation and token verification therefore need unit or integration
coverage. Check what `tests/unit` already covers before adding any.

### [x] P3: viewport check either side of the 1024px grid switch
Done 2026-09-24 in `tests/e2e/regional-page.spec.ts`. The switch is
`@media(min-width:1024px)` in `design/fieldwork.css`, so 1024 is two columns and
1023 is one. The test checks 390 and 1023 stack, 1024 and 1440 sit side by side
at 1.6 : 1, and no width scrolls sideways.

### [x] P3: assert heading order on a regional page
Done 2026-09-24, same file, on the first Siliguri and the first Gangtok page:
one `h1`, then the gallery, About, FAQ, "{service} in {city}." and "Or send the
brief here." `h2`s in that order, and "Send us" is a visible label that is not
a heading at any level.
