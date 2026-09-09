# AD-JEET design system

Updated 7 September 2026. The former cobalt showroom and detached day/night comparison were rejected and are not a source of design direction.

## The idea

AD-JEET is an established, hands-on, luminous sign maker. The site opens with the supplied real workshop footage. Light and dark use the first frame from the matching owner-supplied film. A visitor-initiated theme change plays the corresponding day-to-night or night-to-day film, then lands on that target frame. The change belongs to the global theme, not to a slider, a scroll effect, or a second section.

The production hero assets are `public/hero/workshop/day.webp`, `night.webp`, `day-to-night.mp4`, and `night-to-day.mp4`. The earlier generated hero plates are archival only and must not return to the production homepage.

The rest of the site earns trust through documented project photography, clear service paths, and a WhatsApp or form enquiry. Generated imagery is labelled as a visual or material concept and is never presented as a completed client project.

## Identity

- Use only the supplied original mark at `public/brand/adjeet-original.png`. Do not typeset, redraw, crop, or replace it.
- Brand personality: **Established. Hands-on. Luminous.**
- Display: Barlow Condensed 500/600.
- Body and UI: Hind Siliguri 400/500.
- Local font files live in `app/fonts/`; do not reintroduce Anton or Inter.

## Palette

| Role | Token | Value |
| --- | --- | --- |
| Workshop chalk | `--paper` | `#F2F1E9` |
| Reading ink | `--ink` | `#12333B` |
| Sign cyan | `--signal` | `#109FCC` |
| Yellow sweep | `--signal-hot` | `#F1F36D` |
| After-hours petrol | `--night` | `#0A222A` |

Semantic values change in dark mode in `design/tokens.css`. Use tokens rather than adding another visual palette. Cyan is a surface and highlight; yellow is for the most important action. Text on cyan and yellow uses `--signal-ink`.

## Layout and interaction

- Design at 390px first; protect 320px widths, safe areas, and 44px targets.
- Header is 80px on phones and 88px from tablet upward. It contains the original logo, theme control, and navigation. Do not add a second phone WhatsApp icon there.
- The mobile enquiry dock appears after the home hero, and is hidden on Contact where direct methods and the form already lead.
- Chat remains a desktop option only so it does not compete with the enquiry dock on phones.
- Use one strong primary action per section. Buttons may be rounded, photos can have quiet rounded crops, and sections should not become equal-sized cards.
- Respect `prefers-reduced-motion`. Hero frames switch immediately in reduced-motion mode; do not play the film.

## Content rules

- Coverage places and founding year come from `lib/coverage.ts`.
- The gallery is evidence. Do not add generated work to `content/gallery.ts` or alter publication gates.
- Do not claim unverified client counts, response times, site-visit promises, capacities, customer history, or exact locations/dates that the gallery cannot confirm.
- Preserve existing lead form, WhatsApp, telephone, email, analytics, routing, and structured-data behaviour.

## Source of detail

The build notes, source logo verification, and acceptance checklist are in `design/brand-direction-2026-09-07/`. Its earlier generated-hero material is historical exploration. `PRODUCT.md` and the latest user request override it.
