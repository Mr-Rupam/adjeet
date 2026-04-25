import Link from 'next/link'

const OFFICE_ADDRESS = 'Platinum Square, Siliguri, West Bengal 734001'
const WORKSHOP_ADDRESS = 'Patiram Jote, Siliguri, West Bengal'
const WHATSAPP_DISPLAY = '+91 98320 11524'
const WHATSAPP_HREF = 'https://wa.me/919832011524'

export function Footer() {
  return (
    <footer className="bg-ink text-ink-subtle mt-auto">
      <div className="mx-auto max-w-content px-6 py-16 grid md:grid-cols-3 gap-12">
        {/* Brand */}
        <div>
          <p className="text-ink font-bold text-lg mb-2">AD-JEET</p>
          <p className="text-sm">North Bengal's signage authority since 1990.</p>
        </div>

        {/* Addresses */}
        <div>
          <p className="text-ink text-sm font-semibold mb-3">Our Locations</p>
          <address className="not-italic text-sm space-y-3">
            <div>
              <p className="text-ink-muted font-medium">Office</p>
              <p>{OFFICE_ADDRESS}</p>
            </div>
            <div>
              <p className="text-ink-muted font-medium">Workshop</p>
              <p>{WORKSHOP_ADDRESS}</p>
            </div>
          </address>
        </div>

        {/* Links */}
        <div>
          <p className="text-ink text-sm font-semibold mb-3">Contact</p>
          <ul className="text-sm space-y-2 list-none p-0 m-0">
            <li>
              <a href={WHATSAPP_HREF} className="hover:text-ink transition-colors">
                WhatsApp: {WHATSAPP_DISPLAY}
              </a>
            </li>
          </ul>
          <div className="mt-8 pt-6 border-t border-rule/20 text-xs space-y-1">
            <Link href="/privacy" className="hover:text-ink transition-colors block">Privacy Policy</Link>
            <p>© {new Date().getFullYear()} AD-JEET. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
