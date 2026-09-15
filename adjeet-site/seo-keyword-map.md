# AD JEET: search keyword map

Researched 15 September 2026. Sources: Google results for Siliguri signage queries, and the Justdial, IndiaMART and Sulekha category pages that rank for them. No keyword-volume tool was connected, so terms are ranked by how consistently directories and competitors build pages around them, not by measured search volume. Replace this ranking with Search Console query data once the site has 4 to 8 weeks of impressions.

## How Siliguri buyers search

Buyers search for the **object** ("sign board", "glow sign board", "LED board", "flex") plus the **town**, not for "signage solutions". Justdial and IndiaMART own most of page one for these terms, and competitor sites (Digi-Sign, Sign o Craft, Signocraft, Bansal Graphics, Believe Sign) name "North Bengal, Sikkim" as their service area. Price-led queries ("glow sign board price", "per sq ft") are common, because directory listings show rates per square foot.

## Keyword to page map

| Priority | Search terms | Page |
| --- | --- | --- |
| 1 | sign board makers in Siliguri, signage company Siliguri, sign board shop Siliguri | Home `/` |
| 1 | glow sign board Siliguri, LED sign board Siliguri, glow sign board price, shop name board | `/services/glow-sign-boards` |
| 1 | ACP sign board Siliguri, 3D LED letter board, acrylic 3D letters, ACP elevation | `/services/acp-led-signage` |
| 1 | flex printing Siliguri, flex banner printing, hoarding printing Siliguri, star flex | `/services/flex-printing` |
| 2 | vehicle branding Siliguri, van wrap, e-rickshaw / auto branding | `/services/vehicle-branding` |
| 2 | glow sign board / ACP sign board in Jalpaiguri, Cooch Behar, Darjeeling, Malda | Regional guides `/<service>-in-<city>` |
| 2 | sign board Gangtok, ACP signage Gangtok (few competitors rank) | `/glow-sign-board-in-gangtok`, `/acp-led-signage-in-gangtok` |
| 2 | Durga Puja gate branding, pandal branding Siliguri | `/services/events-and-puja` |
| 3 | wall painting advertising North Bengal, wall writing | `/services/wall-painting` |
| 3 | F-pole sign, pole sign board | `/services/f-pole-installation` |
| 3 | retail / dealer outlet branding, in-shop branding | `/services/in-shop-branding` |
| 3 | one way vision sticker Siliguri, glass film branding | `/services/one-way-vision` |
| 3 | POP display, standee, shelf talker Siliguri | `/services/product-display` |

Not targeted: "hoarding advertising Siliguri" (media-space rental, sold by Media Ant and OOH agencies, not fabrication), "LED board repair" and "neon sign" (not documented AD JEET services). Add pages only if the owner confirms the service.

## What changed on the site

- Titles and descriptions use the buyer phrase: "Sign Board Makers & Outdoor Advertising in Siliguri", "Glow Sign Board & LED Sign Board Makers in Siliguri", and so on. Source: `content/service-search.ts`.
- **AEO:** every service page opens with a question and a short, quotable answer, plus its local alternate names. New buyer questions on price basis, glow sign vs ACP vs 3D letters, frontlit vs blockout flex, hoarding flex, e-rickshaw branding and Puja gates. The home FAQ adds "What is AD JEET?", sign board cost, which board suits a shop, and lead times. All answers are visible in HTML and match the FAQ markup.
- **Regional guides:** titles use the singular searched phrase ("Glow Sign Board in Jalpaiguri"). Each guide names nearby towns (Mal Bazar, Dinhata, Kurseong, Rangpo and others), and opens with a local "Can AD JEET handle ... in <city>?" answer. Two Gangtok guides added (42 sitemap URLs).
- **GEO:** the LocalBusiness entity now carries `alternateName` (ADJEET, AD-JEET), `knowsAbout` and an `OfferCatalog` linking every service. Service entities carry `alternateName` and the quotable answer. `llms.txt` now has a one-line entity definition, services with definitions and alternate names, regional guides, and the home FAQ.
- Sikkim added to coverage, and Gangtok to the enquiry form, based on the 2025 company profile. SD Lion TMT and Dish TV added to the client list, from the same profile.

## Needs the owner (not code)

1. **Address: fixed to match Google.** AD JEET already has an owner-managed Google Business Profile at the Patiram Jote workshop (Chowrangi More, Kalabagan Road, Siliguri 734010), category "Advertising agency", with 0 reviews. The website structured data now uses that exact address, its map pin, hours and Maps link. The office is shown as Platinum Square, Station Feeder Road, Siliguri 734005 (734001 was the Siliguri head office PIN and was wrong). Use the workshop address on every directory listing.
2. **Brand entity is weak off-site.** Apart from the Google listing, searching "AD JEET Siliguri" returns the actor Jeet and unrelated businesses, and no Justdial, IndiaMART or Sulekha listing was found. Change the Google primary category to "Sign shop", then create consistent Bing Places, Justdial and IndiaMART listings. Add each URL to `sameAs` in `lib/seo.ts`. See `local-listing-kit.md`.
3. **Reviews.** Ask repeat brand and local clients for Google reviews that mention the work ("glow sign board", "ACP board") and the town.
4. **Proof for Gangtok and district pages.** Add dated project photographs per town to `content/gallery.ts` as they are confirmed, so the regional guides carry local evidence.
5. **Bengali and Hindi queries** (for example "সাইন বোর্ড শিলিগুড়ি", "साइन बोर्ड सिलीगुड़ी") appear in directory titles. Consider a Bengali version of the home and glow sign pages after Search Console shows demand.

## How we will know it worked

Leading indicators, checked in Search Console after deployment and resubmitting the sitemap:
- Impressions for "glow sign board siliguri", "sign board siliguri", "acp sign board siliguri" and "flex printing siliguri" appear within 4 to 8 weeks.
- The two Gangtok URLs and the updated regional guides are indexed.
- WhatsApp clicks tagged `service:*` and `programmatic:*` in analytics increase.
- Bing Webmaster Tools AI Performance shows citations of adjeet.in pages.

If impressions for the priority terms stay flat after 8 weeks while pages are indexed, the gap is off-site authority (items 2 and 3 above), not on-page copy.
