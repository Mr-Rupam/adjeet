# AD-JEET Website — Handoff (Pending Tasks Only)

**Last updated:** 2026-05-16  
**Reviews completed:** design, eng, CEO, DX  
**Working directory:** `adjeet-site/`

---

## What's Already Done

Everything from the eng review, CEO review, and DX review has been implemented:
- CORS origins, Upstash rate limiting, metadataBase, chatbot security
- Design tokens (paper/ink/adjeet-blue), Khand + Anek Latin fonts
- WhatsApp notification (Twilio), GSAP + Spline installed
- Dead Hero variants deleted, LeadForm fixes (rounded-full, honeypot)
- Playwright E2E tests for lead form
- next-intl scaffold (middleware, `app/[locale]/` routing, `messages/en.json`)
- LocalBusiness JSON-LD, og-image.jpg, robots.ts, sitemap.ts
- HeroSandbox CSS (380 lines), ClientShowcase redesign
- `.env.example` with all vars + source comments
- `lib/env.ts` with `@t3-oss/env-nextjs` validation (all vars optional)
- README Setup section with `vercel env pull` as step 1
- Request ID (`reqId`) in both API routes, prefixed log lines
- AGENTS.md expanded to ~1 page
- `.nvmrc`, `engines` field, GitHub Actions CI, Dependabot
- Dev comment removed from `app/api/lead/route.ts`

---

## 1. Pending Owner Actions (cannot be automated)

These block real production functionality. Rupam must do them manually:

| # | Action | Blocks |
|---|--------|--------|
| O-1 | Verify adjeet.in domain in Resend dashboard (add SPF/DKIM TXT records) | Lead email from `leads@adjeet.in` — currently sends from `onboarding@resend.dev` which may go to spam. Once DNS is verified, update `from` in `app/api/lead/route.ts:168` |
| O-2 | Create Twilio account + request WhatsApp Business sender approval | WhatsApp notification to Rupam on each lead (code already in place, just needs credentials in Vercel env vars) |
| O-3 | Purchase GSAP Club licence (~$150/yr) | SplitText and Flip plugins — GSAP core + ScrollTrigger are free and usable now |
| O-4 | Supply phone number for footer + LocalBusiness schema | `Footer.tsx:56-59` has `href="tel:"` placeholder. `app/layout.tsx` has `// TODO: add "telephone"` comment. Add the same number to both. |

---

## 2. Design System Reference (locked — do not change)

| Token | Value | Rule |
|-------|-------|------|
| `--adjeet-blue` | `#0A1628` | Midnight navy. Secondary UI only. |
| `--paper` | `#F7F3EC` | Warm cream background |
| `--ink` | `#1A1916` | Near-black body text |
| `--ochre` | `#C9962E` | Primary accent — CTAs, highlights |
| Corner radius | `rounded` or `rounded-lg` | **Never `rounded-full` anywhere** |
| Hero zone fonts | Khand + Anek Latin | `Hero.tsx` / `Hero.sandbox.tsx` only |
| Rest of site | Fraunces + Inter | All other sections |

---

## 3. What NOT to Change

- `content/services.ts` — 10 services intentional (2 extras beyond PRD kept)
- Lead flow architecture: MongoDB primary → Sheets backup → Resend email
- framer-motion in HeroSandbox — do not replace with CSS animations
- The chatbot — explicitly kept despite PRD non-goal designation
- Existing test files — only add new ones, never modify existing

---

## 4. TypeScript Build Gate

Before marking any implementation complete:
```bash
cd adjeet-site && npx tsc --noEmit
```
Must pass clean.
