# Interactive coverage map

Status: approved 17 September 2026. Revised 18 September 2026. Replaces the static
`public/images/north-bengal-coverage.svg` on the homepage coverage section and the
About page.

## Revision, 18 September 2026

Three changes after seeing it built:

1. **Project evidence is off the map.** Grading each board by how many gallery
   photos could be pinned to it put "4 projects" beside "on route" and read as a
   league table of where the company has worked rather than where it goes. Every
   place is now described identically, by distance from the workshop. The
   evidence join and the service filter are gone with it, and `lib/coverage-evidence.ts`
   is replaced by `lib/coverage-places.ts`.
2. **The camera is locked.** Pulled back and swung round, the terrain showed as a
   square tile floating in empty space. The orbit range is now constrained so
   every reachable position keeps the model filling the frame, and the relief has
   a skirt walling its edges down to a base so it reads as a solid block rather
   than a sheet of paper.
3. **The reach is drawn.** Rings at 50, 100, 150 and 200km from the workshop, draped
   over the relief and labelled on the ground. Without them the map was a scatter
   of poles with nothing to say how far the vans travel, which is the one question
   a coverage map exists to answer.

The sections below describe the original design; where they disagree with this
revision, the revision wins.

## Why

The current map is a dead image. It is an `<img>` pointing at a generated SVG with 19 text
nodes and 10 circles, so it cannot respond to hover, to the day/night theme, or to the
service filters the rest of the site uses. It is also stranded on the rejected cobalt
palette (`#109fcc`, `#f1f36d`, `#f2f1e9`) rather than the cream and cerulean tokens in
`design/tokens.css`.

The geography underneath it is good. `design/coverage-geography.json` holds Natural Earth
Admin-1 polygons for Sikkim, West Bengal, Assam and Bihar, and
`design/generate-coverage-map.py` carries an exact equirectangular projection plus the
latitude and longitude of all nine labelled places. Only the delivery is dead.

## The concept

Pins are sign boards, not map markers: small hoardings standing off the terrain, because
that is what the company makes. In day mode they read as painted boards on cream relief.
In night mode the terrain drops to petrol and the signs light up in cerulean and gold.

## Decisions

| Decision | Choice | Reason |
| --- | --- | --- |
| Map engine | Bespoke SVG plus a Three.js terrain layer | Leaflet, MapLibre, Mapbox and Google all fetch tiles from an external origin, which `connect-src 'self'` in `next.config.ts` blocks. They also need a key, a bill, and look generic. |
| 3D gating | Desktop, on scroll into view | Phones and reduced-motion visitors stay on the fast 2D map. The heavy bundle never reaches the people least able to afford it. |
| Places without photos | Rendered, but unlit | Honest about what the gallery can confirm, and the map improves as photos get tagged. |
| Placement | Both existing spots | Home and About already share one image, so they share one component. |
| Chrome | Existing `components/ui` primitives | The shadcn substrate is already here (`@radix-ui/react-slot`, `cva`, `tailwind-merge`). No new design language. |

## Architecture

    components/coverage/
      CoverageMap.tsx          Shell. Owns state, renders flat, upgrades to 3D.
      CoverageMapFlat.tsx      Live 2D SVG. Real geometry, hover and tap.
      CoverageTerrain.tsx      3D scene. Dynamic import, never in the main bundle.
      CoverageSignpost.tsx     One sign board mesh with a billboarded label.
      CoveragePanel.tsx        Filter chips, detail card, quote button.
      useCoverageSelection.ts  Selected place, active service, 3D readiness.

`CoverageMapFlat` renders on the server and paints immediately. `CoverageTerrain` mounts
only when WebGL is present, the viewport is wide, and `prefers-reduced-motion` is unset.
Both take identical props, so the layers cannot disagree about what they show.

## Data

`lib/coverage.ts` remains the single source of truth for the coverage claim. Each entry
gains `lat`, `lon` and a `kind` of `hq`, `city`, `district` or `region`, using the
coordinates already present in `design/generate-coverage-map.py`.

`lib/coverage-evidence.ts` joins `content/gallery.ts` to places by `city` and `location`.
A photo attaches to a place only when the photo itself names that place, so the map
cannot claim a project the gallery does not confirm. This preserves the `DESIGN.md`
content rule that forbids exact locations the gallery cannot support.

Today that is 11 of 109 photos across about 10 places. The remaining coverage areas
render as unlit boards.

## Terrain pipeline

`scripts/build-coverage-terrain.mjs` runs once and commits its output. It does not run
at request time.

1. Fetch 16 terrarium DEM tiles at zoom 8 covering lon 87.0 to 90.6, lat 24.0 to 27.8,
   from the public keyless AWS elevation tile bucket.
2. Composite and downsample to 256 by 256, re-encoding in terrarium RGB.
3. Write `public/data/north-bengal-relief.png`, target under 150kb.
4. Emit simplified border polylines from `coverage-geography.json` as compact JSON.

Runtime fetches nothing external, so the strict CSP needs no change. The shader decodes
terrarium in the vertex stage and displaces a 256 segment plane on the GPU.

True relief across this span is about 2.4 percent of its width, so the scene applies
roughly 4x vertical exaggeration. The caption says so.

## The three layers

- Coverage: reach shading pulses outward from Siliguri across the surface.
- Evidence: selecting a board shows the real photos held for that place, filtered by the
  active service chip.
- Enquiry: the quote button routes to `/contact?city=<place>` and the lead form
  preselects that city. `COVERAGE_CITIES` in `lib/lead-schema.ts` already carries the
  valid values; places outside it map to `Other`.

## Accessibility and failure

The flat SVG is the accessible baseline. Every place is a real button, tab reachable and
arrow-key traversable, driving the same panel. The 3D layer is decorative and
`aria-hidden`. Absent WebGL, absent JS, reduced motion, or a narrow viewport all land on
the flat map with full functionality. Nothing is available only in 3D.

## Testing

- Unit: the evidence join never attaches a photo to a place the photo does not name.
- Unit: every coverage area maps to a valid `COVERAGE_CITIES` value or to `Other`.
- E2E: the flat map renders and selects with WebGL unavailable, and the quote button
  carries the chosen city into the enquiry form.

## Out of scope

Pan and zoom to street level, a dedicated `/coverage` route, and district-level polygon
shading. The Natural Earth file holds state boundaries only, so district shading would
need a new geometry source.
