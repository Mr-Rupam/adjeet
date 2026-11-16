import Image from 'next/image'
import Link from 'next/link'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { FILM_SOURCES, LEDGER_LOGOS, PROOF, PROOF_PICKS, chapter } from '@/content/home-film'
import { PROFILE_WHATSAPP_MESSAGE } from '@/content/for-brands'
import { getPhotoById, type GalleryPhoto } from '@/content/gallery'
import { photoPlace } from '@/content/photo-places'
import { getServiceBySlug } from '@/content/services'
import { business } from '@/lib/business'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { Chapter, vars } from './parts'

const profileUrl = buildWhatsAppUrl(business.phone, PROFILE_WHATSAPP_MESSAGE)

/** When each photograph's frame lights, in play order. */
const SHOT_AT = [0, 0.09, 0.17, 0.25, 0.33, 0.41]

/**
 * A photograph's caption: only what its gallery record says, in the order
 * client, kind of work, place, year (as the site's fascia captions).
 */
export function proofCaption(photo: GalleryPhoto): string[] {
  const place = photoPlace(photo)
  return [
    photo.client,
    getServiceBySlug(photo.service)?.name ?? '',
    place && photo.year ? `${place}, ${photo.year}` : place ?? (photo.year ? String(photo.year) : ''),
  ].filter(Boolean)
}

/**
 * Chapter 6, the proof: "Brands stay for years." Everything before was a
 * picture of an idea; this is the record. Six real photographs from the
 * gallery pass as a film strip tied to the scroll, each whole, in a thin
 * cerulean frame, never drawn larger than its own pixels, captioned only with
 * its record. Then the GPS line, and the ledger: one lit board carrying the
 * client logos, the years beside it. The photographs go through the site's
 * image pipeline; their `sizes` say how wide they are drawn.
 */
export function FilmProof() {
  const years = PROOF.years()
  return (
    <Chapter id="proof" stage="proof" tone="light" toneAt=".05" toneLate="dark">
      <div className="card proof-card tl">
        <h2 id="proof-h" className="fade" style={vars({ '--at': 0.04 })}>{chapter('proof').title}</h2>
      </div>

      <div className="strip tl">
        <ol className="reel tl" aria-label={PROOF.reelLabel}>
          {PROOF_PICKS.map((pick, index) => {
            const photo = getPhotoById(pick.id)
            const [client, ...rest] = proofCaption(photo)
            return (
              <li key={pick.id} className="shot" style={vars({ '--at': SHOT_AT[index] })} data-photo={pick.id}>
                <figure>
                  <div className="frame" style={vars({ '--pw': `${pick.width}px` })}>
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={pick.width}
                      height={pick.height}
                      sizes={`(orientation: portrait) min(calc(100vw - 32px), ${pick.width}px), min(68vw, ${pick.width}px)`}
                      loading="lazy"
                      decoding="async"
                      {...(index >= 2 ? { 'data-keep-lazy': '' } : {})}
                    />
                    {index === 0 && <i className="f-lbox tl" aria-hidden="true" />}
                  </div>
                  <figcaption><b>{client}</b>{rest.map(part => <span key={part}>{part}</span>)}</figcaption>
                </figure>
              </li>
            )
          })}
        </ol>
        <p className="count" aria-hidden="true">
          <span className="count-n">
            {PROOF_PICKS.map((pick, index) => <span key={pick.id} style={vars({ '--at': SHOT_AT[index] })}>{index + 1}</span>)}
          </span>{' '}of {PROOF_PICKS.length}
        </p>
      </div>

      <p className="gps tl">{PROOF.gps}</p>

      <div className="ledger tl">
        <div className="lboard fade" style={vars({ '--at': 0.66 })}>
          {LEDGER_LOGOS.map(logo => (
            // eslint-disable-next-line @next/next/no-img-element -- a logo file at its own size or smaller
            <img key={logo.brand} src={logo.src} width={logo.width} height={logo.height} alt={logo.brand} loading="lazy" decoding="async" style={vars({ '--lh': `${logo.height1x}px` })} />
          ))}
        </div>
        <div className="lside">
          <p className="big fade" style={vars({ '--at': 0.67 })}><b>{PROOF.companies.value}</b> {PROOF.companies.label}</p>
          <ul className="years fade" style={vars({ '--at': 0.68 })}>
            {years.map(line => <li key={line}>{line}</li>)}
          </ul>
          <div className="acts fade" style={vars({ '--at': 0.69 })}>
            <WhatsAppLink href={profileUrl} source={FILM_SOURCES.proofProfile} className="cta cta--md cta--yellow"><WhatsAppIcon />{PROOF.profile}</WhatsAppLink>
            <Link className="quiet" href={PROOF.brands.href}>{PROOF.brands.label}</Link>
            <Link className="quiet" href={PROOF.work.href}>{PROOF.work.label}</Link>
          </div>
        </div>
      </div>

      <i className="p-wash p-white tl" aria-hidden="true" />
      <i className="p-wash p-night tl" aria-hidden="true" />
    </Chapter>
  )
}
