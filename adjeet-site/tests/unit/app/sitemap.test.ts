import { describe, it, expect } from 'vitest'
import sitemap from '@/app/sitemap'
import { SERVICE_SLUGS } from '@/content/services'
import { TOWNS, townPath } from '@/content/areas'
import { LEGACY_REGIONAL_REDIRECTS } from '@/content/legacy-regional'
import { getPhotosByService, photos } from '@/content/gallery'
import { reviewedOn } from '@/content/page-reviews'
import { siteConfig } from '@/lib/seo'

const entries = sitemap()
const urls = entries.map(entry => entry.url)
const entryFor = (path: string) => entries.find(entry => entry.url === siteConfig.url + path)!

describe('sitemap', () => {
  it('includes every service, including useful pages without photographs', () => {
    for (const slug of SERVICE_SLUGS) {
      expect(urls).toContain(`${siteConfig.url}/services/${slug}`)
    }
  })
  it('includes the areas page and only the town pages that passed their quality gate', () => {
    expect(urls).toContain(`${siteConfig.url}/areas`)
    for (const town of TOWNS) {
      expect(urls.includes(siteConfig.url + townPath(town)), town.slug).toBe(town.indexable)
    }
    // Gangtok has one documented job, below the plan's two, so it waits.
    expect(urls).not.toContain(`${siteConfig.url}/areas/gangtok`)
  })
  it('never lists a retired regional URL, which now redirects', () => {
    for (const { source } of LEGACY_REGIONAL_REDIRECTS) expect(urls).not.toContain(siteConfig.url + source)
  })
  it('includes the core marketing pages', () => {
    for (const path of ['', '/services', '/portfolio', '/about', '/contact']) expect(urls).toContain(siteConfig.url + path)
  })
  it('excludes the noindex privacy page and optional machine-readable aid', () => {
    expect(urls).not.toContain(siteConfig.url + '/privacy')
    expect(urls).not.toContain(siteConfig.url + '/llms.txt')
  })
  it('has no duplicate URLs and uses the canonical host', () => {
    expect(new Set(urls).size).toBe(urls.length)
    for (const url of urls) expect(new URL(url).origin).toBe(siteConfig.url)
  })
  it('scales with the content inventory', () => {
    expect(entries).toHaveLength(5 + SERVICE_SLUGS.length + 1 + TOWNS.filter(town => town.indexable).length)
    // 18 today; scripts/search-audit.mjs asserts the same count against a build.
    expect(entries).toHaveLength(18)
  })
  // The IndexNow job submits the pages whose lastmod moved, so it must be each
  // page's own review date, never the build or deployment date.
  it("dates each page from its content review, not the deployment", () => {
    for (const entry of entries) {
      const path = new URL(entry.url).pathname
      expect(entry.lastModified, entry.url).toEqual(new Date(reviewedOn(path)))
    }
  })

  describe('image entries', () => {
    it('lists every project photograph once on the portfolio, which shows them all', () => {
      const images = entryFor('/portfolio').images!
      expect(images).toHaveLength(new Set(photos.map(photo => photo.src)).size)
      for (const photo of photos) expect(images).toContain(siteConfig.url + photo.src)
    })

    it("lists each service page's own photographs", () => {
      for (const slug of SERVICE_SLUGS) {
        const expected = getPhotosByService(slug).map(photo => siteConfig.url + photo.src)
        expect(entryFor(`/services/${slug}`).images ?? [], slug).toEqual([...new Set(expected)])
      }
    })

    // A town page shows only the photos recorded in that town, so its entry
    // lists exactly those, never the trade's work from elsewhere.
    it('lists under a town page only the photos recorded in that town', () => {
      for (const town of TOWNS.filter(candidate => candidate.indexable)) {
        const images = entryFor(townPath(town)).images ?? []
        expect(images.length, town.slug).toBeGreaterThan(0)
        expect(images, town.slug).toEqual([...new Set(town.photos.map(photo => siteConfig.url + photo.src))])
        for (const photo of town.photos) expect(photo.city, photo.id).toBe(town.slug)
      }
      expect(entryFor('/areas').images).toBeUndefined()
    })

    it('uses absolute image URLs on the canonical host', () => {
      for (const image of entries.flatMap(entry => entry.images ?? [])) {
        expect(new URL(image).origin).toBe(siteConfig.url)
        expect(image).toMatch(/\.(webp|png|jpe?g)$/)
      }
    })
  })
})
