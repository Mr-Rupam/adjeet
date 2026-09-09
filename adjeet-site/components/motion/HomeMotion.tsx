'use client'

import { useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './ReducedMotionWrapper'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Small, one-time entrances for the home-page story. The hero film owns the
 * theme change; this only gives the copy and the following sections a clear
 * reading order without adding scroll-jacking or perpetual motion.
 */
export function HomeMotion() {
  const prefersReducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    if (prefersReducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.querySelector<HTMLElement>('[data-home-page]')
    if (!root) return

    const context = gsap.context(() => {
      const select = gsap.utils.selector(root)
      const hero = gsap.timeline({ defaults: { ease: 'power3.out' } })

      hero
        .from(select('[data-hero-meta]'), { opacity: 0, y: 8, duration: 0.3 })
        .from(select('[data-hero-title]'), { opacity: 0, y: 14, duration: 0.48 }, '-=0.2')
        .from(select('[data-hero-lead]'), { opacity: 0, y: 10, duration: 0.34 }, '-=0.25')
        .from(select('[data-hero-actions]'), { opacity: 0, y: 8, duration: 0.32 }, '-=0.2')
        .from(select('[data-hero-caption]'), { opacity: 0, duration: 0.24 }, '-=0.16')

      gsap.utils.toArray<HTMLElement>(select('[data-home-reveal]')).forEach(target => {
        gsap.from(target, {
          opacity: 0,
          y: 20,
          duration: 0.62,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: target,
            start: 'top 86%',
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
  }, [prefersReducedMotion])

  return null
}
