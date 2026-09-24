import type { MetadataRoute } from 'next'
import { SERVICE_SLUGS, type ServiceSlug } from '@/content/services'
import { programmaticPages } from '@/content/programmatic'
import { getPhotosByService, photos, type GalleryPhoto } from '@/content/gallery'
import { reviewedOn } from '@/content/page-reviews'
import { siteConfig } from '@/lib/seo'

/**
 * Project photographs listed per page, so image search can find the gallery.
 * Each page lists only photos it actually shows, which is how Google ties a
 * photo to its page. The portfolio shows every photo, so the home page, whose
 * six are picked in its components, needs no list of its own.
 *
 * A regional page lists only the photos taken in its own town. When it has
 * none it shows the trade's work from elsewhere, and listing those again under
 * 27 town pages would tie each photo to places it was not taken.
 */
function photosTakenIn(service: ServiceSlug, city: string): GalleryPhoto[] {
  return getPhotosByService(service).filter(photo => photo.city === city)
}

function imageUrls(list: GalleryPhoto[]): string[] {
  return [...new Set(list.map(photo => siteConfig.url + photo.src))]
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Privacy is deliberately noindex and must not be advertised in the sitemap.
  const pages: { path: string; images?: string[] }[] = [
    { path: '' },
    { path: '/services' },
    { path: '/portfolio', images: imageUrls(photos) },
    { path: '/about' },
    { path: '/contact' },
    ...SERVICE_SLUGS.map(slug => ({ path: `/services/${slug}`, images: imageUrls(getPhotosByService(slug)) })),
    ...programmaticPages.map(page => ({ path: `/${page.slug}`, images: imageUrls(photosTakenIn(page.service, page.city)) })),
  ]
  return pages.map(({ path, images }) => ({
    url: siteConfig.url + path,
    // The review date for that page's content, not the deployment date.
    lastModified: new Date(reviewedOn(path || '/')),
    ...(images && images.length > 0 ? { images } : {}),
  }))
}
