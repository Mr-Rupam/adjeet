'use client'

import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'
import { LoadingRawImage } from '@/components/ui/LoadingImage'
import styles from './Home.module.css'

export type HeroLight = 'day' | 'night'

/** One cut set: the tall image's <img> props (src, srcSet, sizes...) and the wide cut's srcset. */
export type HeroArtLayer = {
  tall: Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'>
  wideSrcSet: string
  alt: string
}

type Props = {
  layers: Record<HeroLight, HeroArtLayer>
  wideScreen: string
  wideSizes: string
}

const readLight = (): HeroLight => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'night' : 'day')

/**
 * The hero's two scenes of the same street, day and night, stacked in one box.
 *
 * Which one shows is CSS: before any script it follows `data-theme` (set
 * before paint by ThemeScript), so the first paint is never the wrong scene,
 * and the other scene is `display: none`. Both images are `loading="lazy"`, so
 * the browser fetches only the one laid out; HomeHero's inline script preloads
 * that one. Once the page is idle, or as soon as the theme toggle is hovered
 * or focused, the other scene is laid out (invisible) so it loads too.
 *
 * On a theme change the incoming scene is decoded first, then
 * `data-hero-light` on <html> moves, and the CSS cross-fades the images and
 * the hero's colours (and the header's while it is over the hero) together.
 */
export function HeroArt({ layers, wideScreen, wideSizes }: Props) {
  const art = useRef<HTMLDivElement>(null)
  const [both, setBoth] = useState(false)
  const [light, setLight] = useState<HeroLight | null>(null)

  useEffect(() => {
    const root = document.documentElement
    let current = readLight()
    let token = 0
    root.setAttribute('data-hero-light', current)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLight(current)

    const layOutBoth = () => setBoth(true)

    // Never during the initial load: wait for `load`, then for an idle moment.
    let idle = 0
    const whenIdle = () => {
      idle = typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(layOutBoth, { timeout: 4000 })
        : setTimeout(layOutBoth, 1500) as unknown as number
    }
    if (document.readyState === 'complete') whenIdle()
    else window.addEventListener('load', whenIdle, { once: true })

    // A visitor reaching for the toggle is about to need the other scene.
    const intent = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('.theme-toggle')) layOutBoth()
    }
    document.addEventListener('pointerover', intent)
    document.addEventListener('focusin', intent)

    const observer = new MutationObserver(() => {
      const next = readLight()
      if (next === current) return
      current = next
      const mine = ++token
      setBoth(true)
      // Two frames: React lays the incoming scene out, then it is decoded.
      requestAnimationFrame(() => requestAnimationFrame(async () => {
        const image = art.current?.querySelector<HTMLImageElement>(`[data-hero-image="${next}"]`)
        if (image) {
          image.loading = 'eager'
          await image.decode().catch(() => undefined)
        }
        if (mine !== token) return
        root.setAttribute('data-hero-light', next)
        setLight(next)
      }))
    })
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      token++
      observer.disconnect()
      window.removeEventListener('load', whenIdle)
      if (idle) {
        if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle)
        clearTimeout(idle)
      }
      document.removeEventListener('pointerover', intent)
      document.removeEventListener('focusin', intent)
      root.removeAttribute('data-hero-light')
    }
  }, [])

  return (
    <div ref={art} className={styles.heroArt} data-both-scenes={both ? '' : undefined}>
      {(['day', 'night'] as const).map(scene => {
        const layer = layers[scene]
        // Once both scenes are laid out, the one fading out is hidden from assistive technology.
        const hidden = both && light !== null && light !== scene
        return (
          <picture key={scene} className={`${styles.heroLayer} ${scene === 'day' ? styles.heroLayerDay : styles.heroLayerNight}`}>
            <source media={wideScreen} srcSet={layer.wideSrcSet} sizes={wideSizes} width={1672} height={941} />
            <LoadingRawImage {...layer.tall} alt={layer.alt} aria-hidden={hidden || undefined} data-hero-image={scene} />
          </picture>
        )
      })}
      <span className={styles.heroBoard} aria-hidden="true" data-hero-board>Your shop name</span>
    </div>
  )
}
