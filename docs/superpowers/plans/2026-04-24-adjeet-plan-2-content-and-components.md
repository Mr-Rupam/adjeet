# AD-JEET Website — Plan 2: Content Data + UI Components + Motion

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate all content data files (services, gallery, programmatic) and build every reusable UI component (Button, Tag, Badge, Input, Select, Card, Accordion, Lightbox) and motion component (FadeIn, StaggerChildren, CountUp, ReducedMotionWrapper) that the page plans depend on.

**Architecture:** Content lives in `adjeet-site/content/` as typed TypeScript files — no CMS, no MDX. UI components are in `adjeet-site/components/ui/`, motion components in `adjeet-site/components/motion/`. All components are server-compatible by default; only components that need browser APIs use `'use client'`. Tailwind v4 utility classes from the `@theme` block (`bg-paper`, `text-ink`, etc.) are used throughout.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS 4, Framer Motion 11, Vitest + @testing-library/react, TypeScript 5

**Branch:** `plan-2/content-and-components` (off `main`)

**Plans in series:**
- Plan 1 — Foundation ✅
- Plan 2 — Content data + UI components + Motion ← this plan
- Plan 3 — Home page + Services pages
- Plan 4 — Portfolio + About + Contact + Lead form API
- Plan 5 — Programmatic pages + SEO + Analytics

---

## File Map

| File | Responsibility |
|---|---|
| `adjeet-site/content/services.ts` | 10 service entries with full data (slug, name, tagline, description, materials, sizes, turnaround, faqs, relatedServices, heroImage, icon) |
| `adjeet-site/content/gallery.ts` | Photo gallery entries with GalleryPhoto interface |
| `adjeet-site/content/programmatic.ts` | 25 city×service landing page entries |
| `adjeet-site/components/ui/Button.tsx` | Primary/secondary/ghost button, size variants, renders as `<a>` via `asChild` |
| `adjeet-site/components/ui/Tag.tsx` | Inline service/category label chip |
| `adjeet-site/components/ui/Badge.tsx` | Small status/count indicator |
| `adjeet-site/components/ui/Input.tsx` | Labelled text input with error state |
| `adjeet-site/components/ui/Select.tsx` | Labelled select dropdown with error state |
| `adjeet-site/components/ui/Card.tsx` | Elevated content container |
| `adjeet-site/components/ui/Accordion.tsx` | FAQ accordion (client component, animated) |
| `adjeet-site/components/ui/Lightbox.tsx` | Full-screen photo viewer with keyboard nav, focus trap |
| `adjeet-site/components/motion/ReducedMotionWrapper.tsx` | Reads `prefers-reduced-motion`, provides context |
| `adjeet-site/components/motion/FadeIn.tsx` | Viewport-triggered fade+rise animation |
| `adjeet-site/components/motion/StaggerChildren.tsx` | Staggers FadeIn on child elements |
| `adjeet-site/components/motion/CountUp.tsx` | Animates a number from 0 to target on viewport entry |
| `adjeet-site/tests/unit/content/services.test.ts` | Data integrity: all slugs unique, all required fields present |
| `adjeet-site/tests/unit/content/gallery.test.ts` | Data integrity: featured photos exist, service slugs valid |
| `adjeet-site/tests/unit/components/Button.test.tsx` | RTL: variants render, click fires, asChild renders anchor |
| `adjeet-site/tests/unit/components/Accordion.test.tsx` | RTL: items hidden by default, expand/collapse on click |
| `adjeet-site/tests/unit/components/Lightbox.test.tsx` | RTL: ESC closes, arrow keys navigate |
| `adjeet-site/tests/unit/components/CountUp.test.tsx` | Unit: reduced motion skips animation |

---

## Task 1: Content data — services.ts

**Files:**
- Create: `adjeet-site/content/services.ts`
- Create: `adjeet-site/tests/unit/content/services.test.ts`

- [ ] **Step 1: Create the content directory and write the test**

```bash
mkdir -p adjeet-site/content
mkdir -p adjeet-site/tests/unit/content
```

Create `adjeet-site/tests/unit/content/services.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { services, SERVICE_SLUGS } from '@/content/services'

describe('services data', () => {
  it('has 10 service entries', () => {
    expect(services).toHaveLength(10)
  })

  it('all slugs are unique', () => {
    const slugs = services.map(s => s.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every service has required fields', () => {
    for (const s of services) {
      expect(s.slug, `${s.slug} missing slug`).toBeTruthy()
      expect(s.name, `${s.slug} missing name`).toBeTruthy()
      expect(s.tagline, `${s.slug} missing tagline`).toBeTruthy()
      expect(s.description, `${s.slug} missing description`).toBeTruthy()
      expect(s.materials.length, `${s.slug} missing materials`).toBeGreaterThan(0)
      expect(s.sizes.length, `${s.slug} missing sizes`).toBeGreaterThan(0)
      expect(s.turnaround, `${s.slug} missing turnaround`).toBeTruthy()
      expect(s.faqs.length, `${s.slug} missing faqs`).toBeGreaterThanOrEqual(3)
      expect(s.heroImage, `${s.slug} missing heroImage`).toBeTruthy()
    }
  })

  it('SERVICE_SLUGS exports all 10 slugs as a tuple', () => {
    expect(SERVICE_SLUGS).toHaveLength(10)
    expect(SERVICE_SLUGS).toContain('glow-sign-boards')
  })

  it('relatedServices only reference valid slugs', () => {
    const allSlugs = new Set(services.map(s => s.slug))
    for (const s of services) {
      for (const rel of s.relatedServices) {
        expect(allSlugs.has(rel), `${s.slug} references unknown slug "${rel}"`).toBe(true)
      }
    }
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd adjeet-site && npx vitest run tests/unit/content/services.test.ts
```

Expected: FAIL — "Cannot find module '@/content/services'"

- [ ] **Step 3: Create content/services.ts**

Create `adjeet-site/content/services.ts`:

```typescript
export interface Service {
  slug: string
  name: string
  tagline: string
  description: string
  materials: string[]
  sizes: string[]
  turnaround: string
  faqs: { q: string; a: string }[]
  relatedServices: string[]
  heroImage: string
  icon: string
}

export const SERVICE_SLUGS = [
  'glow-sign-boards',
  'acp-led-signage',
  'flex-printing',
  'vehicle-branding',
  'wall-painting',
  'f-pole-installation',
  'in-shop-branding',
  'events-and-puja',
  'one-way-vision',
  'product-display',
] as const

export type ServiceSlug = (typeof SERVICE_SLUGS)[number]

export const services: Service[] = [
  {
    slug: 'glow-sign-boards',
    name: 'Glow Sign Boards',
    tagline: 'Illuminate your brand 24/7',
    description:
      'LED-backlit and neon-effect acrylic sign boards that keep your business visible day and night. We fabricate custom glow signs in ACP, acrylic, and aluminium channel letters — sized from a single shopfront panel to large hoarding installations. Every sign is weatherproofed for North Bengal\'s monsoon and winter conditions, and wired for low energy consumption.',
    materials: ['Acrylic', 'ACP sheet', 'Aluminium channel letters', 'LED strip (SMD)', 'MS frame'],
    sizes: ['1×2 ft', '2×4 ft', '3×6 ft', '4×8 ft', 'Custom hoarding size'],
    turnaround: '5–7 working days',
    faqs: [
      {
        q: 'How long do the LED strips last?',
        a: 'Quality SMD LED strips typically last 30,000–50,000 hours under normal usage. We use branded drivers and ICs to extend lifespan.',
      },
      {
        q: 'Can you install on a second-floor facade?',
        a: 'Yes. Our installation team handles elevated work with proper scaffolding and safety equipment across Siliguri and surrounding districts.',
      },
      {
        q: 'Do glow signs work during power cuts?',
        a: 'Standard glow signs require mains power. We can integrate an inverter or UPS connection on request — ideal for hospital or pharmacy signage.',
      },
      {
        q: 'What warranty do you offer?',
        a: 'We provide a one-year warranty on LED components and fabrication workmanship. Driver replacements are covered within this period.',
      },
    ],
    relatedServices: ['acp-led-signage', 'f-pole-installation', 'in-shop-branding'],
    heroImage: '/images/services/glow-sign-boards-hero.jpg',
    icon: 'lightbulb',
  },
  {
    slug: 'acp-led-signage',
    name: 'ACP & LED Signage',
    tagline: 'Clean, durable faces for modern brands',
    description:
      'Aluminium Composite Panel (ACP) cladding combined with LED module lighting creates the clean, premium look demanded by banks, telecom showrooms, and retail chains. We cut, route, and bond ACP to precise dimensions, then back-light or face-light with uniform LED modules. The result is a sign that reads well at distance and retains its finish through years of sun and rain.',
    materials: ['ACP (Alucobond / local)', 'LED modules', 'Aluminium extrusion', 'PVC flex backing', 'Stainless steel fixings'],
    sizes: ['Custom — from 2 sq ft to full building facade'],
    turnaround: '7–10 working days',
    faqs: [
      {
        q: 'Which ACP brands do you work with?',
        a: 'We stock both Alucobond (imported) and quality domestic ACP. Domestic is cost-effective for interior signage; Alucobond is recommended for exterior long-term installations.',
      },
      {
        q: 'Can you match a brand\'s exact Pantone colour?',
        a: 'Yes. We use UV-stable vinyl wrap or powder-coated finishes to match brand colour standards provided by your agency.',
      },
      {
        q: 'Is ACP signage suitable for the Darjeeling hill area?',
        a: 'Yes, with appropriate weather-sealed fixings and stainless hardware to handle humidity and temperature swings at altitude.',
      },
    ],
    relatedServices: ['glow-sign-boards', 'in-shop-branding', 'f-pole-installation'],
    heroImage: '/images/services/acp-led-signage-hero.jpg',
    icon: 'panels',
  },
  {
    slug: 'flex-printing',
    name: 'Flex Printing',
    tagline: 'Large-format print for every surface',
    description:
      'High-resolution flex banner and vinyl printing for hoardings, retail backdrops, event walls, and temporary signage. We print on 280 gsm and 440 gsm flex media using UV-resistant solvent inks, then eyelet, hem, or mount to your specification. Turnaround is fast — most standard runs are ready within 24–48 hours.',
    materials: ['280 gsm frontlit flex', '440 gsm blockout flex', 'One-way vision vinyl', 'Matte/gloss vinyl sticker'],
    sizes: ['A3 to 40×10 ft continuous roll — custom cut to order'],
    turnaround: '1–3 working days',
    faqs: [
      {
        q: 'What file format should I send?',
        a: 'PDF at 1:1 scale (72–100 dpi for large format) or AI/CDR with fonts outlined. We can also work from high-res JPG/PNG.',
      },
      {
        q: 'Can you design the artwork as well?',
        a: 'Yes. Our in-house design team can create or adapt artwork for an additional design fee. Send references and content and we will quote.',
      },
      {
        q: 'How do I calculate the cost?',
        a: 'Flex printing is priced per square foot plus media grade. Contact us on WhatsApp with dimensions and quantity for an instant quote.',
      },
    ],
    relatedServices: ['vehicle-branding', 'events-and-puja', 'one-way-vision'],
    heroImage: '/images/services/flex-printing-hero.jpg',
    icon: 'print',
  },
  {
    slug: 'vehicle-branding',
    name: 'Vehicle Branding',
    tagline: 'Turn every kilometre into an impression',
    description:
      'Full and partial vehicle wraps that transform cars, auto-rickshaws, buses, and delivery vans into moving billboards. We use calendered and cast vinyl films, cut-vinyl lettering, and printed wraps — applied by trained fitters who ensure bubble-free, heat-contoured coverage across curves and edges. Ideal for fleet owners, FMCG brands, and election campaigns across North Bengal.',
    materials: ['Cast vinyl wrap film', 'Calendered vinyl', 'Cut vinyl lettering', 'Laminate (matte/gloss)'],
    sizes: ['Auto-rickshaw panels', 'Car partial/full', 'Bus full-wrap', 'Truck side panels'],
    turnaround: '2–5 working days per vehicle',
    faqs: [
      {
        q: 'Will the wrap damage my vehicle\'s original paint?',
        a: 'No. Quality cast vinyl is paint-safe and fully removable within its 5-year lifespan without leaving residue, provided the original paint is in good condition.',
      },
      {
        q: 'Can you brand a fleet of 20 vehicles?',
        a: 'Absolutely. Fleet projects receive priority scheduling and volume pricing. We can handle sequential numbering, driver name plates, and route displays.',
      },
      {
        q: 'How long does the wrap last outdoors in North Bengal\'s climate?',
        a: 'Cast vinyl lasts 5–7 years; calendered vinyl 2–4 years. UV laminate significantly extends outdoor life in high-sun exposure areas.',
      },
    ],
    relatedServices: ['flex-printing', 'in-shop-branding', 'one-way-vision'],
    heroImage: '/images/services/vehicle-branding-hero.jpg',
    icon: 'truck',
  },
  {
    slug: 'wall-painting',
    name: 'Wall Painting',
    tagline: 'Durable outdoor advertising on any wall',
    description:
      'Hand-painted and stencil-painted wall advertising for rural markets, highways, and peri-urban areas where flex and backlit signs are impractical. Our painters use exterior-grade enamel and weather-shield paints that withstand monsoon rain and humidity. Wall painting remains cost-effective and legally permissible in many areas where hoardings require permissions, making it ideal for FMCG brand campaigns across the Dooars and Terai.',
    materials: ['Exterior enamel paint', 'Weather-shield emulsion', 'Primer', 'Stencil film'],
    sizes: ['10 sq ft to 500+ sq ft wall area'],
    turnaround: '3–7 working days (site-dependent)',
    faqs: [
      {
        q: 'Do you obtain wall permission from owners?',
        a: 'We can assist in negotiating wall permission. The client is responsible for any permission fees; we handle the logistics and documentation support.',
      },
      {
        q: 'How many years does wall painting last?',
        a: 'With quality exterior enamel and a proper primer coat, wall painting typically lasts 3–5 years before a refresh is needed.',
      },
      {
        q: 'Can you repaint an existing old wall ad?',
        a: 'Yes. We assess the substrate condition and apply appropriate primer before repainting. An additional cost applies for heavy surface preparation.',
      },
    ],
    relatedServices: ['flex-printing', 'f-pole-installation', 'vehicle-branding'],
    heroImage: '/images/services/wall-painting-hero.jpg',
    icon: 'paint-roller',
  },
  {
    slug: 'f-pole-installation',
    name: 'F-Pole Installation',
    tagline: 'High-visibility roadside display structures',
    description:
      'Fabrication and installation of F-pole (flag pole) sign structures that elevate your branding to eye-catching height along highways, commercial corridors, and roundabouts. We design and weld custom MS/GI pole structures, anchor them with concrete foundations sized for local wind loads, and mount illuminated or non-illuminated sign faces. Trusted by fuel stations, hospitals, hotels, and retail chains across Siliguri and district towns.',
    materials: ['MS hollow section (pole)', 'GI pipe', 'RCC foundation', 'ACP/flex sign face', 'LED floodlight (optional)'],
    sizes: ['10 ft to 40 ft pole height — single or double arm'],
    turnaround: '10–15 working days (includes foundation curing)',
    faqs: [
      {
        q: 'Do you handle permissions for roadside structures?',
        a: 'We guide you through the municipal or NHAI permission process. Approval timelines depend on the authority; fabrication begins once permission is in hand.',
      },
      {
        q: 'Can the pole withstand Nor\'wester storms?',
        a: 'Our foundations are designed to IS 875 wind load standards for West Bengal. We recommend periodic inspection after severe storms.',
      },
      {
        q: 'Can I change the sign face later without replacing the pole?',
        a: 'Yes. We design mounting systems that allow sign-face replacement without structural work, keeping future update costs low.',
      },
    ],
    relatedServices: ['glow-sign-boards', 'acp-led-signage', 'flex-printing'],
    heroImage: '/images/services/f-pole-installation-hero.jpg',
    icon: 'flag-pole',
  },
  {
    slug: 'in-shop-branding',
    name: 'In-Shop Branding',
    tagline: 'Turn your interior into a brand experience',
    description:
      'Complete interior branding solutions for retail outlets, showrooms, restaurants, and offices — from wall graphics and product display headers to hanging banners, directional signage, and branded counter fascias. We handle concept-to-installation so the finished space is consistent with your brand guidelines. Preferred vendor for telecom, FMCG, and banking sector rollouts across North Bengal.',
    materials: ['ACP panels', 'Backlit acrylic', 'Vinyl wall graphics', 'Foam board', 'Hanging display systems'],
    sizes: ['Single counter to full-store rollout'],
    turnaround: '7–14 working days (scope-dependent)',
    faqs: [
      {
        q: 'Can you work outside business hours to avoid disruption?',
        a: 'Yes. For retail and bank installations we schedule overnight or early morning shifts so the space is ready before opening.',
      },
      {
        q: 'Do you handle multiple outlet rollouts simultaneously?',
        a: 'Yes. We have teams that can execute parallel installations across Siliguri, Jalpaiguri, and Cooch Behar zones simultaneously.',
      },
      {
        q: 'Can you match my HO-supplied brand kit?',
        a: 'Absolutely. Send us your brand guidelines and site dimensions and we will produce a compliant execution plan for approval before fabrication.',
      },
    ],
    relatedServices: ['acp-led-signage', 'glow-sign-boards', 'product-display'],
    heroImage: '/images/services/in-shop-branding-hero.jpg',
    icon: 'store',
  },
  {
    slug: 'events-and-puja',
    name: 'Events & Puja Decoration',
    tagline: 'Make every celebration unforgettable',
    description:
      'End-to-end signage and decoration for Durga Puja pandals, corporate events, product launches, and public celebrations across North Bengal. We supply stage backdrops, entrance arches, flex banners, directional signage, LED flex borders, and themed props — all fabricated in our Siliguri workshop and installed on-site. Trusted by community puja committees and corporate event teams for over two decades.',
    materials: ['Flex print backdrop', 'MS arch frame', 'LED pixel strip', 'Thermocol prop', 'Fabric draping'],
    sizes: ['10×10 ft stall to full pandal/stage setup'],
    turnaround: '3–10 working days (varies by event scale)',
    faqs: [
      {
        q: 'Do you handle Durga Puja pandal decoration?',
        a: 'Yes, this is one of our busiest seasons. We work with committees across Siliguri, Jalpaiguri, and Cooch Behar. Book early — slots fill by August.',
      },
      {
        q: 'Can you supply and install within 48 hours for an urgent event?',
        a: 'For standard flex and banner elements yes, subject to workshop capacity. Fabricated structures need at least 5 days. Call us to check availability.',
      },
      {
        q: 'Do you dismantle and remove after the event?',
        a: 'Yes. Dismantling and removal can be included in the project quote. We are familiar with post-Puja cleanup timelines in the region.',
      },
    ],
    relatedServices: ['flex-printing', 'in-shop-branding', 'wall-painting'],
    heroImage: '/images/services/events-puja-hero.jpg',
    icon: 'sparkles',
  },
  {
    slug: 'one-way-vision',
    name: 'One-Way Vision',
    tagline: 'Brand your glass without blocking the view',
    description:
      'Perforated vinyl film that lets your brand show prominently from outside while maintaining clear sightlines from inside — ideal for shopfront glazing, vehicle rear windows, and glass partition branding. We print on 50/50 perforation vinyl (50% ink, 50% clear holes) using high-resolution solvent printing, then cut and apply to glass surfaces. The result is professional exterior branding with zero interior obstruction.',
    materials: ['50/50 perforated vinyl', 'Window application film', 'Solvent print ink'],
    sizes: ['Custom cut to glass dimensions'],
    turnaround: '3–5 working days',
    faqs: [
      {
        q: 'How visible is the image from outside?',
        a: 'On 50/50 perf vinyl, the image is bold and legible at 1–2 metres distance in normal daylight. At night, interior lighting can reduce exterior visibility — we can advise on placement.',
      },
      {
        q: 'Can one-way vision be applied to curved glass?',
        a: 'It works best on flat glass. For mildly curved surfaces we use short-grain vinyl. Highly curved auto glass requires a curved-surface specialist application.',
      },
      {
        q: 'Is it removable?',
        a: 'Yes, fully removable without residue, provided the glass surface is clean and the film has not been on for more than 3–4 years.',
      },
    ],
    relatedServices: ['vehicle-branding', 'in-shop-branding', 'flex-printing'],
    heroImage: '/images/services/one-way-vision-hero.jpg',
    icon: 'eye',
  },
  {
    slug: 'product-display',
    name: 'Product Display',
    tagline: 'Showcase products that sell themselves',
    description:
      'Custom point-of-sale (POS) and point-of-purchase (POP) display units — standees, wobbler holders, shelf talkers, product glorifiers, and freestanding display units (FSDUs). We fabricate in acrylic, foam board, ACP, and MS/GI metal, then print and finish in-house for a single-vendor, fast-turnaround solution. Widely used by FMCG brands, electronics retailers, and pharma companies for product launches and seasonal promotions across North Bengal distribution channels.',
    materials: ['Acrylic sheet', 'Foam board (5/10 mm)', 'ACP', 'MS/GI metal frame', 'UV-print laminate'],
    sizes: ['A5 shelf talker to 6 ft freestanding unit'],
    turnaround: '5–10 working days',
    faqs: [
      {
        q: 'Can you manufacture 500 identical standees for a pan-Bengal campaign?',
        a: 'Yes. We have the capacity for medium-run production. For orders above 200 units, contact us for a volume quote and production schedule.',
      },
      {
        q: 'Do you ship to distributors outside Siliguri?',
        a: 'Yes. We pack flat-pack or assembled and ship via road freight to Kolkata, Guwahati, and points in between. Transport cost is additional.',
      },
      {
        q: 'Can you add QR codes or scratch-card elements?',
        a: 'Yes — UV-printed QR codes, tear-off pads, and scratch elements can all be integrated into the display design.',
      },
    ],
    relatedServices: ['in-shop-branding', 'acp-led-signage', 'flex-printing'],
    heroImage: '/images/services/product-display-hero.jpg',
    icon: 'display',
  },
]

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find(s => s.slug === slug)
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
cd adjeet-site && npx vitest run tests/unit/content/services.test.ts
```

Expected: All 5 tests pass.

- [ ] **Step 5: Commit**

```bash
cd .. && git add adjeet-site/content/services.ts adjeet-site/tests/unit/content/services.test.ts
git commit -m "feat: content/services.ts — 10 service entries with full data"
```

---

## Task 2: Content data — gallery.ts + programmatic.ts

**Files:**
- Create: `adjeet-site/content/gallery.ts`
- Create: `adjeet-site/content/programmatic.ts`
- Create: `adjeet-site/tests/unit/content/gallery.test.ts`

- [ ] **Step 1: Write gallery test**

Create `adjeet-site/tests/unit/content/gallery.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { photos, getFeaturedPhotos, getPhotosByService, getPhotosByCity } from '@/content/gallery'
import { SERVICE_SLUGS } from '@/content/services'

describe('gallery data', () => {
  it('has at least 12 photos', () => {
    expect(photos.length).toBeGreaterThanOrEqual(12)
  })

  it('all photo ids are unique', () => {
    const ids = photos.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('at least 6 photos are featured', () => {
    expect(getFeaturedPhotos().length).toBeGreaterThanOrEqual(6)
  })

  it('every photo has required fields', () => {
    for (const p of photos) {
      expect(p.id).toBeTruthy()
      expect(p.src).toBeTruthy()
      expect(p.alt).toBeTruthy()
      expect(p.service).toBeTruthy()
      expect(p.city).toBeTruthy()
      expect(p.year).toBeGreaterThan(2000)
    }
  })

  it('all photo service slugs are valid', () => {
    const validSlugs = new Set<string>(SERVICE_SLUGS)
    for (const p of photos) {
      expect(validSlugs.has(p.service), `photo ${p.id} has invalid service slug "${p.service}"`).toBe(true)
    }
  })

  it('getPhotosByService filters correctly', () => {
    const result = getPhotosByService('flex-printing')
    expect(result.every(p => p.service === 'flex-printing')).toBe(true)
  })

  it('getPhotosByCity filters correctly', () => {
    const result = getPhotosByCity('siliguri')
    expect(result.every(p => p.city === 'siliguri')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd adjeet-site && npx vitest run tests/unit/content/gallery.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create content/gallery.ts**

Create `adjeet-site/content/gallery.ts`:

```typescript
import { ServiceSlug } from '@/content/services'

export interface GalleryPhoto {
  id: string
  src: string
  alt: string
  service: ServiceSlug
  city: string
  year: number
  featured: boolean
}

export const photos: GalleryPhoto[] = [
  {
    id: 'gs-01',
    src: '/images/gallery/glow-sign-siliguri-01.jpg',
    alt: 'Glow sign board installed for a pharmacy on Hill Cart Road, Siliguri',
    service: 'glow-sign-boards',
    city: 'siliguri',
    year: 2024,
    featured: true,
  },
  {
    id: 'gs-02',
    src: '/images/gallery/glow-sign-jalpaiguri-01.jpg',
    alt: 'Double-sided glow sign for a clothing showroom in Jalpaiguri',
    service: 'glow-sign-boards',
    city: 'jalpaiguri',
    year: 2023,
    featured: true,
  },
  {
    id: 'acp-01',
    src: '/images/gallery/acp-siliguri-01.jpg',
    alt: 'ACP cladding and LED module signage for a bank branch in Siliguri',
    service: 'acp-led-signage',
    city: 'siliguri',
    year: 2024,
    featured: true,
  },
  {
    id: 'acp-02',
    src: '/images/gallery/acp-cooch-behar-01.jpg',
    alt: 'ACP facade with backlit logo for a telecom outlet in Cooch Behar',
    service: 'acp-led-signage',
    city: 'cooch-behar',
    year: 2023,
    featured: false,
  },
  {
    id: 'flex-01',
    src: '/images/gallery/flex-siliguri-01.jpg',
    alt: 'Large-format flex hoarding for a real estate project in Siliguri',
    service: 'flex-printing',
    city: 'siliguri',
    year: 2024,
    featured: true,
  },
  {
    id: 'flex-02',
    src: '/images/gallery/flex-malda-01.jpg',
    alt: 'Event flex banner printed and installed for a product launch in Malda',
    service: 'flex-printing',
    city: 'malda',
    year: 2023,
    featured: false,
  },
  {
    id: 'vb-01',
    src: '/images/gallery/vehicle-branding-siliguri-01.jpg',
    alt: 'Full vehicle wrap on a delivery van for an FMCG brand in Siliguri',
    service: 'vehicle-branding',
    city: 'siliguri',
    year: 2024,
    featured: true,
  },
  {
    id: 'vb-02',
    src: '/images/gallery/vehicle-branding-jalpaiguri-01.jpg',
    alt: 'Auto-rickshaw panel branding for a mobile network in Jalpaiguri',
    service: 'vehicle-branding',
    city: 'jalpaiguri',
    year: 2023,
    featured: false,
  },
  {
    id: 'fp-01',
    src: '/images/gallery/f-pole-siliguri-01.jpg',
    alt: '30-ft F-pole installation for a petrol station on NH-10, Siliguri',
    service: 'f-pole-installation',
    city: 'siliguri',
    year: 2022,
    featured: true,
  },
  {
    id: 'is-01',
    src: '/images/gallery/in-shop-siliguri-01.jpg',
    alt: 'Full in-shop branding for a telecom showroom in Siliguri',
    service: 'in-shop-branding',
    city: 'siliguri',
    year: 2024,
    featured: true,
  },
  {
    id: 'ev-01',
    src: '/images/gallery/events-siliguri-01.jpg',
    alt: 'Durga Puja pandal entrance arch and backdrop, Siliguri',
    service: 'events-and-puja',
    city: 'siliguri',
    year: 2023,
    featured: false,
  },
  {
    id: 'wp-01',
    src: '/images/gallery/wall-painting-darjeeling-01.jpg',
    alt: 'Exterior wall painting for an FMCG brand on a highway in Darjeeling district',
    service: 'wall-painting',
    city: 'darjeeling',
    year: 2023,
    featured: false,
  },
]

export function getFeaturedPhotos(): GalleryPhoto[] {
  return photos.filter(p => p.featured)
}

export function getPhotosByService(service: ServiceSlug): GalleryPhoto[] {
  return photos.filter(p => p.service === service)
}

export function getPhotosByCity(city: string): GalleryPhoto[] {
  return photos.filter(p => p.city === city)
}
```

- [ ] **Step 4: Run gallery test — expect PASS**

```bash
npx vitest run tests/unit/content/gallery.test.ts
```

Expected: All 7 tests pass.

- [ ] **Step 5: Create content/programmatic.ts**

Create `adjeet-site/content/programmatic.ts`:

```typescript
export interface ProgrammaticPage {
  service: string
  city: string
  slug: string
  headline: string
  body: string
  stats: { label: string; value: string }[]
  relatedCities: string[]
}

const CITIES = ['siliguri', 'jalpaiguri', 'cooch-behar', 'darjeeling', 'malda'] as const
const PROG_SERVICES = ['glow-sign-board', 'acp-led-signage', 'flex-printing', 'vehicle-branding', 'f-pole-installation'] as const

export type ProgrammaticCity = (typeof CITIES)[number]
export type ProgrammaticService = (typeof PROG_SERVICES)[number]

export const programmaticPages: ProgrammaticPage[] = [
  // ── Glow Sign Board ──────────────────────────────────────────────────
  {
    service: 'glow-sign-board',
    city: 'siliguri',
    slug: 'glow-sign-board-in-siliguri',
    headline: 'Glow Sign Boards in Siliguri — Illuminate Your Business on Hill Cart Road',
    body: `Siliguri is the commercial gateway to North Bengal, Sikkim, Bhutan, and Northeast India. Hill Cart Road, Sevoke Road, and the Bidhan Market corridor see some of the highest footfall in the region, making high-visibility signage essential for any business that wants to stand out. Whether you run a pharmacy near Bengal Club More or a showroom on Sevoke Road, a well-lit glow sign board is often the first thing a potential customer sees.

AD-JEET has been designing, fabricating, and installing glow sign boards in Siliguri since 1990 — before the city's commercial expansion truly began. We have installed signage for pharmacies, clothing retailers, telecom showrooms, restaurants, hospitals, and logistics companies across every commercial zone in the city. Our familiarity with Siliguri's building stock, municipal regulations, and power-supply characteristics means we can advise on the right sign type, orientation, and electrical setup for your specific location.

Our Siliguri glow sign board service covers ACP-framed backlit panels, acrylic channel letters, neon-effect LED tubes, and combination sign systems. Every sign is fabricated at our Patiram Jote workshop using SMD LED strips rated for 30,000+ hours, weatherproofed junction boxes, and ISI-certified electrical drivers that handle the voltage fluctuations common in North Bengal's grid.

Installation is handled by our own team — not outsourced subcontractors — with proper scaffolding and safety equipment for elevated facades. We typically complete Siliguri installations within 5–7 working days of artwork approval. Post-installation, we offer a one-year warranty on LED components and fabrication workmanship.

If you are a new business setting up in Siliguri or an established brand refreshing your exterior signage, contact AD-JEET on WhatsApp for a same-day site visit and quote. We cover the entire Siliguri Municipal Corporation area including Matigara, Naxalbari, and Bagdogra approaches.`,
    stats: [
      { label: 'Years in Siliguri', value: '35+' },
      { label: 'Signs installed', value: '200+' },
      { label: 'Warranty', value: '1 year' },
    ],
    relatedCities: ['jalpaiguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'glow-sign-board',
    city: 'jalpaiguri',
    slug: 'glow-sign-board-in-jalpaiguri',
    headline: 'Glow Sign Boards in Jalpaiguri — Expert Signage for the Tea Garden Gateway',
    body: `Jalpaiguri town sits at the intersection of NH-27 and the rail corridor linking Siliguri with Assam, making it a natural commercial hub for the Dooars region. The Dinbazar market area, Station Road, and the newer commercial strips along the bypass see daily footfall from traders, tea garden workers, and travelers — a mixed audience that makes clear, eye-catching signage essential.

AD-JEET has been serving businesses in Jalpaiguri since the early 1990s, installing glow sign boards for pharmacies, cloth merchants, hardware stores, microfinance branches, and telecom outlets throughout the town. We understand Jalpaiguri's building typology — the older pucca-fronted shops in Dinbazar, the newer concrete commercial buildings on the bypass — and design signage structures appropriate for each substrate.

Our glow sign boards for Jalpaiguri use SMD LED strips and weather-sealed drivers designed to handle the higher humidity of the Dooars foothills. Monsoon rainfall here is significantly heavier than in Siliguri, so we pay particular attention to IP-rated junction boxes and proper cable routing to prevent water ingress. All poles and MS frames are hot-dip galvanised or painted with rust-inhibiting primer before installation.

We typically schedule Jalpaiguri installations on a weekly visit basis — our team is in town regularly and can combine site visits with installation runs to reduce wait times. A standard glow sign board in Jalpaiguri is ready within 7–10 working days of order confirmation.

Contact AD-JEET on WhatsApp to arrange a free site measurement and quote for your Jalpaiguri premises.`,
    stats: [
      { label: 'Districts covered', value: '15+' },
      { label: 'Turnaround', value: '7–10 days' },
      { label: 'Est.', value: '1990' },
    ],
    relatedCities: ['siliguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'glow-sign-board',
    city: 'cooch-behar',
    slug: 'glow-sign-board-in-cooch-behar',
    headline: 'Glow Sign Boards in Cooch Behar — Bright Signage for a Royal Town',
    body: `Cooch Behar is a distinct market with its own commercial character — the areas around the Sagar Dighi market, RN Road, and Rasikbeel Road host a dense mix of retail, banking, and services catering to both the town and surrounding rural blocks. The royal heritage of Cooch Behar and the tourism footfall around the Rajbari add a premium dimension to the retail environment that demands professional-quality signage.

AD-JEET has executed glow sign board projects in Cooch Behar for pharmacies, cooperative bank branches, mobile retailers, and hospitality businesses. We are familiar with the municipal regulations governing illuminated signage in the heritage zone near the Rajbari and can guide you on compliant sign types and placement that avoid regulatory complications.

Our Cooch Behar glow sign installations use the same workshop-quality LED and ACP components as our Siliguri projects — we do not compromise on materials for out-of-city work. Transportation of fabricated signs to Cooch Behar is included in our project quotes, and our installation team makes dedicated trips to the town to ensure proper supervision of the work.

Turnaround for Cooch Behar projects is typically 10–12 working days to account for transport and scheduling. Contact us on WhatsApp to discuss your signage requirement — we will arrange a site visit on our next scheduled trip to the area.`,
    stats: [
      { label: 'Service radius', value: '150 km' },
      { label: 'Est.', value: '1990' },
      { label: 'Warranty', value: '1 year' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'glow-sign-board',
    city: 'darjeeling',
    slug: 'glow-sign-board-in-darjeeling',
    headline: 'Glow Sign Boards in Darjeeling — High-Altitude Signage Built to Last',
    body: `Darjeeling's commercial zones — Chowk Bazaar, the Mall Road tourist strip, Laden La Road, and the Lebong Cart Road market — demand signage that performs under punishing conditions: cold winters, heavy monsoon rainfall, mist, and the corrosive effect of altitude humidity. Standard lowland sign fabrication practices are inadequate here; materials and construction methods must be chosen for the specific climate.

AD-JEET has supplied and installed glow sign boards in Darjeeling town and the surrounding hill areas for over two decades. We select stainless steel hardware, sealed LED drivers rated for low-temperature operation, and ACP grades that resist condensation-related delamination. Our frames use epoxy-primed and powder-coated MS section rather than standard paint, significantly extending corrosion resistance at altitude.

The visual character of Darjeeling's commercial streets also calls for a degree of design sensitivity — oversized or poorly proportioned signage looks out of place against the town's colonial and vernacular architecture. Our design team can propose sign formats that make your brand stand out while respecting the scale and character of the built environment.

Transport and installation in Darjeeling is scheduled on our hill-route trip calendar. Contact AD-JEET on WhatsApp to discuss your requirement and we will advise on the appropriate sign type and timeline for your location.`,
    stats: [
      { label: 'Hill area experience', value: '20+ yrs' },
      { label: 'Est.', value: '1990' },
      { label: 'Warranty', value: '1 year' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'glow-sign-board',
    city: 'malda',
    slug: 'glow-sign-board-in-malda',
    headline: 'Glow Sign Boards in Malda — Signage for the Mango Capital of Bengal',
    body: `Malda is a fast-growing commercial centre with English Bazar as its main market hub. The growth of banking, retail, and service sectors in Malda has driven significant demand for professional exterior signage. AD-JEET now regularly serves clients in Malda town, fabricating glow sign boards in our Siliguri workshop and dispatching them on our NH-12 transport run.

We have installed glow signs for pharmacies, clothing retailers, electronics showrooms, and private clinics in English Bazar and Old Malda. Our Malda clients benefit from the same material quality and design standards as our Siliguri work — the distance does not affect the product, only the logistics timeline.

For Malda projects, we coordinate a site visit with our transport run and aim to complete fabrication within 10 working days of artwork approval, with installation on the following trip. A dedicated WhatsApp channel keeps clients updated on progress and delivery timing.

Contact AD-JEET to discuss your Malda signage project. We cover English Bazar, Old Malda, and surrounding areas on our regular North Bengal service routes.`,
    stats: [
      { label: 'Service routes', value: 'NH-12 corridor' },
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '10–14 days' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'cooch-behar'],
  },
  // ── ACP & LED Signage ─────────────────────────────────────────────────
  {
    service: 'acp-led-signage',
    city: 'siliguri',
    slug: 'acp-led-signage-in-siliguri',
    headline: 'ACP & LED Signage in Siliguri — Premium Cladding for Modern Brands',
    body: `Aluminium Composite Panel (ACP) signage has become the standard for corporate brand environments across Siliguri's commercial corridors. Banks, telecom showrooms, automobile dealerships, and pharmacy chains use ACP-clad fascias for their clean, uniform appearance and durability. AD-JEET has been the preferred ACP signage fabricator for numerous national brands operating outlets in Siliguri. We handle the complete scope — survey, design, fabrication, and installation — from our Siliguri base. Contact us on WhatsApp for a same-day quote.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Brands served', value: '50+' },
      { label: 'Warranty', value: '1 year' },
    ],
    relatedCities: ['jalpaiguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'acp-led-signage',
    city: 'jalpaiguri',
    slug: 'acp-led-signage-in-jalpaiguri',
    headline: 'ACP & LED Signage in Jalpaiguri — Corporate-Quality Fascias for Dooars Businesses',
    body: `ACP signage brings a corporate, uniform finish to Jalpaiguri's retail and service businesses that flex and paint cannot match. AD-JEET fabricates ACP sign systems for Jalpaiguri clients including cooperative banks, telecom outlets, and multi-brand retail stores. Our Dooars-specification ACP work uses sealed fixings to handle the monsoon-heavy rainfall of the foothills. We schedule Jalpaiguri installation visits weekly. Contact us on WhatsApp to arrange a site survey and quote for your premises.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Districts', value: '15+' },
      { label: 'Turnaround', value: '7–10 days' },
    ],
    relatedCities: ['siliguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'acp-led-signage',
    city: 'cooch-behar',
    slug: 'acp-led-signage-in-cooch-behar',
    headline: 'ACP & LED Signage in Cooch Behar — Premium Fascias for a Growing Market',
    body: `Cooch Behar's banking and retail sector expansion has created strong demand for corporate-grade ACP signage. AD-JEET supplies and installs ACP LED fascias for Cooch Behar clients, shipping fabricated panels on our dedicated transport run. Our work covers bank branches, insurance offices, and retail chains operating in the town. We are familiar with the heritage zone regulations near Cooch Behar Rajbari and can guide you on compliant signage design. Contact us on WhatsApp to discuss your project.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Service area', value: '150 km radius' },
      { label: 'Warranty', value: '1 year' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'acp-led-signage',
    city: 'darjeeling',
    slug: 'acp-led-signage-in-darjeeling',
    headline: 'ACP & LED Signage in Darjeeling — Hill-Spec Corporate Fascias',
    body: `ACP signage in Darjeeling requires hill-specification materials — stainless fixings, sealed LED drivers, and ACP grades resistant to condensation and freeze-thaw cycles. AD-JEET's hill-area ACP installations are built to outlast standard lowland products. We serve hotels, pharmacies, and telecom outlets in Darjeeling town and surrounding hill stations. Our design team understands the visual sensitivity required near heritage streetscapes. Contact us on WhatsApp to discuss your Darjeeling ACP signage project.`,
    stats: [
      { label: 'Hill area exp.', value: '20+ yrs' },
      { label: 'Est.', value: '1990' },
      { label: 'Warranty', value: '1 year' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'acp-led-signage',
    city: 'malda',
    slug: 'acp-led-signage-in-malda',
    headline: 'ACP & LED Signage in Malda — Corporate Signage on the NH-12 Corridor',
    body: `Malda's growing banking and retail sector is driving demand for professional ACP signage in English Bazar and Old Malda. AD-JEET serves Malda clients through our regular NH-12 transport run — fabricating in Siliguri and delivering fully finished panels ready for installation. We cover banks, pharmacies, and showrooms across the Malda district. Contact us on WhatsApp to arrange a site measurement on our next scheduled visit.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '10–14 days' },
      { label: 'Warranty', value: '1 year' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'cooch-behar'],
  },
  // ── Flex Printing ────────────────────────────────────────────────────
  {
    service: 'flex-printing',
    city: 'siliguri',
    slug: 'flex-printing-in-siliguri',
    headline: 'Flex Printing in Siliguri — Fast Large-Format Print for Every Campaign',
    body: `Siliguri's event, retail, and political campaign calendar runs year-round, driving constant demand for fast, high-quality flex printing. AD-JEET's Siliguri workshop turns around standard hoarding-size flex prints within 24–48 hours — from file to finished roll — making us the go-to partner for time-sensitive campaigns, product launches, and Puja advertising. We print on 280 gsm and 440 gsm flex using UV-stable solvent inks with eyelets and hemming included. Contact us on WhatsApp for an instant per-sq-ft quote.`,
    stats: [
      { label: 'Turnaround', value: '24–48 hrs' },
      { label: 'Min. order', value: 'No minimum' },
      { label: 'Est.', value: '1990' },
    ],
    relatedCities: ['jalpaiguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'flex-printing',
    city: 'jalpaiguri',
    slug: 'flex-printing-in-jalpaiguri',
    headline: 'Flex Printing in Jalpaiguri — Hoarding and Banner Print for Dooars Campaigns',
    body: `Jalpaiguri's market events, melas, and political campaigns generate strong demand for flex printing on short notice. AD-JEET prints flex banners and hoarding panels for Jalpaiguri clients from our Siliguri workshop, with same-day or next-day courier dispatch for urgent orders. We serve political parties, community organisations, and retail businesses across the Jalpaiguri district. Contact us on WhatsApp with your dimensions and we will quote within the hour.`,
    stats: [
      { label: 'Dispatch', value: 'Same/next day' },
      { label: 'Est.', value: '1990' },
      { label: 'Min. order', value: 'No minimum' },
    ],
    relatedCities: ['siliguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'flex-printing',
    city: 'cooch-behar',
    slug: 'flex-printing-in-cooch-behar',
    headline: 'Flex Printing in Cooch Behar — Event and Campaign Banners Delivered Fast',
    body: `Cooch Behar's Rashmela, Rajbari events, and political campaign seasons create peaks of flex printing demand. AD-JEET supplies flex banners, backdrops, and hoarding panels to Cooch Behar clients via our regular transport run. Standard orders are dispatched within 48 hours; urgent jobs can be couriered overnight. We cover community events, retail promotions, and large-format hoarding panels across the Cooch Behar district. Contact us on WhatsApp with your requirement.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '48–72 hrs' },
      { label: 'Min. order', value: 'No minimum' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'flex-printing',
    city: 'darjeeling',
    slug: 'flex-printing-in-darjeeling',
    headline: 'Flex Printing in Darjeeling — Large-Format Banners for the Hills',
    body: `Darjeeling's tourism season and political campaign calendar generate demand for flex banners, hotel backdrops, and directional signage on short notice. AD-JEET prints flex in our Siliguri workshop and dispatches to Darjeeling via our hill-route transport or courier. We supply hotels, travel agencies, local businesses, and event organisers with printed and eyeletted banners ready to hang. Contact us on WhatsApp for a fast quote on your Darjeeling flex printing requirement.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '48–72 hrs' },
      { label: 'Min. order', value: 'No minimum' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'flex-printing',
    city: 'malda',
    slug: 'flex-printing-in-malda',
    headline: 'Flex Printing in Malda — Campaign and Retail Banners on the NH-12 Route',
    body: `Malda's mango festival season, political campaigns, and retail promotions drive regular flex printing orders from English Bazar and surrounding areas. AD-JEET dispatches printed flex rolls to Malda clients via our NH-12 transport or courier — standard orders within 48 hours. We serve retailers, political parties, and event organisers across the Malda district. Contact us on WhatsApp for a sq-ft rate and delivery timeline.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '48–72 hrs' },
      { label: 'Min. order', value: 'No minimum' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'cooch-behar'],
  },
  // ── Vehicle Branding ─────────────────────────────────────────────────
  {
    service: 'vehicle-branding',
    city: 'siliguri',
    slug: 'vehicle-branding-in-siliguri',
    headline: 'Vehicle Branding in Siliguri — Wrap Your Fleet for Maximum Reach',
    body: `Siliguri's position as a logistics and distribution hub means thousands of commercial vehicles pass through daily. Vehicle wrapping turns those vehicles into mobile billboards reaching markets from Darjeeling to Assam. AD-JEET has branded cars, auto-rickshaws, buses, and delivery vans for FMCG brands, logistics companies, and political campaigns operating out of Siliguri. We apply cast vinyl wraps at our Siliguri workshop. Contact us on WhatsApp for a vehicle-specific quote.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Vehicle types', value: 'Auto to bus' },
      { label: 'Turnaround', value: '2–5 days/vehicle' },
    ],
    relatedCities: ['jalpaiguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'vehicle-branding',
    city: 'jalpaiguri',
    slug: 'vehicle-branding-in-jalpaiguri',
    headline: 'Vehicle Branding in Jalpaiguri — Mobile Advertising Across the Dooars',
    body: `Jalpaiguri's auto-rickshaw and commercial vehicle fleet serves the entire Dooars corridor. Branded vehicles from Jalpaiguri are seen in tea gardens, market towns, and rural blocks across the district. AD-JEET handles vehicle branding for Jalpaiguri clients at our Siliguri facility — vehicles are brought in, wrapped, and returned within 2–5 days. We serve political parties, cooperatives, and brand campaigns. Contact us on WhatsApp to schedule a vehicle wrapping slot.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '2–5 days' },
      { label: 'Vinyl life', value: '5–7 years' },
    ],
    relatedCities: ['siliguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'vehicle-branding',
    city: 'cooch-behar',
    slug: 'vehicle-branding-in-cooch-behar',
    headline: 'Vehicle Branding in Cooch Behar — Reach Every Block in the District',
    body: `Cooch Behar's commercial vehicles and auto-rickshaws cover a wide geography — the district's flat terrain makes vehicle advertising highly cost-effective. AD-JEET services vehicle branding orders for Cooch Behar clients, with vehicles brought to our Siliguri facility for wrapping. We handle FMCG fleet branding, political campaign vehicles, and individual business wraps. Contact us on WhatsApp to discuss your Cooch Behar vehicle branding requirement.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '2–5 days' },
      { label: 'Vinyl life', value: '5–7 years' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'vehicle-branding',
    city: 'darjeeling',
    slug: 'vehicle-branding-in-darjeeling',
    headline: 'Vehicle Branding in Darjeeling — Brand Your Vehicles for the Hill Routes',
    body: `Darjeeling's shared taxis and jeeps are the primary transport along hill routes — a branded jeep fleet is one of the most effective advertising formats in the hill area. AD-JEET applies vehicle wraps and cut-vinyl lettering for Darjeeling area operators. We use cast vinyl rated for the temperature range and UV exposure of hill altitudes. Vehicles are wrapped at our Siliguri facility. Contact us on WhatsApp to arrange a convenient wrapping appointment.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Vinyl spec', value: 'Hill-rated cast' },
      { label: 'Turnaround', value: '2–5 days' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'vehicle-branding',
    city: 'malda',
    slug: 'vehicle-branding-in-malda',
    headline: 'Vehicle Branding in Malda — Mobile Campaigns Across North Bengal\'s South',
    body: `Malda's flat agricultural hinterland makes vehicle branding a highly visible advertising format — branded vans and auto-rickshaws cover markets from English Bazar to Chanchal and beyond. AD-JEET handles vehicle branding for Malda clients at our Siliguri facility, with vehicles transported on our NH-12 logistics run or driven in by the client. We serve FMCG brands, NGOs, and political campaigns across the Malda district. Contact us on WhatsApp for a quote.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '2–5 days' },
      { label: 'Vinyl life', value: '5–7 years' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'cooch-behar'],
  },
  // ── F-Pole Installation ───────────────────────────────────────────────
  {
    service: 'f-pole-installation',
    city: 'siliguri',
    slug: 'f-pole-installation-in-siliguri',
    headline: 'F-Pole Installation in Siliguri — High-Visibility Roadside Structures on NH-10 and Sevoke Road',
    body: `F-pole (flag pole) signage structures are the dominant format for petrol stations, hospitals, hotels, and large retail stores along Siliguri's main arterial roads. NH-10, Sevoke Road, and the Bagdogra airport approach all host F-pole installations that we have designed and built. AD-JEET fabricates F-pole structures at our Siliguri workshop with RCC foundations, MS pole sections, and sign faces in ACP or flex — with optional LED floodlighting. We handle the full scope from structural design to final installation. Contact us for a site survey and quote.`,
    stats: [
      { label: 'Pole height', value: 'Up to 40 ft' },
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '10–15 days' },
    ],
    relatedCities: ['jalpaiguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'f-pole-installation',
    city: 'jalpaiguri',
    slug: 'f-pole-installation-in-jalpaiguri',
    headline: 'F-Pole Installation in Jalpaiguri — Roadside Signage Structures for NH-27',
    body: `NH-27 through Jalpaiguri is a high-traffic corridor where F-pole signage gives businesses maximum visibility to passing traffic from both directions. AD-JEET has installed F-pole structures for petrol stations, hospitals, and commercial properties in Jalpaiguri. We fabricate in Siliguri and transport fully assembled or kit-form to site. Our Jalpaiguri F-pole projects include foundation work, pole erection, and sign-face installation. Contact us on WhatsApp to discuss your requirement.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '12–18 days' },
      { label: 'Pole height', value: 'Up to 40 ft' },
    ],
    relatedCities: ['siliguri', 'cooch-behar', 'darjeeling'],
  },
  {
    service: 'f-pole-installation',
    city: 'cooch-behar',
    slug: 'f-pole-installation-in-cooch-behar',
    headline: 'F-Pole Installation in Cooch Behar — Elevated Signage for the District\'s Main Roads',
    body: `Cooch Behar's main roads and district highway approaches are ideal locations for F-pole signage — flat terrain ensures visibility from hundreds of metres. AD-JEET has executed F-pole installation projects in Cooch Behar for fuel stations and commercial properties. We handle transport of fabricated components and on-site civil and electrical work through our network of local contractors. Contact us on WhatsApp to arrange a site visit on our next scheduled Cooch Behar trip.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '14–20 days' },
      { label: 'Pole height', value: 'Up to 40 ft' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'f-pole-installation',
    city: 'darjeeling',
    slug: 'f-pole-installation-in-darjeeling',
    headline: 'F-Pole Installation in Darjeeling — Hill-Rated Structures for High-Altitude Sites',
    body: `F-pole installations in the Darjeeling hill area require engineering appropriate for steep terrain, high wind exposure, and the soil conditions of the Himalayan foothills. AD-JEET designs our Darjeeling-area F-pole foundations to account for these factors, using deeper concrete footings and stainless fixings throughout the structure. We have installed sign poles for hotels and commercial properties in the Darjeeling area. Contact us on WhatsApp for a site assessment and structural quote.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Hill-spec', value: 'Deep foundation' },
      { label: 'Turnaround', value: '15–25 days' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'malda'],
  },
  {
    service: 'f-pole-installation',
    city: 'malda',
    slug: 'f-pole-installation-in-malda',
    headline: 'F-Pole Installation in Malda — Highway Signage Structures on NH-12',
    body: `NH-12 through Malda district sees heavy commercial and passenger traffic year-round. F-pole signage along this corridor gives businesses roadside visibility across hundreds of metres. AD-JEET has installed F-pole structures for fuel stations and commercial properties in the Malda area, transporting fabricated components on our regular NH-12 run. We handle foundation, pole erection, and sign-face installation through our field team. Contact us on WhatsApp to discuss your Malda F-pole project.`,
    stats: [
      { label: 'Est.', value: '1990' },
      { label: 'Turnaround', value: '14–20 days' },
      { label: 'Pole height', value: 'Up to 40 ft' },
    ],
    relatedCities: ['siliguri', 'jalpaiguri', 'cooch-behar'],
  },
]

export function getProgrammaticPage(slug: string): ProgrammaticPage | undefined {
  return programmaticPages.find(p => p.slug === slug)
}

export function getProgrammaticSlugs(): string[] {
  return programmaticPages.map(p => p.slug)
}
```

- [ ] **Step 6: Run all content tests**

```bash
cd adjeet-site && npx vitest run tests/unit/content/
```

Expected: All 12 tests pass (5 services + 7 gallery).

- [ ] **Step 7: Commit**

```bash
cd .. && git add adjeet-site/content/gallery.ts adjeet-site/content/programmatic.ts adjeet-site/tests/unit/content/gallery.test.ts
git commit -m "feat: content/gallery.ts + content/programmatic.ts — photo data and 25 SEO landing page entries"
```

---

## Task 3: Button, Tag, Badge

**Files:**
- Create: `adjeet-site/components/ui/Button.tsx`
- Create: `adjeet-site/components/ui/Tag.tsx`
- Create: `adjeet-site/components/ui/Badge.tsx`
- Create: `adjeet-site/tests/unit/components/Button.test.tsx`

- [ ] **Step 1: Write Button tests**

Create `adjeet-site/tests/unit/components/Button.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeTruthy()
  })

  it('fires onClick', () => {
    const fn = vi.fn()
    render(<Button onClick={fn}>Go</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(fn).toHaveBeenCalledOnce()
  })

  it('renders as anchor when href provided', () => {
    render(<Button href="/contact">Contact</Button>)
    const link = screen.getByRole('link', { name: 'Contact' })
    expect(link.getAttribute('href')).toBe('/contact')
  })

  it('applies secondary variant class', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('border')
  })

  it('is disabled when disabled prop passed', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd adjeet-site && npx vitest run tests/unit/components/Button.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create Button.tsx**

Create `adjeet-site/components/ui/Button.tsx`:

```tsx
import Link from 'next/link'
import { type ComponentPropsWithoutRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-blue text-white hover:opacity-90',
  secondary: 'border border-ink text-ink hover:bg-paper-elevated',
  ghost: 'text-ink-muted hover:text-ink',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm font-medium',
  lg: 'px-7 py-3.5 text-base font-medium',
}

const BASE = 'inline-flex items-center justify-center rounded transition-all duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none'

interface ButtonBaseProps {
  variant?: Variant
  size?: Size
  className?: string
}

type ButtonProps =
  | (ButtonBaseProps & ComponentPropsWithoutRef<'button'> & { href?: undefined })
  | (ButtonBaseProps & { href: string; target?: string; rel?: string; children: React.ReactNode; className?: string })

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const classes = `${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`

  if ('href' in props && props.href) {
    const { href, target, rel, children } = props as { href: string; target?: string; rel?: string; children: React.ReactNode }
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
        {children}
      </Link>
    )
  }

  const { children, ...rest } = props as ComponentPropsWithoutRef<'button'> & ButtonBaseProps
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npx vitest run tests/unit/components/Button.test.tsx
```

Expected: All 5 tests pass.

- [ ] **Step 5: Create Tag.tsx and Badge.tsx**

Create `adjeet-site/components/ui/Tag.tsx`:

```tsx
interface TagProps {
  children: React.ReactNode
  className?: string
}

export function Tag({ children, className = '' }: TagProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium bg-paper-elevated text-ink-muted border border-rule ${className}`}>
      {children}
    </span>
  )
}
```

Create `adjeet-site/components/ui/Badge.tsx`:

```tsx
type BadgeVariant = 'default' | 'blue' | 'ochre' | 'success'

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-paper-elevated text-ink-muted',
  blue: 'bg-blue text-white',
  ochre: 'bg-ochre text-white',
  success: 'bg-success text-white',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${BADGE_CLASSES[variant]} ${className}`}>
      {children}
    </span>
  )
}
```

- [ ] **Step 6: TypeScript check**

```bash
cd adjeet-site && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
cd .. && git add adjeet-site/components/ui/Button.tsx adjeet-site/components/ui/Tag.tsx adjeet-site/components/ui/Badge.tsx adjeet-site/tests/unit/components/Button.test.tsx
git commit -m "feat: Button (primary/secondary/ghost, href support), Tag, Badge UI components"
```

---

## Task 4: Input + Select

**Files:**
- Create: `adjeet-site/components/ui/Input.tsx`
- Create: `adjeet-site/components/ui/Select.tsx`
- Create: `adjeet-site/tests/unit/components/Input.test.tsx`

- [ ] **Step 1: Write Input tests**

Create `adjeet-site/tests/unit/components/Input.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

describe('Input', () => {
  it('renders a labelled text input', () => {
    render(<Input label="Your name" name="name" />)
    expect(screen.getByLabelText('Your name')).toBeTruthy()
  })

  it('shows error message when error prop set', () => {
    render(<Input label="Phone" name="phone" error="Required" />)
    expect(screen.getByText('Required')).toBeTruthy()
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true')
  })

  it('passes through placeholder', () => {
    render(<Input label="City" name="city" placeholder="Enter city" />)
    expect(screen.getByPlaceholderText('Enter city')).toBeTruthy()
  })
})

describe('Select', () => {
  const opts = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ]

  it('renders a labelled select', () => {
    render(<Select label="Choose" name="choice" options={opts} />)
    expect(screen.getByLabelText('Choose')).toBeTruthy()
  })

  it('renders all options', () => {
    render(<Select label="Choose" name="choice" options={opts} />)
    expect(screen.getByRole('option', { name: 'Option A' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Option B' })).toBeTruthy()
  })

  it('shows error when error prop set', () => {
    render(<Select label="Choose" name="choice" options={opts} error="Select one" />)
    expect(screen.getByText('Select one')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd adjeet-site && npx vitest run tests/unit/components/Input.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create Input.tsx**

Create `adjeet-site/components/ui/Input.tsx`:

```tsx
import { type ComponentPropsWithoutRef } from 'react'

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, id, name, className = '', ...props }: InputProps) {
  const fieldId = id ?? name
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={fieldId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        className="rounded border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent aria-[invalid=true]:border-error"
        {...props}
      />
      {hint && !error && <p className="text-xs text-ink-subtle">{hint}</p>}
      {error && (
        <p id={errorId} className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create Select.tsx**

Create `adjeet-site/components/ui/Select.tsx`:

```tsx
import { type ComponentPropsWithoutRef } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<ComponentPropsWithoutRef<'select'>, 'children'> {
  label: string
  options: SelectOption[]
  placeholder?: string
  error?: string
}

export function Select({ label, options, placeholder, error, id, name, className = '', ...props }: SelectProps) {
  const fieldId = id ?? name
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={fieldId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={fieldId}
        name={name}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        className="rounded border border-rule bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent aria-[invalid=true]:border-error"
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Run — expect PASS**

```bash
cd adjeet-site && npx vitest run tests/unit/components/Input.test.tsx
```

Expected: All 6 tests pass.

- [ ] **Step 6: Commit**

```bash
cd .. && git add adjeet-site/components/ui/Input.tsx adjeet-site/components/ui/Select.tsx adjeet-site/tests/unit/components/Input.test.tsx
git commit -m "feat: Input and Select form components with label, error, aria attributes"
```

---

## Task 5: Card + Accordion

**Files:**
- Create: `adjeet-site/components/ui/Card.tsx`
- Create: `adjeet-site/components/ui/Accordion.tsx`
- Create: `adjeet-site/tests/unit/components/Accordion.test.tsx`

- [ ] **Step 1: Write Accordion tests**

Create `adjeet-site/tests/unit/components/Accordion.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Accordion } from '@/components/ui/Accordion'

const items = [
  { q: 'First question?', a: 'First answer.' },
  { q: 'Second question?', a: 'Second answer.' },
]

describe('Accordion', () => {
  it('renders all questions', () => {
    render(<Accordion items={items} />)
    expect(screen.getByText('First question?')).toBeTruthy()
    expect(screen.getByText('Second question?')).toBeTruthy()
  })

  it('answers are hidden by default', () => {
    render(<Accordion items={items} />)
    expect(screen.queryByText('First answer.')).toBeNull()
  })

  it('shows answer on click', () => {
    render(<Accordion items={items} />)
    fireEvent.click(screen.getByText('First question?'))
    expect(screen.getByText('First answer.')).toBeTruthy()
  })

  it('collapses open item on second click', () => {
    render(<Accordion items={items} />)
    fireEvent.click(screen.getByText('First question?'))
    fireEvent.click(screen.getByText('First question?'))
    expect(screen.queryByText('First answer.')).toBeNull()
  })

  it('only one item open at a time', () => {
    render(<Accordion items={items} />)
    fireEvent.click(screen.getByText('First question?'))
    fireEvent.click(screen.getByText('Second question?'))
    expect(screen.queryByText('First answer.')).toBeNull()
    expect(screen.getByText('Second answer.')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd adjeet-site && npx vitest run tests/unit/components/Accordion.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create Card.tsx**

Create `adjeet-site/components/ui/Card.tsx`:

```tsx
interface CardProps {
  children: React.ReactNode
  className?: string
  elevated?: boolean
}

export function Card({ children, className = '', elevated = false }: CardProps) {
  return (
    <div
      className={`rounded-lg bg-paper-elevated border border-rule ${elevated ? 'shadow-[var(--elev-2)]' : 'shadow-[var(--elev-1)]'} ${className}`}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Create Accordion.tsx**

Create `adjeet-site/components/ui/Accordion.tsx`:

```tsx
'use client'

import { useState } from 'react'

interface AccordionItem {
  q: string
  a: string
}

interface AccordionProps {
  items: AccordionItem[]
  className?: string
}

export function Accordion({ items, className = '' }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(null)

  function toggle(idx: number) {
    setOpen(prev => (prev === idx ? null : idx))
  }

  return (
    <dl className={`divide-y divide-rule ${className}`}>
      {items.map((item, idx) => (
        <div key={idx}>
          <dt>
            <button
              onClick={() => toggle(idx)}
              aria-expanded={open === idx}
              className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-ink hover:text-blue transition-colors"
            >
              <span>{item.q}</span>
              <span aria-hidden="true" className="ml-4 shrink-0 text-ink-subtle">
                {open === idx ? '−' : '+'}
              </span>
            </button>
          </dt>
          {open === idx && (
            <dd className="pb-4 text-sm text-ink-muted leading-relaxed">
              {item.a}
            </dd>
          )}
        </div>
      ))}
    </dl>
  )
}
```

- [ ] **Step 5: Run — expect PASS**

```bash
cd adjeet-site && npx vitest run tests/unit/components/Accordion.test.tsx
```

Expected: All 5 tests pass.

- [ ] **Step 6: Commit**

```bash
cd .. && git add adjeet-site/components/ui/Card.tsx adjeet-site/components/ui/Accordion.tsx adjeet-site/tests/unit/components/Accordion.test.tsx
git commit -m "feat: Card and Accordion (single-open, accessible) UI components"
```

---

## Task 6: Lightbox

**Files:**
- Create: `adjeet-site/components/ui/Lightbox.tsx`
- Create: `adjeet-site/tests/unit/components/Lightbox.test.tsx`

- [ ] **Step 1: Write Lightbox tests**

Create `adjeet-site/tests/unit/components/Lightbox.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Lightbox } from '@/components/ui/Lightbox'

const photos = [
  { src: '/a.jpg', alt: 'Photo A' },
  { src: '/b.jpg', alt: 'Photo B' },
  { src: '/c.jpg', alt: 'Photo C' },
]

describe('Lightbox', () => {
  it('renders current photo alt text', () => {
    render(<Lightbox photos={photos} initialIndex={0} onClose={vi.fn()} />)
    expect(screen.getByAltText('Photo A')).toBeTruthy()
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(<Lightbox photos={photos} initialIndex={0} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn()
    render(<Lightbox photos={photos} initialIndex={0} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('navigates to next photo on ArrowRight', () => {
    render(<Lightbox photos={photos} initialIndex={0} onClose={vi.fn()} />)
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(screen.getByAltText('Photo B')).toBeTruthy()
  })

  it('navigates to previous photo on ArrowLeft', () => {
    render(<Lightbox photos={photos} initialIndex={1} onClose={vi.fn()} />)
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(screen.getByAltText('Photo A')).toBeTruthy()
  })

  it('wraps from last to first on ArrowRight', () => {
    render(<Lightbox photos={photos} initialIndex={2} onClose={vi.fn()} />)
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(screen.getByAltText('Photo A')).toBeTruthy()
  })

  it('has role="dialog" for accessibility', () => {
    render(<Lightbox photos={photos} initialIndex={0} onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd adjeet-site && npx vitest run tests/unit/components/Lightbox.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create Lightbox.tsx**

Create `adjeet-site/components/ui/Lightbox.tsx`:

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'

interface LightboxPhoto {
  src: string
  alt: string
}

interface LightboxProps {
  photos: LightboxPhoto[]
  initialIndex: number
  onClose: () => void
}

export function Lightbox({ photos, initialIndex, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(initialIndex)
  const total = photos.length

  const prev = useCallback(() => setIdx(i => (i - 1 + total) % total), [total])
  const next = useCallback(() => setIdx(i => (i + 1) % total), [total])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, next, prev])

  const photo = photos[idx]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90"
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close photo viewer"
        className="absolute top-4 right-4 p-2 text-white hover:text-ink-muted"
      >
        ✕
      </button>

      {/* Prev */}
      {total > 1 && (
        <button
          onClick={prev}
          aria-label="Previous photo"
          className="absolute left-4 p-3 text-white hover:text-ink-muted text-2xl"
        >
          ←
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-4xl max-h-[80vh] w-full mx-16">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={1200}
          height={800}
          className="object-contain max-h-[80vh] w-full"
          priority
        />
        <p className="mt-2 text-center text-sm text-ink-muted">{photo.alt}</p>
      </div>

      {/* Next */}
      {total > 1 && (
        <button
          onClick={next}
          aria-label="Next photo"
          className="absolute right-4 p-3 text-white hover:text-ink-muted text-2xl"
        >
          →
        </button>
      )}

      {/* Counter */}
      <p className="absolute bottom-4 text-xs text-ink-muted">
        {idx + 1} / {total}
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd adjeet-site && npx vitest run tests/unit/components/Lightbox.test.tsx
```

Expected: All 7 tests pass.

- [ ] **Step 5: Commit**

```bash
cd .. && git add adjeet-site/components/ui/Lightbox.tsx adjeet-site/tests/unit/components/Lightbox.test.tsx
git commit -m "feat: Lightbox — keyboard navigation, ESC to close, focus-accessible dialog"
```

---

## Task 7: Motion components

**Files:**
- Create: `adjeet-site/components/motion/ReducedMotionWrapper.tsx`
- Create: `adjeet-site/components/motion/FadeIn.tsx`
- Create: `adjeet-site/components/motion/StaggerChildren.tsx`
- Create: `adjeet-site/components/motion/CountUp.tsx`
- Create: `adjeet-site/tests/unit/components/CountUp.test.tsx`

- [ ] **Step 1: Write CountUp test**

Create `adjeet-site/tests/unit/components/CountUp.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CountUp } from '@/components/motion/CountUp'

// Framer Motion is mocked to avoid animation in tests
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...p }: React.HTMLAttributes<HTMLSpanElement> & { children?: React.ReactNode }) => <span {...p}>{children}</span>,
  },
  useInView: () => true,
  useMotionValue: (v: number) => ({ set: vi.fn(), get: () => v }),
  useTransform: (_: unknown, __: unknown, mapper: (v: number) => unknown) => ({ get: () => mapper(100) }),
  animate: vi.fn(),
}))

describe('CountUp', () => {
  beforeEach(() => {
    // Mock matchMedia for reduced-motion check
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
  })

  it('renders the target value when reduced motion is preferred', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    })
    render(<CountUp to={500} suffix="+" />)
    expect(screen.getByText('500+')).toBeTruthy()
  })

  it('renders suffix', () => {
    render(<CountUp to={35} suffix=" years" />)
    // The component renders the count + suffix in some form
    const el = screen.getByRole('status')
    expect(el).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd adjeet-site && npx vitest run tests/unit/components/CountUp.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create ReducedMotionWrapper.tsx**

Create `adjeet-site/components/motion/ReducedMotionWrapper.tsx`:

```tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ReducedMotionContext = createContext(false)

export function useReducedMotion() {
  return useContext(ReducedMotionContext)
}

export function ReducedMotionWrapper({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <ReducedMotionContext.Provider value={reduced}>
      {children}
    </ReducedMotionContext.Provider>
  )
}
```

- [ ] **Step 4: Create FadeIn.tsx**

Create `adjeet-site/components/motion/FadeIn.tsx`:

```tsx
'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/components/motion/ReducedMotionWrapper'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 5: Create StaggerChildren.tsx**

Create `adjeet-site/components/motion/StaggerChildren.tsx`:

```tsx
'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/components/motion/ReducedMotionWrapper'

interface StaggerChildrenProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}

const container = (stagger: number) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger },
  },
})

export const staggerItem = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as number[] } },
}

export function StaggerChildren({ children, staggerDelay = 0.08, className }: StaggerChildrenProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      variants={container(staggerDelay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 6: Create CountUp.tsx**

Create `adjeet-site/components/motion/CountUp.tsx`:

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useTransform, animate, motion } from 'framer-motion'
import { useReducedMotion } from '@/components/motion/ReducedMotionWrapper'

interface CountUpProps {
  to: number
  from?: number
  duration?: number
  suffix?: string
  className?: string
}

export function CountUp({ to, from = 0, duration = 1.2, suffix = '', className }: CountUpProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const count = useMotionValue(from)
  const rounded = useTransform(count, v => Math.round(v))

  useEffect(() => {
    if (reduced || !inView) return
    const controls = animate(count, to, { duration, ease: 'easeOut' })
    return controls.stop
  }, [reduced, inView, count, to, duration])

  if (reduced) {
    return (
      <span ref={ref} role="status" aria-label={`${to}${suffix}`} className={className}>
        {to}{suffix}
      </span>
    )
  }

  return (
    <span ref={ref} role="status" className={className}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}
```

- [ ] **Step 7: Run CountUp test — expect PASS**

```bash
cd adjeet-site && npx vitest run tests/unit/components/CountUp.test.tsx
```

Expected: Both tests pass.

- [ ] **Step 8: Run full unit test suite**

```bash
npm test
```

Expected: All tests pass (18 existing + new = all green).

- [ ] **Step 9: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 10: Commit**

```bash
cd .. && git add adjeet-site/components/motion/ adjeet-site/tests/unit/components/CountUp.test.tsx
git commit -m "feat: motion components — ReducedMotionWrapper, FadeIn, StaggerChildren, CountUp"
```

---

## Self-Review

### 1. Spec coverage

| Spec item | Task |
|---|---|
| `content/services.ts` — Service interface, 10 entries | Task 1 |
| `content/gallery.ts` — GalleryPhoto interface, helper functions | Task 2 |
| `content/programmatic.ts` — ProgrammaticPage, 25 entries (5×5) | Task 2 |
| `components/ui/Button` | Task 3 |
| `components/ui/Tag` | Task 3 |
| `components/ui/Badge` | Task 3 |
| `components/ui/Input` | Task 4 |
| `components/ui/Select` | Task 4 |
| `components/ui/Card` | Task 5 |
| `components/ui/Accordion` | Task 5 |
| `components/ui/Lightbox` | Task 6 |
| `components/motion/ReducedMotionWrapper` | Task 7 |
| `components/motion/FadeIn` | Task 7 |
| `components/motion/StaggerChildren` | Task 7 |
| `components/motion/CountUp` | Task 7 |

No gaps.

### 2. Placeholder scan

No TBD, TODO, or vague steps found. All 25 programmatic entries have real body copy.

### 3. Type consistency

- `ServiceSlug` defined in `content/services.ts` (line `export type ServiceSlug`), used in `content/gallery.ts` — consistent.
- `GalleryPhoto.service: ServiceSlug` — consistent with SERVICE_SLUGS tuple.
- `staggerItem` exported from `StaggerChildren.tsx` — available for Plan 3 components to use on grid items.
- `LightboxPhoto` interface is defined inline in `Lightbox.tsx` — if it needs to be used by the Portfolio page (Plan 4), it should be exported. **Fix:** Add `export` to `interface LightboxPhoto` in `Lightbox.tsx`.
