import { business } from '@/lib/business'
import Link from 'next/link'
import { BrandLogo } from '@/components/BrandLogo'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'
import { SERVICE_SLUGS } from '@/content/services'
import { SERVICE_LINK_LABELS } from '@/content/site-links'
import { LANGUAGES_LINE } from '@/content/enquiry'
import { ALSO_SERVICES } from '@/content/company-figures'

const WHATSAPP_DISPLAY = business.phoneDisplay
const WHATSAPP_HREF = `https://wa.me/${business.phone.replace('+', '')}`

/** Every service, in catalogue order, under plain descriptive names. */
const ALL_TRADES = SERVICE_SLUGS.map(slug => ({ href: `/services/${slug}`, label: SERVICE_LINK_LABELS[slug] }))

export function Footer() {
  return (
    <footer className="site-footer section-inverse mt-auto overflow-hidden text-night-ink">
      <div className="mx-auto grid max-w-content grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-x-5 gap-y-7 px-5 py-9 md:grid-cols-[1.15fr_0.85fr_0.9fr] md:gap-11 md:px-8 md:py-20">
        <div className="col-span-2 md:col-span-1">
          <BrandLogo className="w-[200px] max-w-full" />
          <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-night-ink-muted">
            An advertising agency in Siliguri: outdoor advertising, signage and brand rollouts across North Bengal and Sikkim, made at our own workshop.
          </p>
          <p className="spec mt-3 text-signal-hot md:mt-8">Since 1990</p>
        </div>

        <div>
          <p className="spec mb-3 text-signal-hot">Find your way</p>
          <nav aria-label="Footer navigation" className="grid md:gap-2.5">
            <Link href="/services" className="footer-link">Services</Link>
            <Link href="/areas" className="footer-link">Areas we cover</Link>
            <Link href="/for-brands" className="footer-link">For Brands</Link>
            <Link href="/portfolio" className="footer-link">Portfolio</Link>
            <Link href="/about" className="footer-link">Our story</Link>
            <Link href="/contact" className="footer-link">Start a project</Link>
          </nav>
        </div>

        <div className="min-w-0">
          <p className="spec mb-3 text-signal-hot">Talk to us</p>
          <address className="not-italic text-sm leading-relaxed text-night-ink-muted">
            <p className="m-0">Workshop: {business.street}, {business.city}, {business.region} {business.postalCode}</p>
            <p className="mt-4">Office: {business.office}, {business.city} {business.officePostalCode}</p>
          </address>
          <p className="mt-4 text-sm text-night-ink-muted">{WHATSAPP_DISPLAY}</p>
          <div className="flex flex-wrap gap-x-3 text-sm">
            <WhatsAppLink href={WHATSAPP_HREF} source="footer" className="footer-link">
              WhatsApp
            </WhatsAppLink>
            <a href={"tel:" + business.phone} className="footer-link" aria-label={`Call ${WHATSAPP_DISPLAY}`}>Call</a>
          </div>
          <a href={"mailto:" + business.email} className="footer-link max-w-full break-all text-sm">{business.email}</a>
          <p className="mt-3 text-sm leading-relaxed text-night-ink-muted">{LANGUAGES_LINE}</p>
        </div>

        {/* Every trade on every page, so each service page is a link away from anywhere. */}
        <div className="col-span-2 border-t border-night-rule pt-6 md:col-span-3">
          <p className="spec mb-2 text-signal-hot">What we make</p>
          <nav aria-label="All services" className="grid grid-cols-2 gap-x-5 text-sm md:flex md:flex-wrap md:gap-x-10">
            {ALL_TRADES.map(trade => (
              <Link key={trade.href} href={trade.href} className="footer-link">{trade.label}</Link>
            ))}
          </nav>
          <p className="mt-3 text-sm leading-relaxed text-night-ink-muted">Also: {ALSO_SERVICES.join(', ').toLowerCase()}.</p>
        </div>
      </div>

      <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-4 border-t border-night-rule px-5 py-5 text-[0.75rem] text-night-ink-muted md:px-8">
        <span>© {new Date().getFullYear()} AD JEET. All rights reserved.</span>
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="footer-link">Privacy</Link>
        </div>
      </div>
    </footer>
  )
}
