import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { services } from '@/content/services'
import { programmaticPages, CITY_LABELS } from '@/content/programmatic'
import { business } from '@/lib/business'
import { ADJEET_SYSTEM_PROMPT } from '@/lib/chatbot-prompt'
import { generateServiceMetadata, buildServiceJsonLd, buildLocalBusinessJsonLd, jsonLdString } from '@/lib/seo'
import { Accordion } from '@/components/ui/Accordion'
import { GET } from '@/app/llms.txt/route'

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

  it('connects regional services to the same real business rather than creating local branches', () => {
    const provider = buildLocalBusinessJsonLd()
    for (const page of programmaticPages) {
      const service = services.find(service => service.slug === page.service)!
      const schema = buildServiceJsonLd(service, { city: CITY_LABELS[page.city], path: '/' + page.slug, description: page.body })
      expect(schema.provider['@id']).toBe(provider['@id'])
      expect(schema.areaServed).toEqual([CITY_LABELS[page.city]])
      expect(schema.url).toBe(business.url + '/' + page.slug)
      expect(schema.description).toBe(page.body)
      expect(page.localBrief).toBeTruthy()
    }
    expect(new Set(programmaticPages.map(page => page.localBrief)).size).toBe(programmaticPages.length)
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
  })

  it('escapes script-breaking content in structured data', () => {
    const value = { name: '</script><script>alert(1)</script>' }
    expect(jsonLdString(value)).not.toContain('<')
    expect(JSON.parse(jsonLdString(value))).toEqual(value)
  })
})
