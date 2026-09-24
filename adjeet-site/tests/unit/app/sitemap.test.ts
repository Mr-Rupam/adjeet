import { describe, it, expect } from 'vitest'
import sitemap from '@/app/sitemap'
import { SERVICE_SLUGS } from '@/content/services'
import { getProgrammaticSlugs, programmaticPages } from '@/content/programmatic'
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
  it('includes the reviewed regional guides', () => {
    for (const slug of getProgrammaticSlugs()) expect(urls).toContain(`${siteConfig.url}/${slug}`)
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
    expect(entries).toHaveLength(5 + SERVICE_SLUGS.length + getProgrammaticSlugs().length)
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

    // A regional page without local photos shows the trade's work from other
    // towns; listing those under it would tie them to a town they were not taken in.
    it('lists under a regional page only the photos taken in that town', () => {
      for (const page of programmaticPages) {
        const here = getPhotosByService(page.service).filter(photo => photo.city === page.city).map(photo => siteConfig.url + photo.src)
        expect(entryFor('/' + page.slug).images ?? [], page.slug).toEqual([...new Set(here)])
      }
      expect(programmaticPages.some(page => (entryFor('/' + page.slug).images ?? []).length > 0)).toBe(true)
    })

    it('uses absolute image URLs on the canonical host', () => {
      for (const image of entries.flatMap(entry => entry.images ?? [])) {
        expect(new URL(image).origin).toBe(siteConfig.url)
        expect(image).toMatch(/\.(webp|png|jpe?g)$/)
      }
    })
  })
})
