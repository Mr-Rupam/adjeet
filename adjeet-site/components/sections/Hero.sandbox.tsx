'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Anek_Latin, Khand } from 'next/font/google'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Hero.sandbox.module.css'

const heroDisplay = Khand({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-hero-display',
  display: 'swap',
})

const heroBody = Anek_Latin({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hero-body',
  display: 'swap',
})

type Material = 'glowsign' | 'acpled' | 'wallpaint'

type CharEntry = { id: string; char: string }

function getUpdatedChars(prev: CharEntry[], newText: string): CharEntry[] {
  // Find longest common prefix
  let prefixLen = 0
  while (prefixLen < prev.length && prefixLen < newText.length && prev[prefixLen].char === newText[prefixLen]) {
    prefixLen++
  }
  // Find longest common suffix (beyond the differing prefix)
  let oldEnd = prev.length
  let newEnd = newText.length
  while (oldEnd > prefixLen && newEnd > prefixLen && prev[oldEnd - 1].char === newText[newEnd - 1]) {
    oldEnd--
    newEnd--
  }
  const prefix = prev.slice(0, prefixLen)
  const suffix = prev.slice(oldEnd)
  const newMiddle = Array.from(newText.slice(prefixLen, newEnd)).map(char => ({
    id: crypto.randomUUID(),
    char,
  }))
  return [...prefix, ...newMiddle, ...suffix]
}

const THEME_CLASS: Record<Material, string> = {
  glowsign:  styles.themeGlowsign,
  acpled:    styles.themeAcpled,
  wallpaint: styles.themeWallpaint,
}

const SPECS: Record<Material, {
  label: string
  serial: string
  rows: { k: string; v: string }[]
}> = {
  glowsign: {
    label: 'Glow Sign Board',
    serial: 'GS-01',
    rows: [
      { k: 'Cabinet',    v: 'Aluminium - 4 in deep' },
      { k: 'Face',       v: 'White acrylic 3mm' },
      { k: 'Lighting',   v: 'SMD LED - 12V' },
      { k: 'Dimensions', v: '3 x 6 ft (custom)' },
      { k: 'Turnaround', v: '5-7 working days' },
      { k: 'Warranty',   v: '12 months - hardware' },
    ],
  },
  acpled: {
    label: 'ACP Face-Lit Channel',
    serial: 'AC-02',
    rows: [
      { k: 'Panel',      v: 'Alucobond - 4mm' },
      { k: 'Letters',    v: 'Channel - acrylic face' },
      { k: 'Lighting',   v: 'LED face module - 12V' },
      { k: 'Dimensions', v: 'Custom up to facade' },
      { k: 'Turnaround', v: '7-10 working days' },
      { k: 'Warranty',   v: '12 months - hardware' },
    ],
  },
  wallpaint: {
    label: 'Hand-Painted Wall',
    serial: 'WP-03',
    rows: [
      { k: 'Paint',      v: 'Exterior enamel + sealer' },
      { k: 'Style',      v: 'Hand-painted / stencil' },
      { k: 'Substrate',  v: 'Brick - concrete - plaster' },
      { k: 'Dimensions', v: '10 x 20 ft (typical)' },
      { k: 'Turnaround', v: '3-7 working days' },
      { k: 'Lifespan',   v: '3-5 years' },
    ],
  },
}

const MATERIALS: { id: Material; label: string; sub: string }[] = [
  { id: 'glowsign',  label: 'Glow Sign', sub: 'lit' },
  { id: 'acpled',    label: 'ACP / LED', sub: 'face-lit' },
  { id: 'wallpaint', label: 'Wall Paint', sub: 'painted' },
]

const MAX_CHARS = 12

export function HeroSandbox() {
  const [chars, setChars] = useState<CharEntry[]>(() =>
    Array.from('AD-JEET').map(char => ({ id: crypto.randomUUID(), char }))
  )
  const text = chars.map(c => c.char).join('')
  const [isFocused, setIsFocused] = useState(false)
  const [material, setMaterial] = useState<Material>('glowsign')
  const inputRef = useRef<HTMLInputElement>(null)
  const waUrl = defaultWhatsAppUrl()
  const spec = SPECS[material]

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase()
    if (val.length > MAX_CHARS) return
    setChars(prev => getUpdatedChars(prev, val))
  }

  return (
    <section
      className={`${styles.sandboxHero} ${THEME_CLASS[material]} ${heroDisplay.variable} ${heroBody.variable}`}
    >
      <div className={styles.sandboxBg} />

      <div className={styles.sandboxContent}>
        <div className={styles.sandboxTopbar}>
          <span className={styles.sandboxTopbarId}>No. 00 - Live Sample</span>
          <span className={styles.sandboxTopbarHint}>
            <span className={styles.pulseDot} />
            {isFocused ? 'Designing - type to update' : 'Click the sign - switch material'}
          </span>
        </div>

        <h2 className={styles.sandboxManifesto}>
          Type your brand.<br />
          <span className={styles.sandboxManifestoItal}>We&apos;ll show you</span> how it looks
          <br />
          <span className={styles.sandboxManifestoHl}>lit</span>,{' '}
          <span className={styles.sandboxManifestoHl}>painted</span>, or{' '}
          <span className={styles.sandboxManifestoHl}>carved</span>.
        </h2>

        <div className={styles.sandboxStage}>
          <div
            className={styles.signageContainer}
            onClick={handleContainerClick}
            title="Click to edit your sign"
          >
            <motion.div
              key={material}
              className={styles.mountingSurface}
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
              <span className={`${styles.rivet} ${styles.rivetTl}`} />
              <span className={`${styles.rivet} ${styles.rivetTr}`} />
              <span className={`${styles.rivet} ${styles.rivetBl}`} />
              <span className={`${styles.rivet} ${styles.rivetBr}`} />

              <input
                ref={inputRef}
                type="text"
                value={text}
                maxLength={MAX_CHARS}
                onChange={handleTextChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={styles.hiddenInput}
                spellCheck={false}
                autoComplete="off"
                aria-label="Edit sign text"
              />

              <h3 className={styles.signageText}>
                {text === '' ? (
                  <span className={styles.signagePlaceholder}>YOUR BRAND</span>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {chars.map((entry, i) => (
                      <motion.span
                        key={entry.id}
                        initial={{ opacity: 0, y: 6, filter: 'brightness(0.2)' }}
                        animate={{ opacity: 1, y: 0, filter: 'brightness(1)' }}
                        exit={{ opacity: 0, scale: 0.9, filter: 'brightness(0)' }}
                        transition={{ duration: 0.2, delay: i * 0.02 }}
                        className={styles.signageChar}
                      >
                        {entry.char === ' ' ? ' ' : entry.char}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                )}
                <span
                  className={`${styles.signageCursor} ${isFocused ? styles.signageCursorActive : ''}`}
                />
              </h3>
            </motion.div>

            <div className={styles.signageFloor} aria-hidden="true" />

            <p
              className={`${styles.counter} ${text.length >= 10 ? styles.counterWarn : ''}`}
              aria-live="polite"
              aria-label={`${text.length} of ${MAX_CHARS} characters used`}
            >
              {text.length} / {MAX_CHARS}
            </p>
          </div>

          <aside className={styles.specCard}>
            <div className={styles.specCardHead}>
              <span className={styles.specCardSerial}>No. {spec.serial}</span>
              <span className={styles.specCardLabel}>{spec.label}</span>
            </div>
            <div className={styles.specCardRows}>
              {spec.rows.map(r => (
                <div className={styles.specCardRow} key={r.k}>
                  <span className={styles.specK}>{r.k}</span>
                  <span className={styles.specV}>{r.v}</span>
                </div>
              ))}
            </div>
            <div className={styles.specCardFoot}>
              <span className={styles.specCardSample}>SAMPLE</span>
              <span className={styles.specCardQty}>01 / {MATERIALS.length}</span>
            </div>
          </aside>
        </div>

        <div className={styles.materialPicker}>
          <span className={styles.pickerLabel}>MATERIAL -</span>
          {MATERIALS.map(m => (
            <button
              key={m.id}
              onClick={() => setMaterial(m.id)}
              className={`${styles.materialBtn} ${material === m.id ? styles.materialBtnActive : ''}`}
            >
              <span className={styles.materialBtnLabel}>{m.label}</span>
              <span className={styles.materialBtnSub}>{m.sub}</span>
            </button>
          ))}
        </div>

        <div className={styles.sandboxCtas}>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnPrimarySignage}
          >
            Build this sign <span aria-hidden="true">&nearr;</span>
          </a>
          <Link href="/portfolio" className={styles.btnSecondaryOutline}>
            View portfolio
          </Link>
        </div>
      </div>
    </section>
  )
}
