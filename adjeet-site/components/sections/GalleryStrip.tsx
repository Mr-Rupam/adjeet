'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Lightbox, type LightboxPhoto } from '@/components/ui/Lightbox'
import type { GalleryPhoto } from '@/content/gallery'

interface GalleryStripProps {
  photos: GalleryPhoto[]
  title?: string
  link?: { href: string; label: string }
}

export function GalleryStrip({ photos, title = 'Project gallery', link }: GalleryStripProps) {
  const lightboxPhotos: LightboxPhoto[] = photos.map(p => ({ src: p.src, alt: p.alt }))
  const [isOpen, setIsOpen] = useState(false)
  const [initialIndex, setInitialIndex] = useState(0)

  function openAt(idx: number) {
    setInitialIndex(idx)
    setIsOpen(true)
  }

  return (
    <section className="border-b-2 border-ink bg-paper py-12 md:py-16">
      <div className="mx-auto max-w-content px-5 md:px-8">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="spec m-0 text-signal">{title}</h2>
          {link && <Link href={link.href} className="field-link">{link.label} ↗</Link>}
        </div>
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {photos.map((photo, idx) => (
            <button
              key={photo.id}
              onClick={() => openAt(idx)}
              className="group relative aspect-[4/3] w-64 shrink-0 snap-start overflow-hidden border-2 border-ink bg-rule transition-shadow hover:shadow-[6px_6px_0_0_var(--signal)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
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
