'use client'

import { useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './ReducedMotionWrapper'
import { createMaskedLineReveal, refreshScrollTriggersAfterLayout } from './motion-system'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

/**
 * Motion follows the way a sign is encountered: the first project comes into
 * view, then the work, services and workshop reveal as the visitor reaches them.
 * The server-rendered page remains fully visible when JavaScript is unavailable.
 */
export function HomeMotion() {
  const prefersReducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    if (prefersReducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.querySelector<HTMLElement>('[data-home-page]')
    if (!root) return

    const media = gsap.matchMedia()
    const context = gsap.context(() => {
      const heroTitle = root.querySelector<HTMLElement>('[data-hero-title]')
      if (heroTitle) {
        media.add('(min-width: 768px)', () => createMaskedLineReveal(heroTitle, { delay: 0.12 }))
        // On a narrow screen the heading gains extra lines. Splitting those
        // lines while the local font settles can briefly crop the words.
        media.add('(max-width: 767px)', () => {
          gsap.from(heroTitle, { y: 14, opacity: 0.82, duration: 0.62, ease: 'power3.out' })
        })
      }

      // Keep the enquiry action and every link visible and usable throughout.
      const hero = gsap.timeline({ defaults: { ease: 'power3.out' } })
      const meta = root.querySelector<HTMLElement>('[data-hero-meta]')
      const lead = root.querySelector<HTMLElement>('[data-hero-lead]')
      const actions = root.querySelector<HTMLElement>('[data-hero-actions]')
      const caption = root.querySelector<HTMLElement>('[data-hero-caption]')
      if (meta) hero.from(meta, { y: 10, opacity: 0.7, duration: 0.38 }, 0)
      if (lead) hero.from(lead, { y: 16, opacity: 0.8, duration: 0.56 }, 0.43)
      if (actions) hero.from(actions, { y: 14, duration: 0.5 }, 0.66)
      if (caption) hero.from(caption, { y: 12, duration: 0.5 }, 0.7)

      const heroImage = root.querySelector<HTMLElement>('[data-hero-image]')
      if (heroImage) {
        // The vertical reveal borrows the action of a sign coming into view.
        // Phones retain the scale entrance without clipping a large image.
        media.add('(min-width: 768px)', () => {
          gsap.from(heroImage, {
            clipPath: 'inset(100% 0 0 0)',
            scale: 1.12,
            transformOrigin: '50% 50%',
            duration: 1.25,
            ease: 'power3.inOut',
            onComplete: () => gsap.set(heroImage, { clearProps: 'clipPath,transform,transformOrigin' }),
          })
        })
        media.add('(max-width: 767px)', () => {
          gsap.from(heroImage, {
            scale: 1.06,
            transformOrigin: '50% 50%',
            duration: 1.15,
            ease: 'power2.out',
            onComplete: () => gsap.set(heroImage, { clearProps: 'transform,transformOrigin' }),
          })
        })
      }

      const sectionTitles = root.querySelectorAll<HTMLElement>('[data-home-title]')
      media.add('(min-width: 768px)', () => {
        const cleanups = Array.from(sectionTitles, title => createMaskedLineReveal(title, {
          trigger: title,
          start: 'top 88%',
        }))
        return () => cleanups.forEach(cleanup => cleanup())
      })
      media.add('(max-width: 767px)', () => {
        sectionTitles.forEach(title => {
          gsap.from(title, {
            y: 18,
            opacity: 0.82,
            duration: 0.64,
            ease: 'power3.out',
            scrollTrigger: { trigger: title, start: 'top 90%', once: true },
          })
        })
      })

      // Scale photographs inside their frames. Project links and focus outlines
      // remain visible while the media moves.
      root.querySelectorAll<HTMLElement>('[data-home-image]').forEach(frame => {
        const image = frame.matches('img') ? frame : frame.querySelector<HTMLElement>('img')
        if (!image) return

        const shutter = frame.dataset.homeImage === 'shutter'
        gsap.from(image, shutter ? {
          clipPath: 'inset(100% 0 0 0)',
          scale: 1.14,
          transformOrigin: '50% 50%',
          duration: 1.12,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: frame, start: 'top 88%', once: true },
          onComplete: () => gsap.set(image, { clearProps: 'clipPath,transform,transformOrigin' }),
        } : {
          scale: 1.12,
          transformOrigin: '50% 50%',
          duration: 1.15,
          ease: 'power2.out',
          scrollTrigger: { trigger: frame, start: 'top 88%', once: true },
          onComplete: () => gsap.set(image, { clearProps: 'transform,transformOrigin' }),
        })
      })

      const process = root.querySelector<HTMLElement>('[data-home-process]')
      const steps = process?.querySelectorAll<HTMLElement>('[data-home-step]')
      if (process && steps?.length) {
        media.add('(min-width: 768px)', () => {
          gsap.from(steps, {
            y: 26,
            autoAlpha: 0,
            duration: 0.7,
            stagger: 0.16,
            ease: 'power3.out',
            scrollTrigger: { trigger: process, start: 'top 82%', once: true },
          })
        })
        media.add('(max-width: 767px)', () => {
          steps.forEach(step => {
            gsap.from(step, {
              y: 22,
              autoAlpha: 0,
              duration: 0.64,
              ease: 'power3.out',
              scrollTrigger: { trigger: step, start: 'top 90%', once: true },
            })
          })
        })
      }
    }, root)

    const cancelRefresh = refreshScrollTriggersAfterLayout()
    return () => {
      cancelRefresh()
      media.revert()
      context.revert()
    }
  }, [prefersReducedMotion])

  return null
}
