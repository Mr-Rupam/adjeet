import Link from 'next/link'
import { BrandLogo } from '@/components/BrandLogo'
import { WhatsAppLink } from '@/components/ui/WhatsAppLink'

const WHATSAPP_DISPLAY = '+91 98320 11524'
const WHATSAPP_HREF = 'https://wa.me/919832011524'

export function Footer() {
  return (
    <footer className="site-footer section-inverse mt-auto overflow-hidden text-night-ink">
      <div className="mx-auto grid max-w-content gap-11 px-5 py-14 md:grid-cols-[1.15fr_0.85fr_0.9fr] md:px-8 md:py-20">
        <div>
          <BrandLogo className="w-[200px] max-w-full" />
          <p className="mt-6 max-w-[30ch] text-sm leading-relaxed text-night-ink-muted">
            Signage, print, and outdoor work made in Siliguri for businesses across North Bengal.
          </p>
          <p className="spec mt-8 text-signal-hot">Since 1990</p>
        </div>

        <div>
          <p className="spec mb-4 text-signal-hot">Find your way</p>
          <nav aria-label="Footer navigation" className="grid gap-2.5">
            <Link href="/services" className="footer-link">Services</Link>
            <Link href="/portfolio" className="footer-link">Selected work</Link>
            <Link href="/about" className="footer-link">Our story</Link>
            <Link href="/contact" className="footer-link">Start a project</Link>
          </nav>
        </div>

        <div>
          <p className="spec mb-4 text-signal-hot">Talk to the workshop</p>
          <address className="not-italic text-sm leading-relaxed text-night-ink-muted">
            <p className="m-0">Platinum Square, Siliguri, West Bengal 734001</p>
            <p className="mt-4">Workshop: Patiram Jote, Siliguri, West Bengal</p>
          </address>
          <div className="mt-5 grid gap-2 text-sm">
            <WhatsAppLink href={WHATSAPP_HREF} source="footer" className="footer-link">
              WhatsApp {WHATSAPP_DISPLAY}
            </WhatsAppLink>
            <a href="tel:+919832011524" className="footer-link">Call {WHATSAPP_DISPLAY}</a>
            <a href="mailto:ranjitadjeet@gmail.com" className="footer-link">ranjitadjeet@gmail.com</a>
          </div>
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
