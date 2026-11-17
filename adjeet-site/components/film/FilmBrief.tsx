import { QuoteCTA } from '@/components/ui/QuoteCTA'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { BRIEF, FILM_SOURCES, SHOP_NAME_MAX, chapter } from '@/content/home-film'
import { FOR_BRANDS_WHATSAPP_MESSAGE } from '@/content/for-brands'
import { business } from '@/lib/business'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { ART } from './art'
import { Plate } from './Plate'
import { Chapter, Name, vars } from './parts'

const outletUrl = buildWhatsAppUrl(business.phone, FOR_BRANDS_WHATSAPP_MESSAGE)

/**
 * Chapter 1, the brief: "It starts with a photo." The light that filled the
 * screen is a phone's screen; the camera pulls back to a phone in front of
 * the same street, out of focus. A photo goes out, the artwork comes back with
 * the visitor's name on it, then the words. It leaves by pushing into the lit
 * board in the reply. The name field is real: what is typed letters every
 * board from here on. It stays on the device (session storage), and session
 * recording masks it.
 */
export function FilmBrief() {
  return (
    <Chapter id="brief" stage="brief" tone="light" toneAt=".1 .8" toneLate="page light">
      <div className="cam brief-bd" aria-hidden="true">
        <Plate tall={ART.briefDayTall} wide={ART.briefDayWide} alt="" pictureClassName="day" />
        <Plate tall={ART.briefNightTall} wide={ART.briefNightWide} alt="" pictureClassName="night" />
      </div>
      <i className="brief-veil" aria-hidden="true" />

      <div className="rig tl">
        <div className="phone tl">
          <div className="screen">
            <div className="sbar tl" aria-hidden="true"><span>9:41</span><i /></div>
            <div className="chead tl" aria-hidden="true"><b>{BRIEF.chatName}</b></div>
            <div className="view"><div className="thread tl">
              <div className="outwrap tl">
                <figure className="msg out">
                  <Plate tall={ART.shopBefore} alt="Visualisation: a shopfront with a dull, unlit, blank board over its open front" className="" />
                  <figcaption>{BRIEF.sent}</figcaption>
                </figure>
              </div>
              <i className="typing tl" aria-hidden="true"><b /><b /><b /></i>
              <figure className="msg in tl">
                <div className="pic">
                  <Plate tall={ART.shopAfter} alt="Visualisation: the same shopfront with a new lit board carrying the shop's name" className="" />
                  <Name />
                  <i className="glow tl" aria-hidden="true" />
                </div>
                <figcaption className="tl">{BRIEF.reply}</figcaption>
              </figure>
            </div></div>
            <label className="compose tl">
              <span className="sr">{BRIEF.inputLabel}</span>
              <input
                type="text"
                data-name-input
                data-clarity-mask="true"
                maxLength={SHOP_NAME_MAX}
                autoComplete="off"
                spellCheck={false}
                placeholder={BRIEF.inputPlaceholder}
              />
              <i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 12l16-8-6 16-2.5-6.5L4 12Z" /></svg></i>
            </label>
            <i className="screen-light tl" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* --at and --off only tell the dock when this gold action shows; the words are scroll-bound. */}
      <div className="brief-out tl" style={vars({ '--at': 0.47, '--off': 0.66 })}>
        <div className="card brief-card">
          <h2 id="brief-h">{chapter('brief').title}</h2>
          <p>{BRIEF.line}</p>
          <div className="acts">
            <QuoteCTA source={FILM_SOURCES.brief} label={BRIEF.action} tone="yellow" />
            <WhatsAppLink href={outletUrl} source={FILM_SOURCES.briefOutlets} className="quiet">{BRIEF.outlets}</WhatsAppLink>
          </div>
        </div>
      </div>
      <i className="flash tl" aria-hidden="true" />
    </Chapter>
  )
}
