import { business } from '@/lib/business'

const ADJEET_WHATSAPP = business.phone

export function buildWhatsAppUrl(phone: string, message: string): string {
  const number = phone.replace(/^\+/, '')
  const base = `https://wa.me/${number}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

/**
 * The prefilled message the buyer sends. This is the single most important
 * string on the site. It is the first thing the workshop reads about a new
 * lead, and the buyer sees it before they hit send.
 *
 * It used to be assembled by pushing '. Please get in touch.' onto a parts
 * array and joining on a space, which produced a broken sentence:
 *   "Hi, I found you on your website . Please get in touch."
 * Sentences are now composed whole, so no join can strand punctuation.
 */
export function defaultWhatsAppUrl(context?: { service?: string; city?: string }): string {
  const service = context?.service?.trim()
  const city = context?.city?.trim()

  // Lead with the ask. A message naming the trade and the town lets the
  // workshop quote without a round-trip.
  let opening: string
  if (service && city) {
    opening = `Hi AD JEET, I'm interested in ${service} in ${city}.`
  } else if (service) {
    opening = `Hi AD JEET, I'm interested in ${service}.`
  } else if (city) {
    opening = `Hi AD JEET, I'm looking for signage in ${city}.`
  } else {
    opening = 'Hi AD JEET, I found you on your website.'
  }

  const message = `${opening} Could you send me a quote?`
  return buildWhatsAppUrl(ADJEET_WHATSAPP, message)
}

/**
 * A public pointer to one photographed job: the gallery photo id, the brand on
 * the sign and a short description. Only facts the gallery records belong in
 * it, because the buyer sends it to the workshop word for word.
 */
export interface ProjectReference {
  id: string
  client: string
  label: string
}

/**
 * "Ask about a sign like this": the buyer names a finished example instead of
 * the material, and the workshop can see exactly which photo they mean. The
 * blank is for the buyer to fill in WhatsApp before sending.
 */
export function projectEnquiryMessage(reference: ProjectReference): string {
  const client = reference.client.trim()
  const label = reference.label.trim()
  const example = [client, label].filter(Boolean).join(', ')
  return `Hi AD JEET, I am interested in a sign like this example: ${example} (${reference.id.trim()}). My shop is in ___. Can you help me choose?`
}

/** The example-specific enquiry, or the general one when no example is known. */
export function projectWhatsAppUrl(reference?: ProjectReference | null): string {
  if (!reference?.id.trim()) return defaultWhatsAppUrl()
  return buildWhatsAppUrl(ADJEET_WHATSAPP, projectEnquiryMessage(reference))
}
