import { business } from '@/lib/business'
import { buildPageMetadata } from '@/lib/seo'
import { LeadForm } from '@/components/sections/LeadForm'
import { buildBreadcrumbJsonLd, buildWebPageJsonLd, jsonLdString } from '@/lib/seo'
import { PageMasthead } from '@/components/street/PageMasthead'
import { QuoteCTA } from '@/components/ui/QuoteCTA'

const PAGE = {
  title: "Contact Our Siliguri Team for a Signage Quote",
  description: "Call or WhatsApp +91 98320 11524 for signage, printing and outdoor advertising in North Bengal. AD JEET office: Platinum Square, Station Feeder Road, Siliguri.",
  path: "/contact",
}
export const metadata = buildPageMetadata(PAGE)
const webPage = buildWebPageJsonLd({ ...PAGE, type: 'ContactPage' })
const breadcrumb = buildBreadcrumbJsonLd([{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact' }])
const METHODS = [
  { method: 'WhatsApp', value: business.phoneDisplay, note: 'Send a photo and tell us what you have in mind.', href: `https://wa.me/${business.phone.replace('+', '')}`, external: true },
  { method: 'Call', value: business.phoneDisplay, note: 'Talk through your site, size and timing.', href: 'tel:' + business.phone, external: false },
  { method: 'Email', value: business.email, note: 'For drawings, artwork and detailed briefs.', href: 'mailto:' + business.email, external: false },
]
export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumb) }} />
      <PageMasthead meta={['Start a project', 'Siliguri / North Bengal']} title={<>Your signage project. <br /><span className="text-signal">Let&apos;s talk.</span></>} lead="Contact AD JEET in Siliguri for signage, printing and outdoor branding across North Bengal. Start with a site photo or a complete project brief.">
        <QuoteCTA source="contact" label="WhatsApp your project" />
      </PageMasthead>
      <section className="field-container contact-layout">
        <aside className="contact-intro">
          <h2 data-site-reveal="title">A conversation.<br />Then a plan.</h2>
          {METHODS.map(item => <a key={item.method} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined} className="contact-method"><span className="spec">{item.method} ↗</span><strong>{item.value}</strong><small>{item.note}</small></a>)}
          <div className="contact-address"><p className="spec">Find us in Siliguri</p><h3>Workshop / {business.workshop}</h3><p>{business.street}, {business.city}, {business.region} {business.postalCode}. Open {business.hours}.</p><h3>Office / {business.office}</h3><p>{business.city}, {business.region} {business.officePostalCode}</p></div>
          <a className="contact-location-link" href={business.mapsUrl} target="_blank" rel="noopener noreferrer">
            <span className="spec">Plan your visit</span><strong>AD JEET, Patiram Jote, Siliguri</strong><span>Open our Google Maps listing ↗</span>
          </a>
        </aside>
        <div className="contact-form"><h2 data-site-reveal="title">Send a project brief.</h2><p>The location, what you need and when you need it.</p><LeadForm /></div>
      </section>
    </>
  )
}
