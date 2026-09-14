import { photos } from '@/content/gallery'
import type { ServiceSlug } from '@/content/services'

// Media availability is useful for presentation, but is not an indexing rule.
// Service and regional pages provide text, specifications, FAQs and enquiries
// independently of the available project photography.
const SERVICES_WITH_PHOTOS: ReadonlySet<string> = new Set(photos.map(photo => photo.service))

export function hasPhotos(service: ServiceSlug | string): boolean {
  return SERVICES_WITH_PHOTOS.has(service)
}

export function isAwaitingPhotos(service: ServiceSlug | string): boolean {
  return !hasPhotos(service)
}
