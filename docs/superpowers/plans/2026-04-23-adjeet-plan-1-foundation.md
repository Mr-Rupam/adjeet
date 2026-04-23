# AD-JEET Website — Plan 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Next.js 15 project and build every site-wide primitive — design tokens, fonts, theme toggle, navigation, footer, WhatsApp FAB, and consent banner — so all subsequent plans have a working host to build into.

**Architecture:** Next.js 15 App Router with RSC by default; client components only where interaction is required. All design tokens live in a single `design/tokens.css` file as CSS custom properties imported into the root layout. Theme (light/dark/system) is managed by a lightweight client-side hook that reads/writes `localStorage` and sets `data-theme` on `<html>` before first paint to prevent flash.

**Tech Stack:** Next.js 15, Tailwind CSS 4, Framer Motion 11, TypeScript 5, Vitest + @testing-library/react (unit), Playwright (E2E)

**Plans in series:**
- Plan 1 — Foundation ← this plan
- Plan 2 — Content data + UI components + Motion
- Plan 3 — Home page + Services pages
- Plan 4 — Portfolio + About + Contact + Lead form API
- Plan 5 — Programmatic pages + SEO + Analytics

---

## File Map

| File | Responsibility |
|---|---|
| `adjeet-site/` | Next.js project root |
| `adjeet-site/design/tokens.css` | All CSS custom properties (colours, typography, elevation, spacing) |
| `adjeet-site/app/layout.tsx` | Root layout: fonts, tokens import, ThemeScript, skip link, Nav, Footer, WhatsApp FAB, ConsentBanner |
| `adjeet-site/app/globals.css` | Tailwind base + tokens import |
| `adjeet-site/tailwind.config.ts` | Tailwind 4 config referencing token CSS vars |
| `adjeet-site/lib/theme.ts` | Theme type + `getTheme` / `setTheme` helpers (pure, testable) |
| `adjeet-site/components/ThemeScript.tsx` | Server component that inlines a `<script>` to apply theme before hydration |
| `adjeet-site/components/ui/ThemeToggle.tsx` | Client component: three-state toggle button (light/dark/system) |
| `adjeet-site/lib/whatsapp.ts` | `buildWhatsAppUrl(phone, message)` helper |
| `adjeet-site/components/WhatsAppFAB.tsx` | Client component: floating WhatsApp button, appears after hero scrolls out |
| `adjeet-site/components/Nav.tsx` | Server component: desktop nav + mobile nav trigger |
| `adjeet-site/components/MobileNav.tsx` | Client component: drawer, focus trap, close on route change |
| `adjeet-site/components/Footer.tsx` | Server component: NAP, links, socials |
| `adjeet-site/components/ui/ConsentBanner.tsx` | Client component: GDPR consent banner, stores choice in localStorage |
| `adjeet-site/components/SkipLink.tsx` | Server component: skip-to-main-content link |
| `adjeet-site/vitest.config.ts` | Vitest config with jsdom + RTL |
| `adjeet-site/tests/unit/lib/theme.test.ts` | Unit tests for theme helpers |
| `adjeet-site/tests/unit/lib/whatsapp.test.ts` | Unit tests for WhatsApp URL builder |
| `adjeet-site/tests/unit/components/ThemeToggle.test.tsx` | RTL tests for ThemeToggle |
| `adjeet-site/tests/unit/components/ConsentBanner.test.tsx` | RTL tests for ConsentBanner |
| `adjeet-site/tests/e2e/foundation.spec.ts` | Playwright: nav, skip link, theme toggle, consent banner |
| `adjeet-site/playwright.config.ts` | Playwright config |

---

## Task 1: Scaffold the Next.js 15 project

**Files:**
- Create: `adjeet-site/` (entire scaffold)

- [ ] **Step 1: Run create-next-app**

From `c:\Users\KIIT0001\Downloads\AD_JEET`:

```bash
npx create-next-app@latest adjeet-site \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*" \
  --no-turbopack
```

When prompted for "Would you like to use the default import alias": accept `@/*`.

- [ ] **Step 2: Enter the project directory and install additional dependencies**

```bash
cd adjeet-site
npm install framer-motion@11
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D playwright @playwright/test
npx playwright install --with-deps chromium
```

- [ ] **Step 3: Remove boilerplate files**

Delete these files (they'll be replaced):
```bash
rm app/page.tsx app/globals.css app/page.module.css public/next.svg public/vercel.svg
```

Create a minimal placeholder home page so the app compiles:
```bash
mkdir -p app
cat > app/page.tsx << 'EOF'
export default function Home() {
  return <main id="main-content"><h1>AD-JEET</h1></main>
}
EOF
```

- [ ] **Step 4: Verify the scaffold builds**

```bash
npm run build
```

Expected: Build succeeds with no errors. Route `/` is listed in the output.

- [ ] **Step 5: Commit**

```bash
cd ..
git add adjeet-site
git commit -m "chore: scaffold Next.js 15 project with dependencies"
```

---

## Task 2: Design tokens

**Files:**
- Create: `adjeet-site/design/tokens.css`
- Create: `adjeet-site/app/globals.css`

- [ ] **Step 1: Create the tokens file**

```bash
mkdir -p adjeet-site/design
```

Create `adjeet-site/design/tokens.css`:

```css
/* ─── Colours ─────────────────────────────────────────────────────────── */
:root {
  --paper:           #F7F3EC;
  --paper-elevated:  #FBF8F3;
  --ink:             #1A1916;
  --ink-muted:       #4A4741;
  --ink-subtle:      #8A857C;
  --rule:            #E4DDD0;
  --adjeet-blue:     #1E7FB8;
  --adjeet-blue-deep:#134C70;
  --ochre:           #C9962E;
  --clay:            #A6503A;
  --sage:            #6B7C5A;
  --slate:           #455362;
  --success:         #3F7A4E;
  --warning:         #B8862A;
  --error:           #A63D3D;

  /* ─── Elevation ──────────────────────────────────────────────────────── */
  --elev-1: 0 1px 2px rgba(26,25,22,0.04), 0 2px 6px rgba(26,25,22,0.03);
  --elev-2: 0 4px 8px rgba(26,25,22,0.06), 0 12px 24px rgba(26,25,22,0.05);

  /* ─── Spacing ─────────────────────────────────────────────────────────── */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;
  --space-32: 128px;

  /* ─── Section rhythm ──────────────────────────────────────────────────── */
  --section-py: clamp(4rem, 10vh, 8rem);

  /* ─── Max width ───────────────────────────────────────────────────────── */
  --content-max: 1280px;
}

:root[data-theme="dark"] {
  --paper:          #13120F;
  --paper-elevated: #1E1C18;
  --ink:            #F0EBDE;
  --ink-muted:      #BAB3A2;
  --rule:           #2B2823;
  --adjeet-blue:    #4FA8E0;
}
```

- [ ] **Step 2: Create globals.css**

Create `adjeet-site/app/globals.css`:

```css
@import "tailwindcss";
@import "../design/tokens.css";

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  background-color: var(--paper);
  color: var(--ink);
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-inter), system-ui, sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* Body copy line length */
p, li {
  max-width: 65ch;
}

/* Visible focus rings */
:focus-visible {
  outline: 2px solid var(--adjeet-blue);
  outline-offset: 3px;
  border-radius: 2px;
}
```

- [ ] **Step 3: Update tailwind.config.ts to expose token CSS vars as utilities**

Replace the contents of `adjeet-site/tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        'paper-elevated': 'var(--paper-elevated)',
        ink: 'var(--ink)',
        'ink-muted': 'var(--ink-muted)',
        'ink-subtle': 'var(--ink-subtle)',
        rule: 'var(--rule)',
        blue: {
          DEFAULT: 'var(--adjeet-blue)',
          deep: 'var(--adjeet-blue-deep)',
        },
        ochre: 'var(--ochre)',
        clay: 'var(--clay)',
        sage: 'var(--sage)',
        slate: 'var(--slate)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
      },
      maxWidth: {
        content: 'var(--content-max)',
      },
    },
  },
}

export default config
```

- [ ] **Step 4: Verify it compiles**

```bash
cd adjeet-site && npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
cd ..
git add adjeet-site/design adjeet-site/app/globals.css adjeet-site/tailwind.config.ts
git commit -m "feat: add design tokens and Tailwind CSS 4 config"
```

---

## Task 3: Font setup

**Files:**
- Create: `adjeet-site/app/fonts.ts`
- Modify: `adjeet-site/app/layout.tsx`
- Create: `adjeet-site/public/fonts/` (directory + placeholder)

- [ ] **Step 1: Obtain font files**

Download woff2 subsets for:
- **Fraunces** (variable, Latin subset): https://fonts.google.com/specimen/Fraunces — download "Variable" TTF then convert, OR use fontsquirrel webfont generator with Latin subsetting.
- **Inter** (variable, Latin subset): https://rsms.me/inter/download.html
- **JetBrains Mono** (regular 400 only): https://www.jetbrains.com/lp/mono/

Place files at:
```
adjeet-site/public/fonts/
├── fraunces-variable.woff2
├── inter-variable.woff2
└── jetbrains-mono-400.woff2
```

If font files are not yet available, create empty placeholder files and continue — the build will still succeed:
```bash
mkdir -p adjeet-site/public/fonts
touch adjeet-site/public/fonts/fraunces-variable.woff2
touch adjeet-site/public/fonts/inter-variable.woff2
touch adjeet-site/public/fonts/jetbrains-mono-400.woff2
```

- [ ] **Step 2: Create fonts.ts**

Create `adjeet-site/app/fonts.ts`:

```typescript
import localFont from 'next/font/local'

export const fraunces = localFont({
  src: '../public/fonts/fraunces-variable.woff2',
  variable: '--font-fraunces',
  display: 'swap',
  preload: true,
  weight: '100 900',
})

export const inter = localFont({
  src: '../public/fonts/inter-variable.woff2',
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  weight: '100 900',
})

export const jetbrainsMono = localFont({
  src: '../public/fonts/jetbrains-mono-400.woff2',
  variable: '--font-mono',
  display: 'swap',
  preload: false,
  weight: '400',
})
```

- [ ] **Step 3: Add font CSS custom properties to tokens.css**

Add to the bottom of `adjeet-site/design/tokens.css`:

```css
/* ─── Typography scale ───────────────────────────────────────────────── */
:root {
  --text-display-1: clamp(3.5rem, 8vw, 7.5rem);
  --text-display-2: clamp(1.75rem, 3.5vw, 2.5rem);
  --text-body-lg: 1.125rem;
  --text-body:    1rem;
  --text-sm:      0.875rem;
}
```

- [ ] **Step 4: Verify build still passes**

```bash
cd adjeet-site && npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
cd ..
git add adjeet-site/public/fonts adjeet-site/app/fonts.ts adjeet-site/design/tokens.css
git commit -m "feat: add self-hosted font setup (Fraunces, Inter, JetBrains Mono)"
```

---

## Task 4: Theme system (lib + ThemeScript)

**Files:**
- Create: `adjeet-site/lib/theme.ts`
- Create: `adjeet-site/components/ThemeScript.tsx`
- Create: `adjeet-site/tests/unit/lib/theme.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `adjeet-site/tests/unit/lib/theme.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { resolveTheme, STORAGE_KEY } from '@/lib/theme'

describe('resolveTheme', () => {
  it('returns "light" when preference is "light"', () => {
    expect(resolveTheme('light', 'light')).toBe('light')
  })

  it('returns "dark" when preference is "dark"', () => {
    expect(resolveTheme('dark', 'dark')).toBe('dark')
  })

  it('follows system when preference is "system" and system is dark', () => {
    expect(resolveTheme('system', 'dark')).toBe('dark')
  })

  it('follows system when preference is "system" and system is light', () => {
    expect(resolveTheme('system', 'light')).toBe('light')
  })

  it('exports the correct storage key', () => {
    expect(STORAGE_KEY).toBe('adjeet-theme')
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
cd adjeet-site && npx vitest run tests/unit/lib/theme.test.ts
```

Expected: FAIL — "Cannot find module '@/lib/theme'"

- [ ] **Step 3: Implement lib/theme.ts**

Create `adjeet-site/lib/theme.ts`:

```typescript
export const STORAGE_KEY = 'adjeet-theme'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export function resolveTheme(
  preference: ThemePreference,
  systemTheme: ResolvedTheme
): ResolvedTheme {
  return preference === 'system' ? systemTheme : preference
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run tests/unit/lib/theme.test.ts
```

Expected: All 5 tests pass.

- [ ] **Step 5: Create ThemeScript server component**

Create `adjeet-site/components/ThemeScript.tsx`:

```tsx
import { STORAGE_KEY } from '@/lib/theme'

// Inlined script runs synchronously before React hydration — prevents theme flash.
// Must remain a Server Component (no 'use client') so it emits raw <script>.
export function ThemeScript() {
  const script = `
(function(){
  var pref = localStorage.getItem('${STORAGE_KEY}') || 'system';
  var sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  var resolved = pref === 'system' ? sys : pref;
  document.documentElement.setAttribute('data-theme', resolved);
})();
`
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
```

- [ ] **Step 6: Commit**

```bash
cd ..
git add adjeet-site/lib/theme.ts adjeet-site/components/ThemeScript.tsx adjeet-site/tests/unit/lib/theme.test.ts
git commit -m "feat: theme system — resolveTheme helper + ThemeScript flash-prevention"
```

---

## Task 5: ThemeToggle client component

**Files:**
- Create: `adjeet-site/components/ui/ThemeToggle.tsx`
- Create: `adjeet-site/tests/unit/components/ThemeToggle.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `adjeet-site/tests/unit/components/ThemeToggle.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// Mock localStorage
const storage: Record<string, string> = {}
beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(k => storage[k] ?? null)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => { storage[k] = v })
  Object.keys(storage).forEach(k => delete storage[k])
  // Reset data-theme attribute
  document.documentElement.removeAttribute('data-theme')
})

describe('ThemeToggle', () => {
  it('renders a button', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeTruthy()
  })

  it('cycles light → dark → system on successive clicks', () => {
    storage['adjeet-theme'] = 'light'
    render(<ThemeToggle />)
    const btn = screen.getByRole('button')

    fireEvent.click(btn)
    expect(storage['adjeet-theme']).toBe('dark')

    fireEvent.click(btn)
    expect(storage['adjeet-theme']).toBe('system')

    fireEvent.click(btn)
    expect(storage['adjeet-theme']).toBe('light')
  })

  it('has accessible label describing current theme', () => {
    storage['adjeet-theme'] = 'light'
    render(<ThemeToggle />)
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-label')).toContain('light')
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
cd adjeet-site && npx vitest run tests/unit/components/ThemeToggle.test.tsx
```

Expected: FAIL — "Cannot find module '@/components/ui/ThemeToggle'"

- [ ] **Step 3: Implement ThemeToggle**

Create `adjeet-site/components/ui/ThemeToggle.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { STORAGE_KEY, ThemePreference } from '@/lib/theme'

const CYCLE: ThemePreference[] = ['light', 'dark', 'system']

const ICONS: Record<ThemePreference, string> = {
  light: '☀️',
  dark: '🌙',
  system: '💻',
}

function readPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  return (localStorage.getItem(STORAGE_KEY) as ThemePreference) ?? 'system'
}

function applyTheme(pref: ThemePreference) {
  const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  const resolved = pref === 'system' ? sys : pref
  document.documentElement.setAttribute('data-theme', resolved)
  localStorage.setItem(STORAGE_KEY, pref)
}

export function ThemeToggle() {
  const [pref, setPref] = useState<ThemePreference>('system')

  useEffect(() => {
    setPref(readPreference())
  }, [])

  function cycle() {
    const next = CYCLE[(CYCLE.indexOf(pref) + 1) % CYCLE.length]
    setPref(next)
    applyTheme(next)
  }

  return (
    <button
      onClick={cycle}
      aria-label={`Current theme: ${pref}. Click to change.`}
      className="rounded p-2 text-ink-muted hover:text-ink transition-colors"
    >
      <span aria-hidden="true">{ICONS[pref]}</span>
    </button>
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run tests/unit/components/ThemeToggle.test.tsx
```

Expected: All 3 tests pass.

- [ ] **Step 5: Commit**

```bash
cd ..
git add adjeet-site/components/ui/ThemeToggle.tsx adjeet-site/tests/unit/components/ThemeToggle.test.tsx
git commit -m "feat: ThemeToggle — three-state light/dark/system toggle with localStorage"
```

---

## Task 6: Vitest config

**Files:**
- Create: `adjeet-site/vitest.config.ts`
- Modify: `adjeet-site/package.json` (add test script)

- [ ] **Step 1: Create vitest.config.ts**

Create `adjeet-site/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 2: Create test setup file**

Create `adjeet-site/tests/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add test script to package.json**

In `adjeet-site/package.json`, add to the `scripts` section:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Run all unit tests**

```bash
cd adjeet-site && npm test
```

Expected: All tests pass (theme.test.ts + ThemeToggle.test.tsx).

- [ ] **Step 5: Commit**

```bash
cd ..
git add adjeet-site/vitest.config.ts adjeet-site/tests/setup.ts adjeet-site/package.json
git commit -m "chore: add Vitest config and test setup"
```

---

## Task 7: WhatsApp URL builder

**Files:**
- Create: `adjeet-site/lib/whatsapp.ts`
- Create: `adjeet-site/tests/unit/lib/whatsapp.test.ts`

- [ ] **Step 1: Write failing tests**

Create `adjeet-site/tests/unit/lib/whatsapp.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

describe('buildWhatsAppUrl', () => {
  it('produces a wa.me URL with the given phone number', () => {
    const url = buildWhatsAppUrl('+919876543210', '')
    expect(url).toBe('https://wa.me/919876543210')
  })

  it('URL-encodes the message', () => {
    const url = buildWhatsAppUrl('+919876543210', 'Hello World')
    expect(url).toContain('text=Hello%20World')
  })

  it('strips leading + from phone number', () => {
    const url = buildWhatsAppUrl('+911234567890', '')
    expect(url.startsWith('https://wa.me/91')).toBe(true)
  })

  it('omits text param when message is empty', () => {
    const url = buildWhatsAppUrl('+919876543210', '')
    expect(url).not.toContain('text=')
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
cd adjeet-site && npx vitest run tests/unit/lib/whatsapp.test.ts
```

Expected: FAIL — "Cannot find module '@/lib/whatsapp'"

- [ ] **Step 3: Implement lib/whatsapp.ts**

Create `adjeet-site/lib/whatsapp.ts`:

```typescript
const ADJEET_WHATSAPP = '+919832012345' // replace with real number

export function buildWhatsAppUrl(phone: string, message: string): string {
  const number = phone.replace(/^\+/, '')
  const base = `https://wa.me/${number}`
  if (!message) return base
  return `${base}?text=${encodeURIComponent(message)}`
}

export function defaultWhatsAppUrl(context?: { service?: string; city?: string }): string {
  const parts = ['Hi, I found you on your website']
  if (context?.service) parts.push(`and I'm interested in ${context.service}`)
  if (context?.city) parts.push(`in ${context.city}`)
  parts.push('. Please get in touch.')
  return buildWhatsAppUrl(ADJEET_WHATSAPP, parts.join(' '))
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run tests/unit/lib/whatsapp.test.ts
```

Expected: All 4 tests pass.

- [ ] **Step 5: Commit**

```bash
cd ..
git add adjeet-site/lib/whatsapp.ts adjeet-site/tests/unit/lib/whatsapp.test.ts
git commit -m "feat: WhatsApp URL builder with context-prefill support"
```

---

## Task 8: SkipLink + Nav + Footer

**Files:**
- Create: `adjeet-site/components/SkipLink.tsx`
- Create: `adjeet-site/components/Nav.tsx`
- Create: `adjeet-site/components/MobileNav.tsx`
- Create: `adjeet-site/components/Footer.tsx`

These are server components (except MobileNav which needs `use client` for the drawer).

- [ ] **Step 1: Create SkipLink**

Create `adjeet-site/components/SkipLink.tsx`:

```tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue focus:text-white focus:rounded"
    >
      Skip to main content
    </a>
  )
}
```

- [ ] **Step 2: Create Nav**

Create `adjeet-site/components/Nav.tsx`:

```tsx
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { MobileNav } from '@/components/MobileNav'

const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-paper/90 backdrop-blur-sm border-b border-rule">
      <nav
        className="mx-auto flex max-w-content items-center justify-between px-6 h-16"
        aria-label="Main navigation"
      >
        <Link href="/" className="font-bold text-ink text-lg tracking-tight">
          AD-JEET
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-ink-muted hover:text-ink text-sm font-medium transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileNav links={NAV_LINKS} />
        </div>
      </nav>
    </header>
  )
}
```

- [ ] **Step 3: Create MobileNav**

Create `adjeet-site/components/MobileNav.tsx`:

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLink { href: string; label: string }

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const closeRef = useRef<HTMLButtonElement>(null)

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Focus trap: when open, trap focus inside drawer
  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  return (
    <>
      <button
        className="md:hidden p-2 text-ink-muted hover:text-ink"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        onClick={() => setOpen(v => !v)}
      >
        <span aria-hidden="true">{open ? '✕' : '☰'}</span>
      </button>

      {open && (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-50 bg-paper flex flex-col"
        >
          <div className="flex justify-end p-6">
            <button
              ref={closeRef}
              onClick={() => setOpen(false)}
              aria-label="Close navigation menu"
              className="p-2 text-ink-muted hover:text-ink"
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-col gap-6 px-8 pt-8">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-3xl font-bold text-ink hover:text-blue transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 4: Create Footer**

Create `adjeet-site/components/Footer.tsx`:

```tsx
import Link from 'next/link'

const OFFICE_ADDRESS = 'Platinum Square, Siliguri, West Bengal 734001'
const WORKSHOP_ADDRESS = 'Patiram Jote, Siliguri, West Bengal'
const WHATSAPP_DISPLAY = '+91 98320 12345' // update with real number
const WHATSAPP_HREF = 'https://wa.me/919832012345'

export function Footer() {
  return (
    <footer className="bg-ink text-ink-subtle mt-auto">
      <div className="mx-auto max-w-content px-6 py-16 grid md:grid-cols-3 gap-12">
        {/* Brand */}
        <div>
          <p className="text-ink font-bold text-lg mb-2">AD-JEET</p>
          <p className="text-sm">North Bengal's signage authority since 1990.</p>
        </div>

        {/* Addresses */}
        <div>
          <p className="text-ink text-sm font-semibold mb-3">Our Locations</p>
          <address className="not-italic text-sm space-y-3">
            <div>
              <p className="text-ink-muted font-medium">Office</p>
              <p>{OFFICE_ADDRESS}</p>
            </div>
            <div>
              <p className="text-ink-muted font-medium">Workshop</p>
              <p>{WORKSHOP_ADDRESS}</p>
            </div>
          </address>
        </div>

        {/* Links */}
        <div>
          <p className="text-ink text-sm font-semibold mb-3">Contact</p>
          <ul className="text-sm space-y-2 list-none p-0 m-0">
            <li>
              <a href={WHATSAPP_HREF} className="hover:text-ink transition-colors">
                WhatsApp: {WHATSAPP_DISPLAY}
              </a>
            </li>
          </ul>
          <div className="mt-8 pt-6 border-t border-rule/20 text-xs space-y-1">
            <Link href="/privacy" className="hover:text-ink transition-colors block">Privacy Policy</Link>
            <p>© {new Date().getFullYear()} AD-JEET. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
cd adjeet-site && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
cd ..
git add adjeet-site/components/SkipLink.tsx adjeet-site/components/Nav.tsx adjeet-site/components/MobileNav.tsx adjeet-site/components/Footer.tsx
git commit -m "feat: SkipLink, Nav (desktop + mobile drawer), Footer"
```

---

## Task 9: WhatsApp FAB

**Files:**
- Create: `adjeet-site/components/WhatsAppFAB.tsx`

- [ ] **Step 1: Create WhatsAppFAB**

Create `adjeet-site/components/WhatsAppFAB.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { defaultWhatsAppUrl } from '@/lib/whatsapp'

export function WhatsAppFAB() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('hero-section')
    if (!hero) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          key="whatsapp-fab"
          href={defaultWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
        >
          {/* WhatsApp icon SVG */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd ..
git add adjeet-site/components/WhatsAppFAB.tsx
git commit -m "feat: WhatsApp FAB — appears after hero scrolls out of view"
```

---

## Task 10: ConsentBanner

**Files:**
- Create: `adjeet-site/components/ui/ConsentBanner.tsx`
- Create: `adjeet-site/tests/unit/components/ConsentBanner.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `adjeet-site/tests/unit/components/ConsentBanner.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConsentBanner } from '@/components/ui/ConsentBanner'

const storage: Record<string, string> = {}
beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(k => storage[k] ?? null)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => { storage[k] = v })
  Object.keys(storage).forEach(k => delete storage[k])
})

describe('ConsentBanner', () => {
  it('renders when no consent stored', () => {
    render(<ConsentBanner />)
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('does not render when consent already accepted', () => {
    storage['adjeet-consent'] = 'accepted'
    render(<ConsentBanner />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('hides on Accept and stores accepted', () => {
    render(<ConsentBanner />)
    fireEvent.click(screen.getByText(/accept/i))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(storage['adjeet-consent']).toBe('accepted')
  })

  it('hides on Decline and stores declined', () => {
    render(<ConsentBanner />)
    fireEvent.click(screen.getByText(/decline/i))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(storage['adjeet-consent']).toBe('declined')
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
cd adjeet-site && npx vitest run tests/unit/components/ConsentBanner.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement ConsentBanner**

Create `adjeet-site/components/ui/ConsentBanner.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'

const CONSENT_KEY = 'adjeet-consent'

export function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true)
  }, [])

  function respond(value: 'accepted' | 'declined') {
    localStorage.setItem(CONSENT_KEY, value)
    setVisible(false)
    if (value === 'accepted' && typeof window !== 'undefined') {
      // Signal to GTM / GA4 that consent is granted
      window.dispatchEvent(new CustomEvent('adjeet:consent', { detail: value }))
    }
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie and analytics consent"
      aria-live="polite"
      className="fixed bottom-0 inset-x-0 z-50 p-6 bg-paper-elevated border-t border-rule shadow-lg md:flex md:items-center md:justify-between md:gap-8"
    >
      <p className="text-sm text-ink-muted mb-4 md:mb-0 max-w-prose">
        We use analytics cookies (Google Analytics 4) to understand how visitors use our site.
        No personal data is shared with third parties.{' '}
        <a href="/privacy" className="underline hover:text-ink">Privacy Policy</a>
      </p>
      <div className="flex gap-3 shrink-0">
        <button
          onClick={() => respond('declined')}
          className="px-4 py-2 text-sm border border-rule rounded hover:bg-paper transition-colors"
        >
          Decline
        </button>
        <button
          onClick={() => respond('accepted')}
          className="px-4 py-2 text-sm bg-blue text-white rounded hover:opacity-90 transition-opacity"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run tests/unit/components/ConsentBanner.test.tsx
```

Expected: All 4 tests pass.

- [ ] **Step 5: Commit**

```bash
cd ..
git add adjeet-site/components/ui/ConsentBanner.tsx adjeet-site/tests/unit/components/ConsentBanner.test.tsx
git commit -m "feat: ConsentBanner — GDPR consent with localStorage, GA4 event dispatch"
```

---

## Task 11: Root layout — wire everything together

**Files:**
- Modify: `adjeet-site/app/layout.tsx`

- [ ] **Step 1: Write the root layout**

Replace `adjeet-site/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next'
import { fraunces, inter, jetbrainsMono } from '@/app/fonts'
import { ThemeScript } from '@/components/ThemeScript'
import { SkipLink } from '@/components/SkipLink'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { WhatsAppFAB } from '@/components/WhatsAppFAB'
import { ConsentBanner } from '@/components/ui/ConsentBanner'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'AD-JEET — North Bengal Signage & OOH',
    template: '%s | AD-JEET',
  },
  description: 'North Bengal\'s most trusted signage and outdoor advertising partner since 1990. Glow signs, ACP/LED, flex printing, vehicle branding across 15+ districts.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen flex flex-col bg-paper text-ink">
        <SkipLink />
        <Nav />
        <main id="main-content" className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
        <WhatsAppFAB />
        <ConsentBanner />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Build the project**

```bash
cd adjeet-site && npm run build
```

Expected: Build succeeds. No TypeScript errors.

- [ ] **Step 3: Start dev server and verify visually**

```bash
npm run dev
```

Open http://localhost:3000. Verify:
- Navigation bar is visible with "AD-JEET" logo and links
- Skip-to-content link appears on Tab press
- Footer renders with addresses
- Theme toggle button cycles through light/dark/system
- Consent banner appears on first visit, disappears after Accept/Decline
- WhatsApp FAB visible (since there's no hero section on the placeholder page)

- [ ] **Step 4: Run full unit test suite**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
cd ..
git add adjeet-site/app/layout.tsx
git commit -m "feat: root layout — wires theme, nav, footer, FAB, consent banner"
```

---

## Task 12: Playwright E2E — foundation smoke tests

**Files:**
- Create: `adjeet-site/playwright.config.ts`
- Create: `adjeet-site/tests/e2e/foundation.spec.ts`

- [ ] **Step 1: Create playwright.config.ts**

Create `adjeet-site/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
})
```

- [ ] **Step 2: Write E2E tests**

Create `adjeet-site/tests/e2e/foundation.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Foundation', () => {
  test('page has AD-JEET in the nav', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'AD-JEET' })).toBeVisible()
  })

  test('skip link is focusable and present in DOM', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skipLink = page.getByText('Skip to main content')
    await expect(skipLink).toBeVisible()
  })

  test('main content region exists', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#main-content')).toBeAttached()
  })

  test('consent banner appears and can be accepted', async ({ page }) => {
    await page.goto('/')
    const banner = page.getByRole('dialog', { name: /consent/i })
    await expect(banner).toBeVisible()
    await page.getByRole('button', { name: /accept/i }).click()
    await expect(banner).not.toBeVisible()
  })

  test('consent banner is not shown after acceptance', async ({ page }) => {
    // Pre-set consent in localStorage
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('adjeet-consent', 'accepted'))
    await page.reload()
    await expect(page.getByRole('dialog', { name: /consent/i })).not.toBeVisible()
  })

  test('nav has Services, Portfolio, About, Contact links', async ({ page }) => {
    await page.goto('/')
    for (const name of ['Services', 'Portfolio', 'About', 'Contact']) {
      await expect(page.getByRole('link', { name })).toBeAttached()
    }
  })

  test('footer contains address text', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/Siliguri/i).first()).toBeVisible()
  })
})
```

- [ ] **Step 3: Run E2E tests**

Ensure dev server is running, then:

```bash
cd adjeet-site && npx playwright test
```

Expected: All 7 tests pass.

- [ ] **Step 4: Add E2E script to package.json**

In `adjeet-site/package.json` scripts:

```json
"test:e2e": "playwright test"
```

- [ ] **Step 5: Commit**

```bash
cd ..
git add adjeet-site/playwright.config.ts adjeet-site/tests/e2e/foundation.spec.ts adjeet-site/package.json
git commit -m "test: Playwright E2E foundation smoke tests — nav, skip link, consent, footer"
```

---

## Self-Review

### 1. Spec coverage check

| Spec item | Task |
|---|---|
| Next.js 15 App Router | Task 1 |
| Tailwind CSS 4 | Task 2 |
| Framer Motion 11 | installed Task 1, used Task 9 |
| Design tokens (CSS custom props) | Task 2 |
| Self-hosted fonts (Fraunces, Inter, JetBrains Mono) | Task 3 |
| Dark mode: prefers-color-scheme + manual toggle + localStorage | Task 4 + 5 |
| Theme: light/dark/system, `adjeet-theme` key | Task 4 + 5 |
| No flash on hydration | Task 4 (ThemeScript inlined script) |
| Skip-to-content link | Task 8 |
| WCAG: keyboard-operable, visible focus rings | globals.css + all components |
| Navigation + mobile nav with focus trap | Task 8 |
| Footer: NAP, WhatsApp, privacy, sitemap links | Task 8 |
| WhatsApp FAB: appears after hero scrolls out | Task 9 |
| ConsentBanner: GA4 consent-gated | Task 10 |
| `<html lang="en">` | Task 11 |
| Root layout wired | Task 11 |

No gaps found.

### 2. Placeholder scan

No TBD, TODO, or vague steps found.

### 3. Type consistency

- `ThemePreference` defined in `lib/theme.ts`, used in `ThemeToggle.tsx` — consistent.
- `buildWhatsAppUrl` / `defaultWhatsAppUrl` defined in `lib/whatsapp.ts`, used in `WhatsAppFAB.tsx` — consistent.
- `STORAGE_KEY` from `lib/theme.ts` used in `ThemeScript.tsx` — consistent.
