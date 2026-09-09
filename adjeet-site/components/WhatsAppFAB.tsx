'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { QuoteCTA } from '@/components/ui/QuoteCTA'

/**
 * A single mobile enquiry dock. It appears only after the home hero leaves
 * view and stays off the contact page, where the form and direct methods are
 * already in reach. This avoids competing mobile floating actions.
 */
export function WhatsAppFAB() {
  const pathname = usePathname()
  const [heroState, setHeroState] = useState({ path: '/', isVisible: true })
  const [enquiryState, setEnquiryState] = useState({ path: '/', isVisible: false })
  const isHome = pathname === '/'
  const heroIsVisible = heroState.path === pathname ? heroState.isVisible : true

  useEffect(() => {
    if (!isHome) return

    const hero = document.getElementById('hero-section')
    if (!hero) return

    const observer = new IntersectionObserver(
      ([entry]) => setHeroState({ path: pathname, isVisible: entry.isIntersecting }),
      { threshold: 0 },
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [isHome, pathname])

  useEffect(() => {
    const visibleTargets = new Set<Element>()
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleTargets.add(entry.target)
        else visibleTargets.delete(entry.target)
      }
      setEnquiryState({ path: pathname, isVisible: visibleTargets.size > 0 })
    })
    document.querySelectorAll('main .cta, .site-footer').forEach(target => observer.observe(target))
    return () => observer.disconnect()
  }, [pathname])

  const enquiryIsVisible = enquiryState.path === pathname && enquiryState.isVisible
  const visible = pathname !== '/contact' && (!isHome || !heroIsVisible) && !enquiryIsVisible
  if (!visible) return null

  return (
    <div className="quote-dock" style={{ bottom: 'calc(0.85rem + var(--consent-h, 0px))' }}>
      <QuoteCTA source="mobile-dock" tone="yellow" label="WhatsApp your project" className="quote-dock__cta" />
    </div>
  )
}
