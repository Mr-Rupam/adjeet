<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes: APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Overview

AD-JEET is a marketing website for a North Bengal signage company. The entire product goal is one conversion: visitor fills the lead form or clicks WhatsApp.

## Service Map

| Env var group | Purpose |
|---|---|
| `MONGODB_URI` | Lead storage (primary) |
| `RESEND_API_KEY` | Email notification on each lead |
| `GOOGLE_*` | Google Sheets backup of leads |
| `UPSTASH_*` | Rate limiting on `/api/lead` and `/api/chatbot` |
| `OPENAI_API_KEY` | AI chatbot responses |
| `TURNSTILE_SECRET_KEY` | CAPTCHA verification (has dev test key fallback) |
| `TWILIO_*` | WhatsApp notification to Rupam on each lead |

## Key Files

- `app/api/lead/route.ts` is the lead form submission pipeline
- `app/api/chatbot/route.ts` is the chatbot response handler
- `components/sections/LeadForm.tsx` is the lead form UI, on `/contact` and on the 27 regional pages. It takes optional `defaultCity` / `defaultService` props to prefill, and still reads `?city=` from the URL when they are absent
- `design/tokens.css` holds all design tokens (colours, spacing, type scale)
- `lib/lead-schema.ts` is the Zod schema for lead form validation (add cities/services here)
- `lib/env.ts` gives validated env var access via `@t3-oss/env-nextjs`

## Common Tasks

- **Add a city to the lead form:** edit `lib/lead-schema.ts` → `city` enum. If the city also gets regional pages, add the same label to `CITY_LABELS` in `content/programmatic.ts` — the two lists are maintained separately, and a label missing from the enum silently drops the regional page's prefill (it degrades to an empty dropdown rather than failing)
- **Add a regional service-area page:** add a brief to `briefs` in `content/programmatic.ts`. `localBrief` is the only per-page content and it leads the page, so write it for that town specifically; the rest of the page is shared
- **Add a service:** edit `content/services.ts`
- **Change design tokens:** edit `design/tokens.css`
- **Update email recipient:** edit `from`/`to` in `app/api/lead/route.ts`
- **Add a place to the coverage map:** add it with `lat`/`lon` to `COVERAGE_AREAS` in `lib/coverage.ts`, then map it to a lead form city in `lib/coverage-places.ts`
- **Regenerate the map terrain or borders:** run `node scripts/build-coverage-terrain.mjs` from `adjeet-site/` and commit `public/data/` and `content/coverage-geometry.ts`. It fetches tiles at build time only; the site never does

## Env Setup

Run `vercel env pull .env.local` (fastest) or `cp .env.example .env.local` and fill in values.

Missing credentials are safe. The dev server starts without them and logs warnings instead of crashing.
