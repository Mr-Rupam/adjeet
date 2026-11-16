import { MALDA_BOARDS, MALDA_DAYS, ROAD, chapter } from '@/content/home-film'
import { ART } from './art'
import { Plate } from './Plate'
import { Chapter, Name, vars } from './parts'

const ROWS = 10
const PER_ROW = MALDA_BOARDS / ROWS
/** The grid fills row by row while the day counter runs, from p .3 to .7. */
const dayAt = (day: number) => +(0.3 + ((day - 1) * 0.4) / (MALDA_DAYS - 1)).toFixed(3)
const rowAt = (row: number) => +(0.32 + (row * 0.38) / (ROWS - 1)).toFixed(3)

/**
 * Chapter 3, the road: "Then it goes out on the road." Out of the workshop
 * doorway's gold light, the camera follows a truck down a highway through tea
 * gardens; the Malda job plays in the sky as a grid of boards that fills row
 * by row while the day counter runs; the camera tilts up and the sky deepens
 * to the night the hills open on. One plate in both themes. On a tall screen
 * the truck is its own layer and drives away; the wide plate carries it.
 */
export function FilmRoad() {
  return (
    <Chapter id="road" stage="road" tone="light" toneAt=".9" toneLate="dark">
      <div className="cam road-cam">
        <Plate
          tall={ART.roadTall}
          wide={ART.roadWide}
          alt="Visualisation: golden hour on a highway through tea gardens. A small truck carrying blank sign boards, a ladder and two fitters drives away towards blue hills and snow peaks"
        />
        <div className="truck tl" aria-hidden="true">
          <Plate tall={ART.truck} alt="" className="truck-layer" />
          <Name className="face road-name" />
        </div>
      </div>
      <i className="road-veil tl" aria-hidden="true" />

      <div className="card road-card tl">
        <h2 id="road-h" className="fade" style={vars({ '--at': 0.03 })}>{chapter('road').title}</h2>
        <p className="fade" style={vars({ '--at': 0.09 })}>{ROAD.line}</p>
      </div>

      <div className="malda tl">
        <div className="m-head">
          <p className="m-day" aria-hidden="true">
            {Array.from({ length: MALDA_DAYS }, (_, index) => (
              <span key={index} style={vars({ '--at': dayAt(index + 1) })}>Day {index + 1}</span>
            ))}
          </p>
          <p className="m-hold" style={vars({ '--at': 0.74 })}>{ROAD.hold}</p>
        </div>
        <div className="m-grid" role="img" aria-label={ROAD.gridLabel}>
          {Array.from({ length: ROWS }, (_, row) => (
            <span key={row} className="m-row" style={vars({ '--at': rowAt(row) })}>
              {Array.from({ length: PER_ROW }, (_, board) => <i key={board} />)}
            </span>
          ))}
        </div>
        <p className="m-text">{ROAD.story}</p>
      </div>

      <i className="road-wash r-gold tl" aria-hidden="true" />
      <i className="road-wash r-dusk tl" aria-hidden="true" />
      <i className="road-wash r-night tl" aria-hidden="true" />
    </Chapter>
  )
}
