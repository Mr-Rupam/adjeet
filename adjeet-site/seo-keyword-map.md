# AD JEET: search keyword map

Researched 15 September 2026. AEO and GEO research added 24 September 2026, below.

## How answer engines pick sources (24 September 2026)

"AEO" and "GEO" are labels for the same work as SEO, applied to answers written by AI. What the primary sources say:

- **Google (AI Overviews, AI Mode).** A page must be indexed and eligible for a snippet; there is no separate AI index. AI Mode runs several related searches for one question ("query fan-out") and cites pages from all of them. Google's AI optimization guide (updated 10 July 2026) says llms.txt files, special markup, chunking content and chasing mentions are not needed, and that what helps is unique, first-hand content, good images, crawlable pages and an up-to-date Business Profile. Search Console's Generative AI performance report (all sites since 31 August 2026, impressions only) shows AI Overview and AI Mode visibility. FAQ rich results were retired for all sites on 7 May 2026; the FAQ answers stay on the pages because people and assistants still read them.
- **ChatGPT.** Search results come only from sites that allow OAI-SearchBot (adjeet.in does). For local businesses it leans on Bing Places, directories, Facebook pages and editorial lists, and has no direct link to Google Business Profiles.
- **Microsoft Copilot and Bing.** Bing's guidance favours titles and H1s that say what the page delivers, specific headings, question and answer pairs, lists and comparison tables, facts in HTML rather than images, and measurable claims. Bing Webmaster Tools' AI Performance report shows which pages Copilot cites and for which "grounding queries". IndexNow tells Bing about changed pages within minutes.
- **Perplexity.** Weighs relevance, freshness and authority, and cites reviews in almost every local answer.
- **Local AI answers overall** (Whitespark 2026 survey): presence on "best of" lists, a page per service, mentions on industry and news sites, and reviews. For the Google map pack the primary Business Profile category matters most.

Live checks on 24 September 2026: every search and AI crawler tested (Googlebot, Bingbot, OAI-SearchBot, GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Applebot and others) gets a 200 from adjeet.in. Web search for "glow sign board makers Siliguri", "best sign board makers in Siliguri" and "AD JEET Siliguri" returned Justdial, IndiaMART, Sulekha, Aajjo and competitor pages, never adjeet.in. A separate business, "Adjeet Advertising Agency" of Bowbazar, Kolkata, has Justdial and IndiaMART listings and a YouTube channel; see `local-listing-kit.md`.

Sources: [Google AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features), [Search Console Generative AI reports](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports), [OpenAI crawlers](https://developers.openai.com/api/docs/bots), [Microsoft: optimizing content for AI search answers](https://about.ads.microsoft.com/en/blog/post/october-2025/optimizing-your-content-for-inclusion-in-ai-search-answers), [Bing AI Performance](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview), [IndexNow](https://www.indexnow.org/documentation), [Whitespark 2026 ranking factors](https://whitespark.ca/local-search-ranking-factors/), [Local Falcon on ChatGPT's local data](https://www.localfalcon.com/blog/chatgpt-local-search-data-sources-where-does-business-info-come-from). Sources: Google results for Siliguri signage queries, and the Justdial, IndiaMART and Sulekha category pages that rank for them. No keyword-volume tool was connected, so terms are ranked by how consistently directories and competitors build pages around them, not by measured search volume. Replace this ranking with Search Console query data once the site has 4 to 8 weeks of impressions.

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
- **Site name (2026-09-19):** the home page carries `WebSite` structured data naming the site "AD JEET", with "ADJEET" as the only alternate, so Google can print the brand above results instead of the bare domain. Source: `buildWebSiteJsonLd` in `lib/seo.ts`.

### 24 September 2026: discovery, entity and speed

- **IndexNow.** `public/<key>.txt` holds the key. `.github/workflows/indexnow.yml` runs `scripts/indexnow.mjs` after every successful production deploy and submits the sitemap URLs whose review date moved, so Bing (and through it Copilot and ChatGPT search) recrawls changed pages within minutes. Run the workflow by hand with "all" ticked to resubmit everything.
- **Honest dates.** `content/page-reviews.ts` is the one record of when each page's content was last reviewed. It feeds the sitemap `lastmod`, each page's `dateModified`, and the "Page reviewed" line on service and regional pages. Move a page's date only when its content changes.
- **Image sitemap.** Every project photograph is listed under the portfolio, each service page lists its own photographs, and a regional page lists only photos taken in its town.
- **Connected entity.** Every page now has a WebPage node (AboutPage, ContactPage or CollectionPage where it fits) that points to the site, the business and, on service and regional pages, its own Service node. The founder is one Person node on the About page, linked from the business. The business carries a `disambiguatingDescription` (Siliguri, 1990, Ranjit Das) to separate it from the Kolkata business with a similar name.
- **Comparison table.** "Glow sign board, ACP board or flex?" is a real HTML table on the services page and on the three compared service pages, and is repeated in llms.txt. Every cell restates facts the site already published; lead times are read from the service records. Source: `content/sign-comparison.ts`.
- **Mobile speed.** Fonts are Latin-only WOFF2 subsets (76KB for all four instead of 729KB). The Turnstile CAPTCHA, about 1MB that keeps polling, now loads only when a visitor nears the form, so most visitors to the 27 regional pages never download it. Google Analytics loads once the page is idle.

## Needs the owner (not code)

In order of impact, as of 24 September 2026. The website is ready; what holds AD JEET back now is off the website.

1. **Google Business Profile primary category: Sign shop.** It is the top map-pack factor and it was still "Advertising agency" when last seen. Add services, 10 to 20 project photos and the description from `local-listing-kit.md`.
2. **Reviews.** Zero reviews means no star rating in the map pack and nothing for AI assistants to quote. Use the WhatsApp request in `local-listing-kit.md` after every job.
3. **Bing Places**, imported from the Google profile. ChatGPT and Copilot read it.
4. **Justdial, IndiaMART, Sulekha and Aajjo listings.** These pages hold page one for every priority search, and AI answers to "best sign board makers in Siliguri" summarise them. Add each live URL to `sameAs` in `lib/seo.ts`.
5. **Search Console and Bing Webmaster Tools.** Submit `https://adjeet.in/sitemap.xml` in both, and request indexing for the home page and the glow sign, ACP and flex pages in Search Console's URL Inspection.
6. **A published price range.** "Glow sign board price in Siliguri" is the question buyers ask most, and assistants answer it with directory figures. A per-square-foot range confirmed by the owner, added to the pages, would let AD JEET's own figure be quoted. Nothing is published until the owner supplies it.
7. **Dated project evidence per town.** Add the town and date to more photographs in `content/gallery.ts`, and short write-ups of real jobs (client, town, size, material). First-hand detail is what Google's AI guidance says earns citations.

Earlier items, for the record:

1. **Address: fixed to match Google.** AD JEET already has an owner-managed Google Business Profile at the Patiram Jote workshop (Chowrangi More, Kalabagan Road, Siliguri 734010), category "Advertising agency", with 0 reviews. The website structured data now uses that exact address, its map pin, hours and Maps link. The office is shown as Platinum Square, Station Feeder Road, Siliguri 734005 (734001 was the Siliguri head office PIN and was wrong). Use the workshop address on every directory listing.
2. **Brand entity is weak off-site.** Apart from the Google listing, searching "AD JEET Siliguri" returns the actor Jeet and unrelated businesses, and no Justdial, IndiaMART or Sulekha listing was found. Change the Google primary category to "Sign shop", then create consistent Bing Places, Justdial and IndiaMART listings. Add each URL to `sameAs` in `lib/seo.ts`. See `local-listing-kit.md`.
3. **Reviews.** Ask repeat brand and local clients for Google reviews that mention the work ("glow sign board", "ACP board") and the town.
4. **Proof for Gangtok and district pages.** Add dated project photographs per town to `content/gallery.ts` as they are confirmed, so the regional guides carry local evidence.
5. **Bengali and Hindi queries** (for example "সাইন বোর্ড শিলিগুড়ি", "साइन बोर्ड सिलीगुड़ी") appear in directory titles. Consider a Bengali version of the home and glow sign pages after Search Console shows demand.
6. **Recrawl the home page.** Google shows the site name and the AJ icon only after it reprocesses the home page, which can take weeks for a domain first live on 5 September 2026. In Search Console, run URL Inspection on `https://adjeet.in/` and request indexing after any change to either. **Update 24 September 2026:** Google's favicon service now returns the AJ mark for adjeet.in, so the icon has been picked up.

## How we will know it worked

Leading indicators, checked in Search Console after deployment and resubmitting the sitemap:
- Impressions for "glow sign board siliguri", "sign board siliguri", "acp sign board siliguri" and "flex printing siliguri" appear within 4 to 8 weeks.
- The two Gangtok URLs and the updated regional guides are indexed.
- WhatsApp clicks tagged `service:*` and `programmatic:*` in analytics increase.
- Bing Webmaster Tools AI Performance shows citations of adjeet.in pages.
- Results show "AD JEET" and the AJ icon above the adjeet.in link. Until Google has the icon, its copy at `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://adjeet.in&size=64` is a grey globe.

If impressions for the priority terms stay flat after 8 weeks while pages are indexed, the gap is off-site authority (items 2 and 3 above), not on-page copy.

AI visibility, added 24 September 2026:
- **Search Console, Generative AI performance report:** impressions in AI Overviews and AI Mode by page. Expect the services page and the glow sign, ACP and flex pages to appear first, since they carry the comparison table.
- **Bing Webmaster Tools, AI Performance:** Copilot citations per page and the grounding queries behind them. The Local intent filter shows the "near me" questions.
- **IndexNow:** each production deploy's run in GitHub Actions shows the URLs submitted and the response (200 or 202 is success).
- **Asking the assistants:** once a month, ask ChatGPT, Gemini, Copilot and Perplexity "best sign board makers in Siliguri" and "who makes glow sign boards in Siliguri", and note whether AD JEET is named and which source is cited. Expect this to move only after the listings and reviews above exist.
