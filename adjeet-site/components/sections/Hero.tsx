'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import Link from 'next/link'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { useReducedMotion } from '@/components/motion/ReducedMotionWrapper'

type Align = 'left' | 'center' | 'right'
type Size = 'lg' | 'xl' | 'xxl'

interface Spec {
  word: string
  n: string
  service: string
  detail: string
  href: string
  cls: string
  align: Align
  size: Size
}

const SPECIMENS: Spec[] = [
  { word: 'Glow',  n: '01', service: 'Glow Sign Boards',     detail: 'LED Backlit · 24V · Acrylic Face',  href: '/services/glow-sign-boards',    cls: 'spec--glow',  align: 'left',   size: 'xxl' },
  { word: 'Flex',  n: '02', service: 'Flex Printing',        detail: 'Solvent · 440 gsm · Eyeleted',      href: '/services/flex-printing',       cls: 'spec--flex',  align: 'right',  size: 'xl'  },
  { word: 'ACP',   n: '03', service: 'ACP & LED Signage',    detail: 'Aluminium Composite · 4mm Sheet',   href: '/services/acp-led-signage',     cls: 'spec--acp',   align: 'center', size: 'xxl' },
  { word: 'Wrap',  n: '04', service: 'Vehicle Branding',     detail: 'Cast Vinyl · 7-yr Outdoor',         href: '/services/vehicle-branding',    cls: 'spec--wrap',  align: 'left',   size: 'xl'  },
  { word: 'Paint', n: '05', service: 'Wall Painting',        detail: 'Apex Exterior · UV Stable',         href: '/services/wall-painting',       cls: 'spec--paint', align: 'right',  size: 'xl'  },
  { word: 'Pole',  n: '06', service: 'F-Pole Installation',  detail: 'Galvanised Steel · 30 ft Tower',    href: '/services/f-pole-installation', cls: 'spec--pole',  align: 'center', size: 'lg'  },
]

export function Hero() {
  const reduced = useReducedMotion()
  const waUrl = defaultWhatsAppUrl()

  const fadeIn = (delay: number): HTMLMotionProps<'div'> =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
        }

  return (
    <section id="hero-section" className="hero-specimen relative min-h-svh overflow-hidden">
      <div className="hero-paper" aria-hidden="true" />

      <div className="hero-sheet">
        <RegMark className="hero-reg hero-reg--tl" />
        <RegMark className="hero-reg hero-reg--tr" />
        <RegMark className="hero-reg hero-reg--bl" />
        <RegMark className="hero-reg hero-reg--br" />

        {/* ── Masthead ── */}
        <motion.header {...fadeIn(0)} className="hero-masthead">
          <div>
            <div className="masthead-title">AD-JEET</div>
            <div className="masthead-sub">Type Specimen of Signage</div>
          </div>
          <div className="masthead-meta">
            <div>VOL. 01</div>
            <div>EST. 1990</div>
            <div>SILIGURI</div>
          </div>
        </motion.header>

        <motion.div {...fadeIn(0.15)} className="hero-rule" />

        {/* ── Specimens ── */}
        <div className="hero-specimens">
          {SPECIMENS.map((s, i) => (
            <motion.article
              key={s.n}
              {...fadeIn(0.3 + i * 0.1)}
              className={`spec spec--${s.align} spec--size-${s.size}`}
            >
              <Link href={s.href} className="spec-link">
                <span className={`spec-word ${s.cls}`}>{s.word}</span>
                <span className="spec-meta">
                  <span className="spec-no">{`N°${s.n}`}</span>
                  <span className="spec-divider" />
                  <span className="spec-service">{s.service}</span>
                  <span className="spec-divider" />
                  <span className="spec-detail">{s.detail}</span>
                </span>
              </Link>
            </motion.article>
          ))}
        </div>

        <motion.div {...fadeIn(1.0)} className="hero-rule" />

        {/* ── Tagline ── */}
        <motion.p {...fadeIn(1.05)} className="hero-tagline">
          <span className="hero-tagline-mark">&ldquo;</span>
          We make brands impossible to ignore.
          <span className="hero-tagline-mark">&rdquo;</span>
        </motion.p>

        <motion.div {...fadeIn(1.1)} className="hero-rule" />

        {/* ── Colophon / Footer ── */}
        <motion.footer {...fadeIn(1.15)} className="hero-footer">
          <div className="hero-ctas">
            <Link href="/contact" className="hero-cta-primary">
              Commission a sign
              <span aria-hidden="true" className="cta-arrow">→</span>
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-cta-ghost"
            >
              WhatsApp
            </a>
          </div>
          <div className="hero-page">01 / 01 · Six Specimens</div>
        </motion.footer>

        <div className="hero-cont" aria-hidden="true">cont. ↓</div>
      </div>
    </section>
  )
}

function RegMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <line x1="11" y1="0"  x2="11" y2="22" stroke="currentColor" strokeWidth="0.7" />
      <line x1="0"  y1="11" x2="22" y2="11" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="0.7" fill="none" />
    </svg>
  )
}
