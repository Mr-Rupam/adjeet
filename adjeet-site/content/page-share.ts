import { getPhotoById } from '@/content/gallery'
import { pageShareImage } from '@/content/photo-places'

/**
 * The gallery photograph behind each site page's 1200 x 630 link preview.
 * Service and town pages use their own lead photo instead (`shareImageFor`).
 *
 * Every photo here is at least 1200 x 630, so its card is a crop, never an
 * enlargement. After changing one, run
 * `node scripts/build-share-images.mjs --wide /images/work/<file>.webp`.
 */
export const PAGE_SHARE_PHOTOS: Record<string, string> = {
  // A lit shopfront in Siliguri; also the site-wide default.
  '/': 'tanyamakeovers-154',
  '/services': 'anchor-by-panasonic-112',
  '/portfolio': 'captain-tmt-bar-075',
  '/about': 'airtel-008',
  '/contact': 'anchor-by-panasonic-106',
  '/areas': 'star-cement-135',
  '/for-brands': 'star-cement-132',
}

export function pageShareFor(path: string) {
  const id = PAGE_SHARE_PHOTOS[path]
  return id ? pageShareImage(getPhotoById(id)) : undefined
}

/** The preview for any page without a photo of its own. */
export const DEFAULT_PAGE_SHARE = pageShareImage(getPhotoById(PAGE_SHARE_PHOTOS['/']))
