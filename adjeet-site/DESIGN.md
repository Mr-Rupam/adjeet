# AD-JEET design system

Updated 20 October 2026. The former cobalt showroom, the detached day/night comparison slider or animation, and childish map pins were rejected and are not a source of design direction.

## The world

A North Bengal market street, read shop by shop. The site is built from what a sign maker actually makes: painted and lit shopfronts, fascia boards, aluminium, acrylic, LED letters and the workshop that fabricates them. Real photographs carry it. The brand is the supplied logo: cerulean serif lettering, the small monogram and Since 1990 panel, and the gold sweep under the name.

Brand personality: **Established. Hands-on. Luminous.**

## Homepage (storefront-led, 20 October 2026)

The homepage serves one buyer first: a local shop owner opening, replacing or improving a shopfront. It runs, top to bottom:

1. **Hero: a recognisable local shopfront and a clear offer.** The H1 stays "Sign boards that get you noticed." The lead names the trade and the town before anything else: "Sign board makers in Siliguri, since 1990. Shopfront signs designed, made and installed from our own workshop. Send a photo of your shop to start." The WhatsApp action is the primary button. The photo rotates through shopfronts only, opening on the photographed Ambuja Cement ACP and LED installation at P and P Traders, Kushmandi, then Astral Pipe in Debidanga, SD Lion TMT in Cooch Behar and ACC in Khawakhali. Each caption names the brand, the trade and the place the gallery records. Desktop (1024px and up): copy on the paper, photo on the right with its caption on a fascia plate, and the four main trades (glow sign boards, ACP and LED signage, flex printing, vehicle branding) linked along the foot of the copy column. Phones and tablets: the photo fills the opening surface with a gradient cushion behind the copy, and the WhatsApp action sits in the first screen.
2. **Three finished shopfronts** (`#selected-work`), on the night surface, the street after dark. One wide lead, two below. Each photo has a fascia plate caption and its own "Ask about a sign like this" WhatsApp link carrying the example's reference. A link closes the section to the whole portfolio, with the true photo count.
3. **Client logos** (`#client-history`), the owner-approved board of brands, now on the elevated paper so it alternates with the night street above it.
4. **The two main sign choices** (`#services`): glow sign board or ACP board with 3D LED letters, side by side with an "or" on the dividing rule (stacked on phones). Each has a photographed job, how it is lit, what it is made of and who usually chooses it, read from `content/sign-comparison.ts` so the homepage cannot drift from the comparison table on /services. Lead times stay on the service pages with their caveats. A row below links flex boards, vehicle branding, every shopfront option and all services.
5. **Process and quote guidance** (`#how-it-works`), on the night surface: send a photo of your shop; choose the sign and get the quote (boards are quoted by area in square feet, then adjusted for material, lighting, artwork, quantity and installation access); we make it and fit it. The media is the real site photograph of the workshop gate. The gold step numerals are the logo's sweep colour.
6. **Places served** (`#areas`): the approved coverage map with its framed sign boards, unchanged, plus a link to /areas.
7. **Questions, then the enquiry**: the home FAQs (which also feed the FAQ structured data), then the cerulean commission band with WhatsApp and the project brief.

### The three shopfront examples

Codex's verified selection, recorded here so a later edit does not drift. Each line claims only what `content/gallery.ts` records:

| Gallery id | Shown as | Place claimed |
| --- | --- | --- |
| `tanyamakeovers-154` | Lit studio lettering / Siliguri | Siliguri (recorded) |
| `acc-125` | ACP shopfront fascia / Dalkhola | Dalkhola (recorded) |
| `anchor-by-panasonic-112` | Jai Maa Anjani Electricals / Shop board | none (the gallery records no place) |

The two sign-choice photos are `havells-015` (glow sign board, Jalpaiguri) and `supreme-pipe-064` (raised letters, Raiganj). No homepage photo repeats another.

### The workshop film

The supplied day/night workshop films (`public/hero/workshop/`) are a visualisation and now lead the About page only, where a visitor-initiated theme change still plays the film in the matching direction and lands on the matching frame. The homepage shows the workshop through real site photography. The change belongs to the global theme, never to a slider, a scroll effect or a second section.

### The entry shutter

The workshop shutter intro plays once per browser session, and only when that session's first page is the homepage (`components/motion/EntryIntroScript.tsx`). Other pages never show it, and reaching the homepage later from another page does not either. It is a fixed overlay, so it causes no layout shift, and it never holds back the page under it: the first hero slide is preloaded at high fetch priority and painted at once beneath the shutter, the intro's own logo loads lazily at low priority, and the hero only moves (never fades or clips) once the shutter has cleared. Reduced motion skips it.

## Signature devices

- **Fascia plate.** The caption for a finished job is lettered on a plate the way a shop's name is: `--cerulean-deep` in both themes, cream lettering (`--night-ink`), the brand in display capitals, and a 3px gold (`--gold`) rule along the top edge, the logo's sweep. Used for the homepage examples and hero caption (desktop), the About page's client work, the photo viewer caption rule, and the WhatsApp method on Contact. Gold never carries text; text on gold uses `--signal-hot-ink`.
- **Shutter reveal.** Photographed jobs open like a shop shutter rolling up (`clip-path` from the bottom), once, as they enter the viewport. A light pass crosses lit work. Both are skipped for reduced motion.
- **Night street and paper.** Sections alternate between the paper and the night surface so the page reads as a street from day into evening. Lit photographs sit on the night surface.
- **No kickers.** Headings speak for themselves: no eyebrow labels and no numbered section labels above them. Numbers appear only where they carry a sequence (the three process steps).

## Photo viewer

`components/ui/Lightbox.tsx` is a dark room for one photograph: the image, a gold rule, the brand and trade, the photo's description, previous / count / next, and one gold action, "Ask about a sign like this". Every viewer that opens gallery photos (the portfolio and the service and regional gallery strips) passes each photo's public reference (gallery id, brand, trade and recorded place, `lib/project-reference.ts`), and the link opens WhatsApp with: "Hi AD JEET, I am interested in a sign like this example: <brand>, <label> (<id>). My shop is in ___. Can you help me choose?" The buyer edits it before sending. Next, previous and the trade filter always follow the photo on screen. A photo without a reference falls back to the general enquiry. The focus trap covers every link and button in the viewer; Escape closes it and focus returns to the photo that opened it. A WhatsApp click is a click, not a confirmed message or lead.

## Identity

- Use only the supplied original mark at `public/brand/adjeet-original.png`. Do not typeset, redraw, crop, or replace it.
- Display: Barlow Condensed 500/600 (`--font-heading`), self-hosted from `app/fonts/`. Cesura was requested by the owner; its webfont files have not been supplied, so it is not in the stack.
- Body and UI: Hind Siliguri 400/500. Do not reintroduce Anton or Inter.

## Palette

Defined in `design/tokens.css`; `design/fieldwork.css` holds the shared component colours. Dark mode redefines the semantic tokens.

| Role | Token | Light value |
| --- | --- | --- |
| Cream stock (page) | `--paper` | `#F6F0E3` |
| Raised cream | `--paper-elevated` | `#FBF7EE` |
| Marine ink | `--ink` | `#172229` |
| Logo cerulean | `--cerulean` | `#0099D0` |
| Deep cerulean (plates, the commission band) | `--cerulean-deep` | `#00729E` |
| Logo gold (the sweep) | `--gold` / `--signal-hot` | `#E9CF3F` |
| Night surface | `--night` | `#0D1B24` |

Never `#2446CC`, `#A4B5FF`, violet-leaning blues or pure white page backgrounds. Cerulean is a surface and a highlight; gold is the most important action and the sweep rule.

## Layout and interaction

- Design at 390px first; protect 320px widths, safe areas and 44px targets.
- Header: 80px on phones, 88px from tablet up, with the original logo, theme control and navigation. Do not add a second phone WhatsApp icon there.
- The full navigation and the menu button switch at the same 1024px breakpoint. The mobile drawer is portalled outside the fixed header, contains keyboard focus, closes on Escape and when the desktop layout takes over. Its links are plain names with an arrow, no numbers.
- The mobile enquiry dock appears after the home hero, hides while any in-page enquiry button is on screen, and is absent on Contact.
- Chat stays a desktop option so it does not compete with the dock on phones.
- One strong primary action per section.
- Radius: every action button, filter chip and icon button uses `--radius-button`, which is **2px**: a nearly square corner, not a pill and not a circle. Photos are square-cornered.
- Sections must not become equal-sized card grids, icon-in-circle feature rows, gradient blobs or glass panels.
- Respect `prefers-reduced-motion`: no shutter, no reveals, the hero slideshow holds its first photo, and theme changes switch the workshop stills without the film.

## Content rules

- Coverage places and the founding year come from `lib/coverage.ts`. Every place is treated equally: no per-place project counts, grades or evidence badges.
- The gallery is evidence. Do not add generated work to `content/gallery.ts` or alter its publication gates. Photos are used as photographed; cropping out a camera watermark is fine, AI-retouched or upscaled copies are not.
- Generated imagery (the workshop film, the LED-letter bench image in `public/images/home/`) is labelled as a visualisation and never presented as a completed client project. It is not on the homepage.
- No prices, rupee figures, response-time promises, site-visit promises, capacities, client counts, or places and dates the gallery cannot confirm.
- Preserve the lead form, WhatsApp, telephone, email, analytics, routing and structured-data behaviour.

## Source of detail

`PRODUCT.md` holds the product truth. The September build notes and logo verification are in `design/brand-direction-2026-09-07/`; their generated-hero material is historical exploration. The storefront strategy behind this homepage is the 28 September 2026 CEO review ("The practical strategy" and "D3.1").
