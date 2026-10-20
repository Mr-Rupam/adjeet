import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import ServiceDetailPage from '@/app/(marketing)/services/[slug]/page'
import ServicesPage from '@/app/(marketing)/services/page'
import TownPage from '@/app/(marketing)/areas/[town]/page'
import AreasPage from '@/app/(marketing)/areas/page'
import AboutPage from '@/app/(marketing)/about/page'
import ContactPage from '@/app/(marketing)/contact/page'
import { BUSINESS_ID, FOUNDER_ID, WEBSITE_ID, siteConfig } from '@/lib/seo'
import { reviewedOn } from '@/content/page-reviews'
import { COMPARED_SLUGS } from '@/content/sign-comparison'
import { SERVICE_SLUGS } from '@/content/services'
import { TOWNS, townPath } from '@/content/areas'

// Only the structured data and a few visible facts are under test, so the
// interactive islands render nothing.
vi.mock('@/components/sections/LeadForm', () => ({ LeadForm: () => null }))
vi.mock('@/components/PageViewTracker', () => ({ ServicePageTracker: () => null }))
vi.mock('@/components/coverage/CoverageStage', () => ({ CoverageStage: () => null }))
vi.mock('@/components/coverage/CoveragePlaceList', () => ({ CoveragePlaceList: () => null }))

type Node = Record<string, unknown> & { '@type': string; '@id'?: string }

function parse(element: ReactElement) {
  const doc = new DOMParser().parseFromString(renderToStaticMarkup(element), 'text/html')
  const nodes = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent ?? '') as Node)
  return { doc, nodes, byType: (type: string) => nodes.filter(node => node['@type'] === type) }
}

describe('service pages', () => {
  it('describe the page as about its own Service node, dated from the review record', async () => {
    for (const slug of SERVICE_SLUGS) {
      const { doc, byType } = parse(await ServiceDetailPage({ params: Promise.resolve({ slug }) }))
      const [page] = byType('WebPage')
      const [service] = byType('Service')
      expect(page, slug).toMatchObject({
        '@id': `${siteConfig.url}/services/${slug}#webpage`,
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': BUSINESS_ID },
        mainEntity: { '@id': service['@id'] },
        dateModified: reviewedOn(`/services/${slug}`),
      })
      // The printed date and the structured data read the same record.
      expect(doc.querySelector('time')?.getAttribute('datetime'), slug).toBe(page.dateModified)
    }
  }, 30000)

  it('carry the shopfront comparison on exactly the compared boards', async () => {
    for (const slug of SERVICE_SLUGS) {
      const { doc } = parse(await ServiceDetailPage({ params: Promise.resolve({ slug }) }))
      expect(Boolean(doc.querySelector('#sign-compare-heading')), slug).toBe(COMPARED_SLUGS.includes(slug))
    }
  }, 30000)
})

describe('town pages', () => {
  it('describe the page, one Service per trade for the town, the visible FAQs and the breadcrumb', async () => {
    for (const town of TOWNS) {
      const { doc, byType } = parse(await TownPage({ params: Promise.resolve({ town: town.slug }) }))
      const [page] = byType('WebPage')
      expect(page, town.slug).toMatchObject({
        url: siteConfig.url + townPath(town),
        isPartOf: { '@id': WEBSITE_ID },
        about: { '@id': BUSINESS_ID },
        dateModified: reviewedOn(townPath(town)),
      })
      expect(doc.querySelector('time')?.getAttribute('datetime'), town.slug).toBe(page.dateModified)

      const services = byType('Service')
      expect(services.map(service => service.serviceType), town.slug).toHaveLength(town.trades.length)
      for (const service of services) {
        expect(service.provider, town.slug).toEqual({ '@id': BUSINESS_ID })
        expect(service.areaServed, town.slug).toEqual([{ '@type': 'City', name: town.name, containedInPlace: { '@type': 'State', name: town.state } }])
      }

      const [faq] = byType('FAQPage')
      const text = doc.body.textContent ?? ''
      expect((faq.mainEntity as { name: string }[]).map(item => item.name)).toEqual(town.faqs.map(item => item.q))
      for (const item of town.faqs) {
        expect(text, town.slug).toContain(item.q)
        expect(text, town.slug).toContain(item.a)
      }

      const [breadcrumb] = byType('BreadcrumbList')
      expect((breadcrumb.itemListElement as { item: string }[]).map(item => item.item)).toEqual([
        siteConfig.url + '/',
        siteConfig.url + '/areas',
        siteConfig.url + townPath(town),
      ])
    }
  }, 30000)
})

describe('site pages', () => {
  it('types the services page as a collection and shows the comparison there', () => {
    const { doc, byType } = parse(<ServicesPage />)
    expect(byType('CollectionPage')).toHaveLength(1)
    expect(doc.querySelector('#sign-compare-heading')?.textContent).toBe('Glow sign board, ACP board or flex?')
  })

  it('gives the areas page its WebPage, FAQ and breadcrumb nodes', () => {
    const { doc, byType } = parse(<AreasPage />)
    expect(byType('WebPage')[0]).toMatchObject({ url: `${siteConfig.url}/areas`, dateModified: reviewedOn('/areas') })
    const text = doc.body.textContent ?? ''
    for (const item of byType('FAQPage')[0].mainEntity as { name: string; acceptedAnswer: { text: string } }[]) {
      expect(text).toContain(item.name)
      expect(text).toContain(item.acceptedAnswer.text)
    }
    expect(byType('BreadcrumbList')).toHaveLength(1)
  })

  it('gives the About page the founder the business points to', () => {
    const { byType } = parse(<AboutPage />)
    expect(byType('AboutPage')).toHaveLength(1)
    const [founder] = byType('Person')
    expect(founder).toMatchObject({ '@id': FOUNDER_ID, name: 'Ranjit Das', worksFor: { '@id': BUSINESS_ID } })
  })

  it('types the contact page as a ContactPage', () => {
    expect(parse(<ContactPage />).byType('ContactPage')).toHaveLength(1)
  })
})
