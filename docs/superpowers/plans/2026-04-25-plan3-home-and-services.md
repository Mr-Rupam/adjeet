# Plan 3: Home Page + Services Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Assemble the AD-JEET public-facing Home page (5 sections), Services overview, and Service detail template (×10 slugs) using the content data, UI components, and motion system already built in Plan 2.

**Architecture:** Next.js 16 App Router with a `(marketing)` route group colocating all public pages; sections are discrete RSC/client components in `components/sections/`; `lib/seo.ts` provides JSON-LD builders and metadata helpers used by each page.

**Tech Stack:** Next.js 16.2.4 (App Router, RSC, async params), Tailwind CSS v4, Framer Motion 11, Vitest + @testing-library/react (unit), Playwright (E2E).

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `adjeet-site/lib/seo.ts` | Create | JSON-LD builders + generateMetadata helpers |
| `adjeet-site/app/(marketing)/layout.tsx` | Create | LocalBusiness JSON-LD, nested layout |
| `adjeet-site/app/page.tsx` | Delete | Replace stub with marketing route group page |
| `adjeet-site/app/(marketing)/page.tsx` | Create | Home page — composes 5 sections |
| `adjeet-site/app/(marketing)/services/page.tsx` | Create | /services overview |
| `adjeet-site/app/(marketing)/services/[slug]/page.tsx` | Create | /services/[slug] detail |
| `adjeet-site/app/(marketing)/services/[slug]/loading.tsx` | Create | Skeleton for service detail |
| `adjeet-site/components/icons/ServiceIcon.tsx` | Create | icon string → inline SVG map |
| `adjeet-site/components/sections/ServicesGrid.tsx` | Create | ServiceTile + ServicesGrid |
| `adjeet-site/components/sections/Hero.tsx` | Create | Kinetic headline, dual CTA, scroll indicator |
| `adjeet-site/components/sections/ProofBlock.tsx` | Create | 4 CountUp stats |
| `adjeet-site/components/sections/GalleryTeaser.tsx` | Create | 6 featured photos → Lightbox |
| `adjeet-site/components/sections/GalleryStrip.tsx` | Create | Horizontal photo strip for service detail |
| `adjeet-site/components/sections/TrustBand.tsx` | Create | Category tag strip |
| `adjeet-site/tests/unit/lib/seo.test.ts` | Create | Unit tests for seo.ts helpers |
| `adjeet-site/tests/unit/components/ServiceIcon.test.tsx` | Create | Unit tests for ServiceIcon |
| `adjeet-site/tests/unit/components/ServicesGrid.test.tsx` | Create | Unit tests for ServicesGrid |
| `adjeet-site/tests/e2e/home.spec.ts` | Create | E2E: Home page |
| `adjeet-site/tests/e2e/services.spec.ts` | Create | E2E: /services + /services/[slug] |

---

## Context for implementers

**Working directory:** `adjeet-site/` inside the monorepo root `AD_JEET/`.

**Run tests with:** `npx vitest run` (unit) from `adjeet-site/`.

**Run E2E with:** `npx playwright test` from `adjeet-site/` — requires `npm run dev` running on port 3000 (Playwright starts it automatically via `webServer` config).

**Path alias:** `@/` resolves to `adjeet-site/` root (set in `vitest.config.ts` and `tsconfig.json`).

**Tailwind tokens (valid utility classes):** `bg-paper`, `bg-paper-elevated`, `text-ink`, `text-ink-muted`, `text-ink-subtle`, `border-rule`, `bg-blue`, `text-blue`, `text-ochre`, `max-w-content`. CSS variables not in `@theme` need arbitrary syntax: `py-[var(--section-py)]`, `text-[var(--text-display-1)]`, `text-[var(--text-display-2)]`, `font-[var(--font-fraunces)]`.

**Next.js 16 params:** `params` in page/layout components is `Promise<{ slug: string }>` — always `await` it.

**Existing exports to use:**
- `defaultWhatsAppUrl({ service?, city? }): string` from `@/lib/whatsapp`
- `getFeaturedPhotos()`, `getPhotosByService(slug)` from `@/content/gallery`
- `services`, `SERVICE_SLUGS`, `getServiceBySlug(slug)`, `type ServiceSlug` from `@/content/services`
- `CountUp` from `@/components/motion/CountUp`
- `FadeIn` from `@/components/motion/FadeIn`
- `StaggerChildren`, `staggerItem` from `@/components/motion/StaggerChildren`
- `Accordion` from `@/components/ui/Accordion`
- `Button` from `@/components/ui/Button`
- `Lightbox`, `type LightboxPhoto` from `@/components/ui/Lightbox`

**Framer motion mock pattern** (copy from existing tests — required for any component that imports framer-motion):
```ts
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...p}>{children}</div>,
    span: ({ children, ...p }: React.HTMLAttributes<HTMLSpanElement> & { children?: React.ReactNode }) => <span {...p}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useInView: () => true,
  animate: vi.fn(),
}))
```

**matchMedia mock pattern** (required for any component that uses `useReducedMotion`):
```ts
beforeEach(() => {
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
```

---

## Task 1: lib/seo.ts + Marketing route group layout

**Files:**
- Create: `adjeet-site/lib/seo.ts`
- Create: `adjeet-site/app/(marketing)/layout.tsx`
- Delete: `adjeet-site/app/page.tsx`
- Test: `adjeet-site/tests/unit/lib/seo.test.ts`

- [ ] **Step 1: Write the failing test**

Create `adjeet-site/tests/unit/lib/seo.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildFaqJsonLd, buildBreadcrumbJsonLd, buildServiceJsonLd, siteConfig } from '@/lib/seo'
import { services } from '@/content/services'

describe('buildFaqJsonLd', () => {
  it('returns FAQPage schema', () => {
    const faqs = [{ q: 'Question?', a: 'Answer.' }]
    const result = buildFaqJsonLd(faqs)
    expect(result['@type']).toBe('FAQPage')
    expect(result.mainEntity).toHaveLength(1)
    expect(result.mainEntity[0]['@type']).toBe('Question')
    expect(result.mainEntity[0].name).toBe('Question?')
    expect(result.mainEntity[0].acceptedAnswer.text).toBe('Answer.')
  })

  it('handles multiple FAQs', () => {
    const faqs = [
      { q: 'Q1?', a: 'A1.' },
      { q: 'Q2?', a: 'A2.' },
    ]
    const result = buildFaqJsonLd(faqs)
    expect(result.mainEntity).toHaveLength(2)
  })
})

describe('buildBreadcrumbJsonLd', () => {
  it('returns BreadcrumbList with correct positions', () => {
    const items = [
      { name: 'Home', url: '/' },
      { name: 'Services', url: '/services' },
      { name: 'Glow Sign Boards', url: '/services/glow-sign-boards' },
    ]
    const result = buildBreadcrumbJsonLd(items)
    expect(result['@type']).toBe('BreadcrumbList')
    expect(result.itemListElement).toHaveLength(3)
    expect(result.itemListElement[0].position).toBe(1)
    expect(result.itemListElement[1].position).toBe(2)
    expect(result.itemListElement[2].position).toBe(3)
    expect(result.itemListElement[2].name).toBe('Glow Sign Boards')
  })

  it('prepends siteConfig.url to each item url', () => {
    const items = [{ name: 'Home', url: '/' }]
    const result = buildBreadcrumbJsonLd(items)
    expect(result.itemListElement[0].item).toBe(siteConfig.url + '/')
  })
})

describe('buildServiceJsonLd', () => {
  it('returns Service schema with name and areaServed', () => {
    const service = services[0]
    const result = buildServiceJsonLd(service)
    expect(result['@type']).toBe('Service')
    expect(result.name).toBe(service.name)
    expect(Array.isArray(result.areaServed)).toBe(true)
    expect(result.areaServed).toContain('Siliguri')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd adjeet-site && npx vitest run tests/unit/lib/seo.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/seo'`

- [ ] **Step 3: Create lib/seo.ts**

Create `adjeet-site/lib/seo.ts`:

```ts
import type { Metadata } from 'next'
import type { Service } from '@/content/services'

export const siteConfig = {
  name: 'AD-JEET',
  url: 'https://adjeet.in',
  ogImage: '/images/og-default.jpg',
  description: "North Bengal's most trusted signage and outdoor advertising partner since 1990.",
}

export function generateServiceMetadata(service: Service): Metadata {
  return {
    title: `${service.name} in North Bengal`,
    description: `${service.tagline}. Serving Siliguri, Jalpaiguri, Cooch Behar, Darjeeling, Malda.`,
    alternates: { canonical: `/services/${service.slug}` },
  }
}

export function buildLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: '+919832011524',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Platinum Square',
      addressLocality: 'Siliguri',
      addressRegion: 'West Bengal',
      postalCode: '734001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 26.7271,
      longitude: 88.3953,
    },
    areaServed: ['Siliguri', 'Jalpaiguri', 'Cooch Behar', 'Darjeeling', 'Malda'],
  }
}

export function buildServiceJsonLd(service: Service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: { '@type': 'LocalBusiness', name: siteConfig.name },
    areaServed: ['Siliguri', 'Jalpaiguri', 'Cooch Behar', 'Darjeeling', 'Malda'],
    serviceType: service.name,
  }
}

export function buildFaqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: siteConfig.url + item.url,
    })),
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd adjeet-site && npx vitest run tests/unit/lib/seo.test.ts
```

Expected: PASS — all 5 tests green.

- [ ] **Step 5: Create app/(marketing)/layout.tsx**

Create `adjeet-site/app/(marketing)/layout.tsx`:

```tsx
import { buildLocalBusinessJsonLd } from '@/lib/seo'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const schema = buildLocalBusinessJsonLd()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  )
}
```

- [ ] **Step 6: Delete the old page stub**

```bash
rm adjeet-site/app/page.tsx
```

- [ ] **Step 7: Create a temporary Home page placeholder**

Create `adjeet-site/app/(marketing)/page.tsx` (full implementation in Task 8; this placeholder ensures the build doesn't break):

```tsx
export default function HomePage() {
  return <div />
}
```

- [ ] **Step 8: Verify the build compiles**

```bash
cd adjeet-site && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
cd adjeet-site && git add lib/seo.ts app/\(marketing\)/layout.tsx app/\(marketing\)/page.tsx tests/unit/lib/seo.test.ts && git rm app/page.tsx && git commit -m "feat: lib/seo.ts helpers + (marketing) route group"
```

---

## Task 2: ServiceIcon component

**Files:**
- Create: `adjeet-site/components/icons/ServiceIcon.tsx`
- Test: `adjeet-site/tests/unit/components/ServiceIcon.test.tsx`

The icon strings come from `service.icon` in `content/services.ts`: `lightbulb`, `panels`, `print`, `truck`, `paint-roller`, `flag-pole`, `store`, `sparkles`, `eye`, `display`.

- [ ] **Step 1: Write the failing test**

Create `adjeet-site/tests/unit/components/ServiceIcon.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ServiceIcon } from '@/components/icons/ServiceIcon'

const ALL_ICONS = [
  'lightbulb',
  'panels',
  'print',
  'truck',
  'paint-roller',
  'flag-pole',
  'store',
  'sparkles',
  'eye',
  'display',
]

describe('ServiceIcon', () => {
  it.each(ALL_ICONS)('renders an svg for icon "%s"', (icon) => {
    const { container } = render(<ServiceIcon icon={icon} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('returns null for an unknown icon string', () => {
    const { container } = render(<ServiceIcon icon="unknown-xyz" />)
    expect(container.firstChild).toBeNull()
  })

  it('applies the className to the wrapper span', () => {
    const { container } = render(<ServiceIcon icon="lightbulb" className="text-blue" />)
    const span = container.querySelector('span')
    expect(span?.className).toContain('text-blue')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd adjeet-site && npx vitest run tests/unit/components/ServiceIcon.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/icons/ServiceIcon'`

- [ ] **Step 3: Create ServiceIcon.tsx**

Create `adjeet-site/components/icons/ServiceIcon.tsx`:

```tsx
import React from 'react'

interface ServiceIconProps {
  icon: string
  size?: number
  className?: string
}

const ICONS: Record<string, React.ReactElement> = {
  lightbulb: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.5-1.5 4.5-3 6H9c-1.5-1.5-3-3.5-3-6a6 6 0 0 1 6-6z" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  ),
  panels: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="2" y1="9" x2="22" y2="9" />
      <circle cx="6" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="9" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  ),
  print: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l3 6H3L6 3z" />
      <path d="M3 9v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9" />
      <line x1="8" y1="14" x2="16" y2="14" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="7" width="15" height="11" rx="1" />
      <path d="M16 12h4l2 3v3h-6V12z" />
      <circle cx="5.5" cy="18.5" r="1.5" />
      <circle cx="18.5" cy="18.5" r="1.5" />
    </svg>
  ),
  'paint-roller': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="14" height="6" rx="1" />
      <path d="M16 6h3a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H2" />
      <line x1="9" y1="9" x2="9" y2="14" />
      <rect x="6" y="14" width="6" height="7" rx="1" />
    </svg>
  ),
  'flag-pole': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M12 4l8 4-8 4V4z" fill="currentColor" stroke="none" opacity="0.3" />
      <path d="M12 4l8 4-8 4" />
    </svg>
  ),
  store: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l1-5h16l1 5" />
      <path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9" />
      <path d="M3 9h18" />
      <rect x="9" y="13" width="6" height="7" />
    </svg>
  ),
  sparkles: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      <line x1="3" y1="3" x2="21" y2="21" strokeWidth={1.5} />
    </svg>
  ),
  display: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="18" rx="1" />
      <line x1="9" y1="6" x2="15" y2="6" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="12" x2="12" y2="12" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="9" y1="22" x2="15" y2="22" />
    </svg>
  ),
}

export function ServiceIcon({ icon, size = 48, className = '' }: ServiceIconProps) {
  const svg = ICONS[icon]
  if (!svg) return null
  return (
    <span
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      aria-hidden="true"
    >
      {React.cloneElement(svg, { width: size, height: size })}
    </span>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd adjeet-site && npx vitest run tests/unit/components/ServiceIcon.test.tsx
```

Expected: PASS — all 12 tests green.

- [ ] **Step 5: Commit**

```bash
cd adjeet-site && git add components/icons/ServiceIcon.tsx tests/unit/components/ServiceIcon.test.tsx && git commit -m "feat: ServiceIcon — inline SVG map for all 10 service icons"
```

---

## Task 3: ServicesGrid + ServiceTile

**Files:**
- Create: `adjeet-site/components/sections/ServicesGrid.tsx`
- Test: `adjeet-site/tests/unit/components/ServicesGrid.test.tsx`

`ServicesGrid` renders a 2→3→5 column grid of service tiles. Each tile links to `/services/[slug]`. With `expanded={true}`, tiles show the service tagline. Both `ServicesGrid` (home, overview) and service detail related-services band use `ServiceTile`.

- [ ] **Step 1: Write the failing test**

Create `adjeet-site/tests/unit/components/ServicesGrid.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ServicesGrid } from '@/components/sections/ServicesGrid'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) =>
      <div {...p}>{children}</div>,
    span: ({ children, ...p }: React.HTMLAttributes<HTMLSpanElement> & { children?: React.ReactNode }) =>
      <span {...p}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useInView: () => true,
  animate: vi.fn(),
}))

beforeEach(() => {
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

describe('ServicesGrid', () => {
  it('renders 10 service tiles', () => {
    render(<ServicesGrid />)
    const links = screen.getAllByRole('link')
    // 10 service tile links
    expect(links.filter(l => l.getAttribute('href')?.startsWith('/services/'))).toHaveLength(10)
  })

  it('each tile href points to /services/[slug]', () => {
    render(<ServicesGrid />)
    const links = screen.getAllByRole('link').filter(l =>
      l.getAttribute('href')?.startsWith('/services/')
    )
    links.forEach(link => {
      expect(link.getAttribute('href')).toMatch(/^\/services\/[\w-]+$/)
    })
  })

  it('does not show taglines by default (expanded=false)', () => {
    render(<ServicesGrid />)
    // Tagline of first service: "Illuminate your brand 24/7"
    expect(screen.queryByText('Illuminate your brand 24/7')).toBeNull()
  })

  it('shows taglines when expanded=true', () => {
    render(<ServicesGrid expanded />)
    expect(screen.getByText('Illuminate your brand 24/7')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd adjeet-site && npx vitest run tests/unit/components/ServicesGrid.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/sections/ServicesGrid'`

- [ ] **Step 3: Create ServicesGrid.tsx**

Create `adjeet-site/components/sections/ServicesGrid.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { services } from '@/content/services'
import { ServiceIcon } from '@/components/icons/ServiceIcon'
import { StaggerChildren, staggerItem } from '@/components/motion/StaggerChildren'
import { FadeIn } from '@/components/motion/FadeIn'

interface ServiceTileProps {
  slug: string
  name: string
  tagline: string
  icon: string
  expanded: boolean
}

export function ServiceTile({ slug, name, tagline, icon, expanded }: ServiceTileProps) {
  return (
    <motion.div variants={staggerItem}>
      <Link
        href={`/services/${slug}`}
        className="group flex flex-col items-center gap-3 rounded-lg p-5 border border-rule hover:border-blue hover:bg-paper-elevated transition-all text-center"
      >
        <ServiceIcon icon={icon} size={48} className="text-blue" />
        <span className="text-sm font-medium text-ink group-hover:text-blue transition-colors leading-snug">
          {name}
        </span>
        {expanded && (
          <span className="text-xs text-ink-muted leading-snug">{tagline}</span>
        )}
        <span aria-hidden="true" className="text-xs text-ink-subtle group-hover:text-blue transition-colors">
          →
        </span>
      </Link>
    </motion.div>
  )
}

interface ServicesGridProps {
  expanded?: boolean
  className?: string
}

export function ServicesGrid({ expanded = false, className = '' }: ServicesGridProps) {
  return (
    <section className={`py-[var(--section-py)] ${className}`}>
      <div className="mx-auto max-w-content px-6">
        <FadeIn>
          <h2 className="text-center font-bold text-[var(--text-display-2)] font-[var(--font-fraunces)] text-ink mb-12">
            {expanded ? 'Our Services' : 'What We Do'}
          </h2>
        </FadeIn>
        <StaggerChildren className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map(service => (
            <ServiceTile
              key={service.slug}
              slug={service.slug}
              name={service.name}
              tagline={service.tagline}
              icon={service.icon}
              expanded={expanded}
            />
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd adjeet-site && npx vitest run tests/unit/components/ServicesGrid.test.tsx
```

Expected: PASS — all 4 tests green.

- [ ] **Step 5: Commit**

```bash
cd adjeet-site && git add components/sections/ServicesGrid.tsx tests/unit/components/ServicesGrid.test.tsx && git commit -m "feat: ServicesGrid + ServiceTile — service icon tiles with expand mode"
```

---

## Task 4: Hero section

**Files:**
- Create: `adjeet-site/components/sections/Hero.tsx`

Hero is full-viewport with kinetic word-stagger headline, dual CTA, and a scroll indicator that fades out after 300px scroll. No unit test — animations are not meaningful in jsdom; covered by E2E.

- [ ] **Step 1: Create Hero.tsx**

Create `adjeet-site/components/sections/Hero.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { useReducedMotion } from '@/components/motion/ReducedMotionWrapper'

const HEADLINE = "North Bengal's most trusted signage company"
const WORDS = HEADLINE.split(' ')

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const wordVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as number[] } },
}

export function Hero() {
  const reduced = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)
  const waUrl = defaultWhatsAppUrl()

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 300)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="relative flex items-center min-h-svh bg-ink overflow-hidden">
      {/* Placeholder background — swap for next/image when /images/hero/bg.jpg is ready */}
      <div className="absolute inset-0 bg-slate opacity-60" />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink/70" />

      <div className="relative z-10 mx-auto max-w-content px-6 py-32">
        {/* Eyebrow */}
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-6">
          Signage · Outdoor Advertising · North Bengal
        </p>

        {/* Headline */}
        {reduced ? (
          <h1 className="text-[var(--text-display-1)] font-[var(--font-fraunces)] font-bold text-white leading-tight mb-6">
            {HEADLINE}
          </h1>
        ) : (
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="text-[var(--text-display-1)] font-[var(--font-fraunces)] font-bold text-white leading-tight mb-6"
          >
            {WORDS.map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariant}
                className="inline-block mr-[0.25em]"
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>
        )}

        {/* Sub-copy */}
        <p className="text-white/75 text-lg max-w-xl mb-10">
          Serving Siliguri, Jalpaiguri, Cooch Behar, Darjeeling, and Malda since 1990.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded bg-blue text-white font-medium px-7 py-3.5 text-base hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            Our Services
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded border border-white/40 text-white font-medium px-7 py-3.5 text-base hover:bg-white/10 transition-colors active:scale-[0.98]"
          >
            WhatsApp Us
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      {!reduced && !scrolled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <span
            aria-hidden="true"
            className="block text-white/50 text-2xl animate-bounce"
          >
            ↓
          </span>
        </motion.div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd adjeet-site && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd adjeet-site && git add components/sections/Hero.tsx && git commit -m "feat: Hero section — kinetic headline, dual CTA, scroll indicator"
```

---

## Task 5: ProofBlock section

**Files:**
- Create: `adjeet-site/components/sections/ProofBlock.tsx`

4 CountUp stats in a horizontal band. RSC — CountUp is already a client component with its own tests.

- [ ] **Step 1: Create ProofBlock.tsx**

Create `adjeet-site/components/sections/ProofBlock.tsx`:

```tsx
import { CountUp } from '@/components/motion/CountUp'
import { FadeIn } from '@/components/motion/FadeIn'

const STATS = [
  { label: 'Projects', to: 500, suffix: '+' },
  { label: 'Years', to: 10, suffix: '' },
  { label: 'Districts', to: 12, suffix: '' },
  { label: 'Clients', to: 200, suffix: '+' },
] as const

export function ProofBlock() {
  return (
    <section className="bg-paper-elevated border-y border-rule py-16">
      <div className="mx-auto max-w-content px-6">
        <FadeIn>
          <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-ink-subtle mb-12">
            Trusted across North Bengal
          </h2>
        </FadeIn>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map(stat => (
            <div key={stat.label}>
              <dt className="order-2 mt-2 text-sm text-ink-muted">{stat.label}</dt>
              <dd className="order-1 text-4xl font-bold font-[var(--font-fraunces)] text-ink">
                <CountUp to={stat.to} suffix={stat.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd adjeet-site && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd adjeet-site && git add components/sections/ProofBlock.tsx && git commit -m "feat: ProofBlock — 4 CountUp stats band"
```

---

## Task 6: GalleryTeaser section

**Files:**
- Create: `adjeet-site/components/sections/GalleryTeaser.tsx`

6 featured photos in a 3-col grid. Client component — manages Lightbox open/index state. Photos use `next/image` with local paths (images show as broken until real files added to `public/images/gallery/`).

- [ ] **Step 1: Create GalleryTeaser.tsx**

Create `adjeet-site/components/sections/GalleryTeaser.tsx`:

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getFeaturedPhotos } from '@/content/gallery'
import { Lightbox, type LightboxPhoto } from '@/components/ui/Lightbox'
import { FadeIn } from '@/components/motion/FadeIn'

export function GalleryTeaser() {
  const featured = getFeaturedPhotos().slice(0, 6)
  const lightboxPhotos: LightboxPhoto[] = featured.map(p => ({ src: p.src, alt: p.alt }))
  const [isOpen, setIsOpen] = useState(false)
  const [initialIndex, setInitialIndex] = useState(0)

  function openAt(idx: number) {
    setInitialIndex(idx)
    setIsOpen(true)
  }

  return (
    <section className="py-[var(--section-py)]">
      <div className="mx-auto max-w-content px-6">
        <FadeIn>
          <h2 className="text-center font-bold text-[var(--text-display-2)] font-[var(--font-fraunces)] text-ink mb-12">
            Our Work
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((photo, idx) => (
            <button
              key={photo.id}
              onClick={() => openAt(idx)}
              className="relative aspect-[4/3] rounded-lg overflow-hidden bg-rule focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2 group"
              aria-label={`View photo: ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </button>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/gallery" className="text-sm text-blue hover:underline">
            View all work →
          </Link>
        </div>

        {isOpen && (
          <Lightbox
            photos={lightboxPhotos}
            initialIndex={initialIndex}
            onClose={() => setIsOpen(false)}
          />
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd adjeet-site && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd adjeet-site && git add components/sections/GalleryTeaser.tsx && git commit -m "feat: GalleryTeaser — 6 featured photos with Lightbox"
```

---

## Task 7: TrustBand + GalleryStrip sections

**Files:**
- Create: `adjeet-site/components/sections/TrustBand.tsx`
- Create: `adjeet-site/components/sections/GalleryStrip.tsx`

TrustBand is a static RSC category tag strip. GalleryStrip is a client component for the horizontal scroll photo strip on service detail pages.

- [ ] **Step 1: Create TrustBand.tsx**

Create `adjeet-site/components/sections/TrustBand.tsx`:

```tsx
import { FadeIn } from '@/components/motion/FadeIn'

const TAGS = ['Illuminated', 'Structural', 'Print', 'Branding', 'Events']

export function TrustBand() {
  return (
    <section className="bg-paper-elevated border-t border-rule py-10">
      <div className="mx-auto max-w-content px-6">
        <FadeIn>
          <p className="text-center text-sm text-ink-subtle tracking-wide">
            {TAGS.map((tag, i) => (
              <span key={tag}>
                {tag}
                {i < TAGS.length - 1 && (
                  <span className="mx-3 text-rule" aria-hidden="true">·</span>
                )}
              </span>
            ))}
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create GalleryStrip.tsx**

Create `adjeet-site/components/sections/GalleryStrip.tsx`:

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Lightbox, type LightboxPhoto } from '@/components/ui/Lightbox'
import type { GalleryPhoto } from '@/content/gallery'

interface GalleryStripProps {
  photos: GalleryPhoto[]
}

export function GalleryStrip({ photos }: GalleryStripProps) {
  const lightboxPhotos: LightboxPhoto[] = photos.map(p => ({ src: p.src, alt: p.alt }))
  const [isOpen, setIsOpen] = useState(false)
  const [initialIndex, setInitialIndex] = useState(0)

  function openAt(idx: number) {
    setInitialIndex(idx)
    setIsOpen(true)
  }

  return (
    <section className="py-12 border-t border-rule">
      <div className="mx-auto max-w-content px-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-ink-subtle mb-6">
          Project Gallery
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
          {photos.map((photo, idx) => (
            <button
              key={photo.id}
              onClick={() => openAt(idx)}
              className="relative shrink-0 w-64 aspect-[4/3] rounded-lg overflow-hidden bg-rule snap-start focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2 group"
              aria-label={`View photo: ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="256px"
              />
            </button>
          ))}
        </div>
        {isOpen && (
          <Lightbox
            photos={lightboxPhotos}
            initialIndex={initialIndex}
            onClose={() => setIsOpen(false)}
          />
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd adjeet-site && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd adjeet-site && git add components/sections/TrustBand.tsx components/sections/GalleryStrip.tsx && git commit -m "feat: TrustBand + GalleryStrip section components"
```

---

## Task 8: Home page

**Files:**
- Modify: `adjeet-site/app/(marketing)/page.tsx` (replace placeholder from Task 1)

Compose all 5 sections. The root layout's `<main id="main-content">` already wraps `{children}`, so no extra `<main>` needed here.

- [ ] **Step 1: Replace the placeholder Home page**

Overwrite `adjeet-site/app/(marketing)/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { Hero } from '@/components/sections/Hero'
import { ServicesGrid } from '@/components/sections/ServicesGrid'
import { ProofBlock } from '@/components/sections/ProofBlock'
import { GalleryTeaser } from '@/components/sections/GalleryTeaser'
import { TrustBand } from '@/components/sections/TrustBand'

export const metadata: Metadata = {
  title: 'AD-JEET — North Bengal Signage & Outdoor Advertising',
  description:
    "North Bengal's most trusted signage company. Glow signs, ACP/LED, flex printing, vehicle branding, F-pole installation across Siliguri, Jalpaiguri, Cooch Behar, Darjeeling, Malda.",
  alternates: { canonical: 'https://adjeet.in' },
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <ProofBlock />
      <GalleryTeaser />
      <TrustBand />
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd adjeet-site && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Start the dev server and manually verify the Home page**

```bash
cd adjeet-site && npm run dev
```

Open `http://localhost:3000` in a browser. Verify:
- Hero section renders with headline text visible
- ServicesGrid shows 10 tiles
- ProofBlock shows 4 stat numbers
- GalleryTeaser shows 6 photo placeholder boxes
- TrustBand shows the 5 category tags
- No console errors

Stop the dev server (`Ctrl+C`).

- [ ] **Step 4: Commit**

```bash
cd adjeet-site && git add app/\(marketing\)/page.tsx && git commit -m "feat: Home page — composes Hero, ServicesGrid, ProofBlock, GalleryTeaser, TrustBand"
```

---

## Task 9: Services overview page

**Files:**
- Create: `adjeet-site/app/(marketing)/services/page.tsx`

- [ ] **Step 1: Create services/page.tsx**

Create `adjeet-site/app/(marketing)/services/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { ServicesGrid } from '@/components/sections/ServicesGrid'
import { Button } from '@/components/ui/Button'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Signage & Outdoor Advertising Services',
  description:
    'From glow sign boards and ACP LED signage to flex printing, vehicle branding, and events — AD-JEET delivers quality signage across North Bengal.',
  alternates: { canonical: 'https://adjeet.in/services' },
}

export default function ServicesPage() {
  const waUrl = defaultWhatsAppUrl()
  return (
    <>
      {/* Compact hero */}
      <section className="flex items-end min-h-[40vh] bg-ink py-16">
        <div className="mx-auto max-w-content px-6">
          <h1 className="text-[var(--text-display-2)] font-[var(--font-fraunces)] font-bold text-white mb-4">
            Our Services
          </h1>
          <p className="text-white/75 max-w-xl">
            Glow signs · ACP/LED · Flex printing · Vehicle branding · Wall painting · F-pole · In-shop branding · Events · One-way vision · Product display
          </p>
        </div>
      </section>

      {/* Full grid with taglines */}
      <ServicesGrid expanded />

      {/* CTA strip */}
      <section className="py-16 border-t border-rule">
        <div className="mx-auto max-w-content px-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/#contact" size="lg">Get a Quote</Button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded border border-ink text-ink font-medium px-7 py-3.5 text-base hover:bg-paper-elevated transition-colors active:scale-[0.98]"
          >
            WhatsApp Us
          </a>
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd adjeet-site && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd adjeet-site && git add 'app/(marketing)/services/page.tsx' && git commit -m "feat: /services overview page"
```

---

## Task 10: Service detail page + loading skeleton

**Files:**
- Create: `adjeet-site/app/(marketing)/services/[slug]/page.tsx`
- Create: `adjeet-site/app/(marketing)/services/[slug]/loading.tsx`

Statically generates 10 pages at build time. Uses `await params` (Next.js 16 requirement).

- [ ] **Step 1: Create loading.tsx (skeleton)**

Create `adjeet-site/app/(marketing)/services/[slug]/loading.tsx`:

```tsx
export default function ServiceDetailLoading() {
  return (
    <div className="animate-pulse">
      <div className="min-h-[40vh] bg-rule" />
      <div className="py-12 border-b border-rule">
        <div className="mx-auto max-w-content px-6 grid sm:grid-cols-3 gap-8">
          {[0, 1, 2].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-rule rounded" />
              <div className="h-4 w-full bg-rule rounded" />
              <div className="h-4 w-3/4 bg-rule rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create [slug]/page.tsx**

Create `adjeet-site/app/(marketing)/services/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { SERVICE_SLUGS, getServiceBySlug, type ServiceSlug } from '@/content/services'
import { getPhotosByService } from '@/content/gallery'
import {
  buildServiceJsonLd,
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
  generateServiceMetadata,
} from '@/lib/seo'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { Accordion } from '@/components/ui/Accordion'
import { ServiceTile } from '@/components/sections/ServicesGrid'
import { GalleryStrip } from '@/components/sections/GalleryStrip'

type Params = { slug: string }

export function generateStaticParams() {
  return SERVICE_SLUGS.map(slug => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const service = getServiceBySlug(slug as ServiceSlug)
  if (!service) return {}
  return generateServiceMetadata(service)
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const service = getServiceBySlug(slug as ServiceSlug)
  if (!service) notFound()

  const photos = getPhotosByService(slug as ServiceSlug)
  const waUrl = defaultWhatsAppUrl({ service: service.name })

  const relatedServices = service.relatedServices
    .map(s => getServiceBySlug(s))
    .filter((s): s is NonNullable<typeof s> => s !== undefined)

  const serviceSchema = buildServiceJsonLd(service)
  const faqSchema = buildFaqJsonLd(service.faqs)
  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.name, url: `/services/${service.slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="relative flex items-end min-h-[40vh] bg-ink py-16">
        <div className="relative z-10 mx-auto max-w-content px-6">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex gap-2 text-xs text-white/50 list-none p-0 m-0">
              <li><Link href="/" className="hover:text-white/80 transition-colors">Home</Link></li>
              <li aria-hidden="true">›</li>
              <li><Link href="/services" className="hover:text-white/80 transition-colors">Services</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-white/80">{service.name}</li>
            </ol>
          </nav>
          <h1 className="text-[var(--text-display-2)] font-[var(--font-fraunces)] font-bold text-white mb-4 leading-tight">
            {service.name}
          </h1>
          <p className="text-white/75 text-lg max-w-xl">{service.tagline}</p>
        </div>
      </section>

      {/* Details band */}
      <section className="py-12 border-b border-rule">
        <div className="mx-auto max-w-content px-6 grid sm:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-subtle mb-3">
              Materials
            </h2>
            <ul className="text-sm text-ink-muted space-y-1 list-none p-0 m-0">
              {service.materials.map(m => <li key={m}>{m}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-subtle mb-3">
              Sizes / Formats
            </h2>
            <ul className="text-sm text-ink-muted space-y-1 list-none p-0 m-0">
              {service.sizes.map(s => <li key={s}>{s}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-subtle mb-3">
              Turnaround
            </h2>
            <p className="text-sm text-ink-muted">{service.turnaround}</p>
          </div>
        </div>
      </section>

      {/* Gallery strip */}
      {photos.length > 0 && <GalleryStrip photos={photos} />}

      {/* WhatsApp CTA */}
      <section className="bg-blue py-16">
        <div className="mx-auto max-w-content px-6 text-center">
          <h2 className="text-white text-2xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-white/80 mb-8">Chat with us on WhatsApp for a fast quote.</p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded bg-white text-blue font-semibold px-8 py-3.5 hover:bg-white/90 transition-colors active:scale-[0.98]"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-[var(--section-py)]">
        <div className="mx-auto max-w-content px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold font-[var(--font-fraunces)] text-ink mb-8">
              Frequently Asked Questions
            </h2>
            <Accordion items={service.faqs} />
          </div>
        </div>
      </section>

      {/* Related services */}
      {relatedServices.length > 0 && (
        <section className="py-12 bg-paper-elevated border-t border-rule">
          <div className="mx-auto max-w-content px-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-ink-subtle mb-6">
              Related Services
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedServices.map(rs => (
                <ServiceTile
                  key={rs.slug}
                  slug={rs.slug}
                  name={rs.name}
                  tagline={rs.tagline}
                  icon={rs.icon}
                  expanded={false}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Secondary CTA */}
      <div className="py-12 text-center border-t border-rule">
        <Link href="/services" className="text-sm text-blue hover:underline">
          ← Explore all services
        </Link>
      </div>
    </>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd adjeet-site && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Spot-check in dev server**

```bash
cd adjeet-site && npm run dev
```

Open `http://localhost:3000/services/glow-sign-boards`. Verify:
- Page title shows "Glow Sign Boards in North Bengal | AD-JEET"
- Breadcrumb: Home › Services › Glow Sign Boards
- Materials list renders
- FAQs accordion opens and closes
- WhatsApp CTA button is present

Open `http://localhost:3000/services/vehicle-branding` and `http://localhost:3000/services/events-and-puja` — both should render without errors.

Stop dev server.

- [ ] **Step 5: Commit**

```bash
cd adjeet-site && git add 'app/(marketing)/services/[slug]/page.tsx' 'app/(marketing)/services/[slug]/loading.tsx' && git commit -m "feat: /services/[slug] detail page — 10 static pages with JSON-LD"
```

---

## Task 11: E2E tests

**Files:**
- Create: `adjeet-site/tests/e2e/home.spec.ts`
- Create: `adjeet-site/tests/e2e/services.spec.ts`

Playwright tests. The `webServer` in `playwright.config.ts` starts `npm run dev` automatically.

- [ ] **Step 1: Create home.spec.ts**

Create `adjeet-site/tests/e2e/home.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    // Accept consent so it doesn't interfere with other assertions
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
    await page.reload()
  })

  test('hero heading is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /north bengal's most trusted signage company/i })
    ).toBeVisible()
  })

  test('hero has link to /services', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Our Services' })).toBeVisible()
  })

  test('hero has WhatsApp link', async ({ page }) => {
    const waLink = page.getByRole('link', { name: /whatsapp/i }).first()
    const href = await waLink.getAttribute('href')
    expect(href).toMatch(/^https:\/\/wa\.me\//)
  })

  test('services grid renders 10 tiles', async ({ page }) => {
    const serviceLinks = page.locator('a[href^="/services/"]')
    await expect(serviceLinks).toHaveCount(10)
  })

  test('each service tile links to /services/[slug]', async ({ page }) => {
    const links = await page.locator('a[href^="/services/"]').all()
    for (const link of links) {
      const href = await link.getAttribute('href')
      expect(href).toMatch(/^\/services\/[\w-]+$/)
    }
  })

  test('proof block stats are visible', async ({ page }) => {
    await page.locator('dl').scrollIntoViewIfNeeded()
    await expect(page.getByRole('term', { name: 'Projects' }).or(page.getByText('Projects'))).toBeVisible()
    await expect(page.getByText('Clients')).toBeVisible()
  })

  test('gallery teaser shows 6 photo buttons', async ({ page }) => {
    const photoButtons = page.locator('[aria-label^="View photo:"]')
    await expect(photoButtons).toHaveCount(6)
  })

  test('trust band shows category tags', async ({ page }) => {
    await expect(page.getByText(/Illuminated/)).toBeVisible()
    await expect(page.getByText(/Branding/)).toBeVisible()
  })
})
```

- [ ] **Step 2: Create services.spec.ts**

Create `adjeet-site/tests/e2e/services.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.describe('/services overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services')
    await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
    await page.reload()
    await page.goto('/services')
  })

  test('page heading is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Our Services' })).toBeVisible()
  })

  test('renders 10 service tiles with taglines', async ({ page }) => {
    const serviceLinks = page.locator('a[href^="/services/"]')
    await expect(serviceLinks).toHaveCount(10)
    // First service tagline visible in expanded mode
    await expect(page.getByText('Illuminate your brand 24/7')).toBeVisible()
  })
})

test.describe('/services/[slug] detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services/glow-sign-boards')
    await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
    await page.reload()
    await page.goto('/services/glow-sign-boards')
  })

  test('renders service name as heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Glow Sign Boards' })
    ).toBeVisible()
  })

  test('breadcrumb shows correct path', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Services' })).toBeVisible()
    await expect(page.getByText('Glow Sign Boards', { exact: false })).toBeVisible()
  })

  test('FAQ accordion opens and closes', async ({ page }) => {
    const firstQuestion = page.getByRole('button', { name: /how long do the led strips last/i })
    await expect(firstQuestion).toBeVisible()
    await firstQuestion.click()
    await expect(page.getByText(/30,000–50,000 hours/)).toBeVisible()
    await firstQuestion.click()
    await expect(page.getByText(/30,000–50,000 hours/)).not.toBeVisible()
  })

  test('WhatsApp CTA href starts with wa.me', async ({ page }) => {
    const waLink = page.getByRole('link', { name: /chat on whatsapp/i })
    await expect(waLink).toBeVisible()
    const href = await waLink.getAttribute('href')
    expect(href).toMatch(/^https:\/\/wa\.me\//)
  })

  test('related services section renders', async ({ page }) => {
    await expect(page.getByText('Related Services')).toBeVisible()
  })

  test('returns 404 for unknown slug', async ({ page }) => {
    await page.goto('/services/not-a-real-service')
    await expect(page.getByText(/404|not found/i)).toBeVisible()
  })
})
```

- [ ] **Step 3: Run the E2E tests**

```bash
cd adjeet-site && npx playwright test tests/e2e/home.spec.ts tests/e2e/services.spec.ts
```

Expected: all tests pass. If any fail due to animation timing, add `await page.waitForTimeout(500)` before the failing assertion.

- [ ] **Step 4: Run all unit tests to confirm no regressions**

```bash
cd adjeet-site && npx vitest run
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
cd adjeet-site && git add tests/e2e/home.spec.ts tests/e2e/services.spec.ts && git commit -m "test: E2E tests for Home page and Services pages"
```

---

## Self-review checklist

After all tasks complete:

**Spec coverage:**
- [x] Home page — 5 sections (Hero, ServicesGrid, ProofBlock, GalleryTeaser, TrustBand)
- [x] `/services` overview with expanded grid and CTA strip
- [x] `/services/[slug]` detail with hero, details, gallery, WhatsApp CTA, FAQs, related services
- [x] `ServiceIcon` — 10 bespoke SVGs mapped from icon strings
- [x] `lib/seo.ts` — all JSON-LD builders + generateMetadata
- [x] `LocalBusiness` JSON-LD in marketing layout
- [x] `generateStaticParams` for all 10 service slugs
- [x] `notFound()` for unknown slugs
- [x] `loading.tsx` skeleton for service detail
- [x] Unit tests: seo.ts, ServiceIcon, ServicesGrid
- [x] E2E tests: Home, /services, /services/[slug]

**Type consistency:**
- `ServiceTile` props match usage in ServicesGrid and service detail page (`slug: string`, `name`, `tagline`, `icon`, `expanded`)
- `defaultWhatsAppUrl` called with `{ service: service.name }` on service detail, no args on hero/services overview
- `params: Promise<{ slug: string }>` awaited in both `generateMetadata` and `ServiceDetailPage`
- `GalleryPhoto` type from `@/content/gallery` used in `GalleryStrip` props
