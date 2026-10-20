/**
 * When each page's content was last reviewed, as an ISO date.
 *
 * One record feeds every place a date appears, so they cannot disagree: the
 * sitemap's `lastmod`, the page's WebPage `dateModified`, and the "Reviewed"
 * line printed on service and regional pages. The IndexNow job submits exactly
 * the URLs whose date moved since the last submission IndexNow accepted.
 *
 * Move a date only when that page's text, structured data or links actually
 * change. Search engines stop trusting a `lastmod` that moves on every deploy,
 * and a date bumped without a real review is the fake freshness Google's
 * helpful content guidance warns about.
 *
 * To record a change to one page, add its path to `PAGE_REVIEWED`. After a
 * review of the whole site, move `SITE_REVIEWED` and clear the overrides.
 */
export const SITE_REVIEWED = '2026-09-27'

/** Paths reviewed on a different day from the rest of the site, e.g. `'/services/flex-printing': '2026-10-02'`. */
const PAGE_REVIEWED: Record<string, string> = {
  // 20 October 2026: the lead form's receipt and recovery wording changed.
  '/contact': '2026-10-20',
  // 20 October 2026: the storefront-led homepage and the restyled about page.
  '/about': '2026-10-20',
  // 20 October 2026: the regional pages folded into the service pages and
  // /areas; wall painting renamed "Wall Painting Advertising" in every list.
  '/': '2026-10-20',
  '/services': '2026-10-20',
  '/portfolio': '2026-10-20',
  '/services/glow-sign-boards': '2026-10-20',
  '/services/acp-led-signage': '2026-10-20',
  '/services/flex-printing': '2026-10-20',
  '/services/vehicle-branding': '2026-10-20',
  '/services/wall-painting': '2026-10-20',
  '/services/f-pole-installation': '2026-10-20',
  '/services/in-shop-branding': '2026-10-20',
  '/services/events-and-puja': '2026-10-20',
  '/services/one-way-vision': '2026-10-20',
  '/services/product-display': '2026-10-20',
  '/areas': '2026-10-20',
  '/areas/cooch-behar': '2026-10-20',
  '/areas/jalpaiguri': '2026-10-20',
  '/areas/gangtok': '2026-10-20',
}

export function reviewedOn(path: string): string {
  return PAGE_REVIEWED[path] ?? SITE_REVIEWED
}

/** "24 September 2026". Fixed to UTC so the server and browser print the same day. */
export function formatReviewDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(isoDate))
}
