import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import ServiceDetailPage from '@/app/(marketing)/services/[slug]/page'
import ServicesPage from '@/app/(marketing)/services/page'
import ProgrammaticPage from '@/app/(programmatic)/[slug]/page'
import AboutPage from '@/app/(marketing)/about/page'
import ContactPage from '@/app/(marketing)/contact/page'
import { BUSINESS_ID, FOUNDER_ID, WEBSITE_ID, siteConfig } from '@/lib/seo'
import { reviewedOn } from '@/content/page-reviews'
import { COMPARED_SLUGS } from '@/content/sign-comparison'
import { SERVICE_SLUGS } from '@/content/services'
import { programmaticPages } from '@/content/programmatic'

// Only the structured data and a few visible facts are under test, so the
// interactive islands render nothing.
vi.mock('@/components/sections/LeadForm', () => ({ LeadForm: () => null }))
vi.mock('@/components/PageViewTracker', () => ({ ServicePageTracker: () => null, ProgrammaticPageTracker: () => null }))
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

describe('regional pages', () => {
  it('describe the page as about the local Service node and show the review date', async () => {
    for (const regional of programmaticPages) {
      const { doc, byType } = parse(await ProgrammaticPage({ params: Promise.resolve({ slug: regional.slug }) }))
      const [page] = byType('WebPage')
      const [service] = byType('Service')
      expect(page.mainEntity, regional.slug).toEqual({ '@id': service['@id'] })
      expect(page.url).toBe(`${siteConfig.url}/${regional.slug}`)
      expect(doc.querySelector('time')?.getAttribute('datetime')).toBe(reviewedOn('/' + regional.slug))
    }
  }, 30000)
})

describe('site pages', () => {
  it('types the services page as a collection and shows the comparison there', () => {
    const { doc, byType } = parse(<ServicesPage />)
    expect(byType('CollectionPage')).toHaveLength(1)
    expect(doc.querySelector('#sign-compare-heading')?.textContent).toBe('Glow sign board, ACP board or flex?')
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
