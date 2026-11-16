# Client logo sources

Downloaded and checked 25 September 2026 for the homepage client history. Most images in `public/client-logos/` are local, lossless WebP conversions of the source artwork; the complete Emami mark and Dalmia's current mark are original PNGs. They identify brands in AD JEET's existing client list; they do not imply an endorsement. Work attributed to a national brand may have been commissioned through a regional agency. The logo cards are static; project photographs appear together in the portfolio.

The two client boards (the home page and `/for-brands`) used to carry a line saying that selected history includes assignments through regional agencies. The owner had it removed from both on 16 November 2026. This file keeps the fact; the pages do not state it, and the home page and `/for-brands` tests fail if the line returns.

| Brand | Artwork source |
| --- | --- |
| Airtel | [Airtel official logo downloads](https://www.airtel.in/logo-tune), horizontal red text version |
| Supreme Pipe | [Supreme Industries logo on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Supreme_Industries_logo.svg) |
| Havells | [Havells logo on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Havells_Logo.svg), cross-checked with [Havells' current site header](https://havells.com/media/logo/stores/1/Havells_Logo.svg) |
| Star Cement | [Star Cement official logo](https://www.starcement.co.in/star-cement-logo.svg) |
| SRMB | [SRMB official site logo](https://www.srmbsteel.com/assets/images/logo.png); fetched again 16 November 2026: the same 105 x 32 PNG, no larger file |
| Shyam Steel | [Shyam Steel official site logo](https://shyamsteel.com/wp-content/uploads/2026/02/ssil-logo4.jpg) |
| Emami | [Emami Limited's 2025 logo change filing](https://www.emamiltd.in/wp-content/uploads/2025/07/31002924/final-logo-change-intimation-pr-300725.pdf), complete embedded Emami Group logo from the press-release page |
| OYO | [OYO Rooms logo on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:OYO_Rooms_logo.png) |
| Dalmia Cement | [Dalmia Bharat's current blue Group logo](https://www.dalmiabharat.com/wp-content/uploads/2026/05/dbg-new-logo-blue.png), introduced in 2026 and shown on its official site |
| Jio | [Reliance Jio logo on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Reliance_Jio_Logo.svg), cross-checked with [Jio's current site logo](https://jep-asset.akamaized.net/jio/svg-og/jio_logo.png) |
| Vivo | [Vivo 2019 logo on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Vivo_logo_2019.svg) |
| Toptech TMT | [TopTech official site logo](https://www.toptechtmt.com/assets/images/icTopTechLogo.png) |
| Captain TMT Bar | [Captain Steel official site logo](https://cdn.shopify.com/s/files/1/0614/6116/8277/files/captain-steel-new-logo_2751a29a-7c59-4dba-b221-f922e2b87035.jpg?v=1730272896) |
| Supershakti | [Super Shakti official site logo](https://supershakti.in/public/frontend/images/logo-dark.webp); fetched again 16 November 2026: the same 146 x 49 WebP, no larger file |
| Elegant TMT Bar | [Elegant Steel official site logo](https://www.elegantsteels.com/wp-content/uploads/2022/09/elegant-steel-logo.png) |
| Astral Pipe | [Astral Pipes official media file](https://www.astralpipes.com/wp-content/uploads/2026/01/astral-pipe-logo.png); fetched again 16 November 2026: the same 150 x 52 PNG, no larger file |
| SEL TMT | [SEL Tiger official site logo](https://www.seltigertmt.com/wp-content/uploads/2023/07/logo-new.png); fetched again 16 November 2026: the same 150 x 62 PNG, no larger file |
| Adani Cement | [Adani Group official site mark](https://www.adani.com/-/media/project/adaniv1/logo/adani-logo.svg); the site's photographed work is filed under ACC, an Adani Cement brand |
| Anchor | [Anchor by Panasonic official site logo](https://d32zxht0g2dn3w.cloudfront.net/s3fs-public/2024-02/New_Anchor_logo.png) |
| SD Lion TMT | [SD Lion official site logo](https://sdlionsteel.com/wp-content/uploads/2025/06/Sd-Lion-Logo-scaled.jpg) |
| Dish TV | [DishTV 2025 logo on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:DishTV_logo_%282025%29.svg) |

Current-version audit: all 21 source URLs were reachable on 25 September 2026. The Emami file was incomplete despite using the right 2025 identity, so it was replaced with the full image embedded in Emami's filing. Dalmia's former mark was replaced with its official 2026 identity. The remaining marks were checked against the linked official assets or current company sites; no newer official version was found. The Anchor source had blank space trimmed around the mark. Other WebP files were resized and converted without recolouring.

Cropped copies (16 November 2026, for the home film's brands wall): `airtel-trim.webp`, `emami-trim.png` and `star-cement-trim.webp` are the same artwork as `airtel.webp`, `emami.png` and `star-cement.webp` with the empty margin of the canvas cropped to a small even border, never into the mark, so the mark fills its board. No recolouring or redrawing; the originals are kept and still used elsewhere.

Downscaled copies (17 November 2026, to cut the home film's cold load and decode work): the brand wall's files larger than 400 x 160 px were resized in place to fit that box (about twice the largest board face they are drawn on), same artwork, format, name and shape, by `scripts/build-film-render-assets.mjs`. From: `havells.webp` 424 x 280, `lloyd.png` 700 x 203, `star-cement-trim.webp` 234 x 216, `airtel-trim.webp` 521 x 143, `supreme-pipe.webp` 660 x 213, `emami-trim.png` 506 x 457, `oyo.webp` 660 x 232, `dalmia-cement.png` 400 x 225, `toptech-tmt.webp` 660 x 185, `adani-cement.webp` 462 x 174, `sd-lion-tmt.webp` 517 x 280. `anchor.webp`, `vivo.webp` and `dish-tv.webp` were kept at their size because a smaller copy came out more bytes. `content/home-film.ts` and `content/for-brands.ts` keep the original sizes, which set each logo's shape and size caps.
