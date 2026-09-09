'use client'

import { trackWhatsAppClick } from '@/lib/analytics'

interface WhatsAppLinkProps {
  href: string
  /** Where the click came from, e.g. "programmatic:glow-sign-board-in-siliguri". */
  source: string
  className?: string
  children: React.ReactNode
}

/**
 * A WhatsApp link that reports the click.
 *
 * Most of the site's WhatsApp CTAs live in server components (the service
 * detail pages, all 25 programmatic city pages, Contact, CoverageBoard, the
 * footer), so they could not carry an onClick and fired no analytics at all.
 * Five of the nine WhatsApp surfaces were invisible, including every city
 * landing page, which is exactly the traffic the programmatic pages exist to
 * win. Without this you cannot tell which city or trade actually converts.
 *
 * Use QuoteCTA where you want the standard button. Use this when the
 * surrounding page supplies its own styling.
 */
export function WhatsAppLink({ href, source, className = '', children }: WhatsAppLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick({ source_page: source })}
      className={className}
    >
      {children}
    </a>
  )
}
