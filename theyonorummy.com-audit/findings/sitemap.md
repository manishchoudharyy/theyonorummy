# Sitemap Architecture Audit — theyonorummy.com

**Audited:** https://theyonorummy.com/sitemap.xml
**Date:** 2026-08-18
**Site type:** Next.js 15 app directory, dynamically generated sitemap (`app/sitemap.js`), pre-launch (not yet submitted to Google Search Console)

---

## Summary

| Check | Result |
|---|---|
| XML well-formed | ✅ Pass |
| URL count | 83 (1 home + 9 category + 73 app pages) — well under the 50,000/file limit |
| Non-200 URLs | ✅ None found (all 73 app pages + all 9 category pages + homepage return 200) |
| Duplicate `<loc>` entries | ✅ None |
| Redirected URLs | ✅ None (every `<loc>` resolves directly, no 3xx hop) |
| Noindexed URLs in sitemap | ✅ None (no site-wide or per-page noindex found for any sitemap URL) |
| Navbar categories present | ✅ All 6 (rummy, slots, 777, spin, vip, diwa) |
| Non-nav data-tag categories present | ✅ jaiho, bet, jackpots also included (union of app-tagged categories) |
| Individual app pages present | ✅ All 73 active apps from the DB are represented |
| robots.txt ↔ sitemap consistency | ✅ Consistent — no `/admin/` or `/api/` URLs leaked into sitemap |
| Sitemap referenced in robots.txt | ✅ Yes (`Sitemap: https://theyonorummy.com/sitemap.xml`) |
| lastmod accuracy | ⚠️ Partially fake — see Medium finding below |
| priority / changefreq tags | ℹ️ Present, both ignored by Google |
| Thin content on category pages | ⚠️ 3 of 9 category pages have no unique copy |

---

## Detailed Findings

### 1. [MEDIUM] `lastmod` on homepage + all 9 category pages is fake ("now", not real content dates)

**What's happening:** In `app/sitemap.js`, the homepage and every category entry use `lastModified: new Date()` — i.e., whatever moment the sitemap happened to be generated/regenerated — instead of a real content-change date:

```js
// app/sitemap.js, lines 32-39 (home) and 25-30 (categories)
const categoryEntries = categories.map((category) => ({
  url: `${SITE_URL}/category/${category}`,
  lastModified: new Date(),   // <-- always "now", not real
  changeFrequency: 'daily',
  priority: 0.6,
}));
```

Live sitemap confirms this: the homepage and all 9 `/category/*` URLs currently share the exact same timestamp (`2026-08-17T16:40:14.950Z`), which is just whenever that sitemap response last regenerated — not a real edit date. Every future request/ISR revalidation will bump this to a new "now" even if the category copy hasn't changed at all.

**Why it matters:** `lastmod` is one of the few sitemap fields Google still uses (for recrawl scheduling / freshness signals). A `lastmod` that changes on every regeneration without any real content change trains Google to distrust it, which can reduce how much weight your `lastmod` gets going forward — the opposite of what you want on a pre-launch site trying to get efficiently crawled and indexed for the first time.

**Fix:** Track a real `updatedAt` for category content (e.g., a small `CategoryMeta` collection, or derive it from the max `lastUpdated` of apps in that category, or a git-log-based date at build time for the static hero/section copy in `categoryContent.js`). For the homepage, either use a genuinely-updated timestamp (e.g., max `lastUpdated` across all active apps) or omit `lastmod` entirely rather than fabricate one — omitting is safer than a misleading date.

App entries are correct — they use `app.lastUpdated` from Mongo, a real per-record timestamp:
```js
lastModified: app.lastUpdated ? new Date(app.lastUpdated) : new Date(),
```
No fix needed there.

---

### 2. [INFO] `priority` and `changefreq` are present but ignored by Google

Every URL in the sitemap carries `<priority>` (1 / 0.8 / 0.6) and `<changefreq>daily</changefreq>`. Google has publicly stated both fields are ignored during crawling/ranking (they still validate against the schema, so this isn't a validity issue). `changefreq: daily` on every single URL, including static category pages that rarely change, is also internally inconsistent messaging (if it mattered).

**Fix (optional, low priority):** Can be removed from `app/sitemap.js` to slim the payload — Next.js's `MetadataRoute.Sitemap` type doesn't require `priority`/`changeFrequency`. Not urgent; purely cleanup.

---

### 3. [LOW] `changefreq: daily` on every URL, including near-static category pages

Category pages (`/category/slots`, `/category/rummy`, etc.) get new apps added infrequently, not daily. Combined with finding #2 being informational, this isn't harmful on its own, but if you keep `changefreq` at all, differentiate it: `daily` for the homepage/app listing pages that change often (new apps added), and `weekly`/`monthly` for category pages. Since Google ignores the field anyway, this is optional polish only.

---

### 4. [INFO / QUALITY GATE] 3 category pages in the sitemap have no unique on-page content

The sitemap includes 9 category URLs: the 6 navbar categories (`rummy`, `slots`, `777`, `spin`, `vip`, `diwa`) plus 3 non-nav "data tag" categories that exist only because individual apps happen to be tagged with them: `jaiho`, `bet`, `jackpots`.

- `lib/categoryContent.js` only defines rich hero copy + 4 SEO sections for the **6 nav categories**. `getCategoryContent()` returns `null` for `jaiho`, `bet`, and `jackpots`.
- In `app/category/[category]/page.js`, when `content` is `null`, the page falls back to a generic templated heading/description (`Yono ${label} Apps ${year}` / `Browse verified Yono ${label} apps with signup bonuses from ₹51 to ₹500...`) and renders **no SEO sections** (`content?.sections?.length > 0` gate is false).
- All three pages return 200 and are crawlable/indexable — confirmed live.

This isn't a location-page doorway-page pattern (a 9-page category set is nowhere near the 30+/50+ programmatic-page quality-gate thresholds), so no HARD STOP applies. But `/category/jaiho`, `/category/bet`, `/category/jackpots` are thin, template-only pages sitting in the sitemap next to well-developed category pages — a smaller-scale version of the same "doorway page" risk pattern once indexed at scale.

**Fix:** Either (a) write the same 4-section unique-content treatment for jaiho/bet/jackpots that the 6 nav categories already have in `categoryContent.js`, or (b) if these are meant to stay minor/non-primary categories, keep them in the sitemap but accept they're low-value entries — do not scale this pattern to more auto-generated category tags without adding real content per tag.

---

### 5. [PASS] robots.txt / sitemap consistency

`robots.txt` disallows only `/admin/` and `/api/`:
```
User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://theyonorummy.com/sitemap.xml
```
No sitemap URL falls under either disallowed path (verified by inspecting all 83 `<loc>` entries) — homepage, `/category/*`, and app slugs are all allowed. `app/robots.js` correctly emits the `Sitemap:` directive pointing at the live sitemap.

---

### 6. [PASS] Sitemap referencing

The sitemap **is** properly referenced — via the `Sitemap:` line in `robots.txt`, which is the canonical discovery mechanism Google looks for. The task description notes this site is pre-launch and hasn't been submitted to Google Search Console yet; that's expected at this stage and not a defect, but it is a **required next step before considering the site "launched" for organic search**:

**Action item (not a bug):** Once ready to go live, manually submit `https://theyonorummy.com/sitemap.xml` in Google Search Console (Sitemaps report) to trigger the first crawl pass rather than relying solely on robots.txt discovery, which can take longer.

---

### 7. [PASS] Navbar category coverage

All 6 navbar-linked categories are present and return 200:

| Navbar link | Sitemap URL | Status |
|---|---|---|
| Yono Rummy | `/category/rummy` | 200 |
| Yono Slots | `/category/slots` | 200 |
| Yono 777 | `/category/777` | 200 |
| Yono Spin | `/category/spin` | 200 |
| Yono VIP | `/category/vip` | 200 |
| Diwa Games | `/category/diwa` | 200 |

This is enforced structurally in code, not just by coincidence: `FEATURED_CATEGORIES` (all 6 keys of `categoryContent.js`) is unioned into the sitemap's category list every time, so even a brand-new nav category with zero tagged apps yet would still appear in the sitemap and not 404 (the page component's `isFeatured` check bypasses `notFound()` for these). Good defensive design.

The 3 non-nav data-tag categories (`jaiho`, `bet`, `jackpots`) are also present, because at least one active app is currently tagged with each — see Finding #4 for the content-quality caveat.

---

### 8. [PASS] Individual app pages

All 73 app pages currently in the sitemap were checked and return HTTP 200 with no redirects:

- Verified via live HTTP checks against every `<loc>` in the sitemap (batch-checked with `curl -L -w "%{http_code} %{url_effective}"`); zero non-200 responses, zero redirect hops. (One transient `000`/timeout on `gold-rummy` during the first pass was a network hiccup, not a real error — retried and confirmed 200.)
- `app/sitemap.js` generates app entries directly from `App.find({ isActive: true })`, and `app/[slug]/page.js` looks up the exact same `{ slug, isActive: true }` filter — so by construction there cannot be an app in the sitemap that isn't a real, active, renderable page, nor an active app missing from the sitemap. This is a sound single-source-of-truth pattern.
- No orphan pages: the homepage (`app/page.js`) queries `App.find(query)` with no `.limit()`, so all 73 apps are also internally linked from the homepage grid, not just present in the sitemap.

---

### 9. [PASS] XML structure validation

- Well-formed XML confirmed via parser (root element `urlset` in the correct `http://www.sitemaps.org/schemas/sitemap/0.9` namespace, valid `<url>`/`<loc>`/`<lastmod>` structure throughout).
- Served with `Content-Type: application/xml` and HTTP 200.
- No duplicate `<loc>` entries.
- 83 URLs total — nowhere close to the 50,000-per-file cap, no sitemap index needed at this scale.

---

## Fix Priority Summary

| # | Finding | Severity | Fix effort |
|---|---|---|---|
| 1 | Fake/rotating `lastmod` on home + 9 category pages | Medium | Small — replace `new Date()` with a real tracked date, or omit the field |
| 4 | Thin/templated content on `jaiho`, `bet`, `jackpots` category pages | Info / quality-gate watch | Medium — write real section copy, same pattern as the 6 nav categories |
| 2 | `priority`/`changefreq` fields (Google ignores both) | Info | Trivial — optional removal |
| 3 | `changefreq: daily` uniformly applied even to near-static pages | Low | Trivial — optional, only matters if you keep the field at all |
| — | Sitemap not yet submitted to GSC | Action item (expected pre-launch) | Trivial — one-time manual submission at launch |

No Critical or High severity issues found. The sitemap is technically sound (valid XML, 100% 200-status URLs, no redirects, no noindexed URLs, complete nav + data-tag category coverage, complete active-app coverage, consistent with robots.txt, properly referenced for discovery). The only real fix needed before launch is #1 (fake lastmod); #4 is worth addressing before scaling the `jaiho`/`bet`/`jackpots`-style auto-derived category tags any further.
