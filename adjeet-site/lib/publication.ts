import { photos } from '@/content/gallery'
import type { ServiceSlug } from '@/content/services'

/**
 * Which pages are ready to be found in search, and which are still waiting on
 * photography.
 *
 * A signage company sells a visual product. A service page with no photograph
 * of that service is thin, and 25 near-identical city pages with no images
 * read to a search engine as doorway content, which can drag down the whole
 * domain rather than just failing to rank on their own.
 *
 * So pages without a photograph are held back from search: `noindex, follow`
 * and left out of the sitemap. They stay fully reachable, because they still
 * carry real specs, FAQs and a WhatsApp CTA, and because they are linked from
 * /services. This hides them from Google, not from people.
 *
 * TO MAKE A PAGE LIVE: add a photograph for its service to content/gallery.ts.
 * Nothing else. The gate is derived from the photo set, so a page publishes
 * itself the moment it has an image, and tests/unit/lib/publication.test.ts
 * records which services are currently held back.
 */

/** Services with at least one real photograph shipped in public/. */
const SERVICES_WITH_PHOTOS: ReadonlySet<string> = new Set(photos.map(p => p.service))

export function hasPhotos(service: ServiceSlug | string): boolean {
  return SERVICES_WITH_PHOTOS.has(service)
}

/** True when a page for this service should be kept out of search for now. */
export function isAwaitingPhotos(service: ServiceSlug | string): boolean {
  return !hasPhotos(service)
}

/**
 * Metadata fragment for a page held back from search.
 *
 * `follow` stays true so link equity still flows to /services and the
 * conversion pages; it is the thin page itself we do not want indexed.
 */
export const AWAITING_PHOTOS_ROBOTS = {
  robots: { index: false, follow: true },
} as const
