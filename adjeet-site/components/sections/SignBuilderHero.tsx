'use client'

import { useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import styles from './SignBuilderHero.module.css'

type Material = 'glow' | 'acp' | 'flex' | 'vehicle' | 'wall' | 'fpole'

interface Service {
  id: Material
  no: string
  name: string
  spec: string
  quote: string
}

const SERVICES: readonly Service[] = [
  { id: 'glow',    no: '01', name: 'Glow Sign',  spec: 'LED · acrylic',     quote: 'glow sign' },
  { id: 'acp',     no: '02', name: 'ACP / LED',  spec: '4 mm · channel',    quote: 'ACP/LED sign' },
  { id: 'flex',    no: '03', name: 'Flex',       spec: '440 gsm · vinyl',   quote: 'flex sign' },
  { id: 'vehicle', no: '04', name: 'Vehicle',    spec: 'cast vinyl wrap',   quote: 'vehicle wrap' },
  { id: 'wall',    no: '05', name: 'Wall Paint', spec: 'apex exterior',     quote: 'wall painting' },
  { id: 'fpole',   no: '06', name: 'F-Pole',     spec: 'galv. steel · 30ft', quote: 'F-pole installation' },
] as const

const MONO_STYLE: CSSProperties = {
  fontFamily: 'var(--font-mono), ui-monospace, monospace',
  fontSize: '10px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
}

export function SignBuilderHero() {
  const [active, setActive] = useState<Material>('glow')
  const current = SERVICES.find((s) => s.id === active)!
  const waUrl = defaultWhatsAppUrl({ city: 'Siliguri' })

  return (
    <section
      id="hero-section"
      className={styles.hero}
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
              Specification plates &middot; six materials, one shopfront
            </div>
          </div>
          <div className={styles.imprint} style={MONO_STYLE}>
            <div>PLATE 0{SERVICES.findIndex((s) => s.id === active) + 1}</div>
            <div>EST. 1990</div>
            <div>SILIGURI</div>
          </div>
        </header>

        <hr className={styles.rule} />

        <div className={styles.stage}>
          <div className={styles.facadeWrap}>
            <svg
              viewBox="0 0 660 440"
              className={styles.facade}
              role="img"
              aria-label={`Architectural elevation of a shopfront with AD-JEET ${current.name} signage applied`}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* SHOPFRONT ELEVATION — baseline drawing */}
              <BaseFacade />

              {/* Material overlays — only the active one renders */}
              {active === 'glow' && <GlowOverlay />}
              {active === 'acp' && <AcpOverlay />}
              {active === 'flex' && <FlexOverlay />}
              {active === 'vehicle' && <VehicleOverlay />}
              {active === 'wall' && <WallOverlay />}
              {active === 'fpole' && <FpoleOverlay />}

              {/* Plate label bottom-right of drawing */}
              <g className={styles.plateLabel}>
                <line x1="450" y1="412" x2="554" y2="412" />
                <text x="450" y="426" className={styles.plateText}>
                  PLATE 0{SERVICES.findIndex((s) => s.id === active) + 1} &middot;{' '}
                  {current.name.toUpperCase()}
                </text>
                <text x="450" y="436" className={styles.plateSpec}>
                  {current.spec}
                </text>
              </g>
            </svg>
          </div>

          <div className={styles.chipColumn}>
            <div className={styles.chipColHeader} style={MONO_STYLE}>
              <span>Tap a material</span>
              <span className={styles.chipColCount}>
                {SERVICES.findIndex((s) => s.id === active) + 1} / 6
              </span>
            </div>
            <ul className={styles.chipList}>
              {SERVICES.map((s) => {
                const isActive = s.id === active
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
                      onClick={() => setActive(s.id)}
                      aria-pressed={isActive}
                    >
                      <span className={styles.chipNo} style={MONO_STYLE}>
                        N&deg;{s.no}
                      </span>
                      <span className={styles.chipName}>{s.name}</span>
                      <span className={styles.chipSpec} style={MONO_STYLE}>
                        {s.spec}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <hr className={styles.rule} />

        <div className={styles.copyRow}>
          <div className={styles.copy}>
            <h1 id="hero-title" className={styles.headline}>
              Pick a material.{' '}
              <em className={styles.headlineEm}>See your Siliguri sign.</em>
            </h1>
            <p className={styles.subhead}>
              Glow sign boards, flex printing, ACP/LED signage, vehicle wraps,
              wall painting and F-poles &mdash; fabricated by hand in Siliguri
              and installed across Siliguri, Jalpaiguri, Cooch Behar,
              Darjeeling, and Malda since 1990.
            </p>
          </div>
          <div className={styles.ctaCol}>
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
              Quote this {current.quote}
            </a>
          </div>
        </div>

        <hr className={styles.rule} />

        <footer className={styles.colophon}>
          <div style={MONO_STYLE} className={styles.colophonLeft}>
            01 / 01 &middot; Six specification plates
          </div>
          <div style={MONO_STYLE} className={styles.colophonRight}>
            Since 1990 &middot; 500+ installs &middot; 12 districts
          </div>
        </footer>
      </div>
    </section>
  )
}

/* ─── BASE ELEVATION ────────────────────────────────────────── */
function BaseFacade() {
  return (
    <g className={styles.base}>
      {/* Ground line */}
      <line x1="40" y1="396" x2="620" y2="396" />
      {/* Ground hatching */}
      {Array.from({ length: 14 }).map((_, i) => (
        <line
          key={i}
          x1={50 + i * 42}
          y1={396}
          x2={32 + i * 42}
          y2={408}
          opacity={0.3}
        />
      ))}

      {/* Building outline — flat-front shop */}
      <rect x="100" y="120" width="460" height="276" />
      {/* Parapet top */}
      <line x1="92" y1="120" x2="568" y2="120" strokeWidth="2" />
      {/* Cornice band */}
      <rect x="100" y="120" width="460" height="32" fill="none" opacity="0.5" />

      {/* Door */}
      <rect x="296" y="270" width="68" height="126" />
      {/* Door handle */}
      <circle cx="354" cy="335" r="1.6" fill="currentColor" />

      {/* Left window */}
      <rect x="140" y="190" width="120" height="160" />
      <line x1="200" y1="190" x2="200" y2="350" opacity="0.5" />
      <line x1="140" y1="270" x2="260" y2="270" opacity="0.5" />

      {/* Right window */}
      <rect x="400" y="190" width="120" height="160" />
      <line x1="460" y1="190" x2="460" y2="350" opacity="0.5" />
      <line x1="400" y1="270" x2="520" y2="270" opacity="0.5" />

      {/* Shutter box hint above (where signs go) */}
      <line x1="120" y1="158" x2="540" y2="158" opacity="0.35" strokeDasharray="3 4" />

      {/* Dimension marker — vertical building height */}
      <g opacity="0.45">
        <line x1="78" y1="120" x2="78" y2="396" strokeWidth="0.6" />
        <line x1="74" y1="120" x2="82" y2="120" strokeWidth="0.6" />
        <line x1="74" y1="396" x2="82" y2="396" strokeWidth="0.6" />
        <text x="70" y="262" textAnchor="end" className={styles.dim}>
          12&apos;0&quot;
        </text>
      </g>
    </g>
  )
}

/* ─── MATERIAL OVERLAYS ─────────────────────────────────────── */
function GlowOverlay() {
  return (
    <g className={styles.overlay}>
      {/* Halo */}
      <ellipse cx="330" cy="92" rx="200" ry="34" className={styles.glowHaloShape} />
      {/* Sign box */}
      <rect x="135" y="62" width="390" height="60" className={styles.glowBox} />
      {/* Letters: AD-JEET */}
      <text x="330" y="105" textAnchor="middle" className={styles.glowText}>
        AD-JEET
      </text>
    </g>
  )
}

function AcpOverlay() {
  return (
    <g className={styles.overlay}>
      {/* Channel letter back-panel hint */}
      <rect x="160" y="74" width="340" height="50" className={styles.acpPanel} />
      {/* Brushed-metal letters */}
      <text x="330" y="112" textAnchor="middle" className={styles.acpText}>
        AD&middot;JEET
      </text>
    </g>
  )
}

function FlexOverlay() {
  return (
    <g className={styles.overlay}>
      {/* Banner rope from corners */}
      <line x1="105" y1="125" x2="135" y2="78" className={styles.flexRope} />
      <line x1="555" y1="125" x2="525" y2="78" className={styles.flexRope} />
      {/* Banner cloth — printed vinyl */}
      <path
        d="M 135 78 Q 330 96 525 78 L 525 130 Q 330 150 135 130 Z"
        className={styles.flexBanner}
      />
      {/* Grommets */}
      <circle cx="142" cy="84" r="2.2" className={styles.flexGrommet} />
      <circle cx="518" cy="84" r="2.2" className={styles.flexGrommet} />
      <text x="330" y="118" textAnchor="middle" className={styles.flexText}>
        GRAND OPENING &middot; AD-JEET
      </text>
    </g>
  )
}

function VehicleOverlay() {
  return (
    <g className={styles.overlay}>
      {/* Van outline parked left of shop */}
      <g transform="translate(-26 286)">
        {/* Body */}
        <path d="M 0 60 L 0 30 L 22 12 L 110 12 L 138 30 L 138 60 Z" className={styles.vanBody} />
        {/* Cabin window */}
        <path d="M 22 18 L 56 18 L 56 30 L 14 30 Z" className={styles.vanWindow} />
        {/* Cargo panel — branded wrap */}
        <rect x="62" y="20" width="74" height="28" className={styles.vanWrap} />
        <text x="99" y="38" textAnchor="middle" className={styles.vanText}>
          AD-JEET
        </text>
        {/* Wheels */}
        <circle cx="32" cy="60" r="10" className={styles.vanWheel} />
        <circle cx="116" cy="60" r="10" className={styles.vanWheel} />
        <circle cx="32" cy="60" r="4" fill="currentColor" />
        <circle cx="116" cy="60" r="4" fill="currentColor" />
      </g>
    </g>
  )
}

function WallOverlay() {
  return (
    <g className={styles.overlay}>
      {/* Side wall painted area — to the right of building */}
      <g transform="translate(572 168)">
        <rect x="0" y="0" width="58" height="200" className={styles.wallSurface} />
        {/* Hand-painted letters running vertical */}
        <text
          x="29"
          y="100"
          textAnchor="middle"
          className={styles.wallText}
          transform="rotate(-90 29 100)"
        >
          AD-JEET
        </text>
        {/* Brush stroke past edge */}
        <path
          d="M 4 192 Q 14 198 24 190"
          className={styles.wallBrush}
          fill="none"
        />
      </g>
    </g>
  )
}

function FpoleOverlay() {
  return (
    <g className={styles.overlay}>
      {/* Pole on left side of shop */}
      <g transform="translate(56 0)">
        {/* Base plate */}
        <rect x="-12" y="392" width="32" height="8" className={styles.poleBase} />
        {/* Pole shaft */}
        <rect x="0" y="58" width="8" height="338" className={styles.poleShaft} />
        {/* Sign panel at top */}
        <rect x="-40" y="48" width="120" height="60" className={styles.poleSign} />
        <text x="20" y="86" textAnchor="middle" className={styles.poleText}>
          AD-JEET
        </text>
        {/* Bolts on base */}
        <circle cx="-6" cy="396" r="1.4" fill="currentColor" />
        <circle cx="14" cy="396" r="1.4" fill="currentColor" />
      </g>
    </g>
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
