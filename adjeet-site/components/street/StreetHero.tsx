'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ShutterText } from '@/components/street/ShutterText'
import { QuoteCTA } from '@/components/ui/QuoteCTA'

const TICKER_ITEMS = [
  'Glow sign boards',
  'ACP / LED signage',
  'Flex printing',
  'Vehicle branding',
  'Wall painting',
  'F-pole structures',
  'In-shop branding',
  'Events & Puja',
  'One-way vision',
  'Product display',
]

function Ticker() {
  const row = (key: string, ariaHidden: boolean) => (
    <div
      key={key}
      aria-hidden={ariaHidden || undefined}
      className="flex shrink-0 items-center animate-marquee [--duration:36s] [--gap:0px] motion-reduce:animate-none"
    >
      {TICKER_ITEMS.map(item => (
        <span key={item} className="flex items-center whitespace-nowrap">
          <span className="display px-5 text-xl text-paper md:text-2xl">{item}</span>
          <span className="text-signal-hot text-lg" aria-hidden="true">✕</span>
        </span>
      ))}
    </div>
  )

  return (
    <div className="flex overflow-hidden border-y-2 border-ink bg-ink py-3">
      {row('a', false)}
      {row('b', true)}
      {row('c', true)}
    </div>
  )
}

export function StreetHero() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      id="hero-section"
      className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-paper"
    >
      {/* Cutting-mat grid + paper grain */}
      <div aria-hidden="true" className="grid-mat pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="grain pointer-events-none absolute inset-0" />

      {/* Spec strip */}
      <div className="relative mx-auto w-full max-w-content px-5 pt-6 md:px-8">
        <div className="spec flex items-baseline justify-between gap-4 border-b-2 border-ink pb-3 text-ink-muted">
          <span>Est. 1990 — Siliguri</span>
          <span className="hidden sm:inline">Signage &amp; outdoor advertising</span>
          <span className="hidden md:inline">N 26.72° / E 88.39°</span>
          <span className="text-signal">Serving 12 districts</span>
        </div>
      </div>

      {/* Wordmark */}
      <div className="relative mx-auto flex w-full max-w-content flex-1 flex-col justify-center px-5 py-10 md:px-8">
        <p className="spec mb-4 text-ink-subtle">
          <span className="mr-2 inline-block h-2 w-2 bg-signal align-baseline" aria-hidden="true" />
          North Bengal&apos;s sign makers
        </p>

        <h1 className="m-0">
          <span
            className="display glow-tube block select-none text-ink"
            style={{ fontSize: 'var(--text-mega)', letterSpacing: '0.01em' }}
          >
            <ShutterText
              text="AD JEET"
              charClassName={(char) => (char === 'J' ? 'text-signal glow-signal' : undefined)}
            />
          </span>
          <span className="sr-only">— North Bengal signage and outdoor advertising since 1990</span>
        </h1>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <p className="max-w-[44ch] text-base leading-relaxed text-ink-muted md:text-lg">
              Every glowing shopfront you pass on Hill Cart Road — someone cut,
              wired, and hung it. For 35 years, that someone has been us.{' '}
              <strong className="font-semibold text-ink">
                500+ installations. One workshop. Zero outsourcing.
              </strong>
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <QuoteCTA source="hero" label="Get a quote" />
              <Link
                href="/portfolio"
                className="spec inline-flex items-center gap-2 border-2 border-ink px-5 py-3.5 text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                See the work →
              </Link>
            </div>
          </motion.div>

          <motion.dl
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="m-0 hidden gap-6 md:flex"
          >
            {[
              { v: '35', k: 'Years' },
              { v: '500+', k: 'Signs' },
              { v: '12', k: 'Districts' },
            ].map(s => (
              <div key={s.k} className="flex flex-col border-l-2 border-ink pl-4">
                <dt className="spec order-2 text-ink-subtle">{s.k}</dt>
                <dd className="display order-1 m-0 text-4xl text-ink">{s.v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>

      {/* Services ticker */}
      <div className="relative">
        <Ticker />
      </div>
    </section>
  )
}
