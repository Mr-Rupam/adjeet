import type { MetadataRoute } from 'next'
import { SERVICE_SLUGS } from '@/content/services'
import { getProgrammaticSlugs, getProgrammaticPage } from '@/content/programmatic'
import { hasPhotos } from '@/lib/publication'
import { siteConfig } from '@/lib/seo'

/**
 * Derived, not hand-listed.
 *
 * This file used to enumerate five URLs by hand while the build produced 48
 * pages, so the 10 service pages and all 25 programmatic city-service landing
 * pages, the entire long-tail play that content/programmatic.ts exists for,
 * were never announced to Google. Anything added to content/ now appears here
 * automatically.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url

  // A fixed date, not new Date(). Stamping every URL with build time tells
  // crawlers the whole site changed on every deploy, which is both false and a
  // weak freshness signal: it trains them to ignore lastModified here.
  const lastModified = new Date(CONTENT_LAST_REVIEWED)

  const staticPages: MetadataRoute.Sitemap = (
    [
      { url: base, changeFrequency: 'monthly', priority: 1 },
      { url: `${base}/services`, changeFrequency: 'monthly', priority: 0.9 },
      { url: `${base}/portfolio`, changeFrequency: 'monthly', priority: 0.8 },
      { url: `${base}/about`, changeFrequency: 'yearly', priority: 0.5 },
      { url: `${base}/contact`, changeFrequency: 'yearly', priority: 0.7 },
      { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.1 },
    ] satisfies Omit<MetadataRoute.Sitemap[number], 'lastModified'>[]
  ).map(entry => ({ ...entry, lastModified }))

  // Only pages that are actually ready to rank. A trade with no photograph is
  // held back (lib/publication) and announcing it here would contradict its
  // own noindex. It rejoins the sitemap automatically once it has an image.
  const servicePages: MetadataRoute.Sitemap = SERVICE_SLUGS.filter(hasPhotos).map(slug => ({
    url: `${base}/services/${slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // The city-service landing pages. These are the pages built to rank for
  // "glow sign board in <city>", so they carry real priority, not filler.
  const programmaticPages: MetadataRoute.Sitemap = getProgrammaticSlugs()
    .filter(slug => {
      const page = getProgrammaticPage(slug)
      return page ? hasPhotos(page.service) : false
    })
    .map(slug => ({
      url: `${base}/${slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

  return [...staticPages, ...servicePages, ...programmaticPages]
}

/**
 * Bump when page content is meaningfully revised. Kept as an explicit constant
 * so lastModified means "the content changed" rather than "a deploy happened".
 */
const CONTENT_LAST_REVIEWED = '2026-09-04'
