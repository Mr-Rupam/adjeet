'use client'

import { defaultWhatsAppUrl } from '@/lib/whatsapp'
import { trackWhatsAppClick } from '@/lib/analytics'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'

interface QuoteCTAProps {
  source?: string
  className?: string
  size?: 'sm' | 'md'
  tone?: 'cyan' | 'yellow'
  label?: string
  /**
   * Icon-only, for the mobile header where there is no room for the label.
   * The label still ships as the accessible name. Sized to the 44px touch
   * minimum rather than the text button's padding.
   */
  iconOnly?: boolean
}

export function QuoteCTA({
  source = 'cta',
  className = '',
  size = 'md',
  tone = 'cyan',
  label = 'Quote on WhatsApp',
  iconOnly = false,
}: QuoteCTAProps) {
  const waUrl = defaultWhatsAppUrl()
  const sizeClass = iconOnly ? 'cta--icon' : size === 'sm' ? 'cta--sm' : 'cta--md'

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick({ source_page: source })}
      className={`cta ${sizeClass} ${tone === 'yellow' ? 'cta--yellow' : ''} whitespace-nowrap ${className}`}
    >
      <WhatsAppIcon />
      {iconOnly ? <span className="sr-only">{label}</span> : label}
    </a>
  )
}
