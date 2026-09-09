'use client'

import { useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './ReducedMotionWrapper'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/** Keeps the interior routes quietly responsive without turning navigation into a showreel. */
export function SiteMotion() {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    if (prefersReducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.getElementById('main-content')
    if (!root) return

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-site-reveal]', root).forEach(target => {
        gsap.from(target, {
          opacity: 0,
          y: target.dataset.siteReveal === 'title' ? 16 : 12,
          duration: target.dataset.siteReveal === 'title' ? 0.58 : 0.46,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: target,
            start: 'top 88%',
            once: true,
          },
        })
      })
    }, root)

    const refreshId = window.requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      window.cancelAnimationFrame(refreshId)
      context.revert()
    }
  }, [pathname, prefersReducedMotion])

  return null
}
