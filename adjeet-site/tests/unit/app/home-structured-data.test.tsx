import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import HomePage from '@/app/(marketing)/page'
import { reviewedOn } from '@/content/page-reviews'
import { buildWebSiteJsonLd } from '@/lib/seo'
import fs from 'node:fs'
import path from 'node:path'

// The view is the whole interactive homepage; only the structured data the
// route renders around it is under test here.
vi.mock('@/components/home/HomePageView', () => ({ HomePageView: () => null }))

function structuredData(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent ?? ''))
}

describe('home page structured data', () => {
  // Google reads the site name from the home page and wants one WebSite node
  // there. The root layout emits it on every page, so the route adds none.
  it('leaves the site name to the root layout, so home carries exactly one', () => {
    const sites = structuredData(renderToStaticMarkup(<HomePage />)).filter(schema => schema['@type'] === 'WebSite')
    expect(sites).toHaveLength(0)
    const layout = fs.readFileSync(path.resolve('app/layout.tsx'), 'utf8')
    expect(layout.match(/buildWebSiteJsonLd\(\)/g)).toHaveLength(1)
    expect(buildWebSiteJsonLd()).toMatchObject({ name: 'AD JEET', url: 'https://adjeet.in/' })
  })

  it('describes the home page itself: part of the site, about the business, dated from the review record', () => {
    const pages = structuredData(renderToStaticMarkup(<HomePage />)).filter(schema => schema['@type'] === 'WebPage')
    expect(pages).toHaveLength(1)
    expect(pages[0]).toMatchObject({
      url: 'https://adjeet.in',
      isPartOf: { '@id': 'https://adjeet.in/#website' },
      about: { '@id': 'https://adjeet.in/#business' },
      dateModified: reviewedOn('/'),
    })
  })
})
