'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, type Variants } from 'framer-motion'
import { Khand } from 'next/font/google'
import { ArrowRight, Star, Sparkles } from 'lucide-react'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import styles from './PlayfulHero.module.css'

const heroDisplay = Khand({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-hero-display',
  display: 'swap',
  preload: true,
})

const fly = (
  fromX: number,
  fromY: number,
  fromRotate: number,
  delay: number
): Variants => ({
  initial: { x: fromX, y: fromY, opacity: 0, rotate: fromRotate, scale: 0.6 },
  animate: {
    x: 0,
    y: 0,
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: { duration: 1.1, delay, type: 'spring', stiffness: 70, damping: 14 },
  },
})

const fadeIn = (delay: number): Variants => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] } },
})

export function PlayfulHero() {
  const waUrl = defaultWhatsAppUrl({ city: 'Siliguri' })

  return (
    <section
      id="hero-section"
      className={`${styles.hero} ${heroDisplay.variable}`}
      aria-labelledby="hero-title"
    >
      <div className={styles.softGradient} aria-hidden="true" />

      {/* Decorative dotted ring background */}
      <svg
        className={styles.bgRing}
        viewBox="0 0 800 800"
        aria-hidden="true"
      >
        <circle cx="400" cy="400" r="320" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" opacity="0.35" />
        <circle cx="400" cy="400" r="240" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 8" opacity="0.25" />
      </svg>

      {/* Top eyebrow */}
      <motion.p
        className={styles.eyebrow}
        variants={fadeIn(0.1)}
        initial="initial"
        animate="animate"
      >
        <Sparkles size={13} strokeWidth={2.4} aria-hidden="true" />
        Crafting signage that gets noticed
        <Sparkles size={13} strokeWidth={2.4} aria-hidden="true" />
      </motion.p>

      {/* Headline */}
      <h1
        id="hero-title"
        className={styles.headline}
        aria-label="Make Your Brand Impossible to Ignore"
      >
        <motion.span variants={fadeIn(0.25)} initial="initial" animate="animate" className={styles.line}>
          Make Your Brand
        </motion.span>
        <motion.span variants={fadeIn(0.35)} initial="initial" animate="animate" className={styles.lineWithDeco}>
          <span className={styles.lineWord}>
            <span className={styles.highlightWrap} aria-hidden="true">
              <motion.span
                aria-hidden="true"
                className={styles.highlightBg}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.0, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
              <span className={styles.highlightText}>Impossible</span>
            </span>
          </span>
          <motion.span
            aria-hidden="true"
            className={styles.starDeco}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.1, type: 'spring', stiffness: 150 }}
          >
            <Star size={28} strokeWidth={2} fill="currentColor" aria-hidden="true" />
          </motion.span>
        </motion.span>
        <motion.span variants={fadeIn(0.45)} initial="initial" animate="animate" className={styles.line}>
          to Ignore
          <motion.span
            aria-hidden="true"
            className={styles.spinChip}
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          >
            <svg viewBox="0 0 60 60" width="56" height="56">
              <path
                id="circle-text-hero"
                fill="none"
                d="M 30, 30 m -22, 0 a 22,22 0 1,1 44,0 a 22,22 0 1,1 -44,0"
              />
              <text className={styles.spinChipText}>
                <textPath href="#circle-text-hero">SINCE 1990 · NORTH BENGAL · </textPath>
              </text>
              <circle cx="30" cy="30" r="6" fill="currentColor" />
            </svg>
          </motion.span>
        </motion.span>
      </h1>

      {/* Flying product images — left */}
      <motion.div
        className={`${styles.flyImg} ${styles.flyImgLeft}`}
        variants={fly(-220, 40, -18, 0.5)}
        initial="initial"
        animate="animate"
      >
        <Image
          src="/Ambuja_cement_ACP-LED.png"
          alt=""
          aria-hidden="true"
          width={260}
          height={200}
          priority
        />
        <span className={styles.flyTag}>ACP / LED · Ambuja</span>
      </motion.div>

      {/* Flying product images — right */}
      <motion.div
        className={`${styles.flyImg} ${styles.flyImgRight}`}
        variants={fly(220, -20, 14, 0.65)}
        initial="initial"
        animate="animate"
      >
        <Image
          src="/SRMB_vechile.png"
          alt=""
          aria-hidden="true"
          width={260}
          height={200}
          priority
        />
        <span className={styles.flyTag}>Vehicle wrap · SRMB</span>
      </motion.div>

      {/* Small floating sparkles */}
      <motion.span
        className={`${styles.sparkle} ${styles.sparkleA}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.9, type: 'spring' }}
        aria-hidden="true"
      >
        <Star size={18} fill="currentColor" />
      </motion.span>
      <motion.span
        className={`${styles.sparkle} ${styles.sparkleB}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring' }}
        aria-hidden="true"
      >
        <Star size={14} fill="currentColor" />
      </motion.span>
      <motion.span
        className={`${styles.sparkle} ${styles.sparkleC}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.4, type: 'spring' }}
        aria-hidden="true"
      >
        <Sparkles size={20} />
      </motion.span>

      {/* Footer row: social proof + CTA */}
      <div className={styles.footRow}>
        <motion.div
          className={styles.socialProof}
          variants={fadeIn(1.3)}
          initial="initial"
          animate="animate"
        >
          <div className={styles.avatars} aria-hidden="true">
            <span style={{ background: 'var(--ochre)' }}>A</span>
            <span style={{ background: 'var(--clay)' }}>J</span>
            <span style={{ background: 'var(--sage)' }}>S</span>
          </div>
          <div className={styles.proofText}>
            <div className={styles.stars} aria-label="Five star rating">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" />
              ))}
            </div>
            <p>
              Hand-built signage for 500+ businesses across 12 North Bengal districts since 1990.
            </p>
          </div>
        </motion.div>

        <motion.div
          className={styles.ctaWrap}
          variants={fadeIn(1.4)}
          initial="initial"
          animate="animate"
        >
          <Link href="/contact" className={styles.ctaPrimary}>
            Start a sign
            <span className={styles.ctaArrow} aria-hidden="true">
              <ArrowRight size={18} strokeWidth={2.6} />
            </span>
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaSecondary}
          >
            Quote on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  )
}
