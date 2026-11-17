import { MALDA_BOARDS, MALDA_DAYS, MALDA_NORMAL, MALDA_ROWS, ROAD, chapter } from '@/content/home-film'
import { ART } from './art'
import { Plate } from './Plate'
import { Chapter, Name, vars } from './parts'

const PER_ROW = MALDA_BOARDS / MALDA_ROWS
/** The field lights row by row, nearest first, while the day counter runs, from p .3 to .7. */
const dayAt = (day: number) => +(0.3 + ((day - 1) * 0.4) / (MALDA_DAYS - 1)).toFixed(3)
const rowAt = (row: number) => +(0.32 + (row * 0.38) / (MALDA_ROWS - 1)).toFixed(3)
/** The hold: the field complete. From here the rest of the days run on by themselves. */
const HOLD_AT = 0.74
/** "100 boards. Day 7." as the numeral, the unit and the day, so the hold sets like the counter. */
const [holdUnit, holdDay] = ROAD.hold.slice(String(MALDA_BOARDS).length).trim().split(/(?<=\.) /)

/**
 * Chapter 3, the road: "Then it goes out on the road." Out of the workshop
 * doorway's gold light, the camera follows a truck down a highway through tea
 * gardens. Then the Malda job in the sky: a field of 100 lit boards running
 * away towards the hills lights row by row, nearest first, while a numeral
 * counts them and the days run from 1 to 7 on a strip of day marks. At the
 * hold the strip runs on by itself to the end of the job's normal time. The
 * camera tilts up and the sky deepens to the night the hills open on. One
 * plate in both themes. On a tall screen the truck is its own layer and
 * drives away; the wide plate carries it.
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
        <h3 className="m-title">{ROAD.maldaTitle}</h3>
        <div className="m-head">
          <p className="m-count" aria-hidden="true">
            <b className="m-num">
              {Array.from({ length: MALDA_ROWS }, (_, row) => (
                <span key={row} style={vars({ '--at': rowAt(row) })}>{(row + 1) * PER_ROW}</span>
              ))}
            </b>
            <span className="m-unit">{ROAD.unit}</span>
            <span className="m-day">
              {Array.from({ length: MALDA_DAYS }, (_, index) => (
                <span key={index} style={vars({ '--at': dayAt(index + 1) })}>{ROAD.day} {index + 1}</span>
              ))}
            </span>
          </p>
          <p className="m-hold" style={vars({ '--at': HOLD_AT })}>
            <b className="m-num">{MALDA_BOARDS}</b> <span className="m-unit">{holdUnit}</span> <span className="m-day">{holdDay}</span>
          </p>
        </div>

        <div className="m-days">
          <div className="m-strip" role="img" aria-label={ROAD.stripLabel}>
            {Array.from({ length: MALDA_DAYS }, (_, index) => (
              <i key={index} className="m-gold" style={vars({ '--at': dayAt(index + 1) })} />
            ))}
            <span className="m-run" style={vars({ '--at': HOLD_AT })}>
              {Array.from({ length: MALDA_NORMAL.max - MALDA_DAYS }, (_, index) => {
                const day = MALDA_DAYS + 1 + index
                return <i key={day} className={day >= MALDA_NORMAL.min ? 'm-norm' : undefined} style={vars({ '--k': index })} />
              })}
            </span>
          </div>
          <p className="m-normal" style={vars({ '--at': HOLD_AT })}>{ROAD.normal}</p>
        </div>

        <p className="m-text">{ROAD.story}</p>

        <div className="m-field" role="img" aria-label={ROAD.fieldLabel}>
          <div className="m-plane">
            {Array.from({ length: MALDA_ROWS }, (_, row) => (
              <span key={row} className="m-row" style={vars({ '--at': rowAt(row) })}>
                {Array.from({ length: PER_ROW }, (_, board) => <i key={board} />)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <i className="road-wash r-gold tl" aria-hidden="true" />
      <i className="road-wash r-dusk tl" aria-hidden="true" />
      <i className="road-wash r-night tl" aria-hidden="true" />
    </Chapter>
  )
}
