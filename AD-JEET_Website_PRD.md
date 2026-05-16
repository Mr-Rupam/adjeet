# AD-JEET Website — Product Requirements Document

| | |
|---|---|
| **Version** | 1.0 (Draft) |
| **Owner** | Rupam Das |
| **Status** | Ready for build |
| **Domain** | `adjeet.in` |
| **Target launch window** | 4–6 weeks from PRD sign-off |
| **Last updated** | 23 April 2026 |

---

## 1. Executive summary

Build a flagship marketing website for AD-JEET — a 35-year-old signage and OOH agency headquartered in Siliguri — that converts its considerable offline reputation into inbound local and regional leads across North Bengal, Sikkim, and adjacent border markets. The site is a single-brand showcase for AD-JEET only (sister firm AD-SQUARE is out of scope and receives a separate minimal site). It is designed, written, and engineered to win commercial-intent Google searches in the coverage region, carry the brand's weight with Fortune 500 procurement teams, and feel modern without sacrificing the legibility and speed needed by buyers on Jio 4G in a tier-2 city.

This is not an MVP. It replaces the MVP-first plan with a 4–6 week flagship build using **Next.js 15 + Vercel + an Organic Minimalist design system** with kinetic typography, considered motion, and a topographic 3D hero that ties the visual language directly to AD-JEET's structural differentiator: it knows the terrain.

---

## 2. Business context (condensed)

AD-JEET is the operating-firm piece of a two-firm setup run by Rupam's father. Established 1990. Services span flex, glow, ACP/LED, F-pole, wall painting, in-shop branding, vehicle branding, events, and seasonal puja work. Clients are a mix of large national brands (Airtel, Jio, Vivo, Havells, Supreme Pipe, Astral Pipe, Star Cement, SRMB, Shyam Steel, Emami, OYO, Dalmia, Ambuja/ACC, Anchor by Panasonic, and multiple TMT bar brands) and local SMBs / retailers / event organisers. The firm has deep trust with municipalities and local vendors across 15+ districts. It has no functioning digital presence. Competitors with weaker offline track records are winning Google search visibility.

The website is the central asset of Phase 1 of AD-JEET's digital rebuild. GBP is already claimed and being optimised in parallel (separate workstream). WhatsApp is — and will remain — the primary live conversation channel; the website exists to feed it.

---

## 3. Goals, non-goals, and success metrics

### 3.1 Goals

1. **Discoverability.** Rank in the top 3 Google results for commercial-intent queries in the coverage region (e.g., `signage maker siliguri`, `glow sign board siliguri`, `acp board near me`,`LED board near me` when searched from Siliguri, Jalpaiguri, Cooch Behar, Malda, Darjeeling, Gangtok,Uttar Dinajpur,Dakshin Dinnajpur).
2. **Credibility.** Make a Fortune 500 brand manager reviewing regional vendors feel AD-JEET is the obvious choice on the first scroll.
3. **Conversion.** Turn inbound visitors into WhatsApp conversations or site-survey requests within 90 seconds of landing.
4. **Operational leverage.** Every lead is tagged with source, service interest, and city so Rupam can learn what actually works in Phase 2.

### 3.2 Non-goals (v1)

- Online ordering, productised pricing, or checkout flows.
- Blog / editorial content hub (deferred to Phase 2 once inbound traffic exists).
- Multilingual UI with full translations (see §5 for i18n-ready scaffolding).
- AD-SQUARE co-branding of any kind.
- Customer login, client portal, project tracker.
- AI-generated content beyond copy assist during build.

### 3.3 Success metrics (first 90 days post-launch)

| Metric | Target | Measurement |
|---|---|---|
| Organic sessions / month | 2,000+ | GA4 |
| Top-3 rankings for priority keywords | 15+ | Google Search Console |
| GBP → website click-through | 200+ / mo | GBP Insights |
| WhatsApp click-to-chat events | 150+ / mo | GA4 event `whatsapp_click` |
| Lead form submissions | 30+ / mo | GA4 event `lead_submit` |
| LCP (p75, mobile, India) | < 2.0 s | Chrome UX Report |
| CLS (p75) | < 0.1 | CrUX |
| INP (p75) | < 200 ms | CrUX |
| Lighthouse score (mobile) | ≥ 95 across the board | Lighthouse CI |

---

## 4. Audiences

Three buyer archetypes, weighted by revenue contribution, not volume.

**Raj — regional brand manager at a national FMCG / Telecom / Building materials brand.** Lives in Kolkata or Guwahati, flies in for field reviews, evaluates regional vendors on a laptop. Cares about: scale, execution capacity, process maturity, who else the vendor works with, permissioning know-how in hill states, case studies with real brands.

**Sanjay — local retailer / showroom owner in Siliguri or a surrounding town.** Searches `glow sign board siliguri` on his phone, clicks the first listing that looks legit, expects to be on WhatsApp with a human within minutes. Cares about: price indication, turnaround time, sample of past work in his category, phone number visible.

**Event organiser / puja committee secretary.** Seasonal buyer, time-critical (Durga Puja, local festivals, weddings, political events). Cares about: "Can you deliver before X date?", references, photos of similar-scale installations.

These three drive the IA, copy, and CTA hierarchy.

---

## 5. Scope

### In scope (v1)

- Public marketing site at `https://adjeet.in`, mobile-first, fully responsive (360 → 1920+ viewports).
- English-only UI copy, but i18n-scaffolded (`next-intl`) so Bengali and Hindi can be added post-launch without refactor. [ASSUMPTION]
- 6 core pages + a programmatic service × city page set (25 pages).
- Portfolio filterable by service type and region. Target: 30 case studies at launch, minimum 20. [ASSUMPTION]
- WhatsApp-first lead capture with a secondary site-survey form.
- Full WCAG 2.2 AA compliance — keyboard operability, focus management, screen-reader-first component design, contrast, reduced-motion support. Voice-navigation is **out of scope for v1** (see §11.4).
- Lottie + GSAP motion system. One Spline 3D set-piece (the topographic map hero, §9.5). No per-service 3D scenes in v1.
- GA4, GTM, Search Console, and a privacy-compliant consent banner.
- MDX-based content in the repo. No external CMS. [ASSUMPTION — if your father or anyone else needs to edit content directly, we upgrade this to Sanity in a v1.1 sprint.]

### Out of scope (v1)

- Authenticated areas, user accounts, client dashboards.
- E-commerce / cart / payments.
- Spline scenes for each service card.
- Live quote calculator.
- Video hero (we design for static + motion layer only — video is a v1.5 add).
- AD-SQUARE content, logo, or cross-links of any kind.

### Client logo display — assumption flagged

Assuming client logos are **not pre-cleared for public display**. The site will present trust signals as **category-based silhouettes** ("Trusted by leading telecom operators", "Building materials leaders") with unbranded placeholders, until written permission is secured per brand. Replace placeholders with real logos as permissions come in. This is the single biggest legal risk and the default must be conservative. [ASSUMPTION — override if you have documented permission.]

---

## 6. Site architecture

```
adjeet.in/
├── /                              Home
├── /services                      Services overview
│   ├── /services/glow-sign-boards
│   ├── /services/acp-led-signage
│   ├── /services/flex-printing
│   ├── /services/vehicle-branding
│   ├── /services/wall-painting
│   ├── /services/f-pole-installation
│   ├── /services/in-shop-branding
│   └── /services/events-and-puja
├── /portfolio                     Portfolio index (filterable)
│   └── /portfolio/[slug]          Case study detail
├── /about                         35-year story
├── /contact                       Contact + site-survey form
├── /programmatic/                 (Service × City landing pages — see §6.2)
├── /sitemap.xml
├── /robots.txt
├── /llms.txt                      (emerging standard — AI agent guidance)
└── /404, /500
```

### 6.1 Page-level content specification

**Home.** Six scroll sections. (1) Hero: kinetic headline + topo 3D scene + dual CTA (WhatsApp / Book Site Survey). (2) Services grid — 8 service tiles, organic hover. (3) The 35-year proof block — a stacked narrative with numbers (districts served, installations done, brands trusted). (4) Portfolio teaser — 6 curated case studies with filter affordance. (5) Coverage map teaser (static preview of /coverage). (6) Trust band (category silhouettes) + testimonial carousel (from the deck). Footer: NAP, GBP embed, WhatsApp, social, sitemap.

**Services overview.** Honest taxonomy of what AD-JEET does. Each card links to a detail page. Not a sales brochure — information architecture that lets a brand manager parse capabilities in 15 seconds.

**Service detail (×8).** Above-fold: what it is, materials / finishes / sizes offered, 3–5 representative past installs, turnaround time indication, WhatsApp CTA. Below-fold: FAQ (3–5 questions), "We also do" cross-link band, site-survey CTA. Each page targets ~600–1,000 words of editorial content with natural keyword integration (not stuffed).

**Portfolio index.** Filterable grid. Filters: service type, region/district, client category (public, don't name brands). Grid items: install photo (lazy-loaded), service label, city, year. Click → case study.

**Case study detail.** Brief (2–3 paragraphs) problem / execution / outcome. Gallery of 4–10 photos. Meta: service, city, year, (client category if logos not cleared). Related work band at bottom.

**Coverage.** The geographic differentiator page. Topo 3D map as hero (§9.5). Below it: district-by-district capability summary. Each district gets its own child page with local install photos + local landmarks mentioned for SEO.

**About.** Long-form 35-year story, timeline, a photograph of the Patiram Jote workshop, an honest photograph of your father (optional — check with him). "Why 35 years matters" as structured content (from the deck). Team / capacity mention if you want it. Core values if they resonate — skip if they don't.

**Contact.** Platinum Square address + Patiram Jote workshop address with separate phones, embedded Google Map, site-survey form. [ASSUMPTION: Show Patiram Jote as "Workshop" and Platinum Square as "Office". Office phone currently +91 98320-11524 shared; confirm separation.]

### 6.2 Programmatic service × city pages (25 at launch)

Matrix: 5 priority services × 5 priority cities = 25 pages.

**Services (priority order):** glow sign boards, ACP LED signage, flex printing, vehicle branding, F-pole installation.

**Cities (priority order):** Siliguri, Jalpaiguri, Cooch Behar, Darjeeling, Malda.

URL pattern: `/[service]-in-[city]` — e.g., `/glow-sign-board-in-siliguri`. Each page is ~400–600 words of **unique** content (not templated boilerplate — Google penalises that) built from: local landmarks, local examples of past installations, local testimonials if available, city-specific commentary (permissions / terrain / market character).

These pages are the SEO workhorse. They are boring, unglamorous, and will drive a disproportionate share of inbound traffic. The design system must produce these pages quickly and consistently — a shared `<ServiceCityLayout>` component with per-page MDX content for the unique copy.

**Post-launch expansion:** grow to 8 services × 10 cities = 80 pages by month 3. Not in v1 scope but architecture must support it without refactor.

---

## 7. Design system — Organic Minimalist for AD-JEET

### 7.1 Design principles

1. **Grounded, not sterile.** Minimalism often reads as cold and SaaS-y. AD-JEET's minimalism has texture — paper grain, warm neutrals, considered serif display — because the business is physical, tactile, and 35 years deep. Nothing should look like Linear or Stripe.
2. **Legible before clever.** Every motion and type choice must read on a 4.7" Android in bright daylight in Bidhan Market. If it doesn't, it goes.
3. **Earned decoration.** 3D, kinetic type, and motion are used sparingly and only where they carry meaning. The topographic hero earns its place because "terrain expertise" is a business differentiator. A spinning 3D cube on a button does not.
4. **Weight and presence.** Generous vertical rhythm, large editorial type, roomy margins. The site should feel like a well-designed print annual report, not a dashboard.
5. **Honest photography.** No stock. No fake installations. Every photo shown is real AD-JEET work, shot or reshot with a consistent treatment (§7.6).

### 7.2 Colour palette

All values in OKLCH for accuracy; hex provided as fallback.

**Neutrals (primary surface language):**

- `paper` — `#F7F3EC` (warm off-white, primary background, day mode)
- `paper-elevated` — `#FBF8F3` (cards, elevated surfaces, day mode)
- `ink` — `#1A1916` (primary text, day mode)
- `ink-muted` — `#4A4741` (secondary text, captions)
- `ink-subtle` — `#8A857C` (tertiary text, meta)
- `rule` — `#E4DDD0` (hairline dividers, borders)

**Brand:**

- `adjeet-blue` — `#1E7FB8` (derived from existing logo; used sparingly as accent, links, brand moments — **not** as a primary surface colour)
- `adjeet-blue-deep` — `#134C70` (hover / pressed states on blue)

**Earth accents (used for category, data viz, service tagging):**

- `ochre` — `#C9962E` (pairs with the logo's yellow swoosh; used as a signature accent, one moment per screen maximum)
- `clay` — `#A6503A`
- `sage` — `#6B7C5A`
- `slate` — `#455362`

**Signal:**

- `success` — `#3F7A4E`
- `warning` — `#B8862A`
- `error` — `#A63D3D`

**Dark mode (night-paper language):**

- `paper-dark` — `#13120F` (primary background)
- `paper-dark-elevated` — `#1E1C18`
- `ink-dark` — `#F0EBDE`
- `ink-dark-muted` — `#BAB3A2`
- `rule-dark` — `#2B2823`
- `adjeet-blue-dark` — `#4FA8E0` (brighter for contrast on dark)

All combinations must pass WCAG 2.2 AA contrast (4.5:1 body, 3:1 large text). Contrast matrix to be verified with `@adobe/leonardo-contrast-colors` and committed as `design/contrast-report.json`.

### 7.3 Typography

**Display / Editorial — Fraunces (variable font, free, Google Fonts).**
Chosen for: organic curves, subtle soft/hard axis (for kinetic expression), strong editorial voice, excellent at both large display and small sizes. Opsz axis enables proper optical sizing from 9pt to 144pt.

**Body / UI — Inter (variable, free).**
Chosen for: exceptional screen legibility at small sizes, broad language support, variable weight for subtle hierarchy. Safer than trying to be clever on the body font when readers are on rough displays.

**Mono — JetBrains Mono (for case-study technical specs, measurements, structured data).**

**Bengali / Hindi fallback — Noto Serif Bengali + Noto Sans Devanagari.** Loaded on-demand when locale is switched post-v1.

**Type scale (mobile-first, fluid via `clamp()`):**

```
display-xl     clamp(3.5rem, 8vw, 7.5rem)    Fraunces, weight 350, opsz 144
display-lg     clamp(2.5rem, 6vw, 5rem)      Fraunces, weight 400, opsz 96
display-md     clamp(2rem, 4.5vw, 3.5rem)    Fraunces, weight 400, opsz 72
h1             clamp(1.75rem, 3.5vw, 2.5rem) Fraunces, weight 500, opsz 48
h2             clamp(1.5rem, 2.5vw, 2rem)    Fraunces, weight 500, opsz 36
h3             1.25rem                        Inter, weight 600
eyebrow        0.75rem                        Inter, weight 600, tracking 0.12em, uppercase
body-lg        1.125rem                       Inter, weight 400, leading 1.65
body           1rem                           Inter, weight 400, leading 1.7
body-sm        0.875rem                       Inter, weight 400, leading 1.6
caption        0.75rem                        Inter, weight 500, leading 1.5
```

**Editorial treatment.** Display headlines break in intentional places using `<br>` at named breakpoints, not whatever the browser decides. Line length capped at 65ch for long-form body copy. Hanging punctuation enabled (`hanging-punctuation: first last`). Optical margin alignment for serif display.

### 7.4 Spacing, grid, and layout

- **Base unit:** 4px. All spacing on a 4/8/12/16/24/32/48/64/96/128 scale.
- **Max content width:** 1280px. Full-bleed allowed for hero, imagery, and motion set-pieces.
- **Column system:** 12-col desktop, 8-col tablet, 4-col mobile. CSS Grid, not a framework's column helpers.
- **Vertical rhythm:** sections use `--section-pad` (clamp(4rem, 10vh, 8rem) top/bottom). Hero uses 100vh on desktop, 85vh on mobile (leaves room for thumb-zone CTA).
- **Radius scale:** 4 / 8 / 12 / 24 / 999 (pill). Cards default to 12, buttons to 8, pills (tags, filters) to 999.

### 7.5 Elevation

Two elevation levels only. Organic Minimalism does not have a 7-level shadow ramp.

```
elev-1   shadow: 0 1px 2px rgba(26, 25, 22, 0.04), 0 2px 6px rgba(26, 25, 22, 0.03)
elev-2   shadow: 0 4px 8px rgba(26, 25, 22, 0.06), 0 12px 24px rgba(26, 25, 22, 0.05)
```

No glassmorphism, no inner shadows, no glows. Depth comes from typography hierarchy, spacing, and colour temperature — not stacked blur.

### 7.6 Imagery direction

- **Aspect ratios used across the site:** 3:2 (hero-style), 1:1 (card grid), 16:9 (case study masthead). Never `object-fit: contain` on photography — always cover, with intentional crop.
- **Grading:** all photography passed through a subtle warm grade (+5 temperature, +3 tint, slight lift in shadows) to unify inconsistent source material (your father's phone library).
- **Grain:** very subtle film grain (`noise(0.015)` CSS filter or a static PNG noise layer at 4% opacity) on all hero imagery. Makes even phone-grade photos feel intentional.
- **Never:** stock photography, AI-generated imagery posing as real work, photos without EXIF geo-tags (required for local SEO — §10.4).

### 7.7 Iconography

Lucide Icons as the base set (outline, 1.5px stroke). Custom icons for the 8 service categories commissioned as a small set — 24×24 and 48×48 SVG, single-weight line with one accent dot in ochre. Consistent visual grammar, feels hand-drawn rather than geometric. ~2–3 days of design work, one-time.

---

## 8. Motion design

### 8.1 Motion principles

1. **Slow is premium.** Entry animations run 600–1,200ms with custom cubic-bezier easings, not snappy 200ms SaaS defaults.
2. **Direction is intentional.** All motion has a meaningful vector: content arrives from the direction it logically should, never floats in from random.
3. **Respect the system.** `prefers-reduced-motion: reduce` kills all non-essential motion. Kinetic type flattens to static, Spline scene becomes a static image, scroll-triggered reveals become instant.
4. **Respect the network.** Heuristic fallback: if `navigator.connection.effectiveType === 'slow-4g' || '3g' || '2g'`, or `saveData === true`, swap Spline scene for a static render and disable ambient motion.

### 8.2 Easing curves (committed as CSS custom properties)

```css
--ease-organic:      cubic-bezier(0.22, 1, 0.36, 1);     /* default entries */
--ease-organic-out:  cubic-bezier(0.16, 1, 0.3, 1);      /* decelerate */
--ease-organic-in:   cubic-bezier(0.64, 0, 0.78, 0);     /* accelerate */
--ease-organic-io:   cubic-bezier(0.87, 0, 0.13, 1);     /* emphasis */
```

No `linear`, no `ease-in-out`. These feel mechanical.

### 8.3 Kinetic typography

**On scroll:**
- Hero display headline reveals **line-by-line**, each line with a masked reveal (clip-path inset from bottom), staggered 80ms. GSAP + SplitText.
- Section eyebrow text reveals with a **letter-stagger** when entering viewport (Fraunces opsz variable axis animates from 9 → 72 over 600ms, creating a "zoom-in" feel that's typographic, not transform-based).
- Long-form body copy fades in line-by-line with a 30px `translateY` offset, 40ms stagger.

**On cursor (desktop only):**
- Display headlines on Home hero and About hero have a subtle **weight-shift on proximity**: as the cursor approaches a glyph, its variable weight axis pushes from 400 → 550 within a 100px radius. Feels tactile, not gimmicky. Disabled on touch devices (detected via `(hover: none)`).

**On hover:**
- Case study titles get a **slant axis shift** (Fraunces slnt: 0 → -4) on hover. Subtle, organic, says "this is interactive" without underlines.

### 8.4 Scroll-triggered animations

Orchestrated with **GSAP ScrollTrigger** (licensed via Club GSAP — free tier is fine for this use). Not Framer Motion for scroll — Framer Motion's scroll helpers don't match GSAP's orchestration quality for this kind of work.

- Services grid: cards enter staggered, 100ms between each, translateY(40px) → 0, opacity 0 → 1.
- Portfolio teaser: images use **parallax within their frame** (not full-page parallax — that's old). Image moves 15% slower than scroll, creating depth without seasickness.
- Stats / 35-year proof block: numbers count up from 0 to target when entering viewport. 1.2s duration, organic easing.
- Coverage map teaser: SVG topology lines draw in sequence when section enters view. `stroke-dashoffset` animation, 1.5s total, staggered start per ridge line.

### 8.5 3D set-piece — the topographic coverage map

**The single 3D moment on the site.** It earns its place because it visualises the core differentiator: AD-JEET knows the terrain.

- Tool: **Spline** (free tier; Pro at $9/mo if needed for export control).
- Scene: stylised 3D relief map of North Bengal, Sikkim, and adjacent border region. Not photorealistic — abstracted, in the site palette (paper + ochre elevation shading + slate water). Major cities marked with small ochre pins.
- Behaviour: slow ambient rotation on autopilot (0.5 RPM). On cursor (desktop), pins respond to proximity with a soft pulse. On scroll into view on mobile, one-shot camera fly-in (2s), then static.
- Export: Spline → `.splinecode` via `@splinetool/react-spline`. Lazy-loaded, Intersection Observer–triggered. Budget: ≤ 1.5MB total.
- Fallback: pre-rendered PNG hero at 2x, served via `<img>` with `srcset` when user has reduced motion, slow connection, or no WebGL.

Build effort: 3–5 days of Spline work. Can be commissioned or done by Rupam directly if comfortable with Spline.

### 8.6 Micro-interactions

- **Buttons:** subtle scale (1 → 0.98) on press, 150ms. No transforms on hover — just a rule fill-in animation from left to right on outlined buttons.
- **Form fields:** floating label pattern with gentle translate + scale on focus. Inline validation is passive (shows on blur, not on keystroke).
- **Filters on portfolio page:** tag selection triggers a brief layout reflow with FLIP animation (GSAP Flip plugin). Items reposition with spring easing, 400ms.
- **WhatsApp floating button:** present on every page after hero scrolls out. Enters with a gentle rise on scroll past hero, never bounces or pulses — that's tacky.

### 8.7 Lottie use

Used sparingly. Candidates: empty states, loading indicators, a small animated mark in the 404 page, animated service icons on hover for service cards (tiny, < 30kb each). Total Lottie asset budget: ≤ 150kb across the site.

---

## 9. Dynamic theming

- **Three theme states:** `light`, `dark`, `system` (default).
- **Trigger:** `prefers-color-scheme` media query; user-facing toggle in the header with a three-state segmented control.
- **Persistence:** theme choice stored in `localStorage` under `adjeet-theme`, hydrated on first paint to avoid flash.
- **Implementation:** CSS custom properties on `:root[data-theme]`, zero runtime JS cost beyond the initial hydration check.
- **Scope of dark mode:** full coverage including the Spline scene (palette variant exported for dark mode) and all photography (photos get a `brightness(0.92) contrast(1.05)` filter in dark mode — prevents retina-searing brightness on hero images at night).

**Variable palette roadmap (post v1):** a seasonal palette rotation — e.g., a warmer ochre-forward palette during Durga Puja season (Oct), a cooler slate palette in monsoon (Jul–Aug). Architected into v1 as CSS variable sets, toggled by date heuristic. Silent, subtle, one more reason for the site to feel local.

---

## 10. Technical architecture

### 10.1 Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15+** (App Router) | RSC, streaming, Partial Prerendering, best-in-class for motion-heavy + content-heavy hybrid |
| Runtime | Node 20 LTS | Vercel default |
| Styling | **Tailwind CSS 4** (Oxide engine) | Fastest build, CSS variable integration, tight file size |
| Type system | TypeScript 5.5+ strict | Not optional |
| Motion | **GSAP 3.12+** (ScrollTrigger, SplitText, Flip) + **Framer Motion 11** for component-level interactions | GSAP for orchestration, Framer Motion for hover / press |
| 3D | **@splinetool/react-spline** | Single scene, lazy-loaded |
| Content | **MDX** via `@next/mdx` with contentlayer-equivalent (use `velite` or `content-collections` — actively maintained) | Content lives in the repo; no CMS overhead for v1 |
| Forms | `react-hook-form` + `zod` validation | Standard, low-ceremony |
| Form backend | Vercel serverless function → Resend (transactional email) + webhook to a Google Sheet + WhatsApp notification via Twilio or Gupshup | Dual-delivery so leads never get lost |
| i18n | `next-intl` | Scaffolded, en-only at launch |
| Analytics | GA4 + GTM, consent-gated | Plus Vercel Analytics for CrUX field data |
| Monitoring | Sentry (free tier) + Vercel Speed Insights | Error + perf monitoring |
| Image pipeline | `next/image` with AVIF + WebP | Auto-responsive, lazy |
| Hosting | **Vercel** (Pro tier likely needed for bandwidth and ISR at scale) | CDN, edge, image optimisation, zero-config |
| Domain & DNS | Already registered (adjeet.in); DNS on Vercel or Cloudflare | Cloudflare if you want additional edge control |

### 10.2 Folder structure

```
adjeet-site/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                    Home
│   │   ├── services/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── portfolio/
│   │   ├── about/
│   │   └── contact/
│   ├── (programmatic)/
│   │   └── [service]-in-[city]/page.tsx
│   ├── api/
│   │   └── lead/route.ts               Lead submission handler
│   ├── sitemap.ts
│   ├── robots.ts
│   └── layout.tsx
├── components/
│   ├── motion/                         GSAP wrappers, reduced-motion helpers
│   ├── ui/                             Design system primitives
│   ├── sections/                       Reusable section blocks
│   └── three/                          Spline wrapper + fallback
├── content/
│   ├── services/                       MDX files per service
│   ├── portfolio/                      MDX case studies
│   ├── coverage/                       MDX per district
│   └── programmatic/                   Auto-generated matrix content
├── design/
│   ├── tokens.css                      Colour, type, spacing variables
│   ├── contrast-report.json
│   └── spline/                         .splinecode assets
├── lib/
│   ├── seo/                            Metadata, schema.org builders
│   ├── analytics/                      GA4 event helpers
│   └── whatsapp/                       Deep-link utilities
├── public/
│   ├── fonts/                          Self-hosted Fraunces + Inter subsets
│   ├── images/                         Optimised originals
│   └── og/                             OG image templates
├── scripts/
│   ├── generate-programmatic.ts        Service × city page generator
│   └── sitemap.ts
├── tests/
│   ├── e2e/                            Playwright
│   └── lighthouse/                     LHCI config
├── .env.example
├── velite.config.ts                    Content schema
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

### 10.3 Content model (MDX)

**Case study frontmatter schema (Zod-validated):**

```ts
{
  title: string,
  slug: string,
  service: enum(serviceTypes),   // glow_sign | acp_led | flex | ...
  city: enum(citiesCovered),
  region: enum(regions),
  year: number,
  clientCategory: enum(clientCategories),  // telecom | fmcg | building_materials | ...
  clientName?: string,            // optional, only used when permission confirmed
  featured: boolean,
  heroImage: string,
  gallery: string[],
  summary: string,                // 1–2 sentences
  challenge: string,              // MDX body
  execution: string,
  outcome: string,
  duration?: string,              // "7 days installation"
  scale?: string,                 // "12 units across 4 cities"
}
```

### 10.4 SEO, schema, and local optimisation

- **Every page** gets a Zod-validated metadata block: title (≤ 60 char), description (≤ 160 char), canonical, OG image (1200×630, generated with `@vercel/og`).
- **Schema.org** JSON-LD, hand-written in a type-safe builder (not a plugin):
  - `LocalBusiness` on all pages (with `branch` nodes for Platinum Square and Patiram Jote).
  - `Service` on each service detail page.
  - `BreadcrumbList` on all pages except home.
  - `FAQPage` on service detail pages with FAQs.
  - `ImageObject` on case studies with geotags preserved from EXIF.
- **EXIF geo-tagging:** all portfolio images must carry GPS EXIF data. Build script verifies on CI and warns if missing.
- **`sitemap.xml`** auto-generated, split into index + sub-sitemaps for: pages, services, coverage, portfolio, programmatic.
- **`robots.txt`** explicit — allow everything except `/api/`, include sitemap URL.
- **`llms.txt`** at root (emerging standard) — a concise text description of the business, services, and coverage for LLM-powered search surfaces. ~150 lines.
- **Internal linking discipline:** every service detail page links to its 5 city-programmatic pages; every coverage district page links to its 5 service-city programmatics; every case study links back to its service and city. Silo structure.
- **Page speed budget enforced in CI** (§11).

### 10.5 WhatsApp deep-link system

Central utility: `buildWhatsappLink({ phone: '919832011524', context, prefilledMessage })`.

Every CTA on the site uses context-aware prefill:
- From service detail page: `"Hi AD-JEET, I'm interested in {service} for my business in {city/locality}. Please share details."`
- From portfolio case study: `"Hi, I saw your {service} work for {clientCategory} in {city}. I'd like a similar installation."`
- From programmatic page: `"Hi, I need {service} in {city}. Please quote."`

Every click emits `whatsapp_click` GA4 event with context params (page, service, city) so we can measure what actually converts.

### 10.6 Lead form flow

`react-hook-form` + `zod`. Fields: name (required), phone (required, E.164 validation), city (autocomplete seeded with coverage districts), service interest (multi-select), timeline (single-select: `immediate | 1_month | 3_months | exploring`), free-text brief (optional), honeypot field (anti-spam).

Submission flow:
1. POST to `/api/lead`.
2. Validate server-side (Zod).
3. Insert row in a Google Sheet (via Google Sheets API + a service account) — the single source of truth for leads.
4. Send notification email via Resend to `info@adjeet.in` (forwarding to both gmails).
5. Send WhatsApp notification to Rupam's number via Gupshup or Twilio WhatsApp API.
6. Fire GA4 `lead_submit` event with non-PII params.
7. Respond with success → trigger success UI state (no page navigation).

Rate limiting: 5 submissions / IP / hour via Vercel KV or Upstash Redis.

---

## 11. Performance budgets

### 11.1 Core Web Vitals targets (p75, mobile, India)

| Metric | Target | Hard ceiling |
|---|---|---|
| LCP | < 2.0 s | 2.5 s |
| CLS | < 0.1 | 0.15 |
| INP | < 200 ms | 300 ms |
| FCP | < 1.5 s | 2.0 s |
| TTFB | < 600 ms | 800 ms |

### 11.2 Asset budgets (per page)

| Asset | Budget |
|---|---|
| HTML (gzipped) | < 20 kb |
| CSS (gzipped) | < 30 kb total |
| JS (gzipped, initial) | < 120 kb |
| JS (total including lazy) | < 350 kb |
| Fonts (subset, woff2) | < 60 kb total |
| LCP image | < 150 kb (AVIF) |
| Spline scene | < 1.5 MB (lazy, not counted in LCP path) |
| Lottie per asset | < 30 kb |

### 11.3 Enforcement

- **Lighthouse CI** in the deployment pipeline. Thresholds fail the build.
- **Bundle size check** via `@next/bundle-analyzer` + a `size-limit` gate in CI.
- **Image optimisation** enforced — lint rule rejects raw `<img>` imports of source originals > 200 kb.
- **Font loading:** self-hosted, `font-display: swap`, preloaded subsets for latin. Non-latin loaded on demand.
- **JS execution:** RSC by default; islands of interactivity marked explicitly with `'use client'`. GSAP loaded only on pages that need it via dynamic import. Spline loaded only on `/` and `/coverage`.

### 11.4 Accessibility — WCAG 2.2 AA

**In scope for v1:**
- All interactive elements keyboard-operable with visible focus rings (custom, high-contrast, respects theme).
- Focus order matches visual order. Focus trap in modal / off-canvas components.
- All images have meaningful `alt` text; decorative images get `alt=""`.
- Form fields have labels, not just placeholders. Error messages associated via `aria-describedby`.
- Colour contrast verified (see §7.2) — 4.5:1 body, 3:1 large text, 3:1 non-text UI elements.
- Screen-reader testing against NVDA (Windows), VoiceOver (iOS, macOS), TalkBack (Android).
- `prefers-reduced-motion` support across all motion (§8.1).
- Skip-to-content link.
- Proper heading hierarchy (single H1 per page, no skipped levels).
- Language attribute (`<html lang="en">`) and `lang` on non-English content fragments.
- Target size minimum 24×24 CSS px (2.5.8 in WCAG 2.2).
- Consistent help / navigation placement (3.2.6).

**Voice navigation — explicitly out of scope for v1.** WCAG 2.2 AA does not require it. The three new 2.2 SCs (target size, focus appearance, consistent help, accessible authentication, drag alternatives, redundant entry) are all covered above. If voice-nav becomes a concrete user need from GBP analytics (e.g., a meaningful share of hands-free buyer behaviour), add it in v1.5.

**Audit:** full axe-core scan in CI + manual audit with a checklist before launch. Third-party audit optional (₹30–60k through an Indian accessibility firm) — recommended if you want a certificate for procurement.

---

## 12. Analytics and measurement

### 12.1 Event model (GA4)

Custom events, not Enhanced Measurement alone.

| Event | Params |
|---|---|
| `page_view` | page_type (home \| service \| case_study \| coverage \| programmatic \| about \| contact) |
| `whatsapp_click` | source_page, source_service, source_city, source_section |
| `lead_submit` | source_page, service, city, timeline |
| `portfolio_filter` | filter_type, filter_value |
| `case_study_view` | case_study_slug, service, city |
| `service_page_view` | service |
| `city_page_view` | city |
| `programmatic_view` | service, city |
| `theme_toggle` | theme (light \| dark \| system) |
| `map_interact` | action (rotate \| pin_click \| zoom) |

### 12.2 Tooling

- **GA4** — primary analytics.
- **GTM** — one container for GA4 + any future tag.
- **Search Console** — mandatory, verified via DNS.
- **Vercel Analytics + Speed Insights** — real user CWV data.
- **Microsoft Clarity** (free) — heatmaps and session recordings. Privacy banner covers this.
- **Lighthouse CI** — synthetic performance regression.

### 12.3 Consent and privacy

- Consent banner (self-built, not a 500kb SaaS) — granular: necessary (default on), analytics, marketing. No tracking fires until consent.
- Privacy policy page linked from footer. Covers DPDP Act 2023 (India) and generic GDPR-alignment for any international traffic.
- Google Sheet (lead storage) access restricted to Rupam and father's gmails.

---

## 13. Content requirements (from Rupam / father)

This is the blocker, historically. Locked ask:

| Asset | Quantity needed | Owner | Deadline |
|---|---|---|---|
| Past installation photos, sorted by service | ≥ 60 (min. 5 per service category) | Rupam + father | Week 1 of build |
| Workshop exterior photo (Patiram Jote, AD-JEET sign visible) | 1 hero + 3 supporting | Rupam | Week 1 |
| Office exterior (Platinum Square) | 2 | Rupam | Week 1 |
| Team / in-action photos | 4–6 | Rupam | Week 2 |
| Case study narratives (problem / execution / outcome) | 20 minimum | Rupam (father dictates, Rupam writes) | Week 2–3 |
| Client list with written permission status per brand | 1 tracker (Google Sheet) | Rupam | Week 1 |
| Testimonial quotes (real, attributed if permitted) | 4–6 | Rupam | Week 2 |
| Service descriptions — what materials / sizes / finishes per service | 1 doc per service (8 docs) | Rupam + father | Week 2 |

Copy drafting: Claude assists in drafts, Rupam finalises, father sanity-checks Bengali-market appropriateness.

---

## 14. Timeline — 5-week build plan

Single build track, assuming Rupam is the developer.

### Week 1 — Foundation

- Repo init, Next.js 15 + Tailwind 4 + TS strict.
- Design tokens (colour, type, spacing) codified as CSS vars.
- Typography loaded, verified across weights.
- Theme system (light/dark/system) wired end-to-end.
- Primitive UI components: Button, Link, Input, Select, Card, Tag, Badge.
- Header + footer built. Navigation keyboard-accessible.
- Content schema (Velite / content-collections) configured.
- Analytics + GTM installed, consent banner shipped.
- Photo collection kickoff with father (runs all week in the background).

### Week 2 — Core sections and services

- Home hero (without 3D scene — static fallback first).
- Services overview page.
- Service detail template + 2–3 services fully built with real copy.
- Case study template.
- Portfolio index with filtering logic (non-animated).
- GSAP base motion layer integrated.

### Week 3 — Portfolio, coverage, programmatic matrix

- Remaining 5–6 service pages completed.
- Portfolio populated with 20 case studies (MDX authored).
- Coverage landing + 5 district child pages.
- Programmatic matrix: 25 service × city pages generated.
- All internal linking populated.
- SEO metadata + schema on all pages.
- Sitemap + robots + `llms.txt` published.

### Week 4 — Motion layer and the 3D set-piece

- Kinetic typography implementations.
- Scroll orchestration across all sections.
- Micro-interactions.
- Spline scene built (or commissioned; if outsourced, kick off Week 2).
- Fallbacks: reduced motion, slow connection, no WebGL.
- Lead form backend wired (Vercel function + Google Sheet + Resend + WhatsApp notify).

### Week 5 — Hardening, accessibility, launch

- Full a11y pass (keyboard, screen reader, contrast, reduced motion, focus).
- Performance tuning. Lighthouse CI green across all page types.
- Content QA: proofread every page, verify EXIF geotags on images.
- Cross-browser + device testing: Chrome, Safari (desktop + iOS), Firefox, Samsung Internet, UC Browser (yes — real share in North Bengal).
- GBP link updated to `https://adjeet.in`.
- Search Console + sitemap submission.
- Launch. Monitor for 72 hours.

**Buffer week (Week 6)** built in for slippage on content (the most likely blocker) or Spline scene refinement.

---

## 15. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Client logo permissions not secured | High | Medium | Default to category silhouettes. Logos added post-launch as permissions arrive. |
| Photo collection delays (father's library disorganised) | High | High | Week 1 photo session is Week-1 priority #1. Backup: shoot fresh material at active installations. |
| Spline scene takes longer than budgeted | Medium | Low | Site ships with static fallback map first; 3D scene layers in as v1.1 if not ready. |
| 4G performance worse than targets in Siliguri | Medium | Medium | Real-device testing on Jio 4G in Week 5. Reduce motion aggressively if needed. |
| CMS decision wrong (father wants to edit directly) | Low | Medium | MDX is easily upgraded to Sanity in a future sprint. Not a one-way door. |
| GBP confusion if site launches before Patiram Jote vs. Platinum Square address issue is finalised | Medium | High | Coordinate with GBP workstream. Don't launch /contact until addresses are locked. |
| Motion system makes site feel too "design-forward" for older Bengali clients | Low | Low | Reduced-motion path is exactly the minimal, clean fallback they'd prefer anyway. |

---

## 16. Open questions (to resolve before kickoff)

1. Client logo permissions — does Rupam have written approval from any brands already? If yes, which.
2. Spline scene: Rupam builds it himself, or commission? If commission, who.
3. Separation of Platinum Square vs. Patiram Jote on the /contact page — same phone, or different phones per location? (Memory notes different numbers; brief says single number. Reconcile.)
4. CMS upgrade trigger — what frequency of content edits by father would trigger the Sanity upgrade? (Set a threshold: e.g., > 4 edits/month.)
5. Blog decision — confirmed out of v1, but when does it enter the roadmap? Month 2, Month 4, or driven by SEO-keyword gaps found in month 1 Search Console data?
6. Launch event — do we want a soft launch with a small WhatsApp campaign to existing clients, or a quiet launch and let GBP drive discovery?

---

## 17. Appendix — URL taxonomy (launch set, 45 pages)

```
Pages (11):
/
/services
/services/glow-sign-boards
/services/acp-led-signage
/services/flex-printing
/services/vehicle-branding
/services/wall-painting
/services/f-pole-installation
/services/in-shop-branding
/services/events-and-puja
/portfolio
/coverage
/about
/contact

Case studies (20, slugs driven by content)

Coverage districts (9):
/coverage/siliguri
/coverage/jalpaiguri
/coverage/darjeeling
/coverage/kalimpong
/coverage/cooch-behar
/coverage/alipurduar
/coverage/malda
/coverage/uttar-dinajpur
/coverage/gangtok

Programmatic service × city (25):
/glow-sign-board-in-siliguri
/glow-sign-board-in-jalpaiguri
/glow-sign-board-in-cooch-behar
/glow-sign-board-in-darjeeling
/glow-sign-board-in-malda
/acp-led-signage-in-siliguri
/acp-led-signage-in-jalpaiguri
/acp-led-signage-in-cooch-behar
/acp-led-signage-in-darjeeling
/acp-led-signage-in-malda
/flex-printing-in-siliguri
/flex-printing-in-jalpaiguri
/flex-printing-in-cooch-behar
/flex-printing-in-darjeeling
/flex-printing-in-malda
/vehicle-branding-in-siliguri
/vehicle-branding-in-jalpaiguri
/vehicle-branding-in-cooch-behar
/vehicle-branding-in-darjeeling
/vehicle-branding-in-malda
/f-pole-installation-in-siliguri
/f-pole-installation-in-jalpaiguri
/f-pole-installation-in-cooch-behar
/f-pole-installation-in-darjeeling
/f-pole-installation-in-malda
```

---

*End of PRD v1.0 (Draft). Ship this to a shared Notion or keep as MDX in `docs/PRD.md` in the repo. Any edit of substance gets a version bump and a date stamp.*

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | issues_found (DONE) | 6 cherry-picks, 2 accepted, 5 implementation tasks, 3 owner actions |
| Codex Review | `/codex review` | Independent 2nd opinion | 1 | issues_found | Outside voice (Claude subagent) |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 2 | issues_found (DONE) | 10 decisions, 5 launch blockers, 4 security fixes, 1 scope change |
| Design Review | `/plan-design-review` | UI/UX gaps | 3 | issues_open (PLAN) | score: 6/10 → 8/10, 5 decisions made, 3 deferred |
| DX Review | `/plan-devex-review` | Developer experience gaps | 1 | issues_found (DONE) | score: 3/10 → 8/10, TTHW: 9min → <60sec, 11 decisions, 13 implementation tasks |

**DESIGN DECISIONS LOCKED 2026-05-11:**
- `adjeet-blue` updated to midnight navy `#0A1628` (near-black, blue warmth) — user found #1565C0 too corporate
- Two-zone font system locked: Hero dark zone = Khand + Anek Latin; rest of site = Fraunces + Inter
- Primary accent = ochre `#C9962E`; blue = secondary UI only (links, active states)
- Services grid = editorial list format (Fraunces numbered rows, not card grid)
- Portfolio cards show city label (`city · service · year`) on the grid card
- Programmatic pages: full 12-point `ServiceCityLayout` spec added (above-fold WhatsApp CTA required)
- Interaction state tables added for all interactive features
- Buyer journey storyboards added for all 3 archetypes (Raj, Sanjay, event organiser)
- Responsive breakpoint specs added (360/390/768/1024/1280/1920px)
- Touch target minimum: 44px for all interactive elements

**UNRESOLVED (owner action required):**
- Hero headline copy — Rupam to write; must contain specific North Bengal terrain reference
- Father's photo/name on About page — Rupam to confirm with father
- Contact page primary phone — §16.3 still open; must resolve before /contact ships

**VERDICT:** Eng Review stale (18 commits behind HEAD 70799f6). Re-run `/plan-eng-review` before implementation of any new feature.

---

## ENG REVIEW REPORT — 2026-05-11 (HEAD main)

**Reviewer:** `/plan-eng-review` v2 — all 4 sections complete  
**Branch:** main | **Commit at review:** post-design-review HEAD

### Section 1 — Architecture (6 decisions)

| # | Location | Finding | Severity | Decision |
|---|----------|---------|----------|----------|
| D1 | `app/api/lead/route.ts:15` | In-memory `rateStore = new Map<>()` resets on every Vercel cold start — rate limiting never enforces | **Launch blocker** | Replace with Upstash Redis |
| D2 | `app/api/lead/route.ts:7-11` | `ALLOWED_ORIGINS` missing `adjeet.in` and `www.adjeet.in` — all production form submissions return 403 | **Launch blocker** | Add adjeet.in + www.adjeet.in immediately |
| D3 | `app/api/lead/route.ts:124` | `from: 'onboarding@resend.dev'` — Resend sandbox domain, rejected or flagged spam in production | **Deliverability risk** | Deferred — verify adjeet.in domain in Resend before go-live |
| D4 | `app/api/lead/route.ts` | WhatsApp notification (PRD §10.6 step 5) completely absent from lead flow | **PRD gap** | Implement via Twilio WhatsApp API |
| D5 | `components/Chatbot.tsx`, `app/api/chatbot/` | AI chatbot not in PRD scope; PRD lists it as non-goal; competes with WhatsApp CTA | **Scope change** | Keep — user decision overrides PRD non-goal |
| D6 | `package.json` | GSAP and `@splinetool/react-spline` not installed despite being PRD §8 requirements | **Feature blocker** | Install both: `npm i gsap @splinetool/react-spline` |

**Architecture notes:**
- Chatbot scope change (D5): `openai` package costs ~$0.002/1K tokens; monitor spend after launch
- GSAP SplitText and Flip plugins require GSAP Club licence (~$150/yr) for commercial use; ScrollTrigger is free

### Section 2 — Code Quality (3 decisions)

| # | Location | Finding | Severity | Decision |
|---|----------|---------|----------|----------|
| D7 | `app/api/chatbot/route.ts` | No CORS origin check (any site can generate OpenAI costs) + same broken in-memory rate limiter as D1 | **Security / billing** | Add ALLOWED_ORIGINS check + Upstash rate limiting (reuse D1 client) |
| D8 | `components/sections/` | 4 dead Hero variants (`Hero.backup.tsx`, `Hero.brutalist.tsx`, `Hero.workshop.tsx`, `Hero.proof.tsx`) committed alongside active `Hero.tsx` | **Code hygiene** | Delete all four — git history preserves them |
| — | `components/sections/LeadForm.tsx:53` | `rounded-full` on success-state icon circle — violates locked editorial corner-radius rule (design review) | **Design integrity** | Fix to `rounded-lg` or square |

**Token drift (not decisioned — fix in implementation pass):**
- `design/tokens.css:9` — `--adjeet-blue: #1565C0` must be updated to `#0A1628` (midnight navy, locked 2026-05-11)
- `design/tokens.css:2` — `--paper: #FFFFFF` (pure white). PRD Organic Minimalist palette specifies warm `#F7F3EC`. Verify which is intentional before shipping
- `design/tokens.css:4` — `--ink: #020617` (Tailwind slate-950, cold). PRD specifies warm `#1A1916`. Verify before shipping
- `app/fonts.ts` — Khand and Anek Latin fonts not registered. Hero dark zone requires both (two-zone font system locked in design review). Add via `next/font/google`
- `app/layout.tsx:8-9` — `<Chatbot />` rendered in root layout; loads on every page including service, portfolio, and contact pages. Consider lazy-loading or rendering only on pages that need it

### Section 3 — Test Coverage (1 decision)

| # | Finding | Severity | Decision |
|---|---------|----------|----------|
| D9 | Lead form has zero test coverage — no Playwright test for form fill, validation, or success state | **High** | Add `tests/e2e/lead-form.spec.ts` with API stub |

**Coverage map at review:**
```
tests/unit/smoke.test.ts         — Vitest setup only (not real unit tests)
tests/e2e/foundation.spec.ts     — Nav, skip link, consent banner, footer ✓
tests/e2e/home.spec.ts           — Hero, services grid, proof block, gallery ✓
tests/e2e/services.spec.ts       — /services overview + /services/glow-sign-boards detail ✓

NOT COVERED:
  /api/lead                      — zero API tests (3 bugs found in review)
  /api/chatbot                   — zero tests
  LeadForm submission flow       — zero coverage on primary KPI
  Programmatic service×city pages (25 pages) — zero coverage
  /portfolio, /about, /contact, /coverage/* — zero coverage
  Mobile viewport assertions     — none
  SEO/meta tag assertions        — none
```

### Section 4 — Performance / SEO (1 decision)

| # | Location | Finding | Severity | Decision |
|---|----------|---------|----------|----------|
| D10 | `app/layout.tsx:15` | `metadataBase: new URL('https://adjeet.vercel.app')` — wrong domain; canonical links, og:image, Twitter card images all resolve to Vercel staging URL | **SEO blocker** | Change to `https://adjeet.in` |

**Additional performance notes (no decision needed — implement during build pass):**
- `next.config.ts` has no `images.domains` or `images.remotePatterns` config — external image domains used in gallery or portfolio will 500 in production; add any CDN/S3 origins before launch
- Khand + Anek Latin not loaded via `next/font` — these will either render as fallbacks (FOUT) or block render if loaded via CSS @import; load via `next/font/google` with `display: 'swap'`
- `<Chatbot />` loads on every page via root layout — consider `dynamic(() => import('./Chatbot'), { ssr: false })` to keep it off the initial bundle

### Implementation Action List (ordered by priority)

**Must fix before launch:**
1. Add `adjeet.in` and `www.adjeet.in` to `ALLOWED_ORIGINS` in `app/api/lead/route.ts` (D2)
2. Replace in-memory rate limiter with Upstash Redis in `app/api/lead/route.ts` (D1)
3. Change `metadataBase` to `https://adjeet.in` in `app/layout.tsx` (D10)
4. Add CORS + Upstash rate limiting to `app/api/chatbot/route.ts` (D7)
5. Update `--adjeet-blue` to `#0A1628` in `design/tokens.css` (token drift)
6. Add Khand + Anek Latin to `app/fonts.ts` via `next/font/google` (hero font gap)

**Feature implementation (before feature-complete):**
7. Implement WhatsApp notification via Twilio in lead flow (D4)
8. Install `gsap` and `@splinetool/react-spline` (D6)

**Code quality (clean before review):**
9. Delete `Hero.backup.tsx`, `Hero.brutalist.tsx`, `Hero.workshop.tsx`, `Hero.proof.tsx` (D8)
10. Fix `rounded-full` → `rounded-lg` on LeadForm success-state icon (design integrity)
11. Write `tests/e2e/lead-form.spec.ts` with Playwright route mock (D9)

**Owner action required (cannot be automated):**
12. Verify adjeet.in domain in Resend dashboard (add SPF/DKIM TXT records) before go-live (D3 deferred)
13. Approve GSAP Club licence for commercial use of SplitText + Flip plugins (D6)
14. Create Twilio account + WhatsApp Business sender approval for WhatsApp notifications (D4)

**VERDICT:** 5 launch blockers found and resolved (D1, D2, D4, D7, D10). 1 PRD scope change (chatbot kept — D5). Codebase is not launch-ready until action items 1–6 are implemented. Re-run `/plan-eng-review` after implementation pass.

---

## CEO REVIEW REPORT — 2026-05-16 (HEAD main)

**Reviewer:** `/plan-ceo-review` — Selective Expansion mode  
**Branch:** main | **Cherry-picks surfaced:** 6 | **Accepted:** 2 | **Declined/deferred:** 4

### Cherry-pick Decisions

| # | Topic | Decision |
|---|-------|----------|
| 1 | Logo permissions (Airtel, SRMB, etc.) | Keep as-is, accept legal risk — confirm post-launch |
| 2 | Case studies (PRD requires 20–30, current: 0) | Launch empty, add within 60 days |
| 3 | Pricing transparency ("starts from ₹X") | Zero pricing — full consultative model |
| 4 | Testimonials / Google Reviews | Launch with placeholder, collect real ones later |
| 5 | `next-intl` i18n scaffold (missing from package.json) | **Add scaffold in v1.0** |
| 6 | `LocalBusiness` JSON-LD schema | **Add in v1.0** |

### §1 — Business Model Alignment

Lead-gen funnel for B2B signage fabrication — correct for the market. Single conversion path (lead form + WhatsApp FAB). **Risk:** No fallback phone number visible if WhatsApp is offline. Add phone to footer.

### §2 — Revenue Path

Full consultative model (no pricing, no self-serve) is correct for v1. Hard growth ceiling: Rupam's response bandwidth. Flag for v2 roadmap at 100+ leads/month.

### §3 — Competitive Position

Differentiators (35 years, 15+ districts, own workshop) are not verifiable on the site. Client logos are the only trust signal. **v1.1 target:** "Since 1990" timeline element + service-area district map.

### §4 — Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Logo use without permission | Medium | High | Confirm permissions post-launch |
| Zero case studies at launch | Certain | Medium | 3 case studies within 60 days |
| Resend `onboarding@resend.dev` sender | High | Medium | Verify adjeet.in DNS before launch |
| Twilio WhatsApp approval pending | High | Low | Notification non-fatal; WhatsApp FAB still works |
| GSAP Club licence needed | High | Medium | Purchase before using SplitText/Flip |
| No phone number fallback | Medium | Medium | Add to footer — v1.0 task |

### §5 — GTM Readiness

**Ready:** Lead form + Upstash rate limiting, WhatsApp FAB, Consent banner, Analytics scaffold, OG/Twitter cards, Playwright E2E tests.

**Blockers before launch:**
1. `next-intl` scaffold (Cherry-pick #5)
2. `LocalBusiness` JSON-LD (Cherry-pick #6)
3. Verify `/public/og-image.jpg` exists (referenced in metadata, not confirmed present)
4. `app/robots.ts` + `app/sitemap.ts` (Next.js App Router built-ins, ~20 lines each)
5. Phone number in footer
6. Resend DNS verification (owner action)

### §6 — Implementation Action List

**Must ship in v1.0:**

1. **`next-intl` scaffold** — install `next-intl`, wrap app in `[locale]` routing (`en` default), move user-facing strings to `messages/en.json`. Bengali copy not needed yet — structure only.

2. **`LocalBusiness` JSON-LD** — add to `app/layout.tsx` `<head>`:
   - `@type: LocalBusiness`, `name: AD-JEET`, `foundingDate: 1990`
   - `addressLocality: Siliguri`, `addressRegion: West Bengal`, `addressCountry: IN`
   - `areaServed`: Siliguri, Darjeeling, Jalpaiguri, Cooch Behar, Alipurduar, Kalimpong
   - `telephone` (owner to supply), `url: https://adjeet.in`

3. **Phone number in footer** — visible fallback contact.

4. **Verify `/public/og-image.jpg` exists** — if missing, OG cards will render broken on all social shares. Create or commission a 1200×630px image.

5. **`app/robots.ts` + `app/sitemap.ts`** — required for Google indexing. ~20 lines each using Next.js App Router built-ins.

**Owner actions (not code):**
- Verify adjeet.in domain in Resend dashboard (SPF/DKIM) before go-live
- Create Twilio account + WhatsApp Business API approval
- Purchase GSAP Club licence before using SplitText/Flip
- Supply phone number for footer + LocalBusiness schema
- Confirm logo permissions with Airtel, SRMB, Gates, Ambuja post-launch

### §7 — Long-Term Trajectory

**v1.1 (60–90 days post-launch):** 3+ real case studies, Bengali strings in `messages/bn.json`, Sanity CMS, "Since 1990" timeline, service-area district map.

**v2 (6 months):** Quote calculator with rough price ranges, Google Reviews embed, workshop photo gallery.

**VERDICT:** 5 implementation tasks and 5 owner actions stand between the current codebase and a clean launch. The architecture is sound. The lead pipeline works. The two accepted cherry-picks (next-intl scaffold + LocalBusiness schema) are low-effort, high-value, and must be completed before first deploy. The consultative model is the right call for this market and operator.

---

## DX REVIEW REPORT — 2026-05-16 (HEAD main)

**Reviewer:** `/plan-devex-review` — DX EXPANSION mode | **Persona:** Rupam Das (sole maintainer)  
**TTHW before:** ~9 min | **TTHW after:** <60 sec | **Target tier:** Champion | **Score:** 3/10 → 8/10

### Decisions Made (D1–D11)

| # | Finding | Decision |
|---|---------|----------|
| D1 | Persona | Rupam Das, sole maintainer |
| D2 | Empathy | 9-min TTHW confirmed: silent MongoDB failure + no .env.example |
| D3 | TTHW target | Champion (<2 min / actually <60s with vercel env pull) |
| D4 | Mode | DX EXPANSION |
| D5 | Env validation | `@t3-oss/env-nextjs` with optional/required split (see D-CM1) |
| D6 | Local mock mode | Dev-mode fallbacks: missing vars → log to console, never crash |
| D7 | Log correlation | `nanoid(8)` request ID prefix in all API route log lines |
| D8 | AGENTS.md | Expand to ~1 page: project overview, service map, key files, common tasks |
| D9 | Node version | `"engines": {"node": ">=20.0.0"}` + `.nvmrc` + nvm shell hook note in README |
| D10 | CI | GitHub Actions: Node 20 + `npm ci` + `npm run build` + `npm run lint` + `npm test` |
| D11 | Dependabot | `.github/dependabot.yml` — weekly patch auto-updates, grouped |
| D-OV1 | Outside voice gap | `vercel env pull .env.local` as step 1 of README setup (cuts TTHW to <60s) |
| D-CM1 | Cross-model | D5+D6 conflict resolved: fallback vars are `optional()` in schema with loud runtime warnings |

### §1 — Implementation Checklist

**Developer experience (must ship before first deploy):**

1. **`.env.example`** — create at `adjeet-site/.env.example` with all 11 vars, inline comments explaining where to get each credential, and a note that `vercel env pull .env.local` is the fastest setup path.

2. **`adjeet-site/lib/env.ts`** — install `@t3-oss/env-nextjs`, create env schema:
   - **Required** (build fails without these): none — all have fallbacks or are optional in dev
   - **Optional** (warn at runtime if missing): `MONGODB_URI`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `OPENAI_API_KEY`, `TWILIO_*`, `RUPAM_WHATSAPP_NUMBER`
   - **Optional with test defaults**: `TURNSTILE_SECRET_KEY` (already has `1x000...AA` fallback)
   - **Required for Sheets** (warn but don't block): `GOOGLE_PRIVATE_KEY`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SHEET_ID`

3. **README Setup section** — add to `adjeet-site/README.md`:
   ```
   ## Setup
   Prerequisites: Node >=20, npm
   
   Step 1 (fastest): vercel env pull .env.local
   Step 1 (manual):  cp .env.example .env.local  # fill in values from Vercel dashboard
   
   npm install
   npm run dev
   ```
   Include links to Upstash, MongoDB Atlas, Resend dashboards.

4. **Dev-mode fallbacks** — in `app/api/lead/route.ts` and `app/api/chatbot/route.ts`: when optional vars are absent, log `[dev:lead] MONGODB_URI missing — skipping DB write` and continue. (Partial fallback already exists for Upstash and Resend in lead route — extend pattern.)

5. **Request ID** — at top of each API route handler: `const reqId = Math.random().toString(36).slice(2, 10)`. Prefix all log lines: `[lead:${reqId}]`. Replace existing `[lead]` prefix pattern.

6. **AGENTS.md expansion** — rewrite `adjeet-site/AGENTS.md` to include:
   - Project overview (2 sentences)
   - Service map: what each env var group does (MongoDB = lead storage primary, Upstash = rate limiting, Resend = email notifications, etc.)
   - Key files: `app/api/lead/route.ts`, `components/sections/LeadForm.tsx`, `design/tokens.css`, `lib/env.ts`
   - Common tasks: how to add a city to the lead form, how to add a service
   - Link to `.env.example` for env var documentation

7. **`package.json` engines field** — add `"engines": {"node": ">=20.0.0"}` to `adjeet-site/package.json`.

8. **`.nvmrc`** — create `adjeet-site/.nvmrc` with content `20`. Add to README: "If using nvm, run `nvm use` from the adjeet-site directory."

9. **GitHub Actions CI** — create `.github/workflows/ci.yml`:
   ```yaml
   name: CI
   on: [push, pull_request]
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: '20', cache: 'npm' }
         - run: npm ci
           working-directory: adjeet-site
         - run: npm run lint
           working-directory: adjeet-site
         - run: npm run build
           working-directory: adjeet-site
         - run: npm test
           working-directory: adjeet-site
   ```

10. **Dependabot** — create `.github/dependabot.yml`:
    ```yaml
    version: 2
    updates:
      - package-ecosystem: npm
        directory: /adjeet-site
        schedule: { interval: weekly }
        groups:
          patch-updates: { update-types: [patch] }
    ```

11. **Dev comment cleanup** — remove `// You can change the DB name` comment from `app/api/lead/route.ts:120`.

12. **vercel env pull note** — add to `AGENTS.md` common tasks section: "To get env vars: `vercel env pull .env.local` (requires `npx vercel link` first)."

13. **CI lint step** — `npm run lint` added to CI workflow (item 9 above). Catches ESLint issues that TypeScript build allows through.

### §2 — Outside Voice Findings

Outside voice (Claude subagent, independent context) flagged 6 items. 4 incorporated:
- D5/D6 schema conflict resolved (optional vars with runtime warnings)
- `vercel env pull` added as step 1 of README setup
- `npm run lint` added to CI (item 9)
- `.nvmrc` shell hook caveat noted in README

2 items considered and accepted as-is:
- "Champion tier is gold-plating": user confirmed Champion tier after `vercel env pull` was identified. CI + Dependabot are table stakes for production.
- "AGENTS.md is wrong file": AGENTS.md is the project convention (CLAUDE.md → @AGENTS.md). README links to it.

**VERDICT:** TTHW drops from 9 minutes to under 60 seconds. The single biggest fix is `vercel env pull` (zero code, <30 seconds). Everything else in the checklist is belt-and-suspenders for a Champion-tier experience. All 13 items are low-effort individually.
