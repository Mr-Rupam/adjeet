import Link from 'next/link'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { BRANDS, FILM_SOURCES, WALL_DESKTOP_MAX, WALL_PHONE_MAX, chapter, wallCompanies } from '@/content/home-film'
import { yearsWith } from '@/content/company-figures'
import { PROFILE_WHATSAPP_MESSAGE } from '@/content/for-brands'
import { business } from '@/lib/business'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { Chapter, vars } from './parts'

const profileUrl = buildWhatsAppUrl(business.phone, PROFILE_WHATSAPP_MESSAGE)

/** The wave: the boards switch on one after another, in reading order. */
const WAVE_FROM = 0.2
const WAVE_TO = 0.38

/**
 * Chapter 1, brands: "Brands stay for years." (storyboard-v2, section 4).
 * The light the hero ended on is the lit face of one sign board; the camera
 * pulls back to a dark wall of the film's boards (cream lit face, thin
 * cerulean frame), one company on each, all the same size. A wave switches
 * them on; then the words: "200+ companies since 1990" as the large figure,
 * the years with a brand as small stamps under those brands' boards, and the
 * actions. It leaves by pushing into the one blank board at the wall's
 * centre until its light fills the screen, the light the work chapter opens
 * on.
 *
 * Logos are printed on the face (multiply), at their own pixel size or
 * smaller, and never recoloured; they step off before the camera moves, so
 * the push never draws one larger. A company without a clean logo is lettered.
 */
export function FilmBrands() {
  const wall = wallCompanies()
  const now = new Date()
  const rows = (count: number, cols: number) => Math.ceil(count / cols)
  const phoneRows = rows(Math.min(wall.length, WALL_PHONE_MAX), 3)
  const deskRows = rows(Math.min(wall.length, WALL_DESKTOP_MAX), 6)
  const stageStyle = vars({
    '--rows-t': phoneRows, '--rows-w': deskRows,
    '--sr-t': Math.ceil(phoneRows / 2), '--sr-w': Math.ceil(deskRows / 2),
  })
  return (
    <Chapter id="brands" stage="brands" tone="light" toneAt=".05 .9" toneLate="dark light" stageStyle={stageStyle}>
      <i className="b-pool tl" aria-hidden="true" />

      <div className="b-cam tl">
        <ul className="b-wall" aria-label={BRANDS.wallLabel}>
          {wall.map((company, index) => (
            <li
              key={company.name}
              className={`b-board${index >= WALL_PHONE_MAX ? ' b-wide' : ''}`}
              style={vars({ '--at': +(WAVE_FROM + ((WAVE_TO - WAVE_FROM) * index) / Math.max(1, wall.length - 1)).toFixed(3) })}
              data-company={company.name}
            >
              <i className="b-lit" aria-hidden="true" />
              <span className="b-print tl">
                {company.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a logo file at its own size or smaller
                  <img src={company.logo.src} width={company.logo.width} height={company.logo.height} alt={company.name} loading="lazy" decoding="async" />
                ) : (
                  <b style={vars({ '--n': company.name.length })}>{company.name}</b>
                )}
              </span>
              {company.since !== undefined && (
                <span className="b-stamp fade" style={vars({ '--at': 0.44, '--off': 0.8 })}>
                  {yearsWith(company.since, now)} years<span className="sr"> with {company.name}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
        <i className="b-seed tl" aria-hidden="true" />
      </div>

      <div className="b-out tl">
        <div className="card b-card">
          <h2 id="brands-h" className="fade" style={vars({ '--at': 0.42 })}>{chapter('brands').title}</h2>
        </div>
        <div className="b-words fade" style={vars({ '--at': 0.46 })}>
          <p className="b-big"><b>{BRANDS.companies.value}</b> {BRANDS.companies.label}</p>
          <div className="acts">
            <WhatsAppLink href={profileUrl} source={FILM_SOURCES.brandsProfile} className="cta cta--md cta--yellow"><WhatsAppIcon />{BRANDS.profile}</WhatsAppLink>
            <Link className="quiet" href={BRANDS.brands.href}>{BRANDS.brands.label}</Link>
          </div>
        </div>
      </div>

      <i className="flash tl" aria-hidden="true" />
    </Chapter>
  )
}
