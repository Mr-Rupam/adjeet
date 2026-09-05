import { describe, it, expect } from 'vitest'
import sitemap from '@/app/sitemap'
import { SERVICE_SLUGS } from '@/content/services'
import { getProgrammaticSlugs } from '@/content/programmatic'
import { siteConfig } from '@/lib/seo'

const entries = sitemap()
const urls = entries.map(e => e.url)

describe('sitemap', () => {
  // The regression this guards: the sitemap was hand-listed with 5 URLs while
  // the build emitted 48 pages, so every city-service landing page was
  // invisible to search engines.
  it('includes every service detail page', () => {
    for (const slug of SERVICE_SLUGS) {
      expect(urls, `missing /services/${slug}`).toContain(`${siteConfig.url}/services/${slug}`)
    }
  })

  it('includes every programmatic city-service landing page', () => {
    const slugs = getProgrammaticSlugs()
    expect(slugs.length).toBeGreaterThan(0)
    for (const slug of slugs) {
      expect(urls, `missing /${slug}`).toContain(`${siteConfig.url}/${slug}`)
    }
  })

  it('includes the core marketing pages', () => {
    for (const path of ['', '/services', '/portfolio', '/about', '/contact']) {
      expect(urls).toContain(`${siteConfig.url}${path}`)
    }
  })

  it('has no duplicate URLs', () => {
    expect(new Set(urls).size).toBe(urls.length)
  })

  it('every URL is absolute and on the canonical host', () => {
    for (const url of urls) expect(url.startsWith(`${siteConfig.url}/`) || url === siteConfig.url).toBe(true)
  })

  it('scales with content rather than being hand-maintained', () => {
    const expected = 6 + SERVICE_SLUGS.length + getProgrammaticSlugs().length
    expect(entries).toHaveLength(expected)
  })

  it('does not stamp every URL with build time', () => {
    // All entries share one deliberate review date; a new Date() default would
    // make these differ from a fixed reference and drift on every deploy.
    const stamps = new Set(entries.map(e => String(e.lastModified)))
    expect(stamps.size).toBe(1)
  })
})
