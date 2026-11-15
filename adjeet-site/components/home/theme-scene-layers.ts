import { getImageProps } from 'next/image'
import type { ImgHTMLAttributes } from 'react'

export type SceneLight = 'day' | 'night'

/** One scene: the tall image's <img> props (src, srcSet, sizes...) and the wide cut's srcset. */
export type SceneLayer = {
  tall: Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'>
  wideSrcSet: string
  alt: string
}

export type SceneSource = { tall: string; wide: string; alt: string; quality?: number }

type Options = {
  scenes: Record<SceneLight, SceneSource>
  tallWidth: number
  tallHeight: number
  wideWidth: number
  wideHeight: number
  tallSizes: string
  wideSizes: string
  /** Only for the page's largest paint (the hero). Below the fold leave it off. */
  highPriority?: boolean
}

/**
 * The optimised image props for a ThemeScene's two scenes. Both images are
 * always `loading="lazy"`: the browser then fetches only the scene that is laid
 * out, and below the fold only once it is near the screen.
 */
export function buildSceneLayers({ scenes, tallWidth, tallHeight, wideWidth, wideHeight, tallSizes, wideSizes, highPriority = false }: Options): Record<SceneLight, SceneLayer> {
  const layer = (scene: SceneLight): SceneLayer => {
    const { tall, wide, alt, quality = 75 } = scenes[scene]
    const fetchPriority: 'high' | undefined = highPriority ? 'high' : undefined
    const common = { alt, quality, loading: 'lazy' as const, ...(fetchPriority ? { fetchPriority } : {}) }
    const { props: { srcSet: wideSrcSet } } = getImageProps({ ...common, src: wide, width: wideWidth, height: wideHeight, sizes: wideSizes })
    const { props: tallProps } = getImageProps({ ...common, src: tall, width: tallWidth, height: tallHeight, sizes: tallSizes })
    return { tall: tallProps, wideSrcSet: wideSrcSet ?? '', alt }
  }
  return { day: layer('day'), night: layer('night') }
}
