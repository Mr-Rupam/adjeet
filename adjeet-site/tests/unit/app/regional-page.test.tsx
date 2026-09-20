import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ProgrammaticPage from '@/app/(programmatic)/[slug]/page'
import { programmaticPages, CITY_LABELS, PROG_SERVICES } from '@/content/programmatic'
import { getPhotosByService } from '@/content/gallery'
import { COVERAGE_CITIES } from '@/lib/lead-schema'
import { SERVICE_SLUGS, type ServiceSlug } from '@/content/services'

// The form is a client island with a CAPTCHA widget; what this page owes it is
// the prefill, so the stub records exactly that and nothing else renders.
vi.mock('@/components/sections/LeadForm', () => ({
  LeadForm: ({ defaultCity, defaultService }: { defaultCity?: string; defaultService?: string }) => (
    <div data-testid="lead-form" data-default-city={defaultCity ?? ''} data-default-service={defaultService ?? ''} />
  ),
}))
vi.mock('@/components/PageViewTracker', () => ({ ProgrammaticPageTracker: () => null }))

// Each test below walks all 27 regional pages, so without this the file renders
// the same markup five times over. Rendering is real work: under a full-suite
// run the repeated passes push past vitest's default per-test timeout.
const rendered = new Map<string, Document>()

async function renderPage(slug: string) {
  const cached = rendered.get(slug)
  if (cached) return cached
  const html = renderToStaticMarkup(await ProgrammaticPage({ params: Promise.resolve({ slug }) }))
  const doc = new DOMParser().parseFromString(html, 'text/html')
  rendered.set(slug, doc)
  return doc
}

// Rendering 27 server components is slower than the 5s default allows when the
// suite runs in parallel with the rest of the files.
const ALL_PAGES_TIMEOUT = 30000

function cityChips(doc: Document) {
  return [...doc.querySelectorAll('.regional-chip:not(.regional-chip--quiet)')]
}

function hasCityPhotos(service: string, city: string) {
  return getPhotosByService(service as ServiceSlug).some(photo => photo.city === city)
}

describe('regional page', () => {
  // The cut to three happens after the existence filter. F-pole, flex printing
  // and vehicle branding have no Gangtok page, so a cut taken before the filter
  // would silently leave those pages with two links instead of three.
  it('links exactly three sibling cities on every page, including the trades with no Gangtok page', async () => {
    for (const page of programmaticPages) {
      const chips = cityChips(await renderPage(page.slug))
      expect(chips, page.slug).toHaveLength(3)
    }
    const fPole = cityChips(await renderPage('f-pole-installation-in-malda'))
    expect(fPole.map(chip => chip.getAttribute('href'))).not.toContain('/f-pole-installation-in-gangtok')
  }, ALL_PAGES_TIMEOUT)

  // The reason the rotation exists at all. Declared order would orphan Gangtok.
  it('gives every city inbound links from its siblings, so Gangtok is not orphaned', async () => {
    const inbound = new Map<string, number>(programmaticPages.map(page => ['/' + page.slug, 0]))
    for (const page of programmaticPages) {
      for (const chip of cityChips(await renderPage(page.slug))) {
        const href = chip.getAttribute('href')!
        inbound.set(href, (inbound.get(href) ?? 0) + 1)
      }
    }
    for (const [href, count] of inbound) expect(count, `${href} has no inbound sibling links`).toBeGreaterThan(0)
    expect(inbound.get('/glow-sign-board-in-gangtok')).toBeGreaterThan(0)
    expect(inbound.get('/acp-led-signage-in-gangtok')).toBeGreaterThan(0)
  }, ALL_PAGES_TIMEOUT)

  it('never links a page to itself and keeps every chip on the same trade', async () => {
    for (const page of programmaticPages) {
      for (const chip of cityChips(await renderPage(page.slug))) {
        const href = chip.getAttribute('href')!
        expect(href, page.slug).not.toBe('/' + page.slug)
        const target = programmaticPages.find(candidate => '/' + candidate.slug === href)
        expect(target, `${page.slug} links ${href}, which is not a regional page`).toBeDefined()
        expect(target!.service, page.slug).toBe(page.service)
      }
    }
  }, ALL_PAGES_TIMEOUT)

  it('prefills the enquiry form with the page city and trade', async () => {
    for (const page of programmaticPages) {
      const form = (await renderPage(page.slug)).querySelector('[data-testid="lead-form"]')!
      expect(form.getAttribute('data-default-city'), page.slug).toBe(CITY_LABELS[page.city])
      expect(form.getAttribute('data-default-service'), page.slug).toBe(page.service)
    }
  }, ALL_PAGES_TIMEOUT)

  // The page checks membership rather than casting for both prefills, so a
  // value added on one side only degrades to "no prefill" instead of seeding
  // something the schema rejects or a checkbox that is never rendered. Both
  // fallbacks are unreachable today and should stay that way: these are the
  // guards that keep them so.
  it('keeps every regional city and trade inside the enquiry form lists', () => {
    for (const label of Object.values(CITY_LABELS)) {
      expect(COVERAGE_CITIES as readonly string[], `"${label}" would lose its form prefill`).toContain(label)
    }
    for (const service of PROG_SERVICES) {
      expect(SERVICE_SLUGS as readonly string[], `"${service}" has no checkbox to tick`).toContain(service)
    }
  })

  // Only 8 gallery photos record a city, so most regional pages show the
  // trade's work from elsewhere. The note says so; on the pages that do have
  // local photographs it must not appear, or the page contradicts itself.
  it('says where the photos were taken only when they are not from this city', async () => {
    const withLocal = programmaticPages.filter(page => hasCityPhotos(page.service, page.city))
    const withoutLocal = programmaticPages.filter(page => !hasCityPhotos(page.service, page.city))
    expect(withLocal.length).toBeGreaterThan(0)
    expect(withoutLocal.length).toBeGreaterThan(0)

    for (const page of withLocal) {
      const doc = await renderPage(page.slug)
      expect(doc.body.textContent, page.slug).not.toContain('We have not photographed')
      expect(doc.body.textContent, page.slug).toContain(`in ${CITY_LABELS[page.city]}: project photos`)
    }
    for (const page of withoutLocal) {
      const doc = await renderPage(page.slug)
      // Scoped to the trade, not the town. An empty `cityPhotos` means no
      // photographs of THIS trade here, never "we have not worked here" —
      // which would contradict the Siliguri pages naming the Siliguri workshop
      // two paragraphs above.
      expect(doc.body.textContent, page.slug).toContain(
        `We have not photographed ${page.work} in ${CITY_LABELS[page.city]} yet.`,
      )
      expect(doc.body.textContent, page.slug).not.toContain(
        `We have not photographed a ${CITY_LABELS[page.city]} project`,
      )
      expect(doc.body.textContent, page.slug).toContain('recent AD JEET work')
    }
  }, ALL_PAGES_TIMEOUT)

  it('describes the page in structured data with the paragraph the visitor reads', async () => {
    for (const page of programmaticPages) {
      const doc = await renderPage(page.slug)
      const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')]
        .map(node => JSON.parse(node.textContent ?? ''))
      const service = schemas.find(schema => schema['@type'] === 'Service')
      expect(service?.description, page.slug).toBe(page.localBrief)
      expect(doc.querySelector('.regional-lead')?.textContent, page.slug).toBe(page.localBrief)
      expect(doc.body.textContent, page.slug).not.toContain('with design and fabrication based at our Siliguri workshop')
    }
  }, ALL_PAGES_TIMEOUT)
})
