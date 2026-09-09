# AD-JEET: Made to be seen

Creative role: brand creative director and mobile experience designer. 7 September 2026.

Status: **recommended visual proposal, not user-approved and not implemented in the production application.** The supplied logo and latest user brief control this work. This document supersedes the rejected visual direction in the project's old DESIGN.md when the redesign is implemented.

## The idea

A sign maker's website should demonstrate the thing it sells: making a name visible in the physical world.

The opening is one full-bleed workshop scene. In daylight, the original cyan lettering sits on an ivory sign cabinet above a cyan shutter. Switch the site to night: the sky deepens, the cabinet illuminates, and light falls onto the frontage. The camera, sign and reading position stay put. This happens **inside the homepage hero background**, through the **global theme switch**. There is no separate lighting section, comparison slider, scroll-controlled sunset or autoplay day/night cycle.

The website then leaves the concept set and shows the existing project photographs. A material close-up explains the craft. The final cyan panel asks: “What are we putting your name on?”

Physical scene: a North Bengal business owner looks at the site on a phone outside a shop in bright daylight, then returns in the evening to discuss a sign. Light mode needs clear surfaces in ambient light; dark mode should feel like an illuminated frontage after hours. Follow system preference initially, then respect the person's explicit choice.

## Three studies

| Study | Distinct idea | Strength | Tradeoff | Decision |
|---|---|---|---|---|
| A. The streetfront | An architectural sign scene changes from day to night | Connects brand, service and theme immediately | The generated set must not be presented as the actual office | Recommended hero. Mobile and desktop day/night pairs supplied |
| B. The maker's table | Acrylic, aluminium, vinyl and LEDs become a macro landscape | Shows dimensional material detail | Less recognisable as a local sign-making business | Use the render in the craft section; retain its hero study as an alternative |
| C. A street in miniature | A small street gathers the surfaces the company can brand | Distinctive 3D storytelling | Smaller details and a more playful tone | Alternative study only; do not add it as another animated homepage section |

B and C are exploratory night compositions, not fully developed theme pairs. This handoff follows A unless the user chooses otherwise. Their images are raster renders, not interactive 3D models or GLB files.

## Identity

Personality: **Established. Hands-on. Luminous.**

Source logo: C:/Users/KIIT0001/Downloads/ADJEET/adjeet/logo.png.png.

The unchanged copy is assets/adjeet-original.png. SHA-256: 593171413b014c8d79501f1bf408c91354cfb31c70215b22b9c70cc45cc8bcea.

Preserve the entire mark: serif AD-JEET lettering, boxed monogram, Since 1990 panel, yellow sweep, colours and proportions. Do not typeset, redraw, crop, trace, distort or replace it. The generated scene plates are deliberately unlettered; the reference places the actual PNG directly onto the sign face. Header, footer and hero use that same file. Any future physical extrusion must use an exact approved vector outline, not a model's interpretation.

The supplied raster is 586 × 175. At large desktop sizes its fine edges are naturally softer than a vector. Preserve it rather than inventing a higher-resolution mark. A higher-resolution original can replace it later without changing the layout.

## Colour and typography

Colour strategy: **full palette with physical roles**. Cyan belongs to fabricated surfaces and the closing enquiry panel. Yellow points to the primary action and remains in the original logo. Chalk supports reading in daylight. Petrol is the ambient night surface. Project photographs retain their own colours.

| Role | Reference hex | Use |
|---|---|---|
| Sign cyan | #109FCC | Brand surface, not small text on chalk |
| Sweep yellow | #F1F36D | Primary enquiry action |
| Workshop chalk | #F2F1E9 | Day page surface |
| After-hours petrol | #0A222A | Night page surface |
| Reading ink | #12333B | Day text and text on yellow |
| Ink on cyan | #08262D | Readable text on cyan |
| Day secondary text | #496269 | Supporting copy |
| Day link | #087594 | Accessible darker relative of cyan |
| Night text | #E5EFF0 | Night primary copy |
| Night secondary text | #A5BCC0 | Night supporting copy |

design-tokens.json is the machine-readable source, including OKLCH values and semantic theme mappings. The reference stylesheet uses OKLCH. Checked solid-surface text pairs range from 4.65:1 to 14.07:1. This does not certify text over photographic backgrounds; those require rendered checks in each crop.

**Barlow Condensed 500**, with 600 for emphasis, supports the original serif logo through the rhythm of sign lettering. **Hind Siliguri 400/500** supplies body and UI text and includes Bengali and Latin. Both are included locally with OFL licences. Do not substitute Anton, Inter or an unrelated editorial serif. Do not create a wordmark using either supporting font.

| Element | Phone | Desktop |
|---|---|---|
| Hero H1 | 68px / .97; 58px on narrow or short phones | 108px / .97 |
| Page H1 | 58px / 1.02; 51px at 320px width | 86px / 1.02 |
| Section H2 | 45px / 1.02 | 60–68px / 1.02 |
| Body | 17px / 1.5 | 18–20px / 1.5 |
| Captions | 14px / 1.5 | 14–16px / 1.5 |
| Eyebrows | 13px, modest tracking | 13px, modest tracking |

Primary copy stays at least 16px. Body measure is normally 42–65 characters; legal text may reach 70. Preserve Bengali shaping and allow taller lines if translated later. This pass does not translate the website. The existing lead-name validator only accepts Latin characters; Bengali form entry requires a validation change before claiming bilingual support.

## Mobile structure

Design at **390 × 844** first. Check **320, 360, 390, 430, 768, 1024 and 1440px** widths. Gutters: 22px phone, 18px on the narrowest screen, 40px tablet and 64px desktop. Use 28px around related content, 48–68px between major phone sections and 88px on desktop. Avoid making every section the same height.

Header: 80px on phones, 88px desktop. Original logo: 176px wide on a normal phone, 150px at 320px. Theme and menu: 44 × 44px each. No second WhatsApp icon in the phone header. Desktop navigation: Our work, Services, About us, Start a project, theme control.

Phone navigation opens a clear panel under the header with five large links and the enquiry action. Escape closes it; expanded state is announced. In production, account for scroll and focus when the menu exceeds the viewport. No hover-only service discovery.

The initial hero has one primary enquiry button. A bottom enquiry dock appears after that action leaves view. Hide the dock while another primary enquiry action or the form is visible, and while the keyboard is open. Respect the safe area. Reserve bottom padding. Integrate the existing chatbot and WhatsApp FAB into this hierarchy; never stack three floating controls.

## Homepage, in order

1. **Hero: Made to be seen.** Full-bleed day/night scene. Small “Siliguri · Since 1990”. Supporting copy: “Signage, print & outdoor branding. Designed. Fabricated. Installed.” Action: “WhatsApp your project”. A downward link reveals the work. An unobtrusive concept caption distinguishes the fictional frontage from the actual office.
2. **Selected work: You've probably seen our work.** Lead with Ambuja at full phone width. Follow with SRMB and ACC, then “Explore our work”. Names and service labels sit outside photographs. No invented dates, cities, outcomes or testimonials. Desktop uses one large lead photo and two smaller supporting photographs offset beside it.
3. **Services: Choose your canvas.** Three generous linked rows: Your storefront; Your next campaign; Your space or event. Each has a restrained line drawing and opens the corresponding Services group. Include “All 10 services”. No ten-card icon grid.
4. **Craft: Built from the inside out.** The material render fills the screen width. Three short sequential rows: Size it. Make it. Fit it. Caption it as a material visualization. This is a static section, not another theme demonstration.
5. **Coverage: From city streets to hill roads.** Existing roadside image, Siliguri base and plain town names. No invented precision map. Use lib/coverage.ts. Do not describe its mixed list of cities, districts and regions as ten administrative districts. Action: “Tell us your location”.
6. **Enquiry: What are we putting your name on?** Cyan background, deeper ink and one yellow action. “Send a photo of your space. Tell us where it is. Let's start there.” Attachment happens in WhatsApp; the browser does not upload the photo.
7. **Footer.** Original logo, service description, phone, main navigation and privacy. No invented badges, counts, social links or response-time promises.

## Whole-site design

| Existing route | Layout and content priority | Interaction and action |
|---|---|---|
| / | Hero → work → grouped services → craft → coverage → enquiry | Global theme changes the hero; useful enquiry stays reachable |
| /services | Short heading; material panorama; three groups containing ten service rows | Group anchor navigation; each row retains its actual service URL |
| /services/[slug] | Service name/action; matching work photo; material/size/planning definition list; useful detail; FAQs | Service preselected in enquiry. Specifications from content/services.ts. The ACP board is the visual template for all ten |
| /portfolio | Brief introduction, filters, five large existing photographs | Only filters with results. Selected state, result count and accessible larger photo view |
| /about | Original identity and founding year; concise story; work proof; locations | No fabricated founder quote, team portrait, workshop photo, customer history or capacity metrics |
| /contact | WhatsApp first; call/email; existing lead form; addresses afterward on phones | One phone column; form/contact details side by side on desktop |
| Existing /{programmatic-slug} routes | Service + place heading; relevant photo if verified; useful local copy; specifications | Preserve slugs, canonicals, context and publication gates. No new location-page proliferation |
| /privacy | Existing policy in a readable single column | Normal selection, printing and contact links. Board is a layout specimen, not replacement policy language |

Service groups retain all ten slugs. Storefront: glow-sign-boards, acp-led-signage, one-way-vision. Campaign: flex-printing, vehicle-branding, wall-painting, f-pole-installation. Space & event: in-shop-branding, events-and-puja, product-display.

If a service lacks an authentic work photo, use a labelled material visualization and real specifications. Never reclassify a generated asset as project evidence to unlock indexing. The publication gate is derived from real project photography.

## Theme choreography

One light/dark state. Light uses day; dark uses the matched night plate. The exact logo stays a separate image. In production, the duplicate physical sign can be decorative while the header provides the accessible brand name.

Crossfade the incoming plate over the existing plate: **800ms, cubic-bezier(.22,1,.36,1)**. UI colours settle in 180–250ms. Do not animate layout, camera zoom, logo dimensions, hue rotation or guessed intermediate scenes. Lighting is already in the night plate. No giant bloom shader.

If the target image is not decoded, keep the readable current scene while loading. Crossfade only after decoding. If loading fails, retain a readable fallback while the rest of the theme switches. Rapid toggles resolve to the latest request. Persist through the existing theme mechanism. Reduced motion switches immediately. No sound or automatic cycling.

Mobile plates: matching 1024 × 1536 framing. Desktop pair: 1536 × 1024. Generated relighting preserves major edges visually, not a mathematically guaranteed pixel-perfect registration. Inspect the transition at full size before shipping. Use these matched stills instead of the old 24-frame sequence.

## Asset placement

These are scene plates, not complete hero screenshots. Keep photo, logo and UI as separate layers.

Mobile logo centre: **48.9% x, 34.5% y**, width **66% of the image plane**. Desktop: **71.7% x, 39.1% y**, width **35.2%**. Logo height is always auto. Coordinates belong to the uncropped plane, not the viewport.

Use cover mathematics: scale the image plane to the larger of viewport-width/image-width and viewport-height/image-height, then centre it. Scale the original logo with the same plane. Reserve hero size before media loads. Use responsive art direction for the portrait and landscape pair. Never position the logo independently from the crop.

Day copy uses dark ink with a local chalk scrim. Night copy uses pale text with a local petrol scrim. Avoid a global overlay that flattens the sign. Desktop protects the left copy area; phone protects the lower area. Keep copy away from the bright sign.

WebP sizes: about 144KB/79KB for mobile day/night, 117KB/48KB desktop, 127KB materials and 127KB miniature. Exact bytes are in the manifest. 640px mobile exports are included. Source PNGs are retained for edits, not page delivery.

## Interactions and form states

Primary action: yellow, 54px minimum height, 6px radius, dark label, restrained border. Links are underlined or clearly action-shaped. Photos have square edges. Avoid wrapping every section in a rounded container.

Keep name, phone, city, service multiselect, timeline, optional message, honeypot and Turnstile. Use native semantics, autocomplete, phone keyboard, visible labels, 52px fields and 44px checkbox rows. Choosing Other for city must not create an unsupported backend field.

Errors sit beside inputs; focus the first invalid field. Preserve values on network, CAPTCHA, validation and rate-limit failures. Offer the existing WhatsApp fallback. Pending state prevents duplicate submission. Success appears only after the real endpoint acknowledges the request.

The reference form is a labelled demonstration with no API calls. The builder must reconnect the existing validated form, not copy the simulation.

## Performance and accessibility targets

Targets, not measured production results: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at the 75th percentile. Initially request only the selected-theme hero candidate. Load the other theme after primary content or on intent; respect save-data. Lazy-load below-fold photography. Use local WOFF2 subsets and retain licences.

Aim for ≤250KB initial mobile hero media and ≤500KB combined hero/logo/font critical assets after subsetting. The review loads extra media and TTFs for convenience; it is not a network-budget demonstration.

No mandatory WebGL, gyroscope, autoplay video, scroll capture, giant frame sequence or hover-only information. Verify keyboard, focus, 200% text zoom, reduced motion, image failure, initial dark preference, long labels, native selects and safe areas. A real phone and Safari remain production acceptance tasks.

## Content limits

The Ambuja photo visibly contains Kushmandi while gallery data says Jalpaiguri. ACC's photographed date and metadata also need reconciliation. The design omits those location/year captions rather than guessing.

The generated frontage is not a verified image of Platinum Square or Patiram Jote. The material study does not certify an engineering specification. The miniature is not a geographic map. Existing service warranties, timelines and technical/legal claims remain owner-provided content; this redesign does not independently verify or strengthen them.

No external publication, lead submission, commits, push or deployment are included in this design pass.

System screens use the same quiet shell. A missing page should say the page could not be found and offer Services and Contact. Loading never hides already-readable hero copy. An unavailable service photo uses the labelled material treatment, not a broken image. Keep error and recovery states functional before adding decorative motion.
