'use client'

import { useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './ReducedMotionWrapper'
import { createMaskedLineReveal, refreshScrollTriggersAfterLayout } from './motion-system'
import { ENTRY_INTRO_COMPLETE_EVENT, ENTRY_INTRO_FALLBACK_MS } from '@/lib/entry-intro'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const DESKTOP = '(min-width: 768px)'
const PHONE = '(max-width: 767px)'

/**
 * Shutters rolling up, light passing over lit work and pieces arriving in
 * place echo physical signmaking. The hero is never hidden: its photo is the
 * page's largest paint and must not wait for any animation, so the hero only
 * moves (never fades) once the optional entry shutter has cleared.
 */
export function HomeMotion() {
  const prefersReducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    if (prefersReducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.querySelector<HTMLElement>('[data-home-page]')
    if (!root) return

    const media = gsap.matchMedia()
    const context = gsap.context(() => {
      const sectionTitles = root.querySelectorAll<HTMLElement>('[data-home-title]')
      media.add(DESKTOP, () => {
        const cleanups = Array.from(sectionTitles, title => createMaskedLineReveal(title, {
          trigger: title, start: 'top 87%',
        }))
        return () => cleanups.forEach(cleanup => cleanup())
      })
      media.add(PHONE, () => {
        sectionTitles.forEach(title => gsap.from(title, {
          y: 25, opacity: 0.72, duration: 0.82, ease: 'power4.out',
          scrollTrigger: { trigger: title, start: 'top 91%', once: true },
        }))
      })

      // A bright rail marks the beginning of each paper chapter.
      root.querySelectorAll<HTMLElement>('[data-home-section]').forEach(section => {
        ScrollTrigger.create({
          trigger: section, start: 'top 82%', once: true,
          onEnter: () => section.classList.add('is-traced'),
        })
      })

      root.querySelectorAll<HTMLElement>('[data-home-client]').forEach((client, index) => {
        gsap.from(client, {
          y: 22, opacity: 0.6, duration: 0.72, delay: (index % 5) * 0.055,
          ease: 'power3.out', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: client, start: 'top 94%', once: true },
        })
      })

      // Finished shopfronts arrive one at a time, like walking past them.
      root.querySelectorAll<HTMLElement>('[data-home-card]').forEach(card => gsap.from(card, {
        y: 48, duration: 0.95, ease: 'power3.out', clearProps: 'transform',
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      }))

      // Each photographed job opens like a shop shutter rolling up.
      root.querySelectorAll<HTMLElement>('[data-home-image]').forEach(frame => {
        const image = frame.querySelector<HTMLElement>('img')
        if (!image) return
        gsap.from(image, {
          clipPath: 'inset(100% 0 0 0)', scale: 1.1, duration: 1.12, ease: 'power3.inOut',
          scrollTrigger: { trigger: frame, start: 'top 87%', once: true },
          onComplete: () => gsap.set(image, { clearProps: 'clipPath,transform' }),
        })
        if (frame.hasAttribute('data-light-surface')) ScrollTrigger.create({
          trigger: frame, start: 'top 70%', once: true,
          onEnter: () => frame.classList.add('is-lit'),
        })
      })

      const process = root.querySelector<HTMLElement>('[data-home-process]')
      const steps = process?.querySelectorAll<HTMLElement>('[data-home-step]')
      if (process && steps?.length) {
        media.add(DESKTOP, () => gsap.from(steps, {
          y: 42, opacity: 0.58, duration: 0.86, stagger: 0.2, ease: 'power3.out',
          scrollTrigger: { trigger: process, start: 'top 84%', once: true },
        }))
        media.add(PHONE, () => {
          steps.forEach(step => gsap.from(step, {
            x: 18, opacity: 0.62, duration: 0.76, ease: 'power3.out',
            scrollTrigger: { trigger: step, start: 'top 90%', once: true },
          }))
        })
      }

      const map = root.querySelector<HTMLElement>('[data-home-map]')
      if (map) gsap.from(map, {
        scale: 0.93, rotate: 1.5, opacity: 0.72, duration: 1.12,
        ease: 'power3.out', transformOrigin: '50% 50%',
        scrollTrigger: { trigger: map, start: 'top 84%', once: true },
        onComplete: () => gsap.set(map, { clearProps: 'transform,opacity,transformOrigin' }),
      })
      root.querySelectorAll<HTMLElement>('[data-home-faq]').forEach(row => gsap.from(row, {
        y: 24, opacity: 0.7, duration: 0.72, ease: 'power3.out',
        scrollTrigger: { trigger: row, start: 'top 89%', once: true },
      }))
    }, root)

    // Pointer light is decorative; no action depends on hover.
    const pointerCleanups: Array<() => void> = []
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
        pointerCleanups.push(() => {
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
      context.add(() => {
        const parts = ['[data-hero-lead]', '[data-hero-actions]', '[data-hero-caption]']
          .map(selector => root.querySelector<HTMLElement>(selector))
          .filter((part): part is HTMLElement => part !== null)
        if (parts.length) gsap.from(parts, { y: 18, duration: 0.8, stagger: 0.12, ease: 'power3.out', clearProps: 'transform' })
        root.querySelector<HTMLElement>('[data-hero-image]')?.closest<HTMLElement>('[data-light-surface]')?.classList.add('is-lit')
      })
    }

    const cancelRefresh = refreshScrollTriggersAfterLayout()
    const waitingForLoader = document.documentElement.dataset.entryIntro === 'playing'
    if (waitingForLoader) window.addEventListener(ENTRY_INTRO_COMPLETE_EVENT, startHero, { once: true })
    else startHero()
    const fallback = waitingForLoader ? window.setTimeout(startHero, ENTRY_INTRO_FALLBACK_MS) : 0
    return () => {
      if (fallback) window.clearTimeout(fallback)
      window.removeEventListener(ENTRY_INTRO_COMPLETE_EVENT, startHero)
      pointerCleanups.forEach(cleanup => cleanup())
      cancelRefresh()
      media.revert()
      context.revert()
    }
  }, [prefersReducedMotion])
  return null
}
