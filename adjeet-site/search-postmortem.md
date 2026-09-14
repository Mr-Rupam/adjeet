# AD JEET: search and conversion postmortem

Review: 14 September 2026. Scope: local implementation and read-only inspection of adjeet.in. Deployment and search-console changes are not part of this run.

The previous review concentrated on appearance, responsive layouts and working interactions. It did not adequately test the business identity, search publishing rules or what a visitor receives before JavaScript runs. That allowed a visually complete redesign to carry avoidable discovery and conversion defects.

## Findings and repairs

| Priority | Flaw | Repair |
| --- | --- | --- |
| High | The transparent footer PNG had a white CSS background. | Removed the backing and padding; retained the original logo, proportions and colours. |
| High | “Built to be seen” did not explain the service or location. | Homepage H1 now reads “Signage & outdoor advertising in Siliguri.” Supporting copy names glow signs, ACP/LED, flex printing and vehicle branding. Other page headings identify the work, company or enquiry purpose. |
| High | Seven core services were noindex solely because they lacked a gallery photo. | Removed photography as an indexing requirement. All ten services now provide indexable descriptions, specifications and buyer questions. |
| High | Static service pages shipped a loading skeleton, with the real content in a hidden streamed fragment. | Removed the unnecessary loading boundary. The audit requires the H1 and answers inside the initial main content, without running scripts. |
| High | FAQ answers were inserted only after interaction; regional FAQ markup had no corresponding visible answer section. | Native disclosure controls retain all answers in HTML and work without JavaScript. The same FAQ records generate the visible answers and structured data. |
| High | The AI reading file gave the wrong founder and email; the chatbot also gave the wrong email. | Central business record: Ranjit Das, founded 1990, ranjitadjeet@gmail.com, +91 98320 11524, Siliguri office/workshop. Contact details, footer, chatbot, schema and the generated reading aid use these records. |
| High | Regional copy asserted undocumented installation counts, fixed transport runs, warranties and local experience. | Replaced the 25 existing regional pages with service-area introductions and individual project-brief guidance. Removed fabricated metrics and blanket scheduling claims. These pages describe service availability from Siliguri, not local branches. |
| High | Service copy made blanket warranty, paint-safety, capacity and engineering claims. | Replaced these with component- and site-specific information to confirm in the project quote. Existing lead-time ranges are labelled planning estimates. |
| Medium | Social titles/URLs inherited the homepage; some public titles repeated the brand. | Shared metadata helper supplies each canonical page with its own title, description, canonical URL, Open Graph and Twitter values. Uses a supplied installation image for sharing. |
| Medium | Schema created anonymous service providers and included an unverified precise map pin. | One stable business ID is referenced by every service. Regional Service entities use the actual page URL and service area. Removed the unverified coordinates. |
| Medium | Sitemap omitted useful services while including the noindex privacy page. | Sitemap includes 40 reviewed canonical marketing/service/regional URLs; excludes privacy and the optional reading aid. Uses the explicit content-review date, not the build date. |
| Medium | Important services and regional guides were weakly connected. | Added direct service links from home and city guide links from the corresponding service pages. Crawl audit verifies every sitemap URL is reachable from home. |
| Medium | Portfolio photos depended on a client-only loading fallback. | Portfolio renders on the server for the incoming request, preserving URL filters and returning actual project photographs in HTML. |
| Medium | Airtel wall painting and an Anchor/Panasonic Puja entrance were labelled glow signs. | Corrected the service classifications and descriptive alternative text against the supplied images. |
| High | A missing production CAPTCHA key left a fillable form that could not submit. | Show direct WhatsApp and call actions immediately when the form is unavailable; keep the configured form pipeline intact. |

## SEO, AEO and GEO approach

The work improves crawlability, clear service/location language, internal links, useful answers and consistent business facts. Google says its existing SEO practices apply to AI Overviews and AI Mode; no special AI file or schema is required. Structured data should match visible content. The existing llms.txt is corrected as an optional reading aid, not treated as a ranking mechanism. [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features).

The existing wildcard robots rule allows search crawlers. Googlebot, Bingbot and OAI-SearchBot user-agent requests are checked against the local build. These checks do not impersonate the crawlers' production IP ranges or prove indexing. OpenAI distinguishes OAI-SearchBot for search from GPTBot for model training. [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots).

## Verification

- Production build and TypeScript: passed. Core service/regional pages are prerendered; the portfolio returns request-specific HTML for its URL filters.
- Lint: full run passed; final changed gallery, portfolio, audit and test files passed again. `git diff --check` passed.
- Unit tests: 165 passed across 24 files. The 17 gallery/publication/search-contract tests passed again after the last photo-classification change.
- Browser regressions: 34 passed against the production preview. Two additional development-preview tests passed with the CAPTCHA widget and lead endpoint mocked, covering invalid fields, pending delivery, success, and server failure with form-data preservation.
- Crawl: 40 canonical URLs return 200 with unique brand titles, matching Open Graph/Twitter metadata, consistent business data and FAQ text present in the main HTML. Every sitemap URL is reachable from the homepage. Six Googlebot/Bingbot/OAI-SearchBot user-agent requests passed.
- Visual review: 34 page/theme/viewport combinations, zero horizontal overflow or JavaScript page errors. Footer transparency was checked in the browser and against the PNG alpha channel; the original artwork remains intact. Screenshots include home, footer, FAQs, services, regional detail, About, portfolio and contact.
- Accessibility: 16 automated WCAG A/AA checks, zero reported violations. Native home/service/regional FAQs and portfolio photographs were also checked with JavaScript disabled. Automated checks do not establish complete WCAG conformance.
- The local production build has no CAPTCHA site key or chat API key. The contact page now offers its verified direct-contact fallback. Actual lead delivery and live AI responses were not tested; no real enquiry or chat message was submitted.

Evidence: [crawl, visual and accessibility results](C:/Users/KIIT0001/Downloads/AD_JEET/output/search-postmortem-20260914/verified-final/audit.json), [production browser log](C:/Users/KIIT0001/Downloads/AD_JEET/output/search-postmortem-20260914/e2e-production.log), [mocked form log](C:/Users/KIIT0001/Downloads/AD_JEET/output/search-postmortem-20260914/e2e-form.log), [final lint log](C:/Users/KIIT0001/Downloads/AD_JEET/output/search-postmortem-20260914/lint-final.log).

Reproduce the crawl and screenshots from adjeet-site: `node scripts/search-audit.mjs http://localhost:3100 new-review-folder`. Use a fresh output folder for each run. The audit checks metadata, content/schema agreement, internal reachability, direct-contact fallback, responsive layout, accessibility and no-JavaScript access.

The live pre-change inspection confirmed that /services/flex-printing returned noindex, follow and /llms.txt published the wrong founder and email. These changes remain local until deployed. Saved evidence: output/search-postmortem-20260914/live-before.json.

## Work needed to grow after deployment

1. Deploy the reviewed build, then inspect representative homepage, service, regional and portfolio URLs in Google Search Console and Bing Webmaster Tools. Submit the corrected sitemap and check actual indexing rather than assuming an allowed page is indexed.
2. Complete and reconcile the real Google Business Profile and Bing Places listing: correct business name, office address, phone, service categories, hours and service areas. Confirm the precise map pin before adding coordinates to schema. Google identifies relevance, distance and prominence as local-ranking factors. [Google local-ranking guidance](https://support.google.com/business/answer/7091?hl=en).
3. Obtain confirmed details for the supplied projects: actual town, installation date, brief, dimensions, material, scope and client permission. The inherited gallery town/year records have not been independently validated in this review. Add documented case studies and photographs across more services; do not invent counts, branch offices or outcomes.
4. Measure non-brand impressions, clicks, indexed pages, service enquiries and qualified leads. Compare service/city query groups over complete reporting periods. Track which pages earn AI citations through Bing's AI Performance report where available; this measures citations rather than a universal AI ranking. [Bing AI Performance](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview).
5. Use the queries and buyer questions that actually appear to improve the relevant page. Expand regional content with verified local project evidence. Consolidate overlapping pages if search data shows they do not offer distinct value. Do not produce additional city pages just to increase URL count.

## Repeatable review loop

After a meaningful content change: confirm its factual source, inspect the rendered page, run the crawl audit, check the affected enquiry path and review mobile/desktop screenshots. Following deployment, compare search and lead data before choosing the next change. Stop a cycle when the concrete defect is fixed and checked; do not equate a self-assigned design score with search performance.
