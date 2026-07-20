# SEO Audit — theyonorummy.com

**Method note**: this project is a local Next.js codebase not yet deployed publicly, so this audit was performed via direct code and database inspection rather than a live site crawl. Live Core Web Vitals field data, backlink profiles, and Search Console data are unavailable until deployment.

---

## Executive Summary

## SEO Health Score: 57 / 100

**Business type**: App directory / real-money gaming referral platform

### Top 5 Critical/High Issues
1. No `robots.txt` anywhere in the project
2. No canonical tag on any app detail page (`/[slug]`)
3. No Open Graph / Twitter Card metadata anywhere
4. 3 of 4 optional content sections are empty on every app in the database
5. `/admin/login` is not `noindex`ed

### Top 5 Quick Wins
1. Add `app/robots.js` (sitemap declaration + disallow admin/api)
2. Add `alternates.canonical` to app detail page metadata
3. Add `noindex` to `/admin/login`
4. Fix the dead Telegram (`href="#"`) button on every app page
5. Add `metadataBase` to the root layout

### Category Scores

| Category | Score | Weight |
|---|---|---|
| Technical SEO | 60/100 | 22% |
| Content Quality | 45/100 | 23% |
| On-Page SEO | 55/100 | 20% |
| Schema & Structured Data | 65/100 | 10% |
| Performance (CWV) | 70/100 | 10% |
| AI Search Readiness | 55/100 | 10% |
| Images | 75/100 | 5% |

### Overall Read

The site's architecture is more mature than its content. The parts that required careful engineering judgment — canonicalization strategy for search/filter query variations, avoiding fabricated review-count schema, keeping admin routes authenticated, isolating heavy admin-only dependencies from public bundles, self-hosted fonts — are already handled well, in some cases better than typical sites at this stage. The gaps that remain are concentrated in two places: (1) technical hygiene items that are genuinely quick to fix (robots.txt, canonical tags, OG tags, admin noindex), and (2) content depth — the page template already supports four content sections per app, but only one is filled in for any app in the current dataset. Closing that content gap is the single highest-leverage thing to do before wider promotion.

---

## Technical SEO — Score: 60/100

### Critical

**No robots.txt anywhere in the project.**
Evidence: no `app/robots.js` and no `public/robots.txt`. Confirmed via directory search.
Impact: crawlers get no explicit sitemap declaration and no disallow rules for `/admin/*` or `/api/*`. Googlebot can attempt to crawl and potentially index the admin login page and the internal download-redirect API routes, wasting crawl budget on a young site where budget is scarce.
Fix: add `app/robots.js` exporting a `MetadataRoute.Robots` object with `sitemap: 'https://theyonorummy.com/sitemap.xml'` and `disallow: ['/admin/', '/api/']`.

### High

**`/admin/login` has no `noindex`.**
Evidence: `app/admin/login/page.js` has no `metadata`/`robots` export.
Impact: if this URL is ever discovered externally, it can be indexed — revealing admin infrastructure for a real-money financial product.
Fix: export `metadata = { robots: { index: false, follow: false } }`.

**No `metadataBase` set in the root layout.**
Evidence: `app/layout.js` metadata object has no `metadataBase`.
Impact: Next.js resolves relative OG/Twitter image URLs against `metadataBase`. Without it, once social images are added, they will silently resolve against `localhost:3000` in production instead of the real domain — a bug that's invisible until someone actually shares a link.
Fix: `metadataBase: new URL('https://theyonorummy.com')`.

### Medium

**Sitemap category entries report an inaccurate `lastModified`.**
Evidence: `app/sitemap.js` sets `lastModified: new Date()` (current request time) for every category entry, rather than the real last-changed date of that category's apps.
Impact: minor — slightly misrepresents freshness to crawlers, doesn't block anything.

### What's already working well

- `app/sitemap.js` is dynamic and DB-driven: homepage + all active app slugs + category pages, with sensible priority weighting (1.0 / 0.8 / 0.6).
- `middleware.js` correctly protects every `/admin/*` route with a signed session-cookie check, redirecting unauthenticated requests to `/admin/login`.
- The homepage's `?q=` search and `?category=` filter views already correctly apply `robots: { index: false, follow: true }` plus a canonical pointing to the clean indexable URL. This is a genuinely above-average implementation — most sites either index every query-string variation or block search entirely.

---

## Content Quality — Score: 45/100

### Critical

**0 of 4 apps in the database have `whyChoose`, `howToDownload`, or `additionalInfo` populated.**
Evidence: direct query across every app document (`diwa-win`, `max-rummy`, `diwa-game`, `jaiho-91`) — all four have only the base `description` field filled.
Impact: the app detail page template was specifically built with four distinct content sections to give each page real depth and unique long-tail keyword coverage. Right now 75% of that capacity sits unused for every app that exists.
Fix: this is the single highest-leverage content fix available. Prioritize writing (or having admins write via the existing rich-text editor) `whyChoose`, `howToDownload`, and `additionalInfo` for every app before wider promotion.

### High

**Two of four descriptions are thin.**

| App | Words |
|---|---|
| jaiho-91 | 66 |
| diwa-win | 89 |
| max-rummy | 174 |
| diwa-game | 290 |

Fix: target 150+ words minimum per description; 250+ once the other three sections are also filled.

**Single-app category pages read as thin/duplicate content.**
Evidence: `vip`, `diwa`, and `jaiho` each currently contain exactly 1 app; only `rummy` (2) and `slots` (2) have more than one.
Impact: a "category" landing page presenting one item duplicates the app detail page's purpose with no independent value.
Fix: either hold off on promoting/indexing single-app category pages until 3+ apps exist per category, or add unique category-level intro copy in the meantime.

### What's already working well

- `LegalAlert` and `PlatformDisclaimer` appear on every app page — genuine E-E-A-T strength for a real-money gambling-adjacent product: state-restriction disclosure, platform-independence disclaimer, and responsible-gaming language are all present.
- The homepage's "About Real-Money Rummy & Earning Apps" SEO info block already has substantive, non-generic paragraphs.

---

## On-Page SEO — Score: 55/100

### Critical

**No canonical tag on any `/[slug]` app page.**
Evidence: `generateMetadata` in `app/[slug]/page.js` returns `title`, `description`, `keywords` — no `alternates.canonical`. Present only on the homepage and category pages.
Impact: this is the highest-volume page type on the entire site (one per app, scaling toward 70+), and none of them self-canonicalize.
Fix: add `alternates: { canonical: \`https://theyonorummy.com/${slug}\` }`.

### High

**No Open Graph or Twitter Card metadata anywhere in the codebase.**
Evidence: repo-wide search for `openGraph` / `twitter:` returns zero matches across `app/`.
Impact: every link shared on WhatsApp, Telegram, X, or Facebook — presumably a primary distribution channel for a referral-driven app directory — renders as a bare link with no image, title, or description card.
Fix: add `openGraph` and `twitter` fields to `generateMetadata` on homepage, category, and app detail pages (app logo as the image at minimum).

### Medium

**Dead CTA link on every app page.**
Evidence: `app/[slug]/page.js` — the "TELEGRAM" button's `href="#"`.
Fix: point it at a real Telegram channel/group, or remove it until one exists.

### What's already working well

- Title tags and meta descriptions are dynamic per app, pulling from `app.seo.metaTitle` / `metaDescription` with sensible fallback templates.
- Exactly one `<h1>` per page confirmed across the homepage, app detail, and category templates.
- Each app carries 9–11 stored SEO keywords (inert for ranking since Google hasn't used the `keywords` meta tag in years, but not harmful either).

---

## Schema & Structured Data — Score: 65/100

### What's already working well

- `SoftwareApplication` JSON-LD implemented on every app page with only real, verifiable fields: `name`, `operatingSystem`, `applicationCategory`, `url`, `image`, `description`, `offers`.
- `aggregateRating` / `ratingCount` are deliberately omitted rather than fabricated — the correct call under Google's structured-data guidelines, since inventing a review count can trigger a manual action that removes rich-result eligibility site-wide.
- `CollectionPage` / `ItemList` schema on the homepage and category pages correctly includes an accurate `numberOfItems`.
- FAQPage schema was deliberately removed site-wide (a prior decision to avoid templated/duplicate FAQ content) — noted here so it doesn't read as an oversight.

### Medium

**No `BreadcrumbList` schema despite a visible breadcrumb UI.**
Evidence: `app/[slug]/page.js` renders a Home / Category breadcrumb, but no matching `BreadcrumbList` JSON-LD exists.
Fix: low-risk, low-effort — the data already exists on the page.

**No `Organization` or `WebSite` schema on the homepage.**
Impact: missing what enables a Sitelinks Search Box and establishes the brand as a distinct entity for Google's Knowledge Graph.

---

## Performance / Core Web Vitals — Score: 70/100

*Note: the site isn't deployed publicly, so this is a code-level audit, not a live Lighthouse/CrUX field measurement.*

### What's already working well

- Fonts (Geist Sans/Mono) are self-hosted via `next/font/local` — no external Google Fonts request, no render-blocking `@font-face` fetch, no CLS from late font swap.
- The LCP-candidate image (app logo on `/[slug]` pages) uses `next/image` with explicit `width`/`height` and `priority` — confirmed a `<link rel="preload" as="image">` is correctly injected into `<head>`.
- Admin-only dependencies (TipTap, ~120kB) are confirmed isolated to `/admin/*` routes only: public pages build at 114–116kB First Load JS versus 234kB for admin forms.

### Medium

**Small top-nav logo still uses a raw `<img>`.**
Evidence: `components/Header.js` and the top nav in `app/[slug]/page.js` both render `/logo.webp` via `<img>`, not `next/image`.
Impact: low — small (32×32) image — but inconsistent with the rest of the codebase.

### Info

**No security/caching headers configured.**
Evidence: `next.config.mjs` is an empty config object.
Fix: add `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security` once deployed behind HTTPS.

---

## Images — Score: 75/100

### What's already working well

- Alt text present and descriptive on every image found — no empty or missing `alt` attributes detected.
- `AppCard.js` and the app detail page's main logo both use `next/image` with `fill`/explicit dimensions and appropriate `sizes` hints.

### Low

The two small top-nav logo instances (see Performance) are the only remaining raw `<img>` tags in the codebase.

---

## AI Search Readiness — Score: 55/100

### What's already working well

- Every page is fully server-rendered with no client-side-only content — AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) see complete content on first fetch with no JavaScript execution required.
- Clean, semantic heading hierarchy makes passage-level extraction straightforward.

### Medium

**No `llms.txt`.** Increasingly used as a signal of AI-crawler-friendliness and to point AI systems at your most canonical content.

**No explicit stance on AI crawlers.** With no robots.txt, there's no deliberate allow/disallow for GPTBot, Google-Extended, CCBot, etc. — currently permissive by accident, not by decision.

**Content depth directly limits citability.** A 66–89 word description doesn't give an LLM much distinctive material to cite or summarize accurately versus competitors.

---

## Action Plan

### Phase 1: Critical Fixes (This Week)
1. Add `app/robots.js` — declare sitemap, disallow `/admin/` and `/api/`
2. Add `alternates.canonical` to `app/[slug]/page.js` `generateMetadata`
3. Add `robots: { index: false, follow: false }` to `/admin/login`
4. Fix or remove the dead `href="#"` Telegram link on every app page

### Phase 2: High-Impact Improvements (Weeks 2–3)
1. Add Open Graph + Twitter Card metadata (title, description, image) to homepage, category, and app detail pages
2. Add `metadataBase` to the root layout
3. Populate `whyChoose`, `howToDownload`, `additionalInfo` for every existing app — highest-leverage content fix available
4. Expand thin descriptions (jaiho-91: 66 words, diwa-win: 89 words) to 150+ words

### Phase 3: Content & Authority (Month 2)
1. Add `BreadcrumbList` schema matching the existing breadcrumb UI
2. Add `Organization`/`WebSite` schema to the homepage
3. Grow catalog to 3+ apps per category before broadly promoting single-app category pages (vip, diwa, jaiho), or add unique category-level copy in the meantime
4. Add `llms.txt`

### Phase 4: Monitoring & Iteration (Ongoing)
1. Deploy, then run a live Lighthouse/CrUX/PageSpeed Insights check for real Core Web Vitals field data
2. Set up Google Search Console and submit the sitemap
3. Re-audit after 30 days of real traffic and indexation data
