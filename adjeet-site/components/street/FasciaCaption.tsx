import type { GalleryPhoto } from '@/content/gallery'
import { getServiceBySlug } from '@/content/services'
import { photoPlace } from '@/content/photo-places'

interface FasciaCaptionProps {
  photo: GalleryPhoto
  /** `figcaption` under a figure, `span` inside a button or link. */
  as?: 'figcaption' | 'span'
  size?: 'sm' | 'md'
  className?: string
}

/**
 * The fascia plate a finished job is captioned on (DESIGN.md "Signature
 * devices"): the brand in display capitals, then the trade and only the place
 * and year the gallery records. Never a guessed place.
 */
export function FasciaCaption({ photo, as = 'figcaption', size = 'md', className = '' }: FasciaCaptionProps) {
  const Tag = as
  const detail = [getServiceBySlug(photo.service)?.name, photoPlace(photo), photo.year ? String(photo.year) : undefined]
    .filter(Boolean)
    .join(' · ')
  return (
    <Tag className={`fascia-plate${size === 'sm' ? ' fascia-plate--sm' : ''} ${className}`.trim()}>
      <strong>{photo.client}</strong>
      {detail && <span>{detail}</span>}
    </Tag>
  )
}
