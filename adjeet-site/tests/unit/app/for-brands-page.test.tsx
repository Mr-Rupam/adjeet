import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import ForBrandsPage, { metadata } from '@/app/(marketing)/for-brands/page'
import ServiceDetailPage from '@/app/(marketing)/services/[slug]/page'
import ServicesPage from '@/app/(marketing)/services/page'
import AreasPage from '@/app/(marketing)/areas/page'
import TownPage from '@/app/(marketing)/areas/[town]/page'
import AboutPage from '@/app/(marketing)/about/page'
import ContactPage from '@/app/(marketing)/contact/page'
import { BRANDS_PHOTOGRAPHED, BRAND_PHOTO_IDS, BRAND_TRADES, FOR_BRANDS_FAQS, FOR_BRANDS_PATH } from '@/content/for-brands'
import { getPhotoById, photos } from '@/content/gallery'
import { SERVICE_SLUGS } from '@/content/services'
import { TOWNS } from '@/content/areas'
import { reviewedOn } from '@/content/page-reviews'
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
const nodes = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent ?? '') as Record<string, unknown>)
const byType = (type: string) => nodes.filter(node => node['@type'] === type)

describe('/for-brands', () => {
  it('targets the brand buyer in its title and H1', () => {
    const title = (metadata.title as { absolute: string }).absolute
    expect(title).toMatch(/Outdoor Advertising Agency in Siliguri/)
    expect(title).toMatch(/Dealer Boards/)
    const h1 = doc.querySelector('h1')?.textContent ?? ''
    expect(h1).toMatch(/Dealer boards/)
    expect(h1).toMatch(/outdoor advertising agency in Siliguri/)
    expect(metadata.alternates?.canonical).toBe(siteConfig.url + FOR_BRANDS_PATH)
  })

  it('carries WebPage, FAQPage and BreadcrumbList nodes that match the page', () => {
    expect(byType('WebPage')[0]).toMatchObject({
      url: siteConfig.url + FOR_BRANDS_PATH,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': BUSINESS_ID },
      dateModified: reviewedOn(FOR_BRANDS_PATH),
    })
    const text = doc.body.textContent ?? ''
    const [faq] = byType('FAQPage')
    expect((faq.mainEntity as { name: string }[]).map(item => item.name)).toEqual(FOR_BRANDS_FAQS.map(item => item.q))
    for (const item of FOR_BRANDS_FAQS) {
      expect(text).toContain(item.q)
      expect(text).toContain(item.a)
    }
    expect(FOR_BRANDS_FAQS.length).toBeGreaterThanOrEqual(3)
    expect(FOR_BRANDS_FAQS.length).toBeLessThanOrEqual(5)
    const [breadcrumb] = byType('BreadcrumbList')
    expect((breadcrumb.itemListElement as { item: string }[]).map(item => item.item)).toEqual([siteConfig.url + '/', siteConfig.url + FOR_BRANDS_PATH])
  })

  it('names only brands whose work is photographed in the gallery, and shows only gallery photos', () => {
    const clients = new Set(photos.map(photo => photo.client))
    for (const brand of BRANDS_PHOTOGRAPHED) expect(clients.has(brand), brand).toBe(true)
    for (const id of BRAND_PHOTO_IDS) expect(() => getPhotoById(id)).not.toThrow()
  })

  it('links the trade pages, the portfolio and the areas page, and offers WhatsApp and the form', () => {
    const hrefs = [...doc.querySelectorAll('a')].map(link => link.getAttribute('href') ?? '')
    for (const trade of BRAND_TRADES) for (const link of trade.links) expect(hrefs).toContain(`/services/${link.slug}`)
    expect(hrefs).toContain('/portfolio')
    expect(hrefs).toContain('/areas')
    const whatsApp = hrefs.find(href => href.startsWith('https://wa.me/'))!
    expect(decodeURIComponent(whatsApp)).toMatch(/brand or trade marketing team/)
    expect(doc.querySelector('#send-brief')).not.toBeNull()
  })

  it('makes no price, reply-time, site-visit or count claims and uses no em dashes', () => {
    const text = doc.body.textContent ?? ''
    expect(text).not.toMatch(/₹|rupee|\bRs\b|within \d+ (hours|days)|site visit|Fortune|\d+\+/i)
    expect(text).not.toContain('—')
  })

  // The quality gate from the brief: 500 or more words of its own and under
  // 30 percent of its 5-word shingles shared with any other page.
  it('passes its quality gate: 500+ words and under 30% overlap with every other page', async () => {
    const words = pageWords(doc)
    expect(words.length).toBeGreaterThanOrEqual(500)
    const own = shingles(words)
    const others: [string, Document][] = [
      ['/services', parse(<ServicesPage />)],
      ['/areas', parse(<AreasPage />)],
      ['/about', parse(<AboutPage />)],
      ['/contact', parse(<ContactPage />)],
    ]
    for (const slug of SERVICE_SLUGS) others.push([`/services/${slug}`, parse(await ServiceDetailPage({ params: Promise.resolve({ slug }) }))])
    for (const town of TOWNS) others.push([`/areas/${town.slug}`, parse(await TownPage({ params: Promise.resolve({ town: town.slug }) }))])
    for (const [path, other] of others) {
      const theirs = shingles(pageWords(other))
      const shared = [...own].filter(shingle => theirs.has(shingle)).length
      expect(shared / own.size, path).toBeLessThan(0.3)    }
  }, 60000)
})
