import type { GalleryPhoto } from '@/content/gallery'
import { getServiceBySlug } from '@/content/services'
import type { ProjectReference } from '@/lib/whatsapp'

/**
 * The public reference for a gallery photo: its id, the brand on the sign and
 * the trade, with the place only when the gallery records one. Nothing here is
 * inferred, so the message a buyer sends never claims more than the photo does.
 */
export function photoReference(photo: Pick<GalleryPhoto, 'id' | 'client' | 'service' | 'location'>, label?: string): ProjectReference {
  const trade = getServiceBySlug(photo.service)?.name ?? ''
  const place = photo.location?.trim()
  return {
    id: photo.id,
    client: photo.client,
    label: label ?? (place ? `${trade}, ${place}` : trade),
  }
}
