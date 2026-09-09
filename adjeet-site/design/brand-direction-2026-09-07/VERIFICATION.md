# Design reference verification

7 September 2026. Evidence applies to the isolated visual reference, not the production Next.js application.

## Results

| Check | Result | Evidence |
|---|---|---|
| Original logo file | SHA-256 matches the user-supplied original | asset-manifest.json |
| Rendered logo proportions | No distorted instances in tested layouts | verification.json |
| Responsive layouts | 112 combinations: eight templates × seven widths × two themes; no horizontal overflow, broken-image reports or browser errors | verification.json |
| Widths | 320, 360, 390, 430, 768, 1024 and 1440px, at 844px viewport height | verification.json |
| Hero action | Inside the tested opening viewport at all seven widths, both themes | verification.json |
| Solid-surface text pairs | All eight checked pairs meet 4.5:1; lowest 4.65:1 | design-tokens.json |
| Photo-background text | Conservative sampled bounding-box checks pass at 320, 390 and 1440px, both themes | verification.json |
| Normal theme motion | 0.8s opacity transition, intermediate opacity observed, night ends at 1, day returns to 0; logo geometry unchanged | final-checks.json |
| Reduced motion | Immediate switch, transition duration 0s | verification.json |
| Menu | Opens, Escape closes | verification.json |
| Portfolio filter | Vehicles shows one matching source project | verification.json |
| Form demonstration | Clearly labelled confirmation appears; zero POST requests | verification.json |
| Review links | All 17 unique review links return HTTP 200 | final-checks.json |
| Existing page audit | Local preview captured read-only | audit/ |

Photographic contrast was sampled from screenshots with the text temporarily hidden, then compared against the intended foreground colour. Sampling every three pixels across each text box is a conservative screening method, not a complete accessibility certification or proof for every possible viewport.

## Visual corrections made

- Restored height auto on original-logo images after a first render exposed distortion.
- Widened the desktop hero action to avoid label wrapping.
- Added deeper ink on the cyan enquiry surface.
- Strengthened only the lower daylight scrim after photographic contrast checks found weak areas on the shutter.
- Moved the contact form above address details on phones.
- Recomposed the miniature study so the full scene is visible and copy does not cover it.
- Excluded the floating enquiry dock from full-page export images so it does not appear as a duplicated content row.

## Practical limits

Chromium desktop automation and responsive viewport emulation were used. No real phone, Safari, production lead submission or production performance test is claimed. TTF fonts and extra image loading support convenient review; production needs the loading strategy in the handoff.

The working tree already contained the rejected implementation and other untracked files. This pass added PRODUCT.md and design/brand-direction-2026-09-07. It did not modify the production app, delete previous work, commit, push or deploy.
