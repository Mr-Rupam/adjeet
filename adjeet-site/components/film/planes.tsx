/**
 * Depth planes (DESIGN.md, "Home film"): a stack of three images, far, middle
 * and near, that stands in for the flat plate while the camera moves, so the
 * move has depth. AVIF only, with alpha on the middle and near planes, from
 * the storyboard prototype (proto/assets/pl, made by its prep_images.py
 * --planes). Static imports give them content-hashed, immutable URLs.
 *
 * The images have no `src` in the markup: the engine (story.ts) sets it from
 * `data-src` (tall) or `data-srcw` (wide), or the `-n` copies in the dark
 * theme, only while the film plays, never with Save-Data, and for the hero
 * only after the page has loaded and gone idle. Until every plane has
 * decoded the flat plate does the move on its own.
 */
import type { StaticImageData } from 'next/image'
import type { CSSProperties } from 'react'

import dayTallFar from './art/pl/a-day-street-phone-far.avif'
import dayTallMid from './art/pl/a-day-street-phone-mid.avif'
import dayTallNear from './art/pl/a-day-street-phone-near.avif'
import dayWideFar from './art/pl/a-day-street-wide-far.avif'
import dayWideMid from './art/pl/a-day-street-wide-mid.avif'
import dayWideNear from './art/pl/a-day-street-wide-near.avif'
import nightTallFar from './art/pl/a-night-street-phone-far.avif'
import nightTallMid from './art/pl/a-night-street-phone-mid.avif'
import nightTallNear from './art/pl/a-night-street-phone-near.avif'
import nightWideFar from './art/pl/a-night-street-wide-far.avif'
import nightWideMid from './art/pl/a-night-street-wide-mid.avif'
import nightWideNear from './art/pl/a-night-street-wide-near.avif'
import wsTallFar from './art/pl/workshop-dusk-tall-far.avif'
import wsTallMid from './art/pl/workshop-dusk-tall-mid.avif'
import wsTallNear from './art/pl/workshop-dusk-tall-near.avif'
import wsWideFar from './art/pl/workshop-dusk-wide-far.avif'
import wsWideMid from './art/pl/workshop-dusk-wide-mid.avif'
import wsWideNear from './art/pl/workshop-dusk-wide-near.avif'
import hillsTallFar from './art/pl/hills-dusk-tall-far.avif'
import hillsTallMid from './art/pl/hills-dusk-tall-mid.avif'
import hillsTallNear from './art/pl/hills-dusk-tall-near.avif'
import hillsWideFar from './art/pl/hills-dusk-wide-far.avif'
import hillsWideMid from './art/pl/hills-dusk-wide-mid.avif'
import hillsWideNear from './art/pl/hills-dusk-wide-near.avif'

type Depth = 'far' | 'mid' | 'near'
type Set = Record<Depth, StaticImageData>
/** One stack: tall and wide art, and optionally the dark theme's copies. */
type Stack = { tall: Set; wide: Set; tallNight?: Set; wideNight?: Set }

export const PLANES = {
  hero: {
    tall: { far: dayTallFar, mid: dayTallMid, near: dayTallNear },
    wide: { far: dayWideFar, mid: dayWideMid, near: dayWideNear },
    tallNight: { far: nightTallFar, mid: nightTallMid, near: nightTallNear },
    wideNight: { far: nightWideFar, mid: nightWideMid, near: nightWideNear },
  },
  workshop: {
    tall: { far: wsTallFar, mid: wsTallMid, near: wsTallNear },
    wide: { far: wsWideFar, mid: wsWideMid, near: wsWideNear },
  },
  hills: {
    tall: { far: hillsTallFar, mid: hillsTallMid, near: hillsTallNear },
    wide: { far: hillsWideFar, mid: hillsWideMid, near: hillsWideNear },
  },
} satisfies Record<string, Stack>

/**
 * A plane stack. It shows while the chapter's progress is between `at` and
 * `off` and every plane has decoded; each plane moves by its own keyframes
 * (film.css).
 */
export function Planes({ stack, at, off }: { stack: Stack; at: number; off?: number }) {
  const style = { '--at': at, ...(off === undefined ? {} : { '--off': off }) } as CSSProperties
  return (
    <div className="planes" style={style} aria-hidden="true">
      {(['far', 'mid', 'near'] as const).map(depth => (
        // eslint-disable-next-line @next/next/no-img-element -- the engine sets src when the stack is needed
        <img
          key={depth}
          className={`pl ${depth}`}
          alt=""
          decoding="async"
          data-src={stack.tall[depth].src}
          data-srcw={stack.wide[depth].src}
          data-src-n={stack.tallNight?.[depth].src}
          data-srcw-n={stack.wideNight?.[depth].src}
        />
      ))}
    </div>
  )
}
