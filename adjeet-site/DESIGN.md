# AD-JEET design system

Updated 15 November 2026 (inner pages brought to the homepage's standard; the home hero became the labelled visualisation "The one lit sign", by day and by night). The former cobalt showroom, the detached day/night comparison slider or animation, and childish map pins were rejected and are not a source of design direction.

## The world

A North Bengal market street, read shop by shop. The site is built from what a sign maker actually makes: painted and lit shopfronts, fascia boards, aluminium, acrylic, LED letters and the workshop that fabricates them. Real photographs carry it, from the section after the home hero onwards. The brand is the supplied logo: cerulean serif lettering, the small monogram and Since 1990 panel, and the gold sweep under the name.

Brand personality: **Established. Hands-on. Luminous.**

## Homepage (storefront-led, 20 October 2026; hero changed 15 November 2026)

The homepage serves one buyer first: a local shop owner opening, replacing or improving a shopfront. It runs, top to bottom:

1. **Hero: "The one lit sign", a labelled visualisation and a clear offer** (`components/home/HomeHero.tsx` and `HeroArt.tsx`, chosen by the owner's side on 15 November 2026 from three rendered concepts, `output/hero-concepts-20261115/`). A small market street where every shop is shut except one, whose sign board is lit, and two people have stopped to look. It changes light with the site theme, in the same place: **light theme**, a misty morning after rain, on the cream (`--paper`, which is the day image's own sky), the H1 in `--ink`, "noticed." in `--signal-text`, the line under it in the muted ink; **dark theme**, the same street at night after rain, on the night image's own sky colour (`#051523` on phones, `#02121B` on desktop, the only colours outside `design/tokens.css`), the H1 in `--night-ink`, "noticed." in `--gold`. The two scenes are edits of one picture with the same camera and board, so one board rectangle serves both. The board in the artwork is blank; the words "Your shop name" are decorative HTML set on it (`aria-hidden`, sized in container query units so they stay on the board), dark in both themes. It is full-bleed: on phones and tablets the tall cut (941 x 1672) spans the full width and its sky is the page ground; on desktop (1024px and up, at least 5:4 landscape) the wide cut (1672 x 941) is as tall as the hero and pinned right, the street running off to the left under the headline. By day the left of the wide cut is pale mist, so on desktop the cream is carried in over it from the left edge (a wash that fades out at night) and the copy reads on cream. The hero is the small viewport height (at least 560px), and its sizes follow it (`cqw`, `cqh`): on a short phone the artwork rises so the gold button stays on the wet road below the two figures. The H1 stays "Sign boards that get you noticed." in three lines, with one line under it: "Sign board makers in Siliguri, since 1990." Both, and the board lettering, are set in **Outfit** (see "Identity"). The gold WhatsApp action (`QuoteCTA source="hero"`) is the same in both themes, pinned to the bottom of the first phone screen with a square arrow link to `#selected-work` beside it, and lifts (with the artwork) to stay above the consent banner while that shows. On desktop the action and "See finished shopfronts" sit low on the left, above the four main trades (glow sign boards, ACP and LED signage, flex printing, vehicle branding), clear of the chat button. A small "Visualisation" label sits on the artwork (bottom left on phones, bottom right on desktop; by day on a faint cream backing so it reads on the wet road). Real project photographs start in the next section; the hero never claims to be a client's job. The rotating shopfront photos that led the hero from 20 October to 15 November 2026 left it.

   **Switching and loading.** Before any script the scene follows `data-theme` (set before paint by ThemeScript), so the first paint is never the wrong scene. Only the visitor's scene is fetched during the load: both images are `loading="lazy"` and the other scene is `display: none`, and an inline script in the hero preloads the right one at high priority for the theme and screen. Once the page is idle, or as soon as the theme toggle is hovered or focused, the other scene is laid out invisibly so it loads. On a theme change the incoming scene is decoded first, then `data-hero-light` on `<html>` moves and the images cross-fade over 700ms while the ground, the type and the header over the hero change over the same 700ms (registered colour properties); nothing moves or reflows. With reduced motion the change is immediate.
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

The workshop shutter intro plays once per browser session, and only when that session's first page is the homepage (`components/motion/EntryIntroScript.tsx`). Other pages never show it, and reaching the homepage later from another page does not either. It is a fixed overlay, so it causes no layout shift, and it never holds back the page under it: the hero artwork for the visitor's theme is preloaded at high fetch priority and painted at once beneath the shutter, the intro's own logo loads lazily at low priority, and the hero only moves (never fades or clips) once the shutter has cleared. Reduced motion skips it.

## Inner pages (15 November 2026)

Services, each service page, Areas, the town pages, Contact, About, Portfolio and For brands follow the homepage's standard, so a visitor moving off the homepage sees one design.

- **Masthead** (`components/street/PageMasthead.tsx`). The H1, a lead, then the actions. Nothing above the heading: the old "AD JEET /" meta row is gone. A fact it carried is kept in words: the portfolio lead opens with the true photo count, and each town page has a short line under the lead, "About N km from the workshop, in North Bengal." A town page passes its cover photograph as `media`: on phones it sits after the lead and before the actions; from 768px it takes its own column, capped at 600px.
- **Service page opening.** Breadcrumb, then the H1 with "in Siliguri & North Bengal", a one-line lead (the trade's tagline in sentence case), the photographed job on its fascia plate, the actions, and only then the longer description. That order puts the photograph inside the first screen at 390 x 844 and 360 x 640. From 768px the photo is a column of its own, at most 640px wide, 4:3.
- **Actions.** The first screen of every service, areas, town, contact, about, portfolio, services and for-brands page has one filled button: the gold WhatsApp button with the WhatsApp mark (`QuoteCTA tone="yellow"` or `WhatsAppLink` with `cta cta--yellow`), keeping each page's own tracked source. Beside it, the quiet second link (`.action-quiet`): "Or send the brief" to the page's own form (`#send-brief`), or "Or send a project brief" to /contact where the page has no form. About keeps "Follow our story" as its second link. The header's "Start a project" is outlined (`.cta--quiet`) so it never competes. No blue filled primary buttons.
- **Captions.** Every photograph of a finished job is captioned on the fascia plate (`components/street/FasciaCaption.tsx`, global `.fascia-plate`): the client in display capitals, then the trade and only the place and year `content/gallery.ts` records. Service and town openings, the photo strips, the portfolio grid, the services catalogue groups and About's brand work all use it. A visualisation keeps a plain label (`.visual-label`) and never gets the plate.
- **Photo strips** (`components/sections/GalleryStrip.tsx`) sit on the night surface, at most 288px per photo, each on its plate, with the heading in the display face.
- **Section headings** speak for themselves: no eyebrow labels anywhere on the inner pages. A short heading over a list ("Send us", "Every enquiry needs", "What to send") is an `h3` in the display face, not an upper-case label. Numbers stay only where they are a sequence (the four steps on /services and /areas, the rollout steps).
- **Photographs at honest sizes.** The gallery is phone photography of about 800 to 1600px. No photo is drawn much larger than it was taken: service and town openings are capped as above, strips at 288px, and the homepage's wide lead example (1600 x 800) is drawn at its own 2:1 shape across two thirds of the row from 1024px, about 830px, with its plate standing beside it.
- **Breadcrumbs** (`.page-breadcrumb`): one quiet line, each link a 44 x 44px target.

## Signature devices

- **Fascia plate.** The caption for a finished job is lettered on a plate the way a shop's name is: `--cerulean-deep` in both themes, cream lettering (`--night-ink`), the brand in display capitals, and a 3px gold (`--gold`) rule along the top edge, the logo's sweep. Used for the homepage examples, every finished-job photograph on the inner pages (see "Inner pages"), the photo viewer caption rule, and the WhatsApp method on Contact. Gold never carries text; text on gold uses `--signal-hot-ink`.
- **Shutter reveal.** Photographed jobs open like a shop shutter rolling up (`clip-path` from the bottom), once, as they enter the viewport. A light pass crosses lit work. Both are skipped for reduced motion.
- **Night street and paper.** Sections alternate between the paper and the night surface so the page reads as a street from day into evening. Lit photographs sit on the night surface.
- **No kickers.** Headings speak for themselves: no eyebrow labels and no numbered section labels above them, on the homepage or any inner page. Numbers appear only where they carry a sequence (the process steps).

## Photo viewer

`components/ui/Lightbox.tsx` is a dark room for one photograph: the image, a gold rule, the brand and trade, the photo's description, previous / count / next, and one gold action, "Ask about a sign like this". Every viewer that opens gallery photos (the portfolio and the service and regional gallery strips) passes each photo's public reference (gallery id, brand, trade and recorded place, `lib/project-reference.ts`), and the link opens WhatsApp with: "Hi AD JEET, I am interested in a sign like this example: <brand>, <label> (<id>). My shop is in ___. Can you help me choose?" The buyer edits it before sending. Next, previous and the trade filter always follow the photo on screen. A photo without a reference falls back to the general enquiry. The focus trap covers every link and button in the viewer; Escape closes it and focus returns to the photo that opened it. A WhatsApp click is a click, not a confirmed message or lead.

## Identity

- Use only the supplied original mark at `public/brand/adjeet-original.png`. Do not typeset, redraw, crop, or replace it.
- Display: Barlow Condensed 500/600 (`--font-heading`), self-hosted from `app/fonts/`. Cesura was requested by the owner; its webfont files have not been supplied, so it is not in the stack.
- Home hero only: Outfit 400/600/700 (`--font-outfit`, the face of the approved company profile), for the H1, the line under it and the board lettering. One self-hosted variable Latin file in `app/fonts/` with its OFL licence beside it, preloaded on the home route only. Everything else in the hero keeps the site's own type.
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
- **Home page header.** While the header is over the home hero there is no cream bar: the original logo (unaltered), the links and the buttons sit straight on the artwork, in marine ink on the day scene and in `--night-ink` with a gold focus ring on the night scene, changing with the hero. Once the hero has scrolled up past the header it is the usual cream header again (`components/Nav.tsx`, `.site-header--over-hero` in `design/fieldwork.css`). The server renders the home header as over the hero, so it is right before JavaScript runs; with JavaScript off it scrolls away with the hero instead of floating over the cream sections. Every other route keeps the usual header.
- The full navigation and the menu button switch at the same 1024px breakpoint. The mobile drawer is portalled outside the fixed header, contains keyboard focus, closes on Escape and when the desktop layout takes over. It reads as a short directory: page names in the display face at about 30px with an arrow, no numbers; the four main trades two to a row under Services with a short gold rule at their head; Areas we cover, For brands, Portfolio, About and Contact; then WhatsApp (gold) and Call side by side at the foot (stacked below 360px).
- The mobile enquiry dock appears after the home hero, hides while any in-page enquiry button is on screen, and is absent on Contact.
- Chat stays a desktop option so it does not compete with the dock on phones.
- **Consent banner.** On phones the message is held to two lines with a "More" control that opens the rest (keyboard focus on the policy link opens it too), and Decline and Accept share one row. From 768px the whole message sits beside the buttons. The banner publishes its height as `--consent-h`; the dock, the chat bubble and the home hero's pinned WhatsApp action clear it with a transform or `translate`, never by changing `bottom` or padding, so its arrival is not a layout shift. The hero's WhatsApp action stays above it at 390 x 844, 390 x 664 and 360 x 640.
- **Touch and type floors.** Every non-inline link and control is at least 44 x 44px on phones (breadcrumbs, footer Call, the comparison table's links, the enquiry form's tick boxes, which are drawn at 18px inside a 44px control). No visible text under 12px.
- **Landmarks.** Only `main`, the header and footer navigation and the breadcrumbs are landmarks; side blocks inside a page section are plain `div`s, never a nested `aside`.
- One strong primary action per section.
- Radius: every action button, filter chip and icon button uses `--radius-button`, which is **2px**: a nearly square corner, not a pill and not a circle. Photos are square-cornered.
- Sections must not become equal-sized card grids, icon-in-circle feature rows, gradient blobs or glass panels.
- Respect `prefers-reduced-motion`: no shutter, no reveals, the hero copy does not settle into place, and theme changes switch the workshop stills without the film and the hero's scenes without the cross-fade.

## Content rules

- Coverage places and the founding year come from `lib/coverage.ts`. Every place is treated equally: no per-place project counts, grades or evidence badges.
- The gallery is evidence. Do not add generated work to `content/gallery.ts` or alter its publication gates. Photos are used as photographed; cropping out a camera watermark is fine, AI-retouched or upscaled copies are not.
- Generated imagery (the home hero's street by day and by night, the workshop film, the LED-letter bench image in `public/images/home/`) is labelled as a visualisation and never presented as a completed client project. Since 15 November 2026 the homepage carries one piece of it, the hero (two scenes of one street), with its "Visualisation" label on the artwork; every image below the hero on the homepage is a real photograph.
- No prices, rupee figures, response-time promises, site-visit promises, capacities, client counts, or places and dates the gallery cannot confirm.
- Preserve the lead form, WhatsApp, telephone, email, analytics, routing and structured-data behaviour.

## Source of detail

`PRODUCT.md` holds the product truth. The September build notes and logo verification are in `design/brand-direction-2026-09-07/`; their generated-hero material is historical exploration. The concepts behind today's home hero, with the owner's brief, are in `output/hero-concepts-20261115/` (outside the app). The storefront strategy behind this homepage is the 28 September 2026 CEO review ("The practical strategy" and "D3.1").
