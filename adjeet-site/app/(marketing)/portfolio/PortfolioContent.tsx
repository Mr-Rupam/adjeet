'use client'

import { useState, useMemo, useCallback, useTransition, useEffect } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowUpRight, RotateCcw } from 'lucide-react'
import { photos, clientSlug, getClients } from '@/content/gallery'
import { services } from '@/content/services'
import { Lightbox, type LightboxPhoto } from '@/components/ui/Lightbox'
import { trackPortfolioFilter } from '@/lib/analytics'
import styles from './Portfolio.module.css'

const CLIENTS = getClients()

export function PortfolioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceFilter = searchParams.get('service') ?? 'all'
  const clientFilter = searchParams.get('client') ?? 'all'
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
    (clientFilter === 'all' || clientSlug(p.client) === clientFilter) &&
    (activeView === 'all' || p.featured)
  ), [serviceFilter, clientFilter, activeView])
  const setFilter = useCallback((key: 'service' | 'client', value: string) => {
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
  const hasFilters = serviceFilter !== 'all' || clientFilter !== 'all' || activeView !== 'all'
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
          <div className={styles.filterRow}><p>Brand</p><div role="group" aria-label="Filter work by brand" className={styles.chips}>
            <button type="button" onClick={() => setFilter('client', 'all')} className={chip(clientFilter === 'all')} aria-pressed={clientFilter === 'all'}>All brands</button>
            {CLIENTS.map(client => <button type="button" key={client.slug} onClick={() => setFilter('client', client.slug)} className={chip(clientFilter === client.slug)} aria-pressed={clientFilter === client.slug}>{client.name}</button>)}
          </div></div>
          {hasFilters && <button type="button" onClick={clearFilters} className={styles.clear}><RotateCcw size={14} aria-hidden="true" /> Clear filters</button>}
        </div>
      </section>
      <section className={styles.gallery} aria-label="Project gallery" aria-busy={pending}>
        <div className="field-container">
          {filtered.length === 0 ? <div className={styles.empty}><p className="spec">Try a wider view</p><h2>No projects match<br />the current filters.</h2><p>Not every brand has work in every trade. Reset the filters to see all the work, or contact us about your project.</p><button type="button" onClick={clearFilters} className="cta cta--md">Reset filters</button></div> :
          <div className={styles.grid}>{filtered.map((photo, idx) => <button type="button" key={photo.id} onClick={() => setViewer({ index: idx, photos: filtered.map(p => ({ src: p.src, alt: p.alt })) })} className={styles.project} aria-label={'View: ' + photo.alt}>
            <span className={styles.image} data-site-featured-image={idx === 0 ? '' : undefined}><Image src={photo.src} alt={photo.alt} fill sizes={idx === 0 ? '(max-width: 767px) 100vw, 90vw' : '(max-width: 767px) 50vw, (max-width: 1023px) 45vw, 30vw'} className="object-cover" /><span className={styles.open}><ArrowUpRight size={22} aria-hidden="true" /></span></span>
            <span className={styles.caption}><span><strong>{photo.client}</strong><small>{services.find(s => s.slug === photo.service)?.name}</small></span>{(photo.location || photo.year) && <span className={styles.location}>{photo.location}{photo.location && photo.year && <br />}{photo.year}</span>}</span>
          </button>)}</div>}
        </div>
      </section>
      {viewer && <Lightbox photos={viewer.photos} initialIndex={viewer.index} onClose={() => setViewer(null)} />}
    </>
  )
}
