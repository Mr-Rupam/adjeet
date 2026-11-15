'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useReducedMotion } from './ReducedMotionWrapper'
import {
  EASE, MOTION, createEnterWatcher, holdFrom, maskedLineReveal, motionIsReduced,
  revealOnEnter, staggerOnEnter, type Reveal,
} from './motion-system'
import styles from './SiteMotion.module.css'

/**
 * Entrances and scroll reveals for every page, with no animation library: see
 * motion-system.ts. GSAP and ScrollTrigger used to run here on every page.
 *
 * The route-change scroll fix that lived here (pages opening at the previous
 * page's scroll position, TODOS.md) existed because ScrollTrigger's refresh
 * restored a stale scroll value after Next had reset it. Nothing here records
 * or restores scroll any more, so there is nothing left to go stale;
 * `tests/e2e/navigation-footer.spec.ts` still guards the behaviour.
 */
function useDesktop() {
  // Read during the first client render: it only steers effects, never markup.
  const [desktop, setDesktop] = useState<boolean | null>(() =>
    typeof window === 'undefined' ? null : window.matchMedia(MOTION.desktopQuery).matches)
  useEffect(() => {
    const query = window.matchMedia(MOTION.desktopQuery)
    const update = () => setDesktop(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return desktop
}

export function SiteMotion() {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const progressRef = useRef<HTMLSpanElement>(null)
  const desktop = useDesktop()

  useLayoutEffect(() => {
    if (prefersReducedMotion || desktop === null || motionIsReduced()) return
    const root = document.getElementById('main-content')
    if (!root) return

    const watcher = createEnterWatcher()
    const reveals: Reveal[] = []
    const cleanups: Array<() => void> = []
    let started = false

    const startMotion = () => {
      if (started) return
      started = true

      const masthead = root.querySelector<HTMLElement>('.page-masthead')
      if (masthead) {
        const title = masthead.querySelector<HTMLElement>('h1')
        const aside = masthead.querySelector<HTMLElement>('.field-masthead-aside')
        if (title) {
          if (desktop) cleanups.push(maskedLineReveal(watcher, title, { delay: 0.08 }))
          else {
            const reveal = holdFrom(title, { from: { transform: 'translateY(28px)', opacity: 0.72 }, duration: 0.85, ease: EASE.out4 })
            reveals.push(reveal)
            reveal.play()
          }
        }
        if (aside) {
          const reveal = holdFrom(aside, { from: { transform: 'translateY(26px)' }, duration: 0.82, delay: 0.35 })
          reveals.push(reveal)
          reveal.play()
        }
      }

      root.querySelectorAll<HTMLElement>('[data-site-reveal]').forEach(target => {
        if (target.dataset.siteReveal === 'media') {
          const surface = target.querySelector('img')?.parentElement ?? target
          target.classList.add(styles.mediaFrame)
          surface.classList.add(styles.mediaSurface)
          reveals.push(revealOnEnter(watcher, surface, {
            from: { clipPath: 'inset(0 100% 0 0)', transform: 'scale(1.08)' },
            to: { clipPath: 'inset(0 0% 0 0)', transform: 'scale(1)' },
            duration: 1.22, ease: EASE.inOut3, trigger: target, start: 89,
            onComplete: () => surface.classList.add(styles.mediaLit),
          }))
          return
        }
        if (target.dataset.siteReveal === 'title') {
          if (desktop) cleanups.push(maskedLineReveal(watcher, target, { start: 89 }))
          else reveals.push(revealOnEnter(watcher, target, {
            from: { transform: 'translateY(26px)', opacity: 0.72 }, duration: 0.82, ease: EASE.out4, start: 90,
          }))
          return
        }
        reveals.push(revealOnEnter(watcher, target, {
          from: { transform: 'translateX(16px)', opacity: 0.72 }, duration: 0.75, start: 89,
        }))
      })

      // Service rows move in as fabrication stages, with independent phone
      // triggers so content lower in a tall group does not animate offscreen.
      root.querySelectorAll<HTMLElement>('.service-group').forEach(group => {
        const heading = group.querySelector<HTMLElement>('h2')
        const photo = group.querySelector<HTMLElement>('.service-group-photo')
        const rows = group.querySelectorAll<HTMLElement>('.service-row')
        if (heading) reveals.push(revealOnEnter(watcher, heading, {
          from: { transform: 'translateX(-35px)', opacity: 0.72 }, duration: 0.88, ease: EASE.out4, start: 88,
        }))
        if (photo) {
          photo.classList.add(styles.mediaSurface)
          reveals.push(revealOnEnter(watcher, photo, {
            from: { clipPath: 'inset(0 0 100% 0)' }, to: { clipPath: 'inset(0 0 0% 0)' },
            duration: 1.15, ease: EASE.inOut3, start: 90,
            onComplete: () => photo.classList.add(styles.mediaLit),
          }))
        }
        if (desktop) reveals.push(...staggerOnEnter(watcher, rows, {
          from: { transform: 'translateX(33px)', opacity: 0.7 }, duration: 0.75, stagger: 0.1, start: 86,
        }))
        else rows.forEach(row => reveals.push(revealOnEnter(watcher, row, {
          from: { transform: 'translateX(18px)', opacity: 0.76 }, duration: 0.68, start: 90,
        })))
      })

      reveals.push(...staggerOnEnter(watcher, root.querySelectorAll<HTMLElement>('.contact-method'), {
        from: { transform: 'translateY(32px)', opacity: 0.7 }, duration: 0.76, stagger: 0.12, start: 90,
      }))
      const plates = root.querySelectorAll<HTMLElement>('.service-process .plate')
      if (desktop) reveals.push(...staggerOnEnter(watcher, plates, {
        from: { transform: 'translateY(40px)', opacity: 0.67 }, duration: 0.82, stagger: 0.12, start: 87,
      }))
      else plates.forEach(plate => reveals.push(revealOnEnter(watcher, plate, {
        from: { transform: 'translateY(24px)', opacity: 0.73 }, duration: 0.7, start: 90,
      })))

      if (pathname === '/about') {
        reveals.push(...staggerOnEnter(watcher, root.querySelectorAll<HTMLElement>('[data-about-client-work]'), {
          from: { transform: 'translateY(42px)', opacity: 0.68 }, duration: 0.84, stagger: 0.09, start: 87,
        }))
      }
    }

    const waitingForLoader = document.documentElement.dataset.entryIntro === 'playing'
    if (waitingForLoader) window.addEventListener('adjeet:loader-complete', startMotion, { once: true })
    else startMotion()
    const fallback = waitingForLoader ? window.setTimeout(startMotion, 3500) : 0
    return () => {
      if (fallback) window.clearTimeout(fallback)
      window.removeEventListener('adjeet:loader-complete', startMotion)
      watcher.disconnect()
      reveals.forEach(reveal => reveal.cancel())
      cleanups.forEach(cleanup => cleanup())
    }
  }, [pathname, prefersReducedMotion, desktop])

  // The reading rail on the right edge. It is hidden on phones and for reduced
  // motion by CSS, so it only listens where it can be seen.
  useEffect(() => {
    const progress = progressRef.current
    if (!progress || !desktop || prefersReducedMotion) return
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      progress.style.transform = `scaleY(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`
    }
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [pathname, desktop, prefersReducedMotion])

  return <div className={styles.rail} aria-hidden="true"><span ref={progressRef} className={styles.railProgress} data-motion-progress /></div>
}
