'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { Khand } from 'next/font/google'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import styles from './SeenWordmarkHero.module.css'

const wordmarkFont = Khand({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-wordmark',
  display: 'swap',
  preload: true,
})

type Treatment = 'flex' | 'glow' | 'acp' | 'paint'

interface Letter {
  glyph: string
  treatment: Treatment
  label: string
  service: string
}

const LETTERS: readonly Letter[] = [
  { glyph: 'S', treatment: 'flex',  label: 'Flex · 440 gsm vinyl',     service: 'Flex Printing' },
  { glyph: 'E', treatment: 'glow',  label: 'Glow · LED acrylic',       service: 'Glow Sign Boards' },
  { glyph: 'E', treatment: 'acp',   label: 'ACP · 4 mm channel',       service: 'ACP / LED Signage' },
  { glyph: 'N', treatment: 'paint', label: 'Paint · Apex exterior',    service: 'Wall Painting' },
] as const

const MONO_STYLE: CSSProperties = {
  fontFamily: 'var(--font-mono), ui-monospace, monospace',
  fontSize: '10px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
}

export function SeenWordmarkHero() {
  const waUrl = defaultWhatsAppUrl({ city: 'Siliguri' })

  return (
    <section
      id="hero-section"
      className={`${styles.hero} ${wordmarkFont.variable}`}
      aria-labelledby="hero-title"
    >
      <div aria-hidden="true" className={styles.grain} />

      <div className={styles.sheet}>
        <RegMark className={styles.regTL} />
        <RegMark className={styles.regTR} />
        <RegMark className={styles.regBL} />
        <RegMark className={styles.regBR} />

        <header className={styles.masthead}>
          <div>
            <div className={styles.brand}>AD-JEET</div>
            <div className={styles.brandSub} style={MONO_STYLE}>
              Type specimen of signage
            </div>
          </div>
          <div className={styles.imprint} style={MONO_STYLE}>
            <div>VOL. 01</div>
            <div>EST. 1990</div>
            <div>SILIGURI</div>
          </div>
        </header>

        <hr className={styles.rule} />

        <div className={styles.wordmark} aria-hidden="true">
          {LETTERS.map((letter, i) => (
            <div
              key={`${letter.glyph}-${i}`}
              className={`${styles.swatch} ${styles[`swatch_${letter.treatment}`]}`}
              style={{ '--swatch-index': i } as CSSProperties}
            >
              <div className={styles.letterStage}>
                {letter.treatment === 'glow' && <span className={styles.glowHalo} aria-hidden="true" />}
                {letter.treatment === 'acp' && <LedDots />}
                {letter.treatment === 'paint' && <BrushStroke />}
                <span className={styles.letter}>{letter.glyph}</span>
              </div>
              <span className={styles.swatchLabel} style={MONO_STYLE}>
                {letter.label}
              </span>
            </div>
          ))}
        </div>

        <span className="sr-only">
          {LETTERS.map((l) => l.service).join(', ')}
        </span>

        <hr className={styles.rule} />

        <div className={styles.copy}>
          <h1 id="hero-title" className={styles.headline}>
            Signage in Siliguri that&apos;s{' '}
            <em className={styles.headlineEm}>impossible to ignore.</em>
          </h1>
          <p className={styles.subhead}>
            Glow sign boards, flex printing, ACP/LED signage, vehicle wraps,
            wall painting and F-poles &mdash; fabricated by hand in Siliguri
            and installed across Siliguri, Jalpaiguri, Cooch Behar, Darjeeling,
            and Malda since 1990. 12 North Bengal districts in all.
          </p>
        </div>

        <div className={styles.ctaRow}>
          <Link href="/contact" className={styles.ctaPrimary}>
            Start a sign
            <span aria-hidden="true" className={styles.arrow}>→</span>
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaSecondary}
            style={MONO_STYLE}
          >
            Quote on WhatsApp
          </a>
        </div>

        <hr className={styles.rule} />

        <footer className={styles.colophon}>
          <div style={MONO_STYLE} className={styles.colophonLeft}>
            01 / 01 · Four letters
          </div>
          <div style={MONO_STYLE} className={styles.colophonRight}>
            Since 1990 · 500+ installs · 12 districts
          </div>
        </footer>

        <div className={styles.continueHint} style={MONO_STYLE} aria-hidden="true">
          cont. ↓
        </div>
      </div>
    </section>
  )
}

function RegMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <line x1="11" y1="0" x2="11" y2="22" stroke="currentColor" strokeWidth="0.7" />
      <line x1="0" y1="11" x2="22" y2="11" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="0.7" fill="none" />
    </svg>
  )
}

function LedDots() {
  return (
    <span className={styles.ledDots} aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} />
      ))}
    </span>
  )
}

function BrushStroke() {
  return (
    <svg
      className={styles.brushStroke}
      viewBox="0 0 120 40"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M 4 22 C 30 8, 64 32, 92 14 C 102 9, 112 17, 118 22"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  )
}
