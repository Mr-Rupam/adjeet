import Link from 'next/link'
import { HILLS, chapter } from '@/content/home-film'
import { ART, litImage } from './art'
import { Plate } from './Plate'
import { PLANES, Planes } from './planes'
import { Chapter, vars } from './parts'

/**
 * The lit windows, from the plain (bottom) to the ridge (top), one per place
 * and in the same order: tall --x --y --rx --ry, wide --xw --yw --rxw --ryw,
 * percent of the plate (storyboard assets/plates.json).
 */
const LAMPS = [
  [41.27, 77.07, 11.3, 8.3, 33.12, 81.41, 30.4, 9.5],
  [18.02, 75.74, 17.4, 12.7, 81.32, 76.87, 17.7, 6.7],
  [78, 72.99, 21.2, 15.5, 57.56, 76.84, 18.7, 6.5],
  [11.56, 69.24, 11.5, 8.4, 16.79, 71.74, 24.8, 7.5],
  [33.58, 63.56, 9.7, 7.1, 36, 65.49, 23, 5.5],
  [30.15, 55.87, 19, 13.9, 44.83, 57.84, 15.5, 5.3],
  [90.15, 49.5, 10.7, 7.8, 89.7, 53.24, 11.1, 4.2],
  [20.08, 48.06, 7.1, 5.2, 62.37, 49.52, 28.4, 5.6],
  [62.86, 47.16, 17.4, 12.7, 79.95, 45.75, 20.5, 5.4],
  [41.26, 41.43, 18.2, 13.3, 48.09, 42.03, 10.6, 4.8],
  [90.88, 41.22, 18.5, 13.5, 89.08, 39.25, 17.3, 6.8],
] as const
/** Each light and its place name come on together, from p .3 every .04. */
const placeAt = (index: number) => +(0.3 + index * 0.04).toFixed(2)

/**
 * Chapter 4, the hills: "From the plains to the hills." Out of the night the
 * road ended on, the land rises into frame, unlit; the lights come on from
 * the plain to the peaks, each with one place name, every place the same
 * size; then the camera pushes into a small lit board in the ridge town.
 * Night in both themes.
 *
 * Depth planes: a stack of up to three plane images goes inside `.hills-cam`,
 * before the lamps (film.css, "Depth planes").
 */
export function FilmHills() {
  if (LAMPS.length !== HILLS.places.length) throw new Error('FilmHills: one light per place')
  return (
    <Chapter
      id="hills" stage="hills" tone="dark" toneAt=".96" toneLate="light"
      stageStyle={vars({ '--lit-t': litImage(ART.hillsTall), '--lit-w': litImage(ART.hillsWide) })}
    >
      <div className="cam hills-cam">
        <Plate
          tall={ART.hillsTallDark}
          wide={ART.hillsWideDark}
          alt="Visualisation: blue hour over North Bengal, from tea gardens and a river town on the plain, up a winding road to a hill town on a ridge, with snow peaks above. The lights of the towns come on from the plain to the hills"
        />
        <i className="h-sky" aria-hidden="true" />
        {LAMPS.map(([x, y, rx, ry, xw, yw, rxw, ryw], index) => (
          <i
            key={HILLS.places[index]}
            className="lamp"
            aria-hidden="true"
            style={vars({ '--x': x, '--y': y, '--rx': rx, '--ry': ry, '--xw': xw, '--yw': yw, '--rxw': rxw, '--ryw': ryw, '--at': placeAt(index) })}
          />
        ))}
        <i className="lamp h-lit" aria-hidden="true" style={vars({ '--at': 0.75 })} />
        {/* Depth for the push into the ridge board (planes.tsx). */}
        <Planes stack={PLANES.hills} at={0.845} />
        {/* The ridge town's small lit board: the camera leaves through it. */}
        <i className="on-plate h-board tl" aria-hidden="true" />
      </div>
      <i className="h-veil tl" aria-hidden="true" />

      <div className="card hills-card tl">
        <h2 id="hills-h" className="fade" style={vars({ '--at': 0.1 })}>{chapter('hills').title}</h2>
        <p className="fade" style={vars({ '--at': 0.13 })}>{HILLS.line}</p>
      </div>

      <div className="h-names tl">
        <p className="h-now" aria-hidden="true">
          {HILLS.places.map((place, index) => <span key={place} style={vars({ '--at': placeAt(index) })}>{place}</span>)}
        </p>
        <div className="h-all fade" style={vars({ '--at': 0.76 })}>
          <ul className="h-list" aria-label={HILLS.listLabel}>{HILLS.places.map(place => <li key={place}>{place}</li>)}</ul>
          <Link className="quiet" href={HILLS.link.href}>{HILLS.link.label}</Link>
        </div>
      </div>

      <i className="h-wash h-white tl" aria-hidden="true" />
    </Chapter>
  )
}
