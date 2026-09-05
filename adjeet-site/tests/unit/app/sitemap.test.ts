import { describe, it, expect } from 'vitest'
import sitemap from '@/app/sitemap'
import { SERVICE_SLUGS } from '@/content/services'
import { getProgrammaticSlugs, getProgrammaticPage } from '@/content/programmatic'
import { hasPhotos } from '@/lib/publication'
import { siteConfig } from '@/lib/seo'

const entries = sitemap()
const urls = entries.map(e => e.url)

describe('sitemap', () => {
  // The regression this guards: the sitemap was hand-listed with 5 URLs while
  // the build emitted 48 pages, so every city-service landing page was
  // invisible to search engines.
  it('includes every service detail page that has photographs', () => {
    const live = SERVICE_SLUGS.filter(hasPhotos)
    expect(live.length).toBeGreaterThan(0)
    for (const slug of live) {
      expect(urls, `missing /services/${slug}`).toContain(`${siteConfig.url}/services/${slug}`)
    }
  })

  it('includes every programmatic landing page whose trade has photographs', () => {
    const slugs = getProgrammaticSlugs()
    expect(slugs.length).toBeGreaterThan(0)
    const live = slugs.filter(s => {
      const page = getProgrammaticPage(s)
      return page ? hasPhotos(page.service) : false
    })
    expect(live.length).toBeGreaterThan(0)
    for (const slug of live) {
      expect(urls, `missing /${slug}`).toContain(`${siteConfig.url}/${slug}`)
    }
  })

  // The point of the gate: a page with no photograph must not be announced to
  // Google, because its own metadata says noindex. Announcing it would be a
  // contradiction, and 25 imageless near-identical city pages read as doorway
  // content. These rejoin the sitemap automatically once a photo lands.
  it('omits every page still awaiting photography', () => {
    for (const slug of SERVICE_SLUGS.filter(s => !hasPhotos(s))) {
      expect(urls, `/services/${slug} should be held back`).not.toContain(`${siteConfig.url}/services/${slug}`)
    }
    for (const slug of getProgrammaticSlugs()) {
      const page = getProgrammaticPage(slug)
      if (page && !hasPhotos(page.service)) {
        expect(urls, `/${slug} should be held back`).not.toContain(`${siteConfig.url}/${slug}`)
      }
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
    const liveServices = SERVICE_SLUGS.filter(hasPhotos).length
    const liveProgrammatic = getProgrammaticSlugs().filter(s => {
      const page = getProgrammaticPage(s)
      return page ? hasPhotos(page.service) : false
    }).length
    expect(entries).toHaveLength(6 + liveServices + liveProgrammatic)
  })

  it('does not stamp every URL with build time', () => {
    // All entries share one deliberate review date; a new Date() default would
    // make these differ from a fixed reference and drift on every deploy.
    const stamps = new Set(entries.map(e => String(e.lastModified)))
    expect(stamps.size).toBe(1)
  })
})
