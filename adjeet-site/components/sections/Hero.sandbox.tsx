'use client'

import { useState, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import styles from './Hero.sandbox.module.css'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'

// ─── Types ────────────────────────────────────────────────────────────────────

type MaterialTheme = 'glowsign' | 'acpled' | 'wallpaint'

interface Material {
  id: MaterialTheme
  label: string
  sub: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MATERIALS: Material[] = [
  { id: 'glowsign', label: 'Glow Sign', sub: 'Neon / LED backlit' },
  { id: 'acpled', label: 'ACP / LED', sub: 'Face-lit aluminium' },
  { id: 'wallpaint', label: 'Wall Paint', sub: 'Terracotta brush' },
]

const MATERIAL_SPECS: Record<MaterialTheme, { finish: string; life: string; material: string }> = {
  glowsign: { finish: 'Electroluminescent', life: '8–10 yrs', material: 'Acrylic + Flex' },
  acpled: { finish: 'Brushed Silver', life: '10–15 yrs', material: 'ACP + LED strips' },
  wallpaint: { finish: 'Weather-proof', life: '5–7 yrs', material: 'Mineral emulsion' },
}

const PLACEHOLDER = 'YOUR BRAND'
const MAX_CHARS = 12

// ─── Component ────────────────────────────────────────────────────────────────

export function HeroSandbox() {
  const prefersReducedMotion = useReducedMotion()
  const [theme, setTheme] = useState<MaterialTheme>('glowsign')
  const [text, setText] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const waUrl = defaultWhatsAppUrl()

  const displayText = text || PLACEHOLDER
  const isPlaceholder = !text
  const chars = displayText.toUpperCase().split('')
  const charCount = text.length
  const isWarn = charCount >= 10
  const specs = MATERIAL_SPECS[theme]
  const themeClass = styles[`theme-${theme}` as keyof typeof styles]

  // Focus the hidden input on stage click
  function handleStageClick() {
    inputRef.current?.focus()
  }

  return (
    <section className={`${styles['sandbox-hero']} ${themeClass}`}>
      <div className={styles['sandbox-bg']} />

      <div className={styles['sandbox-content']}>
        {/* Topbar */}
        <div className={styles['sandbox-topbar']}>
          <span className={styles['sandbox-topbar__id']}>
            AD-JEET / SIGN-STUDIO
          </span>
          <span className={styles['sandbox-topbar__hint']}>
            Click the sign to customise
          </span>
        </div>

        {/* Manifesto */}
        <p className={styles['sandbox-manifesto']}>
          <span className={styles['sandbox-manifesto__ital']}>Every brand deserves a </span>
          <span className={styles['sandbox-manifesto__hl']}>sign that stops traffic.</span>
        </p>

        {/* Stage */}
        <div
          className={styles['sandbox-stage']}
          onClick={handleStageClick}
          role="button"
          tabIndex={0}
          aria-label="Click to type your brand name on the sign"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleStageClick() }}
        >
          {/* Visually hidden real input */}
          <input
            ref={inputRef}
            className={styles['hidden-input']}
            type="text"
            maxLength={MAX_CHARS}
            value={text}
            onChange={(e) => setText(e.target.value.toUpperCase())}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-label="Type your brand name"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
          />

          {/* Sign board */}
          <div className={styles['signage-container']}>
            <div className={styles['mounting-surface']} />
            <span className={`${styles.rivet} ${styles['rivet-tl']}`} />
            <span className={`${styles.rivet} ${styles['rivet-tr']}`} />
            <span className={`${styles.rivet} ${styles['rivet-bl']}`} />
            <span className={`${styles.rivet} ${styles['rivet-br']}`} />

            <div className={styles['signage-text']}>
              <AnimatePresence mode="popLayout">
                {chars.map((char, i) => (
                  <motion.span
                    key={`${char}-${i}`}
                    className={`${styles['signage-char']} ${isPlaceholder ? styles['signage-placeholder'] : ''}`}
                    initial={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
                    transition={{ duration: 0.15, delay: i * 0.03 }}
                  >
                    {char === ' ' ? '\u00a0' : char}
                  </motion.span>
                ))}
              </AnimatePresence>
              <span className={`${styles['signage-cursor']} ${isFocused ? styles.active : ''}`} aria-hidden="true" />
            </div>
          </div>

          <div className={styles['signage-floor']} />

          {/* Character counter */}
          <p className={`${isWarn ? styles['counter--warn'] : ''}`}
            style={{ color: 'var(--sandbox-fg)', opacity: 0.6, fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
            {charCount} / {MAX_CHARS}
          </p>
        </div>

        {/* Spec card + material picker row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Spec card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              className={styles['spec-card']}
              initial={prefersReducedMotion ? undefined : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles['spec-card__head']}>
                <span className={styles['spec-card__serial']}>SPC-001</span>
                <span className={styles['spec-card__label']}>{MATERIALS.find(m => m.id === theme)?.label}</span>
              </div>
              <div className={styles['spec-card__rows']}>
                <div className={styles['spec-card__row']}>
                  <span className={styles['spec-k']}>Finish</span>
                  <span className={styles['spec-v']}>{specs.finish}</span>
                </div>
                <div className={styles['spec-card__row']}>
                  <span className={styles['spec-k']}>Material</span>
                  <span className={styles['spec-v']}>{specs.material}</span>
                </div>
                <div className={styles['spec-card__row']}>
                  <span className={styles['spec-k']}>Est. Life</span>
                  <span className={styles['spec-v']}>{specs.life}</span>
                </div>
                <div className={styles['spec-card__row']}>
                  <span className={styles['spec-k']}>Custom text</span>
                  <span className={styles['spec-v']}>{text || '—'}</span>
                </div>
              </div>
              <div className={styles['spec-card__foot']}>
                <div className={styles['spec-card__sample']} />
                <span className={styles['spec-card__qty']}>Min. qty: 1 unit</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Material picker + CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
            <div className={styles['material-picker']}>
              <span className={styles['picker-label']}>Material:</span>
              {MATERIALS.map((m) => (
                <button
                  key={m.id}
                  className={`${styles['material-btn']} ${theme === m.id ? styles.active : ''}`}
                  onClick={() => setTheme(m.id)}
                  aria-pressed={theme === m.id}
                >
                  <span className={styles['material-btn__label']}>{m.label}</span>
                  <span className={styles['material-btn__sub']}>{m.sub}</span>
                </button>
              ))}
            </div>

            <div className={styles['sandbox-ctas']}>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles['btn-primary-signage']}
              >
                <span className={styles['pulse-dot']} style={{ marginRight: '0.5rem' }} />
                Get this quote on WhatsApp
              </a>
              <Link href="/services" className={styles['btn-secondary-outline']}>
                Explore all sign types →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
