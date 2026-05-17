import Link from 'next/link'
import type { CSSProperties } from 'react'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import styles from './WorkshopToStreetHero.module.css'

interface Material {
  no: string
  name: string
  spec: string
}

const MATERIALS: readonly Material[] = [
  { no: '01', name: 'Acrylic sheet', spec: '3 mm · clear cast' },
  { no: '02', name: 'Vinyl roll',     spec: '440 gsm · solvent print' },
  { no: '03', name: 'LED strip',      spec: '12V · 60 LED/m · IP65' },
  { no: '04', name: 'Galv. steel',    spec: 'tubular · 30 ft pole' },
] as const

const PROOF = [
  { value: '35+',  label: 'Years in business' },
  { value: '500+', label: 'Signage installations' },
  { value: '12',   label: 'North Bengal districts' },
] as const

const MONO_STYLE: CSSProperties = {
  fontFamily: 'var(--font-mono), ui-monospace, monospace',
  fontSize: '10px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
}

export function WorkshopToStreetHero() {
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
              Assembly plate &middot; workshop &rarr; street
            </div>
          </div>
          <div className={styles.imprint} style={MONO_STYLE}>
            <div>PLATE 04</div>
            <div>EST. 1990</div>
            <div>SILIGURI</div>
          </div>
        </header>

        <hr className={styles.rule} />

        <div className={styles.stage}>
          {/* Workshop side — materials laid out */}
          <div className={styles.workshop}>
            <div className={styles.sideLabel} style={MONO_STYLE}>
              <span>Workshop &middot; Platinum Square, Siliguri</span>
              <span className={styles.sideLabelCount}>4 materials</span>
            </div>
            <div className={styles.materialsGrid}>
              {MATERIALS.map((m, i) => (
                <MaterialPlate
                  key={m.no}
                  material={m}
                  delay={i * 90}
                />
              ))}
            </div>
          </div>

          {/* Cut line — sweeps across as the sign assembles */}
          <div aria-hidden="true" className={styles.cutLine}>
            <div className={styles.cutLineHead} />
            <div className={styles.cutLineCaption} style={MONO_STYLE}>
              <span>Cut · assemble · install</span>
            </div>
          </div>

          {/* Street side — finished sign installed */}
          <div className={styles.street}>
            <div className={styles.sideLabel} style={MONO_STYLE}>
              <span>Street &middot; installed</span>
              <span className={styles.sideLabelCount}>Live</span>
            </div>
            <div className={styles.streetScene}>
              <StreetScene />
            </div>
          </div>
        </div>

        <hr className={styles.rule} />

        <div className={styles.copyRow}>
          <div className={styles.copy}>
            <h1 id="hero-title" className={styles.headline}>
              Built in our workshop.{' '}
              <em className={styles.headlineEm}>Installed on your street.</em>
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
              Quote on WhatsApp
            </a>
            <div
              className={styles.proofRail}
              role="group"
              aria-label="AD-JEET company proof"
            >
              {PROOF.map((p) => (
                <div key={p.label} className={styles.proofItem}>
                  <span className={styles.proofLabel} style={MONO_STYLE}>
                    {p.label}
                  </span>
                  <span className={styles.proofValue}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr className={styles.rule} />

        <footer className={styles.colophon}>
          <div style={MONO_STYLE} className={styles.colophonLeft}>
            01 / 01 &middot; Workshop to street
          </div>
          <div style={MONO_STYLE} className={styles.colophonRight}>
            Since 1990 &middot; 500+ installs &middot; 12 districts
          </div>
        </footer>
      </div>
    </section>
  )
}

function MaterialPlate({ material, delay }: { material: Material; delay: number }) {
  return (
    <div
      className={styles.matPlate}
      style={{ '--mat-delay': `${delay}ms` } as CSSProperties}
    >
      <svg viewBox="0 0 140 90" className={styles.matSvg} aria-hidden="true">
        {material.no === '01' && <AcrylicIllustration />}
        {material.no === '02' && <VinylRollIllustration />}
        {material.no === '03' && <LedStripIllustration />}
        {material.no === '04' && <SteelPoleIllustration />}
      </svg>
      <div className={styles.matMeta}>
        <span className={styles.matNo} style={MONO_STYLE}>
          N&deg;{material.no}
        </span>
        <span className={styles.matName}>{material.name}</span>
        <span className={styles.matSpec} style={MONO_STYLE}>
          {material.spec}
        </span>
      </div>
    </div>
  )
}

/* ─── MATERIAL ILLUSTRATIONS ────────────────────────────────── */
function AcrylicIllustration() {
  return (
    <g className={styles.matInk}>
      <rect x="22" y="18" width="96" height="56" />
      <line x1="22" y1="74" x2="118" y2="18" opacity="0.18" />
      <polyline points="22 18 28 18 28 24" />
      <polyline points="118 74 112 74 112 68" />
      <text x="70" y="86" textAnchor="middle" className={styles.matInkText}>
        2440 × 1220 mm
      </text>
    </g>
  )
}

function VinylRollIllustration() {
  return (
    <g className={styles.matInk}>
      <ellipse cx="40" cy="46" rx="12" ry="28" />
      <line x1="40" y1="18" x2="118" y2="18" />
      <line x1="40" y1="74" x2="118" y2="74" />
      <ellipse cx="118" cy="46" rx="12" ry="28" />
      <ellipse cx="40" cy="46" rx="5" ry="12" opacity="0.45" />
      <line x1="60" y1="34" x2="100" y2="34" opacity="0.35" />
      <line x1="60" y1="58" x2="100" y2="58" opacity="0.35" />
    </g>
  )
}

function LedStripIllustration() {
  return (
    <g className={styles.matInk}>
      <rect x="14" y="38" width="112" height="14" />
      {Array.from({ length: 7 }).map((_, i) => (
        <circle key={i} cx={22 + i * 16} cy={45} r="2.2" fill="currentColor" />
      ))}
      <line x1="14" y1="38" x2="6" y2="38" />
      <line x1="14" y1="52" x2="6" y2="52" />
      <line x1="126" y1="38" x2="134" y2="38" />
      <line x1="126" y1="52" x2="134" y2="52" />
      <text x="70" y="76" textAnchor="middle" className={styles.matInkText}>
        SMD 5050 · 60 LED/m
      </text>
    </g>
  )
}

function SteelPoleIllustration() {
  return (
    <g className={styles.matInk}>
      <rect x="60" y="6" width="20" height="78" />
      <rect x="46" y="78" width="48" height="8" />
      <line x1="68" y1="6" x2="68" y2="84" opacity="0.4" />
      <line x1="72" y1="6" x2="72" y2="84" opacity="0.4" />
      <circle cx="54" cy="82" r="1.4" fill="currentColor" />
      <circle cx="86" cy="82" r="1.4" fill="currentColor" />
      <text x="100" y="48" className={styles.matInkText}>
        30 ft
      </text>
    </g>
  )
}

/* ─── STREET SCENE — finished install ────────────────────────── */
function StreetScene() {
  return (
    <svg
      viewBox="0 0 360 280"
      className={styles.streetSvg}
      role="img"
      aria-label="Finished AD-JEET signage installed on a North Bengal street"
      preserveAspectRatio="xMidYMid meet"
    >
      <g className={styles.streetInk}>
        {/* Sky line / building behind */}
        <line x1="0" y1="240" x2="360" y2="240" />
        {/* Ground hatching */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={i}
            x1={20 + i * 36}
            y1={240}
            x2={4 + i * 36}
            y2={252}
            opacity="0.35"
          />
        ))}

        {/* Building */}
        <rect x="60" y="86" width="240" height="154" />
        <rect x="60" y="86" width="240" height="22" fill="none" opacity="0.55" />
        {/* Door */}
        <rect x="166" y="160" width="44" height="80" />
        <circle cx="202" cy="200" r="1.4" fill="currentColor" />
        {/* Windows */}
        <rect x="88" y="124" width="62" height="90" />
        <line x1="119" y1="124" x2="119" y2="214" opacity="0.4" />
        <line x1="88" y1="169" x2="150" y2="169" opacity="0.4" />
        <rect x="226" y="124" width="62" height="90" />
        <line x1="257" y1="124" x2="257" y2="214" opacity="0.4" />
        <line x1="226" y1="169" x2="288" y2="169" opacity="0.4" />

        {/* THE FINISHED SIGN — glow sign mounted above door */}
        <g className={styles.streetSign}>
          <ellipse cx="180" cy="62" rx="130" ry="22" className={styles.streetSignHalo} />
          <rect x="80" y="40" width="200" height="44" className={styles.streetSignBox} />
          <text
            x="180"
            y="72"
            textAnchor="middle"
            className={styles.streetSignText}
          >
            AD-JEET
          </text>
        </g>

        {/* Pedestrian silhouette for scale */}
        <g className={styles.streetPerson} opacity="0.45">
          <circle cx="40" cy="218" r="3" />
          <line x1="40" y1="221" x2="40" y2="238" strokeWidth="2" />
          <line x1="40" y1="226" x2="36" y2="234" />
          <line x1="40" y1="226" x2="44" y2="234" />
        </g>

        {/* Caption */}
        <g className={styles.streetCaption}>
          <line x1="220" y1="260" x2="346" y2="260" opacity="0.6" />
          <text x="220" y="272" className={styles.streetCaptionText}>
            INSTALLED · SHOPFRONT · SILIGURI
          </text>
        </g>
      </g>
    </svg>
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
