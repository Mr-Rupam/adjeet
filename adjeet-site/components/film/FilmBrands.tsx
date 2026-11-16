import Link from 'next/link'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { BRANDS, FILM_SOURCES, WALL, chapter } from '@/content/home-film'
import { PROFILE_WHATSAPP_MESSAGE } from '@/content/for-brands'
import { business } from '@/lib/business'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { Chapter, vars } from './parts'

const profileUrl = buildWhatsAppUrl(business.phone, PROFILE_WHATSAPP_MESSAGE)

/** Boards across, at most: three on a phone, eight on a desktop. */
export const WALL_COLS = { phone: 3, desk: 8 } as const

/**
 * The wall's rows: as few as the columns allow, the boards shared out so the
 * fuller rows come first (22 boards: six rows of three and two of two on a
 * phone; eight, seven and seven on a desktop).
 */
export function wallRows(count: number, cols: number): number[] {
  const rows = Math.ceil(count / cols)
  const base = Math.floor(count / rows)
  const extra = count % rows
  return Array.from({ length: rows }, (_, row) => base + (row < extra ? 1 : 0))
}

/**
 * Where each board sits: its row, and its first column on a grid of half
 * boards, so a shorter row is centred (a brick bond).
 */
export function wallPlaces(count: number, cols: number): { row: number; col: number }[] {
  const places: { row: number; col: number }[] = []
  wallRows(count, cols).forEach((size, row) => {
    for (let i = 0; i < size; i++) places.push({ row: row + 1, col: 1 + (cols - size) + 2 * i })
  })
  return places
}

/** The beat the wall lights on: the stop itself (content/home-film.ts, brands stops). */
const WALL_AT = 0.5

/**
 * Chapter 1, brands: "Brands stay for years." The hero's board light shrinks
 * to one blank board as the dark wall of the film's boards comes in (frames
 * only). Landing on the stop, the heading is already there; then the boards
 * light by themselves in a wave of about one and a half seconds, then the
 * figure, the years with the five tenure brands and the actions. Coming back
 * up from the photographs, the wall is lit at once. It leaves as the wall
 * dims and the blank board's light grows to fill the screen.
 *
 * One opacity transition per board and nothing moving once the wall is lit:
 * a board is a frame with a lit face, and the face holds the logo as a plain
 * image, never drawn above its pixel size (on a phone at most half of it, so
 * it is sharp at 2x) and never recoloured. A brand without a sharp enough
 * file is lettered.
 */
export function FilmBrands() {
  const phone = wallPlaces(WALL.length, WALL_COLS.phone)
  const desk = wallPlaces(WALL.length, WALL_COLS.desk)
  const stageStyle = vars({
    '--rows-t': wallRows(WALL.length, WALL_COLS.phone).length,
    '--rows-w': wallRows(WALL.length, WALL_COLS.desk).length,
  })
  return (
    <Chapter id="brands" stage="brands" tone="light" toneAt=".05 .9" toneLate="dark light" stageStyle={stageStyle}>
      <i className="b-pool" style={vars({ '--at': WALL_AT })} aria-hidden="true" />

      <div className="b-cam tl">
        <ul className="b-wall" style={vars({ '--at': WALL_AT })} aria-label={BRANDS.wallLabel}>
          {WALL.map((brand, index) => (
            <li
              key={brand.name}
              className="b-board"
              style={vars({ '--k': index, '--r': phone[index].row, '--c': phone[index].col, '--rw': desk[index].row, '--cw': desk[index].col })}
              data-company={brand.name}
            >
              <span className="b-face">
                {brand.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a logo file at its own size or smaller
                  <img
                    src={brand.logo.src}
                    width={brand.logo.width}
                    height={brand.logo.height}
                    alt={brand.name}
                    loading="lazy"
                    decoding="async"
                    style={vars({ '--lw': `${brand.logo.width}px`, '--lh': `${brand.logo.height}px` })}
                  />
                ) : (
                  <b style={vars({ '--n': brand.name.length })}>{brand.name}</b>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <i className="b-seed tl" aria-hidden="true" />

      <div className="b-out tl">
        <div className="card b-card">
          <h2 id="brands-h" className="fade" style={vars({ '--at': 0.3 })}>{chapter('brands').title}</h2>
        </div>
        <div className="b-words fade" style={vars({ '--at': WALL_AT })}>
          <p className="b-big"><b>{BRANDS.companies.value}</b> {BRANDS.companies.label}</p>
          <p className="b-years">{BRANDS.tenure()}</p>
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
