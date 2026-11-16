import Link from 'next/link'
import { JUNCTION, chapter } from '@/content/home-film'
import { ART, litImage } from './art'
import { Plate } from './Plate'
import { Chapter, Name, vars } from './parts'

/** When each surface lights up, in the order of JUNCTION.surfaces, evenly spaced. */
export const SURFACE_AT = [0.07, 0.19, 0.31, 0.43, 0.55] as const

/**
 * One soft window on to the lit plate per surface: tall --ql --qt --qw --qh
 * with feathers --qf --qv, wide --qlw --qtw --qww --qhw (percent of the plate).
 * The glow sign board, the painted wall, the pole sign, the van, the shop.
 */
const WINDOWS = [
  { ql: 15.5, qt: 59.2, qw: 66, qh: 7.2, qf: 3, qv: 1.5, qlw: 50.2, qtw: 57.4, qww: 37.7, qhw: 9.7 },
  { ql: 14, qt: 46.5, qw: 41.5, qh: 13.2, qf: 8, qv: 4, qlw: 50.2, qtw: 37.5, qww: 24, qhw: 18.5 },
  { ql: 82.5, qt: 61.6, qw: 17.5, qh: 8, qf: 2.5, qv: 2, qlw: 88.4, qtw: 60, qww: 9.6, qhw: 10.6 },
  { ql: 0, qt: 58.5, qw: 36, qh: 24.5, qf: 3, qv: 2, qlw: 23.5, qtw: 68, qww: 24.5, qhw: 23 },
  { ql: 15, qt: 65.5, qw: 63, qh: 16, qf: 2.5, qv: 2, qlw: 53, qtw: 65.5, qww: 32, qhw: 21 },
] as const
const windowStyle = (w: (typeof WINDOWS)[number], at: number) =>
  vars({
    '--ql': w.ql, '--qt': w.qt, '--qw': w.qw, '--qh': w.qh, '--qf': w.qf, '--qv': w.qv,
    '--qlw': w.qlw, '--qtw': w.qtw, '--qww': w.qww, '--qhw': w.qhw, '--at': at,
  })

/**
 * Chapter 5, the junction: "Shopfronts, walls, vehicles, events." Out of the
 * ridge board's white light, a street corner at night after rain, under an
 * open night sky: five surfaces switch on in turn (the glow sign board over
 * the shop, the painted wall, the pole sign, the van, the open shop), each
 * taking the visitor's name in its own style where it has a blank face, while
 * one line at the bottom names the work. Then the whole list settles in the
 * sky, the name steps off the glow sign board, and the camera pushes into
 * that board until its own light fills the screen. No photograph is ever
 * placed on a drawn surface.
 */
export function FilmJunction() {
  return (
    <Chapter
      id="junction" stage="junction" tone="light" toneAt=".07 .97" toneLate="dark light"
      stageStyle={vars({ '--lit-t': litImage(ART.junctionTall), '--lit-w': litImage(ART.junctionWide) })}
    >
      <div className="cam junction-cam">
        <Plate
          tall={ART.junctionTallDark}
          wide={ART.junctionWideDark}
          alt="Visualisation: a street corner in a town at night after rain, under an open night sky. A glow sign board over a shuttered shop, a painted wall panel, a pole sign and a van's side panel, all new and blank, light up one after another, and the shop opens"
        />
        {WINDOWS.map((w, index) => <i key={index} className="win" aria-hidden="true" style={windowStyle(w, SURFACE_AT[index])} />)}
        <i className="win j-lit" aria-hidden="true" style={vars({ '--at': 0.62 })} />

        {/* The visitor's name on each blank face, in that surface's own style.
            The names step off before the push, so the push never shows giant
            cropped letters (a wrapper, since each face's own opacity is its
            beat). The open shop has no blank face: its beat is the shop
            opening. */}
        <i className="j-name-out tl" aria-hidden="true">
          <Name className="face j-glow" style={vars({ '--at': SURFACE_AT[0] })} />
          <Name className="face j-wall" style={vars({ '--at': SURFACE_AT[1] })} />
          <Name className="face j-pole" style={vars({ '--at': SURFACE_AT[2] })} />
          <Name className="face j-van" style={vars({ '--at': SURFACE_AT[3] })} />
        </i>
        <i className="on-plate j-board tl" aria-hidden="true" />
      </div>
      <i className="j-veil" aria-hidden="true" />
      <i className="j-bloom tl" aria-hidden="true" />

      <div className="card junction-card tl">
        <h2 id="junction-h" className="fade" style={vars({ '--at': 0.04 })}>{chapter('junction').title}</h2>
      </div>

      {/* The changing line repeats the list below for the eye only. */}
      <div className="j-caps tl" aria-hidden="true">
        {JUNCTION.surfaces.map((trade, index) => (
          <p key={trade.label} className="j-cap" style={vars({ '--at': SURFACE_AT[index] })}>
            {trade.href ? <Link href={trade.href} tabIndex={-1}>{trade.label}</Link> : <span>{trade.label}</span>}
          </p>
        ))}
      </div>

      <div className="j-list tl"><div className="fade" style={vars({ '--at': 0.66 })}>
        <p className="j-line">{JUNCTION.line}</p>
        <ul className="j-trades" aria-label={JUNCTION.listLabel}>
          {JUNCTION.trades.map(trade => (
            <li key={trade.label}>{trade.href ? <Link href={trade.href}>{trade.label}</Link> : trade.label}</li>
          ))}
        </ul>
      </div></div>

      <i className="j-wash j-in tl" aria-hidden="true" />
      <i className="j-wash j-out tl" aria-hidden="true" />
    </Chapter>
  )
}
