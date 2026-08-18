# Performance / Core Web Vitals Audit — theyonorummy.com

**Date:** 2026-08-18
**Site type:** Next.js 15 app, App Router, self-hosted on a VPS (nginx reverse proxy in front of Node), pre-launch (not yet submitted to Search Console, no CrUX/field data yet).

## Data sources used

| Source | Status |
|---|---|
| PageSpeed Insights API (`pagespeed_check.py`) | **Failed** — `PSI rate limit exceeded (240 QPM / 25,000 QPD)` (HTTP 429) on every attempt, including a retry. No Google API key configured for this run, so the public unauthenticated quota was hit. **No field (CrUX) or PSI lab data could be pulled.** |
| CrUX field data | **Not available** — even with a working key, the site is pre-launch and has not accrued the ~28-day rolling Chrome UX Report traffic needed for CrUX to return data. |
| `render_page.py` (SPA-aware fetch) | **Failed** — `Read timed out (30s)` fetching the homepage raw HTML. |
| **Lighthouse 13.4.1 CLI** (mobile, simulated throttling, performance category only) | **Succeeded** for all 3 test pages — this is the primary data source for this report. |
| `curl` timing/headers (5 requests per page, several routes) | Succeeded — used to cross-check TTFB and inspect `Cache-Control`/Next.js caching headers directly from the origin. |

**Important caveat:** All metrics below are **lab data** (single Lighthouse run per page, simulated mobile throttling), not real-user field data. Directionally reliable, but re-validate against CrUX/PSI field data once the site is indexed and has traffic (re-run `pagespeed_check.py` with a valid `GOOGLE_API_KEY` and outside the rate-limit window).

Pages tested (slugs pulled from `https://theyonorummy.com/sitemap.xml`):
- `/` (homepage)
- `/category/rummy`
- `/joy-rummy` (app detail page)

---

## Summary scorecard (Lighthouse mobile, simulated throttling)

| Page | Perf Score | LCP (lab) | CLS | Speed Index | TBT | Server response time |
|---|---|---|---|---|---|---|
| `/` | 94 | **2.08s** — Good (barely) | 0 — Good | 5.47s — Needs Improvement/near Poor | 27ms — Good | **960ms — Poor** (audit score 0) |
| `/category/rummy` | 95 | **2.8s — Needs Improvement** | 0 — Good | 2.5s — Good | 20ms — Good | 170ms — Good |
| `/joy-rummy` | 99 | 2.0s — Good | 0 — Good | 1.9s — Good | 20ms — Good | 120ms — Good |

No field INP data exists yet (pre-launch). Lab proxy "Max Potential FID" was 90–170ms across all three pages (low), and Total Blocking Time was ≤30ms on every page — nothing points to an INP problem today, but note **INP is the only interactivity metric now** (FID is fully removed from all tooling); revisit with real INP field data post-launch.

---

## Findings, by severity

### CRITICAL — Homepage is not statically cached; every request re-renders on the server

**Evidence:**
- Homepage response headers: `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`, **no** `x-nextjs-cache` header, **no** `ETag`, **no** `x-nextjs-prerender` header.
- `/category/rummy` and `/joy-rummy` response headers: `Cache-Control: s-maxage=31536000,`, `x-nextjs-cache: HIT`, `x-nextjs-prerender: 1`, `ETag` present — i.e. these routes ARE statically generated / ISR-cached by Next.js and served instantly from cache.
- Lighthouse `server-response-time` audit: homepage root document took **960ms** (audit score **0**, fails the ≤600ms budget) vs **170ms** on `/category/rummy` and **120ms** on `/joy-rummy` — a **6–8x** difference for structurally similar page templates.
- Lighthouse `document-latency-insight`: **860ms** of estimated savings available on the homepage alone.
- Lighthouse LCP breakdown for `/`: of the 2,076ms total LCP, **TTFB alone accounts for ~1,830ms (≈88%)** — TTFB is by far the dominant cost, not resource loading or render delay.
- `curl` cross-check (5 runs): homepage TTFB ranged **0.87s–2.1s**; other routes are also affected by the same WAN path but their `x-nextjs-cache: HIT` shows they're being served from Next.js's cache layer, not fully re-rendered per request.

**Why this matters:** The homepage is described as "mostly-static content" (an app directory listing), yet it's the *only* tested route opted out of Next.js static generation/ISR and CDN/browser caching. This is almost certainly caused by something in the homepage route forcing dynamic rendering — e.g. `export const dynamic = 'force-dynamic'`, a `fetch(..., { cache: 'no-store' })` / `unstable_noStore()` call in its data-fetching, or use of `cookies()`/`headers()`/`searchParams` in a server component on that route. Every single visitor (and every Googlebot crawl) pays a full server render + no caching, which directly inflates TTFB → LCP → Speed Index, and won't scale once real traffic/bot crawl volume arrives pre- and post-launch.

**Fix (highest impact / do first):**
1. Locate what's forcing `/` to render dynamically in `app/page.js` (check for `export const dynamic`, `fetch(... , {cache: 'no-store'})`, `unstable_noStore()`, or any use of request-scoped APIs). Remove it if the underlying data doesn't actually need to be per-request-fresh.
2. Convert the homepage to static generation with `export const revalidate = <seconds>` (ISR) matching the same pattern already used successfully on `/category/[slug]` and `/[slug]` routes, so it gets `x-nextjs-cache: HIT` and long `s-maxage` like every other route.
3. Re-verify with `curl -sI https://theyonorummy.com/` that the response gains `x-nextjs-cache: HIT` and a real `Cache-Control`/`ETag`, and re-run Lighthouse to confirm `server-response-time` drops from ~960ms toward the ~120–170ms seen elsewhere.

**Expected impact:** Should cut homepage TTFB by roughly 80–85%, pulling LCP well under 2.5s with margin and very likely also fixing the "Needs Improvement" Speed Index (5.47s) since almost everything else on the page is currently queued behind that slow TTFB.

---

### HIGH — Category page LCP (2.8s) fails the "Good" ≤2.5s threshold

**Evidence:** `/category/rummy` Lighthouse LCP = **2.8s** (audit score 0.83, "Needs Improvement" band). LCP breakdown: TTFB 488ms (this route is cached, so TTFB itself is fine) + **element render delay 938ms**. LCP element is the intro paragraph text (`<p class="mt-2 ... ">This page covers every Yono Rummy game...`), not an image.
**Why this matters:** Even with a fast, cached TTFB, over 900ms is being lost between "bytes arrived" and "text painted" — this is competing with font downloads (134.6KB, 2 requests, high priority) and the render-blocking CSS chunk before the LCP text node can paint. Category pages also carry the largest image payload of the three tested pages (37 images, 424KB) which shares bandwidth with the fonts/CSS during the critical path.
**Fix:**
1. Same as above — reducing homepage-style caching problems is already fixed here, so focus on trimming what blocks *render* of the LCP text: reduce font payload (see MEDIUM #2 below) and defer/lazy the below-the-fold parts of the app grid so the browser isn't contending for bandwidth/main-thread time while painting the LCP paragraph.
2. Preload only the font weights actually needed for above-the-fold text instead of the full variable-weight family.

---

### MEDIUM — `unoptimized` next/image usage inflates page weight (143–402KB per page)

**Evidence:** `Image` components with `unoptimized` are used in `app/page.js:295`, `app/[slug]/page.js:249`, and `components/AppCard.js:27`. Lighthouse `image-delivery-insight` flags:
- Homepage: **402KB** of estimated image savings
- `/category/rummy`: **384KB**
- `/joy-rummy`: **143KB**

Root-cause confirmed by inspecting actual source files vs. rendered size:
- `public/logo.webp` is a **2048×2048** source file (66,008 bytes) but is displayed at **32×32px** in the header (`<img src="/logo.webp" class="h-8 w-8 ...">`) — **99.98%** of the downloaded bytes (65,992 of 66,008) are wasted, on every single page load site-wide. Lighthouse also flags this file as `isLinkPreload: true` / `priority: High`, meaning it competes for bandwidth with fonts and critical CSS during first paint even though it isn't the actual LCP element on any tested page.
- App icons (e.g. `icons/mqmbet.webp`, `icons/dhan-games.webp`) are stored at **256×256** but displayed at **70×70px** in `AppCard.js` (`<Image ... fill sizes="80px" unoptimized>`) — each icon wastes ~8–18KB. With 30+ apps in the grid this adds up to the ~300–400KB reported by Lighthouse.
- Technical reason `sizes="80px"` has no effect: `unoptimized` disables Next's `srcset`/multi-resolution generation and the `/_next/image` resizing endpoint entirely, so the component just renders a plain `<img src>` pointing at the original file — the `sizes` attribute becomes meaningless because there's no responsive image set to pick from.

**Why this matters:** No LCP element on any tested page is currently an image (all three are text paragraphs), so this is not yet breaking the LCP threshold directly — but it materially inflates total transfer size (images are the single largest resource category on every page: 444KB/37 requests on the homepage, 424KB/37 on the category page), which is the biggest contributor to the "Needs Improvement" Speed Index (5.47s) on the homepage, adds real mobile data cost for the target India/Android audience, and will start hurting LCP/INP as the app catalog grows.

**Fix (keep the `unoptimized` workaround — it exists for a real VPS static-file-serving reason — but fix it at the source):**
1. Pre-resize and re-compress images to roughly the actual max display size × 2 (for retina) *before* they're uploaded to `public/`: logo → ~128×128px (not 2048×2048); app/game icons → ~140×140px (not 256×256).
2. Use `cwebp`/Squoosh/`sharp` in a build or upload script to batch-convert, rather than relying on next/image to do it at request time (since that's the exact capability being bypassed by `unoptimized`).
3. This preserves the deliberate `unoptimized` flag (no change needed to the VPS-quirk workaround) while eliminating essentially all of the wasted bytes Lighthouse is flagging.

---

### MEDIUM — Static image assets cached for only 1 hour

**Evidence:** Lighthouse `cache-insight` audit reports `cacheLifetimeMs: 3600000` (1 hour) on `/icons/*.webp` files, flagging estimated re-download savings of **295KB** (home), **280KB** (category), **70KB** (app page) for repeat visitors.
**Why this matters:** These icon/logo files are effectively static (they don't change per-request) but aren't cache-hashed filenames, so a 1-hour browser cache lifetime forces frequent re-downloads on repeat visits within the same session/day.
**Fix:** Set a long `Cache-Control` (e.g. `public, max-age=31536000, immutable` if filenames become content-hashed on change, or at minimum `public, max-age=604800` — one week — if filenames are stable and updated manually) for `/icons/*`, `/logo.webp`, and `/games/*` via `next.config.mjs` `headers()` or an Nginx `location` block, distinct from the app's dynamic HTML caching.

---

### LOW — Font payload is heavier than necessary (134.6KB, full variable-weight range, on every page)

**Evidence:** `app/layout.js` loads two **variable** fonts via `next/font/local` with `weight: "100 900"` (the full weight axis) for both `GeistVF.woff` (66.5KB) and `GeistMonoVF.woff` (68.1KB) = **134.6KB total, 2 requests**, present identically on every page tested (homepage, category, app). They are correctly self-hosted and preloaded (`Link: rel=preload; as="font"; crossorigin` in the response headers) — this is good practice and avoids FOIT/external-host round-trips, which is almost certainly why **CLS = 0 on all three pages**.
**Why this matters:** Loading the entire 100–900 weight axis for both a sans and a mono variable font is expensive if the site only actually uses a handful of discrete weights (e.g. 400/600/700 for body/headings). `GeistMonoVF` in particular is worth checking — if it's only used for a small amount of numeric/code-style text (or not used at all in visible content), it's 68KB paid on every page load for little benefit.
**Fix:** Audit actual `font-mono`/weight usage in the codebase; if only 2-4 discrete weights are used, either (a) switch to static (non-variable) font files subset to just those weights, or (b) subset the variable font's weight range, or (c) lazy-load `GeistMonoVF` only on pages/sections that actually render monospace text.

---

### LOW — Minor render-blocking CSS / legacy JS / unused JS

**Evidence:**
- `render-blocking-insight`: one render-blocking request, `_next/static/css/431b2ac6536948b2.css` (6.2KB) on all pages — normal Next.js critical CSS chunk, small.
- `legacy-javascript-insight`: ~11KB estimated savings (likely polyfills for older browser targets) on all pages.
- `unused-javascript`: ~21KB on `/category/rummy` and `/joy-rummy`.

**Why this matters:** These are small in absolute terms (single-digit-KB to low-tens-of-KB) and Total Blocking Time is already excellent (20–27ms, "Good") on every page, so this is not urgent. Included for completeness/prioritization only.
**Fix:** Low priority. If pursued: review `browserslist`/`next.config.mjs` target to reduce legacy transpilation output; audit for any imported-but-unused code in shared chunks.

---

### PASS / INFO — Things that are already correct, keep them

- **No third-party scripts at all.** Lighthouse `resource-summary` confirms `third-party: 0 requests, 0 bytes` on every page tested — no analytics/ad/chat widgets hijacking the main thread. This is the single biggest reason TBT is only 20–27ms across the board. **Do not add third-party scripts without re-testing INP impact.**
- **CLS = 0 on all three pages tested.** Images use `fill` inside explicitly sized containers, and fonts are preloaded/self-hosted, so there's no visible layout shift from image loading or web font swap.
- **Fonts are self-hosted and preloaded correctly** (no Google Fonts external round-trip, `rel=preload` + `crossorigin` present in HTTP headers) — good practice, keep it.
- **JS bundle is lean and well code-split**: 8 script requests totaling ~118.6KB transfer, `unused-javascript` and `unused-css-rules` score perfectly (1.0) on the homepage, `mainthread-work-breakdown` only 1.7s, `bootup-time` only 0.4s.

---

## Prioritized action list

| # | Severity | Fix | Expected impact |
|---|---|---|---|
| 1 | Critical | Make `/` statically generated / ISR like other routes (remove whatever is forcing dynamic rendering) | Homepage TTFB ~960ms → ~120-170ms; LCP and Speed Index both improve substantially |
| 2 | High | Reduce render-blocking font/CSS weight on category page template to close the 938ms LCP element-render-delay gap | `/category/rummy` LCP 2.8s → likely under 2.5s |
| 3 | Medium | Pre-resize/compress source images (logo 2048→~128px, icons 256→~140px) before upload; keep `unoptimized` flag | 143–402KB page-weight reduction per page; helps Speed Index and mobile data cost |
| 4 | Medium | Set long-lived `Cache-Control` for `/icons/*`, `/logo.webp`, `/games/*` | 70–295KB saved on repeat visits |
| 5 | Low | Audit and trim variable-font weight range / verify GeistMono usage | Up to ~68KB/page reduction, faster LCP text paint |
| 6 | Low | Minor legacy JS / unused JS cleanup | Single-digit-KB, low priority |

## Data-source limitations to flag to the coordinator

- PSI API and CrUX field data could not be retrieved in this run (429 rate limit on the public/unauthenticated quota). No `GOOGLE_API_KEY` appears to be configured for `pagespeed_check.py` in this environment. Recommend re-running `python3 scripts/pagespeed_check.py <url> --json` with a valid key outside the rate-limit window, and re-running `python3 scripts/crux_history.py` post-launch once the site accrues 28 days of Chrome UX Report traffic.
- All metrics in this report are single-run Lighthouse 13.4.1 lab data (mobile, simulated throttling) — directionally reliable but should be validated against field data once available.
