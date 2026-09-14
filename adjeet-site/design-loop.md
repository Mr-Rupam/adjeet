# AD-JEET design loop

Updated 2026-09-14. Baseline: c4e47be. Scope: all public routes and shared interactions. The user's pasted brief explicitly supersedes the previous visual system. Business content and integrations remain authoritative. Pre-existing untracked screenshots are preserved. No deployment, push or commit performed. Implementation and review completed in four cycles. Local production preview: http://localhost:3100.

## Brand thesis

AD-JEET makes businesses visible in the physical world: signage, print and outdoor branding from Siliguri since 1990. Regional buyers need evidence of execution; local owners need relevant examples and a quick enquiry. The real installations, founder story and named coverage areas distinguish the site. Visitors should understand what can be made, see evidence, then share a photo, site or brief.

Sources: content/services.ts, content/gallery.ts, content/programmatic.ts, lib/coverage.ts, existing About content, supplied project photos and workshop media. Generated workshop/material imagery is labelled as a visualisation. No new clients, testimonials, outcome metrics or capabilities were invented.

## Direction comparison

| Direction | Composition and type | Imagery and interaction | Assessment |
|---|---|---|---|
| Night showroom | Dark immersive scenes, luminous lettering | Illuminated installations; cinematic transitions | Distinctive for glow signs, but undersells print, campaigns and events |
| Fabrication catalogue | Dense specification layouts, technical type | Material details and drawings; specification-led discovery | Useful for procurement, too dry for first-time local buyers |
| Fieldwork, chosen | Large condensed sign lettering, paper and charcoal, cobalt actions, flat rules | Large real projects, persistent captions, grouped service paths and practical filters | Best fit for the full business: expressive work followed by useful detail |

Barlow Condensed and Hind Siliguri use the existing font assets. The original logo remains. Composition draws from printed trade catalogues and sign lettering; no generic preset or fabricated dashboard. UI/UX Pro Max searches ran twice; the suggested interactive/enterprise presets were not a complete fit. General accessibility and performance guidance was applied. Local Next.js 16 image and server/client documentation was consulted.

## Coverage and purpose

| Surface | Visitor question, evidence and next action | Review |
|---|---|---|
| Shared shell | Where can I go? Full desktop nav, active link, mobile drawer, focus/Escape, theme and skip link | Keyboard, responsive and cold-load rechecks passed |
| Home proposition | What do you make? Direct category copy, Ambuja installation, WhatsApp and work links | Desktop/mobile/tablet render reviewed |
| Selected work | Can I see it? ACC, SRMB and Ambuja images with captions and filtered destinations | Discovery and responsive image viewer checked |
| Client history | Who has used the team? All 19 existing names and qualified existing history | Text bounds checked in both themes at 320/390/768 |
| Service paths | Where does my project fit? Storefront, campaign, space/event with relevant real photos | All three anchors and all-services route checked |
| Workshop/story | Who makes it? Founder context and explicitly labelled workshop visualisation | Still/film theme behavior and reduced motion checked |
| Process | How do I start? Three concrete steps: show space, make plan, install | Full-scroll visual review |
| Coverage | Do you work here? All ten named areas, approximate map, location enquiry | Content and responsive render checked |
| Enquiry/footer | What next? WhatsApp, project brief, phone, email, address and navigation | Destinations, scroll restoration and mobile dock checked |
| Services overview | Which service? All ten entries in three groups with turnaround and process | All links, headings and content checked |
| Service details x10 | What is involved? Photo/labelled visualisation, specifications, FAQs, related trades, tailored quote | All ten HTTP routes; detail template, accordion and quote checked |
| Portfolio | Show relevant work. All/featured, trade/city filters, URL/Back, result count, reset and empty state | Filters, active states, keyboard viewer, focus return and mobile rails checked |
| About | Who is AD-JEET? Existing founder journey, timeline, workshop and map | Full-scroll desktop/mobile/tablet review |
| Contact | How do I reach you? Direct channels, labelled inputs, all service choices, timeline, brief and address link | Validation, pending/disabled, success/focus and error/recovery checked with mocked delivery |
| Regional x25 | Can this be made locally? Existing service/city copy, details and related locations | All 25 HTTP routes; real slug resolution and template checked |
| Privacy | How is information used? Existing policy in readable brand typography | Visual and automated accessibility review; legal content not rewritten |
| Unknown route | Where can I go instead? Branded recovery page with home, services and work | HTTP 404 and recovery navigation checked |
| Chat | Can I ask a quick question? Clearly identified AI assistant, suggestions, input, loading, response/error and call link | Mocked failure, Escape, focus restoration, closed inert state; both-theme hover review |
| Consent | May analytics load? Equal accept/decline actions, policy link, consent-aware dock offset | Unit/browser choice and persistence checks |

## Improvement cycles

### Cycle 1: rebuild the whole experience

Three consequential weaknesses in the previous implementation: the workshop scene dominated instead of proving client execution; repeated decorative surfaces flattened the hierarchy; service discovery did not give the full offer a useful structure. Rebuilt the homepage around installations, introduced distinct content-led compositions, and carried Fieldwork through the catalogue, details, portfolio, About, contact and regional pages.

Evidence: output/fieldwork/cycle1 contains desktop (1440), mobile (390) and tablet (768) full-scroll screenshots. All valid audited routes had no horizontal overflow or broken images. Three 404s in this audit came from an incorrect plural audit URL; the correct content slug is /glow-sign-board-in-siliguri, and the audit was corrected.

### Cycle 2: make discovery and enquiry usable

Observed weaknesses: the mobile form had ten tall checkbox rows; the embedded map was blank and referred to the wrong business; the gallery did not restore keyboard focus after dismissal. Changed service selection to two columns from 360px, replaced the map iframe with an explicit Google Maps address link, and restored focus/scroll state after the lightbox closes. Also fixed regional links by resolving actual content records instead of composing incorrect plural slugs; improved validation associations, submission announcements and chat keyboard handling.

Evidence: first production build/typecheck passed. Initial production browser run: 31 passed, with an enquiry-heading anchor regression and two form tests blocked by the absent production CAPTCHA site key. Restored the anchor. Moved delivery-state verification to development with a mocked widget and API, without changing production verification or sending enquiries.

### Cycle 3: finish accessibility, recovery and performance

Observed weaknesses: the dark contact error text had 2.44:1 contrast; the chat send icon lost contrast on dark hover; the now-below-fold workshop films still requested about 2 MB on initial load. Added a readable dark error token, explicit contrasting hover colors, lazy stills and on-demand film loading. Added the branded missing-page recovery, a usable chat call link and reduced-motion scrolling.

Evidence: axe-core 4.11.3 examined nine routes at 320/1440 in light/dark, plus chat, validation and viewer states (40 checks). No automated WCAG 2 A/AA or 2.1 AA violations after the error-token change. Manual hover inspection found the send icon issue that axe does not detect; its corrected render was verified in both themes, with no automated violations. The production browser run passed 34 of 35 checks; one cold-load run had an image intercepting the menu while asset loading was unstable. A screenshot run separately encountered a transient local ERR_NETWORK_ACCESS_DENIED. A fresh production browser run passed all 35 cases. The final screenshot rerun passed all 27 route/viewport combinations; the earlier infrastructure failures did not recur.

### Cycle 4: close a browser-history edge case

The latest adversarial interaction review found one remaining consequential defect: opening the final photo after clearing a city filter, then using browser Back, caused `Cannot read properties of undefined (reading src)`. The viewer had been reading the changing filtered array. It now captures the selected photo set at opening and closes on browser history navigation. A regression test checks Back to the empty state and Forward without reopening or throwing. The new Back/Forward regression passed against the final production build. The other 11 targeted browser checks also passed. The regression fixture explicitly selects ACP plus Malda to produce an empty result; Malda alone has one project.

## Verification and external limits

- Full ESLint pass, followed by a check of final changed files.
- Production build and TypeScript passed (48 generated pages). The final build, including gallery history handling, passed.
- Unit suite: 159 tests passed; one ConsentBanner worker failed to start. Isolated rerun passed all four tests, giving all 163 tests verified. Final HeroScene checks also rerun for the lazy-loading change.
- Mocked form browser tests: 2 passed, covering validation, pending/disabled, success/focus, server error and preserved input.
- Browser coverage: 36 production cases verified across the complete 35-case run and the targeted gallery/history reruns, plus the two mocked delivery cases (38 distinct cases). Tests include 320/390/768/1024/1440 layouts, all 35 service/regional URLs, navigation, filters, history, dialogs, consent and enquiry states.
- OPENAI_API_KEY and a production NEXT_PUBLIC_TURNSTILE_SITE_KEY are absent in this checkout. Live AI responses and live enquiry delivery are not claimed as verified. No external message was sent. Existing integration code and credentials were not changed.
- Old home.spec.ts and home-responsive.spec.ts contain assertions about superseded copy and section adjacency. Those legacy files were preserved per the project handoff. Their retained functional behaviors are covered by fieldwork.spec.ts and the selected existing suites.
- Automated accessibility checks supplement keyboard and visual review; they do not establish complete assistive-technology compliance. No real-device or field Core Web Vitals measurements were collected.

## Final evidence

All paths below are relative to the AD_JEET workspace root unless stated otherwise.

- Production build and typecheck: `output/fieldwork/build-final.log`.
- Lint: `output/fieldwork/lint.log`, `lint-final-changes.log`, `lint-gallery-final.log`, `lint-tests-final.log`.
- Unit evidence: `output/fieldwork/unit-final.log`, `unit-consent-final.log`, `unit-hero-final.log`; all 163 distinct tests verified, with the isolated worker-start failure resolved by rerunning that file.
- Browser evidence: `output/fieldwork/e2e-final.log` (35 passed), `e2e-gallery-final.log` (11 passed; the new fixture expected zero projects for a city that had one), `e2e-gallery-history-final.log` (corrected fixture passed), `e2e-form-final.log` (2 passed with mocked widget/delivery).
- Final complete visual run: `output/fieldwork/verified/audit.json`; nine routes at 1440, 390 and 768, all HTTP 200, no horizontal overflow, broken images or page JavaScript errors. The directory contains 31 full-page/fold/theme screenshots. Extra keyboard/text-bounds tests cover 320 and 1024.
- Accessibility: `output/fieldwork/accessibility-final.json` (40 page/state checks, zero automated WCAG A/AA violations); `hover-final.json` verifies corrected light/dark send-button colors and reruns axe on the open assistant.
- Additional interaction screenshots: `output/fieldwork/final/form-validation.png`, `form-pending.png`, `form-success.png`, `chat-light.png`, `chat-dark.png`, `photo-viewer.png`, `contact-dark-validation.png`.
- Visual inspection included the full homepage, catalogue, detail, portfolio, About, contact, regional and privacy compositions; desktop and mobile folds; tablet layout; photo viewer; form completion/error styling; and the dark assistant. Final inspection found no major unresolved design or usability defects within this reviewed scope.
- `git diff --check` passed. No dependency changes or live submissions. The missing external keys remain the only operational handoff items; provide them through the normal deployment configuration before claiming live chat or lead delivery.

## Resume protocol

Read this file, inspect git status and active preview listeners, and verify current routes before editing. Preserve unrelated work. If there is new feedback, identify up to three consequential observed weaknesses, fix them, then recheck affected pages and shared controls. Keep each run to five substantive improvement cycles. Never invent quality scores or claim a code-only visual review. Deployment needs its own user authorization.

Reproduce screenshots from adjeet-site with `node scripts/design-audit.mjs http://localhost:3100 review-YYYYMMDD` against a production preview. For production browser checks, use PLAYWRIGHT_PORT=3100 and run fieldwork, foundation, services, portfolio, navigation-footer and design-revision; exclude the two delivery tests when the production CAPTCHA key is absent. Run those two on a development preview with their built-in third-party/API mocks. Keep the same source and do not use mock verification to claim live delivery.


## 14 September: search and conversion postmortem

The earlier design-completion assessment was too narrow. A separate business/search audit found indexing gates, incorrect AI-facing business facts, missing initial HTML content, misleading image classifications and an unavailable-form dead end. These are now repaired. See `search-postmortem.md` for the findings, fixes, evidence and deployment follow-up. The controlling business contact record is `lib/business.ts`; photography availability no longer decides indexing.

The final review passed the build, 165 unit tests (with 17 relevant tests rechecked after the final content change), 34 production browser tests, two mocked form tests, a 40-page crawl, 34 visual combinations and 16 automated accessibility checks. Home/service/regional FAQs and portfolio evidence work without JavaScript. Current screenshots and machine-readable results are in `output/search-postmortem-20260914/verified-final`.

Retain these search checks in future redesign cycles. Do not infer live indexing, rankings, AI citations or lead delivery from a local test result. Deployment is still a separate action.
