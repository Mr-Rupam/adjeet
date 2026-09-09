'use client'

import { useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useReducedMotion } from './ReducedMotionWrapper'
import { createBodyReveal, createMaskedLineReveal, gsap, MOTION, refreshScrollTriggersAfterLayout } from './motion-system'

/** Keeps the interior routes quietly responsive without turning navigation into a showreel. */
export function SiteMotion() {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    const root = document.getElementById('main-content')
    // HomeMotion owns the homepage hooks; this global component owns only
    // interior routes so SplitText never wraps the same heading twice.
    if (!root || pathname === '/' || root.querySelector('[data-home-page]')) return

    const context = gsap.context(() => {
      const media = gsap.matchMedia(root)
      media.add({ all: '(min-width: 0px)', reduce: MOTION.reduceQuery }, match => {
        if (prefersReducedMotion || match.conditions?.reduce) return
        const cleanups = gsap.utils.toArray<HTMLElement>('[data-reveal-text]', root)
          .map(heading => createMaskedLineReveal(heading, { trigger: heading, start: 'top 88%' }))

        // This intentionally targets only route-owned hooks. Portfolio cards
        // retain their Framer Motion transforms and filtering lifecycle. Text
        // hooks have their own line masks, so their ancestors are never moved.
        gsap.utils.toArray<HTMLElement>('[data-site-reveal]', root).forEach(target => {
          createBodyReveal(target, 'top 88%')
        })
        return () => cleanups.forEach(cleanup => cleanup())
      })
      return () => media.revert()
    }, root)

    const cancelRefresh = refreshScrollTriggersAfterLayout()
    return () => {
      cancelRefresh()
      context.revert()
    }
  }, [pathname, prefersReducedMotion])

  return null
}
