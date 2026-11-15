import { describe, expect, it, vi } from 'vitest'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import ForBrandsPage, { metadata } from '@/app/(marketing)/for-brands/page'
import ServiceDetailPage from '@/app/(marketing)/services/[slug]/page'
import ServicesPage from '@/app/(marketing)/services/page'
import AreasPage from '@/app/(marketing)/areas/page'
import TownPage from '@/app/(marketing)/areas/[town]/page'
import AboutPage from '@/app/(marketing)/about/page'
import ContactPage from '@/app/(marketing)/contact/page'
import {
  BRAND_LEDGER,
  BRAND_PHOTO_IDS,
  BRAND_TRADES,
  FOR_BRANDS_FAQS,
  FOR_BRANDS_PATH,
  FOR_BRANDS_WHATSAPP_MESSAGE,
  PROFILE_WHATSAPP_MESSAGE,
  ROLLOUT_STEPS,
  SPEED_PHOTO_ID,
  TYPE_ONLY_TRADES,
} from '@/content/for-brands'
import {
  ALSO_SERVICES,
  BRAND_TENURES,
  COMPANIES_SERVED,
  CREW_NETWORK,
  GPS_PHOTO_LINE,
  JOB_DAYS,
  JOB_DAYS_CAPTION,
  MALDA_STORY,
  VEHICLES,
  WORKSHOP,
  yearsWith,
} from '@/content/company-figures'
import { getPhotoById, photos } from '@/content/gallery'
import { SERVICE_SLUGS } from '@/content/services'
import { TOWNS } from '@/content/areas'
import { reviewedOn } from '@/content/page-reviews'
import { COVERAGE_AREAS, FOUNDED_YEAR } from '@/lib/coverage'
import { BUSINESS_ID, WEBSITE_ID, siteConfig } from '@/lib/seo'

// Only the page's own text and structured data are under test.
vi.mock('@/components/sections/LeadForm', () => ({ LeadForm: () => null }))
vi.mock('@/components/PageViewTracker', () => ({ ServicePageTracker: () => null }))
vi.mock('@/components/coverage/CoverageStage', () => ({ CoverageStage: () => null }))
vi.mock('@/components/coverage/CoveragePlaceList', () => ({ CoveragePlaceList: () => null }))
vi.mock('@/components/home/HeroScene', () => ({ HeroScene: () => null }))

function parse(element: ReactElement) {
  return new DOMParser().parseFromString(renderToStaticMarkup(element), 'text/html')
}

/** Visible words, without structured data or the shared enquiry form section. */
function pageWords(doc: Document): string[] {
  const body = doc.body.cloneNode(true) as HTMLElement
  body.querySelectorAll('script, style, #send-brief').forEach(node => node.remove())
  return (body.textContent ?? '').toLowerCase().replace(/[^a-z0-9\s']/g, ' ').split(/\s+/).filter(Boolean)
}

function shingles(words: string[], size = 5): Set<string> {
  const set = new Set<string>()
  for (let i = 0; i + size <= words.length; i++) set.add(words.slice(i, i + size).join(' '))
  return set
}

const doc = parse(<ForBrandsPage />)
const text = doc.body.textContent ?? ''
const nodes = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent ?? '') as Record<string, unknown>)
const byType = (type: string) => nodes.filter(node => node['@type'] === type)
const hrefs = [...doc.querySelectorAll('a')].map(link => link.getAttribute('href') ?? '')
const ledgerNames = BRAND_LEDGER.flatMap(row => row.brands.map(brand => brand.name))

describe('/for-brands', () => {
  it('names the agency and the buyer in its title and H1', () => {
    const title = (metadata.title as { absolute: string }).absolute
    expect(title).toMatch(/^Advertising Agency for Brands in North Bengal & Sikkim/)
    const h1 = doc.querySelector('h1')?.textContent ?? ''
    expect(h1).toMatch(/advertising agency/)
    expect(h1).toMatch(/North Bengal and Sikkim/)
    expect(metadata.alternates?.canonical).toBe(siteConfig.url + FOR_BRANDS_PATH)
  })

  it('carries WebPage, FAQPage and BreadcrumbList nodes that match the visible page', () => {
    expect(byType('WebPage')[0]).toMatchObject({
      url: siteConfig.url + FOR_BRANDS_PATH,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': BUSINESS_ID },
      dateModified: reviewedOn(FOR_BRANDS_PATH),
    })
    const [faq] = byType('FAQPage')
    const entities = faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[]
    expect(entities.map(item => item.name)).toEqual(FOR_BRANDS_FAQS.map(item => item.q))
    const visible = [...doc.querySelectorAll('dt')].map(node => node.textContent)
    for (const [index, item] of FOR_BRANDS_FAQS.entries()) {
      expect(visible).toContain(item.q)
      expect(text).toContain(item.a)
      expect(entities[index].acceptedAnswer.text).toBe(item.a)
      expect(item.a.split(/\s+/).length, item.q).toBeLessThan(60)
    }
    expect(FOR_BRANDS_FAQS.length).toBeLessThanOrEqual(4)
    const [breadcrumb] = byType('BreadcrumbList')
    expect((breadcrumb.itemListElement as { item: string }[]).map(item => item.item)).toEqual([siteConfig.url + '/', siteConfig.url + FOR_BRANDS_PATH])
  })

  it('opens with the profile request in gold and the outlet list as the quiet link', () => {
    const opening = doc.querySelector('.page-masthead')!
    const links = [...opening.querySelectorAll('a[href^="https://wa.me/"]')]
    expect(links[0].className).toContain('cta--yellow')
    expect(links[0].textContent).toBe('Ask for the company profile')
    expect(decodeURIComponent(links[0].getAttribute('href')!)).toContain(PROFILE_WHATSAPP_MESSAGE)
    expect(links[1].className).toContain('action-quiet')
    expect(links[1].textContent).toContain('Send your outlet list')
    expect(decodeURIComponent(links[1].getAttribute('href')!)).toContain(FOR_BRANDS_WHATSAPP_MESSAGE)
    expect(opening.querySelectorAll('.cta--yellow')).toHaveLength(1)
    // Real brand work in the opening: four to six gallery photographs.
    const mosaic = opening.querySelectorAll('figure img')
    expect(mosaic.length).toBeGreaterThanOrEqual(4)
    expect(mosaic.length).toBeLessThanOrEqual(6)
  })

  it('shows only gallery photos, and names only brands from the gallery or the logo board', () => {
    const clients = new Set(photos.map(photo => photo.client))
    for (const id of BRAND_PHOTO_IDS) expect(() => getPhotoById(id)).not.toThrow()
    const gallerySrcs = new Set(photos.map(photo => photo.src))
    const photoImgs = [...doc.querySelectorAll('figure img')]
    for (const img of photoImgs) {
      const src = decodeURIComponent(img.getAttribute('src') ?? '')
      expect([...gallerySrcs].some(s => src.includes(encodeURIComponent(s)) || src.includes(s)), src).toBe(true)
    }
    for (const { brand } of BRAND_TENURES) expect(clients.has(brand) || ledgerNames.includes(brand), brand).toBe(true)
    for (const strong of doc.querySelectorAll('.fascia-plate strong')) expect(clients.has(strong.textContent ?? ''), strong.textContent ?? '').toBe(true)
    for (const row of BRAND_LEDGER) for (const brand of row.brands) {
      expect(existsSync(path.join(process.cwd(), 'public', brand.logo)), brand.logo).toBe(true)
      expect(doc.querySelector(`img[alt="${brand.name}"]`), brand.name).not.toBeNull()
    }
    expect(text).toContain('Selected history includes assignments through regional agencies.')
  })

  it('reads every figure from content/company-figures.ts', () => {
    expect(text).toContain(COMPANIES_SERVED.split(' ')[0])
    for (const { brand, since } of BRAND_TENURES) expect(text).toContain(`${yearsWith(since)} years with ${brand}`)
    expect(text).toContain(WORKSHOP.area.replace(' sq ft', ''))
    expect(text).toContain(String(CREW_NETWORK.size))
    expect(text).toContain(VEHICLES.range)
    expect(text).toContain(`${COVERAGE_AREAS.length} areas`)
    expect(text).toContain(MALDA_STORY)
    expect(text).toContain(GPS_PHOTO_LINE)
    expect(text).toContain('Vendor documents for your empanelment, on request.')

    // Every number on the page is one of those figures, a photo's recorded year, the day scale or a step.
    const shown = new Set(BRAND_PHOTO_IDS.map(getPhotoById).flatMap(photo => (photo.year ? [String(photo.year)] : [])))
    const allowed = new Set([
      ...`${COMPANIES_SERVED} ${WORKSHOP.area} ${CREW_NETWORK.line} ${VEHICLES.line} ${MALDA_STORY} ${FOUNDED_YEAR}`.match(/\d[\d,]*/g)!,
      ...BRAND_TENURES.map(({ since }) => String(yearsWith(since))),
      ...JOB_DAYS.flatMap(job => [String(job.min), String(job.max)]),
      ...ROLLOUT_STEPS.map((_, index) => String(index + 1)),
      '1', '2', '3', '4', '5', String(COVERAGE_AREAS.length), ...shown,
    ])
    const body = doc.body.cloneNode(true) as HTMLElement
    body.querySelectorAll('script, time').forEach(node => node.remove())
    for (const number of (body.textContent ?? '').match(/\d[\d,]*/g) ?? []) expect(allowed.has(number), number).toBe(true)
  })

  it('lists eight things it runs: five photographed trades linked to their pages, three as type only', () => {
    expect(BRAND_TRADES.map(trade => trade.title)).toEqual(['Dealer boards', 'In-shop branding', 'Wall painting campaigns', 'Vehicle and fleet branding', 'Puja gates and events'])
    expect(new Set(BRAND_PHOTO_IDS).size).toBe(BRAND_PHOTO_IDS.length)
    for (const trade of BRAND_TRADES) {
      expect(hrefs).toContain(`/services/${trade.link.slug}`)
      const heading = [...doc.querySelectorAll('h3')].find(node => node.textContent === trade.title)!
      expect(heading.closest('li')!.querySelector('figure .fascia-plate')).not.toBeNull()
    }
    expect(TYPE_ONLY_TRADES.map(trade => trade.title)).toEqual([...ALSO_SERVICES])
    for (const trade of TYPE_ONLY_TRADES) {
      const heading = [...doc.querySelectorAll('h3')].find(node => node.textContent === trade.title)!
      expect(heading.closest('li')!.querySelector('img')).toBeNull()
    }
    expect(hrefs).toContain('/portfolio')
    expect(hrefs).toContain('/areas')
  })

  it('sets the Malda story beside a Star Cement photo captioned with its own place', () => {
    const photo = getPhotoById(SPEED_PHOTO_ID)
    expect(photo.client).toBe('Star Cement')
    const story = [...doc.querySelectorAll('p')].find(node => node.textContent === MALDA_STORY)!
    const caption = story.closest('section')!.querySelector('figcaption')!.textContent ?? ''
    expect(caption).toContain(photo.location!)
    expect(caption).not.toContain('Malda')
  })

  it('draws the job days as a real table with the approved caption', () => {
    const table = doc.querySelector('table')!
    expect(table.querySelector('caption')!.textContent).toBe(JOB_DAYS_CAPTION)
    const rows = [...table.querySelectorAll('tbody tr')]
    expect(rows.map(row => row.querySelector('th[scope="row"]')!.textContent)).toEqual(JOB_DAYS.map(job => job.label))
    for (const [index, row] of rows.entries()) {
      const job = JOB_DAYS[index]
      expect(row.querySelectorAll('td')).toHaveLength(6)
      expect(row.lastElementChild!.textContent).toBe(`${job.min} to ${job.max} days`)
    }
    expect([...table.querySelectorAll('thead th[scope="col"]')].map(th => th.textContent)).toEqual(['Trade', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'From the order'])
  })

  it('makes no price, reply-time, site-visit or client-count claim and uses no em dashes', () => {
    expect(text).not.toMatch(/₹|rupee|\bRs\b|within \d+ (hours|days)|site visit|Fortune/i)
    expect(text).not.toMatch(/\b(26|17) (work|companies|clients|brands)\b|\bstaff\b|team of \d|employees/i)
    expect(text).not.toContain('—')
    expect(text).not.toContain('–')
  })

  // The quality gate: 350 to about 450 words of its own and under 30 percent
  // of its 5-word shingles shared with any other page.
  it('passes its quality gate: 350+ words, not text heavy, under 30% overlap with every other page', async () => {
    const words = pageWords(doc)
    expect(words.length).toBeGreaterThanOrEqual(350)
    // The cap keeps the page from growing back into a wall of text (it was 824 words).
    expect(words.length).toBeLessThanOrEqual(500)
    const own = shingles(words)
    const others: [string, Document][] = [
      ['/services', parse(<ServicesPage />)],
      ['/areas', parse(<AreasPage />)],
      ['/about', parse(<AboutPage />)],
      ['/contact', parse(<ContactPage />)],
    ]
    for (const slug of SERVICE_SLUGS) others.push([`/services/${slug}`, parse(await ServiceDetailPage({ params: Promise.resolve({ slug }) }))])
    for (const town of TOWNS) others.push([`/areas/${town.slug}`, parse(await TownPage({ params: Promise.resolve({ town: town.slug }) }))])
    for (const [pagePath, other] of others) {
      const theirs = shingles(pageWords(other))
      const shared = [...own].filter(shingle => theirs.has(shingle)).length
      expect(shared / own.size, pagePath).toBeLessThan(0.3)
    }
  }, 60000)
})
