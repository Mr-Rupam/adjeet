'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Anek_Latin, Khand } from 'next/font/google'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Hero.module.css'

const heroDisplay = Khand({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-hero-display',
  display: 'swap',
  preload: true,
})

const heroBody = Anek_Latin({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hero-body',
  display: 'swap',
  preload: true,
})

type Material = 'glowsign' | 'acpled' | 'wallpaint'

const SPECS: Record<Material, { label: string; serial: string; rows: { k: string; v: string }[] }> = {
  glowsign: {
    label: 'Glow Sign Board',
    serial: 'GS-01',
    rows: [
      { k: 'Cabinet', v: 'Aluminium · 4″ deep' },
      { k: 'Face', v: 'White acrylic 3mm' },
      { k: 'Lighting', v: 'SMD LED · 12V' },
      { k: 'Dimensions', v: '3 × 6 ft (custom)' },
      { k: 'Turnaround', v: '5–7 working days' },
      { k: 'Warranty', v: '12 months · hardware' },
    ],
  },
  acpled: {
    label: 'ACP Face-Lit Channel',
    serial: 'AC-02',
    rows: [
      { k: 'Panel', v: 'Alucobond · 4mm' },
      { k: 'Letters', v: 'Channel · acrylic face' },
      { k: 'Lighting', v: 'LED face module · 12V' },
      { k: 'Dimensions', v: 'Custom up to façade' },
      { k: 'Turnaround', v: '7–10 working days' },
      { k: 'Warranty', v: '12 months · hardware' },
    ],
  },
  wallpaint: {
    label: 'Hand-Painted Wall',
    serial: 'WP-03',
    rows: [
      { k: 'Paint', v: 'Exterior enamel + sealer' },
      { k: 'Style', v: 'Hand-painted / stencil' },
      { k: 'Substrate', v: 'Brick · concrete · plaster' },
      { k: 'Dimensions', v: '10 × 20 ft (typical)' },
      { k: 'Turnaround', v: '3–7 working days' },
      { k: 'Lifespan', v: '3–5 years' },
    ],
  },
}

const MATERIALS: { id: Material; label: string }[] = [
  { id: 'glowsign', label: 'Glow Sign' },
  { id: 'acpled', label: 'ACP / LED' },
  { id: 'wallpaint', label: 'Wall Paint' },
]

export function Hero() {
  const [material, setMaterial] = useState<Material>('glowsign')
  const [text, setText] = useState('AD-JEET')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const waUrl = defaultWhatsAppUrl()
  
  const spec = SPECS[material]
  const matIndex = MATERIALS.findIndex(m => m.id === material) + 1

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase()
    if (val.length <= 12) setText(val)
  }

  return (
    <section className={`${styles.section} theme-${material} ${heroDisplay.variable} ${heroBody.variable}`}>
      <div className={styles.bg} />

      {/* Meta bar */}
      <div className={styles.topbar}>
        <span className={styles.topbarBrand}>AD-JEET</span>
        <span className={styles.topbarDot} aria-hidden="true" />
        <span>Signage fabricators · Siliguri, North Bengal</span>
        <span className={styles.topbarPush}>
          <span className={styles.liveDot} aria-hidden="true" />
          Live preview
        </span>
      </div>

      {/* Two-column layout */}
      <div className={styles.content}>

        {/* Left: Authority content */}
        <div className={styles.editorial}>

          <p className={styles.eyebrow}>Est. 1990 — North Bengal&apos;s signage authority</p>

          <h1 className={styles.headline}>
            Trusted by
            <br />
            North Bengal&apos;s
            <br />
            <span className={styles.headlineAccent}>biggest brands.</span>
          </h1>

          <p className={styles.sub}>
            From glow signs to full-façade ACP branding — fabricated in-house,
            installed across North Bengal. Same-day quotes on WhatsApp.
          </p>

          {/* Trust signals */}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>35+</span>
              <span className={styles.statLabel}>Years</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>147+</span>
              <span className={styles.statLabel}>Brand clients</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>9</span>
              <span className={styles.statLabel}>Districts</span>
            </div>
          </div>

          {/* CTAs */}
          <div className={styles.ctas}>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaPrimary}
            >
              Get a quote on WhatsApp
              <span aria-hidden="true">↗</span>
            </a>
            <Link href="/portfolio" className={styles.ctaSecondary}>
              View our work
              <span aria-hidden="true">→</span>
            </Link>
          </div>

        </div>

        {/* Right: Interactive sign demo */}
        <div className={styles.demo}>

          {/* Material switcher */}
          <div className={styles.materialBar} role="group" aria-label="Preview sign material">
            <span className={styles.materialBarLabel}>Preview as</span>
            {MATERIALS.map(m => (
              <button
                key={m.id}
                onClick={() => setMaterial(m.id)}
                className={`${styles.matBtn} ${material === m.id ? styles.matBtnActive : ''}`}
                aria-pressed={material === m.id}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Sign display */}
          <div
            className={styles.signWrap}
            onClick={() => inputRef.current?.focus()}
            title="Click to type your brand name"
          >
            <motion.div
              key={material}
              className="mounting-surface"
              initial={{ opacity: 0, filter: 'brightness(0)' }}
              animate={{
                opacity: [0, 0.3, 0.1, 0.7, 0.3, 1],
                filter: [
                  'brightness(0)',
                  'brightness(0.4)',
                  'brightness(0.1)',
                  'brightness(0.9)',
                  'brightness(0.3)',
                  'brightness(1)',
                ],
              }}
              transition={{ duration: 0.7, ease: 'easeOut', times: [0, 0.15, 0.3, 0.5, 0.7, 1] }}
            >
              <span className="rivet rivet-tl" />
              <span className="rivet rivet-tr" />
              <span className="rivet rivet-bl" />
              <span className="rivet rivet-br" />

              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={handleTextChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="hidden-input"
                spellCheck={false}
                autoComplete="off"
                aria-label="Edit sign text"
              />

              <h2 className="signage-text">
                {text === '' ? (
                  <span className="signage-placeholder">YOUR BRAND</span>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {text.split('').map((char, i) => (
                      <motion.span
                        key={`${i}-${char}`}
                        initial={{ opacity: 0, y: 6, filter: 'brightness(0.2)' }}
                        animate={{ opacity: 1, y: 0, filter: 'brightness(1)' }}
                        exit={{ opacity: 0, scale: 0.9, filter: 'brightness(0)' }}
                        transition={{ duration: 0.2, delay: i * 0.02 }}
                        className="signage-char"
                      >
                        {char === ' ' ? ' ' : char}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                )}
                <span className={`signage-cursor ${isFocused ? 'active' : ''}`} />
              </h2>
            </motion.div>

            <div className="signage-floor" aria-hidden="true" />
          </div>

          {/* Spec card */}
          <aside className="spec-card">
            <div className="spec-card__head">
              <span className="spec-card__serial">№ {spec.serial}</span>
              <span className="spec-card__label">{spec.label}</span>
            </div>
            <div className="spec-card__rows">
              {spec.rows.map(r => (
                <div className="spec-card__row" key={r.k}>
                  <span className="spec-k">{r.k}</span>
                  <span className="spec-v">{r.v}</span>
                </div>
              ))}
            </div>
            <div className="spec-card__foot">
              <span className="spec-card__sample">Sample spec</span>
              <span className="spec-card__qty">0{matIndex} / {MATERIALS.length}</span>
            </div>
          </aside>

          {/* Hint */}
          <p className={styles.demoHint}>
            <span className={styles.demoHintDot} aria-hidden="true" />
            {isFocused ? 'Typing · click away when done' : 'Click sign · type your brand name'}
          </p>

        </div>
      </div>
    </section>
  )
}
