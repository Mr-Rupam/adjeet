'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { useReducedMotion } from '@/components/motion/ReducedMotionWrapper'

type Mode = 'day' | 'night'

interface Palette {
  skyTop: string
  skyBottom: string
  mountainFar: string
  mountainNear: string
  bldg1: string
  bldg2: string
  bldg3: string
  bldg4: string
  roof: string
  windowOff: string
  windowOn: string
  glowSign: string
  glowSignTxt: string
  acpFace: string
  acpLetter: string
  flexBg: string
  flexBand: string
  polePost: string
  poleLogo: string
  wire: string
  ground: string
  sun: number
  moon: number
  stars: number
  signGlow: number
}

const DAY: Palette = {
  skyTop: '#C5DDE8',
  skyBottom: '#F8E6C2',
  mountainFar: '#A0B5A8',
  mountainNear: '#8AA292',
  bldg1: '#D8B89A',
  bldg2: '#C9A678',
  bldg3: '#BC9264',
  bldg4: '#A88455',
  roof: '#7A5A3A',
  windowOff: '#6F5C42',
  windowOn: '#6F5C42',
  glowSign: '#3DA866',
  glowSignTxt: '#FFFFFF',
  acpFace: '#3D4A5C',
  acpLetter: '#E0E5EC',
  flexBg: '#C9582D',
  flexBand: '#FFEAC9',
  polePost: '#5A4F45',
  poleLogo: '#1E7FB8',
  wire: '#382F25',
  ground: '#7A6952',
  sun: 1,
  moon: 0,
  stars: 0,
  signGlow: 0,
}

const NIGHT: Palette = {
  skyTop: '#040714',
  skyBottom: '#0E1A2A',
  mountainFar: '#0E141A',
  mountainNear: '#181C20',
  bldg1: '#1A1A1D',
  bldg2: '#15161A',
  bldg3: '#191A1D',
  bldg4: '#121317',
  roof: '#0A0B0E',
  windowOff: '#1B1A14',
  windowOn: '#FFC368',
  glowSign: '#5DFF96',
  glowSignTxt: '#FFFFFF',
  acpFace: '#1A2030',
  acpLetter: '#F0F6FF',
  flexBg: '#FF8242',
  flexBand: '#FFE8C8',
  polePost: '#15140F',
  poleLogo: '#7ED4FA',
  wire: '#08090C',
  ground: '#070A0E',
  sun: 0,
  moon: 1,
  stars: 1,
  signGlow: 1,
}

const TRANS_FILL = 'fill 1.6s cubic-bezier(0.65, 0, 0.35, 1)'
const TRANS_OPACITY = 'opacity 1.6s cubic-bezier(0.65, 0, 0.35, 1)'
const TRANS_FILTER = 'filter 1.4s cubic-bezier(0.65, 0, 0.35, 1)'

const STARS = [
  { x: 130, y: 80, r: 1.2 }, { x: 220, y: 150, r: 0.8 }, { x: 310, y: 60, r: 1.5 },
  { x: 460, y: 120, r: 1 }, { x: 580, y: 80, r: 0.7 }, { x: 720, y: 150, r: 1.3 },
  { x: 880, y: 60, r: 0.9 }, { x: 1020, y: 130, r: 1.1 }, { x: 1180, y: 90, r: 1.4 },
  { x: 1340, y: 140, r: 0.8 }, { x: 1480, y: 70, r: 1.2 }, { x: 380, y: 200, r: 0.6 },
  { x: 940, y: 220, r: 0.7 }, { x: 1280, y: 200, r: 0.9 },
]

export function Hero() {
  const reduced = useReducedMotion()
  const [mode, setMode] = useState<Mode>('day')
  const [hasInteracted, setHasInteracted] = useState(false)
  const waUrl = defaultWhatsAppUrl()

  useEffect(() => {
    if (reduced) {
      setMode('night')
      return
    }
    if (hasInteracted) return
    const t = setTimeout(() => setMode('night'), 1900)
    return () => clearTimeout(t)
  }, [reduced, hasInteracted])

  const toggle = useCallback(() => {
    setHasInteracted(true)
    setMode(m => (m === 'day' ? 'night' : 'day'))
  }, [])

  const c = mode === 'night' ? NIGHT : DAY
  const isNight = mode === 'night'

  return (
    <section
      id="hero-section"
      className="relative overflow-hidden"
      style={{ background: c.skyTop, transition: 'background 1.6s cubic-bezier(0.65, 0, 0.35, 1)' }}
    >
      {/* Scene */}
      <div className="relative w-full" style={{ aspectRatio: '16 / 9', maxHeight: '85svh' }}>
        <Scene c={c} isNight={isNight} />

        {/* Toggle button */}
        <button
          onClick={toggle}
          aria-label={`Switch to ${isNight ? 'day' : 'night'} mode`}
          className="absolute top-5 right-5 z-20 rounded-full backdrop-blur-md transition-all hover:scale-110 active:scale-95"
          style={{
            width: 44,
            height: 44,
            background: isNight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            border: `1px solid ${isNight ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}`,
          }}
        >
          <span style={{ fontSize: 20, transition: 'all 0.3s' }}>{isNight ? '☀' : '☾'}</span>
        </button>
      </div>

      {/* Headline overlay */}
      <div className="relative">
        <div
          className="mx-auto px-6 md:px-10 -mt-20 md:-mt-32 pb-16 md:pb-24"
          style={{ maxWidth: '1280px', position: 'relative', zIndex: 10 }}
        >
          <Headline isNight={isNight} reduced={!!reduced} />
          <CTAs isNight={isNight} waUrl={waUrl} reduced={!!reduced} />
        </div>
      </div>

      {/* Bottom blend strip — fades scene into page background */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: 0,
          height: '180px',
          background: `linear-gradient(to bottom, transparent, var(--paper))`,
        }}
      />
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   THE SCENE
   ────────────────────────────────────────────────────────────────────── */
function Scene({ c, isNight }: { c: Palette; isNight: boolean }) {
  const fillStyle = (color: string): CSSProperties => ({ fill: color, transition: TRANS_FILL })
  const glowFilter = (rgb: string, intensity: number): CSSProperties => ({
    filter: isNight
      ? `drop-shadow(0 0 6px ${rgb}) drop-shadow(0 0 18px ${rgb}) drop-shadow(0 0 36px ${rgb})`
      : 'none',
    transition: TRANS_FILTER,
    opacity: isNight ? 1 : intensity,
  })

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      {/* SKY — gradient */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.skyTop} style={{ transition: 'stop-color 1.6s' }} />
          <stop offset="100%" stopColor={c.skyBottom} style={{ transition: 'stop-color 1.6s' }} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1600" height="900" fill="url(#sky)" />

      {/* STARS */}
      <g style={{ opacity: c.stars, transition: TRANS_OPACITY }}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" />
        ))}
      </g>

      {/* SUN */}
      <g style={{ opacity: c.sun, transition: TRANS_OPACITY }}>
        <circle cx="1280" cy="200" r="60" fill="#FFD78A" />
        <circle cx="1280" cy="200" r="100" fill="#FFE5B0" opacity="0.25" />
      </g>

      {/* MOON */}
      <g style={{ opacity: c.moon, transition: TRANS_OPACITY }}>
        <circle cx="280" cy="180" r="48" fill="#F0E8C8" />
        <circle cx="295" cy="170" r="6" fill="#D4CCB0" opacity="0.5" />
        <circle cx="270" cy="195" r="4" fill="#D4CCB0" opacity="0.4" />
      </g>

      {/* MOUNTAINS — far range */}
      <path
        d="M 0 540 L 180 420 L 320 480 L 480 380 L 640 460 L 820 400 L 1000 470 L 1180 410 L 1360 470 L 1520 420 L 1600 450 L 1600 600 L 0 600 Z"
        style={fillStyle(c.mountainFar)}
      />
      {/* MOUNTAINS — near range */}
      <path
        d="M 0 600 L 140 530 L 280 580 L 440 510 L 600 570 L 780 520 L 940 580 L 1120 530 L 1300 590 L 1460 540 L 1600 580 L 1600 660 L 0 660 Z"
        style={fillStyle(c.mountainNear)}
      />

      {/* GROUND PLANE */}
      <rect x="0" y="780" width="1600" height="120" style={fillStyle(c.ground)} />

      {/* ───────── BUILDING 1 — Pharmacy with pole sign ───────── */}
      {/* Building wall */}
      <rect x="120" y="450" width="240" height="330" style={fillStyle(c.bldg1)} />
      {/* Roof line */}
      <rect x="115" y="445" width="250" height="14" style={fillStyle(c.roof)} />
      {/* Windows */}
      <rect x="155" y="510" width="40" height="56" style={{ fill: c.windowOn, transition: TRANS_FILL, opacity: isNight ? 1 : 0.4 }} />
      <rect x="220" y="510" width="40" height="56" style={{ fill: c.windowOn, transition: TRANS_FILL, opacity: isNight ? 0.85 : 0.4 }} />
      <rect x="285" y="510" width="40" height="56" style={{ fill: c.windowOn, transition: TRANS_FILL, opacity: isNight ? 1 : 0.4 }} />
      <rect x="155" y="610" width="40" height="56" style={{ fill: c.windowOn, transition: TRANS_FILL, opacity: isNight ? 0.7 : 0.4 }} />
      <rect x="220" y="610" width="40" height="56" style={{ fill: c.windowOn, transition: TRANS_FILL, opacity: isNight ? 1 : 0.4 }} />
      <rect x="285" y="610" width="40" height="56" style={{ fill: c.windowOn, transition: TRANS_FILL, opacity: isNight ? 0.55 : 0.4 }} />
      {/* Door */}
      <rect x="210" y="700" width="60" height="80" fill={c.acpFace} style={{ transition: TRANS_FILL }} />

      {/* POLE SIGN — pharmacy cross */}
      <g style={glowFilter(c.glowSign, 0.4)}>
        {/* Pole */}
        <rect x="395" y="540" width="8" height="240" style={fillStyle(c.polePost)} />
        {/* Sign panel — green square */}
        <rect x="370" y="430" width="60" height="60" style={fillStyle(c.glowSign)} rx="2" />
        {/* White cross */}
        <rect x="395" y="442" width="10" height="36" fill={c.glowSignTxt} />
        <rect x="383" y="454" width="34" height="12" fill={c.glowSignTxt} />
      </g>

      {/* ───────── BUILDING 2 — ACP cladding facade ───────── */}
      <rect x="490" y="500" width="380" height="280" style={fillStyle(c.bldg2)} />
      <rect x="485" y="495" width="390" height="14" style={fillStyle(c.roof)} />

      {/* ACP cladding panel */}
      <rect x="510" y="530" width="340" height="80" style={fillStyle(c.acpFace)} rx="2" />

      {/* ACP letters — illuminated channel letters spelling "ADJEET" */}
      <g style={glowFilter(c.acpLetter, 0.3)}>
        {[
          { x: 530, ch: 'A' }, { x: 580, ch: 'D' }, { x: 625, ch: '·' },
          { x: 660, ch: 'J' }, { x: 705, ch: 'E' }, { x: 750, ch: 'E' }, { x: 795, ch: 'T' },
        ].map((l, i) => (
          <text
            key={i}
            x={l.x}
            y="585"
            fontFamily="var(--font-fraunces), serif"
            fontWeight="900"
            fontSize="44"
            style={{ fill: c.acpLetter, transition: TRANS_FILL }}
          >
            {l.ch}
          </text>
        ))}
      </g>

      {/* Building 2 windows (ground floor) */}
      <rect x="510" y="640" width="80" height="60" style={{ fill: c.windowOn, transition: TRANS_FILL, opacity: isNight ? 0.85 : 0.4 }} />
      <rect x="610" y="640" width="80" height="60" style={{ fill: c.windowOn, transition: TRANS_FILL, opacity: isNight ? 1 : 0.4 }} />
      <rect x="710" y="640" width="80" height="60" style={{ fill: c.windowOn, transition: TRANS_FILL, opacity: isNight ? 0.7 : 0.4 }} />
      <rect x="780" y="700" width="80" height="80" fill={c.acpFace} style={{ transition: TRANS_FILL }} />

      {/* ───────── BUILDING 3 — Flex banner ───────── */}
      <rect x="900" y="510" width="320" height="270" style={fillStyle(c.bldg3)} />
      <rect x="895" y="505" width="330" height="14" style={fillStyle(c.roof)} />

      {/* Flex banner stretched across upper facade */}
      <g style={glowFilter(c.flexBg, 0.2)}>
        <rect x="920" y="540" width="280" height="64" style={fillStyle(c.flexBg)} />
        {/* Banner accent stripe */}
        <rect x="920" y="595" width="280" height="9" style={fillStyle(c.flexBand)} />
        {/* Eyelet circles */}
        <circle cx="940" cy="572" r="3" fill={c.bldg3} style={{ transition: TRANS_FILL }} />
        <circle cx="1180" cy="572" r="3" fill={c.bldg3} style={{ transition: TRANS_FILL }} />
        {/* Banner text bars */}
        <rect x="960" y="558" width="100" height="8" fill={c.flexBand} style={{ transition: TRANS_FILL, opacity: 0.9 }} />
        <rect x="960" y="572" width="60" height="6" fill={c.flexBand} style={{ transition: TRANS_FILL, opacity: 0.7 }} />
        <rect x="1080" y="562" width="100" height="14" fill={c.flexBand} style={{ transition: TRANS_FILL, opacity: 0.9 }} />
      </g>

      {/* Building 3 windows */}
      <rect x="920" y="640" width="60" height="56" style={{ fill: c.windowOn, transition: TRANS_FILL, opacity: isNight ? 1 : 0.4 }} />
      <rect x="990" y="640" width="60" height="56" style={{ fill: c.windowOn, transition: TRANS_FILL, opacity: isNight ? 0.6 : 0.4 }} />
      <rect x="1060" y="640" width="60" height="56" style={{ fill: c.windowOn, transition: TRANS_FILL, opacity: isNight ? 0.9 : 0.4 }} />
      <rect x="1130" y="640" width="60" height="56" style={{ fill: c.windowOn, transition: TRANS_FILL, opacity: isNight ? 0.55 : 0.4 }} />
      <rect x="1010" y="710" width="100" height="70" fill={c.acpFace} style={{ transition: TRANS_FILL }} />

      {/* ───────── BUILDING 4 — Tall narrow with F-pole ───────── */}
      <rect x="1260" y="430" width="160" height="350" style={fillStyle(c.bldg4)} />
      <rect x="1255" y="425" width="170" height="14" style={fillStyle(c.roof)} />
      {/* Tall building windows */}
      {[460, 530, 600, 670].map(y => (
        <g key={y}>
          <rect x="1280" y={y} width="36" height="48" style={{ fill: c.windowOn, transition: TRANS_FILL, opacity: isNight ? (y % 70 === 0 ? 0.9 : 0.7) : 0.4 }} />
          <rect x="1340" y={y} width="36" height="48" style={{ fill: c.windowOn, transition: TRANS_FILL, opacity: isNight ? 1 : 0.4 }} />
        </g>
      ))}

      {/* F-POLE — rises above building */}
      <g style={glowFilter(c.poleLogo, 0.3)}>
        {/* Pole post */}
        <rect x="1335" y="220" width="6" height="210" style={fillStyle(c.polePost)} />
        {/* Cross-arm */}
        <rect x="1305" y="218" width="66" height="5" style={fillStyle(c.polePost)} />
        {/* Circular logo */}
        <circle cx="1338" cy="200" r="32" style={fillStyle(c.poleLogo)} />
        <text
          x="1338" y="212"
          textAnchor="middle"
          fontFamily="var(--font-fraunces), serif"
          fontWeight="900"
          fontSize="26"
          fill="#FFFFFF"
        >A</text>
      </g>

      {/* POWER LINES — atmospheric clutter */}
      <g style={fillStyle(c.wire)}>
        <path d="M 0 350 Q 400 380 800 360 T 1600 370" stroke={c.wire} strokeWidth="1.4" fill="none" style={{ transition: 'stroke 1.6s' }} />
        <path d="M 0 380 Q 400 410 800 390 T 1600 400" stroke={c.wire} strokeWidth="1.4" fill="none" style={{ transition: 'stroke 1.6s' }} />
      </g>

      {/* SCENE EDGE — bottom darkening for depth */}
      <rect x="0" y="850" width="1600" height="50" fill="#000" opacity="0.15" />
    </svg>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   HEADLINE
   ────────────────────────────────────────────────────────────────────── */
function Headline({ isNight, reduced }: { isNight: boolean; reduced: boolean }) {
  const baseDelay = reduced ? 0 : 0.4
  const secondLineDelay = reduced ? 0 : 2.6

  return (
    <div className="max-w-4xl">
      {/* Eyebrow */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: baseDelay - 0.2, duration: 0.5 }}
        className="flex items-center gap-3 mb-5"
      >
        <span
          style={{
            width: 36,
            height: 1,
            background: isNight ? 'rgba(255,200,120,0.5)' : 'rgba(60,40,20,0.4)',
            transition: 'background 1.6s',
            display: 'inline-block',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-jetbrains-mono), monospace',
            fontSize: 10,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: isNight ? 'rgba(255,220,170,0.7)' : 'rgba(60,40,20,0.6)',
            transition: 'color 1.6s',
            fontWeight: 600,
          }}
        >
          Est. 1990 · Siliguri, North Bengal
        </span>
      </motion.div>

      {/* Line 1 */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: baseDelay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontWeight: 800,
          fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
          lineHeight: 0.95,
          letterSpacing: '-0.025em',
          color: isNight ? '#F2EAD3' : '#1A1916',
          transition: 'color 1.6s',
        }}
      >
        Anyone can make a sign.
      </motion.div>

      {/* Line 2 */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: secondLineDelay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontWeight: 800,
          fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
          lineHeight: 0.95,
          letterSpacing: '-0.025em',
          marginTop: 6,
        }}
      >
        <span
          style={{
            color: isNight ? '#F2EAD3' : '#1A1916',
            transition: 'color 1.6s',
          }}
        >
          We make it{' '}
        </span>
        <motion.span
          initial={false}
          animate={{
            color: isNight ? '#FFD68A' : '#C9962E',
            textShadow: isNight
              ? '0 0 12px rgba(255,200,110,0.85), 0 0 36px rgba(255,170,80,0.65), 0 0 80px rgba(255,140,60,0.45), 0 0 140px rgba(255,140,60,0.25)'
              : '0 0 0 rgba(0,0,0,0)',
          }}
          transition={{ delay: reduced ? 0 : 3.0, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontStyle: 'italic',
            fontWeight: 900,
            display: 'inline-block',
          }}
        >
          glow.
        </motion.span>
      </motion.div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────
   CTAS
   ────────────────────────────────────────────────────────────────────── */
function CTAs({ isNight, waUrl, reduced }: { isNight: boolean; waUrl: string; reduced: boolean }) {
  const delay = reduced ? 0 : 3.6

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="mt-10 flex flex-wrap items-center gap-3"
    >
      <Link
        href="/services"
        className="inline-flex items-center gap-2.5 transition-all hover:-translate-y-px active:scale-[0.98]"
        style={{
          padding: '14px 26px',
          background: isNight ? '#F2EAD3' : '#1A1916',
          color: isNight ? '#1A1916' : '#F7F3EC',
          fontFamily: 'var(--font-fraunces), serif',
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: '0.01em',
          textDecoration: 'none',
          borderRadius: 2,
          boxShadow: isNight ? '0 6px 24px rgba(255,200,110,0.18)' : '0 6px 24px rgba(26,25,22,0.18)',
          transition: 'all 0.5s ease',
        }}
      >
        Explore our work
        <span aria-hidden="true">→</span>
      </Link>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 transition-colors"
        style={{
          padding: '13px 22px',
          border: `1px solid ${isNight ? 'rgba(242,234,211,0.35)' : 'rgba(26,25,22,0.25)'}`,
          color: isNight ? 'rgba(242,234,211,0.85)' : 'rgba(26,25,22,0.75)',
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          borderRadius: 2,
          transition: 'all 0.5s ease',
          fontWeight: 600,
        }}
      >
        WhatsApp
      </a>
    </motion.div>
  )
}
