# Regional pages: make the 27 service-area pages worth landing on

Drafted 20 September 2026. Reviewed the same day via `/plan-design-review`.
Calibrates against `DESIGN.md` (7 September 2026).

## Why this, why now

`app/(programmatic)/[slug]/page.tsx` renders 27 pages: 5 services across 5 North
Bengal cities, plus 2 Gangtok guides. These are the pages a stranger hits first.
Someone searching "glow sign board in siliguri" lands here with zero brand
context, and this page is the entire first impression.

The template works. The content it pours through the template does not.

**The core problem: the page leads with its weakest content and buries its
strongest.**

`content/programmatic.ts` builds `body` from one string template. All 27 pages
open with the same paragraph, service name and city swapped:

> AD JEET provides {service} for projects in {city}, with design and fabrication
> based at our Siliguri workshop. We also plan work in nearby areas such as
> {nearby}. Share your exact site location to discuss measurement, delivery and
> installation for the agreed project scope.

The FAQ entry is templated the same way. So is the headline. Strip the proper
nouns and 27 pages collapse into one.

Meanwhile `localBrief` — the one field written per page, by hand, by someone who
knows the trade — sits below the fold under a generic h2:

> For a Gangtok glow sign, photograph the frontage from the road and from any
> steps or lane leading to the shop, since many hillside and market premises are
> reached on foot.

That sentence is the product. It proves we have stood on a Gangtok pavement and
thought about how a sign gets carried up it. It is specific, useful, and
impossible to generate. It is currently the fourth thing on the page.

**The fix is inversion, not addition.** Lead with the local brief. Cut the
templated body. Everything else follows from that.

## What the visitor is actually doing

| Step | User does | User feels | What the plan gives them |
| --- | --- | --- | --- |
| 1 | Lands from Google, cold | "who are these people" | Masthead: mark, service, city |
| 2 | Scans for "do they do MY town" | wary of a lead-gen page | **Local brief as lead copy** |
| 3 | Looks for proof | needs a real photograph | Gallery, honestly captioned |
| 4 | Checks we understand the job | "will they get this wrong" | "Send us" list, FAQ |
| 5 | Decides to make contact | wants low commitment | WhatsApp, or a prefilled form |

Step 2 is the whole game. A stranger's first question on a service-area page is
"is this a real workshop or a lead farm for my postcode?" Twenty-seven
near-identical pages answer that badly. One hand-written local paragraph in the
lead position answers it in a sentence.

Time horizons: the 5-second read is the masthead plus the first line of the local
brief. The 5-minute read is the gallery and the FAQ. The long horizon is that
these pages stay honest about where our photographs were taken, so the trust
survives the first site visit.

## What this is not

- Not a rewrite of the template. The route, the breadcrumb, the metadata and the
  tracking all stay.
- Not new pages. 27 stays 27. Expanding `PROG_SERVICES` is separate work and
  should not happen until this template is worth multiplying.
- Not a content-writing project. `localBrief` is already written for all 27.
- Not a redesign of `LeadForm`'s internals. It gets an optional prop interface
  and nothing else.

## What already exists and gets reused

| Existing | State | Used for |
| --- | --- | --- |
| `PageMasthead` | wired | Page head, `compact` |
| `GalleryStrip` | wired | Project photos |
| `Accordion` | wired | FAQ. Native `<details>/<summary>`, keyboard-free |
| `WhatsAppLink`, `cta cta--md` | wired | Primary action |
| `LeadForm` | live since PR #15, **not on these pages** | Secondary conversion path |
| `field-container`, `commission` | wired | Layout, closing CTA |
| `design/fieldwork.css` `.regional-*` | wired | All page-specific styling |

`LeadForm` already handles its own states properly: `isSubmitting` disables the
button and swaps the label, `serverError` renders with `role="alert"`, success
uses `role="status"` with focus management, fields carry `aria-invalid` and
`aria-describedby`. None of that needs rebuilding. It needs wiring.

## The work

### 1. Invert the content hierarchy

Cut the templated `body` from the page. `localBrief` becomes the lead paragraph
directly under the masthead, **with no heading of its own**, set one step above
body scale so it reads as lead copy rather than as the first of many paragraphs.

The two shared blocks (`service.question`/`answer` and `service.description`)
merge into a single section below the gallery, under one h2: `About {service}`.
Three sibling h2s at identical weight become one lead paragraph and one
supporting section.

```
  breadcrumb
  masthead          headline, service tagline, WhatsApp
  LEAD              localBrief, no heading, 20px
  "Send us"         the four-item list (see 3)
  gallery           photos + honesty caption (see 4)
  ## About {svc}    question/answer + description, merged
  FAQ               accordion
  related cities    lateral links, capped (see 7)
  commission        closing CTA + lead form (see 5)
```

### 2. Fix the JSON-LD description

`buildServiceJsonLd(service, { description: page.body })` consumes `body`. Once
`body` stops rendering, the schema would describe a paragraph no visitor can see
— a structured-data mismatch across 27 pages.

Pass `page.localBrief` as the schema description instead. It is on the page, it
is unique per page, and it is the content we actually want represented.

`body` can then be deleted from the `ProgrammaticPage` interface and from the
`programmaticPages` builder.

### 3. Rebuild the spec aside as content, not a panel

Current rows:

| Row | Verdict |
| --- | --- |
| Workshop base → Siliguri | Repeats the body one column over. Cut. |
| Project location → {city} | Repeats the headline. Cut. |
| Nearby areas → {list} | Keep, as an inline line. |
| Quote and schedule → "Confirmed for your site" | Says nothing. Cut. |

`design/fieldwork.css:118` sets every value in that list at 34px display type:

```css
.regional-spec dd { font:500 34px/1.3 var(--font-heading); margin:4px 0 0; }
```

So "Matigara, Bagdogra, Naxalbari" is set at 34px, and "Confirmed for your site"
is the largest text on a 390px screen while meaning nothing. The mobile block at
`fieldwork.css:119` overrides padding only.

After cutting three of four rows there is no panel left worth boxing. Replace it
with:

- one inline `Nearby: {areas}` line at body scale
- a short **"Send us"** list: a location pin, photos of the frontage, rough
  dimensions, your target date

Both live in the reading column. The `dd` rule and the `.regional-spec` panel
styling are deleted rather than tuned.

### 4. Say where the photographs were taken

Only 8 of 109 gallery photos carry a city tag, and none carry Gangtok. So ~25 of
the 27 pages fall back to generic service photos. The heading already changes
honestly, but a visitor scanning images sees a Gangtok page full of photos and
assumes they are Gangtok jobs. `DESIGN.md` is explicit that the gallery is
evidence and we do not claim what it cannot confirm.

On the fallback path only, add one line under the strip:

> From our Siliguri workshop and North Bengal installations. We have not
> photographed a {city} project yet.

When `cityPhotos.length > 0`, no caption. The condition already exists in the
component.

### 5. Put the lead form on the page, prefilled

These 27 pages carry the highest-intent traffic on the site and offer WhatsApp
only, twice, with near-identical labels.

`LeadForm()` currently takes no props and reads city from `window.location.search`.
Give it an optional, typed prop interface:

```ts
export function LeadForm({
  defaultCity,
  defaultService,
}: {
  defaultCity?: LeadInput['city']
  defaultService?: ServiceSlug
} = {}) {
```

The existing `?city=` query-param path stays as a fallback so `/contact?city=X`
keeps working. `Gangtok` is already a member of `COVERAGE_CITIES`, so every one
of the 27 pages can prefill a valid value.

WhatsApp stays the primary action on mobile per `DESIGN.md`. The form is the
desktop path, placed in the commission section.

### 6. Move the related-city chips onto the token

`page.tsx:120` and `:127` use `border-2 border-ink px-4 py-2.5` with no radius.
`DESIGN.md` says chips use `--radius-button`.

Note for whoever implements this: `--radius-button` is `2px` (`design/tokens.css:3`),
not a pill. DESIGN.md's wording is stale. **This is a code-consistency fix with
near-zero visual change** — do not expect to see a difference, and do not "fix"
it by inventing a larger radius.

Move the block out of Tailwind utilities into `.regional-related` in
`fieldwork.css` so the file stops mixing two styling systems mid-page.

### 7. Stop every page linking to every sibling

`relatedCities` is built as "every city except this one", so each page emits up to
five lateral links into near-identical pages. Cap at three; the
`← All {service}` link carries the rest.

See unresolved decision U1 for how the three are chosen.

## Interaction states

| Feature | Loading | Empty | Error | Success | Partial |
| --- | --- | --- | --- | --- | --- |
| Lead form | Button disabled, label swaps to pending. Already built | n/a, fields prefilled | `role="alert"` banner: server message, or "Network error. Please try WhatsApp instead." Already built | `role="status"` panel, focus moved to it. Already built | Field-level `aria-invalid` + message under the field. Already built |
| Gallery | Next/Image blur placeholder | **New:** if `photos.length === 0`, render the section with the heading and one line: "We are photographing recent {service} work. Ask to see it in person." plus a WhatsApp link. Not reachable for today's 5 services; reachable the moment `PROG_SERVICES` grows | n/a static | n/a | Fewer than 3 photos: strip renders what exists, no placeholder boxes |
| Gallery provenance | n/a | n/a | n/a | City photos: no caption | **New:** fallback photos: the honesty caption from §4 |
| FAQ accordion | n/a | n/a | n/a | Native `<details>` open | One open at a time via `name={group}` |
| Related cities | n/a | Fewer than 3 siblings: render what exists, no filler | n/a | n/a | n/a |

## Responsive

Design at 390px first, protect 320px, per `DESIGN.md`.

| Viewport | Layout |
| --- | --- |
| 320–767 | Single column. Lead paragraph 18px. "Send us" list inline in the reading column. **No spec panel.** `Nearby:` as one wrapping body-scale line. Gallery strip scrolls horizontally. Chips wrap, 44px min height. Mobile enquiry dock stays pinned |
| 768–1023 | Single column, lead paragraph 20px, wider measure. Still no panel |
| 1024+ | Reading column capped at 65ch as today. "Send us" list sits right of the lead paragraph as a quiet two-column split, no border, no fill. Gallery full width |

The `1.6fr 1fr` `.regional-body` grid goes away with the panel. The desktop
two-column relationship is recreated between lead copy and the "Send us" list
only, and only above 1024px.

## Accessibility

Stated so an implementer cannot regress it by accident:

- Lead paragraph is a `<p>`, not a heading. It leads visually, not semantically.
- `About {service}` and the FAQ heading are `<h2>`, in document order, each
  visually closer to the content it introduces than to the section above it.
- Accordion stays native `<details>/<summary>`. Do not replace with a JS
  disclosure.
- Chips and CTAs hold a 44px minimum target at every width.
- Body copy stays at or above 16px. `--ink-muted` (`#4F5655` on `#F2F1E9`) clears
  4.5:1 in both themes; the dark-mode pair is `#BFC6C4` on `#0A222A`.
- The honesty caption is plain text in the section, not a `title` attribute or
  tooltip.
- Lead form keeps its existing ARIA. Prefilled fields must still render their
  visible `<label>` — no placeholder-as-label.
- `prefers-reduced-motion` respected; this page adds no new motion.

## Sequencing

1. Content inversion + schema description (1, 2) — the point of the work
2. Spec aside removal (3) — CSS and JSX deletion, unblocks the responsive work
3. Photo honesty caption (4) — one conditional line
4. Chips and related cities (6, 7) — token compliance
5. Lead form props and placement (5) — largest change, lands last

## Acceptance

- No two of the 27 pages share their opening paragraph
- `localBrief` is the first prose below the masthead on all 27, with no heading
- `body` is gone from the page, the interface, and the builder; JSON-LD
  description reads from `localBrief`
- No `dd` renders above body scale, because no `dd` remains
- `.regional-spec` panel is deleted, not restyled
- Fallback-photo pages carry the provenance caption; city-photo pages do not
- Every chip resolves `--radius-button`
- No Tailwind utility classes remain in `[slug]/page.tsx`
- `LeadForm` accepts `defaultCity`/`defaultService`; `/contact?city=X` still works
- 390px and 320px pass with no horizontal scroll; 44px targets hold
- `next build` clean, existing e2e suite no worse than the master baseline

## Implementation Tasks

1. Add `defaultCity` / `defaultService` props to `LeadForm`, keeping `?city=`
   fallback
2. Rewrite `[slug]/page.tsx` section order; drop `body`, promote `localBrief`,
   merge the two shared blocks under `About {service}`
3. Pass `localBrief` to `buildServiceJsonLd` as description; delete `body` from
   `ProgrammaticPage` and the builder
4. Delete `.regional-spec` block and the `dd` rule from `fieldwork.css`; add
   `.regional-lead`, `.regional-sendus`, `.regional-related`
5. Add the fallback provenance caption to the gallery call site
6. Add the `photos.length === 0` branch to the gallery section
7. Cap `relatedCities` at three (see U1)
8. Move chip styling off Tailwind onto `.regional-related` + `--radius-button`
9. Place `LeadForm` in the commission section with prefill
10. Verify at 320/390/768/1440 in both themes; re-run `next build` and e2e

---

## GSTACK REVIEW REPORT

| Run | Skill | Status | Findings |
| --- | --- | --- | --- |
| 1 | `/plan-design-review` (2026-09-20) | Complete | 7 passes, 4 decisions resolved, 1 unresolved |

**Ratings, before → after**

| Pass | Dimension | Before | After |
| --- | --- | --- | --- |
| 1 | Information Architecture | 7 | 9 |
| 2 | Interaction State Coverage | 3 | 9 |
| 3 | User Journey & Emotional Arc | 4 | 8 |
| 4 | AI Slop Risk | 6 | 9 |
| 5 | Design System Alignment | 8 | 9 |
| 6 | Responsive & Accessibility | 2 | 9 |
| 7 | Unresolved Decisions | — | 1 open |

Overall design completeness: **6/10 → 9/10.**

**Classifier:** MARKETING/LANDING. No hard-rejection pattern fires on the visual
design. Hard rejection #5 (sections repeating one mood statement) fires at corpus
level across the 27 pages; this plan is the fix.

**Litmus, after the plan lands:** brand unmistakable YES; one visual anchor YES
(the lead paragraph, once the 34px filler is gone); scannable by headline YES;
one job per section YES; cards necessary YES (none used); motion N/A; premium
without decorative shadows YES.

**Corrections made to the plan during review**

- Chip radius was described as a visible fix. `--radius-button` is `2px`; the
  change is code consistency, not visual. DESIGN.md's "pill radius" wording is
  stale.
- Prefill was assumed free. `LeadForm` takes no props; a typed interface is now
  specified.
- `body` removal was left as "a follow-up". It breaks `buildServiceJsonLd`, and
  the schema fix is now part of the work.
- Interaction states, responsive specs and accessibility were absent and are now
  specified. `LeadForm` and `Accordion` already meet the bar; the plan now says
  so, so it cannot be regressed silently.

**Flagged, outside this plan:** `TODOS.md` (May 2026) contradicts `DESIGN.md`
(September 2026) on typography and accent colour. It describes amber, Khand and
Fraunces; DESIGN.md specifies Cesura, Hind Siliguri and the cyan/yellow pair. A
reader trusting TODOS.md will build the wrong thing.

**VERDICT: APPROVED WITH ONE OPEN DECISION.** The plan is buildable as written
except for U1, which blocks task 7 only. Tasks 1-6 and 8-10 can start.

**UNRESOLVED DECISIONS:**

- **U1 — how are the three related cities chosen?** The plan says "by proximity",
  which was hand-waving: no city-to-city distance data exists. `lib/coverage-places.ts`
  holds distance from Siliguri only, which does not order Gangtok against Malda
  for a visitor in Darjeeling. Options: take the first three in declared order
  (trivial, arbitrary but stable), order by distance-from-Siliguri as a proxy
  (cheap, wrong for hill routes), or add a small adjacency list to
  `coverage-places.ts` (~30 minutes, correct, new data to maintain).
  Recommendation: declared order, and revisit only if the links underperform.
