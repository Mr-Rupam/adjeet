'use client'

import { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { photos, type GalleryPhoto } from '@/content/gallery'
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

// Masonry layout sizes — alternate between tall/wide/square
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

  return (
    <>
      {/* ═══════ FILTER BAR — Sleek, floating ═══════ */}
      <section className="sticky top-16 z-30 backdrop-blur-xl bg-paper/80 border-b border-rule py-4">
        <div className="mx-auto max-w-content px-6">
          {/* Top row — view toggles + count */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-paper-elevated border border-rule">
              <button
                onClick={() => setActiveView('all')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeView === 'all'
                    ? 'bg-blue text-white shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                All Work
              </button>
              <button
                onClick={() => setActiveView('featured')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeView === 'featured'
                    ? 'bg-blue text-white shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Featured
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-[var(--font-mono)] text-xs text-ink-subtle">
                {filtered.length} project{filtered.length !== 1 ? 's' : ''}
              </span>
              {(serviceFilter !== 'all' || cityFilter !== 'all') && (
                <button
                  onClick={() => {
                    router.push('/portfolio', { scroll: false })
                  }}
                  className="text-[10px] font-[var(--font-mono)] uppercase tracking-wider text-blue hover:text-blue-deep transition-colors"
                >
                  Clear filters ×
                </button>
              )}
            </div>
          </div>

          {/* Service filters */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => setFilter('service', 'all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                serviceFilter === 'all'
                  ? 'bg-ink text-paper border-ink'
                  : 'border-rule text-ink-muted hover:border-ink hover:text-ink'
              }`}
            >
              All
            </button>
            {services.map(s => (
              <button
                key={s.slug}
                onClick={() => setFilter('service', s.slug)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  serviceFilter === s.slug
                    ? 'bg-blue text-white border-blue'
                    : 'border-rule text-ink-muted hover:border-blue hover:text-blue'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* City filters */}
          <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilter('city', 'all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                cityFilter === 'all'
                  ? 'bg-ink text-paper border-ink'
                  : 'border-rule text-ink-muted hover:border-ink hover:text-ink'
              }`}
            >
              All cities
            </button>
            {CITY_SLUGS.map(city => (
              <button
                key={city}
                onClick={() => setFilter('city', city)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  cityFilter === city
                    ? 'bg-ochre text-white border-ochre'
                    : 'border-rule text-ink-muted hover:border-ochre hover:text-ochre'
                }`}
              >
                {CITY_LABELS[city]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ GALLERY GRID — Masonry-style ═══════ */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-content px-6">
          {filtered.length === 0 ? (
            <div className="py-32 text-center">
              <span className="block text-6xl mb-4 opacity-30">∅</span>
              <p className="text-ink-muted text-sm font-[var(--font-mono)]">
                No projects match the current filters.
              </p>
              <button
                onClick={() => router.push('/portfolio', { scroll: false })}
                className="mt-4 text-blue text-sm hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 auto-rows-[200px] sm:auto-rows-[220px]"
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
                    className={`relative rounded-xl overflow-hidden bg-rule group focus-visible:outline-2 focus-visible:outline-blue focus-visible:outline-offset-2 ${getCardClass(idx)}`}
                    aria-label={`View: ${photo.alt}`}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      className="object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                    />

                    {/* Hover overlay — editorial info card */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Top-left: project number */}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <span className="font-[var(--font-mono)] text-[10px] text-white/50 tracking-wider">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Top-right: service tag */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <span className="px-2 py-0.5 rounded bg-white/10 backdrop-blur-sm text-[10px] font-[var(--font-mono)] text-white/70 uppercase tracking-wider">
                        {SERVICE_SHORT[photo.service] ?? photo.service}
                      </span>
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <p className="text-white text-sm font-medium leading-snug mb-1 line-clamp-2">
                        {photo.alt}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-white/40 text-[10px] font-[var(--font-mono)] uppercase tracking-wider">
                          {CITY_LABELS[photo.city]}
                        </span>
                        <span className="text-white/20">·</span>
                        <span className="text-white/40 text-[10px] font-[var(--font-mono)]">
                          {photo.year}
                        </span>
                      </div>
                    </div>

                    {/* Featured indicator */}
                    {photo.featured && (
                      <div className="absolute top-3 left-3 group-hover:opacity-0 transition-opacity">
                        <div className="w-2 h-2 rounded-full bg-[var(--adjeet-blue)] shadow-[0_0_8px_rgba(30,127,184,0.6)]" />
                      </div>
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
