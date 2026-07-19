'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { getFeaturedPhotos } from '@/content/gallery'

/**
 * The night act. Always-dark section — because signs are judged after
 * sunset. Desktop: 3D overlapping card fan with hover elevation, adapted
 * from 21st.dev "Portfolio Gallery" (isaiahbjork/portfolio-gallery).
 * Mobile: CSS marquee of the same cards.
 */

const CAPTIONS: Record<string, { client: string; job: string; place: string }> = {
  'gs-acc': { client: 'ACC Cement', job: 'Glow sign', place: 'Siliguri' },
  'acp-ambuja': { client: 'Ambuja Cement', job: 'ACP + LED', place: 'Jalpaiguri' },
  'gs-gates': { client: 'Gates', job: 'Glow sign', place: 'Darjeeling' },
  'vb-srmb': { client: 'SRMB Steel', job: 'Vehicle wrap', place: 'Malda' },
  'gs-airtel': { client: 'Airtel', job: 'Glow sign', place: 'Cooch Behar' },
}

function WorkCard({ photo, className = '' }: { photo: ReturnType<typeof getFeaturedPhotos>[number]; className?: string }) {
  const caption = CAPTIONS[photo.id]
  return (
    <figure className={`light-pool relative m-0 overflow-hidden border border-night-rule bg-night-elevated ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- transformed cards; next/image trips on rotateY parent */}
      <img
        src={photo.src}
        alt={photo.alt}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-2 bg-gradient-to-t from-black/85 to-transparent px-4 pb-3 pt-8">
          <span className="display text-lg text-night-ink">{caption.client}</span>
          <span className="spec text-night-ink-muted">
            {caption.job} — {caption.place}
          </span>
        </figcaption>
      )}
    </figure>
  )
}

export function NightWork() {
  const reduceMotion = useReducedMotion()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [entered, setEntered] = useState(false)
  const photos = getFeaturedPhotos()

  return (
    <section className="relative overflow-hidden bg-night">
      {/* Amber streetlight pools */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 45% 40% at 20% 0%, rgba(255,140,40,0.13), transparent 70%), radial-gradient(ellipse 40% 35% at 85% 10%, rgba(255,170,80,0.09), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-content px-5 pt-16 md:px-8 md:pt-24">
        <p className="spec text-signal-hot">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-signal-hot align-baseline shadow-[0_0_12px_2px_rgba(255,140,40,0.8)]" aria-hidden="true" />
          After dark — 6 PM, North Bengal
        </p>
        <h2 className="display mt-4 max-w-4xl text-night-ink" style={{ fontSize: 'var(--text-display-1)' }}>
          When the sun goes down,
          <br />
          our work <span className="night-glow-signal">turns on.</span>
        </h2>
        <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-night-ink-muted">
          A sign earns its keep at night. Weather-sealed cabinets, branded LED
          drivers, even light across every letter — photographed on the street,
          not in a studio.
        </p>
      </div>

      {/* Desktop: 3D overlapping fan */}
      <motion.div
        className="relative mt-6 hidden md:block"
        onViewportEnter={() => setEntered(true)}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex items-end justify-center -space-x-56 overflow-hidden px-8 pb-16 pt-36 lg:-space-x-64">
          {photos.map((photo, index) => {
            const middle = Math.floor(photos.length / 2)
            const staggerOffset = 110 - Math.abs(index - middle) * 22
            const isHovered = hoveredIndex === index
            const isOtherHovered = hoveredIndex !== null && !isHovered
            const yOffset = reduceMotion ? 0 : isHovered ? -110 : isOtherHovered ? 0 : -staggerOffset

            return (
              <motion.div
                key={photo.id}
                className="shrink-0 cursor-pointer"
                style={{ zIndex: isHovered ? 40 : photos.length - index }}
                initial={
                  reduceMotion
                    ? { opacity: 1, transform: 'perspective(5000px) rotateY(0deg) translateY(0px)' }
                    : { transform: 'perspective(5000px) rotateY(-45deg) translateY(200px)', opacity: 0 }
                }
                animate={
                  entered || reduceMotion
                    ? {
                        opacity: 1,
                        transform: `perspective(5000px) rotateY(${reduceMotion ? 0 : -45}deg) translateY(${yOffset}px)`,
                      }
                    : undefined
                }
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
              >
                <Link href="/portfolio" aria-label={`${photo.alt} — view portfolio`}>
                  <WorkCard photo={photo} className="aspect-video w-80 transition-transform duration-300 hover:scale-105 lg:w-96" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Mobile: marquee */}
      <div className="relative mt-10 block overflow-hidden pb-12 md:hidden">
        <div className="flex [--duration:32s] [--gap:1rem] [gap:var(--gap)]">
          {[0, 1].map(strip => (
            <div
              key={strip}
              aria-hidden={strip > 0 || undefined}
              className="flex shrink-0 animate-marquee [gap:var(--gap)] motion-reduce:animate-none"
            >
              {photos.map(photo => (
                <Link key={`${strip}-${photo.id}`} href="/portfolio" className="block shrink-0">
                  <WorkCard photo={photo} className="aspect-video w-72" />
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-content px-5 pb-16 md:px-8 md:pb-20">
        <Link
          href="/portfolio"
          className="spec inline-flex items-center gap-2 border-2 border-night-rule px-5 py-3.5 text-night-ink transition-colors hover:border-signal-hot hover:text-signal-hot"
        >
          See all installations →
        </Link>
      </div>
    </section>
  )
}
