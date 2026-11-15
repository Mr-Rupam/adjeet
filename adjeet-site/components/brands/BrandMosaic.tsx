import { LoadingImage as Image } from '@/components/ui/LoadingImage'
import type { GalleryPhoto } from '@/content/gallery'
import { getServiceBySlug } from '@/content/services'
import { photoPlace } from '@/content/photo-places'
import styles from './Brands.module.css'

/**
 * The opening mosaic: real brand jobs, one per trade, tight together. The
 * first is the lead tile and the only image preloaded. Each carries a small
 * fascia plate with what the gallery records and nothing more.
 */
export function BrandMosaic({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <ul className={styles.mosaic} aria-label="Brand work, photographed on site">
      {photos.map((photo, index) => {
        // Small tiles: the brand and the trade only. The lead tile adds the place where the gallery records one.
        const detail = [getServiceBySlug(photo.service)?.name, index === 0 ? photoPlace(photo) : undefined].filter(Boolean).join(' · ')
        return (
          <li key={photo.id} className={index === 0 ? styles.mosaicLead : undefined}>
            <figure className={styles.mosaicFigure}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                preload={index === 0}
                sizes={index === 0
                  ? '(max-width: 767px) calc(100vw - 44px), (max-width: 1023px) 60vw, 560px'
                  : '(max-width: 767px) 50vw, (max-width: 1023px) 30vw, 280px'}
                className={styles.mosaicImage}
              />
              <figcaption className={`fascia-plate fascia-plate--sm ${styles.mosaicPlate}`}>
                <strong>{photo.client}</strong>
                {detail && <span>{detail}</span>}
              </figcaption>
            </figure>
          </li>
        )
      })}
    </ul>
  )
}
