// Allowlisted landing pages and campaign labels for the private enquiry
// record. This runs on every page (components/analytics/LeadSourceCapture),
// so it holds its own copy of the service slugs instead of importing the
// service copy; tests/unit/lib/lead-source.test.ts keeps them in step.
const pages = new Set(['/', '/about', '/contact', '/services', '/portfolio', '/privacy', '/terms', '/coverage'])
const services ='glow-sign-boards|acp-led-signage|flex-printing|vehicle-branding|wall-painting|f-pole-installation|in-shop-branding|events-and-puja|one-way-vision|product-display'
const servicePage = new RegExp(`^/services/(${services})$`)
// The 27 old regional URLs redirect to these, so a visitor lands on the destination.
const areaPage = /^\/areas(\/(cooch-behar|jalpaiguri|gangtok))?$/
const sources = ['google', 'bing', 'facebook', 'instagram', 'referral', 'whatsapp']
const media = ['organic', 'cpc', 'social', 'referral']
const campaigns = ['gbp', 'local-shopfronts']
export interface LeadSource { landingPage: string; source: string; medium: string; campaign: string }
const label = (value: unknown, allowed: string[]) => typeof value === 'string' && allowed.includes(value) ? value : 'unknown'

/** Never retain raw query strings, arbitrary paths, referrers or user-supplied tags. */
export function normalizeLeadSource(input: unknown): LeadSource {
  const data = input && typeof input === 'object' ? input as Record<string, unknown> : {}
  const path = typeof data.landingPage === 'string' ? data.landingPage.split(/[?#]/)[0] : ''
  return {
    landingPage: pages.has(path) || servicePage.test(path) || areaPage.test(path) ? path : 'unknown',
    source: label(data.source, sources), medium: label(data.medium, media), campaign: label(data.campaign, campaigns),
  }
}
export function readLeadSource(pathname: string, search: string): LeadSource {
  const query = new URLSearchParams(search)
  return normalizeLeadSource({ landingPage: pathname, source: query.get('utm_source'), medium: query.get('utm_medium'), campaign: query.get('utm_campaign') })
}

// First page within this page lifetime only. No cookie, storage or visitor ID.
let firstSource: LeadSource | undefined
export function captureLeadSource(): LeadSource {
  if (typeof window === 'undefined') return normalizeLeadSource(undefined)
  firstSource ??= readLeadSource(window.location.pathname, window.location.search)
  return firstSource
}
