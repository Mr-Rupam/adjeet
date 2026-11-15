'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { LeadFormProps } from '@/components/sections/LeadForm'
import styles from './DeferredLeadForm.module.css'

/**
 * The lead form for pages where it sits at the very bottom: every service page,
 * /areas and the town pages. Its code (validation, the CAPTCHA loader, the
 * receipt) loads and hydrates only when a visitor scrolls within reach of it,
 * or tabs into its spot, instead of on every page view. /contact, where the
 * form is the point of the page, keeps importing LeadForm directly.
 *
 * Until then a block of the form's height holds the place, so nothing moves
 * when the form arrives, and it carries a link to /contact for anyone without
 * JavaScript. The prefill props pass straight through, and LeadForm still reads
 * `?city=` when they are absent, because it reads the URL when it mounts.
 */
const LeadForm = dynamic(
  () => import('@/components/sections/LeadForm').then(module => module.LeadForm),
  { ssr: false, loading: () => <Placeholder /> },
)

function Placeholder({ city }: { city?: string }) {
  const href = city ? `/contact?city=${encodeURIComponent(city)}` : '/contact'
  return (
    <div className={styles.placeholder} data-lead-form-placeholder>
      <a href={href} className="field-link">Open the enquiry form ↗</a>
    </div>
  )
}

export function DeferredLeadForm({ defaultCity, defaultService }: LeadFormProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    if (near) return
    const spot = ref.current
    if (!spot) return
    if (typeof IntersectionObserver === 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNear(true)
      return
    }
    const observer = new IntersectionObserver(
      entries => { if (entries.some(entry => entry.isIntersecting)) setNear(true) },
      { rootMargin: '900px 0px' },
    )
    observer.observe(spot)
    const onFocus = () => setNear(true)
    spot.addEventListener('focusin', onFocus)
    return () => {
      observer.disconnect()
      spot.removeEventListener('focusin', onFocus)
    }
  }, [near])

  return (
    <div ref={ref} data-lead-form-slot>
      {near
        ? <LeadForm defaultCity={defaultCity} defaultService={defaultService} />
        : <Placeholder city={defaultCity} />}
    </div>
  )
}
