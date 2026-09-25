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
export const SITE_REVIEWED = '2026-09-24'

/** Paths reviewed on a different day from the rest of the site, e.g. `'/services/flex-printing': '2026-10-02'`. */
const PAGE_REVIEWED: Record<string, string> = { '/': '2026-09-26', '/portfolio': '2026-09-25', '/about': '2026-09-25', '/contact': '2026-09-25' }

export function reviewedOn(path: string): string {
  return PAGE_REVIEWED[path] ?? SITE_REVIEWED
}

/** "24 September 2026". Fixed to UTC so the server and browser print the same day. */
export function formatReviewDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(isoDate))
}
