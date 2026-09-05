'use client'

import { motion, useReducedMotion } from 'framer-motion'

/**
 * Per-character "shutter" reveal: three clipped slices sweep across each
 * letter while the letter itself blurs in, like sign panels being slotted
 * into a frame. Adapted from 21st.dev "Hero Shutter Text"
 * (daiwiikharihar17147/hero-shutter-text) for AD-JEET's token system.
 *
 * Font size/family are inherited from the parent, so wrap in a .display block.
 *
 * Accessibility: every character is drawn up to four times (one blurred
 * letter plus three clipped slices), so the decorative construction is
 * fenced off behind a single aria-hidden wrapper and the real string is
 * exposed exactly once via .sr-only. Do not reach for role="text" here:
 * it is not in the ARIA spec, effectively only Safari honours it, and in
 * Chrome it made the name-from-content walk the raw duplicated glyphs, so
 * the hero <h1> announced as "AAAADDDD JJJJEEEEEEEETTTT...".
 */
interface ShutterTextProps {
  text: string
  className?: string
  /** Per-character class: lets a run of letters take the signal colour. */
  charClassName?: (char: string, index: number) => string | undefined
  /** Seconds between each character's start. */
  delayStep?: number
  /** Seconds before the first character starts. */
  baseDelay?: number
}

const SLICES = [
  { clip: 'polygon(0 0, 100% 0, 100% 35%, 0 35%)', from: '-100%', to: '100%', lag: 0, tone: 'text-signal' },
  { clip: 'polygon(0 35%, 100% 35%, 100% 65%, 0 65%)', from: '100%', to: '-100%', lag: 0.1, tone: 'text-ink-subtle' },
  { clip: 'polygon(0 65%, 100% 65%, 100% 100%, 0 100%)', from: '-100%', to: '100%', lag: 0.2, tone: 'text-signal' },
] as const

/** Spaces render as U+00A0 so the wordmark cannot break across a line. */
const NBSP = '\u00A0'

export function ShutterText({
  text,
  className = '',
  charClassName,
  delayStep = 0.045,
  baseDelay = 0.1,
}: ShutterTextProps) {
  const reduceMotion = useReducedMotion()
  const characters = text.split('')

  if (reduceMotion) {
    return (
      <span className={className}>
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">
          {characters.map((char, i) => (
            <span
              key={i}
              data-char={char === ' ' ? NBSP : char}
              className={`shutter-char ${charClassName?.(char, i) ?? ''}`}
            />
          ))}
        </span>
      </span>
    )
  }

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex flex-wrap">
        {characters.map((char, i) => (
          <span key={i} className="relative inline-block overflow-hidden">
            <motion.span
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ delay: baseDelay + i * delayStep + 0.3, duration: 0.8 }}
              data-char={char === ' ' ? NBSP : char}
              className={`shutter-char inline-block ${charClassName?.(char, i) ?? ''}`}
            />

            {SLICES.map((slice, s) => (
              <motion.span
                key={s}
                initial={{ x: slice.from, opacity: 0 }}
                animate={{ x: slice.to, opacity: [0, 1, 0] }}
                transition={{
                  duration: 0.7,
                  delay: baseDelay + i * delayStep + slice.lag,
                  ease: 'easeInOut',
                }}
                data-char={char === ' ' ? NBSP : char}
                className={`shutter-char absolute inset-0 z-10 pointer-events-none ${slice.tone}`}
                style={{ clipPath: slice.clip }}
              />
            ))}
          </span>
        ))}
      </span>
    </span>
  )
}
