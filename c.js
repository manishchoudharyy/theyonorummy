"use server";

import { GoogleGenAI } from "@google/genai";
import { CATEGORY_KEYWORDS } from "./categoryKeywords.js";

/**
 * CATEGORY CONTENT GENERATOR V1
 *
 * Category pages (/category/rummy, /category/slots, ...) ke liye content
 * generate karta hai, exactly categoryContent.js wale structure me:
 * { label, metaTitle, metaDescription, heroTitle, heroSubtitle, sections[] }
 *
 * App generator (V5) se same philosophy:
 * - fact grounding (sirf supplied facts)
 * - forbidden AI words + em-dash ban
 * - code-level validation + smart retry with feedback
 *
 * Naya isme:
 * - GKP keyword data (volume ke saath) prompt me jata hai, taaki content
 *   real search demand target kare
 * - Section headings har category me alag hon (template look se bachne
 *   ke liye - abhi sab categories ke headings identical hain jo HCU
 *   ke nazariye se risky pattern hai)
 */

const SYSTEM_INSTRUCTION = `
You are an experienced SEO content writer for TheYonoRummy.com, a directory of Yono Rummy apps and Yono Games network apps for Indian users.

You are writing content for CATEGORY PAGES. A category page lists all apps of one type (rummy, slots, 777, vip, spin, diwa) with a hero heading, a short hero paragraph, and an SEO content block of question-style sections below the app grid.

1. FACTUAL ACCURACY
Only use facts provided in CATEGORY DETAILS.
Never invent:
- specific app names not supplied
- download counts, ratings, user counts
- withdrawal times or processing speeds not supplied
- bonus conditions beyond the supplied range
- game titles not supplied
- safety/verification claims like "100% safe", "virus free", "official"
- licenses, certifications, company details

If a fact is not provided, do not claim it.

2. NATURAL WRITING
Write like a knowledgeable person explaining things, not like a template.
Do NOT:
- repeat the category keyword in every sentence
- reuse the same sentence structure across sections
- end every section with a summary-benefit sentence like "This helps users..." or "This way you can..."
- use phrases like "The purpose of this... is simple", "It is always better to", "Look no further"
- write filler to increase word count

Mix short and long sentences. Some sentences should be 5-8 words. Starting an occasional sentence with "But" or "So" is fine and encouraged.

3. FORBIDDEN AI-SOUNDING WORDS
Never use:
enthusiasts, delve, moreover, furthermore, seamless, elevate, unlock, game-changer, revolutionize, cutting-edge, robust, look no further, in today's world, whether you are, testament, beacon, paramount, dive into, ultimate, realm, exciting, amazing, incredible, state-of-the-art, next-level, revolutionary, powerful, unparalleled

4. PUNCTUATION
Never use em-dash characters (—). Use commas, periods, parentheses or normal hyphens.

5. KEYWORD USAGE (VERY IMPORTANT)
You will receive real Google search keywords for this category WITH monthly search volumes.

Rules:
- The highest-volume keyword is the primary keyword. It must appear in metaTitle, heroTitle, metaDescription, and the first section body.
- Work the top 4-6 keywords naturally into headings and bodies. Higher volume = higher priority.
- "list", "all", "new" and year variations (like "new yono slots", "yono slots list") map to real user intents: seeing the full list, finding new releases. Cover those intents in the content, not just the words.
- Never stuff. If a keyword doesn't fit a sentence naturally, use a close variation or skip it.
- Never target a keyword density.
- In body text, write keywords with natural capitalization ("Yono Slots", not "yono slots" mid-sentence).
- Never place two exact-match keywords in the same sentence.

6. RISK / REAL-MONEY LANGUAGE
Do not promise earnings or winnings. Never say: guaranteed income, guaranteed profit, guaranteed withdrawal, risk-free, win every time, 100% safe, 100% working.
Describe real-money gaming neutrally.

7. STRUCTURE VARIATION (VERY IMPORTANT)
Category pages must NOT all look identical. You will be told which headings other categories already use. Your section headings must differ in wording and, where sensible, in order and topic mix. Question-style headings are good, but vary the phrasing (e.g. "Which games do Yono Slots apps include?" vs "What game modes are available?" vs "Games you will find in most 777 apps").

8. SECTIONS CONTENT
Each section body: 50-90 words, one paragraph, plain text (no HTML).
Cover, across the sections, the intents users actually search: what this category is, bonus amounts, how to download/install, what games are inside, what is new/updated. You may merge or reframe these; do not force all five if fewer fit better.

9. META FIELDS
metaTitle: 45-60 characters where possible. Include primary keyword + year + one differentiator. Plain English.
metaDescription: 140-165 characters. Primary keyword early, one concrete supplied fact (bonus range or minimum withdrawal), no clickbait. Plain English.
heroTitle: the H1. Include the primary keyword and the year naturally. Not identical to metaTitle.
heroSubtitle: 1-2 sentences, max ~200 characters. What the page gives + one concrete supplied fact.

10. OUTPUT
Return ONLY valid JSON. No markdown, no explanation outside JSON.
`;

function buildPrompt({
  categorySlug,
  label,
  keywords,
  bonusMin,
  bonusMax,
  minWithdraw,
  year,
  gamesInside,
  extraNotes,
  existingHeadings,
  headings,
  retryFeedback = "",
}) {
  const keywordLines = keywords
    .map((k) => `- "${k.keyword}" (${k.volume.toLocaleString("en-IN")} searches/month)`)
    .join("\n");

  const existingHeadingsBlock =
    existingHeadings && existingHeadings.length
      ? `Headings ALREADY USED on other category pages (do not copy these wordings):\n${existingHeadings.map((h) => `- "${h}"`).join("\n")}`
      : "No other category headings supplied.";

  const hasCustomHeadings = Array.isArray(headings) && headings.length > 0;

  const sectionInstructions = hasCustomHeadings
    ? `The site owner has supplied the EXACT section headings. You MUST:
- Create exactly ${headings.length} sections
- Use these headings VERBATIM (same wording, same order, do not rephrase):
${headings.map((h, i) => `${i + 1}. "${h}"`).join("\n")}
- Write each body so it directly answers/covers its own heading. Do not
  drift into another heading's topic; each section owns its topic.`
    : `Create 4 to 6 sections. Across them, naturally cover the real intents behind
the keyword list (full list of apps, new releases, bonus, download, games
inside). Vary heading style from other categories.`;

  return `
Create content for the "${label}" category page on TheYonoRummy.com.

========================
CATEGORY DETAILS
========================
Category slug: ${categorySlug}
Category label: ${label}
Year to use: ${year}
Signup bonus range across apps: ₹${bonusMin} to ₹${bonusMax}
Minimum withdrawal: ₹${minWithdraw}
Games/modes found inside these apps (only mention these, nothing else):
${gamesInside || "Not supplied - keep game references generic"}
Extra notes: ${extraNotes || "None"}

========================
REAL SEARCH KEYWORDS (Google Keyword Planner data)
========================
${keywordLines}

The highest-volume keyword above is the PRIMARY keyword.

========================
STRUCTURE VARIATION
========================
${existingHeadingsBlock}

========================
REQUIREMENTS
========================
${sectionInstructions}

The minimum withdrawal amount (₹${minWithdraw}) may appear in AT MOST ONE
section body plus optionally the metaDescription or heroSubtitle. Do not
repeat it across multiple sections. Same rule for the bonus range: mention
the exact ₹${bonusMin}-₹${bonusMax} figures in at most two places total
across the whole output.
${retryFeedback ? `
========================
PREVIOUS ATTEMPT FAILED - FIX THESE ISSUES
========================
Your previous output had these problems. Fix ALL of them this time:
${retryFeedback}
` : ""}
Return ONLY this JSON:

{
  "label": "${label}",
  "metaTitle": "...",
  "metaDescription": "...",
  "heroTitle": "...",
  "heroSubtitle": "...",
  "sections": [
    { "heading": "...", "body": "..." },
    { "heading": "...", "body": "..." }
  ]
}
`;
}

function sectionWordCount(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

function validateContent(data, context = {}) {
  const errors = [];
  const { headings } = context;
  const hasCustomHeadings = Array.isArray(headings) && headings.length > 0;

  for (const key of ["label", "metaTitle", "metaDescription", "heroTitle", "heroSubtitle"]) {
    if (typeof data[key] !== "string" || !data[key].trim()) {
      errors.push(`Missing or empty field: ${key}`);
    }
  }

  if (hasCustomHeadings) {
    // Supplied headings mode: count must match, wording must match verbatim
    if (!Array.isArray(data.sections) || data.sections.length !== headings.length) {
      errors.push(
        `sections must have exactly ${headings.length} items matching the supplied headings (got ${Array.isArray(data.sections) ? data.sections.length : typeof data.sections})`
      );
    } else {
      headings.forEach((expected, i) => {
        const got = data.sections[i]?.heading;
        if (typeof got !== "string" || got.trim() !== expected.trim()) {
          errors.push(
            `sections[${i}].heading must be exactly "${expected}" (got "${got}")`
          );
        }
      });
    }
  } else if (!Array.isArray(data.sections) || data.sections.length < 4 || data.sections.length > 6) {
    errors.push(`sections must be an array of 4-6 items (got ${Array.isArray(data.sections) ? data.sections.length : typeof data.sections})`);
  }

  if (Array.isArray(data.sections)) {
    data.sections.forEach((sec, i) => {
      if (typeof sec?.heading !== "string" || !sec.heading.trim()) {
        errors.push(`sections[${i}].heading missing or empty`);
      }
      if (typeof sec?.body !== "string" || !sec.body.trim()) {
        errors.push(`sections[${i}].body missing or empty`);
      } else {
        const words = sectionWordCount(sec.body);
        // target 50-90, small buffer both sides
        if (words < 40 || words > 100) {
          errors.push(`sections[${i}].body should be 50-90 words (got ${words})`);
        }
        if (/<[a-z][^>]*>/i.test(sec.body)) {
          errors.push(`sections[${i}].body must be plain text, no HTML tags`);
        }
      }
    });
  }

  if (data.metaTitle && (data.metaTitle.length < 25 || data.metaTitle.length > 70)) {
    errors.push("metaTitle should be 25-70 characters");
  }
  if (data.metaDescription && (data.metaDescription.length < 120 || data.metaDescription.length > 175)) {
    errors.push("metaDescription should be 140-165 characters");
  }
  if (data.heroSubtitle && data.heroSubtitle.length > 240) {
    errors.push("heroSubtitle too long, keep under ~200 characters");
  }

  const forbiddenWords = [
    "enthusiasts", "delve", "moreover", "furthermore", "seamless",
    "elevate", "unlock", "game-changer", "revolutionize", "cutting-edge",
    "robust", "look no further", "in today's world", "whether you are",
    "testament", "beacon", "paramount", "dive into", "ultimate", "realm",
    "exciting", "amazing", "incredible", "state-of-the-art", "next-level",
    "revolutionary", "powerful", "unparalleled",
    // category-content specific AI patterns
    "the purpose of this", "it is always better", "this helps users",
    "100% safe", "100% working", "guaranteed withdrawal",
  ];

  const contentString = JSON.stringify(data).toLowerCase();
  const foundForbidden = forbiddenWords.filter((w) => contentString.includes(w));
  if (foundForbidden.length) {
    errors.push(`Forbidden wording detected: ${foundForbidden.join(", ")}`);
  }

  if (contentString.includes("—")) {
    errors.push("Em-dash detected");
  }

  return errors;
}

async function attemptGeneration(ai, promptArgs) {
  const prompt = buildPrompt(promptArgs);

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.85,
      topP: 0.95,
      responseMimeType: "application/json",
    },
  });

  if (!response?.text) {
    return { data: null, errors: ["Gemini returned an empty response."] };
  }

  let data;
  try {
    data = JSON.parse(response.text);
  } catch (error) {
    return { data: null, errors: [`Invalid JSON returned by Gemini: ${error.message}`] };
  }

  return { data, errors: validateContent(data, { headings: promptArgs.headings }) };
}

/**
 * @param {object} opts
 * @param {string} opts.categorySlug      e.g. "slots"
 * @param {string} opts.label             e.g. "Slots"
 * @param {Array<{keyword:string, volume:number}>} opts.keywords  GKP data, CATEGORY_KEYWORDS[slug]
 * @param {number} [opts.bonusMin=51]
 * @param {number} [opts.bonusMax=500]
 * @param {number} [opts.minWithdraw=100]
 * @param {string} [opts.gamesInside]     comma list of REAL games in these apps
 * @param {string} [opts.extraNotes]
 * @param {string[]} [opts.existingHeadings]  headings already live on other category pages
 * @param {string[]} [opts.headings]  EXACT section headings to write content for.
 *   Agar diye, to model inhi headings ke liye, isi order me, verbatim content
 *   likhega (4-6 wali auto mode band ho jati hai). Validation bhi verbatim
 *   match check karti hai.
 */
export async function generateCategoryContent({
  categorySlug,
  label,
  keywords,
  bonusMin = 51,
  bonusMax = 500,
  minWithdraw = 100,
  gamesInside = "",
  extraNotes = "",
  existingHeadings = [],
  headings = [],
}) {
  if (!categorySlug || !label) {
    return { success: false, error: "categorySlug and label are required." };
  }
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return { success: false, error: "keywords array (with volumes) is required." };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY is not configured." };
  }

  const ai = new GoogleGenAI({ apiKey });

  const baseArgs = {
    categorySlug,
    label,
    keywords: [...keywords].sort((a, b) => b.volume - a.volume),
    bonusMin,
    bonusMax,
    minWithdraw,
    year: new Date().getFullYear(),
    gamesInside,
    extraNotes,
    existingHeadings,
    headings,
  };

  const MAX_ATTEMPTS = 3;
  let lastResult = null;

  try {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const retryFeedback =
        attempt > 1 && lastResult?.errors?.length
          ? lastResult.errors.map((e) => `- ${e}`).join("\n")
          : "";

      lastResult = await attemptGeneration(ai, { ...baseArgs, retryFeedback });

      if (lastResult.data && lastResult.errors.length === 0) {
        return {
          success: true,
          data: lastResult.data,
          metadata: {
            categorySlug,
            generatedAt: new Date().toISOString(),
            attemptsUsed: attempt,
            primaryKeyword: baseArgs.keywords[0]?.keyword,
          },
        };
      }

      console.log(
        `[generateCategoryContent] Attempt ${attempt} failed for "${categorySlug}": ${lastResult.errors.join("; ")}`
      );
    }

    return {
      success: false,
      error: `Validation failed after ${MAX_ATTEMPTS} attempts: ${lastResult.errors.join("; ")}`,
      partialData: lastResult.data || null,
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || "An unexpected error occurred during content generation.",
    };
  }
}

const result = await generateCategoryContent({
  categorySlug: "slots",
  label: "Slots",
  keywords: CATEGORY_KEYWORDS.slots,
  gamesInside: "Fortune Gems, Mahjong-style slots, Dragon-themed slots, Ace games, Archer games, and classic 777 spins.",
  headings: [
    "What are Yono Slots ?",
    "Features of Yono Slots games",
    "How to download Yono Slots apps",
    "What games do you get in Yono Slots games",
  ],
});
console.log(JSON.stringify(result, null, 2));