'use client'

import Link from 'next/link'
import { useEffect, useState, type CSSProperties } from 'react'
import { ArrowUpRight, Pause, Play } from 'lucide-react'
import { LoadingImage as Image } from '@/components/ui/LoadingImage'
import { useReducedMotion } from '@/components/motion/ReducedMotionWrapper'
import styles from './Home.module.css'

export type HeroSlide = {
  src: string
  alt: string
  client: string
  /** Trade line under the client name, e.g. "ACP & LED signage". */
  label: string
  href: string
  /** Where to centre the crop across the photo on phones, which show a narrow strip. Defaults to 50%. */
  phoneFocus?: string
}

const SLIDE_MS = 6000

// Below 1024px the hero is taller than it is wide (at most 700px tall), so a
// landscape or square photo is cropped to its full height and drawn up to about
// 933px wide on any screen up to that width. Asking for 100vw there would fetch
// a copy too small for the crop.
const SIZES = '(max-width: 933px) 934px, (max-width: 1023px) 100vw, 54vw'

/**
 * The hero photo, rotating through a few installations. The first slide is the
 * page's main image and the only one loaded up front; each later slide loads
 * while the one before it is showing, and the rotation waits for it. Rotation
 * stops for reduced motion, pauses while the photo is hovered or focused, and
 * has a pause button.
 */
export function HeroSlides({ slides }: { slides: HeroSlide[] }) {
  const reducedMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set())
  const [paused, setPaused] = useState(false)
  const [held, setHeld] = useState(false)
  const [furthest, setFurthest] = useState(0)

  const rotating = !reducedMotion && slides.length > 1 && loaded.has(0)
  const next = (active + 1) % slides.length
  // Slides already shown stay mounted, and the next one mounts to load in the background.
  const mounted = Math.min(slides.length, furthest + (rotating ? 2 : 1))

  useEffect(() => {
    if (!rotating || paused || held || !loaded.has(next)) return
    const timer = window.setTimeout(() => {
      setActive(next)
      setFurthest(current => Math.max(current, next))
    }, SLIDE_MS)
    return () => window.clearTimeout(timer)
  }, [rotating, paused, held, loaded, next])

  const slide = slides[active]
  const markLoaded = (index: number) => setLoaded(current => new Set(current).add(index))

  return (
    <div
      className={styles.heroProject}
      data-light-surface
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div className={styles.heroSlides}>
        {slides.slice(0, mounted).map((item, index) => (
          <Image
            key={item.src}
            src={item.src}
            alt={item.alt}
            fill
            preload={index === 0}
            sizes={SIZES}
            className={`${styles.coverImage} ${styles.heroSlide}`}
            style={item.phoneFocus ? { '--phone-focus': item.phoneFocus } as CSSProperties : undefined}
            data-active={index === active ? '' : undefined}
            data-hero-image={index === 0 ? '' : undefined}
            data-hero-slide={index}
            onLoad={() => markLoaded(index)}
          />
        ))}
      </div>
      <span className={styles.heroShade} aria-hidden="true" />
      <span className={styles.projectTag}>Out in the world <ArrowUpRight size={19} aria-hidden="true" /></span>
      {rotating && (
        <button
          type="button"
          className={styles.heroPause}
          aria-label={paused ? 'Play the photo slideshow' : 'Pause the photo slideshow'}
          aria-pressed={paused}
          onClick={() => setPaused(value => !value)}
        >
          {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
        </button>
      )}
      <Link href={slide.href} className={styles.heroProjectCaption} aria-label={`Explore ${slide.client} ${slide.label.replace('&', 'and')}`} data-hero-caption>
        <span><strong>{slide.client}</strong><span>{slide.label}</span></span>
        <span className={styles.roundArrow}><ArrowUpRight aria-hidden="true" /></span>
      </Link>
    </div>
  )
}
