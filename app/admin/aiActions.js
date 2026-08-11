"use server";

import { GoogleGenAI } from "@google/genai";

/**
 * V5 CONTENT GENERATOR (V4 fixed + improved)
 *
 * Changes from V4:
 * 1. BUG FIX: SYSTEM_INSTRUCTION me ${name}, ${games}, ${minWithdraw} template
 *    variables the jo module level pe exist nahi karte (ReferenceError -> crash).
 *    Ab wahan plain placeholder text hai.
 * 2. RETRY LOOP: validation fail hone pe 1 automatic retry, validation errors
 *    feedback ke roop me prompt me daal kar. API call waste nahi hoti.
 * 3. META TITLE FORMATS: V1 wale rotation examples add kiye, V4 me missing the.
 *
 * Fixed on review before deploying:
 * - Model changed from "gemini-2.5-flash" (404s for this project's API key,
 *   confirmed earlier) to "gemini-flash-latest" (confirmed working).
 */

const SYSTEM_INSTRUCTION = `
You are an experienced SEO content writer for TheYonoRummy.com, a mobile gaming app directory focused primarily on Yono Rummy and related gaming apps.

Your job is NOT to stuff keywords.
Your job is to write useful, natural, fact-based content that answers what a real person searching for an app would want to know.

IMPORTANT:

1. FACTUAL ACCURACY
Only use facts provided in the APP DETAILS or EXTRA NOTES.
Never invent:
- download counts
- ratings
- withdrawal times
- bonus conditions
- referral amounts
- certifications
- licenses
- payment partners
- KYC rules
- game names
- company ownership
- backend relationships
- "official" status
- safety claims
- guaranteed winnings
- guaranteed withdrawals
- user reviews
- popularity claims

If a fact is not provided, simply do not claim it.
Do not turn assumptions into facts.

2. NATURAL WRITING
Write like a knowledgeable person explaining the app to another person.
Do NOT:
- repeat the app name in every sentence
- repeat the same sentence structure
- force exact-match keywords
- write filler just to increase word count
- use exaggerated marketing language
- make every app page follow exactly the same narrative

3. FORBIDDEN AI-SOUNDING WORDS
Never use:
enthusiasts, delve, moreover, furthermore, seamless, elevate, unlock, game-changer, revolutionize, cutting-edge, robust, look no further, in today's world, whether you are, testament, beacon, paramount, dive into, ultimate, realm, exciting, amazing, incredible, state-of-the-art, next-level, revolutionary, powerful, unparalleled

4. PUNCTUATION
Never use em-dash characters (—).
Use commas, periods, parentheses or normal hyphens instead.

5. HINGLISH
When language is Hinglish:
- use simple Indian conversational English
- naturally mix Hindi and English
- prefer "kare", "jaha", "hai"
- do not force Hindi into every sentence
- don't make the writing sound like translated Hindi

Exception: metaTitle, metaDescription and metaKeywords must ALWAYS be written in
plain English, regardless of the selected Language. These are for search engine
result pages, not for the on-page content. Only description, keyHighlights,
howToDownload and howToClaimBonus should follow the selected Language.

6. SEO PRINCIPLE
Search engines should be able to clearly understand:
- what the app is and what it is called
- how to download it
- what games/features it has
- bonus and withdrawal information if supplied
- common questions users have

Use semantic variations naturally.
Never target a keyword density percentage.

7. SEARCH INTENT
Think about why someone searched for this app: app name, APK download, latest version, login, registration, bonus, withdrawal, games, rummy, real or fake, review, referral, installation, Android availability.
Only cover intents supported by the supplied data.

8. UNIQUE CONTENT
Every generated app should have a different editorial angle.
Possible angles:
A. Download-first
B. Rummy/gameplay-first
C. Bonus-first
D. Withdrawal-first
E. App comparison
F. New-user guide
G. Login/registration-first
H. Game catalog-first
I. Practical review
J. Lightweight/performance angle

Choose the angle that best matches the supplied facts.
Do not mention the chosen angle in the output.

9. APP NAME PERSONALIZATION
Adapt the writing according to the name and supplied data.
If the app name contains:
- rummy: prioritize rummy/card gameplay
- slots: prioritize slots/spin games
- 777: prioritize number/spin games
- spin: prioritize spin/crash games
- vip: discuss premium/VIP features only when supported by facts
- teen/teen patti: prioritize Teen Patti only if supplied
- jackpot: discuss jackpot mechanics only if supplied
- aviator: discuss crash/Aviator gameplay only if supplied

Do not assume a game exists merely because its name suggests it.

10. KEYWORD USAGE
Naturally cover: app name, app name + apk, app name + apk download.
Secondary variations (only when they make sense): app name app, app name login, app name bonus, app name withdrawal, app name review, app name real or fake, app name games.
Do not repeat exact keywords unnaturally.

11. META TITLE
Keep approximately 45-60 characters when possible.
Prioritize: app name + primary intent + one useful differentiator.
Rotate naturally between formats like these (do not use the same format for every app):
- "APP_NAME APK Download - ₹BONUS Bonus"
- "Download APP_NAME APK | Get ₹BONUS Bonus"
- "APP_NAME App Download - ₹BONUS Free Bonus"
- "APP_NAME APK: ₹BONUS Bonus + Fast UPI"

Do not force every keyword into the title.

12. META DESCRIPTION
Approximately 140-165 characters.
Do not write clickbait claims unsupported by the supplied facts.

Open with ONE direct, concrete sentence that states what the app actually
is, its category, and its main hook, straight away, no throat-clearing.
Vary the opener across apps, never default to the same phrasing every time.
Pick or adapt naturally from structures like these:
- "APP_NAME is a popular real-money rummy platform that many players in
  India use for skill-based card games."
- "APP_NAME is a trending gaming app in India that offers a smooth and
  engaging experience for users who enjoy slot-style and card-based games."
- "APP_NAME is a real cash gaming platform where users can unlock a
  ₹BONUS welcome bonus and play exciting slot and spin-based games."
- "APP_NAME is a well-known Android app for rummy players who want to play
  and win real cash with fast withdrawals."
- "APP_NAME lets Indian users play card and casino-style games and claim a
  ₹BONUS signup bonus after registering."
- "APP_NAME is a growing real-money app built around rummy and card games,
  with a ₹BONUS welcome offer for new users."

After the opener, add one more clause with a real, supplied detail (bonus
amount, minimum withdrawal, or a specific game type) so the description
feels concrete, not generic. Never reuse the exact same sentence for two
different apps.

13. CONTENT QUALITY
Prefer specific information over generic statements.

Bad example:
"APP_NAME is a great app with many amazing features."

Better example:
"APP_NAME includes the games listed for it and mentions a minimum withdrawal amount, based on the information available for the app."

14. RISK / REAL-MONEY LANGUAGE
Do not promise earnings or winnings.
Do not say: guaranteed income, guaranteed profit, guaranteed withdrawal, risk-free, money-making guaranteed, safe money, win every time.
If the supplied data indicates real-money gaming, describe it neutrally.

15. OUTPUT
Return ONLY valid JSON.
No markdown. No explanation outside JSON.
All output fields must be strings.
Use clean HTML inside content fields: <p> <ul> <li> <ol> <strong>

16. DO NOT REPEAT APP SIZE / MINIMUM WITHDRAWAL
The app size may be mentioned in AT MOST ONE of these three sections:
description, keyHighlights, howToDownload. Never repeat it in more than one.
Apply the exact same rule to the minimum withdrawal amount: mention it in at
most one section total across the whole page. Repeating the same fact in
every section is padding, not useful content, and must be avoided.

17. APP PAGE TITLE
Also write an "appTitle" - this is the big H1 heading shown at the top of
the app's page itself (different from metaTitle, which is the browser tab /
search result snippet). It can read more naturally than metaTitle since real
visitors read it, not just search engines.

Rotate naturally between varied structures like these (do not default to the
same one every time, and do not reuse metaTitle's exact wording):
- "APP_NAME - Download & Get ₹BONUS Instant Bonus"
- "APP_NAME APK: India's Rummy App with ₹BONUS Signup Bonus"
- "Download APP_NAME and Claim Your ₹BONUS Welcome Bonus"
- "APP_NAME - Play, Win and Withdraw with Ease"
- "APP_NAME APK Download - ₹BONUS Bonus Inside"
- "Everything About APP_NAME: Download, Bonus and Games"
- "APP_NAME - Real Cash Gaming App with ₹BONUS Bonus"
- "APP_NAME APK 2026 - ₹BONUS Bonus, Fast Withdrawal"

Pick or adapt whichever fits the app's actual type and supplied facts best.
Never invent a benefit that was not supplied. Keep it to one clean line,
no em-dashes.
`;

function detectAppType(name, extraNotes = "") {
  const text = `${name} ${extraNotes}`.toLowerCase();
  if (text.includes("rummy")) return "rummy";
  if (text.includes("teen patti") || text.includes("teenpatti")) return "teenpatti";
  if (text.includes("aviator")) return "aviator";
  if (text.includes("slot")) return "slots";
  if (text.includes("777")) return "777";
  if (text.includes("spin")) return "spin";
  if (text.includes("vip")) return "vip";
  if (text.includes("arcade")) return "arcade";
  if (text.includes("jackpot")) return "jackpot";
  return "general";
}

function getAppTypeContext(type) {
  const contexts = {
    rummy: `
Focus on:
- rummy availability
- 13-card rummy if explicitly supplied
- tables/modes if supplied
- registration and download intent
- withdrawal information if supplied
`,
    teenpatti: `
Focus on:
- Teen Patti gameplay
- available modes
- registration/download
- withdrawal information if supplied
`,
    aviator: `
Focus on:
- Aviator/crash gameplay
- available game modes
- download and registration
- withdrawal information if supplied
`,
    slots: `
Focus on:
- slot games
- available titles
- spin/slot gameplay
- download and registration
`,
    "777": `
Focus on:
- 777/number-based games
- spin gameplay
- available game modes
- download and registration
`,
    spin: `
Focus on:
- spin games
- crash games if explicitly supplied
- available modes
- download and registration
`,
    vip: `
Focus on:
- VIP features only when supplied
- rewards or priority benefits only when supplied
`,
    arcade: `
Focus on:
- arcade/casual games
- available game modes
- lightweight or performance information only when supplied
`,
    jackpot: `
Focus on:
- jackpot-related games only when supplied
- available rewards/features
`,
    general: `
Give balanced coverage of the app based only on supplied information.
`,
  };
  return contexts[type] || contexts.general;
}

function buildPrompt({
  name,
  bonus,
  appSize,
  minWithdraw,
  language,
  extraNotes,
  existingData = {},
  retryFeedback = "",
}) {
  const appType = detectAppType(name, extraNotes);
  const appContext = getAppTypeContext(appType);

  const safeGames = Array.isArray(existingData.games)
    ? existingData.games.join(", ")
    : "";
  const safeFeatures = Array.isArray(existingData.features)
    ? existingData.features.join(", ")
    : "";

  return `
Create SEO content for this app page on TheYonoRummy.com.

========================
APP INFORMATION
========================
App Name:
${name}

Bonus:
₹${bonus}

App Size:
${appSize}

Minimum Withdrawal:
₹${minWithdraw}

Language:
${language}

Detected App Type:
${appType}

Additional Notes:
${extraNotes || "None"}

Games explicitly supplied:
${safeGames || "Not supplied"}

Features explicitly supplied:
${safeFeatures || "Not supplied"}

Existing structured app data:
${JSON.stringify(existingData, null, 2)}

========================
CONTENT DIRECTION
========================
${appContext}

Choose ONE natural editorial angle based on the available facts.
Do not announce or name the angle.
Do not invent missing information.

========================
SEO INTENT
========================
Primary entity:
"${name}"

Natural search variations:
"${name} apk"
"${name} apk download"

Potential secondary intents:
"${name} app"
"${name} login"
"${name} bonus"
"${name} withdrawal"
"${name} review"
"${name} real or fake"
"${name} games"

Use only relevant variations. Do NOT force all of them.

========================
CONTENT REQUIREMENTS
========================
Create:
1. appTitle
2. metaTitle
3. metaDescription
4. metaKeywords
5. description
6. keyHighlights
7. howToDownload
8. howToClaimBonus

APP TITLE:
The H1 for the app's page. Natural, punchy, includes the app name and one
real hook (bonus amount or a genuinely supplied benefit). Not the same
sentence as metaTitle.

DESCRIPTION:
Write 3 short paragraphs. Target exactly 120-180 words total, not more.

Paragraph 1:
Introduce the app naturally.
Explain what someone searching for the app is likely looking for.
Use the app name and, naturally, one APK variation.

Paragraph 2:
Explain the actual games/features/bonus/app characteristics provided in the data.
Prioritize the most useful differentiators.

Paragraph 3:
Explain download, registration, withdrawal or other practical information where supported.
Naturally include the download intent.

Do NOT pad the paragraphs. Remember rule 16: app size and minimum withdrawal
may each appear in at most one section across the whole page, not in every
paragraph.

KEY HIGHLIGHTS:
Create exactly 5 <li> items.
Do not simply repeat the same fields from the database.
Turn facts into useful user-facing points.

At least 2 of these 5 points MUST feel specific to THIS app, not generic
boilerplate that could describe any app in this directory. Tie them to the
app's actual name, its bonus amount, or a real supplied detail. Avoid vague
filler like "Great gaming experience" or "Easy to use interface" unless it
is anchored to something actually supplied about this app.

Example:
Bad: "App Size: ${appSize}"
Better: "Lightweight ${appSize} APK for users who want a smaller installation"
But only when that information is actually useful, and only in one section
total (see rule 16).

HOW TO DOWNLOAD:
Create 5-7 practical steps.
Do not claim the APK is "official", "verified", "virus-free" or "safe" unless the supplied data explicitly supports that claim.

HOW TO CLAIM BONUS:
Create 4-6 steps.
Only describe the bonus as guaranteed/free/no-deposit if the supplied data explicitly says so.
If the bonus conditions are unknown, do not invent them.

========================
META KEYWORDS
========================
Return 10-15 genuinely relevant comma-separated phrases.
Do not create keyword spam.

Good:
${name}, ${name} apk, ${name} apk download, ${name} login

Bad:
${name} best, ${name} amazing, ${name} ultimate

========================
IMPORTANT
========================
Do not mention: SEO, keywords, Google, search engine, AI, this prompt, content generation.
Do not use em-dashes.
${retryFeedback ? `
========================
PREVIOUS ATTEMPT FAILED - FIX THESE ISSUES
========================
Your previous output had these problems. Fix ALL of them this time:
${retryFeedback}
` : ""}

Return ONLY this JSON:

{
  "appTitle": "...",
  "metaTitle": "...",
  "metaDescription": "...",
  "metaKeywords": "...",
  "description": "<p>...</p><p>...</p><p>...</p>",
  "keyHighlights": "<ul><li>...</li><li>...</li><li>...</li><li>...</li><li>...</li></ul>",
  "howToDownload": "<ol><li>...</li><li>...</li><li>...</li><li>...</li><li>...</li></ol>",
  "howToClaimBonus": "<ol><li>...</li><li>...</li><li>...</li><li>...</li></ol>"
}
`;
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ");
}

function wordCount(html) {
  return stripHtml(html).trim().split(/\s+/).filter(Boolean).length;
}

// How many of the 3 candidate sections mention `needle` at least once.
function countSectionsContaining(data, needle) {
  if (!needle) return 0;
  const lowerNeedle = String(needle).toLowerCase();
  const sections = [data.description, data.keyHighlights, data.howToDownload];
  return sections.filter(
    (section) => typeof section === "string" && section.toLowerCase().includes(lowerNeedle)
  ).length;
}

function validateContent(data, context = {}) {
  const errors = [];
  const { appSize, minWithdraw } = context;

  const requiredKeys = [
    "appTitle",
    "metaTitle",
    "metaDescription",
    "metaKeywords",
    "description",
    "keyHighlights",
    "howToDownload",
    "howToClaimBonus",
  ];

  for (const key of requiredKeys) {
    if (typeof data[key] !== "string" || !data[key].trim()) {
      errors.push(`Missing or empty field: ${key}`);
    }
  }

  if (data.metaTitle) {
    if (data.metaTitle.length < 25 || data.metaTitle.length > 70) {
      errors.push("metaTitle should be 25-70 characters");
    }
  }

  if (data.metaDescription) {
    if (data.metaDescription.length < 120 || data.metaDescription.length > 170) {
      errors.push("metaDescription should be 120-170 characters");
    }
  }

  if (data.description) {
    const words = wordCount(data.description);
    if (words < 140 || words > 180) {
      errors.push(`description should be 120-180 words (got ${words})`);
    }
  }

  if (appSize && data.description && data.keyHighlights && data.howToDownload) {
    const count = countSectionsContaining(data, appSize);
    if (count > 1) {
      errors.push(
        `App size mentioned in ${count} sections; must appear in at most 1 of description/keyHighlights/howToDownload`
      );
    }
  }

  if (minWithdraw && data.description && data.keyHighlights && data.howToDownload) {
    const count = Math.max(
      countSectionsContaining(data, `₹${minWithdraw}`),
      countSectionsContaining(data, String(minWithdraw))
    );
    if (count > 1) {
      errors.push(
        `Minimum withdrawal mentioned in ${count} sections; must appear in at most 1 of description/keyHighlights/howToDownload`
      );
    }
  }

  const forbiddenWords = [
    "enthusiasts", "delve", "moreover", "furthermore", "seamless",
    "elevate", "unlock", "game-changer", "revolutionize", "cutting-edge",
    "robust", "look no further", "in today's world", "whether you are",
    "testament", "beacon", "paramount", "dive into", "ultimate", "realm",
    "exciting", "amazing", "incredible", "state-of-the-art", "next-level",
    "revolutionary", "powerful", "unparalleled",
  ];

  const contentString = JSON.stringify(data).toLowerCase();
  const foundForbidden = forbiddenWords.filter((word) =>
    contentString.includes(word.toLowerCase())
  );

  if (foundForbidden.length) {
    errors.push(`Forbidden wording detected: ${foundForbidden.join(", ")}`);
  }

  if (contentString.includes("—")) {
    errors.push("Em-dash detected");
  }

  return errors;
}

/**
 * Single generation attempt. Retry logic isko wrap karti hai.
 */
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
    return {
      data: null,
      errors: [`Invalid JSON returned by Gemini: ${error.message}`],
    };
  }

  const validationErrors = validateContent(data, {
    appSize: promptArgs.appSize,
    minWithdraw: promptArgs.minWithdraw,
  });
  return { data, errors: validationErrors };
}

export async function generateAppContent({
  name,
  bonus,
  appSize,
  minWithdraw,
  language = "Hinglish",
  extraNotes = "",
  existingData = {},
}) {
  if (!name || !bonus || !minWithdraw) {
    return {
      success: false,
      error: "App Name, Bonus and Minimum Withdrawal are required.",
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "GEMINI_API_KEY is not configured.",
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  const baseArgs = {
    name,
    bonus,
    appSize,
    minWithdraw,
    language,
    extraNotes,
    existingData,
  };

  const MAX_ATTEMPTS = 2;
  let lastResult = null;

  try {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const retryFeedback =
        attempt > 1 && lastResult?.errors?.length
          ? lastResult.errors.map((e) => `- ${e}`).join("\n")
          : "";

      lastResult = await attemptGeneration(ai, { ...baseArgs, retryFeedback });

      // Success: valid data, no errors
      if (lastResult.data && lastResult.errors.length === 0) {
        return {
          success: true,
          data: lastResult.data,
          metadata: {
            appType: detectAppType(name, extraNotes),
            generatedAt: new Date().toISOString(),
            attemptsUsed: attempt,
            descriptionWordCount: wordCount(lastResult.data.description),
          },
        };
      }

      console.log(
        `[generateAppContent] Attempt ${attempt} failed for "${name}": ${lastResult.errors.join("; ")}`
      );
    }

    // Dono attempts fail: partial data ke saath error return karo
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

export { detectAppType, getAppTypeContext };
