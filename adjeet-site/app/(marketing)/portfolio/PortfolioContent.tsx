'use client'

import { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { photos } from '@/content/gallery'
import { services, type ServiceSlug } from '@/content/services'
import { CITY_SLUGS, type CitySlug } from '@/content/cities'
import { Lightbox, type LightboxPhoto } from '@/components/ui/Lightbox'
import { trackPortfolioFilter } from '@/lib/analytics'

const CITY_LABELS: Record<CitySlug, string> = {
  siliguri: 'Siliguri',
  jalpaiguri: 'Jalpaiguri',
  'cooch-behar': 'Cooch Behar',
  darjeeling: 'Darjeeling',
  malda: 'Malda',
}

const SERVICE_SHORT: Partial<Record<ServiceSlug, string>> = {
  'glow-sign-boards': 'Glow Sign',
  'acp-led-signage': 'ACP/LED',
  'flex-printing': 'Flex',
  'vehicle-branding': 'Vehicle',
  'f-pole-installation': 'F-Pole',
  'in-shop-branding': 'In-Shop',
  'events-and-puja': 'Events',
  'wall-painting': 'Wall Paint',
  'one-way-vision': 'One-Way',
  'product-display': 'Display',
}

// Masonry layout sizes: alternate between tall/wide/square
function getCardClass(index: number): string {
  const pattern = index % 6
  switch (pattern) {
    case 0: return 'sm:col-span-2 sm:row-span-2' // large feature
    case 1: return 'sm:col-span-1 sm:row-span-1' // standard
    case 2: return 'sm:col-span-1 sm:row-span-2' // tall
    case 3: return 'sm:col-span-1 sm:row-span-1' // standard
    case 4: return 'sm:col-span-2 sm:row-span-1' // wide
    case 5: return 'sm:col-span-1 sm:row-span-1' // standard
    default: return ''
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
}

export function PortfolioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceFilter = (searchParams.get('service') ?? 'all') as ServiceSlug | 'all'
  const cityFilter = (searchParams.get('city') ?? 'all') as CitySlug | 'all'

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [activeView, setActiveView] = useState<'all' | 'featured'>('all')

  const filtered = useMemo(() => {
    let result = photos.filter(p => {
      if (serviceFilter !== 'all' && p.service !== serviceFilter) return false
      if (cityFilter !== 'all' && p.city !== cityFilter) return false
      return true
    })
    if (activeView === 'featured') result = result.filter(p => p.featured)
    return result
  }, [serviceFilter, cityFilter, activeView])

  const lightboxPhotos: LightboxPhoto[] = filtered.map(p => ({ src: p.src, alt: p.alt }))

  const setFilter = useCallback(
    (key: 'service' | 'city', value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'all') params.delete(key)
      else params.set(key, value)
      router.push(`/portfolio?${params.toString()}`, { scroll: false })
      if (value !== 'all') trackPortfolioFilter({ filter_type: key, filter_value: value })
    },
    [searchParams, router],
  )

  function openAt(idx: number) {
    setLightboxIndex(idx)
    setLightboxOpen(true)
  }

  const chip = (active: boolean) =>
    `spec flex-shrink-0 border-2 px-3 py-2 transition-all ${
      active
        ? 'border-ink bg-ink text-paper'
        : 'border-ink/25 text-ink-muted hover:border-ink hover:text-ink'
    }`

  return (
    <>
      {/* ═══════ FILTER BAR: the job docket ═══════ */}
      <section className="sticky top-16 z-30 border-b-2 border-ink bg-paper/95 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-content px-5 md:px-8">
          {/* Top row: view toggles + count */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveView('all')} className={chip(activeView === 'all')}>
                All work
              </button>
              <button
                onClick={() => setActiveView('featured')}
                className={chip(activeView === 'featured')}
              >
                Featured
              </button>
            </div>

            <div className="flex items-center gap-4">
              <span className="spec text-ink-subtle">
                {filtered.length} project{filtered.length !== 1 ? 's' : ''}
              </span>
              {(serviceFilter !== 'all' || cityFilter !== 'all') && (
                <button
                  onClick={() => router.push('/portfolio', { scroll: false })}
                  className="spec text-signal transition-opacity hover:opacity-70"
                >
                  Clear ×
                </button>
              )}
            </div>
          </div>

          {/* Service filters */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
            <button onClick={() => setFilter('service', 'all')} className={chip(serviceFilter === 'all')}>
              All trades
            </button>
            {services.map(s => (
              <button
                key={s.slug}
                onClick={() => setFilter('service', s.slug)}
                className={chip(serviceFilter === s.slug)}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* City filters */}
          <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
            <button onClick={() => setFilter('city', 'all')} className={chip(cityFilter === 'all')}>
              All cities
            </button>
            {CITY_SLUGS.map(city => (
              <button
                key={city}
                onClick={() => setFilter('city', city)}
                className={chip(cityFilter === city)}
              >
                {CITY_LABELS[city]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ GALLERY GRID ═══════ */}
      <section className="border-b-2 border-ink bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-content px-5 md:px-8">
          {filtered.length === 0 ? (
            <div className="py-32 text-center">
              <span className="display block text-6xl text-rule">∅</span>
              <p className="spec mt-4 text-ink-muted">No projects match the current filters.</p>
              <button
                onClick={() => router.push('/portfolio', { scroll: false })}
                className="spec mt-6 border-2 border-ink px-5 py-3 text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <motion.div
              className="grid auto-rows-[200px] grid-cols-1 gap-4 sm:auto-rows-[240px] sm:grid-cols-3"
              layout
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((photo, idx) => (
                  <motion.button
                    key={photo.id}
                    custom={idx}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    onClick={() => openAt(idx)}
                    className={`group relative overflow-hidden border-2 border-ink bg-rule transition-shadow hover:shadow-[6px_6px_0_0_var(--signal)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${getCardClass(idx)}`}
                    aria-label={`View: ${photo.alt}`}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                    />

                    {/* Hover scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Job number */}
                    <div className="absolute left-3 top-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="spec text-white/60">
                        Job {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Service tag */}
                    <div className="absolute right-3 top-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="spec border border-white/25 bg-black/40 px-2 py-1 text-white/80 backdrop-blur-sm">
                        {SERVICE_SHORT[photo.service] ?? photo.service}
                      </span>
                    </div>

                    {/* Bottom info */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 text-left opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-white">
                        {photo.alt}
                      </p>
                      <p className="spec mt-1.5 text-white/50">
                        {CITY_LABELS[photo.city]} · {photo.year}
                      </p>
                    </div>

                    {/* Featured pip */}
                    {photo.featured && (
                      <span
                        aria-hidden="true"
                        className="absolute left-3 top-3 h-2.5 w-2.5 bg-signal shadow-[0_0_10px_2px_rgba(70,175,230,0.7)] transition-opacity group-hover:opacity-0"
                      />
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </motion.div>
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
