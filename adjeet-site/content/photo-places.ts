import { CITY_NAMES } from '@/content/cities'
import type { GalleryPhoto } from '@/content/gallery'

/**
 * Where a photograph was taken, in words, from what the gallery records.
 *
 * `location` is the place read from the photo or its record ("Khagrabari") and
 * `city` is set only when the town is confirmed. When both exist and differ,
 * both are shown, so a neighbourhood is never presented as a town of its own.
 * Undefined when nothing is recorded: a caption must never guess a place.
 */
export function photoPlace(photo: GalleryPhoto): string | undefined {
  const city = photo.city ? CITY_NAMES[photo.city] : undefined
  if (photo.location && city && photo.location !== city) return `${photo.location}, ${city}`
  return photo.location ?? city
}

/** "Captain TMT Bar · Jiranpur, Cooch Behar · 2023", with only the parts that are recorded. */
export function photoCaption(photo: GalleryPhoto): string {
  return [photo.client, photoPlace(photo), photo.year ? String(photo.year) : undefined]
    .filter(Boolean)
    .join(' · ')
}

/**
 * The JPEG copy of a project photo used as a page's link preview image.
 *
 * Link previews on some apps do not render WebP, so the photos that pages use as
 * their `og:image` have JPEG copies in `public/images/share/`, made by
 * `scripts/build-share-images.mjs` at the photo's own size or smaller, never
 * cropped or retouched. `tests/unit/content/share-images.test.ts` checks every
 * copy a page asks for exists.
 */
export function shareImageFor(photo: GalleryPhoto): { url: string; alt: string } {
  const name = photo.src.replace(/^\/images\/work\//, '').replace(/\.webp$/, '')
  return { url: `/images/share/${name}.jpg`, alt: photo.alt }
}
