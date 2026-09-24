import { describe, it, expect } from 'vitest'
import {
  buildFaqJsonLd, buildBreadcrumbJsonLd, buildServiceJsonLd, buildLocalBusinessJsonLd, buildPageMetadata, buildWebSiteJsonLd,
  buildFounderJsonLd, buildWebPageJsonLd, siteConfig, BUSINESS_ID, WEBSITE_ID, FOUNDER_ID,
} from '@/lib/seo'
import { services } from '@/content/services'
import { reviewedOn } from '@/content/page-reviews'

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

describe('buildWebSiteJsonLd', () => {
  // Google takes the site name printed above each search result from this
  // schema on the home page. Without it, results read "adjeet.in".
  it('names the site AD JEET at the canonical home page', () => {
    const result = buildWebSiteJsonLd()
    const home = buildPageMetadata({ title: 'Home', description: 'Home page', path: '/' })
    expect(result['@type']).toBe('WebSite')
    expect(result.name).toBe('AD JEET')
    expect(new URL(result.url).href).toBe(new URL(String(home.alternates?.canonical)).href)
  })

  it('offers only the unhyphenated spelling as a fallback name', () => {
    // The brand dropped "AD-JEET"; Google may show an alternate verbatim.
    expect(buildWebSiteJsonLd().alternateName).toEqual(['ADJEET'])
  })

  it('is a node other pages can point at, published by the business', () => {
    const result = buildWebSiteJsonLd()
    expect(result['@id']).toBe(WEBSITE_ID)
    expect(result.publisher).toEqual({ '@id': BUSINESS_ID })
  })
})

describe('buildFounderJsonLd', () => {
  it('is the same person the business names as its founder', () => {
    const founder = buildFounderJsonLd()
    const business = buildLocalBusinessJsonLd()
    expect(founder['@type']).toBe('Person')
    expect(founder['@id']).toBe(FOUNDER_ID)
    expect(business.founder).toMatchObject({ '@id': FOUNDER_ID, name: founder.name })
    expect(founder.worksFor).toEqual({ '@id': BUSINESS_ID })
  })

  it('says only what the About page says: 1990, at 20, from one room to a Siliguri workshop', () => {
    expect(buildFounderJsonLd().description).toBe(
      "Ranjit Das founded AD JEET in 1990, at 20, starting in a small room in his own flat. He went on to build the company's own signage workshop in Siliguri.",
    )
  })
})

describe('buildWebPageJsonLd', () => {
  const page = { title: 'Glow Sign Board & LED Sign Board Makers in Siliguri', description: 'Glow sign boards made in Siliguri.', path: '/services/glow-sign-boards' }

  it('repeats the page metadata: canonical URL and full title', () => {
    const node = buildWebPageJsonLd(page)
    const metadata = buildPageMetadata(page)
    expect(node.url).toBe(metadata.alternates?.canonical)
    expect(node['@id']).toBe(`${node.url}#webpage`)
    expect(node.name).toBe((metadata.title as { absolute: string }).absolute)
    expect(node.description).toBe(page.description)
  })

  it('belongs to the site, is about the business, and dates itself from the review record', () => {
    const node = buildWebPageJsonLd(page)
    expect(node.isPartOf).toEqual({ '@id': WEBSITE_ID })
    expect(node.about).toEqual({ '@id': BUSINESS_ID })
    expect(node.mainEntity).toEqual({ '@id': BUSINESS_ID })
    expect(node.dateModified).toBe(reviewedOn(page.path))
  })

  it('names a more specific main entity and an absolute image when given them', () => {
    const service = buildServiceJsonLd(services[0])
    const node = buildWebPageJsonLd({ ...page, type: 'CollectionPage', mainEntityId: service['@id'], image: '/images/work/example.webp' })
    expect(node['@type']).toBe('CollectionPage')
    expect(node.mainEntity).toEqual({ '@id': service['@id'] })
    expect(node.primaryImageOfPage).toEqual({ '@type': 'ImageObject', url: `${siteConfig.url}/images/work/example.webp` })
  })

  it('uses the bare domain for the home page, like its canonical', () => {
    expect(buildWebPageJsonLd({ ...page, path: '/' }).url).toBe(siteConfig.url)
  })
})

describe('buildLocalBusinessJsonLd', () => {
  it('returns LocalBusiness schema with correct type and name', () => {
    const result = buildLocalBusinessJsonLd()
    expect(result['@type']).toBe('LocalBusiness')
    expect(result.name).toBe('AD JEET')
  })

  it('has a telephone field', () => {
    const result = buildLocalBusinessJsonLd()
    expect(result.telephone).toBeTruthy()
  })

  it('has address with PostalAddress type', () => {
    const result = buildLocalBusinessJsonLd()
    expect(result.address['@type']).toBe('PostalAddress')
  })

  it('uses a stable business identity that matches the Google Business Profile', () => {
    const result = buildLocalBusinessJsonLd()
    expect(result['@id']).toBe(siteConfig.url + '/#business')
    expect(result.email).toBe('ranjitadjeet@gmail.com')
    expect(result.founder.name).toBe('Ranjit Das')
    expect(result.address.postalCode).toBe('734010')
    expect(result.address.streetAddress).toContain('Patiram Jote')
    expect(result.geo).toMatchObject({ '@type': 'GeoCoordinates', latitude: 26.6989425, longitude: 88.4010972 })
    expect(result.sameAs).toContain(result.hasMap)
  })

  // An advertising agency with a near-identical name is listed in Kolkata. The
  // entity carries the facts that tell them apart, without naming the other.
  it('disambiguates by town, founder and founding year', () => {
    const { disambiguatingDescription } = buildLocalBusinessJsonLd()
    expect(disambiguatingDescription).toContain('Siliguri')
    expect(disambiguatingDescription).toContain('Ranjit Das')
    expect(disambiguatingDescription).toContain('1990')
    expect(disambiguatingDescription).not.toMatch(/Kolkata|Bowbazar/i)
  })

  it('areaServed contains all 5 districts', () => {
    const result = buildLocalBusinessJsonLd()
    expect(result.areaServed).toContain('Siliguri')
    expect(result.areaServed).toContain('Jalpaiguri')
    expect(result.areaServed).toContain('Cooch Behar')
    expect(result.areaServed).toContain('Darjeeling')
    expect(result.areaServed).toContain('Malda')
  })
})
