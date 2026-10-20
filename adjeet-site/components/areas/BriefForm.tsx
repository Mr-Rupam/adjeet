import { LeadForm, type LeadFormProps } from '@/components/sections/LeadForm'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import styles from './Areas.module.css'

interface BriefFormProps extends LeadFormProps {
  heading: string
  note: string
  whatsAppUrl: string
  /** Analytics source for the WhatsApp alternative, e.g. "area:cooch-behar". */
  source: string
}

/**
 * The enquiry form for pages that already know the town, the trade or both.
 *
 * Its own paper section, never nested inside the cerulean commission band:
 * LeadForm is built for a paper surface, and one section should carry one
 * primary action. Whatever the page passes as `defaultCity` wins over a
 * `?city=` in the URL, inside LeadForm.
 */
export function BriefForm({ heading, note, whatsAppUrl, source, defaultCity, defaultService }: BriefFormProps) {
  return (
    <section className={styles.formSection} aria-labelledby="brief-form-heading" id="send-brief">
      <div className={`field-container ${styles.formGrid}`}>
        <div>
          <p className="spec text-signal">Send the brief</p>
          <h2 id="brief-form-heading" className={styles.heading}>{heading}</h2>
          <p className={styles.formNote}>{note}</p>
          <WhatsAppLink href={whatsAppUrl} source={source} className="field-link">Prefer WhatsApp? Send it there ↗</WhatsAppLink>
        </div>
        <div className={styles.formPanel}>
          <LeadForm defaultCity={defaultCity} defaultService={defaultService} />
        </div>
      </div>
    </section>
  )
}
