import type { MetadataRoute } from 'next'
import { SERVICE_SLUGS } from '@/content/services'
import { TOWNS, townPath } from '@/content/areas'
import { getPhotosByService, photos, type GalleryPhoto } from '@/content/gallery'
import { reviewedOn } from '@/content/page-reviews'
import { siteConfig } from '@/lib/seo'

/**
 * Project photographs listed per page, so image search can find the gallery.
 * Each page lists only photos it actually shows, which is how Google ties a
 * photo to its page. The portfolio shows every photo, so the home page, whose
 * six are picked in its components, needs no list of its own.
 *
 * A town page shows only photographs recorded in that town, so the same list
 * is the honest one to give it here.
 */
function imageUrls(list: GalleryPhoto[]): string[] {
  return [...new Set(list.map(photo => siteConfig.url + photo.src))]
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Only indexable canonical URLs. Privacy is noindex, the retired regional
  // URLs redirect, and a town page below its quality gate is noindex until it
  // qualifies, so none of them are advertised here.
  const pages: { path: string; images?: string[] }[] = [
    { path: '' },
    { path: '/services' },
    { path: '/portfolio', images: imageUrls(photos) },
    { path: '/about' },
    { path: '/contact' },
    ...SERVICE_SLUGS.map(slug => ({ path: `/services/${slug}`, images: imageUrls(getPhotosByService(slug)) })),
    { path: '/areas' },
    ...TOWNS.filter(town => town.indexable).map(town => ({ path: townPath(town), images: imageUrls(town.photos) })),
  ]
  return pages.map(({ path, images }) => ({
    url: siteConfig.url + path,
    // The review date for that page's content, not the deployment date.
    lastModified: new Date(reviewedOn(path || '/')),
    ...(images && images.length > 0 ? { images } : {}),
  }))
}
