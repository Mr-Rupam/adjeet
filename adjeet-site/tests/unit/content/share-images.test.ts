// @vitest-environment node
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { SERVICE_SLUGS, getServiceBySlug } from '@/content/services'
import { getServiceCover } from '@/content/gallery'
import { TOWNS } from '@/content/areas'
import { shareImageFor } from '@/content/photo-places'
import { buildPageMetadata, generateServiceMetadata, siteConfig } from '@/lib/seo'
import { PAGE_SHARE_PHOTOS, pageShareFor } from '@/content/page-share'
import { getPhotoById } from '@/content/gallery'
import sharp from 'sharp'

const exists = (url: string) => fs.existsSync(path.resolve('public' + url))

describe('link preview images', () => {
  it('gives every service with photographs its own lead photo as og:image, as a JPEG that exists', () => {
    for (const slug of SERVICE_SLUGS) {
      const cover = getServiceCover(slug)
      const metadata = generateServiceMetadata(getServiceBySlug(slug)!, cover ? shareImageFor(cover) : undefined)
      const [image] = metadata.openGraph!.images as { url: string }[]
      if (cover) {
        expect(image.url, slug).toBe(shareImageFor(cover).url)
        expect(image.url, slug).toMatch(/^\/images\/share\/.+\.jpg$/)
      } else {
        expect(image.url, slug).toBe(siteConfig.ogImage)
      }
      expect(exists(image.url), `${slug}: ${image.url} is missing; run scripts/build-share-images.mjs`).toBe(true)
    }
  })

  it('gives every town page one of its own photographs, as a JPEG that exists', () => {
    for (const town of TOWNS) {
      const cover = town.photos.find(photo => photo.id === town.coverPhotoId)
      expect(cover, `${town.slug} cover must be one of its own photographs`).toBeDefined()
      expect(exists(shareImageFor(cover!).url), town.slug).toBe(true)
    }
  })

  // Technical audit T9 and T14: the site pages had one 738 x 386 image between them.
  it('gives each site page its own 1200 x 630 card, cropped from a real gallery photo', async () => {
    const urls = new Set<string>()
    for (const [pagePath, id] of Object.entries(PAGE_SHARE_PHOTOS)) {
      const photo = getPhotoById(id)
      const metadata = buildPageMetadata({ title: 'T', description: 'D', path: pagePath })
      const [image] = metadata.openGraph!.images as { url: string; alt: string; width: number; height: number }[]
      expect(image, pagePath).toEqual({ url: `/images/share/${path.basename(photo.src, '.webp')}-wide.jpg`, alt: photo.alt, width: 1200, height: 630 })
      expect(exists(image.url), `${pagePath}: run scripts/build-share-images.mjs --wide ${photo.src}`).toBe(true)
      const { width, height } = await sharp(path.resolve('public' + image.url)).metadata()
      expect({ width, height }, pagePath).toEqual({ width: 1200, height: 630 })
      // A crop, never an enlargement: the source photo is at least as large.
      const source = await sharp(path.resolve('public' + photo.src)).metadata()
      expect(source.width! >= 1200 && source.height! >= 630, pagePath).toBe(true)
      urls.add(image.url)
    }
    expect(urls.size).toBe(Object.keys(PAGE_SHARE_PHOTOS).length)
    expect(siteConfig.ogImage).toBe(pageShareFor('/')!.url)
  })

  it('falls back to the site image and keeps a page indexable unless told otherwise', () => {
    const plain = buildPageMetadata({ title: 'T', description: 'D', path: '/x' })
    expect((plain.openGraph!.images as { url: string }[])[0].url).toBe(siteConfig.ogImage)
    expect(plain.robots).toBeUndefined()
    const held = buildPageMetadata({ title: 'T', description: 'D', path: '/x', indexable: false })
    expect(held.robots).toEqual({ index: false, follow: true })
  })
})
