'use client'

import { useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './ReducedMotionWrapper'
import { createMaskedLineReveal, refreshScrollTriggersAfterLayout } from './motion-system'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const DESKTOP = '(min-width: 768px)'
const PHONE = '(max-width: 767px)'

/**
 * Shutters, light passes and pieces arriving in place echo physical signmaking.
 * Server-rendered content stays visible until animation starts.
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

      // A bright rail marks the beginning of each main chapter.
      root.querySelectorAll<HTMLElement>('[data-home-section]').forEach(section => {
        ScrollTrigger.create({
          trigger: section, start: 'top 82%', once: true,
          onEnter: () => section.classList.add('is-traced'),
        })
      })
      const facts = root.querySelectorAll<HTMLElement>('[data-home-fact]')
      if (facts.length) gsap.from(facts, {
        y: 24, opacity: 0.56, duration: 0.76, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: facts[0], start: 'top 95%', once: true },
      })

      root.querySelectorAll<HTMLElement>('[data-home-client]').forEach((client, index) => {
        gsap.from(client, {
          y: 22, opacity: 0.6, duration: 0.72, delay: (index % 5) * 0.055,
          ease: 'power3.out', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: client, start: 'top 94%', once: true },
        })
      })

      const workCards = root.querySelectorAll<HTMLElement>('[data-home-card]')
      media.add(DESKTOP, () => {
        if (!workCards.length) return
        gsap.from(workCards, {
          y: 68, rotate: index => index % 2 === 0 ? -1.2 : 1.2,
          opacity: 0.8, duration: 1.05, stagger: 0.18, ease: 'power4.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: workCards[0], start: 'top 86%', once: true },
        })
      })
      media.add(PHONE, () => {
        workCards.forEach(card => gsap.from(card, {
          y: 42, opacity: 0.82, duration: 0.84, ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        }))
      })

      const serviceCards = root.querySelectorAll<HTMLElement>('[data-home-service]')
      media.add(DESKTOP, () => {
        if (!serviceCards.length) return
        gsap.from(serviceCards, {
          y: 62, opacity: 0.68, duration: 0.95, stagger: 0.13, ease: 'power4.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: serviceCards[0], start: 'top 87%', once: true },
        })
      })
      media.add(PHONE, () => {
        serviceCards.forEach(card => gsap.from(card, {
          y: 38, opacity: 0.76, duration: 0.78, ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        }))
      })

      root.querySelectorAll<HTMLElement>('[data-home-image]').forEach(frame => {
        const image = frame.matches('img') ? frame : frame.querySelector<HTMLElement>('img')
        if (!image) return
        gsap.from(image, {
          clipPath: frame.dataset.homeImage === 'shutter' ? 'inset(100% 0 0 0)' : 'inset(0 100% 0 0)',
          scale: 1.13, duration: 1.12, ease: 'power3.inOut',
          scrollTrigger: { trigger: frame, start: 'top 87%', once: true },
          onComplete: () => gsap.set(image, { clearProps: 'clipPath,transform' }),
        })
        if (frame.hasAttribute('data-light-surface')) ScrollTrigger.create({
          trigger: frame, start: 'top 83%', once: true,
          onEnter: () => frame.classList.add('is-lit'),
        })
      })

      const workshopMedia = root.querySelector<HTMLElement>('[data-home-workshop-media]')
      if (workshopMedia) gsap.from(workshopMedia, {
        clipPath: 'inset(0 100% 0 0)', duration: 1.32, ease: 'power3.inOut',
        scrollTrigger: { trigger: workshopMedia, start: 'top 86%', once: true },
        onComplete: () => gsap.set(workshopMedia, { clearProps: 'clipPath' }),
      })
      const workshopCopy = root.querySelector<HTMLElement>('[data-home-workshop-copy]')
      if (workshopCopy) {
        const supportingCopy = Array.from(workshopCopy.children).filter(node => node.tagName !== 'H2')
        gsap.from(supportingCopy, {
          y: 25, opacity: 0.72, duration: 0.78, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: workshopCopy, start: 'top 78%', once: true },
        })
      }

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

    // Start the first reveal after the optional entry sequence has cleared.
    let heroStarted = false
    const startHero = () => {
      if (heroStarted) return
      heroStarted = true
      context.add(() => {
        const title = root.querySelector<HTMLElement>('[data-hero-title]')
        const meta = root.querySelector<HTMLElement>('[data-hero-meta]')
        const lead = root.querySelector<HTMLElement>('[data-hero-lead]')
        const actions = root.querySelector<HTMLElement>('[data-hero-actions]')
        const caption = root.querySelector<HTMLElement>('[data-hero-caption]')
        const image = root.querySelector<HTMLElement>('[data-hero-image]')
        if (title) {
          media.add(DESKTOP, () => createMaskedLineReveal(title, { delay: 0.12 }))
          media.add(PHONE, () => {
            gsap.from(title, { y: 28, opacity: 0.68, duration: 0.88, ease: 'power4.out' })
          })
        }
        const hero = gsap.timeline({ defaults: { ease: 'power3.out' } })
        if (meta) hero.from(meta, { x: -24, opacity: 0.55, duration: 0.62 }, 0.04)
        if (lead) hero.from(lead, { y: 28, opacity: 0.7, duration: 0.78 }, 0.42)
        if (actions) hero.from(actions, { y: 22, duration: 0.72 }, 0.68)
        if (caption) hero.from(caption, { y: 26, duration: 0.7 }, 0.91)
        if (image) {
          media.add(DESKTOP, () => {
            gsap.from(image, {
              clipPath: 'inset(0 100% 0 0)', scale: 1.16, duration: 1.42,
              ease: 'power3.inOut',
              onComplete: () => {
                gsap.set(image, { clearProps: 'clipPath,transform' })
                image.closest<HTMLElement>('[data-light-surface]')?.classList.add('is-lit')
              },
            })
          })
          media.add(PHONE, () => {
            gsap.from(image, {
              clipPath: 'inset(0 0 100% 0)', scale: 1.1, duration: 1.24,
              ease: 'power3.inOut',
              scrollTrigger: { trigger: image, start: 'top 94%', once: true },
              onComplete: () => {
                gsap.set(image, { clearProps: 'clipPath,transform' })
                image.closest<HTMLElement>('[data-light-surface]')?.classList.add('is-lit')
              },
            })
          })
        }
      })
    }

    const cancelRefresh = refreshScrollTriggersAfterLayout()
    const waitingForLoader = document.documentElement.dataset.entryIntro === 'playing'
    if (waitingForLoader) window.addEventListener('adjeet:loader-complete', startHero, { once: true })
    else startHero()
    const fallback = waitingForLoader ? window.setTimeout(startHero, 3500) : 0
    return () => {
      if (fallback) window.clearTimeout(fallback)
      window.removeEventListener('adjeet:loader-complete', startHero)
      pointerCleanups.forEach(cleanup => cleanup())
      cancelRefresh()
      media.revert()
      context.revert()
    }
  }, [prefersReducedMotion])
  return null
}
