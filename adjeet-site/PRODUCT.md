# AD-JEET

## Register

brand

## Users

Two audiences, one voice: regional, zonal and trade marketing teams of brands, who need many outlets and walls done right and reported, and local businesses, who need one shopfront done well. Lead with the agency; never lose the shop owner. Most visitors use phones. Design for someone checking the business on the street or between shop-floor tasks, often with one hand and a variable mobile connection.

## Product Purpose

Turn interest into a useful enquiry on WhatsApp or through the contact form. Establish AD JEET as what it is: an advertising agency in Siliguri, at work since 1990, doing outdoor advertising, signage and brand rollouts across North Bengal and Sikkim, made at its own workshop and put up by its own crews. One agency from artwork to installation; brands stay for years. Figures come only from `content/company-figures.ts` (see DESIGN.md, "Content rules"). Preserve the existing contact destinations, lead pipeline, and factual coverage sources.

## Brand Personality

Established. Hands-on. Luminous.

The physical world is painted shopfronts, fabricated sign cabinets, aluminium, acrylic, wiring, workshop shutters, and the North Bengal street after dark. The company has an existing identity. Digital design must express it, not replace it.

## Controlling Brand Asset

The user supplied `C:/Users/KIIT0001/Downloads/ADJEET/adjeet/logo.png.png` on 7 September 2026. This original is the source of truth: blue/cyan serif AD-JEET lettering, the small monogram and Since 1990 panel, and the yellow sweep. Keep its proportions, lettering, details, and colors. Never typeset an alternative wordmark. Use the original in every branded visualization and the actual website header.

## Explicit User Corrections

- 7 September design revision: remove the desktop hamburger, replace the hero's bounded shape with a smooth gradient cushion, rebuild "The details hold the light" into a useful project-process section with a new generated image, and use Cesura with Pristina accents. Exact Cesura webfont files remain pending; the CSS stack records this rather than claiming the fallback is Cesura.
- The hero background itself changes between day and night when the site theme changes.
- The hero uses the supplied real-workshop films: the first frame of `ad_jeet_day_to_night_physics_v2.mp4` is the light state, the first frame of `ad_jeet_night_to_day_physics_v2.mp4` is the dark state, and a visitor-initiated theme change plays the supplied film in the matching direction. Do not use a generated hero, alternate logo overlay, or a separate animation control.
- Day/night is not a separate comparison section, an independent slider, or a scroll-triggered time-of-day effect.
- The previous cobalt showroom design, substitute wordmark, and detached hero artwork were rejected.
- 15 November 2026: the owner's side chose a labelled visualisation as the home page hero ("The one lit sign": a market street after rain where one shop's sign board is lit, with "Your shop name" set on the board in HTML). It has a day scene for the light theme and a night scene for the dark theme, and changes light in the same place when the theme changes (a cross-fade, never a slider or a second section), so principle 3 below holds for the home page again. This supersedes "Do not use a generated hero" above for the home page; the two bullets above it about the workshop films now describe the About page, where those films live. Real project photographs start in the section straight after the hero. Generated imagery is still never presented as a client's job: its description (alt text) begins "Visualisation:". Since 16 November 2026 (owner's side) concept scenes carry no visible label; they are identified in their alt text and are never presented as client work. On the home page the header has no cream bar while it is over the hero (the original logo, links and buttons sit on the artwork) and becomes the usual header once the page scrolls past it; other pages keep the usual header.
- The user subsequently authorised local implementation. This checkout now builds the direction while preserving existing routes, lead handling, analytics, and publication gates. It does not deploy, publish, push, or submit leads.
- The redesign covers the whole website and starts with mobile compositions, rather than shrinking a desktop layout.

## Anti-references

The rejected `components/home/` design: enormous cobalt Anton headline beside a boxed fictional sign, metric strip, and a separate lighting demonstration. Generic SaaS card grids, visual-effects galleries, substitute logos, arbitrary technology-themed palettes, desktop hover interactions required to discover content, and long preliminary copy before the work appears.

## Design Principles

1. Show the actual workshop through one memorable, credible physical scene.
2. Let the existing logo determine the color relationships and character.
3. Make theme switching a change of light in the same place. Preserve geometry and reading position.
4. Give mobile visitors an obvious enquiry action and immediately understandable work examples.
5. Keep generated material visualizations separate from evidence of completed client projects, and identify them as visualisations in their alt text (since 16 November 2026 no visible label, the home hero included).
6. Make the design specific enough that the implementation model follows decisions rather than inventing another visual language.

## Accessibility & Inclusion

WCAG AA contrast for interface text, at least 44px touch targets, visible keyboard focus, reduced-motion alternatives, readable 16px primary body copy, and no hover-only functions. The hero must remain useful before JavaScript or the alternate video loads. Avoid mandatory WebGL, sensor permissions, and large image sequences on mobile.

## Status

On 25 September 2026, the mobile and tablet homepage hero was rebuilt around the documented Ambuja Cement installation, so the work and WhatsApp action appear in the opening screen. The workshop film remains in its later homepage section and retains the global day/night theme behaviour. On 27 September 2026 the hero became a slideshow of installations, still opening on Ambuja. On 15 November 2026 the slideshow left the hero for the labelled day and night visualisation described above, and the real installations now start in the section after it. `DESIGN.md` records the current hero; `design/brand-direction-2026-09-07/` retains the earlier visual exploration and source-asset verification.
