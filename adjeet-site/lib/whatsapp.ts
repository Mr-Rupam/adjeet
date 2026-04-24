const ADJEET_WHATSAPP = '+919832011524'

export function buildWhatsAppUrl(phone: string, message: string): string {
  const number = phone.replace(/^\+/, '')
  const base = `https://wa.me/${number}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

export function defaultWhatsAppUrl(context?: { service?: string; city?: string }): string {
  const parts = ['Hi, I found you on your website']
  if (context?.service) parts.push(`and I'm interested in ${context.service}`)
  if (context?.city) parts.push(`in ${context.city}`)
  parts.push('. Please get in touch.')
  return buildWhatsAppUrl(ADJEET_WHATSAPP, parts.join(' '))
}
