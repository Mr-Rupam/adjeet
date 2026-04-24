'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Lightbox, type LightboxPhoto } from '@/components/ui/Lightbox'
import type { GalleryPhoto } from '@/content/gallery'

interface GalleryStripProps {
  photos: GalleryPhoto[]
}

export function GalleryStrip({ photos }: GalleryStripProps) {
  const lightboxPhotos: LightboxPhoto[] = photos.map(p => ({ src: p.src, alt: p.alt }))
  const [isOpen, setIsOpen] = useState(false)
  const [initialIndex, setInitialIndex] = useState(0)

  function openAt(idx: number) {
    setInitialIndex(idx)
    setIsOpen(true)
  }

  return (
    <section className="py-12 border-t border-rule">
      <div className="mx-auto max-w-content px-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-ink-subtle mb-6">
          Project Gallery
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
          {photos.map((photo, idx) => (
            <button
              key={photo.id}
              onClick={() => openAt(idx)}
              className="relative shrink-0 w-64 aspect-[4/3] rounded-lg overflow-hidden bg-rule snap-start focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2 group"
              aria-label={`View photo: ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="256px"
              />
            </button>
          ))}
        </div>
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
