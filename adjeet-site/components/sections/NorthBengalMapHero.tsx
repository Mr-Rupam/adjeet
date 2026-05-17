import Link from 'next/link'
import type { CSSProperties } from 'react'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import styles from './NorthBengalMapHero.module.css'

type Anchor = 'start' | 'middle' | 'end'

interface District {
  name: string
  x: number
  y: number
  labelDx: number
  labelDy: number
  anchor: Anchor
  no: string
}

const ORIGIN = { x: 218, y: 252 }

const DISTRICTS: readonly District[] = [
  { name: 'Darjeeling',        x: 195, y: 102, labelDx: -8,  labelDy: -6,  anchor: 'end',   no: '02' },
  { name: 'Kalimpong',         x: 295, y: 130, labelDx: 8,   labelDy: -4,  anchor: 'start', no: '03' },
  { name: 'Jalpaiguri',        x: 334, y: 218, labelDx: 10,  labelDy: 3,   anchor: 'start', no: '04' },
  { name: 'Alipurduar',        x: 430, y: 198, labelDx: 10,  labelDy: -4,  anchor: 'start', no: '05' },
  { name: 'Cooch Behar',       x: 462, y: 252, labelDx: 10,  labelDy: 4,   anchor: 'start', no: '06' },
  { name: 'Uttar Dinajpur',    x: 218, y: 322, labelDx: -8,  labelDy: 4,   anchor: 'end',   no: '07' },
  { name: 'Dakshin Dinajpur',  x: 320, y: 352, labelDx: 10,  labelDy: 4,   anchor: 'start', no: '08' },
  { name: 'Malda',             x: 268, y: 398, labelDx: -8,  labelDy: 4,   anchor: 'end',   no: '09' },
] as const

const MONO_STYLE: CSSProperties = {
  fontFamily: 'var(--font-mono), ui-monospace, monospace',
  fontSize: '10px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
}

export function NorthBengalMapHero() {
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
              Cartographic specimen of signage coverage
            </div>
          </div>
          <div className={styles.imprint} style={MONO_STYLE}>
            <div>PLATE 01</div>
            <div>EST. 1990</div>
            <div>SILIGURI</div>
          </div>
        </header>

        <hr className={styles.rule} />

        <div className={styles.mapWrap}>
          <svg
            viewBox="0 0 660 460"
            className={styles.map}
            role="img"
            aria-label="Map of North Bengal showing AD-JEET's Siliguri workshop and the twelve districts of signage coverage"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern id="paperHatch" patternUnits="userSpaceOnUse" width="6" height="6">
                <line x1="0" y1="6" x2="6" y2="0" stroke="currentColor" strokeWidth="0.4" opacity="0.08" />
              </pattern>
            </defs>

            {/* Region outline — stylized North Bengal shape */}
            <path
              className={styles.outline}
              d="M 175 90 Q 230 70 285 92 Q 330 105 360 145 Q 395 170 460 192 Q 495 210 502 248 Q 498 295 460 322 Q 405 350 360 360 Q 315 405 258 410 Q 200 405 175 380 Q 148 345 158 295 Q 158 215 162 175 Q 158 130 175 90 Z"
              fill="url(#paperHatch)"
            />
            <path
              className={styles.outlineStroke}
              d="M 175 90 Q 230 70 285 92 Q 330 105 360 145 Q 395 170 460 192 Q 495 210 502 248 Q 498 295 460 322 Q 405 350 360 360 Q 315 405 258 410 Q 200 405 175 380 Q 148 345 158 295 Q 158 215 162 175 Q 158 130 175 90 Z"
              fill="none"
            />

            {/* Contour line decoration */}
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                className={styles.contour}
                style={{ animationDelay: `${120 + i * 60}ms` }}
                d={`M 175 ${110 + i * 60} Q 280 ${90 + i * 60} 380 ${130 + i * 60} Q 460 ${160 + i * 60} 500 ${200 + i * 60}`}
                fill="none"
              />
            ))}

            {/* Routes from origin */}
            {DISTRICTS.map((d, i) => (
              <line
                key={`route-${d.name}`}
                className={styles.route}
                x1={ORIGIN.x}
                y1={ORIGIN.y}
                x2={d.x}
                y2={d.y}
                pathLength="1"
                style={{ '--route-i': i } as CSSProperties}
              />
            ))}

            {/* District markers + labels */}
            {DISTRICTS.map((d, i) => (
              <g
                key={`pin-${d.name}`}
                className={styles.pin}
                style={{ '--pin-i': i } as CSSProperties}
              >
                <circle cx={d.x} cy={d.y} r="3.4" className={styles.pinDot} />
                <text
                  x={d.x + d.labelDx}
                  y={d.y + d.labelDy - 8}
                  textAnchor={d.anchor}
                  className={styles.pinNo}
                >
                  N°{d.no}
                </text>
                <text
                  x={d.x + d.labelDx}
                  y={d.y + d.labelDy + 6}
                  textAnchor={d.anchor}
                  className={styles.pinName}
                >
                  {d.name}
                </text>
              </g>
            ))}

            {/* Origin: Siliguri workshop */}
            <g className={styles.origin}>
              <circle cx={ORIGIN.x} cy={ORIGIN.y} r="14" className={styles.originHalo} />
              <circle cx={ORIGIN.x} cy={ORIGIN.y} r="6" className={styles.originDot} />
              <line
                x1={ORIGIN.x - 22}
                y1={ORIGIN.y - 22}
                x2={ORIGIN.x - 8}
                y2={ORIGIN.y - 8}
                className={styles.originLeader}
              />
              <text
                x={ORIGIN.x - 24}
                y={ORIGIN.y - 26}
                textAnchor="end"
                className={styles.originNo}
              >
                N°01
              </text>
              <text
                x={ORIGIN.x - 24}
                y={ORIGIN.y - 12}
                textAnchor="end"
                className={styles.originName}
              >
                SILIGURI
              </text>
              <text
                x={ORIGIN.x - 24}
                y={ORIGIN.y + 2}
                textAnchor="end"
                className={styles.originSub}
              >
                Workshop · Platinum Square
              </text>
            </g>

            {/* Compass */}
            <g className={styles.compass} transform="translate(602, 56)">
              <line x1="0" y1="-22" x2="0" y2="22" />
              <line x1="-12" y1="0" x2="12" y2="0" />
              <polygon points="0,-22 -4,-12 4,-12" className={styles.compassArrow} />
              <text x="0" y="-28" textAnchor="middle" className={styles.compassN}>N</text>
            </g>

            {/* Scale bar */}
            <g className={styles.scale} transform="translate(28, 440)">
              <line x1="0" y1="0" x2="120" y2="0" />
              <line x1="0" y1="-4" x2="0" y2="4" />
              <line x1="60" y1="-3" x2="60" y2="3" />
              <line x1="120" y1="-4" x2="120" y2="4" />
              <text x="0" y="14" className={styles.scaleText}>~ 250 km east-west · North Bengal</text>
            </g>
          </svg>
        </div>

        <div className={styles.copyRow}>
          <div className={styles.copy}>
            <h1 id="hero-title" className={styles.headline}>
              One Siliguri workshop.{' '}
              <em className={styles.headlineEm}>Twelve districts of signage.</em>
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
          </div>
        </div>

        <hr className={styles.rule} />

        <footer className={styles.colophon}>
          <div style={MONO_STYLE} className={styles.colophonLeft}>
            01 / 01 · Twelve districts plotted
          </div>
          <div style={MONO_STYLE} className={styles.colophonRight}>
            Since 1990 · 500+ installs · 12 districts
          </div>
        </footer>
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
