import type { CSSProperties } from 'react'
import type { Art } from './art'

/** The query that switches the film, like the hero, to its wide art (HomeHero's WIDE_SCREEN). */
export const WIDE_SCREEN = '(min-width: 1024px) and (min-aspect-ratio: 5/4)'

type Props = {
  tall: Art
  wide?: Art
  /** Begins "Visualisation:" for a scene, or empty for a layer that repeats one. */
  alt: string
  className?: string
  style?: CSSProperties
  /** Kept lazy when the chapter before pins (the engine skips it). */
  keepLazy?: boolean
  /** On the <picture>: `day` or `night` shows it in that theme only (film.css). */
  pictureClassName?: string
}

/**
 * One scene plate. A <picture>, so the browser fetches exactly one file: the
 * wide art on a landscape screen, the tall art otherwise, each AVIF with a
 * WebP fallback. Lazy, decoded off the main thread; the engine makes it eager
 * once the chapter before this one pins.
 */
export function Plate({ tall, wide, alt, className = 'f-plate', style, keepLazy, pictureClassName }: Props) {
  // A plate a scene opens on carries its tiny blurred copy as its background
  // (film.css, "The camera and the plate"), so the scene is never empty while
  // the picture is on its way.
  const preview = tall.preview
    ? { '--pv': `url(${tall.preview})`, ...(wide?.preview ? { '--pvw': `url(${wide.preview})` } : {}) }
    : undefined
  return (
    <picture className={pictureClassName}>
      {wide && <source media={WIDE_SCREEN} type="image/avif" srcSet={wide.avif.src} width={wide.avif.width} height={wide.avif.height} />}
      {wide && <source media={WIDE_SCREEN} type="image/webp" srcSet={wide.webp.src} width={wide.webp.width} height={wide.webp.height} />}
      <source type="image/avif" srcSet={tall.avif.src} />
      <img
        className={className}
        src={tall.webp.src}
        width={tall.webp.width}
        height={tall.webp.height}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={preview ? ({ ...preview, ...style } as CSSProperties) : style}
        data-keep-lazy={keepLazy ? '' : undefined}
      />
    </picture>
  )
}
