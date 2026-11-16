import Link from 'next/link'
import { JUNCTION, chapter } from '@/content/home-film'
import { ART, litImage } from './art'
import { Plate } from './Plate'
import { Chapter, Name, vars } from './parts'

/** When each surface lights up, in the order of JUNCTION.surfaces. */
const SURFACE_AT = [0.07, 0.165, 0.26, 0.355, 0.45, 0.545]

/**
 * One soft window on to the lit plate per surface: tall --ql --qt --qw --qh
 * with feathers --qf --qv, wide --qlw --qtw --qww --qhw (percent of the plate).
 */
const WINDOWS = [
  { ql: 15.5, qt: 59.2, qw: 66, qh: 7.2, qf: 3, qv: 1.5, qlw: 50.2, qtw: 57.4, qww: 37.7, qhw: 9.7 },
  { ql: 14, qt: 46.5, qw: 41.5, qh: 13.2, qf: 8, qv: 4, qlw: 50.2, qtw: 37.5, qww: 24, qhw: 18.5 },
  { ql: 18.5, qt: 24.6, qw: 64.5, qh: 17.5, qf: 4, qv: 3, qlw: 52.8, qtw: 5.5, qww: 36.5, qhw: 26 },
  { ql: 82.5, qt: 61.6, qw: 17.5, qh: 8, qf: 2.5, qv: 2, qlw: 88.4, qtw: 60, qww: 9.6, qhw: 10.6 },
  { ql: 0, qt: 58.5, qw: 36, qh: 24.5, qf: 3, qv: 2, qlw: 23.5, qtw: 68, qww: 24.5, qhw: 23 },
  { ql: 15, qt: 65.5, qw: 63, qh: 16, qf: 2.5, qv: 2, qlw: 53, qtw: 65.5, qww: 32, qhw: 21 },
]
const windowStyle = (w: (typeof WINDOWS)[number], at: number) =>
  vars({
    '--ql': w.ql, '--qt': w.qt, '--qw': w.qw, '--qh': w.qh, '--qf': w.qf, '--qv': w.qv,
    '--qlw': w.qlw, '--qtw': w.qtw, '--qww': w.qww, '--qhw': w.qhw, '--at': at,
  })

/**
 * Chapter 5, the junction: "Shopfronts, walls, vehicles, events." Out of the
 * ridge board's white light, a street corner at night after rain: every
 * advertising surface on it switches on in turn and takes the visitor's name
 * in its own style, while one line at the bottom names the work. Then the
 * whole list settles in the sky and the camera pushes into the floodlit
 * hoarding. No photograph is ever placed on a drawn surface.
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
          alt="Visualisation: a street corner in a town at night after rain. A rooftop hoarding, a painted wall panel, a glow sign board over a shuttered shop, a pole sign and a van's side panel, all new and blank, light up one after another, and the shop opens"
        />
        {WINDOWS.map((w, index) => <i key={index} className="win" aria-hidden="true" style={windowStyle(w, SURFACE_AT[index])} />)}
        <i className="win j-lit" aria-hidden="true" style={vars({ '--at': 0.63 })} />

        {/* The visitor's name on each surface, in that surface's own style. */}
        <Name className="face j-glow" style={vars({ '--at': SURFACE_AT[0] })} />
        <Name className="face j-wall" style={vars({ '--at': SURFACE_AT[1] })} />
        <i className="hoard-out tl" aria-hidden="true"><Name className="face j-hoard" style={vars({ '--at': SURFACE_AT[2] })} /></i>
        <Name className="face j-van" style={vars({ '--at': SURFACE_AT[4] })} />
        <i className="on-plate j-flood tl" aria-hidden="true" />
      </div>
      <i className="j-veil" aria-hidden="true" />

      <div className="card junction-card tl">
        <h2 id="junction-h" className="fade" style={vars({ '--at': 0.04 })}>{chapter('junction').title}</h2>
      </div>

      {/* The changing line repeats the list below for the eye only. */}
      <div className="j-caps tl" aria-hidden="true">
        {JUNCTION.surfaces.map((trade, index) => trade && (
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
