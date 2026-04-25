import { describe, it, expect } from 'vitest'
import { buildFaqJsonLd, buildBreadcrumbJsonLd, buildServiceJsonLd, buildLocalBusinessJsonLd, siteConfig } from '@/lib/seo'
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

describe('buildLocalBusinessJsonLd', () => {
  it('returns LocalBusiness schema with correct type and name', () => {
    const result = buildLocalBusinessJsonLd()
    expect(result['@type']).toBe('LocalBusiness')
    expect(result.name).toBe('AD-JEET')
  })

  it('has a telephone field', () => {
    const result = buildLocalBusinessJsonLd()
    expect(result.telephone).toBeTruthy()
  })

  it('has address with PostalAddress type', () => {
    const result = buildLocalBusinessJsonLd()
    expect(result.address['@type']).toBe('PostalAddress')
  })

  it('has geo coordinates', () => {
    const result = buildLocalBusinessJsonLd()
    expect(result.geo['@type']).toBe('GeoCoordinates')
    expect(typeof result.geo.latitude).toBe('number')
    expect(typeof result.geo.longitude).toBe('number')
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
