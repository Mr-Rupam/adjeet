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
// 15 November 2026: a review of the whole site. Every page's text changed: the
// footer (all ten services, the areas and for-brands links, the languages
// line) is on every page, the new /for-brands page went up, the FAQs, service
// copy, titles and descriptions were rewritten, and the privacy policy was
// redone on the same day.
export const SITE_REVIEWED = '2026-11-15'

/** Paths reviewed on a different day from the rest of the site, e.g. `'/services/flex-printing': '2026-10-02'`. */
const PAGE_REVIEWED: Record<string, string> = {}

export function reviewedOn(path: string): string {
  return PAGE_REVIEWED[path] ?? SITE_REVIEWED
}

/** The most recent review date on the site, for summaries such as llms.txt. */
export function newestReview(): string {
  return [SITE_REVIEWED, ...Object.values(PAGE_REVIEWED)].sort().at(-1)!
}

/** "24 September 2026". Fixed to UTC so the server and browser print the same day. */
export function formatReviewDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(isoDate))
}
