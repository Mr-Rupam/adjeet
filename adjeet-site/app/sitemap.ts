import type { MetadataRoute } from 'next'
import { SERVICE_SLUGS } from '@/content/services'
import { getProgrammaticSlugs } from '@/content/programmatic'
import { siteConfig } from '@/lib/seo'

// Updated for the content and search review, not for each deployment.
const CONTENT_LAST_REVIEWED = '2026-09-15'

export default function sitemap(): MetadataRoute.Sitemap {
  // Privacy is deliberately noindex and must not be advertised in the sitemap.
  const paths = [
    '', '/services', '/portfolio', '/about', '/contact',
    ...SERVICE_SLUGS.map(slug => `/services/${slug}`),
    ...getProgrammaticSlugs().map(slug => `/${slug}`),
  ]
  return paths.map(path => ({
    url: siteConfig.url + path,
    lastModified: new Date(CONTENT_LAST_REVIEWED),
  }))
}
