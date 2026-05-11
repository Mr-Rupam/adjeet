'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getFeaturedPhotos } from '@/content/gallery'
import { Lightbox, type LightboxPhoto } from '@/components/ui/Lightbox'

export function SelectedWork() {
  const featured = getFeaturedPhotos().slice(0, 4)
  const lightboxPhotos: LightboxPhoto[] = featured.map(p => ({ src: p.src, alt: p.alt }))
  const [isOpen, setIsOpen] = useState(false)
  const [idx, setIdx] = useState(0)

  const [hero, ...supporting] = featured

  function open(i: number) {
    setIdx(i)
    setIsOpen(true)
  }

  return (
    <section style={{ borderBottom: '1px solid var(--rule)' }}>
      {/* Section label bar */}
      <div
        className="mx-auto max-w-content px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--rule)' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.14em',
            color: 'var(--ink-subtle)',
            textTransform: 'uppercase',
          }}
        >
          № 03 — Selected Work
        </span>
        <Link
          href="/portfolio"
          className="hover:text-blue transition-colors"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: 'var(--ink-subtle)',
          }}
        >
          Full portfolio →
        </Link>
      </div>

      {/* Image grid */}
      <div className="mx-auto max-w-content px-6 py-8 md:py-12">
        <div className="flex gap-1.5 h-[55vw] sm:h-[42vw] md:h-[38vw] max-h-[560px]">

          {/* Hero photo — left, large */}
          <button
            onClick={() => open(0)}
            className="group relative flex-[3] overflow-hidden bg-paper-elevated focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2 shadow-sm hover:shadow-md transition-shadow duration-300"
            aria-label={hero ? `View: ${hero.alt}` : 'Gallery image 1'}
            style={{ borderRadius: '4px' }}
          >
            {hero ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={hero.src}
                alt={hero.alt}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] group-hover:brightness-95 transition-all duration-700"
              />
            ) : (
              <PlaceholderBox label="01" />
            )}
          </button>

          {/* Supporting photos — right column */}
          <div className="flex flex-col gap-1.5 flex-[2]">
            {[0, 1, 2].map(i => {
              const photo = supporting[i]
              return (
                <button
                  key={i}
                  onClick={() => open(i + 1)}
                  className="group relative flex-1 overflow-hidden bg-paper-elevated focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2 shadow-sm hover:shadow-md transition-shadow duration-300"
                  aria-label={photo ? `View: ${photo.alt}` : `Gallery image ${i + 2}`}
                  style={{ borderRadius: '4px' }}
                >
                  {photo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] group-hover:brightness-95 transition-all duration-700"
                    />
                  ) : (
                    <PlaceholderBox label={`0${i + 2}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Museum caption */}
        {hero && (
          <div
            className="mt-4 flex items-center gap-3"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10.5px',
              letterSpacing: '0.1em',
              color: 'var(--ink-subtle)',
              textTransform: 'uppercase',
            }}
          >
            <span>{hero.service.replace(/-/g, ' ')}</span>
            <span aria-hidden="true" style={{ color: 'var(--rule)' }}>·</span>
            <span>{hero.city}</span>
            <span aria-hidden="true" style={{ color: 'var(--rule)' }}>·</span>
            <span>{hero.year}</span>
          </div>
        )}
      </div>

      {isOpen && (
        <Lightbox
          photos={lightboxPhotos}
          initialIndex={idx}
          onClose={() => setIsOpen(false)}
        />
      )}
    </section>
  )
}

function PlaceholderBox({ label }: { label: string }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: 'var(--rule)' }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.12em',
          color: 'var(--ink-subtle)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  )
}
