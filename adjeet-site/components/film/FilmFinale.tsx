import { QuoteCTA } from '@/components/ui/QuoteCTA'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { FILM_SOURCES, FINALE, chapter } from '@/content/home-film'
import { PROFILE_WHATSAPP_MESSAGE } from '@/content/for-brands'
import { business } from '@/lib/business'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { SceneLayer } from '@/components/home/theme-scene-layers'
import { ART, litImage } from './art'
import { Plate, WIDE_SCREEN } from './Plate'
import { Chapter, Name, vars } from './parts'

const profileUrl = buildWhatsAppUrl(business.phone, PROFILE_WHATSAPP_MESSAGE)

/** Each board's window on to the lit street (percent of the plate) and when it switches on. */
const TALL_LIGHTS = [
  { bl: 4.2, bt: 48, bw: 13.5, bh: 3, soft: 1.4, at: 0.2 },
  { bl: 82.2, bt: 48, bw: 11.8, bh: 3, soft: 1.4, at: 0.27 },
  { bl: 0, bt: 52, bw: 22, bh: 40, soft: 3, at: 0.33 },
  { bl: 76, bt: 52, bw: 24, bh: 40, soft: 3, at: 0.39 },
  { bl: 22, bt: 82, bw: 54, bh: 14, soft: 4, at: 0.45 },
]
const WIDE_LIGHTS = [
  { bl: 44, bt: 45.3, bw: 12.5, bh: 7.3, soft: 0.6, at: 0.2 },
  { bl: 87.4, bt: 45.3, bw: 12.6, bh: 7, soft: 0.6, at: 0.27 },
  { bl: 44, bt: 53, bw: 12, bh: 15, soft: 1.2, at: 0.33 },
  { bl: 92.5, bt: 53, bw: 7.5, bh: 10, soft: 1, at: 0.39 },
  { bl: 8.5, bt: 59, bw: 30, bh: 9, soft: 1.5, at: 0.45 },
]
type Light = (typeof TALL_LIGHTS)[number]
const lightStyle = ({ bl, bt, bw, bh, soft, at }: Light) => vars({ '--bl': bl, '--bt': bt, '--bw': bw, '--bh': bh, '--soft': soft, '--at': at })

/**
 * Chapter 7, the finale: "Your name is next." Back on the first street, out
 * of the dark the proof ends on. It started with one lit sign; the boards
 * along the street come on one by one, the middle one carrying the visitor's
 * name. Then the words and the actions. The street is the hero's own night
 * scene through the hero's image pipeline (`night`), so a visitor in the dark
 * theme already has it.
 *
 * Depth planes: a stack of up to three plane images goes inside `.cam`, after
 * the base picture (film.css, "Depth planes").
 */
export function FilmFinale({ night }: { night: SceneLayer }) {
  return (
    <Chapter id="finale" stage="finale" tone="dark">
      <div className="cam">
        <picture>
          <source media={WIDE_SCREEN} srcSet={night.wideSrcSet} sizes="178vh" />
          <img
            className="f-plate"
            src={night.tall.src as string}
            srcSet={night.tall.srcSet}
            sizes="100vw"
            width={night.tall.width}
            height={night.tall.height}
            alt="Visualisation: the same market street at night, where one sign was lit; one by one every board along it comes on and the shops open"
            loading="lazy"
            decoding="async"
          />
        </picture>
        <div className="fin-lights tall-only" style={vars({ '--lit': litImage(ART.finaleTall) })}>
          {TALL_LIGHTS.map(light => <i key={light.at} className="light rect" style={lightStyle(light)} />)}
        </div>
        <div className="fin-lights wide-only" style={vars({ '--lit': litImage(ART.finaleWide) })}>
          {WIDE_LIGHTS.map(light => <i key={light.at} className="light rect" style={lightStyle(light)} />)}
        </div>
        {/* Then the whole lit street, so nothing the windows missed stays dark. */}
        <Plate tall={ART.finaleTall} wide={ART.finaleWide} alt="" className="f-plate lit-all" style={vars({ '--at': 0.5 })} />
        <Name />
      </div>
      <i className="fin-veil" aria-hidden="true" />
      <div className="card fin-card fade" style={vars({ '--at': 0.55 })}>
        <h2 id="finale-h">{chapter('finale').title}</h2>
        <p>{FINALE.line}</p>
      </div>
      <div className="fin-acts fade" style={vars({ '--at': 0.6 })}>
        <QuoteCTA source={FILM_SOURCES.finale} label={FINALE.action} tone="yellow" />
        <div className="fin-more">
          <WhatsAppLink href={profileUrl} source={FILM_SOURCES.finaleProfile} className="quiet">{FINALE.profile}</WhatsAppLink>
          <a className="fin-tel" href={`tel:${business.phone}`}>{business.phoneDisplay}</a>
        </div>
      </div>
      <i className="flash tl" aria-hidden="true" />
    </Chapter>
  )
}
