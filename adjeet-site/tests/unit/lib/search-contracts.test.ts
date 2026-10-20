import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { services } from '@/content/services'
import { TOWNS, townPath } from '@/content/areas'
import { business } from '@/lib/business'
import { ADJEET_SYSTEM_PROMPT } from '@/lib/chatbot-prompt'
import { generateServiceMetadata, buildServiceJsonLd, buildLocalBusinessJsonLd, jsonLdString } from '@/lib/seo'
import { Accordion } from '@/components/ui/Accordion'
import { GET } from '@/app/llms.txt/route'
import { SITE_REVIEWED, formatReviewDate } from '@/content/page-reviews'
import { COMPARED_BOARDS, COMPARISON_HEADING } from '@/content/sign-comparison'

describe('search and answer consistency', () => {
  it('gives every service its own canonical and matching share title', () => {
    for (const service of services) {
      const metadata = generateServiceMetadata(service)
      expect(metadata.alternates?.canonical).toBe(`${business.url}/services/${service.slug}`)
      expect(metadata.openGraph).toMatchObject({
        url: `${business.url}/services/${service.slug}`,
        title: (metadata.title as { absolute: string }).absolute,
      })
      expect(metadata.robots).toBeUndefined()
    }
  })

  it('connects town services to the same real business rather than creating local branches', () => {
    const provider = buildLocalBusinessJsonLd()
    for (const town of TOWNS) {
      const ids = new Set<string>()
      for (const trade of town.trades) {
        const service = services.find(candidate => candidate.slug === trade.service)!
        const schema = buildServiceJsonLd(service, { town: { name: town.name, state: town.state }, path: townPath(town), description: trade.brief })
        expect(schema.provider['@id']).toBe(provider['@id'])
        expect(schema.areaServed).toEqual([{ '@type': 'City', name: town.name, containedInPlace: { '@type': 'State', name: town.state } }])
        expect(schema.url).toBe(business.url + townPath(town))
        expect(schema.description).toBe(trade.brief)
        ids.add(schema['@id'])
      }
      // One page, several trades: each node needs its own @id.
      expect(ids.size, town.slug).toBe(town.trades.length)
    }
    const briefs = TOWNS.flatMap(town => town.trades.map(trade => trade.brief))
    expect(new Set(briefs).size).toBe(briefs.length)
  })

  it('describes the business in its languages, at its second address, and only with live profiles', () => {
    const provider = buildLocalBusinessJsonLd()
    expect(provider.knowsLanguage.map(language => language.name)).toEqual(['English', 'Bengali', 'Hindi'])
    expect(provider.location.address.streetAddress).toBe(business.office)
    expect(provider.location.address.postalCode).toBe(business.officePostalCode)
    // The Maps listing is the only profile recorded in the repository today.
    expect(provider.sameAs).toEqual([business.mapsUrl])
    expect(provider.image.length).toBeGreaterThan(1)
  })

  it('serves real FAQ answers in initial HTML before hydration', () => {
    const html = renderToStaticMarkup(createElement(Accordion, { items: [{ q: 'What is needed?', a: 'A site photo and dimensions.' }] }))
    expect(html).toContain('A site photo and dimensions.')
    expect(html).toContain('<details')
    expect(html).toContain('<summary')
  })

  it('keeps the AI reading aid and assistant aligned with visible business contacts', async () => {
    const response = GET()
    const text = await response.text()
    expect(response.headers.get('content-type')).toContain('text/plain')
    for (const value of [business.email, business.founder, business.office, business.workshop]) {
      expect(text).toContain(value)
      expect(ADJEET_SYSTEM_PROMPT).toContain(value)
    }
    expect(text + ADJEET_SYSTEM_PROMPT).not.toMatch(/info@adjeet|Jeet Kumar Sarkar|500\+ installations|most trusted/i)
    for (const service of services) expect(text).toContain(`${business.url}/services/${service.slug}`)
    // The regional list is now the areas page plus the indexed town pages.
    expect(text).toContain(`(${business.url}/areas)`)
    for (const town of TOWNS) expect(text.includes(`(${business.url}${townPath(town)})`), town.slug).toBe(town.indexable)
    expect(text).not.toMatch(/-in-(siliguri|jalpaiguri|cooch-behar|darjeeling|malda|gangtok)\b/)
  })

  it('gives the AI reading aid a review date, the disambiguating facts and the same comparison as the pages', async () => {
    const text = await GET().text()
    expect(text).toContain(`Last reviewed: ${formatReviewDate(SITE_REVIEWED)}.`)
    expect(text).toMatch(/workshop and office are both in Siliguri, and it was founded in 1990 by Ranjit Das/)
    expect(text).toContain(`## ${COMPARISON_HEADING}`)
    for (const board of COMPARED_BOARDS) {
      expect(text).toContain(`[${board.name}](${business.url}/services/${board.slug})`)
      for (const cell of board.cells) expect(text).toContain(cell)
    }
    // House style, and Microsoft's AI answer guidance: no em dashes.
    expect(text).not.toContain('—')
  })

  it('escapes script-breaking content in structured data', () => {
    const value = { name: '</script><script>alert(1)</script>' }
    expect(jsonLdString(value)).not.toContain('<')
    expect(JSON.parse(jsonLdString(value))).toEqual(value)
  })
})
