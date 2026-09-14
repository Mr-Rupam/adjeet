'use client'

import { useState, useMemo, useCallback, useTransition, useEffect } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowUpRight, RotateCcw } from 'lucide-react'
import { photos } from '@/content/gallery'
import { services, type ServiceSlug } from '@/content/services'
import { CITY_SLUGS, type CitySlug } from '@/content/cities'
import { Lightbox, type LightboxPhoto } from '@/components/ui/Lightbox'
import { trackPortfolioFilter } from '@/lib/analytics'
import styles from './Portfolio.module.css'

const CITY_LABELS: Record<CitySlug, string> = {
  siliguri: 'Siliguri', jalpaiguri: 'Jalpaiguri', 'cooch-behar': 'Cooch Behar', darjeeling: 'Darjeeling', malda: 'Malda',
}
const CLIENT_LABELS: Record<string, string> = { 'gs-acc': 'ACC', 'acp-ambuja': 'Ambuja Cement', 'vb-srmb': 'SRMB', 'gs-airtel': 'Airtel', 'gs-gates': 'Anchor by Panasonic' }

export function PortfolioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceFilter = searchParams.get('service') ?? 'all'
  const cityFilter = searchParams.get('city') ?? 'all'
  const [viewer, setViewer] = useState<{ photos: LightboxPhoto[]; index: number } | null>(null)
  const [activeView, setActiveView] = useState<'all' | 'featured'>('all')
  const [pending, startTransition] = useTransition()
  useEffect(() => {
    const closeOnHistory = () => setViewer(null)
    window.addEventListener('popstate', closeOnHistory)
    return () => window.removeEventListener('popstate', closeOnHistory)
  }, [])
  const filtered = useMemo(() => photos.filter(p =>
    (serviceFilter === 'all' || p.service === serviceFilter) &&
    (cityFilter === 'all' || p.city === cityFilter) &&
    (activeView === 'all' || p.featured)
  ), [serviceFilter, cityFilter, activeView])
  const setFilter = useCallback((key: 'service' | 'city', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') params.delete(key)
    else params.set(key, value)
    startTransition(() => router.push('/portfolio' + (params.size ? '?' + params.toString() : ''), { scroll: false }))
    if (value !== 'all') trackPortfolioFilter({ filter_type: key, filter_value: value })
  }, [searchParams, router])
  const clearFilters = () => {
    setActiveView('all')
    startTransition(() => router.push('/portfolio', { scroll: false }))
  }
  const hasFilters = serviceFilter !== 'all' || cityFilter !== 'all' || activeView !== 'all'
  const chip = (active: boolean) => styles.chip + (active ? ' ' + styles.active : '')

  return (
    <>
      <section className={styles.filters} aria-label="Project filters">
        <div className="field-container">
          <div className={styles.filterTop}>
            <div className={styles.viewTabs}><button type="button" onClick={() => setActiveView('all')} className={chip(activeView === 'all')} aria-pressed={activeView === 'all'}>All work</button><button type="button" onClick={() => setActiveView('featured')} className={chip(activeView === 'featured')} aria-pressed={activeView === 'featured'}>Featured</button></div>
            <span className={styles.count} role="status" aria-live="polite">{pending ? 'Updating…' : filtered.length + ' project' + (filtered.length !== 1 ? 's' : '')}</span>
          </div>
          <div className={styles.filterRow}><p>Trade</p><div role="group" aria-label="Filter work by trade" className={styles.chips}>
            <button type="button" onClick={() => setFilter('service', 'all')} className={chip(serviceFilter === 'all')} aria-pressed={serviceFilter === 'all'}>All trades</button>
            {services.map(s => <button type="button" key={s.slug} onClick={() => setFilter('service', s.slug)} className={chip(serviceFilter === s.slug)} aria-pressed={serviceFilter === s.slug}>{s.name}</button>)}
          </div></div>
          <div className={styles.filterRow}><p>City</p><div role="group" aria-label="Filter work by city" className={styles.chips}>
            <button type="button" onClick={() => setFilter('city', 'all')} className={chip(cityFilter === 'all')} aria-pressed={cityFilter === 'all'}>All cities</button>
            {CITY_SLUGS.map(city => <button type="button" key={city} onClick={() => setFilter('city', city)} className={chip(cityFilter === city)} aria-pressed={cityFilter === city}>{CITY_LABELS[city]}</button>)}
          </div></div>
          {hasFilters && <button type="button" onClick={clearFilters} className={styles.clear}><RotateCcw size={14} aria-hidden="true" /> Clear filters</button>}
        </div>
      </section>
      <section className={styles.gallery} aria-label="Project gallery" aria-busy={pending}>
        <div className="field-container">
          {filtered.length === 0 ? <div className={styles.empty}><p className="spec">Try a wider view</p><h2>No projects match<br />the current filters.</h2><p>Our published selection is small. Reset the filters to see all the work, or contact us about your project.</p><button type="button" onClick={clearFilters} className="cta cta--md">Reset filters</button></div> :
          <div className={styles.grid}>{filtered.map((photo, idx) => <button type="button" key={photo.id} onClick={() => setViewer({ index: idx, photos: filtered.map(p => ({ src: p.src, alt: p.alt })) })} className={styles.project} aria-label={'View: ' + photo.alt}>
            <span className={styles.image}><Image src={photo.src} alt={photo.alt} fill sizes={idx === 0 ? '(max-width: 767px) 100vw, 90vw' : '(max-width: 767px) 100vw, 45vw'} className="object-cover" /><span className={styles.open}><ArrowUpRight size={22} aria-hidden="true" /></span></span>
            <span className={styles.caption}><span><strong>{CLIENT_LABELS[photo.id] ?? services.find(s => s.slug === photo.service as ServiceSlug)?.name}</strong><small>{services.find(s => s.slug === photo.service)?.name}</small></span><span className={styles.location}>{CITY_LABELS[photo.city]}<br />{photo.year}</span></span>
          </button>)}</div>}
        </div>
      </section>
      {viewer && <Lightbox photos={viewer.photos} initialIndex={viewer.index} onClose={() => setViewer(null)} />}
    </>
  )
}
