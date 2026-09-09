# Start here, implementation model

> **Hero media amendment, 7 September 2026:** The user supplied real workshop films after this exploration was created. Production uses `public/hero/workshop/day.webp` and `night.webp`, extracted from the first frames of the two supplied films, plus `day-to-night.mp4` and `night-to-day.mp4` on visitor-initiated theme changes. Do not use the generated hero plates or overlay a synthetic logo in the production hero.

The user asked Astra to settle creative direction and assets, then hand implementation to a less expensive model. Follow **A: streetfront**, subject to subsequent user selection. The old homepage was explicitly rejected. Existing visual code and the old DESIGN.md are not approval of that aesthetic.

## Copy-paste task

> Implement AD-JEET's “Made to be seen” redesign from design/brand-direction-2026-09-07/DESIGN-BRIEF.md, the visual boards, design-tokens.json and asset-manifest.json. Read the latest user instructions, root PRODUCT.md and applicable AGENTS.md first. Read the repository's bundled Next.js documentation before modifying Next code. Preserve unrelated working-tree changes.
>
> Use the provided original logo unchanged. The entire homepage hero background changes from day to night when the existing global theme switches. No separate lighting section, slider or scroll-driven sunset. Use the matching portrait and landscape plate pairs, with the original PNG correctly positioned on the plate. Logo ratio is 586:175, with height auto.
>
> Build mobile first at 390 × 844, then 320/360/430px phones, 768px tablet and 1024/1440px desktop. Implement the homepage and existing Services, service-detail, Portfolio, About, Contact, local-service and Privacy templates in one system. The reference HTML is a visual prototype: its shared sample service destination, simulated form, static links and media-loading strategy are not production behaviour.
>
> Reuse existing content, slugs, coverage data, metadata, publication gates, enquiry destinations, analytics wrappers, validation and lead pipeline. Improve the UI without replacing integrations. WhatsApp uses the existing helper. The form reaches the existing /api/lead endpoint and reports real outcomes.
>
> Complete the acceptance checks and appropriate existing tests. Show fresh phone and desktop screenshots in both themes. State exactly what was verified. Keep the work local and reviewable unless the user separately authorizes publication.

## Read in order

1. Latest user brief, PRODUCT.md, applicable AGENTS.md.
2. DESIGN-BRIEF.md, especially identity, page map, hero crop and form states.
3. index.html via the local review server. Open reference.html?page=home&theme=light and try the theme switch.
4. design-tokens.json, asset-manifest.json, AUDIT.md.
5. Integration files below and the current git diff.

Main visual anchors: boards/home-light-mobile.png and boards/home-dark-mobile.png. Complete phone rhythm: boards/home-light-full.png. Desktop hero: boards/home-dark-desktop.png. Every template has a first-screen and full board.

## File map

| Area | Existing files | Requirement |
|---|---|---|
| Home | app/(marketing)/page.tsx; components/home/*; old components/street/StreetHero.tsx and StreetSky.tsx | Replace rejected composition. Do not accidentally resurrect an old direction |
| Shell | app/layout.tsx; components/Nav.tsx; MobileNav.tsx; Footer.tsx | Original logo, shared navigation; reconcile root top padding and header height |
| Tokens | design/tokens.css and global stylesheet | Map new semantic tokens; check references before removing obsolete layers |
| Theme | lib/theme.ts; lib/use-theme.ts; existing ThemeScript/ThemeToggle | One state and existing storage contract; hero follows it |
| Services | content/services.ts; app/(marketing)/services/page.tsx and [slug]/page.tsx | Ten actual slugs and their individual content. ACP board is a template |
| Work | content/gallery.ts; app/(marketing)/portfolio/page.tsx | Existing work assets, filters with results, accessible enlarged photos |
| About | app/(marketing)/about/page.tsx | Verified story and work; no fabricated team imagery |
| Contact | app/(marketing)/contact/page.tsx; components/sections/LeadForm.tsx | Restyle the real form and methods; preserve states |
| Lead pipeline | lib/lead-schema.ts; app/api/lead/route.ts; lib/env.ts | Keep schema, CAPTCHA, honeypot, rate limits and server acknowledgements |
| Enquiry | lib/whatsapp.ts; components/ui/WhatsAppLink.tsx; floating controls | Keep prefill and analytics; coordinate mobile actions |
| Local SEO | app/(programmatic)/[slug]/page.tsx; content/programmatic.ts; lib/seo.ts; lib/publication.ts | Preserve URLs, schema, canonicals and photography-based publication gate |
| Coverage | lib/coverage.ts; content/cities.ts | Preserve source values; don't mislabel places as administrative districts |
| Privacy | app/(marketing)/privacy/page.tsx | Restyle existing policy. Reference copy is a layout specimen |

## Implementation sequence

1. **Inventory.** Record working-tree state; verify original logo hash. Locate theme, navigation and floating-control integration points. Read installed framework docs.
2. **Identity and shell.** Semantic OKLCH tokens, font loading, unchanged logo, navigation and theme. Verify 320/390px before adding the hero.
3. **Hero.** Copy selected WebPs into a stable public path. Build the image plane, exact logo placement, responsive art direction, initial-theme rendering, destination decode, crossfade, reduced motion and failure fallback. Keep copy/actions usable before JavaScript.
4. **Homepage.** Follow the specified sequence. Coordinate the enquiry dock with visible actions and keyboard state.
5. **Templates.** Services, detail, portfolio, about, contact, local service, privacy. Share components where roles repeat, without forcing every section into identical boxes.
6. **Behaviour.** Connect real service links, WhatsApp prefill, analytics wrappers and validated form. Verify errors with mocks rather than real customer messages.
7. **Checks.** Relevant existing tests, lint, build/type checks and rendered review. Fix issues and capture fresh evidence.
8. **Handoff.** Report changed areas, tests and actual limitations. Keep local unless later release instructions authorize more.

## Hero contract

- Global light selects day; dark selects night. No duplicate lightingMode state or separate lighting controls.
- Logo is the actual original image, not generated lettering. Verify rendered ratio, not only intrinsic image metadata.
- Coordinates belong to the full uncropped image plane. Crop photo and logo together. Width scales; height stays auto.
- Use portrait pair below 1024px and landscape pair above. Check safe regions at 320px and 200% text zoom.
- Use local scrims. Do not dim the entire photograph to rescue a text line.
- Reserve layout. No day flash on initial dark preference. A failed alternate plate cannot hide the action.
- Crossfade the incoming decoded plate over the outgoing one for 800ms; instant for reduced motion. Rapid toggles finish on the latest selection. Do not fade copy or logo.
- Subset review TTFs to WOFF2 for production, retaining licences.
- Do not fetch both resolutions, both themes and old animation frames on first paint. The prototype is not a media-loading implementation.

## Links and content

Prototype service rows share one ACP detail specimen. Production must link each row to its actual /services/{slug}. Homepage groups should open the corresponding Services anchor.

Portfolio has five source images and useful Signage/Vehicle filters. Do not add empty categories or fictional case studies. Preserve keyboard and focus-return behaviour if using a lightbox.

Prototype contact controls do not open WhatsApp or send data. Production uses the existing defaultWhatsAppUrl, WhatsAppLink and correct tel/mailto targets. Photos attach in WhatsApp; no fake website uploader.

The local-page board specifies layout. Use actual service/city content and verified local photographs. Never add generated material to content/gallery.ts to bypass lib/publication.ts.

The name validator currently permits Latin characters only. Hind Siliguri's Bengali glyphs do not make the application bilingual. Treat expanded script validation as an explicit additional change if requested.

## Acceptance

- Source logo hash matches; every rendered logo ratio is within 1% of 586/175. No substitute wordmark in shell or hero.
- Global theme changes the hero scene and UI together. Major geometry remains stable. No independent lighting section.
- At 390 × 844, logo, controls, understandable headline, service description and primary action fit the opening. Smaller/zoomed screens scroll normally without clipped or overlapping content.
- No horizontal overflow at 320, 360, 390, 430, 768, 1024 and 1440px. Long names, selects and legal text remain usable.
- At least 44px action targets, 16px primary copy, visible focus, readable contrast and reduced-motion support. Check rendered photographic contrast.
- Dock cannot cover a field, footer link or visible primary action. No overlapping chatbot/FAB/dock stack.
- Each service URL, filter, enlarged-photo action, contact method and navigation link reaches its real destination.
- Form success requires the server. Validation, network, CAPTCHA and rate-limit errors preserve input and explain recovery. No real lead/notification is sent solely for design testing.
- Metadata, canonicals, sitemap/publication rules and source coverage values survive.
- Fresh screenshots: mobile/desktop light and dark, menu, filtered work, detail, form error/success. Check a real phone and Safari where available; state if not checked.
- Measure production performance after integration. Design-pack checks do not certify production performance or end-to-end behaviour.

## Do not reintroduce

Cobalt Anton hero. Substitute block-letter AD JEET. Floating sticker dates. Hero metric strip. Detached lighting comparison. Arbitrary 3D blobs. Repeated icon cards. New response-time, guarantee or outcome claims. Fake client work. A replacement backend.

## Preview limitations that must not ship

The design reference intentionally uses sample routing, a labelled simulated form, convenient font/media loading and simplified dock logic. It is a high-fidelity visual specification, not a production starter. Follow this contract when integrating it into Next.js.
