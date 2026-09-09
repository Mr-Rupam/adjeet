# AD JEET: ERA-inspired implementation

Local preview: [Open AD JEET](http://127.0.0.1:4180/)

Source: `C:/Users/KIIT0001/Downloads/AD_JEET/.superpowers/worktrees/era-build/adjeet-site`

Branch: `codex/era-adjeet-motion`

## What changed

- Six-scene homepage with the existing workshop hero, a staggered gallery of real projects, three service paths, a labelled process illustration, verified coverage and direct enquiry actions.
- Masked heading lines, an intact script entrance, restrained image reveals and a short desktop project transition. Phones use normal stacked content and one-time entrances; reduced motion removes travel and playback.
- Shared treatment across Services, service details, Portfolio, About, Contact, Privacy and location pages. Portfolio filters now use the actual header height.
- Selected-work lightbox with keyboard navigation and focus return. Both supplied theme films load on demand and recover to the matching poster on failure, stalled loading or interrupted playback.

The original mark, supplied films, project images, route data, SEO/publication gates and lead pipeline are retained. No new runtime packages were added. Three GPT-5.6 Terra implementers and two Terra reviewers handled bounded tasks; the parent completed integration after usage limits interrupted the remaining agent reports.

## Verification

- Unit tests: 22 files, 170 tests passed.
- ESLint: full run passed; subsequent motion and test-helper edits passed targeted checks.
- Git whitespace check: passed; Windows line-ending notices only.
- Production build: passed, including TypeScript and 48 static pages. Both the ordinary build and the local CAPTCHA test build passed.
- Existing Playwright suite: all 31 tests passed against the production preview. Lead requests were intercepted; success and server-error paths used mock responses.
- Additional browser checks: all 11 groups passed, covering eight routes at 320, 390, 768, 1024 and 1440px, natural image proportions, gallery focus return, reduced motion, no-JavaScript content, route/breakpoint cleanup, deferred films and both six-second film directions with rapid toggles. No uncaught application errors were observed.
- Source preservation: all 301 original source hashes still match the starting snapshot. The implementation changes 24 files relative to that copied baseline.

The first browser pass found two motion defects: hidden service links and a hidden form container. Interactive surfaces now remain opaque, and forms are excluded from generic reveals. The form test helper now waits for Turnstile's response token rather than depending on its iframe structure.

Local Chromium measurement at 390px, reduced motion, no throttling: 1,012,885 bytes transferred before interaction, no optional film requests, CLS 0 and LCP 188ms in this run. These figures describe a local test on this computer. Incremental JavaScript size and physical-device performance were not independently benchmarked.

Raw logs, browser evidence and screenshots are saved beside this file. The implementation diff and source hash comparison are in `.superpowers/sdd/era-build/` at the repository root.

Visual evidence includes desktop hero, selected work, process, Services masthead/service list, and 390px/320px hero and gallery views. Screenshots wait for entrances to settle; the selected-project image can show its actual scroll-driven reveal state.

## Remaining inputs and limits

Licensed Cesura and Pristina WOFF2 files have not been supplied. The existing declared temporary font stacks remain in use; final wrapping must be rechecked when the intended files arrive. See `app/fonts/REQUESTED-FONTS.md` in the implementation source.

The current loopback-only preview was built with Cloudflare's public test sitekey `1x00000000000000000000AA`, supplied only through the build command's environment. No source default or environment file was changed. This is the documented [Turnstile test setup](https://developers.cloudflare.com/turnstile/troubleshooting/testing/). Live form delivery requires the real CAPTCHA and backend configuration; the optional chatbot also reports a missing API key locally. No real enquiry or notification was sent during verification.

Responsive Chromium checks are desktop simulations. Physical Android, iOS Safari and field Core Web Vitals require separate device/traffic evidence. Local performance observations are not field measurements.

The work is local and uncommitted. Nothing has been published or copied over the original source checkout. Restart the production preview from the implementation directory with `npm run start -- --port 4180 --hostname 127.0.0.1` after a successful `npm run build`.

Verified 9 September 2026. The preview is left running on port 4180 (PID 39404), and its browser tab is retained for review.
