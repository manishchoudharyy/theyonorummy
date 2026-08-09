"use server";

import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You write plain, natural text for a simple mobile app review directory. Write like an everyday human typing a casual review or guide online.

CRITICAL WRITING STYLE & RHYTHM RULES:
1. NATURAL HUMAN BURSTINESS: Avoid robotic uniform sentence lengths. Do NOT make every sentence 5-6 words long. Mix it up completely! 
   - Some sentences should be very short (3-5 words).
   - Some sentences should be long, informal, and flowing naturally across multiple ideas without breaking early. 
   - Write organically. Humans don't follow rigid grammar patterns.
2. SIMPLE WORDS ONLY: Use simple everyday words. 15-year-old readability. No fancy vocabulary.
3. STRICT FORBIDDEN WORDS & PHRASES (NEVER USE):
   - English AI words: enthusiasts, delve, moreover, furthermore, seamless, elevate, unlock, game-changer, revolutionize, cutting-edge, robust, look no further, in today's world, whether you are, testament, beacon, paramount, dive into, ultimate, realm.
   - Punctuation: NEVER use em-dashes (—).
4. FORBIDDEN HINGLISH SPELLINGS (STRICT MATCHING):
   - NEVER use "karein" -> Always write "kare"
   - NEVER use "jahan" -> Always write "jaha"
   - NEVER use "hain" -> Always write "hai" (for both singular and plural)
   - NEVER use textbook formal Hindi. Write casual daily spoken Hinglish.

KEYWORD INTEGRATION RULES (CRITICAL FOR SEO):
Include these 3 keyword variations naturally without forcing them or making them sound awkward:
1. "{appname}"
2. "{appname} apk"
3. "{appname} apk download"

OUTPUT FORMAT RULES:
Return ONLY a valid JSON object. Every key must be a STRING (never an Array).
Use standard HTML tags (<p>, <ul>, <li>, <ol>) inside the JSON string values so it fits directly into a rich-text database.
`;

function buildPrompt({ name, bonus, appSize, minWithdraw, language, extraNotes }) {
  return `
Write content for this app:
- App Name: ${name}
- Bonus: ₹${bonus}
- App Size: ${appSize}
- Minimum Withdraw: ₹${minWithdraw}
- Output Language: ${language} (English or Hinglish)
${extraNotes ? `- Extra Notes / Unique Features: ${extraNotes}` : ""}

Required SEO Keywords to naturally weave in:
- "${name}"
- "${name} apk"
- "${name} apk download"

Required JSON Structure (All values MUST be HTML formatted STRINGS, not Arrays):
{
  "description": "<p>Human-style introduction to ${name} and the signup bonus. Mix sentence lengths naturally.</p><p>Paragraph about available games and ₹${minWithdraw} minimum withdrawal.</p>",
  "whyChoose": "<ul><li>Feature 1 highlighting ${name} apk advantages</li><li>Feature 2 about low withdrawal</li><li>Feature 3 about app size (${appSize})</li><li>Feature 4 about safety and payouts</li></ul>",
  "howToDownload": "<ol><li>Step 1 mentioning ${name} apk download</li><li>Step 2 to allow unknown sources</li><li>Step 3 to install file</li><li>Step 4 to register and claim ₹${bonus} bonus</li></ol>",
  "additionalInfo": "<p>1-2 sentences about Refer & Earn commission and a game suggestions (according to the app name) to play and short risk warning.</p>"
}
`;
}

export async function generateAppContent({
  name,
  bonus,
  appSize,
  minWithdraw,
  language = "Hinglish",
  extraNotes = "",
}) {
  if (!name || !bonus || !appSize) {
    return { success: false, error: "App Name, Bonus, and App Size are required to generate content." };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY is not configured on the server." };
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt({ name, bonus, appSize, minWithdraw, language, extraNotes });

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });
  } catch (error) {
    return { success: false, error: error.message || "Gemini request failed." };
  }

  let data;
  try {
    data = JSON.parse(response.text);
  } catch {
    return { success: false, error: "AI response was not valid JSON." };
  }

  const requiredKeys = ["description", "whyChoose", "howToDownload", "additionalInfo"];
  const missing = requiredKeys.filter((key) => typeof data[key] !== "string" || !data[key].trim());
  if (missing.length > 0) {
    return { success: false, error: `AI response was missing: ${missing.join(", ")}.` };
  }

  return { success: true, data };
}
