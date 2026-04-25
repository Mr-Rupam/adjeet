'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { useReducedMotion } from '@/components/motion/ReducedMotionWrapper'

const SERVICES = [
  'Glow Sign Boards', 'ACP & LED Signage', 'Flex Printing',
  'Vehicle Branding', 'Wall Painting', 'F-Pole Installation',
  'In-Shop Branding', 'One-Way Vision', 'Events & Puja Decoration', 'Product Display',
]

export function Hero() {
  const reduced = useReducedMotion()
  const [powered, setPowered] = useState(false)
  const [flicker, setFlicker] = useState(false)
  const waUrl = defaultWhatsAppUrl()

  // Power-on flicker sequence
  useEffect(() => {
    if (reduced) { setPowered(true); return }
    const t1 = setTimeout(() => setFlicker(true), 400)
    const t2 = setTimeout(() => setFlicker(false), 480)
    const t3 = setTimeout(() => setFlicker(true), 560)
    const t4 = setTimeout(() => setFlicker(false), 600)
    const t5 = setTimeout(() => setPowered(true), 700)
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout)
  }, [reduced])

  return (
    <section
      id="hero-section"
      className="relative flex flex-col items-center justify-center min-h-svh overflow-hidden"
      style={{ background: '#07090C' }}
    >
      {/* ── Blueprint grid ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(79,168,224,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(79,168,224,0.06) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      {/* ── Ambient glow from the sign ── */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          inset: 0,
          background:
            'radial-gradient(ellipse 55% 35% at 50% 42%, rgba(30,127,184,0.14) 0%, transparent 70%)',
        }}
      />

      {/* ── Scan lines ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 4px)',
        }}
      />

      {/* ── Ground light spill ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '80%',
          height: '180px',
          background: 'radial-gradient(ellipse at 50% 100%, rgba(30,127,184,0.07) 0%, transparent 70%)',
        }}
      />

      {/* ══════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════ */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-5xl mx-auto pt-24 pb-32">

        {/* ── Est. badge ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4 mb-10"
        >
          <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to right, transparent, rgba(79,168,224,0.4))' }} />
          <span style={{ fontSize: '10px', letterSpacing: '0.45em', color: 'rgba(79,168,224,0.55)', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-inter)' }}>
            Est. 1990 · Siliguri, North Bengal
          </span>
          <div style={{ height: '1px', width: '48px', background: 'linear-gradient(to left, transparent, rgba(79,168,224,0.4))' }} />
        </motion.div>

        {/* ── THE SIGN ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6 w-full flex justify-center"
        >
          {/* Sign frame */}
          <div className="relative inline-block px-8 py-5 sm:px-14 sm:py-7">
            {/* Corner brackets */}
            {[
              'top-0 left-0 border-t-2 border-l-2 rounded-tl',
              'top-0 right-0 border-t-2 border-r-2 rounded-tr',
              'bottom-0 left-0 border-b-2 border-l-2 rounded-bl',
              'bottom-0 right-0 border-b-2 border-r-2 rounded-br',
            ].map((cls, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`absolute w-7 h-7 ${cls}`}
                style={{ borderColor: 'rgba(79,168,224,0.35)' }}
              />
            ))}

            {/* Corner bolts */}
            {['top-[10px] left-[10px]', 'top-[10px] right-[10px]', 'bottom-[10px] left-[10px]', 'bottom-[10px] right-[10px]'].map((pos, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`absolute ${pos} w-1.5 h-1.5 rounded-full`}
                style={{ background: 'rgba(79,168,224,0.3)' }}
              />
            ))}

            {/* AD-JEET */}
            <h1
              className={`hero-sign font-bold leading-none tracking-tight select-none transition-all duration-150 ${flicker ? 'opacity-10' : ''}`}
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontSize: 'clamp(4.5rem, 15vw, 11.5rem)',
                color: '#FFFFFF',
                textShadow: powered
                  ? '0 0 18px rgba(255,255,255,0.25), 0 0 40px rgba(79,168,224,0.55), 0 0 80px rgba(30,127,184,0.40), 0 0 130px rgba(30,127,184,0.20)'
                  : 'none',
              }}
            >
              AD-JEET
            </h1>
          </div>
        </motion.div>

        {/* ── Ochre swoosh line ── */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '140px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #C9962E, #F0C060, #C9962E, transparent)',
            borderRadius: '99px',
            marginBottom: '20px',
            transformOrigin: 'center',
          }}
        />

        {/* ── Tagline ── */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.6 }}
          style={{
            fontSize: 'clamp(0.75rem, 1.8vw, 0.95rem)',
            letterSpacing: '0.38em',
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-inter)',
            fontWeight: 500,
            marginBottom: '40px',
          }}
        >
          North Bengal&apos;s Signage Authority
        </motion.p>

        {/* ── Service ticker ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="w-full overflow-hidden mb-14"
          style={{ maskImage: 'linear-gradient(90deg, transparent, black 15%, black 85%, transparent)' }}
          aria-hidden="true"
        >
          <div
            className="ticker-track flex gap-0 whitespace-nowrap"
            style={{ animation: reduced ? 'none' : 'ticker-scroll 28s linear infinite' }}
          >
            {[...SERVICES, ...SERVICES, ...SERVICES].map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center"
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.3em',
                  color: 'rgba(79,168,224,0.4)',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-inter)',
                  fontWeight: 500,
                  paddingRight: '0',
                }}
              >
                {s}
                <span style={{ display: 'inline-block', width: '32px', textAlign: 'center', color: 'rgba(201,150,46,0.5)', fontSize: '12px' }}>·</span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── CTAs ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link
            href="/contact"
            className="hero-cta-primary"
          >
            Get a Quote
          </Link>
          <Link
            href="/services"
            className="hero-cta-ghost"
          >
            View Services
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-cta-wa"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
        </motion.div>

        {/* ── Serving line ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.6 }}
          style={{ marginTop: '24px', fontSize: '11px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.15em', fontFamily: 'var(--font-inter)' }}
        >
          Siliguri · Jalpaiguri · Cooch Behar · Darjeeling · Malda
        </motion.p>
      </div>

      {/* ── Scroll indicator ── */}
      {!reduced && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          aria-hidden="true"
        >
          <div className="scroll-line" />
        </motion.div>
      )}

      {/* ── Bottom edge line ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0"
        style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(79,168,224,0.15), transparent)' }}
      />
    </section>
  )
}
