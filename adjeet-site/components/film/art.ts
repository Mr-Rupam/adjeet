/**
 * The film's scene plates: generated concept art, pre-encoded as AVIF with a
 * WebP copy of the same pixels for browsers without AVIF. Static imports, so
 * each file gets a content-hashed URL under /_next/static/media, served with
 * long-lived immutable caching. Made from the storyboard's plates by
 * storyboard/port/tools/prep_art.py; tall art (941 x 1672 or 828 x 1471) for
 * portrait screens and wide art (1672 x 941) for landscape. The hero's own
 * images keep their pipeline (HomeHero).
 */
import type { StaticImageData } from 'next/image'
import { PREVIEW } from './art-previews'

import briefDayTallA from './art/brief-backdrop-day-tall.avif'
import briefDayTallW from './art/brief-backdrop-day-tall.webp'
import briefDayWideA from './art/brief-backdrop-day-wide.avif'
import briefDayWideW from './art/brief-backdrop-day-wide.webp'
import briefNightTallA from './art/brief-backdrop-night-tall.avif'
import briefNightTallW from './art/brief-backdrop-night-tall.webp'
import briefNightWideA from './art/brief-backdrop-night-wide.avif'
import briefNightWideW from './art/brief-backdrop-night-wide.webp'
import shopBeforeA from './art/brief-shop-before.avif'
import shopBeforeW from './art/brief-shop-before.webp'
import shopAfterA from './art/brief-shop-after.avif'
import shopAfterW from './art/brief-shop-after.webp'
import wsTallA from './art/workshop-dusk-tall.avif'
import wsTallW from './art/workshop-dusk-tall.webp'
import wsTallDarkA from './art/workshop-dusk-tall-dark.avif'
import wsTallDarkW from './art/workshop-dusk-tall-dark.webp'
import wsWideA from './art/workshop-dusk-wide.avif'
import wsWideW from './art/workshop-dusk-wide.webp'
import wsWideDarkA from './art/workshop-dusk-wide-dark.avif'
import wsWideDarkW from './art/workshop-dusk-wide-dark.webp'
import roadTallA from './art/road-empty-tall.avif'
import roadTallW from './art/road-empty-tall.webp'
import truckA from './art/road-golden-tall-truck.avif'
import truckW from './art/road-golden-tall-truck.webp'
import roadWideA from './art/road-golden-wide.avif'
import roadWideW from './art/road-golden-wide.webp'
import hillsTallA from './art/hills-dusk-tall.avif'
import hillsTallW from './art/hills-dusk-tall.webp'
import hillsTallDarkA from './art/hills-dusk-tall-dark.avif'
import hillsTallDarkW from './art/hills-dusk-tall-dark.webp'
import hillsWideA from './art/hills-dusk-wide.avif'
import hillsWideW from './art/hills-dusk-wide.webp'
import hillsWideDarkA from './art/hills-dusk-wide-dark.avif'
import hillsWideDarkW from './art/hills-dusk-wide-dark.webp'
import juncTallA from './art/junction-plain-tall.avif'
import juncTallW from './art/junction-plain-tall.webp'
import juncTallDarkA from './art/junction-plain-tall-dark.avif'
import juncTallDarkW from './art/junction-plain-tall-dark.webp'
import juncWideA from './art/junction-plain-wide.avif'
import juncWideW from './art/junction-plain-wide.webp'
import juncWideDarkA from './art/junction-plain-wide-dark.avif'
import juncWideDarkW from './art/junction-plain-wide-dark.webp'
import finTallA from './art/finale-night-tall.avif'
import finTallW from './art/finale-night-tall.webp'
import finWideA from './art/finale-night-wide.avif'
import finWideW from './art/finale-night-wide.webp'

/** One picture in two encodings, and for a plate a scene opens on, a tiny blurred copy (art-previews.ts). */
export type Art = { avif: StaticImageData; webp: StaticImageData; preview?: string }
const art = (avif: StaticImageData, webp: StaticImageData, preview?: string): Art => ({ avif, webp, preview })

export const ART = {
  briefDayTall: art(briefDayTallA, briefDayTallW, PREVIEW.briefBackdropDayTall),
  briefDayWide: art(briefDayWideA, briefDayWideW, PREVIEW.briefBackdropDayWide),
  briefNightTall: art(briefNightTallA, briefNightTallW, PREVIEW.briefBackdropNightTall),
  briefNightWide: art(briefNightWideA, briefNightWideW, PREVIEW.briefBackdropNightWide),
  shopBefore: art(shopBeforeA, shopBeforeW),
  shopAfter: art(shopAfterA, shopAfterW),
  workshopTall: art(wsTallA, wsTallW),
  workshopTallDark: art(wsTallDarkA, wsTallDarkW, PREVIEW.workshopDuskTallDark),
  workshopWide: art(wsWideA, wsWideW),
  workshopWideDark: art(wsWideDarkA, wsWideDarkW, PREVIEW.workshopDuskWideDark),
  roadTall: art(roadTallA, roadTallW, PREVIEW.roadEmptyTall),
  truck: art(truckA, truckW),
  roadWide: art(roadWideA, roadWideW, PREVIEW.roadGoldenWide),
  hillsTall: art(hillsTallA, hillsTallW),
  hillsTallDark: art(hillsTallDarkA, hillsTallDarkW, PREVIEW.hillsDuskTallDark),
  hillsWide: art(hillsWideA, hillsWideW),
  hillsWideDark: art(hillsWideDarkA, hillsWideDarkW, PREVIEW.hillsDuskWideDark),
  junctionTall: art(juncTallA, juncTallW),
  junctionTallDark: art(juncTallDarkA, juncTallDarkW, PREVIEW.junctionPlainTallDark),
  junctionWide: art(juncWideA, juncWideW),
  junctionWideDark: art(juncWideDarkA, juncWideDarkW, PREVIEW.junctionPlainWideDark),
  finaleTall: art(finTallA, finTallW),
  finaleWide: art(finWideA, finWideW),
} satisfies Record<string, Art>

/**
 * A lit plate as a CSS background for the light patches: the AVIF where the
 * browser takes it, the WebP otherwise.
 */
export const litImage = ({ avif, webp }: Art) =>
  `image-set(url("${avif.src}") type("image/avif"), url("${webp.src}") type("image/webp"))`
