'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { useReducedMotion } from '@/components/motion/ReducedMotionWrapper'

const MONO: CSSProperties = {
  fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
  fontSize: '10.5px',
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  fontWeight: 600,
}

export function Hero() {
  const reduced = useReducedMotion()
  const waUrl = defaultWhatsAppUrl()

  return (
    <section
      id="hero-section"
      className="relative overflow-hidden bg-paper"
      style={{ minHeight: '100svh' }}
    >
      {/* Subtle paper grain */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.7 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* ── TOP META BAR ── */}
      <motion.header
        initial={reduced ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="absolute left-0 right-0 px-6 md:px-12 z-10"
        style={{ top: '88px' }}
      >
        <div className="mx-auto flex justify-between items-baseline" style={{ maxWidth: '1440px' }}>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              style={{ display: 'inline-block', width: 28, height: '1px', background: 'var(--ink)', opacity: 0.4 }}
            />
            <span style={{ ...MONO, color: 'var(--ink-muted)' }}>
              Est · 1990 · Siliguri, North Bengal
            </span>
          </div>
          <span style={{ ...MONO, color: 'var(--ink-subtle)' }}>
            № 01 / Manifesto
          </span>
        </div>
      </motion.header>

      {/* ── THE WORD — overflowing typographic centerpiece ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-2">
        <motion.h1
          initial={reduced ? false : { opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'var(--font-fraunces), serif',
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: 'clamp(5rem, 26vw, 22rem)',
            lineHeight: 0.86,
            letterSpacing: '-0.045em',
            color: 'var(--ink)',
            textAlign: 'center',
            margin: 0,
            padding: 0,
            whiteSpace: 'nowrap',
            // optical adjustment: italic shift right
            transform: 'translateX(-1.2vw)',
          }}
        >
          AD-JEET
        </motion.h1>
      </div>

      {/* ── A floating "ornament" — fixed point of interest ── */}
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
        className="absolute z-10"
        style={{ top: '23%', right: 'clamp(20px, 6vw, 80px)' }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="19" stroke="var(--ochre)" strokeWidth="0.8" fill="none" />
          <circle cx="20" cy="20" r="2.5" fill="var(--ochre)" />
          <line x1="20" y1="0" x2="20" y2="6" stroke="var(--ochre)" strokeWidth="0.8" />
          <line x1="20" y1="34" x2="20" y2="40" stroke="var(--ochre)" strokeWidth="0.8" />
          <line x1="0" y1="20" x2="6" y2="20" stroke="var(--ochre)" strokeWidth="0.8" />
          <line x1="34" y1="20" x2="40" y2="20" stroke="var(--ochre)" strokeWidth="0.8" />
        </svg>
      </motion.div>

      {/* ── BOTTOM EDITORIAL BLOCK ── */}
      <div
        className="absolute left-0 right-0 px-6 md:px-12 z-10"
        style={{ bottom: 'clamp(40px, 6vh, 80px)' }}
      >
        <div className="mx-auto" style={{ maxWidth: '1440px' }}>
          {/* Hairline rule */}
          <motion.div
            initial={reduced ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: '1px',
              background: 'var(--ink)',
              opacity: 0.2,
              transformOrigin: 'left',
              marginBottom: 'clamp(20px, 3vh, 36px)',
            }}
          />

          {/* Manifesto + CTAs */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 md:gap-12">
            {/* Manifesto */}
            <div className="max-w-2xl">
              <motion.p
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: 'var(--font-fraunces), serif',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: 'clamp(1.375rem, 2.6vw, 2.125rem)',
                  lineHeight: 1.25,
                  letterSpacing: '-0.015em',
                  color: 'var(--ink)',
                  margin: 0,
                  maxWidth: '32ch',
                }}
              >
                <span style={{ color: 'var(--ochre)', fontWeight: 700, fontStyle: 'normal', fontSize: '1.4em', verticalAlign: '-0.15em', marginRight: '0.15em' }}>
                  &ldquo;
                </span>
                Most of the signs you&apos;ve seen in North Bengal&nbsp;—{' '}
                <span style={{ fontWeight: 700, fontStyle: 'italic' }}>are ours.</span>
                <span style={{ color: 'var(--ochre)', fontWeight: 700, fontStyle: 'normal', fontSize: '1.4em', verticalAlign: '-0.15em', marginLeft: '0.05em' }}>
                  &rdquo;
                </span>
              </motion.p>
              <motion.p
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                style={{
                  ...MONO,
                  color: 'var(--ink-subtle)',
                  marginTop: 18,
                  letterSpacing: '0.25em',
                }}
              >
                — Three decades of signage, one workshop in Patiram Jote
              </motion.p>
            </div>

            {/* CTAs */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.25, duration: 0.6 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Link
                href="/services"
                className="group inline-flex items-center gap-3 transition-all hover:-translate-y-px active:scale-[0.98]"
                style={{
                  padding: '15px 28px',
                  background: 'var(--ink)',
                  color: 'var(--paper)',
                  fontFamily: 'var(--font-fraunces), serif',
                  fontWeight: 600,
                  fontSize: '15px',
                  letterSpacing: '0.01em',
                  textDecoration: 'none',
                  borderRadius: '1px',
                }}
              >
                See the work
                <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center transition-colors hover:border-ink hover:text-ink"
                style={{
                  padding: '14px 22px',
                  border: '1px solid var(--rule)',
                  color: 'var(--ink-muted)',
                  ...MONO,
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  textDecoration: 'none',
                  borderRadius: '1px',
                }}
              >
                WhatsApp
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Bottom-right cont. cue ── */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          bottom: 'clamp(40px, 6vh, 80px)',
          right: 'clamp(20px, 4vw, 56px)',
          ...MONO,
          fontSize: '9.5px',
          color: 'var(--ink-subtle)',
          letterSpacing: '0.3em',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
        }}
      >
        ↓ Continue
      </motion.div>
    </section>
  )
}
