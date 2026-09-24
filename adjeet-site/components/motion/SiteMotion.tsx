'use client'

import { useLayoutEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './ReducedMotionWrapper'
import { createMaskedLineReveal, refreshScrollTriggersAfterLayout } from './motion-system'
import styles from './SiteMotion.module.css'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const DESKTOP = '(min-width: 768px)'
const PHONE = '(max-width: 767px)'

export function SiteMotion() {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const previousPathname = useRef(pathname)

  // A route transition must not inherit the previous page's cached scroll.
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

    let context: gsap.Context | null = null
    let media: gsap.MatchMedia | null = null
    let cancelRefresh: (() => void) | null = null
    let started = false
    const startMotion = () => {
      if (started) return
      started = true
      media = gsap.matchMedia()
      const activeMedia = media
      context = gsap.context(() => {
        const masthead = root.querySelector<HTMLElement>('.page-masthead')
        if (masthead) {
          const title = masthead.querySelector<HTMLElement>('h1')
          const meta = masthead.querySelectorAll<HTMLElement>('.field-meta span')
          const aside = masthead.querySelector<HTMLElement>('.field-masthead-aside')
          if (meta.length) gsap.from(meta, {
            x: -18, opacity: 0.55, duration: 0.58, stagger: 0.1, ease: 'power3.out',
          })
          if (title) {
            activeMedia.add(DESKTOP, () => createMaskedLineReveal(title, { delay: 0.08 }))
            activeMedia.add(PHONE, () => {
              gsap.from(title, { y: 28, opacity: 0.72, duration: 0.85, ease: 'power4.out' })
            })
          }
          if (aside) gsap.from(aside, { y: 26, duration: 0.82, delay: 0.35, ease: 'power3.out' })
        }

        root.querySelectorAll<HTMLElement>('[data-site-reveal]').forEach(target => {
          if (target.dataset.siteReveal === 'media') {
            const surface = target.querySelector('img')?.parentElement ?? target
            target.classList.add(styles.mediaFrame)
            surface.classList.add(styles.mediaSurface)
            gsap.from(surface, {
              clipPath: 'inset(0 100% 0 0)', scale: 1.08,
              duration: 1.22, ease: 'power3.inOut',
              scrollTrigger: { trigger: target, start: 'top 89%', once: true },
              onComplete: () => {
                gsap.set(surface, { clearProps: 'clipPath,transform' })
                surface.classList.add(styles.mediaLit)
              },
            })
            return
          }
          if (target.dataset.siteReveal === 'title') {
            activeMedia.add(DESKTOP, () => createMaskedLineReveal(target, {
              trigger: target, start: 'top 89%',
            }))
            activeMedia.add(PHONE, () => {
              gsap.from(target, {
                y: 26, opacity: 0.72, duration: 0.82, ease: 'power4.out',
                scrollTrigger: { trigger: target, start: 'top 90%', once: true },
              })
            })
            return
          }
          gsap.from(target, {
            x: 16, opacity: 0.72, duration: 0.75, ease: 'power3.out',
            scrollTrigger: { trigger: target, start: 'top 89%', once: true },
          })
        })

        const featuredImage = root.querySelector<HTMLElement>('[data-site-featured-image]')
        const featuredPhoto = featuredImage?.querySelector<HTMLElement>('img')
        if (featuredImage && featuredPhoto) {
          featuredImage.classList.add(styles.mediaSurface)
          gsap.from(featuredPhoto, {
            clipPath: 'inset(0 0 100% 0)', scale: 1.1,
            duration: 1.3, ease: 'power3.inOut',
            scrollTrigger: { trigger: featuredImage, start: 'top 91%', once: true },
            onComplete: () => {
              gsap.set(featuredPhoto, { clearProps: 'clipPath,transform' })
              featuredImage.classList.add(styles.mediaLit)
            },
          })
        }

        // Service rows move in as fabrication stages, with independent mobile
        // triggers so content lower in a tall group does not animate offscreen.
        root.querySelectorAll<HTMLElement>('.service-group').forEach(group => {
          const heading = group.querySelector<HTMLElement>('h2')
          const photo = group.querySelector<HTMLElement>('.service-group-photo')
          const rows = group.querySelectorAll<HTMLElement>('.service-row')
          if (heading) gsap.from(heading, {
            x: -35, opacity: 0.72, duration: 0.88, ease: 'power4.out',
            scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
          })
          if (photo) {
            photo.classList.add(styles.mediaSurface)
            gsap.from(photo, {
              clipPath: 'inset(0 0 100% 0)', duration: 1.15, ease: 'power3.inOut',
              scrollTrigger: { trigger: photo, start: 'top 90%', once: true },
              onComplete: () => {
                gsap.set(photo, { clearProps: 'clipPath' })
                photo.classList.add(styles.mediaLit)
              },
            })
          }
          activeMedia.add(DESKTOP, () => {
            if (!rows.length) return
            gsap.from(rows, {
              x: 33, opacity: 0.7, duration: 0.75, stagger: 0.1, ease: 'power3.out',
              scrollTrigger: { trigger: rows[0], start: 'top 86%', once: true },
            })
          })
          activeMedia.add(PHONE, () => rows.forEach(row => gsap.from(row, {
            x: 18, opacity: 0.76, duration: 0.68, ease: 'power3.out',
            scrollTrigger: { trigger: row, start: 'top 90%', once: true },
          })))
        })

        const methods = root.querySelectorAll<HTMLElement>('.contact-method')
        if (methods.length) gsap.from(methods, {
          y: 32, opacity: 0.7, duration: 0.76, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: methods[0], start: 'top 90%', once: true },
        })
        const plates = root.querySelectorAll<HTMLElement>('.service-process .plate')
        activeMedia.add(DESKTOP, () => {
          if (!plates.length) return
          gsap.from(plates, {
            y: 40, opacity: 0.67, duration: 0.82, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: plates[0], start: 'top 87%', once: true },
          })
        })
        activeMedia.add(PHONE, () => plates.forEach(plate => gsap.from(plate, {
          y: 24, opacity: 0.73, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: plate, start: 'top 90%', once: true },
        })))

        if (pathname === '/about') {
          const clientPhotos = root.querySelectorAll<HTMLElement>('a[href^="/portfolio?client="]')
          if (clientPhotos.length) gsap.from(clientPhotos, {
            y: 42, opacity: 0.68, duration: 0.84, stagger: 0.09, ease: 'power3.out',
            scrollTrigger: { trigger: clientPhotos[0], start: 'top 87%', once: true },
          })
        }

        const progress = document.querySelector<HTMLElement>('[data-motion-progress]')
        if (progress) ScrollTrigger.create({
          start: 0,
          end: () => ScrollTrigger.maxScroll(window),
          onUpdate: self => { progress.style.transform = `scaleY(${self.progress})` },
        })
      }, root)
      cancelRefresh = refreshScrollTriggersAfterLayout()
    }

    const waitingForLoader = document.documentElement.dataset.entryIntro === 'playing'
    if (waitingForLoader) window.addEventListener('adjeet:loader-complete', startMotion, { once: true })
    else startMotion()
    const fallback = waitingForLoader ? window.setTimeout(startMotion, 3500) : 0
    return () => {
      if (fallback) window.clearTimeout(fallback)
      window.removeEventListener('adjeet:loader-complete', startMotion)
      cancelRefresh?.()
      media?.revert()
      context?.revert()
    }
  }, [pathname, prefersReducedMotion])

  return <div className={styles.rail} aria-hidden="true"><span className={styles.railProgress} data-motion-progress /></div>
}
