<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
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

- `app/api/lead/route.ts` — lead form submission pipeline
- `app/api/chatbot/route.ts` — chatbot response handler
- `components/sections/LeadForm.tsx` — the contact form UI
- `design/tokens.css` — all design tokens (colours, spacing, type scale)
- `lib/lead-schema.ts` — Zod schema for lead form validation (add cities/services here)
- `lib/env.ts` — validated env var access via `@t3-oss/env-nextjs`

## Common Tasks

- **Add a city to the lead form:** edit `lib/lead-schema.ts` → `city` enum
- **Add a service:** edit `content/services.ts`
- **Change design tokens:** edit `design/tokens.css`
- **Update email recipient:** edit `from`/`to` in `app/api/lead/route.ts`

## Env Setup

Run `vercel env pull .env.local` (fastest) or `cp .env.example .env.local` and fill in values.

Missing credentials are safe — the dev server starts without them and logs warnings instead of crashing.
