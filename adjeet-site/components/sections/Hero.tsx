'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { motion, AnimatePresence } from 'framer-motion'

type Material = 'glowsign' | 'acpled' | 'wallpaint'

const SPECS: Record<Material, {
  label: string
  serial: string
  rows: { k: string; v: string }[]
}> = {
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

const MATERIALS: { id: Material; label: string; sub: string }[] = [
  { id: 'glowsign', label: 'Glow Sign', sub: 'lit' },
  { id: 'acpled', label: 'ACP / LED', sub: 'face-lit' },
  { id: 'wallpaint', label: 'Wall Paint', sub: 'painted' },
]

export function Hero() {
  const [text, setText] = useState('AD-JEET')
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
    if (val.length <= 12) setText(val)
  }

  return (
    <section className={`sandbox-hero theme-${material}`}>
      <div className="sandbox-bg" />

      <div className="sandbox-content">

        {/* Top bar — editorial */}
        <div className="sandbox-topbar">
          <span className="sandbox-topbar__id">№ 00 — Live Sample</span>
          <span className="sandbox-topbar__hint">
            <span className="pulse-dot" />
            {isFocused ? 'Designing — type to update' : 'Click the sign · switch material'}
          </span>
        </div>

        {/* Manifesto headline */}
        <h1 className="sandbox-manifesto">
          Type your brand.<br />
          <span className="sandbox-manifesto__ital">We&apos;ll show you</span> how it looks
          <br />
          <span className="sandbox-manifesto__hl">lit</span>,{' '}
          <span className="sandbox-manifesto__hl">painted</span>, or{' '}
          <span className="sandbox-manifesto__hl">carved</span>.
        </h1>

        {/* Stage — sign + spec card */}
        <div className="sandbox-stage">

          {/* Sign sample */}
          <div
            className="signage-container"
            onClick={handleContainerClick}
            title="Click to edit your sign"
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
              {/* Rivets — only ACP shows them */}
              <span className="rivet rivet-tl" />
              <span className="rivet rivet-tr" />
              <span className="rivet rivet-bl" />
              <span className="rivet rivet-br" />

              {/* Hidden input for keystrokes */}
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

              {/* Visible sign text */}
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

            {/* Cabinet shadow / floor reflection */}
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
              <span className="spec-card__sample">SAMPLE</span>
              <span className="spec-card__qty">01 / {MATERIALS.length}</span>
            </div>
          </aside>
        </div>

        {/* Material picker */}
        <div className="material-picker">
          <span className="picker-label">MATERIAL —</span>
          {MATERIALS.map(m => (
            <button
              key={m.id}
              onClick={() => setMaterial(m.id)}
              className={`material-btn ${material === m.id ? 'active' : ''}`}
            >
              <span className="material-btn__label">{m.label}</span>
              <span className="material-btn__sub">{m.sub}</span>
            </button>
          ))}
        </div>

        {/* CTAs */}
        <div className="sandbox-ctas">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary-signage"
          >
            Build this sign <span aria-hidden="true">↗</span>
          </a>
          <Link href="/portfolio" className="btn-secondary-outline">
            View portfolio
          </Link>
        </div>

      </div>
    </section>
  )
}
