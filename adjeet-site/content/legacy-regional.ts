/**
 * The 27 regional landing pages retired on 20 October 2026, and where each one
 * now points. Decision D1, Option A, in the 3 October SEO plan.
 *
 * Each page paired one trade with one town, and only the short local brief at
 * the top was its own; the rest repeated the service page. Google indexed one
 * of each Siliguri pair and skipped the other, and most of the rest were never
 * crawled. So:
 *
 * - the five Siliguri pages fold into their trade's service page, which now
 *   carries the Siliguri brief, the "send us" list and a prefilled form;
 * - Cooch Behar, Jalpaiguri and Gangtok keep a town page of their own;
 * - Darjeeling and Malda fold into `/areas`, which lists every coverage place
 *   the same way.
 *
 * Pure data with no imports: `next.config.ts` reads it to build the permanent
 * redirects, and the config loader runs before the app's path aliases exist.
 * The tests in `tests/unit/content/legacy-regional.test.ts` check every old
 * slug is mapped exactly once and that each destination is a live page.
 */
export interface LegacyRegionalRedirect {
  source: `/${string}`
  destination: `/${string}`
}

export const LEGACY_REGIONAL_REDIRECTS: readonly LegacyRegionalRedirect[] = [
  // Siliguri: the service page is the one Siliguri page for each trade.
  { source: '/glow-sign-board-in-siliguri', destination: '/services/glow-sign-boards' },
  { source: '/acp-led-signage-in-siliguri', destination: '/services/acp-led-signage' },
  { source: '/flex-printing-in-siliguri', destination: '/services/flex-printing' },
  { source: '/vehicle-branding-in-siliguri', destination: '/services/vehicle-branding' },
  { source: '/f-pole-installation-in-siliguri', destination: '/services/f-pole-installation' },

  // Towns with documented jobs keep one page covering every trade.
  { source: '/glow-sign-board-in-cooch-behar', destination: '/areas/cooch-behar' },
  { source: '/acp-led-signage-in-cooch-behar', destination: '/areas/cooch-behar' },
  { source: '/flex-printing-in-cooch-behar', destination: '/areas/cooch-behar' },
  { source: '/vehicle-branding-in-cooch-behar', destination: '/areas/cooch-behar' },
  { source: '/f-pole-installation-in-cooch-behar', destination: '/areas/cooch-behar' },

  { source: '/glow-sign-board-in-jalpaiguri', destination: '/areas/jalpaiguri' },
  { source: '/acp-led-signage-in-jalpaiguri', destination: '/areas/jalpaiguri' },
  { source: '/flex-printing-in-jalpaiguri', destination: '/areas/jalpaiguri' },
  { source: '/vehicle-branding-in-jalpaiguri', destination: '/areas/jalpaiguri' },
  { source: '/f-pole-installation-in-jalpaiguri', destination: '/areas/jalpaiguri' },

  { source: '/glow-sign-board-in-gangtok', destination: '/areas/gangtok' },
  { source: '/acp-led-signage-in-gangtok', destination: '/areas/gangtok' },

  // Darjeeling and Malda: their guidance lives on the areas page, beside every
  // other place, rather than on pages of their own.
  { source: '/glow-sign-board-in-darjeeling', destination: '/areas' },
  { source: '/acp-led-signage-in-darjeeling', destination: '/areas' },
  { source: '/flex-printing-in-darjeeling', destination: '/areas' },
  { source: '/vehicle-branding-in-darjeeling', destination: '/areas' },
  { source: '/f-pole-installation-in-darjeeling', destination: '/areas' },

  { source: '/glow-sign-board-in-malda', destination: '/areas' },
  { source: '/acp-led-signage-in-malda', destination: '/areas' },
  { source: '/flex-printing-in-malda', destination: '/areas' },
  { source: '/vehicle-branding-in-malda', destination: '/areas' },
  { source: '/f-pole-installation-in-malda', destination: '/areas' },
]
