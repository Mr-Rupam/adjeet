'use client'

import { useLayoutEffect } from 'react'
<<<<<<< HEAD
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './ReducedMotionWrapper'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}
=======
import { useReducedMotion } from './ReducedMotionWrapper'
import { createBodyReveal, createHeroHeadlineReveal, createMaskedLineReveal, gsap, MOTION, refreshScrollTriggersAfterLayout } from './motion-system'
>>>>>>> origin/main

/**
 * Small, one-time entrances for the home-page story. The hero film owns the
 * theme change; this only gives the copy and the following sections a clear
 * reading order without adding scroll-jacking or perpetual motion.
 */
export function HomeMotion() {
  const prefersReducedMotion = useReducedMotion()

  useLayoutEffect(() => {
<<<<<<< HEAD
    if (prefersReducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

=======
>>>>>>> origin/main
    const root = document.querySelector<HTMLElement>('[data-home-page]')
    if (!root) return

    const context = gsap.context(() => {
<<<<<<< HEAD
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
=======
      const media = gsap.matchMedia(root)

      media.add(
        { all: '(min-width: 0px)', reduce: MOTION.reduceQuery, desktop: MOTION.desktopQuery },
        match => {
          if (prefersReducedMotion || match.conditions?.reduce) return

          const select = gsap.utils.selector(root)
          const scriptTargets = gsap.utils.toArray<HTMLElement>(select('[data-reveal-script]'))
          const cleanups: Array<() => void> = []
          const heroTitle = select('[data-hero-title]')[0] as HTMLElement | undefined

          if (heroTitle) {
            cleanups.push(createHeroHeadlineReveal(heroTitle))
          }

          gsap.from(select('[data-hero-meta]'), { autoAlpha: 0, y: 8, duration: 0.32, ease: MOTION.entranceEase })
          gsap.from(scriptTargets, { autoAlpha: 0, y: 10, duration: MOTION.scriptDuration, delay: 0.38, ease: MOTION.entranceEase })
          gsap.from(select('[data-hero-lead]'), { autoAlpha: 0, y: MOTION.bodyDistance, duration: MOTION.bodyDuration, delay: 0.5, ease: MOTION.entranceEase })
          // Do not animate the CTA itself: it stays available on the first paint.
          gsap.from(select('[data-hero-caption]'), { autoAlpha: 0, duration: 0.28, delay: 0.48, ease: MOTION.entranceEase })

          gsap.utils.toArray<HTMLElement>(select('[data-reveal-text]')).forEach(heading => {
            if (heading === heroTitle || heading.querySelector('[data-reveal-script]')) return
            cleanups.push(createMaskedLineReveal(heading, { trigger: heading }))
          })

          const featuredProject = select('[data-featured-project]')[0] as HTMLElement | undefined
          const featuredFrame = featuredProject?.querySelector<HTMLElement>('[data-reveal-image]')
          const imageFrames = gsap.utils.toArray<HTMLElement>(select('[data-reveal-image]'))
            .filter(frame => frame !== featuredFrame)

          imageFrames.forEach(frame => {
            const image = frame.querySelector<HTMLElement>('[data-motion-media]')
            const timeline = gsap.timeline({
              defaults: { ease: MOTION.entranceEase },
              scrollTrigger: { trigger: frame, start: 'top 86%', once: true },
            })
            timeline.fromTo(frame, { clipPath: 'inset(10%)' }, { clipPath: 'inset(0%)', duration: MOTION.imageDuration })
            if (image) timeline.fromTo(image, { scale: 1.04 }, { scale: 1, duration: MOTION.imageDuration }, '<')
          })

          gsap.utils.toArray<HTMLElement>(select('[data-home-reveal]')).forEach(target => {
            if (target.matches('[data-reveal-image]') || target.contains(featuredFrame ?? null)) return
            createBodyReveal(target)
          })

          if (featuredFrame && match.conditions?.desktop) {
            const featuredMedia = featuredFrame.querySelector<HTMLElement>('[data-motion-media]')
            if (featuredMedia) {
              const span = Math.round(window.innerHeight * 0.6)
              const scene = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: { trigger: featuredProject, start: 'top 82%', end: `+=${span}`, scrub: 0.4 },
              })
              scene.fromTo(featuredFrame, { clipPath: 'inset(10%)' }, { clipPath: 'inset(0%)' })
              scene.fromTo(featuredMedia, { scale: 1.04 }, { scale: 1 }, '<')
            }
          } else if (featuredFrame) {
            const featuredMedia = featuredFrame.querySelector<HTMLElement>('[data-motion-media]')
            const scene = gsap.timeline({
              defaults: { ease: MOTION.entranceEase },
              scrollTrigger: { trigger: featuredFrame, start: 'top 86%', once: true },
            })
            scene.fromTo(featuredFrame, { clipPath: 'inset(10%)' }, { clipPath: 'inset(0%)', duration: MOTION.imageDuration })
            if (featuredMedia) scene.fromTo(featuredMedia, { scale: 1.04 }, { scale: 1, duration: MOTION.imageDuration }, '<')
          }

          if (match.conditions?.desktop) {
            const heroMedia = select('[data-hero-media]')[0] as HTMLElement | undefined
            const heroSection = select('#hero-section')[0] as HTMLElement | undefined
            if (heroMedia && heroSection) {
              gsap.fromTo(heroMedia, { scale: 1 }, {
                scale: 1.04,
                ease: 'none',
                scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom top', scrub: 0.35 },
              })
            }
          }

          return () => cleanups.forEach(cleanup => cleanup())
        },
      )

      return () => media.revert()
    }, root)

    const cancelRefresh = refreshScrollTriggersAfterLayout()
    return () => {
      cancelRefresh()
>>>>>>> origin/main
      context.revert()
    }
  }, [prefersReducedMotion])

  return null
}
