import Image from 'next/image'
import Link from 'next/link'
import { WORK, chapter, workPicks, type WorkPick } from '@/content/home-film'
import type { GalleryPhoto } from '@/content/gallery'
import { photoPlace } from '@/content/photo-places'
import { getServiceBySlug } from '@/content/services'
import { Chapter, vars } from './parts'
import { WORK_COLOR } from './work-colors'

/**
 * A photograph's caption: only what its gallery record says, in the order
 * client, kind of work, place, year (as the site's fascia captions).
 */
export function workCaption(photo: GalleryPhoto): string[] {
  const place = photoPlace(photo)
  return [
    photo.client,
    getServiceBySlug(photo.service)?.name ?? '',
    place && photo.year ? `${place}, ${photo.year}` : place ?? (photo.year ? String(photo.year) : ''),
  ].filter(Boolean)
}

/** Where the wall rises (film.css, work-rise): it holds on the title frame, then travels. */
const RISE_FROM = 0.06
const RISE_TO = 0.78

/** A screen the wall is laid out on (film.css, "Chapter 2, work"), in CSS pixels. */
export type WallModel = { width: number; screen: number; cols: number; gap: number; rowGap: number; head: number; caption: number }
/** A phone (390 x 844): one across, then a pair. */
export const PHONE_WALL: WallModel = { width: 358, screen: 844, cols: 2, gap: 12, rowGap: 34, head: 214, caption: 52 }
/** A desktop (1440 x 900): four columns, a large one across two. */
export const DESK_WALL: WallModel = { width: 1120, screen: 900, cols: 4, gap: 24, rowGap: 52, head: 244, caption: 36 }

/**
 * When each frame switches on: as its top comes up past 85% of the screen.
 * The rows are modelled from the photographs' own shapes (a large one spans
 * two columns; a row is as tall as its tallest frame and caption), and the
 * wall rises linearly from RISE_FROM to RISE_TO by its height above the
 * closing screen. Frames on screen from the start are on at once.
 */
export function workBeats(picks: readonly Pick<WorkPick, 'width' | 'height' | 'size'>[], model: WallModel = PHONE_WALL): number[] {
  const col = (model.width - (model.cols - 1) * model.gap) / model.cols
  const tops: number[] = []
  let y = model.head
  let used = 0
  let rowHeight = 0
  for (const pick of picks) {
    const cells = pick.size === 'large' ? 2 : 1
    if (used + cells > model.cols) { y += rowHeight + model.rowGap; used = 0; rowHeight = 0 }
    const drawn = Math.min(pick.width, cells * col + (cells - 1) * model.gap)
    tops.push(y)
    rowHeight = Math.max(rowHeight, (drawn * pick.height) / pick.width + model.caption)
    used += cells
  }
  const travel = y + rowHeight + model.rowGap
  return tops.map(top => {
    const t = (top - 0.85 * model.screen) / travel
    return t <= 0 ? 0 : +(RISE_FROM + (RISE_TO - RISE_FROM) * Math.min(1, t)).toFixed(3)
  })
}

/** A frame's background while its photograph is on its way: the photograph's own average colour. */
const slot = (id: string): Record<`--${string}`, string> => (WORK_COLOR[id] ? { '--avg': WORK_COLOR[id] } : {})

/** The closing photograph lights as the wall's rise ends. */
const LAST_AT = +(RISE_TO - 0.06).toFixed(3)

function Caption({ photo, className }: { photo: GalleryPhoto; className?: string }) {
  const [client, ...rest] = workCaption(photo)
  return <figcaption className={className}><b>{client}</b>{rest.map(part => <span key={part}>{part}</span>)}</figcaption>
}

/**
 * Chapter 2, work: "Seen on real streets." (storyboard-v2, section 5). The
 * record: real photographs from the gallery on the night ground, each whole
 * in the film's thin cerulean frame, switching on like a light box as it
 * rises into view. On a phone the rhythm is one photograph across the width,
 * then a pair; on a desktop four columns, a large one across two. The two
 * sides of the wall drift at slightly different rates (depth). The wall is
 * free travel for the scroll controller. It ends on one photograph, the one
 * whose GPS stamp is readable, beside the GPS line and "See all the work";
 * that frame becomes plain light and grows until it fills the screen, the
 * light the brief opens on.
 *
 * Photographs go through the site's image pipeline, never drawn wider than
 * their own pixels (`--pw`, and `sizes` says so), captioned only with their
 * gallery record.
 */
export function FilmWork() {
  const { shown } = workPicks()
  const wall = shown.slice(0, -1)
  const last = shown[shown.length - 1]
  const phoneAt = workBeats(wall, PHONE_WALL)
  const deskAt = workBeats(wall, DESK_WALL)
  let pairSide = 0
  let largeSide = 0
  return (
    <Chapter id="work" stage="work" tone="light" toneAt=".04 .92" toneLate="dark light">
      <div className="w-view">
      <div className="w-rise tl">
        <div className="card w-card">
          <h2 id="work-h" className="fade" style={vars({ '--at': 0.01 })}>{chapter('work').title}</h2>
        </div>
        <ol className="w-wall" aria-label={WORK.wallLabel}>
          {wall.map((pick, index) => {
            const large = pick.size === 'large'
            const far = !large && pairSide++ % 2 === 1
            // On a desktop every other large photograph sits on the right.
            const right = large && largeSide++ % 2 === 1
            const sizes = large
              ? `(min-width: 1024px) and (min-aspect-ratio: 5/4) min(46vw, ${pick.width}px), min(calc(100vw - 32px), ${pick.width}px)`
              : `(min-width: 1024px) and (min-aspect-ratio: 5/4) min(22vw, ${pick.width}px), min(calc(50vw - 22px), ${pick.width}px)`
            return (
              <li key={pick.id} className={`w-shot w-${pick.size}${far ? ' w-far' : ''}${right ? ' w-right' : ''}`} style={vars({ '--at': phoneAt[index] })} data-photo={pick.id}>
                {/* A second beat for the desktop's rows: film.css picks which one dims the frame. */}
                <div className={`w-drift${far ? ' tl' : ''}`} style={vars({ '--at': deskAt[index] })}>
                  <figure>
                    <div className="w-frame" style={vars({ '--pw': `${pick.width}px`, ...slot(pick.id) })}>
                      <Image
                        src={pick.photo.src}
                        alt={pick.photo.alt}
                        width={pick.width}
                        height={pick.height}
                        sizes={sizes}
                        loading="lazy"
                        decoding="async"
                        {...(index >= 3 ? { 'data-keep-lazy': '' } : {})}
                      />
                      {index === 0 && <i className="w-first tl" aria-hidden="true" />}
                    </div>
                    <Caption photo={pick.photo} />
                  </figure>
                </div>
              </li>
            )
          })}
        </ol>
        {last && (
          <div className="w-end">
            <figure className="w-last" style={vars({ '--at': LAST_AT })} data-photo={last.id}>
              <div className="w-frame w-grow tl" style={vars({ '--pw': `${last.width}px`, '--ar': (last.width / last.height).toFixed(4), ...slot(last.id) })}>
                <div className="w-img tl">
                  <Image
                    src={last.photo.src}
                    alt={last.photo.alt}
                    width={last.width}
                    height={last.height}
                    sizes={`(min-width: 1024px) and (min-aspect-ratio: 5/4) min(52vw, ${last.width}px), min(calc(100vw - 32px), ${last.width}px)`}
                    loading="lazy"
                    decoding="async"
                    data-keep-lazy=""
                  />
                </div>
                <i className="w-lbox tl" aria-hidden="true" />
              </div>
              <Caption photo={last.photo} className="w-close tl" />
            </figure>
            <div className="w-close tl" style={vars({ '--at': 0.78 })}>
              <p className="w-gps">{WORK.gps}</p>
              <Link className="quiet" href={WORK.all.href}>{WORK.all.label}</Link>
            </div>
          </div>
        )}
      </div>
      </div>
      <i className="flash tl" aria-hidden="true" />
    </Chapter>
  )
}
