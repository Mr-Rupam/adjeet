'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import Link from 'next/link'
import type { CSSProperties } from 'react'
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
  align: Align
  size: Size
  treatment: 'glow' | 'flex' | 'acp' | 'wrap' | 'paint' | 'pole'
}

const SPECIMENS: Spec[] = [
  { word: 'Glow',  n: '01', service: 'Glow Sign Boards',     detail: 'LED Backlit · 24V · Acrylic Face',  href: '/services/glow-sign-boards',    align: 'left',   size: 'xxl', treatment: 'glow'  },
  { word: 'Flex',  n: '02', service: 'Flex Printing',        detail: 'Solvent · 440 gsm · Eyeleted',      href: '/services/flex-printing',       align: 'right',  size: 'xl',  treatment: 'flex'  },
  { word: 'ACP',   n: '03', service: 'ACP & LED Signage',    detail: 'Aluminium Composite · 4mm Sheet',   href: '/services/acp-led-signage',     align: 'center', size: 'xxl', treatment: 'acp'   },
  { word: 'Wrap',  n: '04', service: 'Vehicle Branding',     detail: 'Cast Vinyl · 7-yr Outdoor',         href: '/services/vehicle-branding',    align: 'left',   size: 'xl',  treatment: 'wrap'  },
  { word: 'Paint', n: '05', service: 'Wall Painting',        detail: 'Apex Exterior · UV Stable',         href: '/services/wall-painting',       align: 'right',  size: 'xl',  treatment: 'paint' },
  { word: 'Pole',  n: '06', service: 'F-Pole Installation',  detail: 'Galvanised Steel · 30 ft Tower',    href: '/services/f-pole-installation', align: 'center', size: 'lg',  treatment: 'pole'  },
]

const SIZE_CLAMP: Record<Size, string> = {
  lg:  'clamp(2.75rem, 8vw, 5.5rem)',
  xl:  'clamp(3.5rem, 11vw, 7.5rem)',
  xxl: 'clamp(4.5rem, 14vw, 9.5rem)',
}

const ALIGN_CLASS: Record<Align, string> = {
  left:   'items-start text-left',
  center: 'items-center text-center',
  right:  'items-end text-right',
}

function specimenStyle(treatment: Spec['treatment'], size: Size): CSSProperties {
  const base: CSSProperties = {
    fontFamily: 'var(--font-fraunces)',
    fontWeight: 900,
    lineHeight: 0.86,
    letterSpacing: '-0.025em',
    color: 'var(--ink)',
    display: 'inline-block',
    fontSize: SIZE_CLAMP[size],
  }
  switch (treatment) {
    case 'glow':
      return {
        ...base,
        color: 'transparent',
        WebkitTextStroke: '2px var(--ink)',
        textShadow: '0 0 14px var(--ink-muted), 0 0 32px var(--ink-subtle)',
      }
    case 'flex':
      return {
        ...base,
        fontStyle: 'italic',
        transform: 'scaleX(1.25)',
        transformOrigin: 'right center',
        letterSpacing: '-0.05em',
      }
    case 'acp':
      return {
        ...base,
        fontFamily: 'var(--font-inter)',
        background: 'linear-gradient(180deg, var(--ink) 0%, var(--ink-muted) 48%, var(--ink) 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.02em',
      }
    case 'wrap':
      return {
        ...base,
        transform: 'perspective(900px) rotateY(-16deg)',
        transformOrigin: 'center',
      }
    case 'paint':
      return {
        ...base,
        fontStyle: 'italic',
        fontWeight: 700,
        transform: 'rotate(-2.5deg)',
        letterSpacing: '0.02em',
        color: 'var(--clay)',
      }
    case 'pole':
      return {
        ...base,
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }
  }
}

const MONO_STYLE: CSSProperties = {
  fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
  fontSize: '10px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
}

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
    <section
      id="hero-section"
      className="relative min-h-svh overflow-hidden bg-paper text-ink px-5 pt-20 pb-14 md:px-10 md:pt-26 md:pb-18"
    >
      {/* Paper grain */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.7 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* The printed sheet */}
      <div
        className="relative mx-auto flex flex-col"
        style={{
          maxWidth: '1280px',
          border: '1px solid var(--rule)',
          padding: 'clamp(40px, 6vw, 72px) clamp(24px, 4vw, 56px)',
          minHeight: 'calc(100svh - 152px)',
        }}
      >
        {/* Registration marks */}
        <RegMark style={{ position: 'absolute', top: '-11px', left: '-11px', color: 'var(--ink-subtle)' }} />
        <RegMark style={{ position: 'absolute', top: '-11px', right: '-11px', color: 'var(--ink-subtle)' }} />
        <RegMark style={{ position: 'absolute', bottom: '-11px', left: '-11px', color: 'var(--ink-subtle)' }} />
        <RegMark style={{ position: 'absolute', bottom: '-11px', right: '-11px', color: 'var(--ink-subtle)' }} />

        {/* Masthead */}
        <motion.header {...fadeIn(0)} className="flex justify-between items-start gap-6">
          <div>
            <div
              style={{
                fontFamily: 'var(--font-fraunces)',
                fontWeight: 800,
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                letterSpacing: '0.04em',
                lineHeight: 1,
                color: 'var(--ink)',
              }}
            >
              AD-JEET
            </div>
            <div
              style={{
                ...MONO_STYLE,
                marginTop: '8px',
                color: 'var(--ink-muted)',
                letterSpacing: '0.22em',
              }}
            >
              Type Specimen of Signage
            </div>
          </div>
          <div
            style={{
              ...MONO_STYLE,
              fontSize: '9.5px',
              color: 'var(--ink-subtle)',
              textAlign: 'right',
              lineHeight: 1.7,
              letterSpacing: '0.22em',
            }}
          >
            <div>VOL. 01</div>
            <div>EST. 1990</div>
            <div>SILIGURI</div>
          </div>
        </motion.header>

        <motion.div
          {...fadeIn(0.15)}
          style={{ height: '1px', background: 'var(--rule)', margin: '22px 0' }}
        />

        {/* Specimens */}
        <div className="flex flex-1 flex-col justify-around gap-7 md:gap-2 py-3">
          {SPECIMENS.map((s, i) => (
            <motion.article
              key={s.n}
              {...fadeIn(0.3 + i * 0.1)}
              className={`flex flex-col ${ALIGN_CLASS[s.align]}`}
            >
              <Link
                href={s.href}
                className="inline-flex flex-col text-inherit no-underline transition-opacity hover:opacity-85"
              >
                <span style={specimenStyle(s.treatment, s.size)}>{s.word}</span>
                <span
                  className={`mt-2 sm:mt-3 inline-flex flex-wrap items-center gap-1.5 sm:gap-2.5 ${
                    s.align === 'right' ? 'justify-end' : s.align === 'center' ? 'justify-center' : ''
                  }`}
                  style={{
                    ...MONO_STYLE,
                    color: 'var(--ink-muted)',
                    letterSpacing: '0.1em',
                  }}
                >
                  <span style={{ color: 'var(--ochre)', fontWeight: 700 }}>{`N°${s.n}`}</span>
                  <span style={{ width: '16px', height: '1px', background: 'var(--rule)', display: 'inline-block' }} />
                  <span style={{ fontWeight: 600, color: 'var(--ink-muted)' }}>{s.service}</span>
                  <span style={{ width: '16px', height: '1px', background: 'var(--rule)', display: 'inline-block' }} className="hidden sm:inline-block" />
                  <span style={{ color: 'var(--ink-subtle)' }} className="hidden sm:inline">{s.detail}</span>
                </span>
              </Link>
            </motion.article>
          ))}
        </div>

        <motion.div
          {...fadeIn(1.0)}
          style={{ height: '1px', background: 'var(--rule)', margin: '22px 0' }}
        />

        {/* Tagline */}
        <motion.p
          {...fadeIn(1.05)}
          className="m-0 text-center"
          style={{
            fontFamily: 'var(--font-fraunces)',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(1.125rem, 2.4vw, 1.625rem)',
            color: 'var(--ink-muted)',
            padding: '6px 0',
            maxWidth: 'none',
          }}
        >
          <span
            style={{
              color: 'var(--ochre)',
              fontWeight: 700,
              fontSize: '1.4em',
              verticalAlign: '-0.18em',
              margin: '0 4px',
              fontStyle: 'normal',
            }}
          >
            &ldquo;
          </span>
          We make brands impossible to ignore.
          <span
            style={{
              color: 'var(--ochre)',
              fontWeight: 700,
              fontSize: '1.4em',
              verticalAlign: '-0.18em',
              margin: '0 4px',
              fontStyle: 'normal',
            }}
          >
            &rdquo;
          </span>
        </motion.p>

        <motion.div
          {...fadeIn(1.1)}
          style={{ height: '1px', background: 'var(--rule)', margin: '22px 0' }}
        />

        {/* Colophon */}
        <motion.footer
          {...fadeIn(1.15)}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 transition-all hover:-translate-y-px active:scale-[0.98]"
              style={{
                padding: '14px 24px',
                background: 'var(--ink)',
                color: 'var(--paper)',
                fontFamily: 'var(--font-fraunces)',
                fontWeight: 600,
                fontSize: '15px',
                letterSpacing: '0.01em',
                textDecoration: 'none',
                borderRadius: '1px',
              }}
            >
              Commission a sign
              <span aria-hidden="true">→</span>
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center transition-colors"
              style={{
                padding: '13px 18px',
                border: '1px solid var(--rule)',
                color: 'var(--ink-muted)',
                ...MONO_STYLE,
                fontSize: '11px',
                letterSpacing: '0.18em',
                textDecoration: 'none',
                borderRadius: '1px',
              }}
            >
              WhatsApp
            </a>
          </div>
          <div
            style={{
              ...MONO_STYLE,
              fontSize: '10px',
              color: 'var(--ink-subtle)',
              letterSpacing: '0.22em',
            }}
          >
            01 / 01 · Six Specimens
          </div>
        </motion.footer>

        {/* cont. cue */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '14px',
            right: '22px',
            ...MONO_STYLE,
            fontSize: '9.5px',
            color: 'var(--ink-subtle)',
            letterSpacing: '0.22em',
            opacity: 0.7,
            pointerEvents: 'none',
          }}
        >
          cont. ↓
        </div>
      </div>
    </section>
  )
}

function RegMark({ style }: { style?: CSSProperties }) {
  return (
    <svg style={style} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <line x1="11" y1="0" x2="11" y2="22" stroke="currentColor" strokeWidth="0.7" />
      <line x1="0" y1="11" x2="22" y2="11" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="0.7" fill="none" />
    </svg>
  )
}
