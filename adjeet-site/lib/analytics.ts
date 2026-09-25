// GA4 measurement ID for adjeet.in. A measurement ID is public (it ships in the
// page either way), so it lives in code; NEXT_PUBLIC_GA_ID can still override it.
// The tag only loads after a visitor accepts analytics in the consent banner.
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-MHDXYFE82G'

type GtagFn = (...args: unknown[]) => void

function gtag(...args: unknown[]) {
  if (typeof window === 'undefined') return
  const w = window as Window & { gtag?: GtagFn }
  if (typeof w.gtag === 'function') w.gtag(...args)
}

export function trackWhatsAppClick(params: { source_page: string; source_service?: string; source_city?: string }) {
  gtag('event', 'whatsapp_click', params)
}

export function trackLeadSubmit(params: { city: string; timeline: string }) {
  gtag('event', 'lead_submit', params)
}

export function trackPortfolioFilter(params: { filter_type: 'service'; filter_value: string }) {
  gtag('event', 'portfolio_filter', params)
}

export function trackServicePageView(service: string) {
  gtag('event', 'service_page_view', { service })
}

export function trackProgrammaticView(params: { service: string; city: string }) {
  gtag('event', 'programmatic_view', params)
}

export function trackThemeToggle(theme: string) {
  gtag('event', 'theme_toggle', { theme })
}
