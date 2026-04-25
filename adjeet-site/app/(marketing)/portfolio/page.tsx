'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { photos } from '@/content/gallery'
import { services, type ServiceSlug } from '@/content/services'
import { CITY_SLUGS, type CitySlug } from '@/content/cities'
import { Lightbox, type LightboxPhoto } from '@/components/ui/Lightbox'
import { FadeIn } from '@/components/motion/FadeIn'
import { trackPortfolioFilter } from '@/lib/analytics'

const CITY_LABELS: Record<CitySlug, string> = {
  siliguri: 'Siliguri',
  jalpaiguri: 'Jalpaiguri',
  'cooch-behar': 'Cooch Behar',
  darjeeling: 'Darjeeling',
  malda: 'Malda',
}

export default function PortfolioPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceFilter = (searchParams.get('service') ?? 'all') as ServiceSlug | 'all'
  const cityFilter = (searchParams.get('city') ?? 'all') as CitySlug | 'all'

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const filtered = useMemo(() => {
    return photos.filter(p => {
      if (serviceFilter !== 'all' && p.service !== serviceFilter) return false
      if (cityFilter !== 'all' && p.city !== cityFilter) return false
      return true
    })
  }, [serviceFilter, cityFilter])

  const lightboxPhotos: LightboxPhoto[] = filtered.map(p => ({ src: p.src, alt: p.alt }))

  function setFilter(key: 'service' | 'city', value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') params.delete(key)
    else params.set(key, value)
    router.push(`/portfolio?${params.toString()}`, { scroll: false })
    if (value !== 'all') trackPortfolioFilter({ filter_type: key, filter_value: value })
  }

  function openAt(idx: number) {
    setLightboxIndex(idx)
    setLightboxOpen(true)
  }

  return (
    <>
      {/* Hero */}
      <section className="flex items-end min-h-[40vh] bg-ink py-16">
        <div className="mx-auto max-w-content px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">
            Our Work
          </p>
          <h1 className="text-[var(--text-display-2)] font-[var(--font-fraunces)] font-bold text-white mb-4">
            Portfolio
          </h1>
          <p className="text-white/70 max-w-xl">
            Installation photos from across North Bengal — Siliguri, Jalpaiguri, Cooch Behar, Darjeeling, and Malda.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-30 bg-paper border-b border-rule py-3">
        <div className="mx-auto max-w-content px-6 flex flex-wrap gap-3 items-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-subtle mr-2">Filter:</span>

          {/* Service filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('service', 'all')}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${serviceFilter === 'all' ? 'bg-blue text-white border-blue' : 'border-rule text-ink-muted hover:border-blue hover:text-blue'}`}
            >
              All services
            </button>
            {services.map(s => (
              <button
                key={s.slug}
                onClick={() => setFilter('service', s.slug)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${serviceFilter === s.slug ? 'bg-blue text-white border-blue' : 'border-rule text-ink-muted hover:border-blue hover:text-blue'}`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <span className="text-rule mx-1 hidden sm:inline">|</span>

          {/* City filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('city', 'all')}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${cityFilter === 'all' ? 'bg-ochre text-white border-ochre' : 'border-rule text-ink-muted hover:border-ochre hover:text-ochre'}`}
            >
              All cities
            </button>
            {CITY_SLUGS.map(city => (
              <button
                key={city}
                onClick={() => setFilter('city', city)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${cityFilter === city ? 'bg-ochre text-white border-ochre' : 'border-rule text-ink-muted hover:border-ochre hover:text-ochre'}`}
              >
                {CITY_LABELS[city]}
              </button>
            ))}
          </div>

          <span className="ml-auto text-xs text-ink-subtle">{filtered.length} photo{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </section>

      {/* Grid */}
      <section className="py-[var(--section-py)]">
        <div className="mx-auto max-w-content px-6">
          {filtered.length === 0 ? (
            <FadeIn>
              <p className="text-center text-ink-muted py-24">No photos match the selected filters.</p>
            </FadeIn>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => openAt(idx)}
                  className="relative aspect-[3/2] rounded-lg overflow-hidden bg-rule group focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2"
                  aria-label={`View photo: ${photo.alt}`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs font-medium truncate">{photo.alt}</p>
                    <p className="text-white/60 text-xs">{CITY_LABELS[photo.city]} · {photo.year}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightboxOpen && (
        <Lightbox
          photos={lightboxPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
