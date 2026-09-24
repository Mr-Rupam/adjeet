'use client'

import { useLayoutEffect, useRef } from 'react'
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
  const previousPathname = useRef(pathname)

  // After a route change, before anything refreshes ScrollTrigger. This
  // component renders after <main> in the root layout, so this runs once the
  // new page has mounted and Next has put the scroll where it belongs.
  // ScrollTrigger has not caught up: refresh() records the scroll position and
  // scrolls back to it when it finishes, and straight after a route change that
  // record can be the previous page's. HomeMotion's matchMedia records it in a
  // layout effect, before Next resets the scroll, and GSAP 3.15's cached scroll
  // value survives exactly one scroll event, which is all Next's reset makes.
  // Every route into /portfolio (no ScrollTriggers of its own to re-read the
  // scroll) and /portfolio to the homepage opened at the old page's position.
  // So forget the recorded positions and hand ScrollTrigger the real one. Not
  // on first mount: there is no previous page, and in GSAP's first 500ms the
  // setter would also switch the browser's scroll restoration to manual.
  useLayoutEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname
    ScrollTrigger.clearScrollMemory()
    ScrollTrigger.getScrollFunc(window)(window.scrollY)
  }, [pathname])

  useLayoutEffect(() => {
    if (prefersReducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.getElementById('main-content')
    if (!root) return

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-site-reveal]', root).forEach(target => {
        if (target.dataset.siteReveal === 'media') {
          gsap.from(target, {
            clipPath: 'inset(100% 0 0 0)',
            duration: 1.05,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: target,
              start: 'top 88%',
              once: true,
            },
            onComplete: () => gsap.set(target, { clearProps: 'clipPath' }),
          })
          return
        }
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
