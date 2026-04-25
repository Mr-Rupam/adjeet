# Plan 3: Home Page + Services Pages — Design Spec

## Overview

Build the public-facing Home page and Services pages for the AD-JEET website. This includes the full Home page (5 sections), a Services overview page, and a Service detail template rendered for all 10 service slugs.

All content data, UI components, and the motion system are already built (Plan 2). This plan assembles them into pages.

---

## Architecture & Routing

### Route group: `app/(marketing)/`

A Next.js route group that colocates marketing pages without affecting URLs. The group layout provides metadata defaults and mounts the `LocalBusiness` JSON-LD schema once.

```
app/(marketing)/
  layout.tsx                    ← metadata defaults, LocalBusiness JSON-LD
  page.tsx                      ← / (Home) — replaces app/page.tsx stub
  services/
    page.tsx                    ← /services overview
    [slug]/
      page.tsx                  ← /services/[slug] detail
      loading.tsx               ← skeleton to avoid full-page flash
```

**Migration:** `app/page.tsx` stub is deleted. The root route is resolved from `app/(marketing)/page.tsx`.

### New component files

```
components/sections/
  Hero.tsx                      ← kinetic headline, dual CTA, bg placeholder
  ServicesGrid.tsx              ← 10 icon tiles linking to /services/[slug]
  ProofBlock.tsx                ← 4 CountUp stats
  GalleryTeaser.tsx             ← 6 featured photos → Lightbox
  TrustBand.tsx                 ← category tag strip

components/icons/
  ServiceIcon.tsx               ← slug → inline SVG map (10 icons)

lib/
  seo.ts                        ← generateMetadata helpers + JSON-LD builders
```

### No new dependencies

Everything uses Framer Motion, Tailwind tokens, and existing content modules already installed in Plan 2.

---

## Home Page (`/`)

Full-page composition of 5 sections. The page is an RSC; only section components that need client interactivity carry `'use client'`.

### Section 1 — Hero

- **Layout:** Full-viewport (`min-h-svh`). Gray placeholder `<div>` as background (swap to `next/image` with `src="/images/hero/bg.jpg"` when photo is ready). Dark gradient overlay ensures text contrast in all lighting conditions.
- **Eyebrow:** `"Signage · Outdoor Advertising · North Bengal"` — small uppercase tag above headline.
- **Headline (kinetic):** `"North Bengal's most trusted signage company"` — words fade-stagger in via `StaggerChildren` + `staggerItem`. Each word is a `<span>` inside a `motion.span`.
- **Sub-copy:** One sentence naming the districts served: Siliguri, Jalpaiguri, Cooch Behar, Darjeeling, Malda.
- **CTAs:**
  - Primary: `<Button href="/services">Our Services</Button>`
  - Secondary (ghost): WhatsApp button using `buildWhatsAppUrl({ context: 'hero' })` prefill
- **Scroll indicator:** Animated chevron-down, fades in after headline animation completes (`delay: 1.2s`), fades out when user scrolls past hero threshold (same 300px threshold used by `WhatsAppFAB`).

**Client boundary:** `Hero.tsx` is `'use client'` (uses `useInView` for scroll indicator visibility, `StaggerChildren` which is already client).

### Section 2 — ServicesGrid

- **Layout:** Responsive grid — 2 cols mobile → 3 cols tablet → 5 cols desktop.
- **Each tile:** `ServiceIcon` SVG (48×48) + service name + `→` arrow. Full tile is `<Link href="/services/[slug]">`.
- **Animation:** Section heading uses `FadeIn`; tiles stagger in via `StaggerChildren` (container) + `staggerItem` (each tile).
- **`expanded` prop:** When `true`, renders a one-line tagline below the service name (pulled from `content/services.ts`). On the Home page: `expanded={false}`. On the Services overview: `expanded={true}`.
- **RSC-compatible:** No `'use client'` needed on `ServicesGrid` itself — animation wrappers (`StaggerChildren`, `FadeIn`) are already client components.

### Section 3 — ProofBlock

4 stats in a horizontal band (`bg-paper-elevated`):

| Stat | Value | Suffix |
|------|-------|--------|
| Projects | 500 | + |
| Years | 10 | — |
| Districts | 12 | — |
| Clients | 200 | + |

Each stat uses the existing `CountUp` component (`viewport: { once: true }`). Labels below each number. Section heading uses `FadeIn`.

**`'use client'`** is on `CountUp` (already). `ProofBlock` wrapper is RSC.

### Section 4 — GalleryTeaser

- Heading + 6 featured photos from `getFeaturedPhotos()` (already returns 7; use first 6).
- **Layout:** 3-col grid (masonry-ish using `aspect-ratio` utilities; no JS masonry library).
- Photos are placeholder images stored in `content/gallery.ts` `src` fields.
- Clicking any photo opens the existing `Lightbox` component with `initialIndex` set to the clicked photo's index.
- `"View all work"` text link below the grid (links to future `/gallery` page — just a plain `<Link>` for now).

**`'use client'`** on `GalleryTeaser` (manages `isOpen` + `initialIndex` state for Lightbox).

### Section 5 — TrustBand

Narrow strip of service category tags:
`Illuminated · Structural · Print · Branding · Events`

- `bg-paper-elevated` background, centered text.
- `FadeIn` wrapper.
- No links — purely visual / keyword signal.
- RSC.

---

## Services Overview (`/services`)

### Page structure (RSC)

1. **Hero (compact variant):** `min-h-[40vh]`, no kinetic animation, static headline `"Our Services"`, sub-copy listing all 10 service categories.
2. **`<ServicesGrid expanded={true} />`** — same component, taglines visible.
3. **CTA strip:** `<Button href="/#contact">Get a Quote</Button>` (primary) + WhatsApp button (secondary).

### Metadata

```ts
title: "Signage & Outdoor Advertising Services | AD-JEET"
description: "From glow sign boards and ACP LED signage to flex printing, vehicle branding, and events — AD-JEET delivers quality signage across North Bengal."
```

### JSON-LD

`ItemList` with 10 `ListItem` entries, each containing `url`, `name`, `description`.

---

## Service Detail (`/services/[slug]`)

### Static generation

```ts
export function generateStaticParams() {
  return SERVICE_SLUGS.map(slug => ({ slug }))
}
```

Generates 10 static pages at build time. `notFound()` called if slug not in `SERVICE_SLUGS`.

### Page structure (RSC)

Sections rendered top to bottom:

1. **Hero (compact):** Service `name` as headline, `tagline` as sub-copy. Background: gray placeholder div (swappable to `/images/services/[slug].jpg`).

2. **Details band:** 3-col grid showing `materials`, `sizes`, `turnaround` from `content/services.ts`. All text, no animation.

3. **Gallery strip:** `getPhotosByService(slug)` → horizontal scroll strip of filtered photos. Opens `Lightbox` on click. Hidden entirely if `photos.length === 0`.

4. **WhatsApp CTA block:** Full-width band (`bg-blue` accent). Copy: `"Ready to get started? Chat with us on WhatsApp"`. Button: `buildWhatsAppUrl({ service: service.name, context: 'service-detail' })`.

5. **FAQs:** `<Accordion items={service.faqs} />` using the existing Accordion component. 3–4 FAQs per service stored in `content/services.ts` `faqs: { q: string; a: string }[]` field.

6. **Related services band:** 3 tiles from `service.relatedServices` slugs. Reuses the same tile markup from `ServicesGrid` (extracted to a `ServiceTile` sub-component shared by both).

7. **Secondary CTA:** `"Explore all services"` `<Link href="/services">` text link.

### Metadata (per service)

```ts
title: `${service.name} in North Bengal | AD-JEET`
description: service.tagline + " Serving Siliguri, Jalpaiguri, Cooch Behar, Darjeeling, Malda."
```

### JSON-LD (per service)

Three blocks:
- `Service` — `name`, `provider` (LocalBusiness), `areaServed` (5 North Bengal districts)
- `FAQPage` — from `service.faqs`
- `BreadcrumbList` — Home → Services → [Service Name]

---

## `ServiceIcon` Component

Maps the `icon` string from `content/services.ts` to an inline SVG. All 10 icons are bespoke, hand-crafted SVGs (no icon library dependency).

```ts
// components/icons/ServiceIcon.tsx
interface Props {
  icon: string     // value from service.icon field in content/services.ts
  size?: number    // default 48
  className?: string
}
```

Returns `<svg>` for a known icon string, `null` for unknown. Each SVG is `aria-hidden="true"` (decorative — service name is the text label).

**Icons to create (icon string → visual concept):**
- `lightbulb` — lit box/panel (glow-sign-boards)
- `panels` — flat panel with LED dots (acp-led-signage)
- `print` — rolled banner (flex-printing)
- `truck` — car/vehicle silhouette (vehicle-branding)
- `paint-roller` — paint brush/roller (wall-painting)
- `flag-pole` — vertical pole with flag (f-pole-installation)
- `store` — storefront/shelving (in-shop-branding)
- `sparkles` — pennant/stage (events-and-puja)
- `eye` — window with arrow (one-way-vision)
- `display` — display stand (product-display)

---

## `lib/seo.ts`

```ts
// Exports:
export const siteConfig = { name, url, ogImage, ... }
export function generateServiceMetadata(slug: ServiceSlug): Metadata
export function buildLocalBusinessJsonLd(): object
export function buildServiceJsonLd(service: Service): object
export function buildFaqJsonLd(faqs: { q: string; a: string }[]): object
export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]): object
```

JSON-LD injected via `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />` in RSC page output.

`LocalBusiness` schema mounted once in `app/(marketing)/layout.tsx`.

---

## Placeholder Images

Real photos go in:
```
adjeet-site/public/images/
  hero/bg.jpg               ← hero background
  gallery/001.jpg ...       ← gallery photos (match gallery.ts src values)
  services/[slug].jpg       ← optional per-service hero photos
```

Until real photos arrive, placeholders are gray `<div>` elements with `aspect-ratio` set, or `placeholder.co` URLs in `content/gallery.ts` `src` fields.

---

## Testing

### Vitest unit tests

| Test file | What is tested |
|-----------|----------------|
| `tests/unit/ServiceIcon.test.tsx` | Renders `<svg>` for each of the 10 icon strings; returns `null` for unknown string |
| `tests/unit/seo.test.ts` | `buildFaqJsonLd`, `buildBreadcrumbJsonLd`, `buildServiceJsonLd` return correctly shaped objects |
| `tests/unit/ServicesGrid.test.tsx` | Renders 10 tiles with correct `href`; `expanded={true}` shows tagline text |

### Playwright E2E

| Test | Assertions |
|------|-----------|
| Home page | Hero heading visible; 10 service tiles render; each tile links to `/services/[slug]`; ProofBlock stats visible; GalleryTeaser photos render |
| `/services` | Page renders; 10 tiles present with taglines |
| `/services/glow-sign-boards` | Hero renders service name; FAQ accordion opens/closes; WhatsApp CTA `href` starts with `https://wa.me/` |

### Out of scope for Plan 3
- Visual regression / Playwright screenshots
- JSON-LD schema validation (covered by `lib/seo.ts` unit tests)
- Real image loading / `next/image` optimization tests

---

## `content/services.ts` — already complete

All fields required by Plan 3 are already present in the service data from Plan 2:

- `tagline: string` — one-line description used in `ServicesGrid` expanded view
- `faqs: { q: string; a: string }[]` — 3–4 FAQs per service, used in `Accordion`
- `materials: string[]`, `sizes: string[]`, `turnaround: string` — used in Details band
- `heroImage: string` — path for per-service hero background (swap placeholder `<div>` for `next/image` when ready)
- `icon: string` — passed to `ServiceIcon` component

No content changes needed in Plan 3.

---

## Open items (not in scope for Plan 3)

- Real hero/gallery photos (swap placeholders when available)
- `/gallery` standalone page (linked from GalleryTeaser "View all work")
- Contact form section on Home page (deferred to Plan 4)
- Dynamic OG images per page
- `next/font/local` migration (once woff2 files available)
- Real WhatsApp number (replace `+919832012345` placeholder)
