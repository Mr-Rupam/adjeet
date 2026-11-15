'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { LoadingRawImage } from '@/components/ui/LoadingImage'
import type { ResolvedTheme } from '@/lib/theme'
import { registerThemeScene } from '@/lib/theme-switch'
import type { SceneLayer, SceneLight } from './theme-scene-layers'
import styles from './ThemeScene.module.css'

export type { SceneLayer, SceneLight } from './theme-scene-layers'

type Props = {
  layers: Record<SceneLight, SceneLayer>
  /** The media query that picks the wide cut, as in the page's CSS. */
  wideScreen: string
  wideSizes: string
  wideWidth: number
  wideHeight: number
  /** Positions and sizes the box (the box itself sets no position). */
  className?: string
  /** The attribute that marks each image with its scene, e.g. `data-hero-image`. */
  imageAttribute?: `data-${string}`
  /**
   * An attribute on <html> that follows the scene shown, so colours elsewhere
   * can change with the images (the hero's `data-hero-light`).
   */
  rootAttribute?: `data-${string}`
  /** Decoration laid over the artwork, such as board lettering. */
  children?: ReactNode
}

const readLight = (): SceneLight => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'night' : 'day')

/**
 * Two scenes of the same place, day and night, stacked in one box, each in a
 * tall cut and a wide one (taken out of the home hero on 16 November 2026, so
 * every scene on the page changes light the same way).
 *
 * Which one shows is CSS: before any script it follows `data-theme` (set
 * before paint by ThemeScript), so the first paint is never the wrong scene,
 * and the other scene is `display: none`. Both images are `loading="lazy"`, so
 * the browser fetches only the one laid out, and only once it is near the
 * screen: below the fold nothing is preloaded. The hero preloads its scene
 * itself (HomeHero). Once the page is idle, or as soon as the theme toggle is
 * hovered or focused, the other scene is laid out invisibly, so it loads along
 * with the first and is ready for the switch.
 *
 * A theme change from the toggle goes through switchTheme (lib/theme-switch.ts):
 * this scene decodes its incoming image first, then it and the rest of the
 * page change in the same frame, in one view transition. A change from
 * anywhere else (another tab) is followed here: the incoming scene is decoded,
 * then `data-light` on the box (and `rootAttribute` on <html>, if given)
 * moves and the CSS cross-fades the images over 700ms; at once under reduced
 * motion.
 */
export function ThemeScene({
  layers, wideScreen, wideSizes, wideWidth, wideHeight, className = '',
  imageAttribute = 'data-scene-image', rootAttribute, children,
}: Props) {
  const box = useRef<HTMLDivElement>(null)
  const [both, setBoth] = useState(false)
  const [light, setLight] = useState<SceneLight | null>(null)

  useEffect(() => {
    const root = document.documentElement
    let current = readLight()
    let token = 0
    // Set straight on the elements, together, so the images and anything that
    // follows `rootAttribute` change in the same frame.
    const show = (scene: SceneLight) => {
      current = scene
      box.current?.setAttribute('data-light', scene)
      if (rootAttribute) root.setAttribute(rootAttribute, scene)
      setLight(scene)
    }
    show(current)

    const layOutBoth = () => setBoth(true)

    // Lays the incoming scene out (two frames: React renders it, then the
    // browser lays it out) and decodes it.
    const decode = (scene: SceneLight) => new Promise<void>(resolve => {
      setBoth(true)
      requestAnimationFrame(() => requestAnimationFrame(async () => {
        const image = box.current?.querySelector<HTMLImageElement>(`[${imageAttribute}="${scene}"]`)
        if (image) {
          image.loading = 'eager'
          await image.decode().catch(() => undefined)
        }
        resolve()
      }))
    })

    const sceneFor = (theme: ResolvedTheme): SceneLight => (theme === 'dark' ? 'night' : 'day')
    const unregister = registerThemeScene({
      prepare: theme => (sceneFor(theme) === current ? Promise.resolve() : decode(sceneFor(theme))),
      commit: theme => {
        token++
        if (sceneFor(theme) !== current) show(sceneFor(theme))
      },
      near: () => {
        const rect = box.current?.getBoundingClientRect()
        return !!rect && rect.bottom > -window.innerHeight * 0.5 && rect.top < window.innerHeight * 1.5
      },
    })

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

    // A theme set without switchTheme (another tab, a future control).
    const observer = new MutationObserver(() => {
      const next = readLight()
      if (next === current) return
      const mine = ++token
      void decode(next).then(() => {
        if (mine === token) show(next)
      })
    })
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })

    return () => {
      token++
      unregister()
      observer.disconnect()
      window.removeEventListener('load', whenIdle)
      if (idle) {
        if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle)
        clearTimeout(idle)
      }
      document.removeEventListener('pointerover', intent)
      document.removeEventListener('focusin', intent)
      if (rootAttribute) root.removeAttribute(rootAttribute)
    }
  }, [imageAttribute, rootAttribute])

  return (
    <div ref={box} className={`${styles.scene} ${className}`.trim()} data-theme-scene data-both-scenes={both ? '' : undefined}>
      {(['day', 'night'] as const).map(scene => {
        const layer = layers[scene]
        // Once both scenes are laid out, the one fading out is hidden from assistive technology.
        const hidden = both && light !== null && light !== scene
        return (
          <picture key={scene} className={`${styles.layer} ${scene === 'day' ? styles.day : styles.night}`}>
            <source media={wideScreen} srcSet={layer.wideSrcSet} sizes={wideSizes} width={wideWidth} height={wideHeight} />
            <LoadingRawImage {...layer.tall} alt={layer.alt} aria-hidden={hidden || undefined} {...{ [imageAttribute]: scene }} />
          </picture>
        )
      })}
      {children}
    </div>
  )
}
