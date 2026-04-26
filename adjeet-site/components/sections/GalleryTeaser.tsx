'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getFeaturedPhotos } from '@/content/gallery'
import { Lightbox, type LightboxPhoto } from '@/components/ui/Lightbox'
import { FadeIn } from '@/components/motion/FadeIn'

export function GalleryTeaser() {
  const featured = getFeaturedPhotos().slice(0, 6)
  const lightboxPhotos: LightboxPhoto[] = featured.map(p => ({ src: p.src, alt: p.alt }))
  const [isOpen, setIsOpen] = useState(false)
  const [initialIndex, setInitialIndex] = useState(0)

  function openAt(idx: number) {
    setInitialIndex(idx)
    setIsOpen(true)
  }

  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-content px-6">
        <FadeIn>
          <h2 className="text-center font-bold text-4xl md:text-5xl font-[var(--font-fraunces)] text-ink mb-12">
            Our Work
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((photo, idx) => (
            <button
              key={photo.id}
              onClick={() => openAt(idx)}
              className="relative aspect-[4/3] rounded-lg overflow-hidden bg-rule focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2 group"
              aria-label={`View photo: ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </button>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/portfolio" className="text-sm text-blue hover:underline">
            View all work →
          </Link>
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
