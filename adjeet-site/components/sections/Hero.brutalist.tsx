'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'

/* ─── Typographic constants ────────────────────────────────────────────── */

const MONO: CSSProperties = {
  fontFamily: 'var(--font-jetbrains-mono), "Courier New", monospace',
  fontSize: '10px',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  fontWeight: 400,
}

/* ─── Service catalog entries ──────────────────────────────────────────── */

const CATALOG = [
  { id: '01', name: 'GLOW SIGN BOARDS', spec: '4×8 ft typ.', detail: 'LED, 24V SMD strip' },
  { id: '02', name: 'ACP & LED SIGNAGE', spec: '2–200 sq ft', detail: 'Alucobond, routed' },
  { id: '03', name: 'FLEX PRINTING', spec: '40×10 ft max', detail: 'Solvent, 440 gsm' },
  { id: '04', name: 'VEHICLE BRANDING', spec: 'Full wrap', detail: 'Cast vinyl, 5 yr' },
  { id: '05', name: 'WALL PAINTING', spec: '10–500 sq ft', detail: 'Enamel, ext. grade' },
  { id: '06', name: 'F-POLE INSTALLATION', spec: '10–40 ft ht.', detail: 'MS/GI, IS 875' },
  { id: '07', name: 'IN-SHOP BRANDING', spec: 'Full store', detail: 'Acrylic, backlit' },
  { id: '08', name: 'EVENTS & PUJA', spec: '10×10 ft+', detail: 'MS arch, LED pixel' },
  { id: '09', name: 'ONE-WAY VISION', spec: 'Custom cut', detail: '50/50 perf vinyl' },
  { id: '10', name: 'PRODUCT DISPLAY', spec: 'A5–6 ft', detail: 'POS/POP, UV print' },
]

export function Hero() {
  const lineRef = useRef<HTMLDivElement>(null)
  const waUrl = defaultWhatsAppUrl()

  useEffect(() => {
    /* Single slow horizontal line draw — the only animation */
    const el = lineRef.current
    if (!el) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      el.style.transform = 'scaleX(1)'
      return
    }

    /* Start from 0, draw across over 3s after a short delay */
    el.style.transform = 'scaleX(0)'
    const timeout = setTimeout(() => {
      el.style.transition = 'transform 3s cubic-bezier(0.22, 1, 0.36, 1)'
      el.style.transform = 'scaleX(1)'
    }, 600)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <section
      id="hero-section"
      style={{
        minHeight: '100svh',
        background: '#0A0A09',
        color: '#F0EDE6',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── TOP RULE ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          height: '1px',
          background: 'rgba(240, 237, 230, 0.12)',
        }}
      />

      {/* ── TOP META ── */}
      <header
        style={{
          padding: '24px 32px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          position: 'relative',
          zIndex: 2,
          marginTop: 88,
        }}
      >
        <span style={{ ...MONO, color: 'rgba(240,237,230,0.4)' }}>
          № 001 — Catalog
        </span>
        <span style={{ ...MONO, color: 'rgba(240,237,230,0.4)' }}>
          Est. 1990 · Siliguri, WB
        </span>
      </header>

      {/* ── MAIN GRID ── */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr',
          padding: '0 32px',
          position: 'relative',
          zIndex: 2,
        }}
        className="brutalist-hero-grid"
      >
        {/* LEFT: Massive display type */}
        <div
          className="brutalist-hero-left"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Dimension annotation - top */}
          <div
            aria-hidden="true"
            className="brutalist-dim-top"
            style={{
              ...MONO,
              fontSize: '9px',
              color: 'var(--ochre, #C9962E)',
              position: 'absolute',
              top: '12%',
              left: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ display: 'inline-block', width: 40, height: '1px', background: 'var(--ochre, #C9962E)' }} />
            <span>REF. — PRIMARY MARK</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-fraunces), "Georgia", serif',
              fontWeight: 900,
              fontSize: 'clamp(4.5rem, 18vw, 16rem)',
              lineHeight: 0.82,
              letterSpacing: '-0.05em',
              margin: 0,
              padding: 0,
              color: '#F0EDE6',
              whiteSpace: 'nowrap',
              position: 'relative',
            }}
          >
            <span style={{ display: 'block' }}>AD</span>
            <span
              style={{
                display: 'block',
                paddingLeft: 'clamp(0.5rem, 3vw, 3rem)',
              }}
            >
              <span style={{ color: 'var(--ochre, #C9962E)' }}>—</span>JEET
            </span>
          </h1>

          {/* Subtitle below the type */}
          <div
            style={{
              marginTop: 'clamp(16px, 3vh, 40px)',
              maxWidth: '36ch',
            }}
          >
            <p
              style={{
                ...MONO,
                fontSize: '10.5px',
                lineHeight: 1.7,
                color: 'rgba(240,237,230,0.45)',
                margin: 0,
                letterSpacing: '0.2em',
              }}
            >
              Signage fabrication &amp; outdoor advertising.
              <br />
              North Bengal &middot; 15+ districts &middot; Since 1990.
            </p>
          </div>
        </div>

        {/* RIGHT: Tabular service index */}
        <div
          className="brutalist-hero-right"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Section label */}
          <div
            style={{
              ...MONO,
              fontSize: '9px',
              color: 'var(--ochre, #C9962E)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span>SERVICE INDEX</span>
            <span
              aria-hidden="true"
              style={{
                flex: 1,
                height: '1px',
                background: 'var(--ochre, #C9962E)',
                opacity: 0.4,
              }}
            />
            <span>10 ITEMS</span>
          </div>

          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '36px 1fr 100px 140px',
              gap: 0,
              borderBottom: '1px solid rgba(240,237,230,0.2)',
              paddingBottom: 8,
              marginBottom: 2,
            }}
            className="brutalist-table-header"
          >
            <span style={{ ...MONO, fontSize: '8px', color: 'rgba(240,237,230,0.3)' }}>NO.</span>
            <span style={{ ...MONO, fontSize: '8px', color: 'rgba(240,237,230,0.3)' }}>DESIGNATION</span>
            <span style={{ ...MONO, fontSize: '8px', color: 'rgba(240,237,230,0.3)' }} className="brutalist-spec-col">DIM.</span>
            <span style={{ ...MONO, fontSize: '8px', color: 'rgba(240,237,230,0.3)' }} className="brutalist-detail-col">SPEC.</span>
          </div>

          {/* Catalog rows */}
          <div role="list" style={{ margin: 0, padding: 0 }}>
            {CATALOG.map((item) => (
              <div
                key={item.id}
                role="listitem"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr 100px 140px',
                  gap: 0,
                  borderBottom: '1px solid rgba(240,237,230,0.06)',
                  padding: '10px 0',
                  alignItems: 'baseline',
                  cursor: 'default',
                }}
                className="brutalist-catalog-row"
              >
                {/* Number */}
                <span
                  style={{
                    fontFamily: 'var(--font-jetbrains-mono), monospace',
                    fontSize: '10px',
                    color: 'var(--ochre, #C9962E)',
                    fontWeight: 400,
                    letterSpacing: '0.1em',
                  }}
                >
                  {item.id}
                </span>

                {/* Service name */}
                <span
                  style={{
                    fontFamily: 'var(--font-fraunces), serif',
                    fontSize: 'clamp(13px, 1.1vw, 16px)',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    color: '#F0EDE6',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.name}
                </span>

                {/* Dimension */}
                <span
                  style={{
                    ...MONO,
                    fontSize: '9px',
                    color: 'rgba(240,237,230,0.4)',
                  }}
                  className="brutalist-spec-col"
                >
                  {item.spec}
                </span>

                {/* Specification */}
                <span
                  style={{
                    ...MONO,
                    fontSize: '9px',
                    color: 'rgba(240,237,230,0.3)',
                  }}
                  className="brutalist-detail-col"
                >
                  {item.detail}
                </span>
              </div>
            ))}
          </div>

          {/* Post-catalog footnote */}
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span style={{ ...MONO, fontSize: '8px', color: 'rgba(240,237,230,0.25)' }}>
              † ALL DIMENSIONS TYPICAL — CUSTOM SIZES AVAILABLE
            </span>
            <span style={{ ...MONO, fontSize: '8px', color: 'rgba(240,237,230,0.25)' }} className="brutalist-detail-col">
              REV. 2026
            </span>
          </div>
        </div>
      </div>

      {/* ── THE HORIZONTAL LINE — sole animation ── */}
      <div
        ref={lineRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '1px',
          background: 'var(--ochre, #C9962E)',
          transformOrigin: 'left center',
          transform: 'scaleX(0)',
          opacity: 0.5,
          zIndex: 1,
        }}
      />

      {/* ── BOTTOM BAR ── */}
      <footer
        style={{
          padding: '0 32px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Bottom rule */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 72,
            left: 32,
            right: 32,
            height: '1px',
            background: 'rgba(240, 237, 230, 0.1)',
          }}
        />

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/services"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '13px 26px',
              background: '#F0EDE6',
              color: '#0A0A09',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              border: 'none',
            }}
          >
            VIEW CATALOG
            <span aria-hidden="true" style={{ fontSize: '14px', marginTop: '-1px' }}>→</span>
          </Link>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '12px 22px',
              background: 'transparent',
              color: 'rgba(240,237,230,0.5)',
              border: '1px solid rgba(240,237,230,0.15)',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              fontSize: '10px',
              fontWeight: 400,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
            className="brutalist-wa-btn"
          >
            ENQUIRE
          </a>
        </div>

        {/* Bottom right annotation */}
        <span
          style={{
            ...MONO,
            fontSize: '9px',
            color: 'rgba(240,237,230,0.2)',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            marginBottom: 4,
          }}
          className="brutalist-scroll-cue"
        >
          ↓ CONTINUE
        </span>
      </footer>


    </section>
  )
}
