# GEO / AI Search Readiness Audit — theyonorummy.com

**Audited:** 2026-08-18 | **Site status:** Pre-launch (not yet submitted to Google Search Console)
**Pages crawled:** Homepage, `/category/rummy`, `/category/slots`, `/category/vip`, `/joy-rummy`, `/yono-rummy`, `/slots-winner`
**Method:** Direct HTTP fetch (curl) of raw HTML + JSON-LD/robots/sitemap/llms.txt inspection. Site renders content server-side (Next.js SSR — verified target text present in raw, pre-JS HTML), so no headless-rendering gap for crawlers.

---

## GEO Readiness Score: 42 / 100

| Dimension | Weight | Score | Weighted |
|---|---|---|---|
| Citability | 25% | 45/100 | 11.3 |
| Structural Readability | 20% | 55/100 | 11.0 |
| Multi-Modal Content | 15% | 20/100 | 3.0 |
| Authority & Brand Signals | 20% | 10/100 | 2.0 |
| Technical Accessibility | 20% | 75/100 | 15.0 |
| **Total** | | | **42.3 ≈ 42/100** |

Interpretation: the site is **technically crawlable and well-structured for a directory**, but it has almost no independent authority/trust signal and no multi-modal or long-form citable content — the two dimensions AI answer engines weight most heavily for YMYL (money/gambling) topics. This is a very fixable pre-launch state, not a structural failure.

---

## 1. AI Crawler Access Status

`https://theyonorummy.com/robots.txt`:
```
User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://theyonorummy.com/sitemap.xml
```

| Crawler | Status | Notes |
|---|---|---|
| GPTBot | **Allowed** | Covered by `User-agent: *` |
| OAI-SearchBot | **Allowed** | Covered by `User-agent: *` |
| ClaudeBot | **Allowed** | Covered by `User-agent: *` |
| PerplexityBot | **Allowed** | Covered by `User-agent: *` |
| CCBot | Allowed (optional block not applied) | Currently allowed — see recommendation below |
| anthropic-ai | Allowed (optional block not applied) | Same as above |
| cohere-ai | Allowed (optional block not applied) | Same as above |

**Finding — Severity: Info.** The wildcard rule does **not** accidentally block any known AI crawler. Disallowing `/admin/` and `/api/` is correct and doesn't touch content routes. No `X-Robots-Tag` header and no `<meta name="robots">` tag were found on any crawled page (checked headers + HTML on homepage and an app page), so there's no conflicting robots signal either. This part of the setup is solid — no action required before launch.

**Recommendation — Severity: Low (optional).** Consider explicitly listing `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, and `PerplexityBot` as their own `User-agent:` blocks with `Allow: /` even though the wildcard already covers them. This is defensive: if a future edit adds a crawler-specific `Disallow` block by mistake, explicit allow-rules for the AI search bots reduce the chance of silently losing visibility. Not urgent.

---

## 2. llms.txt Status: Present but Thin — Severity: Medium

`https://theyonorummy.com/llms.txt` returns HTTP 200 and follows the basic llms.txt spec shape (H1 title, blockquote summary, `## Pages` section), but it is materially incomplete:

```
# TheYonoRummy
> Directory of verified Yono Rummy and real-money card-game apps...
## Pages
- [Homepage](https://theyonorummy.com/): Full directory of all listed apps
- [Sitemap](https://theyonorummy.com/sitemap.xml): Complete list of all app and category pages
## Notes
- ...
```

**Gaps:**
- **Only 2 links are listed** (homepage + sitemap.xml) out of 73+ app pages and 8 category pages. The `## Pages` section is meant to be a curated, annotated index of the site's most important content for LLMs that can't easily read a raw sitemap — pointing an LLM at the sitemap XML instead defeats the purpose (sitemap has no descriptions, no context, and is a different format LLMs aren't guaranteed to parse well).
- No `## Categories` section linking the 8 category pages (`/category/rummy`, `/category/slots`, `/category/vip`, `/category/jaiho`, `/category/777`, `/category/spin`, `/category/bet`, `/category/diwa`, `/category/jackpots`) with one-line descriptions.
- No representative sample of top app pages with descriptions (llms.txt best practice is to list the highest-value/most-authoritative pages, not just the root).
- No **RSL 1.0** licensing block (`license:` field or linked RSL XML). `https://theyonorummy.com/rsl.xml` and `/license.xml` both return 404. Given the "Optional block (training only)" guidance for CCBot/anthropic-ai/cohere-ai, an RSL declaration would let the site state machine-readable terms (e.g., allow indexing/citation, restrict bulk training reuse) rather than relying on robots.txt's blunt allow/deny.
- No `last updated` / version marker in the file itself, so LLM crawlers/tools can't tell if it's stale.

**Fix (effort: Low, ~1-2 hours):**
1. Expand `## Pages` to include all 8 category URLs with a one-line description each.
2. Add a `## Top Apps` section listing 15-20 of the most popular/highest-bonus apps by name + URL + one-line summary (bonus amount, category) — this gives LLMs concrete, citable facts instead of forcing them to crawl 73 pages.
3. Add a `## Legal` note pointing to a real disclaimer/responsible-gaming page once one exists (see Section 5).
4. Add an RSL 1.0 license reference (even a permissive one) at `/rsl.xml` and link it from llms.txt, e.g. `license: https://theyonorummy.com/rsl.xml`.

---

## 3. Citability Analysis (Passage-Level)

**Target: 134-167 words per self-contained answer passage.** Actual measured paragraph lengths on crawled pages:

| Page | Paragraph topic | Word count |
|---|---|---|
| Homepage | Intro summary | 45 |
| Homepage | "If you are searching for..." | 52 |
| Homepage | Signup bonus explainer | 68 |
| Homepage | Withdrawal explainer | 62 |
| `/category/rummy` | What is Yono Rummy | 52 |
| `/category/rummy` | Bonus/withdrawal | 68 |
| `/category/rummy` | How to download | 62 |
| `/category/slots` | What is Yono Slots | 83 |
| `/category/slots` | Bonus/withdrawal | 71 |
| `/category/vip` | What makes VIP different | 48 |

**Finding — Severity: High.** Every measured passage falls well short of the 134-167 word optimal citation length — most cluster at 40-85 words. These paragraphs read as fragments rather than complete, self-contained answers an LLM can lift verbatim and attribute. This is the single biggest citability gap on the site.

**Fix (effort: Medium):** Merge/expand the 2-3 short paragraphs under each category-page subsection (e.g. "Signup bonus" + "Withdrawal" already sit next to each other on `/category/rummy`) into single 140-160 word blocks that open with a direct one-sentence answer, then add supporting specificity (exact numbers, named apps, named states where restricted). Example restructure for `/category/rummy`:

> "What is the signup bonus for Yono Rummy apps? Most Yono Rummy apps credit a signup bonus between ₹51 and ₹500 after you register with your mobile number and verify an OTP — the exact amount is shown on each app's own page and can change with ongoing offers. [continue with withdrawal terms, UPI/bank transfer, ₹100 minimum, playthrough caveat] ..." (target ~150 words, single block, no line break mid-thought).

**Finding — Severity: Medium.** No paragraph opens with a direct answer to a question implied by its own heading — content is written as flowing marketing copy ("If you are searching for...") rather than "Q: [heading] A: [40-60 word direct answer] then supporting detail." This reduces extractability even where length is adequate.

**Fix:** Rewrite the first sentence of each content block to directly answer the heading above it in ≤40 words before adding supporting detail (see Section 4 for heading rewrites needed to pair with this).

---

## 4. Structural Readability (Headings)

**Finding — Severity: Medium.** Headings are mostly declarative/branded, not question-phrased, which limits their pickup by AI Overviews and answer engines that pattern-match on question-style H2/H3s.

Examples found:
- `/category/vip` H3s: "What makes Yono VIP apps different?" (good — question-style) sits alongside "Yono VIP bonus and withdrawal details" and "Installing a Yono VIP app on Android" (statement-style).
- `/joy-rummy`, `/yono-rummy`, `/slots-winner` (app template) H2s: "Description," "Key Highlights," "How To Download," "How To Claim Bonus," "Related Apps," "Important Legal Alert," "Platform Disclaimer" — all label-style, zero question-style.
- Homepage/category pages: H1/H2 are duplicated verbatim (e.g. `/category/rummy` H1 and H2 are both "Yono Rummy: All Yono Rummy Games List & APK Download 2026") — redundant, wastes a heading slot that could instead be a question.

**Fix (effort: Low, template-level change, applies to all 73 app pages at once):**
Rewrite the shared app-page template headings to question form:
- "Description" → "What is [App Name]?"
- "Key Highlights" → "What are the key features of [App Name]?" (or keep as a labeled bullet list under a question intro)
- "How To Download" → "How do I download the [App Name] APK?"
- "How To Claim Bonus" → "How do I claim the [App Name] signup bonus?"
- "Important Legal Alert" → "Is [App Name] legal in my state?"

Since these are shared template sections across ~73 pages, this is a single code change with directory-wide impact — highest leverage fix on the list.

**Positive finding — Severity: Info.** Breadcrumb structure (Home > Category > App) is present both visually and as `BreadcrumbList` JSON-LD on app pages — good for both traditional SEO and giving AI crawlers unambiguous entity hierarchy/context.

---

## 5. Authority & Brand Signals — Severity: Critical

This is the weakest dimension and the highest-risk gap given the site covers a YMYL (real-money gambling) topic, where AI answer engines apply extra trust filtering.

**Findings:**
- **No author, reviewer, or editorial byline anywhere.** Checked visible text and JSON-LD on all crawled pages — no `author`, no `reviewedBy`, no named person/team associated with the "personally checked" claims made throughout the copy (e.g. homepage: "We personally download and check every new app before listing it here").
- **No `datePublished`/`dateModified` in structured data.** A visible "Updated 12 Aug 2026" string exists on app pages, but it is not machine-readable (not in the `SoftwareApplication` JSON-LD, no `<meta>` equivalent) — AI systems that weight content freshness can't reliably parse it.
- **No `aggregateRating` in schema despite ratings being displayed to users.** Star ratings (4.0-4.3) are rendered on cards site-wide (visible in the React payload, e.g. `"rating":4.3`) but are **not** included in the `SoftwareApplication` JSON-LD as `aggregateRating`. This is a missed structured-data opportunity that also affects traditional rich-result eligibility.
- **No `sameAs` / social profile links anywhere on the site** — zero links to YouTube, Reddit, Wikipedia, LinkedIn, X/Twitter, Facebook, or Instagram were found in HTML or schema. Per the brand-mention correlation data, YouTube presence (~0.737 correlation) and Reddit presence are the strongest external signals tied to AI citation likelihood, and this site currently has zero footprint on either.
- **No About, Contact, Privacy Policy, Terms of Service, or Responsible Gaming page exists** — all of `/about`, `/about-us`, `/contact`, `/privacy`, `/privacy-policy`, `/terms`, `/terms-of-service`, `/disclaimer`, `/responsible-gaming` return HTTP 404. There is only a short inline "Platform Disclaimer" paragraph embedded in each app page's footer content. For a real-money gaming directory, the complete absence of any standalone trust/legal/entity page is a major E-E-A-T and GEO trust-signal gap — AI systems (and human users) have no page to point to that establishes who runs the site, how to contact them, or what data/privacy practices apply.
- **No Organization `sameAs`, no `founder`/`employee` entity, no physical address or business registration signal** in the `Organization` schema block (it only has `name`, `url`, `logo`).
- Brand is genuinely pre-launch/new, so zero external mentions (Wikipedia, Reddit threads, YouTube reviews, news coverage) is expected at this stage — this is a launch-plan item, not strictly a "broken" finding, but it should be tracked as the top post-launch priority since Domain Rating/backlinks are the *weakest* correlator (~0.266) while YouTube/Reddit/Wikipedia are the strongest.

**Fixes (prioritized):**
1. **(Critical, effort: Low)** Publish `/about`, `/privacy-policy`, `/terms`, and `/responsible-gaming` pages before launch/GSC submission. This is table-stakes for a real-money gaming site and directly supports both SEO and GEO trust scoring.
2. **(High, effort: Low)** Add an editorial byline/entity — even a simple "Reviewed by TheYonoRummy Editorial Team, last verified [date]" block, backed by `author`/`reviewedBy` in JSON-LD — to every app and category page.
3. **(High, effort: Low)** Add `aggregateRating` to the existing `SoftwareApplication` JSON-LD using the rating values already computed and rendered (4.0-4.3 range) — this is pure schema wiring, the data already exists in the app.
4. **(High, effort: Low)** Add `datePublished`/`dateModified` to `SoftwareApplication` JSON-LD, sourced from the same "Updated" date already displayed to users.
5. **(Medium, effort: Medium, post-launch)** Stand up a YouTube channel (even short APK-install/bonus-claim walkthrough videos per top app) and encourage/monitor Reddit discussion — these are the two strongest external correlators with AI citation and currently at zero.
6. **(Medium, effort: Low)** Add `sameAs` array to the `Organization` schema once any social profiles exist, and add visible footer links to them.

---

## 6. Multi-Modal Content — Severity: High

**Findings:**
- Only imagery found is small app icons (`/icons/*.webp`, ~512x512 logo). No screenshots of actual app UI, no explainer graphics, no video content, no comparison tables.
- No comparison table exists anywhere (e.g., a sortable/scannable table of "App | Bonus | Min Withdrawal | Rating" across all 73 apps) despite this being exactly the kind of structured, extractable data AI answer engines prefer to cite (tables are highly extractable and directly answer comparison-type queries like "which rummy app has the highest signup bonus").
- No FAQ block/schema on any crawled page (`FAQPage` schema type not found anywhere) despite the content already implicitly answering FAQ-style questions (bonus amount, withdrawal minimum, legality by state, install steps).

**Fix (effort: Medium):**
1. Add an HTML `<table>` + matching visual table on the homepage and each category page summarizing App / Bonus / Min. Withdrawal / Rating / State restrictions — this single asset is likely to become the most-cited element on the site for "best rummy app bonus" type AI queries.
2. Add a proper `FAQPage` JSON-LD block per app/category page built from the content that already exists (bonus amount, install steps, legal states) — this is largely a restructuring of existing copy into Q&A pairs plus schema markup, not new content creation.
3. (Lower priority, post-launch) 1-2 screenshots per app showing the actual registration/bonus screen would materially help both human trust and AI multimodal indexing.

---

## 7. Technical Accessibility — Severity: Info (mostly good)

**Positive findings:**
- Content is server-side rendered — verified target text (app names, descriptions, prices) is present in the raw pre-JS HTML response, not just in a client-hydrated shell. AI crawlers that don't execute JavaScript (most don't) will see full content.
- `sitemap.xml` is valid, includes `lastmod`/`changefreq`/`priority`, and is correctly referenced from `robots.txt`.
- HTML `lang="en"` is set at the document level — note this is **inconsistent** with the Hinglish (Romanized Hindi mixed with English) body copy found in app descriptions (see below), which could confuse language-detection heuristics used by some AI crawlers/indexers.
- Canonical tags present and correct on crawled pages.
- No blocking `X-Robots-Tag` header or conflicting `<meta name="robots">` tag found.
- Server responds quickly (nginx), HTTPS is used site-wide.

**Finding — Severity: Medium.** App description copy is written in Hinglish (Romanized Hindi, e.g. "Joy Rummy un card game players ke liye ek badhiya Android application hai..."), while `<html lang="en">` declares the page as English. This mixed-language content with an English lang tag can reduce citation quality in English-language AI answer engines (ChatGPT, Perplexity default English index) since the passages don't read as clean, directly-quotable English, and may also confuse language detection. If Hinglish is intentional for a Hindi-speaking user base, either mark the page/section with `lang="hi-Latn"` or add a clean English-language summary paragraph per app (134-167 words, per Section 3) alongside the Hinglish marketing copy so AI engines have a clean English passage to cite.

**Fix (effort: Medium):** Add one English-only "at a glance" summary paragraph (134-167 words) per app page, kept separate from the Hinglish marketing copy, specifically to serve as the citable passage for English-language AI answer engines.

---

## 8. Platform-Specific Readiness (Qualitative)

| Platform | Estimated Readiness | Reasoning |
|---|---|---|
| Google AI Overviews | Low-Medium | SSR + clean sitemap help crawlability, but thin authority signals (no author/about/privacy pages, no aggregateRating) will likely suppress AIO inclusion for YMYL content until trust pages exist. |
| ChatGPT (browsing/search) | Low | No llms.txt depth, no FAQ schema, short passages, and — critically — zero external brand footprint (no Reddit/YouTube/Wikipedia) mean there's currently nothing for ChatGPT's retrieval to have encountered or trust. |
| Perplexity | Low-Medium | Perplexity leans on well-structured, citable passages and tables; current passage lengths and lack of tables limit this, but explicit `PerplexityBot` access (allowed) and clean SSR HTML are a workable foundation once content is expanded. |
| Bing Copilot | Low-Medium | Similar to Google AIO — benefits from clean technical setup but held back by the same authority/trust gaps. |

Only ~11% of domains get cited by both ChatGPT and Google AI Overviews — given this site is pre-launch with zero backlinks/mentions, near-term expectations should be modest regardless of on-page fixes; the fixes above should be treated as pre-launch groundwork, not a guarantee of near-term citation.

---

## Top 5 Highest-Impact Changes (Prioritized)

| # | Fix | Dimension | Severity | Effort | Why it's high-impact |
|---|---|---|---|---|---|
| 1 | Publish About, Privacy Policy, Terms, and Responsible Gaming pages | Authority | Critical | Low | Zero trust/legal pages is the single biggest gap for a YMYL real-money gaming site — blocks both traditional E-E-A-T and AI trust filtering |
| 2 | Add `aggregateRating` + `datePublished`/`dateModified` to existing `SoftwareApplication` JSON-LD | Authority | High | Low | Data already exists in the app (ratings render on every card, "Updated" date renders on every page) — pure schema wiring, template-wide impact across 73 pages |
| 3 | Rewrite shared app-page template headings to question form ("How do I download [App]?", "Is [App] legal in my state?") | Structural Readability | High | Low | Single template change propagates across all 73 app pages instantly |
| 4 | Expand passages to 134-167 words with direct-answer openings on category pages + add comparison table of App/Bonus/Withdrawal/Rating | Citability + Multi-Modal | High | Medium | Directly targets the two lowest-scoring, most citation-relevant dimensions |
| 5 | Expand llms.txt with full category list, top-app summaries, and RSL 1.0 license reference | Technical/Citability | Medium | Low | Cheap, fast, gives LLM crawlers a curated map instead of forcing a 73-page crawl |

---

## Reference Data Points Used

- Files fetched and inspected: homepage (`/`), `/robots.txt`, `/llms.txt`, `/sitemap.xml`, `/category/rummy`, `/category/slots`, `/category/vip`, `/joy-rummy`, `/yono-rummy`, `/slots-winner`
- Sitemap contains 73 app pages + 8 category pages + homepage (82 URLs total)
- Legally-restricted-state disclosure found on app pages: Andhra Pradesh, Sikkim, Nagaland, Assam, Arunachal Pradesh, Tamil Nadu, Odisha, Telangana
