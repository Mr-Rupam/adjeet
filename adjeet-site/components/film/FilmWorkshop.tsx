import { WORKSHOP_CHAPTER, chapter } from '@/content/home-film'
import { ART, litImage } from './art'
import { Plate } from './Plate'
import { PLANES, Planes } from './planes'
import { Chapter, Name, vars } from './parts'

const ALT = 'Visualisation: a large sign workshop at dusk, looking down its length to an open doorway full of golden evening light. Finished sign boards stand in the dim space and light up one by one; the nearest carries the shop\'s name'

/** Each board's lit window (percent of the plate) and when it switches on; the first is lit from the start. */
const TALL_BOARDS = [
  { bl: 5, bt: 60.5, bw: 72, bh: 16, soft: 3 },
  { bl: 61, bt: 50, bw: 33.5, bh: 9, soft: 2.5, at: 0.34 },
  { bl: 11, bt: 44.5, bw: 24, bh: 7, soft: 2, at: 0.42 },
  { bl: 72.5, bt: 42.5, bw: 15.5, bh: 5.5, soft: 1.6, at: 0.5 },
  { bl: 45.5, bt: 40.3, bw: 12, bh: 3, soft: 1, at: 0.58 },
]
const WIDE_BOARDS = [
  { bl: 39, bt: 59.8, bw: 44, bh: 17.5, soft: 1.4 },
  { bl: 76, bt: 46, bw: 17.4, bh: 10, soft: 0.7, at: 0.34 },
  { bl: 49, bt: 38.4, bw: 11.7, bh: 8.3, soft: 0.6, at: 0.42 },
  { bl: 82.2, bt: 34.5, bw: 8.6, bh: 7, soft: 0.5, at: 0.5 },
  { bl: 67, bt: 31.6, bw: 5.3, bh: 3.6, soft: 0.4, at: 0.58 },
]
/** The time for each board's trade is lit as that board comes on. */
const TIME_BEATS = [0.26, 0.34, 0.42, 0.5, 0.58]

type Board = { bl: number; bt: number; bw: number; bh: number; soft: number; at?: number }
const boardStyle = ({ bl, bt, bw, bh, soft, at }: Board) =>
  vars({ '--bl': bl, '--bt': bt, '--bw': bw, '--bh': bh, '--soft': soft, ...(at === undefined ? {} : { '--at': at }) })

/**
 * Chapter 2, the workshop: "Made in our own workshop." A match cut from the
 * brief: it opens on the lit face of the nearest board and pulls back to the
 * dim workshop where only that board is lit, with the visitor's name on it.
 * The other boards come on one by one and the job time moves with them. It
 * leaves by pushing down the workshop into the doorway's evening light. One
 * plate in both themes; tall and wide each have their own composition.
 *
 * Depth planes: a stack of up to three plane images goes inside `.dolly`, as
 * siblings of the two composition boxes (film.css, "Depth planes").
 */
export function FilmWorkshop() {
  return (
    <Chapter id="workshop" stage="workshop" tone="light" toneAt=".08 .88" toneLate="dark light">
      <div className="cam">
        <div className="dolly tl">
          <div className="tall-only" style={vars({ '--lit': litImage(ART.workshopTall) })}>
            <Plate tall={ART.workshopTallDark} alt={ALT} />
            {TALL_BOARDS.map(board => <i key={board.bl} className="light rect" style={boardStyle(board)} />)}
            <Plate tall={ART.workshopTall} alt="" className="f-plate lit-all" style={vars({ '--at': 0.64 })} />
          </div>
          <div className="wide-only" style={vars({ '--lit': litImage(ART.workshopWide) })}>
            <Plate tall={ART.workshopWideDark} alt={ALT} />
            {WIDE_BOARDS.map(board => <i key={board.bl} className="light rect" style={boardStyle(board)} />)}
            <Plate tall={ART.workshopWide} alt="" className="f-plate lit-all" style={vars({ '--at': 0.64 })} />
          </div>
          <Planes stack={PLANES.workshop} at={0.72} />
          <Name className="face tl" />
        </div>
      </div>
      <i className="ws-veil" aria-hidden="true" />
      <div className="ws-out tl">
        <div className="card ws-card">
          <h2 id="workshop-h" className="fade" style={vars({ '--at': 0.18 })}>{chapter('workshop').title}</h2>
          <div className="times fade" style={vars({ '--at': 0.24 })}>
            <h3>{WORKSHOP_CHAPTER.caption}</h3>
            <ol>
              {WORKSHOP_CHAPTER.times.map((time, index) => (
                <li key={time.slug} style={vars({ '--at': TIME_BEATS[index] })}>{time.line}</li>
              ))}
            </ol>
          </div>
        </div>
        <p className="ws-line fade" style={vars({ '--at': 0.64 })}>{WORKSHOP_CHAPTER.line}</p>
      </div>
      {/* The board's light, then the doorway's gold: two layers, opacity only. */}
      <i className="flash tl" aria-hidden="true" />
      <i className="flash ws-gold tl" aria-hidden="true" />
    </Chapter>
  )
}
