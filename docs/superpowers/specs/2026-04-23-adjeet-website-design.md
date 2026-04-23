# AD-JEET Website — Design Spec

| | |
|---|---|
| **Version** | 1.0 |
| **Date** | 2026-04-23 |
| **Based on** | PRD v1.0 (AD-JEET_Website_PRD.md) |
| **Approach** | Streamlined stack (Option B) |

---

## Decisions made in brainstorming

| Topic | Decision | Reason |
|---|---|---|
| Coverage page | Removed | User request |
| Portfolio | Photo gallery with lightbox, no case studies | No case study resources available |
| Hero | Kinetic typography, no Spline 3D scene | Simpler build, 3D can be added in v1.1 |
| Photos | Real photos from day one | User has installation photos available |
| Form backend | Resend email only | Google Sheets + WhatsApp API deferred to v1.1 |
| Logo | Real logo file available | User confirmed |
| Animation library | Framer Motion only (no GSAP) | Eliminates Club GSAP license, one library |
| Content format | TypeScript `.ts` data files (no MDX) | Simpler toolchain, easier to edit |

---

## 1. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, RSC by default) |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 11 |
| Content | TypeScript `.ts` data files |
| Forms | react-hook-form + zod + Resend |
| Images | next/image (AVIF + WebP, lazy) |
| Analytics | GA4 + GTM (consent-gated, custom ConsentBanner component) |
| Rate limiting | Vercel KV |
| i18n | next-intl (scaffolded, English-only at launch) |
| Hosting | Vercel |

---

## 2. Folder structure

```
adjeet-site/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                  Home
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── services/
│   │   │   ├── page.tsx              Services overview
│   │   │   └── [slug]/page.tsx       Service detail (×10)
│   │   └── portfolio/page.tsx        Photo gallery
│   ├── (programmatic)/
│   │   └── [slug]/
│   │       └── page.tsx              25 SEO landing pages (generateStaticParams produces
│   │                                 e.g. "glow-sign-board-in-siliguri" as slug param)
│   ├── api/
│   │   └── lead/route.ts             Resend form handler
│   ├── sitemap.ts
│   ├── robots.ts
│   └── layout.tsx
├── components/
│   ├── ui/                           Button, Input, Select, Card, Tag, Badge, Accordion, Lightbox, ConsentBanner
│   ├── sections/                     Hero, ServicesGrid, ProofBlock, GalleryTeaser, TrustBand,
│   │                                 PortfolioGrid, Timeline, LeadForm, ServiceCityLayout
│   └── motion/                       FadeIn, StaggerChildren, CountUp, ReducedMotionWrapper
├── content/
│   ├── services.ts                   Service data (8 entries)
│   ├── gallery.ts                    Photo gallery data (all photos)
│   └── programmatic.ts               City × service copy (25 entries)
├── design/
│   └── tokens.css                    All CSS custom properties
├── lib/
│   ├── seo.ts                        Metadata + schema.org builders
│   └── whatsapp.ts                   Deep-link utility
└── public/
    ├── fonts/                        Self-hosted woff2 subsets
    ├── images/                       Optimised originals
    └── logo/                         SVG + PNG logo variants
```

---

## 3. Design system

### Colours (CSS custom properties on :root[data-theme])

```css
/* Light mode */
--paper:           #F7F3EC;
--paper-elevated:  #FBF8F3;
--ink:             #1A1916;
--ink-muted:       #4A4741;
--ink-subtle:      #8A857C;
--rule:            #E4DDD0;
--adjeet-blue:     #1E7FB8;
--adjeet-blue-deep:#134C70;
--ochre:           #C9962E;
--clay:            #A6503A;
--sage:            #6B7C5A;
--slate:           #455362;
--success:         #3F7A4E;
--warning:         #B8862A;
--error:           #A63D3D;

/* Dark mode — applied via :root[data-theme="dark"] */
--paper:           #13120F;
--paper-elevated:  #1E1C18;
--ink:             #F0EBDE;
--ink-muted:       #BAB3A2;
--rule:            #2B2823;
--adjeet-blue:     #4FA8E0;
```

Dark mode: `prefers-color-scheme` media query + manual three-state toggle (light / dark / system). Persisted in `localStorage` under `adjeet-theme`. Hydrated on first paint to prevent flash.

### Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Display / editorial | Fraunces (variable) | 350–500 | clamp(3.5rem, 8vw, 7.5rem) → clamp(1.75rem, 3.5vw, 2.5rem) |
| Body / UI | Inter (variable) | 400–600 | 1rem / 1.125rem / 0.875rem |
| Mono | JetBrains Mono | 400 | 0.875rem |

Self-hosted as woff2 subsets. `font-display: swap`. Fluid scale via `clamp()`. Line length capped at 65ch for body copy.

### Elevation

```
elev-1   0 1px 2px rgba(26,25,22,0.04), 0 2px 6px rgba(26,25,22,0.03)
elev-2   0 4px 8px rgba(26,25,22,0.06), 0 12px 24px rgba(26,25,22,0.05)
```

### Spacing & grid

- Base unit: 4px. Scale: 4/8/12/16/24/32/48/64/96/128.
- Max content width: 1280px. Full-bleed for hero and imagery.
- 12-col desktop / 8-col tablet / 4-col mobile. CSS Grid.
- Section padding: `clamp(4rem, 10vh, 8rem)` top/bottom.

---

## 4. Motion system (Framer Motion only)

All motion gated behind `prefers-reduced-motion: reduce` (instant renders) and slow connection heuristic (`navigator.connection.effectiveType === 'slow-4g' | '3g' | '2g'`).

| Interaction | Implementation |
|---|---|
| Hero headline | Line-by-line masked reveal on load, 600ms, 80ms stagger per line |
| Section entries | `y: 40 → 0`, `opacity: 0 → 1`, triggered by `useInView` |
| Counter stats | Count up from 0 on viewport entry, 1.2s, ease-out |
| Portfolio filter | `AnimatePresence` + `layout` prop for smooth reflow |
| Service card hover | `scale: 1 → 1.02`, border colour transition |
| Button press | `scale: 1 → 0.98`, 150ms |
| WhatsApp FAB | `y: 80 → 0` after hero scrolls out of view |
| Lightbox | `opacity + scale` enter/exit, ESC to close, focus trap |

Easing: `[0.22, 1, 0.36, 1]` for entries, `[0.16, 1, 0.3, 1]` for exits.

---

## 5. Pages

### Home

Five scroll sections:

1. **Hero** — 100vh desktop / 85vh mobile. Eyebrow "Est. 1990 · North Bengal", Fraunces display headline reveals line-by-line, subheadline, dual CTA (WhatsApp primary / Book Survey secondary). Warm paper background with `noise(0.015)` grain.
2. **Services grid** — 10 service tiles with custom SVG icons, hover fill, link to detail pages.
3. **35-year proof block** — 4 animated stat counters + narrative copy.
4. **Gallery teaser** — 6 featured photos (marked `featured: true` in `gallery.ts`), "View all work →" link to `/portfolio`.
5. **Trust band** — category tags ("Telecom leaders" etc., no logos until permission) + footer.

**Footer:** NAP (both addresses), WhatsApp link, social links, Privacy Policy, sitemap links.

### Services overview `/services`

Same 10-card grid as Home section 2, with expanded copy per card (~60 words). Cards link to `/services/[slug]`.

### Service detail `/services/[slug]` (×8)

Slugs: `glow-sign-boards` · `acp-led-signage` · `flex-printing` · `vehicle-branding` · `wall-painting` · `f-pole-installation` · `in-shop-branding` · `events-and-puja` · `one-way-vision` · `product-display`

Template sections:
- Hero: service name + 1 photo
- What we offer: materials, sizes, finishes
- Gallery: 3–5 filtered photos from `gallery.ts`
- Turnaround time callout
- WhatsApp CTA (context-prefilled)
- FAQ accordion (3–5 questions from `services.ts`)
- "We also do" cross-link band (3 related services)
- Secondary lead form CTA

### Portfolio `/portfolio`

Filterable photo grid. Filters: service type (all 8) + city (multi-district). Filter state in URL params for shareability.

Each photo card: image (lazy, 3:2 aspect), service tag, city, year. Click → lightbox. Lightbox: full-size photo, keyboard navigable (← →), ESC closes, focus trapped.

No separate detail page per photo.

### About `/about`

Sections:
- Eyebrow "Since 1990", large display headline
- Long-form narrative (500–800 words, drafted with Claude, finalised by Rupam)
- Vertical milestone timeline
- Workshop photo (Patiram Jote, AD-JEET sign visible)
- Optional: father's photo
- Districts served: text grid of 15+ district names
- WhatsApp CTA

### Contact `/contact`

- Two address cards: Office (Platinum Square) + Workshop (Patiram Jote)
- Embedded Google Map
- Lead form (see §6)
- WhatsApp as primary CTA above the form

### Programmatic `/[service]-in-[city]` (×25)

Shared `ServiceCityLayout` component. Per-page content in `programmatic.ts`:
- Unique headline mentioning service + city
- 400–600 words of unique copy (local landmarks, local market character, installation notes)
- Gallery photos filtered to that city
- WhatsApp CTA (prefilled with service + city)
- Links: back to service page + 2 nearby city variants

Services: `glow-sign-board` · `acp-led-signage` · `flex-printing` · `vehicle-branding` · `f-pole-installation`
Cities: `siliguri` · `jalpaiguri` · `cooch-behar` · `darjeeling` · `malda`

---

## 6. Content data model

```ts
// content/services.ts
interface Service {
  slug: string
  name: string
  tagline: string
  description: string          // ~200 words
  materials: string[]
  sizes: string[]
  turnaround: string           // e.g. "3–7 days"
  faqs: { q: string; a: string }[]
  relatedServices: string[]    // slugs
  heroImage: string
  icon: string                 // SVG path reference
}

// content/gallery.ts
interface GalleryPhoto {
  id: string
  src: string
  alt: string
  service: ServiceSlug
  city: string
  year: number
  featured: boolean            // shown in Home teaser if true
}

// content/programmatic.ts
interface ProgrammaticPage {
  service: string              // slug
  city: string                 // slug
  headline: string
  body: string                 // 400–600 words, plain text paragraphs
  stats: { label: string; value: string }[]
  relatedCities: string[]
}
```

---

## 7. Lead form

**Fields:** name (required) · phone (required, E.164) · city (dropdown, coverage districts) · serviceInterest (multi-select, all 10 services) · timeline (enum: immediate | one_month | three_months | exploring) · message (optional, textarea) · `_hp` honeypot (hidden, anti-spam)

**Submission flow:**
1. Client validates with zod, shows inline errors on blur
2. POST `/api/lead`
3. Server re-validates with zod; rejects immediately if `_hp` is non-empty (bot trap)
4. Resend sends email to `info@adjeet.in` with structured lead data
5. Returns 200 → success state shown inline
6. GA4 `lead_submit` event fired (non-PII: page, service, city, timeline)
7. Rate limit: 5 / IP / hour via Vercel KV

---

## 8. SEO & schema

- Every page: `title` (≤60 chars) · `description` (≤160 chars) · `canonical` · OG image (1200×630, `@vercel/og`)
- `LocalBusiness` JSON-LD on all pages (with branch nodes for both addresses)
- `Service` on each service detail page
- `BreadcrumbList` on all pages except home
- `FAQPage` on service detail pages
- `sitemap.xml` auto-generated (split: pages, services, portfolio, programmatic)
- `robots.txt` — allow all except `/api/`
- `llms.txt` — plain-text business description for LLM search surfaces
- Portfolio photos carry descriptive `alt` text with service + city for image SEO

---

## 9. Analytics events

| Event | Key params |
|---|---|
| `whatsapp_click` | source_page, source_service, source_city |
| `lead_submit` | service, city, timeline |
| `portfolio_filter` | filter_type, filter_value |
| `service_page_view` | service |
| `programmatic_view` | service, city |
| `theme_toggle` | theme |

---

## 10. Accessibility (WCAG 2.2 AA)

- All interactive elements keyboard-operable with visible focus rings
- Focus trap in lightbox and mobile nav
- All images have meaningful `alt` text
- Form fields have labels (not just placeholders), errors via `aria-describedby`
- Contrast: 4.5:1 body, 3:1 large text, 3:1 non-text UI
- `prefers-reduced-motion` disables all Framer Motion animations
- Skip-to-content link
- Single H1 per page, no skipped heading levels
- `<html lang="en">`
- Touch targets minimum 24×24 CSS px

---

## 11. Performance budgets

| Metric | Target |
|---|---|
| LCP (p75, mobile) | < 2.0s |
| CLS | < 0.1 |
| INP | < 200ms |
| JS initial (gzipped) | < 120kb |
| CSS (gzipped) | < 30kb |
| Fonts (woff2 subsets) | < 60kb |
| LCP image | < 150kb AVIF |

RSC by default. `'use client'` only where interaction requires it. Framer Motion loaded only on pages that need it. Fonts preloaded.

---

## 12. Out of scope (v1)

- Spline 3D topographic map scene (v1.1)
- Google Sheets lead logging (v1.1)
- WhatsApp API notification on lead (v1.1)
- Blog / editorial hub (Phase 2)
- Client logo display (until written permission secured per brand)
- Multilingual UI (i18n scaffolded, content deferred)
- Voice navigation
- Live quote calculator
- AD-SQUARE content of any kind
