import Link from 'next/link'

const OFFICE_ADDRESS = 'Platinum Square, Siliguri, West Bengal 734001'
const WORKSHOP_ADDRESS = 'Patiram Jote, Siliguri, West Bengal'
const WHATSAPP_DISPLAY = '+91 98320 11524'
const WHATSAPP_HREF = 'https://wa.me/919832011524'

export function Footer() {
  return (
    <footer className="section-inverse mt-auto overflow-hidden text-night-ink-muted">
      <div className="mx-auto grid max-w-content gap-10 px-5 py-14 md:grid-cols-3 md:px-8 md:py-16">
        {/* Brand */}
        <div>
          <p className="spec mb-3 text-signal-hot">Since 1990</p>
          <p className="max-w-[30ch] text-sm leading-relaxed">
            North Bengal&apos;s sign makers. Fabricated at Patiram Jote, installed
            everywhere the street needs light.
          </p>
        </div>

        {/* Addresses */}
        <div>
          <p className="spec mb-4 text-night-ink">Locations</p>
          <address className="not-italic text-sm leading-relaxed">
            <p className="m-0">
              <span className="spec mr-2 text-night-ink-muted">Office</span>
              {OFFICE_ADDRESS}
            </p>
            <p className="m-0 mt-3">
              <span className="spec mr-2 text-night-ink-muted">Workshop</span>
              {WORKSHOP_ADDRESS}
            </p>
          </address>
        </div>

        {/* Contact + legal */}
        <div>
          <p className="spec mb-4 text-night-ink">Contact</p>
          <ul className="m-0 list-none space-y-2 p-0 text-sm">
            <li>
              <a href={WHATSAPP_HREF} className="transition-colors hover:text-signal-hot">
                WhatsApp — {WHATSAPP_DISPLAY}
              </a>
            </li>
            <li>
              <a href="tel:+919832011524" className="transition-colors hover:text-signal-hot">
                Call — {WHATSAPP_DISPLAY}
              </a>
            </li>
            <li>
              <a href="mailto:ranjitadjeet@gmail.com" className="transition-colors hover:text-signal-hot">
                ranjitadjeet@gmail.com
              </a>
            </li>
          </ul>
          <div className="spec mt-8 space-y-1.5 border-t border-night-rule pt-5 text-[9.5px]">
            <Link href="/privacy" className="block transition-colors hover:text-signal-hot">
              Privacy policy
            </Link>
            <p className="m-0">© {new Date().getFullYear()} AD-JEET. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* The big sign — always lit */}
      <div aria-hidden="true" className="relative select-none px-2 pb-2">
        <div
          className="display night-glow-tube whitespace-nowrap text-center leading-none"
          style={{ fontSize: 'clamp(4rem, 15.5vw, 15rem)', opacity: 0.9 }}
        >
          AD-JEET
        </div>
      </div>
    </footer>
  )
}
