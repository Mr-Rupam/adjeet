const ADJEET_WHATSAPP = '+919832011524'

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
