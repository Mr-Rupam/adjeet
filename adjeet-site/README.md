# AD-JEET Website

North Bengal's signage authority — Next.js 16 / App Router / Tailwind CSS 4.

## Getting started

```bash
npm run dev
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | E2E tests (Playwright) |

## Setup

**Prerequisites:** Node >=20, npm

**Fastest (requires Vercel access):**
```bash
npx vercel link      # one-time: links this directory to the Vercel project
vercel env pull .env.local
npm install && npm run dev
```

**Manual:**
```bash
cp .env.example .env.local   # fill in values — .env.example has source links for each
npm install && npm run dev
```

Missing credentials are safe — the dev server starts without them and logs warnings instead of crashing.

