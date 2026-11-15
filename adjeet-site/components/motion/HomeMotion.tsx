'use client'

import { useLayoutEffect } from 'react'
import { useReducedMotion } from './ReducedMotionWrapper'
import {
  EASE, MOTION, classOnEnter, createEnterWatcher, holdFrom, maskedLineReveal, motionIsReduced,
  revealOnEnter, staggerOnEnter, type Reveal,
} from './motion-system'
import { ENTRY_INTRO_COMPLETE_EVENT, ENTRY_INTRO_FALLBACK_MS } from '@/lib/entry-intro'

/**
 * Shutters rolling up, light passing over lit work and pieces arriving in
 * place echo physical signmaking. The hero is never hidden: its photo is the
 * page's largest paint and must not wait for any animation, so the hero only
 * moves (never fades) once the optional entry shutter has cleared.
 *
 * Built on motion-system.ts (the browser's own animation engine) rather than
 * GSAP, which cost about a second of main thread here on a mid-range phone.
 */
export function HomeMotion() {
  const prefersReducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    if (prefersReducedMotion || motionIsReduced()) return
    const root = document.querySelector<HTMLElement>('[data-home-page]')
    if (!root) return

    const desktop = window.matchMedia(MOTION.desktopQuery).matches
    const watcher = createEnterWatcher()
    const reveals: Reveal[] = []
    const cleanups: Array<() => void> = []

    root.querySelectorAll<HTMLElement>('[data-home-title]').forEach(title => {
      if (desktop) cleanups.push(maskedLineReveal(watcher, title, { start: 87 }))
      else reveals.push(revealOnEnter(watcher, title, {
        from: { transform: 'translateY(25px)', opacity: 0.72 }, duration: 0.82, ease: EASE.out4, start: 91,
      }))
    })

    // A bright rail marks the beginning of each paper chapter.
    root.querySelectorAll<HTMLElement>('[data-home-section]').forEach(section => classOnEnter(watcher, section, 'is-traced', 82))

    root.querySelectorAll<HTMLElement>('[data-home-client]').forEach((client, index) => {
      reveals.push(revealOnEnter(watcher, client, {
        from: { transform: 'translateY(22px)', opacity: 0.6 }, duration: 0.72, delay: (index % 5) * 0.055, start: 94,
      }))
    })

    // Finished shopfronts arrive one at a time, like walking past them.
    root.querySelectorAll<HTMLElement>('[data-home-card]').forEach(card => reveals.push(revealOnEnter(watcher, card, {
      from: { transform: 'translateY(48px)' }, duration: 0.95, start: 88,
    })))

    // Each photographed job opens like a shop shutter rolling up.
    root.querySelectorAll<HTMLElement>('[data-home-image]').forEach(frame => {
      const image = frame.querySelector<HTMLElement>('img')
      if (!image) return
      reveals.push(revealOnEnter(watcher, image, {
        from: { clipPath: 'inset(100% 0 0 0)', transform: 'scale(1.1)' },
        to: { clipPath: 'inset(0% 0 0 0)', transform: 'scale(1)' },
        duration: 1.12, ease: EASE.inOut3, trigger: frame, start: 87,
      }))
      if (frame.hasAttribute('data-light-surface')) classOnEnter(watcher, frame, 'is-lit', 70)
    })

    const process = root.querySelector<HTMLElement>('[data-home-process]')
    const steps = process?.querySelectorAll<HTMLElement>('[data-home-step]')
    if (process && steps?.length) {
      if (desktop) reveals.push(...staggerOnEnter(watcher, steps, {
        from: { transform: 'translateY(42px)', opacity: 0.58 }, duration: 0.86, stagger: 0.2, trigger: process, start: 84,
      }))
      else steps.forEach(step => reveals.push(revealOnEnter(watcher, step, {
        from: { transform: 'translateX(18px)', opacity: 0.62 }, duration: 0.76, start: 90,
      })))
    }

    const map = root.querySelector<HTMLElement>('[data-home-map]')
    if (map) reveals.push(revealOnEnter(watcher, map, {
      from: { transform: 'scale(0.93) rotate(1.5deg)', opacity: 0.72 },
      duration: 1.12, start: 84,
    }))
    root.querySelectorAll<HTMLElement>('[data-home-faq]').forEach(row => reveals.push(revealOnEnter(watcher, row, {
      from: { transform: 'translateY(24px)', opacity: 0.7 }, duration: 0.72, start: 89,
    })))

    // Pointer light is decorative; no action depends on hover.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      root.querySelectorAll<HTMLElement>('[data-light-surface]').forEach(surface => {
        let bounds: DOMRect | null = null
        const enter = () => { bounds = surface.getBoundingClientRect() }
        const move = (event: PointerEvent) => {
          if (!bounds) bounds = surface.getBoundingClientRect()
          surface.style.setProperty('--light-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`)
          surface.style.setProperty('--light-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`)
        }
        const leave = () => { bounds = null }
        surface.addEventListener('pointerenter', enter)
        surface.addEventListener('pointermove', move)
        surface.addEventListener('pointerleave', leave)
        cleanups.push(() => {
          surface.removeEventListener('pointerenter', enter)
          surface.removeEventListener('pointermove', move)
          surface.removeEventListener('pointerleave', leave)
          surface.style.removeProperty('--light-x')
          surface.style.removeProperty('--light-y')
        })
      })
    }

    // The hero settles into place once the entry shutter, if any, has cleared.
    // Transform only: the text and photo are painted, and stay painted.
    let heroStarted = false
    const startHero = () => {
      if (heroStarted) return
      heroStarted = true
      const parts = ['[data-hero-lead]', '[data-hero-actions]', '[data-hero-caption]']
        .map(selector => root.querySelector<HTMLElement>(selector))
        .filter((part): part is HTMLElement => part !== null)
      parts.forEach((part, index) => {
        const reveal = holdFrom(part, { from: { transform: 'translateY(18px)' }, duration: 0.8, delay: index * 0.12 })
        reveals.push(reveal)
        reveal.play()
      })
      root.querySelector<HTMLElement>('[data-hero-image]')?.closest<HTMLElement>('[data-light-surface]')?.classList.add('is-lit')
    }

    const waitingForLoader = document.documentElement.dataset.entryIntro === 'playing'
    if (waitingForLoader) window.addEventListener(ENTRY_INTRO_COMPLETE_EVENT, startHero, { once: true })
    else startHero()
    const fallback = waitingForLoader ? window.setTimeout(startHero, ENTRY_INTRO_FALLBACK_MS) : 0
    return () => {
      if (fallback) window.clearTimeout(fallback)
      window.removeEventListener(ENTRY_INTRO_COMPLETE_EVENT, startHero)
      watcher.disconnect()
      reveals.forEach(reveal => reveal.cancel())
      cleanups.forEach(cleanup => cleanup())
    }
  }, [prefersReducedMotion])
  return null
}
