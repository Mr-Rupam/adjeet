'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { useReducedMotion } from '@/components/motion/ReducedMotionWrapper'

const HEADLINE = "North Bengal's most trusted signage company"
const WORDS = HEADLINE.split(' ')

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const wordVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as number[] } },
}

export function Hero() {
  const reduced = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)
  const waUrl = defaultWhatsAppUrl()

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 300)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="relative flex items-center min-h-svh bg-surface-inverse overflow-hidden">
      {/* Placeholder background — swap for next/image when /images/hero/bg.jpg is ready */}
      <div className="absolute inset-0 bg-slate opacity-60" />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink/70" />

      <div className="relative z-10 mx-auto max-w-content px-6 py-32">
        {/* Eyebrow */}
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-6">
          Signage · Outdoor Advertising · North Bengal
        </p>

        {/* Headline */}
        {reduced ? (
          <h1 className="text-[var(--text-display-1)] font-[var(--font-fraunces)] font-bold text-white leading-tight mb-6">
            {HEADLINE}
          </h1>
        ) : (
          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="text-[var(--text-display-1)] font-[var(--font-fraunces)] font-bold text-white leading-tight mb-6"
          >
            {WORDS.map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariant}
                className="inline-block mr-[0.25em]"
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>
        )}

        {/* Sub-copy */}
        <p className="text-white/75 text-lg max-w-xl mb-10">
          Serving Siliguri, Jalpaiguri, Cooch Behar, Darjeeling, and Malda since 1990.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded bg-blue text-white font-medium px-7 py-3.5 text-base hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            Our Services
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded border border-white/40 text-white font-medium px-7 py-3.5 text-base hover:bg-white/10 transition-colors active:scale-[0.98]"
          >
            WhatsApp Us
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      {!reduced && !scrolled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <span
            aria-hidden="true"
            className="block text-white/50 text-2xl animate-bounce"
          >
            ↓
          </span>
        </motion.div>
      )}
    </section>
  )
}
