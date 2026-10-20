import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import TownPage, { generateMetadata } from '@/app/(marketing)/areas/[town]/page'
import AreasPage from '@/app/(marketing)/areas/page'
import ServiceDetailPage from '@/app/(marketing)/services/[slug]/page'
import { AREA_GROUPS, TOWNS, distanceKm } from '@/content/areas'
import { SILIGURI_BRIEFS } from '@/content/service-local'
import { SERVICE_SLUGS, type ServiceSlug } from '@/content/services'
import { photoPlace } from '@/content/photo-places'
import { COVERAGE_AREAS } from '@/lib/coverage'
import { COVERAGE_CITIES } from '@/lib/lead-schema'

// The form is a client island with a CAPTCHA; what these pages owe it is the
// prefill, so the stub records exactly that and adds no text of its own.
vi.mock('@/components/sections/LeadForm', () => ({
  LeadForm: ({ defaultCity, defaultService }: { defaultCity?: string; defaultService?: string }) => (
    <div data-testid="lead-form" data-default-city={defaultCity ?? ''} data-default-service={defaultService ?? ''} />
  ),
}))
vi.mock('@/components/PageViewTracker', () => ({ ServicePageTracker: () => null }))
vi.mock('@/components/coverage/CoverageStage', () => ({ CoverageStage: () => null }))
vi.mock('@/components/coverage/CoveragePlaceList', () => ({ CoveragePlaceList: () => null }))

function render(element: ReactElement): Document {
  return new DOMParser().parseFromString(renderToStaticMarkup(element), 'text/html')
}

/** The words a reader sees: scripts out, whitespace collapsed. */
function visibleText(doc: Document): string {
  const body = doc.body.cloneNode(true) as HTMLElement
  body.querySelectorAll('script, style').forEach(node => node.remove())
  return (body.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+(?:['’][a-z]+)?/g) ?? []
}

/** Five-word shingles, the measure the SEO plan used for duplicate text. */
function shingles(text: string): Set<string> {
  const list = words(text)
  const out = new Set<string>()
  for (let i = 0; i + 5 <= list.length; i++) out.add(list.slice(i, i + 5).join(' '))
  return out
}

const townDocs = new Map<string, Document>()
async function townDoc(slug: string) {
  if (!townDocs.has(slug)) townDocs.set(slug, render(await TownPage({ params: Promise.resolve({ town: slug }) })))
  return townDocs.get(slug)!
}

const serviceDocs = new Map<string, Document>()
async function serviceDoc(slug: string) {
  if (!serviceDocs.has(slug)) serviceDocs.set(slug, render(await ServiceDetailPage({ params: Promise.resolve({ slug }) })))
  return serviceDocs.get(slug)!
}

describe('town pages', () => {
  // The SEO plan's gate: at least two documented local jobs, 600+ words and
  // 60%+ of the page's own text. Measured against every page a searcher could
  // land on instead: the other towns, /areas and all ten service pages.
  it('are indexable exactly when they pass the quality gate', async () => {
    const others = new Map<string, Set<string>>()
    for (const town of TOWNS) others.set(town.slug, shingles(visibleText(await townDoc(town.slug))))
    for (const slug of SERVICE_SLUGS) others.set('service:' + slug, shingles(visibleText(await serviceDoc(slug))))
    others.set('areas', shingles(visibleText(render(<AreasPage />))))

    for (const town of TOWNS) {
      const text = visibleText(await townDoc(town.slug))
      const own = others.get(town.slug)!
      const shared = [...own].filter(shingle => [...others].some(([key, set]) => key !== town.slug && set.has(shingle)))
      const unique = 1 - shared.length / own.size
      const passes = words(text).length >= 600 && unique >= 0.6 && town.photos.length >= 2
      expect(passes, `${town.slug}: ${words(text).length} words, ${Math.round(unique * 100)}% unique, ${town.photos.length} photos`).toBe(town.indexable)
      if (town.indexable) {
        expect(words(text).length, town.slug).toBeGreaterThanOrEqual(600)
        expect(unique, town.slug).toBeGreaterThanOrEqual(0.6)
      }
    }
    // Gangtok: written as a true Sikkim planning page, held back for now.
    expect(TOWNS.find(town => town.slug === 'gangtok')!.indexable).toBe(false)
  }, 60000)

  it('ship noindex, follow until they pass, and never otherwise', async () => {
    for (const town of TOWNS) {
      const metadata = await generateMetadata({ params: Promise.resolve({ town: town.slug }) })
      if (town.indexable) expect(metadata.robots, town.slug).toBeUndefined()
      else expect(metadata.robots, town.slug).toEqual({ index: false, follow: true })
    }
  })

  it('show only photographs whose place is recorded as this town', async () => {
    for (const town of TOWNS) {
      expect(town.photos.length, town.slug).toBeGreaterThan(0)
      for (const photo of town.photos) {
        const recorded = town.slug === 'gangtok' ? photo.location === 'Gangtok' : photo.city === town.slug
        expect(recorded, `${town.slug}: ${photo.id}`).toBe(true)
      }
      const doc = await townDoc(town.slug)
      expect(doc.querySelectorAll('button[aria-label^="View photo:"]'), town.slug).toHaveLength(town.photos.length)
    }
  })

  // The work paragraph is written by hand; hold every brand, place and year it
  // names to the photographs on the page.
  it('only names brands, places and years the photographs record', () => {
    for (const town of TOWNS) {
      const { clients, places, years } = town.workCites
      for (const client of clients) {
        expect(town.photos.some(photo => photo.client === client), `${town.slug}: ${client}`).toBe(true)
        expect(town.work, town.slug).toContain(client)
      }
      for (const place of places) {
        expect(town.photos.some(photo => (photoPlace(photo) ?? '').includes(place)), `${town.slug}: ${place}`).toBe(true)
        expect(town.work, town.slug).toContain(place)
      }
      const recorded = town.photos.flatMap(photo => (photo.year ? [photo.year] : []))
      expect([Math.min(...recorded), Math.max(...recorded)], town.slug).toEqual(years)
      for (const year of years) expect(town.work, town.slug).toContain(String(year))
    }
  })

  it('prefill the form with the town, and leave the trade to the visitor', async () => {
    for (const town of TOWNS) {
      expect(COVERAGE_CITIES as readonly string[], town.slug).toContain(town.leadCity)
      const form = (await townDoc(town.slug)).querySelector('[data-testid="lead-form"]')!
      expect(form.getAttribute('data-default-city'), town.slug).toBe(town.leadCity)
      expect(form.getAttribute('data-default-service'), town.slug).toBe('')
    }
  })

  it('ask only their own town\'s questions, and say how far it is', async () => {
    for (const town of TOWNS) {
      for (const faq of town.faqs) expect(faq.q, town.slug).not.toMatch(/siliguri/i)
      const text = visibleText(await townDoc(town.slug))
      expect(text, town.slug).toContain(`About ${distanceKm(town.coverageArea)} km from the workshop`)
      expect(text, town.slug).not.toMatch(/[–—]/)
    }
  })
})

describe('service pages', () => {
  it('carry the Siliguri brief and send-us list on the five trades that absorbed a Siliguri page', async () => {
    for (const slug of SERVICE_SLUGS) {
      const doc = await serviceDoc(slug)
      const brief = SILIGURI_BRIEFS[slug as ServiceSlug]
      const heading = doc.querySelector('#service-siliguri-heading')
      if (!brief) {
        expect(heading, slug).toBeNull()
        continue
      }
      expect(heading?.textContent, slug).toBe(`Planning ${brief.work} in Siliguri`)
      const text = visibleText(doc)
      expect(text, slug).toContain(brief.brief)
      for (const item of brief.sendUs) expect(text, slug).toContain(item)
    }
    expect(Object.keys(SILIGURI_BRIEFS).sort()).toEqual(['acp-led-signage', 'f-pole-installation', 'flex-printing', 'glow-sign-boards', 'vehicle-branding'])
  })

  // LeadForm keeps a page's own city over `?city=`; the page has to pass it.
  it('prefill the form with the trade and Siliguri, and link to the areas page', async () => {
    for (const slug of SERVICE_SLUGS) {
      const doc = await serviceDoc(slug)
      const form = doc.querySelector('[data-testid="lead-form"]')!
      expect(form.getAttribute('data-default-city'), slug).toBe('Siliguri')
      expect(form.getAttribute('data-default-service'), slug).toBe(slug)
      expect(doc.querySelector('#service-outside-heading')?.textContent, slug).toBe('Working outside Siliguri?')
      expect(doc.querySelector('a[href="/areas"]'), slug).not.toBeNull()
      expect(doc.querySelector('h1')?.textContent, slug).toMatch(/in Siliguri/)
    }
  })

  it('call wall painting "Wall Painting Advertising" in the H1', async () => {
    expect((await serviceDoc('wall-painting')).querySelector('h1')?.textContent).toContain('Wall Painting Advertising')
  })

  it('caption each project photo with the place and year only where recorded', async () => {
    const doc = await serviceDoc('glow-sign-boards')
    const captions = [...doc.querySelectorAll('li p')].map(node => node.textContent)
    expect(captions).toContain('Havells · Jalpaiguri · 2021')
    expect(captions).toContain('Astral Pipe · Khagrabari, Cooch Behar · 2026')
  })
})

describe('the areas page', () => {
  it('puts every coverage place in exactly one group, with nothing but its name and distance', () => {
    const grouped = AREA_GROUPS.flatMap(group => group.places)
    expect([...grouped].sort()).toEqual(COVERAGE_AREAS.map(area => area.name).sort())
    expect(new Set(grouped).size).toBe(grouped.length)

    const doc = render(<AreasPage />)
    const boards = [...doc.querySelectorAll('ul[aria-label$="places and distances"] > li')]
    expect(boards).toHaveLength(COVERAGE_AREAS.length)
    for (const board of boards) {
      const parts = [...board.children].map(child => child.textContent)
      expect(parts).toHaveLength(2)
      const [name, distance] = parts
      expect(distance).toBe(name === 'Siliguri' ? 'Workshop' : `${distanceKm(name!)} km`)
    }
  })

  it('gives every group guidance and grades no place', () => {
    for (const group of AREA_GROUPS) expect(group.guidance.length, group.id).toBeGreaterThan(0)
    const text = visibleText(render(<AreasPage />))
    expect(text).not.toMatch(/\b\d+\s+(projects?|photos?|photographs|jobs?|installations?)\b/i)
    expect(text).not.toMatch(/[–—]/)
  })

  it('links the three town pages and leaves the form for the visitor to fill', () => {
    const doc = render(<AreasPage />)
    for (const town of TOWNS) expect(doc.querySelector(`a[href="/areas/${town.slug}"]`), town.slug).not.toBeNull()
    const form = doc.querySelector('[data-testid="lead-form"]')!
    expect(form.getAttribute('data-default-city')).toBe('')
    expect(form.getAttribute('data-default-service')).toBe('')
  })
})
