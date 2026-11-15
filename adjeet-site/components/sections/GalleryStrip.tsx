'use client'

import { useState } from 'react'
import { LoadingImage as Image } from '@/components/ui/LoadingImage'
import Link from 'next/link'
import { Lightbox, type LightboxPhoto } from '@/components/ui/Lightbox'
import type { GalleryPhoto } from '@/content/gallery'
import { photoReference } from '@/lib/project-reference'
import { ArrowUpRight } from 'lucide-react'
import { FasciaCaption } from '@/components/street/FasciaCaption'

interface GalleryStripProps {
  photos: GalleryPhoto[]
  title?: string
  link?: { href: string; label: string }
  /**
   * Where this work was photographed, when it was not photographed where the
   * page says. Only 8 of the gallery's photos record a city, so a regional
   * page usually shows the trade's work from somewhere else. The heading says
   * so, but a visitor scanning images reads pictures, not headings. Plain text
   * in the section, never a tooltip.
   */
  note?: string
}

export function GalleryStrip({ photos, title = 'Project gallery', link, note }: GalleryStripProps) {
  const lightboxPhotos: LightboxPhoto[] = photos.map(p => ({ src: p.src, alt: p.alt, reference: photoReference(p) }))
  const [isOpen, setIsOpen] = useState(false)
  const [initialIndex, setInitialIndex] = useState(0)

  function openAt(idx: number) {
    setInitialIndex(idx)
    setIsOpen(true)
  }

  return (
    // The night surface: lit work sits on the street after dark, as on the homepage.
    <section className="gallery-strip">
      <div className="field-container">
        <div className="gallery-strip__head">
          <h2>{title}</h2>
          {link && <Link href={link.href} className="gallery-strip__link">{link.label} <ArrowUpRight size={17} aria-hidden="true" /></Link>}
        </div>
        <ul className="gallery-strip__list">
          {photos.map((photo, idx) => (
            <li key={photo.id}>
              <button
                type="button"
                onClick={() => openAt(idx)}
                className="gallery-strip__photo group"
                aria-label={`View photo: ${photo.alt}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="288px"
                />
              </button>
              {/* The brand, the trade, and the place and year only where the gallery records them. */}
              <FasciaCaption photo={photo} as="span" size="sm" />
            </li>
          ))}
        </ul>
        {note && <p className="gallery-strip__note">{note}</p>}
        {isOpen && (
          <Lightbox
            photos={lightboxPhotos}
            initialIndex={initialIndex}
            onClose={() => setIsOpen(false)}
          />
        )}
      </div>
    </section>
  )
}
