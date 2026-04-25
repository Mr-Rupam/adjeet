'use client'

import { useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'

const MONO: CSSProperties = {
  fontFamily: 'var(--font-jetbrains-mono), "Courier New", monospace',
  fontSize: '10px',
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  fontWeight: 400,
}

/* ── Callout label component ─────────────────────────────────────────── */
function Callout({ x, y, label, anchor = 'right', dy = -30 }: {
  x: number; y: number; label: string; anchor?: 'left' | 'right'; dy?: number
}) {
  const lx = anchor === 'right' ? x + 60 : x - 60
  const ly = y + dy
  return (
    <g className="workshop-callout">
      <circle cx={x} cy={y} r="3" fill="#C9962E" opacity="0.9" />
      <line x1={x} y1={y} x2={lx} y2={ly} stroke="#C9962E" strokeWidth="0.7" opacity="0.6" />
      <text
        x={anchor === 'right' ? lx + 6 : lx - 6}
        y={ly + 3}
        fill="#C9962E"
        fontSize="8"
        fontFamily="var(--font-jetbrains-mono), monospace"
        letterSpacing="1.5"
        textAnchor={anchor === 'right' ? 'start' : 'end'}
        opacity="0.85"
      >
        {label}
      </text>
    </g>
  )
}

/* ── Workshop SVG illustration ───────────────────────────────────────── */
function WorkshopIllustration() {
  return (
    <svg viewBox="0 0 700 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="workshop-svg" style={{ width: '100%', height: '100%' }}>
      {/* BG LAYER — walls, shelves (slow parallax) */}
      <g className="parallax-bg">
        {/* Workshop wall */}
        <rect x="0" y="0" width="700" height="600" fill="#1A1D1F" />
        {/* Back wall panel lines */}
        <line x1="0" y1="80" x2="700" y2="80" stroke="#2A2D30" strokeWidth="0.5" />
        <line x1="0" y1="160" x2="700" y2="160" stroke="#2A2D30" strokeWidth="0.5" />
        {/* Pegboard grid */}
        {Array.from({ length: 12 }).map((_, i) =>
          Array.from({ length: 3 }).map((_, j) => (
            <circle key={`peg-${i}-${j}`} cx={80 + i * 48} cy={40 + j * 45} r="1.5" fill="#3A3D40" />
          ))
        )}
        {/* Shelf brackets */}
        <rect x="50" y="155" width="600" height="4" rx="1" fill="#2E3235" />
        {/* Items on shelf */}
        <rect x="70" y="115" width="40" height="40" rx="2" fill="#252830" stroke="#3A3D40" strokeWidth="0.5" />
        <text x="90" y="140" fill="#4A4D50" fontSize="6" textAnchor="middle" fontFamily="monospace">VINYL</text>
        <rect x="130" y="125" width="30" height="30" rx="2" fill="#1E2530" stroke="#3A3D40" strokeWidth="0.5" />
        <rect x="180" y="105" width="50" height="50" rx="2" fill="#222528" stroke="#3A3D40" strokeWidth="0.5" />
        <text x="205" y="135" fill="#4A4D50" fontSize="6" textAnchor="middle" fontFamily="monospace">ACP</text>
        {/* Paint cans */}
        <rect x="260" y="130" width="20" height="25" rx="3" fill="#2A2520" stroke="#5A4A30" strokeWidth="0.5" />
        <rect x="285" y="128" width="20" height="27" rx="3" fill="#2A2025" stroke="#5A3040" strokeWidth="0.5" />
        <rect x="310" y="132" width="20" height="23" rx="3" fill="#202A25" stroke="#305A40" strokeWidth="0.5" />
        {/* Window / light source */}
        <rect x="460" y="20" width="120" height="130" rx="2" fill="#1F2225" stroke="#3A3D40" strokeWidth="1" />
        <rect x="465" y="25" width="110" height="55" rx="1" fill="#252A32" />
        <rect x="465" y="85" width="110" height="60" rx="1" fill="#222830" />
        {/* Light rays from window */}
        <polygon points="465,150 420,350 580,350 575,150" fill="url(#lightBeam)" opacity="0.04" />
      </g>

      {/* MID LAYER — workbench, sign, primary tools (medium parallax) */}
      <g className="parallax-mid">
        {/* Workbench legs */}
        <rect x="40" y="340" width="12" height="220" fill="#3A3530" />
        <rect x="620" y="340" width="12" height="220" fill="#3A3530" />
        <rect x="320" y="370" width="10" height="190" fill="#35302A" />
        {/* Workbench surface — thick slab */}
        <rect x="30" y="325" width="620" height="22" rx="2" fill="#4A4035" stroke="#5A5045" strokeWidth="0.8" />
        {/* Wood grain lines */}
        <line x1="35" y1="332" x2="645" y2="332" stroke="#554A3F" strokeWidth="0.3" />
        <line x1="35" y1="338" x2="645" y2="338" stroke="#554A3F" strokeWidth="0.3" />
        <line x1="35" y1="342" x2="645" y2="342" stroke="#554A3F" strokeWidth="0.3" />

        {/* ── THE SIGN being fabricated ── */}
        {/* ACP board base */}
        <rect x="120" y="220" width="280" height="100" rx="3" fill="#2A3040" stroke="#4A5060" strokeWidth="1.2" />
        {/* Partially applied vinyl lettering on sign */}
        <text x="145" y="265" fill="#C8D0E0" fontSize="28" fontWeight="bold" fontFamily="sans-serif" letterSpacing="3">AD-JE</text>
        <text x="335" y="265" fill="#6A7080" fontSize="28" fontWeight="bold" fontFamily="sans-serif" letterSpacing="3" opacity="0.35">ET</text>
        {/* LED strip being attached (bottom of sign) */}
        <rect x="130" y="290" width="200" height="6" rx="2" fill="#1A1D20" stroke="#C9962E" strokeWidth="0.6" />
        {/* Individual LED dots */}
        {Array.from({ length: 16 }).map((_, i) => (
          <circle key={`led-${i}`} cx={140 + i * 12} cy={293} r="2" fill={i < 10 ? '#E8C44A' : '#3A3520'} opacity={i < 10 ? 0.9 : 0.3} />
        ))}
        {/* Loose LED strip coil */}
        <path d="M340,295 Q360,280 370,300 Q380,320 395,305" stroke="#C9962E" strokeWidth="1.5" fill="none" opacity="0.5" />

        {/* Vinyl roll on bench */}
        <ellipse cx="500" cy="310" rx="35" ry="15" fill="#2A2530" stroke="#4A3D50" strokeWidth="0.8" />
        <ellipse cx="500" cy="295" rx="35" ry="15" fill="#322A3A" stroke="#4A3D50" strokeWidth="0.8" />
        <ellipse cx="500" cy="295" rx="12" ry="5" fill="#1A1D20" />

        {/* T-square ruler */}
        <rect x="430" y="240" width="180" height="3" rx="1" fill="#6A6560" />
        <rect x="425" y="232" width="8" height="18" rx="1" fill="#7A7570" />
        {/* Ruler markings */}
        {Array.from({ length: 18 }).map((_, i) => (
          <line key={`tick-${i}`} x1={440 + i * 10} y1={240} x2={440 + i * 10} y2={i % 5 === 0 ? 237 : 239} stroke="#8A8580" strokeWidth="0.3" />
        ))}

        {/* Drill / driver */}
        <g transform="translate(80, 260) rotate(-20)">
          <rect x="0" y="0" width="45" height="16" rx="3" fill="#3A3A3A" stroke="#5A5A5A" strokeWidth="0.5" />
          <rect x="45" y="4" width="25" height="8" rx="1" fill="#555" />
          <rect x="70" y="6" width="18" height="4" rx="1" fill="#888" />
          <rect x="-5" y="6" width="8" height="14" rx="2" fill="#3A3A3A" />
        </g>

        {/* Cutting mat on bench */}
        <rect x="55" y="330" width="100" height="2" fill="#1A4A3A" opacity="0.4" />

        {/* Soldering iron */}
        <g transform="translate(420, 310) rotate(5)">
          <rect x="0" y="0" width="50" height="5" rx="2" fill="#4A4540" />
          <rect x="50" y="1" width="30" height="3" rx="1" fill="#8A8580" />
          <circle cx="82" cy="2.5" r="1.5" fill="#C9962E" opacity="0.7" />
        </g>
      </g>

      {/* FG LAYER — foreground materials, callouts (faster parallax) */}
      <g className="parallax-fg">
        {/* Stacked ACP sheets in foreground */}
        <rect x="20" y="440" width="120" height="8" rx="1" fill="#3A4050" />
        <rect x="22" y="432" width="118" height="8" rx="1" fill="#354560" />
        <rect x="18" y="424" width="122" height="8" rx="1" fill="#3A4A65" />

        {/* Floor shadow */}
        <rect x="0" y="555" width="700" height="45" fill="#151718" />

        {/* Cable / wire on floor */}
        <path d="M500,540 Q520,530 540,545 Q560,555 590,540" stroke="#C9962E" strokeWidth="1" fill="none" opacity="0.3" />

        {/* Screw/bolt box */}
        <rect x="560" y="510" width="50" height="30" rx="2" fill="#2A2520" stroke="#3A3530" strokeWidth="0.5" />
        <text x="585" y="530" fill="#4A4540" fontSize="5" textAnchor="middle" fontFamily="monospace">M6×25</text>

        {/* ── CALLOUT LABELS ── */}
        <Callout x={260} y={293} label="LED MODULE" anchor="left" dy={-35} />
        <Callout x={200} y={230} label="ACP SHEET" anchor="left" dy={-25} />
        <Callout x={500} y={300} label="VINYL ROLL" anchor="right" dy={-40} />
        <Callout x={460} y={242} label="T-SQUARE" anchor="right" dy={-20} />
        <Callout x={100} y={270} label="DRIVER" anchor="left" dy={-50} />
        <Callout x={430} y={313} label="SOLDER IRON" anchor="right" dy={25} />
        <Callout x={80} y={430} label="ACP STOCK" anchor="left" dy={20} />
        <Callout x={240} y={260} label="VINYL LETTERING" anchor="right" dy={-55} />
      </g>

      {/* Gradients & filters */}
      <defs>
        <linearGradient id="lightBeam" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#F0E8D0" />
          <stop offset="1" stopColor="#F0E8D0" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ── Main Hero ───────────────────────────────────────────────────────── */
export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const waUrl = defaultWhatsAppUrl()

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const container = containerRef.current
    if (!container) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const rect = container.getBoundingClientRect()
    const mx = (e.clientX - rect.left) / rect.width - 0.5
    const my = (e.clientY - rect.top) / rect.height - 0.5

    const bg = container.querySelector('.parallax-bg') as SVGGElement | null
    const mid = container.querySelector('.parallax-mid') as SVGGElement | null
    const fg = container.querySelector('.parallax-fg') as SVGGElement | null

    if (bg) bg.style.transform = `translate(${mx * 4}px, ${my * 3}px)`
    if (mid) mid.style.transform = `translate(${mx * 10}px, ${my * 7}px)`
    if (fg) fg.style.transform = `translate(${mx * 18}px, ${my * 12}px)`
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('mousemove', handleMouseMove)
    return () => el.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  return (
    <section
      id="hero-section"
      ref={containerRef}
      className="workshop-hero"
    >
      {/* ── LEFT: Workshop illustration (60%) ── */}
      <div className="workshop-hero-left">
        {/* Magazine-style folio */}
        <div className="workshop-folio">
          <span style={{ ...MONO, color: '#6A6560', fontSize: '8px' }}>FIG. 01</span>
          <span style={{ ...MONO, color: '#4A4540', fontSize: '8px' }}>CROSS-SECTION — WORKSHOP FLOOR</span>
        </div>

        <div className="workshop-illustration-wrap">
          <WorkshopIllustration />
        </div>

        {/* Bottom caption */}
        <div className="workshop-caption">
          <span style={{ ...MONO, color: '#5A5550', fontSize: '8px' }}>
            PATIRAM JOTE, SILIGURI · 2,400 SQ FT · OPERATIONAL SINCE 1990
          </span>
        </div>
      </div>

      {/* ── RIGHT: Type + CTAs (40%) ── */}
      <div className="workshop-hero-right">
        {/* Top label */}
        <div style={{ marginBottom: 'clamp(20px, 4vh, 48px)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 16,
          }}>
            <span style={{
              display: 'inline-block', width: 32, height: '1.5px',
              background: '#C9962E',
            }} />
            <span style={{ ...MONO, color: '#C9962E', fontSize: '9px' }}>
              THE WORKSHOP
            </span>
          </div>
        </div>

        {/* Massive type */}
        <h1 style={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontWeight: 900,
          fontSize: 'clamp(3rem, 7vw, 6.5rem)',
          lineHeight: 0.88,
          letterSpacing: '-0.04em',
          color: '#F0EDE6',
          margin: 0,
          marginBottom: 'clamp(16px, 3vh, 32px)',
        }}>
          <span style={{ display: 'block' }}>Built</span>
          <span style={{ display: 'block' }}>by</span>
          <span style={{ display: 'block', color: '#C9962E' }}>hand.</span>
        </h1>

        {/* Body text */}
        <p style={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontWeight: 400,
          fontStyle: 'italic',
          fontSize: 'clamp(1rem, 1.4vw, 1.25rem)',
          lineHeight: 1.55,
          color: 'rgba(240,237,230,0.55)',
          margin: 0,
          maxWidth: '32ch',
          marginBottom: 8,
        }}>
          Every sign leaves our Siliguri workshop measured, cut, wired, and finished by the same team
          that&apos;s been doing it for three decades.
        </p>

        {/* Specification line */}
        <p style={{
          ...MONO,
          color: 'rgba(240,237,230,0.3)',
          fontSize: '9px',
          marginTop: 12,
          marginBottom: 'clamp(24px, 5vh, 56px)',
          lineHeight: 1.8,
        }}>
          LED · ACP · Acrylic · Vinyl · Flex · MS Frame
          <br />
          15+ districts · 200+ clients · Est. 1990
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/services"
            className="workshop-cta-primary"
          >
            SEE THE WORK
            <span aria-hidden="true" style={{ fontSize: '14px' }}>→</span>
          </Link>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="workshop-cta-secondary"
          >
            GET A QUOTE
          </a>
        </div>

        {/* Bottom-right meta */}
        <div style={{
          position: 'absolute',
          bottom: 'clamp(20px, 4vh, 40px)',
          right: 0,
          ...MONO,
          fontSize: '8px',
          color: 'rgba(240,237,230,0.2)',
          textAlign: 'right',
          lineHeight: 1.8,
        }} className="workshop-bottom-meta">
          AD-JEET SIGNAGE
          <br />
          № 001 / WORKSHOP
        </div>
      </div>
    </section>
  )
}
