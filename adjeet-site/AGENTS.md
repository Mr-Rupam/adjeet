<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes: APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Overview

AD JEET is a marketing website for an advertising agency in Siliguri (since 1990): outdoor advertising, signage and brand rollouts across North Bengal and Sikkim. The entire product goal is one conversion: visitor fills the lead form or clicks WhatsApp.

## Service Map

| Env var group | Purpose |
|---|---|
| `MONGODB_URI` | Lead storage (primary) |
| `RESEND_API_KEY` | Email notification on each lead |
| `GOOGLE_*` | Google Sheets backup of leads |
| `UPSTASH_*` | Rate limiting on `/api/lead` and `/api/chatbot`, keyed by HMAC digests, never raw addresses or numbers. If it is missing or down the lead form still stores enquiries and answers truthfully, and the owner is still notified, bounded in memory to 6 notifications per 10 minutes per server instance (`LEAD_FALLBACK`); the chat fails closed and points to WhatsApp |
| `LIMITER_KEY_SECRET` | Optional: HMAC secret for rate-limit keys. Falls back to `TURNSTILE_SECRET_KEY`; with neither (local development) keys are plain SHA-256 hashes |
| `LEAD_DAILY_CAP` | Optional: enquiries across the site per UTC day before owner notifications stop (default 300). Enquiries past it are still stored |
| `LEAD_NOTIFY_HOURLY_CAP`, `LEAD_NOTIFY_DAILY_CAP` | Optional: owner notifications per hour (default 20) and per UTC day (default 60), whatever the phone number. Defaults are in `lib/lead-limits.ts` |
| `OPENAI_API_KEY` | AI chatbot responses |
| `CHATBOT_DAILY_BUDGET` | Optional: chat replies across all visitors per UTC day (default 200) |
| `CHATBOT_ENABLED` | Optional: `false` switches the chat off; it answers with the WhatsApp message and calls nothing |
| `CHATBOT_MODEL` | Optional: OpenAI model for chat replies (default `gpt-3.5-turbo`) |
| `TURNSTILE_SECRET_KEY` | CAPTCHA verification (has dev test key fallback) |
| `TWILIO_*` | WhatsApp notification to Rupam on each lead |

## Key Files

- `app/api/lead/route.ts` is the lead form submission pipeline. Its volume caps are in `lib/lead-limits.ts` and the origins both API routes accept in `lib/allowed-origins.ts` (localhost only outside production). Keep `app/(marketing)/privacy/page.tsx` true when either route changes what it collects or where it sends it
- `app/api/chatbot/route.ts` is the chatbot response handler. Its input rules are in `lib/chatbot-input.ts` and its per-visitor and daily limits in `lib/chatbot-guard.ts`; both routes key their limiters through `lib/client-ip.ts` (an IPv6 visitor counts by /64)
- `components/sections/LeadForm.tsx` is the lead form UI, on `/contact`, every service page, `/areas` and the town pages under it (through `components/areas/BriefForm.tsx`). It takes optional `defaultCity` / `defaultService` props to prefill, and still reads `?city=` from the URL when they are absent
- `design/tokens.css` holds all design tokens (colours, spacing, type scale)
- `lib/lead-schema.ts` is the Zod schema for lead form validation (add cities/services here)
- Env vars are read straight from `process.env` where they are used, and a missing one is handled there (see Env Setup). There is no central env module

## Common Tasks

- **Add a city to the lead form:** edit `lib/lead-schema.ts` → `city` enum. A town page's `leadCity` in `content/areas.ts` must be one of those values, and the tests fail if it is not
- **Add a town page:** add it to `TOWNS` in `content/areas.ts`, with only photographs whose place `content/gallery.ts` records. It is indexed (sitemap, llms.txt, no `noindex`) only when `indexable` is true, which the SEO plan's gate decides: two or more documented local jobs, 600+ words and 60%+ text of its own, measured by `tests/unit/app/areas-pages.test.tsx`. `/areas` lists every coverage place the same way: never add counts, grades or evidence badges per place
- **The old regional URLs** (`/glow-sign-board-in-siliguri` and the other 26) are permanent redirects listed in `content/legacy-regional.ts` and applied in `next.config.ts`. Never reuse one of those paths for a page
- **Add a service:** edit `content/services.ts`, give it a Siliguri brief in `content/service-local.ts` (every trade has one) and a link label in `content/site-links.ts`, which the footer reads. A buyer's term for the H1 goes in `h1` in `content/service-search.ts`; `name` still feeds the form chips
- **The page for brand teams** is `/for-brands`, with its copy in `content/for-brands.ts`. Name a brand there only if `content/gallery.ts` has its photographs, and write the process as what a team can ask for, never as past numbers. `tests/unit/app/for-brands-page.test.tsx` holds its quality gate (500+ words, under 30% overlap with any other page)
- **Link previews:** a service or town page uses its lead photo; the seven site pages use a 1200 x 630 card listed in `content/page-share.ts`, made with `node scripts/build-share-images.mjs --wide /images/work/<file>.webp` from a photo at least that size
- **Titles and descriptions:** at most 60 characters before " | AD JEET" and 150 for a description; `tests/unit/content/site-copy.test.tsx` checks every indexable page
- **Change design tokens:** edit `design/tokens.css`
- **Update email recipient:** edit `from`/`to` in `app/api/lead/route.ts`
- **Add a place to the coverage map:** add it with `lat`/`lon` to `COVERAGE_AREAS` in `lib/coverage.ts`, then map it to a lead form city in `lib/coverage-places.ts`
- **After changing what a page says:** move its date in `content/page-reviews.ts` (`PAGE_REVIEWED` for one page, `SITE_REVIEWED` after reviewing the whole site). That date is the sitemap `lastmod`, the page's `dateModified` and its "Page reviewed" line. After each production deploy, `.github/workflows/indexnow.yml` sends Bing the URLs that are new or whose date differs from the last submission IndexNow accepted, so a deploy that moves no date sends nothing. A change without a new date is never submitted, and nor is a second change to a page deployed on the same day as the first, because the date cannot move again; run the workflow by hand with "all" ticked for that
- **Change structured data:** every JSON-LD builder is in `lib/seo.ts`, and all nodes point at the one business `@id`. Search and AI owner steps (listings, reviews, measurement) are in `seo-keyword-map.md` and `local-listing-kit.md`
- **Regenerate the map terrain or borders:** run `node scripts/build-coverage-terrain.mjs` from `adjeet-site/` and commit `public/data/` and `content/coverage-geometry.ts`. It fetches tiles at build time only; the site never does

## Env Setup

Run `vercel env pull .env.local` (fastest) or `cp .env.example .env.local` and fill in values.

Missing credentials are safe. The dev server starts without them and logs warnings instead of crashing.
