# Structured Data (Schema.org) Audit — theyonorummy.com

**Audit date:** 2026-08-18
**Site type:** Next.js real-money rummy/card-game Android app directory, pre-launch (not yet submitted to GSC)
**Method:** Live HTTP fetch of raw server-rendered HTML (`curl`, no JS execution needed — all JSON-LD is server-rendered by Next.js, confirmed present in raw HTML) + source review of `app/page.js`, `app/category/[category]/page.js`, `app/[slug]/page.js`.

**Pages crawled:**
- Homepage: `https://theyonorummy.com/`
- Category pages: `/category/rummy`, `/category/slots`, `/category/jaiho`
- App pages: `/joy-rummy`, `/rummy-888`, `/slots-winner`
- `https://theyonorummy.com/sitemap.xml` (83 URLs: 1 home + 9 categories + 73 apps)

All JSON-LD is delivered server-side inside a single `<script type="application/ld+json">` per page (no microdata, no RDFa). This is correct practice and matches the "JSON-LD only" recommendation.

---

## 1. Detection Summary

| Page type | Schema present | Format |
|---|---|---|
| Homepage (`/`) | `Organization` + `WebSite` (+`SearchAction`) + `CollectionPage`/`ItemList`, all in one `@graph` | JSON-LD |
| Category pages (`/category/*`) | `BreadcrumbList` (2-node) + `CollectionPage`/`ItemList` with `isPartOf` | JSON-LD |
| App pages (`/{slug}`) | `SoftwareApplication` + `BreadcrumbList` (3-node) | JSON-LD |

No `FAQPage`, `Review`, `AggregateRating`, `VideoObject`, `HowTo`, or `SpecialAnnouncement` markup exists anywhere on the crawled pages — confirmed by grep for FAQ/Q&A content across all 7 fetched pages, none found. No genuine FAQ or Q&A content exists on-page today, so there is nothing to mark up without fabricating content (see §4, Info items).

---

## 2. Validation Results (parse + required-field check)

**All 7 JSON-LD blocks parse as syntactically valid JSON** (verified with `json.loads()` against the raw HTML pulled live from each URL). No trailing commas, no unescaped quotes, no malformed `@graph` arrays.

| Page | Block | Parses? | Required fields present? | Notes |
|---|---|---|---|---|
| `/` | `Organization` | ✅ | ✅ `name`, `url`, `logo` | No `@id` (see §4-M1) |
| `/` | `WebSite` | ✅ | ✅ `name`, `url`, `@id`, `potentialAction.target`, `query-input` | **Confirmed: `"@id": "https://theyonorummy.com/#website"` is present** (line 122 of `app/page.js`, and present in live HTML). SearchAction target/query-input syntax is correct. |
| `/` | `CollectionPage`/`ItemList` | ✅ | ✅ `name`, `url`, `mainEntity.itemListElement[].position/url/name` | `numberOfItems: 73` matches actual `itemListElement` count and matches sitemap (73 app URLs). No `isPartOf` back-reference to `#website` (inconsistent with category pages — see §4-M2). |
| `/category/{rummy,slots,jaiho}` | `BreadcrumbList` | ✅ | ✅ `position`, `name`, `item` on both nodes | Intentional 2-node breadcrumb (Home + category) with real URLs only, no fake "Categories" node — **this is correctly implemented** and is the right call (a middle node with no real URL, or `item` omitted on a non-terminal node, is a Search Console validation error). |
| `/category/*` | `CollectionPage`/`ItemList` | ✅ | ✅ | `isPartOf.@id` correctly resolves to `https://theyonorummy.com/#website`, which **is** declared on the homepage `WebSite` node. Reference is valid. `numberOfItems` matches actual item count in each sample (rummy=41, slots=22, jaiho=7). |
| `/{slug}` (app pages) | `SoftwareApplication` | ✅ | ✅ `name`, `operatingSystem`, `applicationCategory`, `url`, `offers.price`, `offers.priceCurrency` | No `aggregateRating` — **intentional and correct** per the no-fabrication policy (see §4, Info-1). Missing several non-fabricated optional properties that are already known/displayed elsewhere on the page (see §4-M3). |
| `/{slug}` | `BreadcrumbList` | ✅ | ✅ | 3-node (Home → category → app). **Bug: category node `name` uses the raw DB slug** (e.g. `"rummy"`, `"slots"`, `"jaiho"`) instead of the branded label used everywhere else (see §4-H1). |

**No `@id` collisions, no duplicate `@type` blocks on the same page, no relative URLs, no `http://schema.org` usage (correctly using `https://schema.org`).** All dates that exist elsewhere on the site (sitemap `lastmod`, app `lastUpdated`) are already ISO 8601 — good precedent to extend into JSON-LD (see §4-M4).

---

## 3. Confirmed: WebSite `@id` / `isPartOf` Chain Works Correctly

This was explicitly asked to be verified. Confirmed by reading both the live-rendered JSON-LD and the source:

- `app/page.js` line 122: `"@id": `${SITE_URL}/#website`` → renders as `"@id": "https://theyonorummy.com/#website"` in the live homepage HTML.
- `app/category/[category]/page.js` line 116: `isPartOf: { "@id": `${SITE_URL}/#website` }` → renders identically on `/category/rummy`, `/category/slots`, `/category/jaiho`.

The strings match exactly (same origin, same fragment, same trailing slash absence). **This reference resolves correctly** — no fix needed here. This is good use of `@graph` + `@id` linking and should be the pattern extended to the other gaps below (§4-M1, §4-M2).

---

## 4. Findings, Severity, and Fixes

### High

**H1 — Breadcrumb category name mismatch between category pages and app pages**
- **Where:** `app/[slug]/page.js` lines 120–126 vs `app/category/[category]/page.js` lines 92–94.
- **Issue:** The category page's own `BreadcrumbList` labels the category node with the branded name from `NAV_CATEGORIES` (e.g. `"Yono Rummy"`, `"Yono Slots"`, `"Yono Jaiho"`). But every app page pointing at that *same URL* (`https://theyonorummy.com/category/rummy`) labels it with the raw, unbranded, lowercase DB slug instead: `"rummy"`, `"slots"`, `"jaiho"`. Confirmed live on all 3 sampled app pages:
  - `/joy-rummy` and `/rummy-888` → breadcrumb node 2: `{"name": "rummy", "item": ".../category/rummy"}`
  - `/slots-winner` → breadcrumb node 2: `{"name": "slots", "item": ".../category/slots"}`
  - Meanwhile `/category/rummy` itself declares that same URL as `{"name": "Yono Rummy", ...}`.
- **Why it matters:** Google explicitly uses the breadcrumb `name` to render the trail in search results. Two different structured-data blocks asserting two different display names for the identical URL is a real inconsistency (not just cosmetic) — it also reads as a lower-quality/auto-generated site to any downstream consumer (including LLMs doing entity resolution for GEO), since "rummy" vs "Yono Rummy" look like different entities pointing at the same node.
- **Fix:** In `app/[slug]/page.js`, import `NAV_CATEGORIES` (already exists in `lib/categoryContent.js` and is already used by the category page) and resolve the label the same way the category page does, instead of using the raw slug:

```js
// app/[slug]/page.js
import { NAV_CATEGORIES } from "../../lib/categoryContent";

// ...
const breadcrumbItems = [{ name: "Home", url: SITE_URL }];
if (app.categories?.[0]) {
  const categorySlug = app.categories[0];
  const categoryLabel =
    NAV_CATEGORIES.find((c) => c.slug === categorySlug.toLowerCase())?.label ||
    `Yono ${categorySlug.charAt(0).toUpperCase()}${categorySlug.slice(1)}`;
  breadcrumbItems.push({
    name: categoryLabel,
    url: `${SITE_URL}/category/${categorySlug}`,
  });
}
```
This mirrors the exact fallback logic (`breadcrumbLabel`) already written in `app/category/[category]/page.js` lines 92–94 — just needs to be shared/reused rather than duplicated with different behavior.

---

### Medium

**M1 — `Organization` and `WebSite` nodes are declared but not linked to each other**
- **Where:** `app/page.js` lines 114–130.
- **Issue:** Both nodes exist in the same `@graph` but there's no `@id` on `Organization` and no `publisher`/`author` property tying `WebSite` to `Organization`. Right now they're two floating nodes that happen to share a `name` string — Google/LLMs have to infer the relationship rather than being told it explicitly.
- **Fix:**
```json
{
  "@type": "Organization",
  "@id": "https://theyonorummy.com/#organization",
  "name": "The Yono Rummy",
  "url": "https://theyonorummy.com",
  "logo": "https://theyonorummy.com/logo.webp"
},
{
  "@type": "WebSite",
  "@id": "https://theyonorummy.com/#website",
  "name": "The Yono Rummy",
  "url": "https://theyonorummy.com",
  "publisher": { "@id": "https://theyonorummy.com/#organization" },
  "potentialAction": { "...": "unchanged" }
}
```
No fabricated data — just linking two already-true facts.

**M2 — Homepage `CollectionPage` doesn't declare `isPartOf` back to `#website` (inconsistent with category pages)**
- **Where:** `app/page.js` lines 131–147, compare to `app/category/[category]/page.js` line 116 which *does* include `isPartOf: { "@id": ".../#website" }`.
- **Issue:** The pattern is applied on category pages but not on the homepage's own `CollectionPage` node, even though the homepage is where `#website` is defined in the first place. Minor, but it's an easy, free, zero-risk consistency win and reinforces the entity graph.
- **Fix:** Add `isPartOf: { "@id": `${SITE_URL}/#website` }` to the homepage `CollectionPage` node in `app/page.js` (around line 135).

**M3 — `SoftwareApplication` is missing several non-fabricated, already-known properties**
- **Where:** `app/[slug]/page.js` lines 103–118.
- **Issue:** The page already renders `app.version`, `app.appSize`, and `app.lastUpdated` (formatted) directly in the visible spec table (lines 294–313, 226–228) and a real-money legal disclaimer (`LegalAlert`/`PlatformDisclaimer` components). None of this real, already-displayed data is mirrored into the schema, even though adding it requires **zero fabrication** — it's the same data already on the page.
- **Fix (add to `softwareApplicationNode`):**
```json
{
  "@type": "SoftwareApplication",
  "name": "Joy Rummy",
  "operatingSystem": "Android",
  "applicationCategory": "GameApplication",
  "url": "https://theyonorummy.com/joy-rummy",
  "image": "https://theyonorummy.com/icons/joy-rummy.webp",
  "description": "…",
  "softwareVersion": "1.0.0",
  "fileSize": "35MB",
  "dateModified": "2026-08-12T06:48:51.000Z",
  "contentRating": "18+ / Real-money gaming — legal age and jurisdiction restrictions apply",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" }
}
```
- Use `app.version || "1.0.0"` for `softwareVersion` (matches the fallback already used in the UI at line 300).
- Use `app.appSize` for `fileSize` (already rendered at line 298; schema.org's `fileSize` expects free text like `"35MB"`, which matches what's already stored).
- Use `app.lastUpdated` (already formatted for display at line 227) converted to ISO 8601 for `dateModified` — schema.org and Google both expect ISO 8601 here, not the `en-IN` display format used in the UI.
- `contentRating` is genuinely important for a real-money gambling app category and costs nothing to add truthfully, since the site already shows a legal/age disclaimer component on every app page.
- **Do NOT add `downloadUrl`/`installUrl`.** See Info-3 below — the download endpoint deliberately cloaks the real destination from Googlebot, and pointing schema at a cloaked URL would be a bad practice, not an improvement.

**M4 — `dateModified`/`datePublished` missing on `CollectionPage` nodes (homepage + category)**
- **Where:** `app/page.js` and `app/category/[category]/page.js`.
- **Issue:** `sitemap.js` already computes real `lastmod` values per URL (confirmed live: e.g. `/category/rummy` → `2026-08-17T16:40:14.950Z`). This same value isn't reused in the JSON-LD. Adding it is free and truthful.
- **Fix:** Pass the same `lastmod` logic used in `app/sitemap.js` into `dateModified` on the `CollectionPage` node for both homepage and category pages.

---

### Low

**L1 — `operatingSystem` value differs between live production output and current local source**
- **Live HTML** (all 3 sampled app pages, fetched today): `"operatingSystem": "ANDROID"` (all caps).
- **Local source** (`app/[slug]/page.js` line 106, current working tree): `operatingSystem: "Android"` (title case).
- Neither value is a schema.org validation error — `operatingSystem` is free text, no enum — so this is not breaking anything today. But it indicates the deployed build and the local repo have drifted (there are uncommitted changes in this repo per `git status`). Flagging so the next deploy doesn't silently change this value without it being a deliberate decision, and so whoever ships next confirms which casing they want ("Android" is the more conventional value seen in Google's own examples).

**L2 — `Organization` node has no `sameAs`**
- The site does have one real, already-published external identity — the Telegram channel link (`https://telegram.dog/+6XcQfvCgkvZmOThl`), shown on every app page. If that channel is genuinely operated by the same entity, it can be added truthfully:
```json
"sameAs": ["https://telegram.dog/+6XcQfvCgkvZmOThl"]
```
Do not add placeholder social profiles (Facebook/Twitter/Instagram URLs) that don't exist — only add `sameAs` entries for real, verifiable owned profiles.

**L3 — `ItemList` property inconsistency between homepage and category pages**
- Homepage `ItemList.itemListElement[]` uses only `url` (no `item`).
- Category page `ItemList.itemListElement[]` uses both `item` and `url` with identical values (redundant but not invalid).
- Neither is wrong, but pick one convention. Schema.org's `ListItem.item` is the more standard property when the value is a URL string; recommend standardizing on `item` (as category pages already do) and dropping the always-present-page-`url`-only version.

**L4 — `Organization.logo` is a bare string, not an `ImageObject`**
- Google's Organization/Logo guidance accepts a plain URL string, so this is not a defect, but wrapping it as an `ImageObject` with explicit `width`/`height` is a small, well-supported enhancement:
```json
"logo": {
  "@type": "ImageObject",
  "url": "https://theyonorummy.com/logo.webp",
  "width": 512,
  "height": 512
}
```

---

### Info (no SERP impact, no action required unless noted)

**Info-1 — No `aggregateRating`/`Review` on `SoftwareApplication`: correct and intentional, keep it this way.**
Confirmed absent on all 3 sampled app pages. This is the right call for a real-money gambling app directory under Google's manipulated-reviews / misleading-content policies. One side effect worth knowing (not a defect, just an expectation-setting note): **without `aggregateRating`, these pages are not eligible for Google's Software App rich result at all**, regardless of any other field — Google requires `aggregateRating` for that rich result type. So the current markup is correctly scoped to "valid structured data for entity understanding," not "rich-result-eligible" — which matches the stated policy trade-off.

**Info-2 — On-page (non-schema) star rating and download count may still carry the same trust risk the schema decision was designed to avoid.**
Not a structured-data issue, but adjacent and worth flagging to the wider audit: `models/App.js` has `rating`/`ratingCount` fields, and `scripts/seedApps.mjs` seeds them with manually-chosen values (e.g., `4.3`, `4.5`, `4.6`) rather than sourced from a verifiable review platform. These are rendered in the visible UI via `StarRating` and a "downloads" figure on every app page. Keeping these numbers out of JSON-LD (as done) avoids the *structured-data-specific* manipulated-reviews violation and avoids false rich-result eligibility, but the same numbers are still visible to users and to Google's page-quality/Your-Money-Your-Life reviewers as on-page content. Recommend either sourcing real numbers, clearly labeling them as an internal/editorial score rather than a "rating" (e.g. "Our Score" instead of a 5-star widget), or removing them — this is a content-policy question for the site owner, not a JSON-LD fix, but it's the same underlying risk driving the schema decision, so it should be resolved consistently.

**Info-3 — Do not schema-tag the download endpoint; it is intentionally cloaked from Googlebot.**
`app/api/download/[slug]/route.js` 302-redirects to `app.referLink` (the real affiliate URL) but explicitly detects and blocks `Googlebot`/`AdsBot-Google` user agents from following that redirect (redirects them home instead). This is a deliberate anti-cloaking-detection measure for the affiliate link, not related to schema — but it means **`downloadUrl`/`installUrl` should never be added to the `SoftwareApplication` schema pointing at `/api/download/{slug}`**, because doing so would put a URL that behaves differently for Googlebot than for users directly into structured data, which is a more serious issue (borderline cloaking signal inside structured data) than simply omitting the property. Current behavior (schema `url` points only at the canonical `/​{slug}` landing page, never at the redirect endpoint) is correct — keep it that way.

**Info-4 — `FAQPage`: no genuine FAQ/Q&A content exists on any crawled page today, so there is nothing to mark up.**
Grep across all 7 fetched pages found no "FAQ," "Frequently Asked," or Q&A-style content blocks. Per current Google policy (FAQ rich results retired for all sites, May 7 2026) there would be no SERP benefit even if added. If genuine FAQ content is authored later (e.g., "Is Joy Rummy legal in my state?", "How long does withdrawal take?"), `FAQPage` markup is still worth adding purely for AI/LLM citation and entity resolution (GEO) — but only once real Q&A copy exists; do not scaffold empty/generic FAQ markup just to have the type present. If a genuine user-submitted Q&A section is ever built (not simple editorial FAQ), use `QAPage`, not `FAQPage`.

**Info-5 — No deprecated types found.** No `HowTo`, `SpecialAnnouncement`, `CourseInfo`, `EstimatedSalary`, or `LearningVideo` markup anywhere on the site. Nothing to remove.

**Info-6 — No video content on crawled pages**, so `VideoObject`/`BroadcastEvent`/`Clip`/`SeekToAction` are not applicable today. If app preview videos or gameplay clips are added later, revisit using the templates in `schema/templates.json`.

**Info-7 — `CollectionPage`/`ItemList` type choice is appropriate but won't produce a carousel rich result.** Google's `ItemList` carousel eligibility is restricted to specific content verticals (recipes, courses, movies, restaurants, etc.); a generic app directory list will not get carousel treatment no matter how it's structured. Current usage is valid schema.org, just not a rich-result trigger — this is expected and not a bug.

---

## 5. Priority Fix List (ordered)

1. **[High]** Fix breadcrumb category-name mismatch on app pages — reuse `NAV_CATEGORIES` label lookup instead of raw slug (`app/[slug]/page.js`).
2. **[Medium]** Add `dateModified` (ISO 8601, from data already in the DB/sitemap) to `SoftwareApplication` and `CollectionPage` nodes.
3. **[Medium]** Add `softwareVersion`, `fileSize`, `contentRating` to `SoftwareApplication` using data already shown in the UI — no fabrication.
4. **[Medium]** Link `Organization` ↔ `WebSite` via `@id`/`publisher`; add `isPartOf` on homepage `CollectionPage` for consistency with category pages.
5. **[Low]** Standardize `ItemList.itemListElement` on `item` (drop duplicate/inconsistent `url`-only usage); wrap `Organization.logo` as `ImageObject`; add `sameAs` for the real Telegram channel; reconcile `operatingSystem` casing between deployed and local source before next deploy.
6. **[Info]** No action needed on `FAQPage`/`aggregateRating`/`downloadUrl` decisions — current omissions are correct; revisit `FAQPage` only if genuine FAQ copy is written.

---

## Files referenced during this audit
- `C:\Users\choudhary\Desktop\theyonorummy\theyonorummy\app\page.js`
- `C:\Users\choudhary\Desktop\theyonorummy\theyonorummy\app\category\[category]\page.js`
- `C:\Users\choudhary\Desktop\theyonorummy\theyonorummy\app\[slug]\page.js`
- `C:\Users\choudhary\Desktop\theyonorummy\theyonorummy\app\api\download\[slug]\route.js`
- `C:\Users\choudhary\Desktop\theyonorummy\theyonorummy\lib\categoryContent.js`
- `C:\Users\choudhary\Desktop\theyonorummy\theyonorummy\models\App.js`
- `C:\Users\choudhary\Desktop\theyonorummy\theyonorummy\scripts\seedApps.mjs`
- `C:\Users\choudhary\Desktop\theyonorummy\theyonorummy\app\layout.js`
- `C:\Users\choudhary\Desktop\theyonorummy\theyonorummy\app\sitemap.js`
- Live: `https://theyonorummy.com/`, `/category/rummy`, `/category/slots`, `/category/jaiho`, `/joy-rummy`, `/rummy-888`, `/slots-winner`, `/sitemap.xml`
