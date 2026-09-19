import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import HomePage from '@/app/(marketing)/page'

// The view is the whole interactive homepage; only the structured data the
// route renders around it is under test here.
vi.mock('@/components/home/HomePageView', () => ({ HomePageView: () => null }))

function structuredData(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return [...doc.querySelectorAll('script[type="application/ld+json"]')].map(node => JSON.parse(node.textContent ?? ''))
}

describe('home page structured data', () => {
  // Google reads the site name from the home page only, and wants one WebSite node there.
  it('gives Google exactly one site name', () => {
    const sites = structuredData(renderToStaticMarkup(<HomePage />)).filter(schema => schema['@type'] === 'WebSite')
    expect(sites).toHaveLength(1)
    expect(sites[0]).toMatchObject({ name: 'AD JEET', url: 'https://adjeet.in/' })
  })
})
