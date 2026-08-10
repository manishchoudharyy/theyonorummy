"use server";

import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You write plain, natural text for a simple mobile app directory. Write like a normal person explaining an app casually.

CRITICAL WRITING STYLE RULES:
1. Write naturally. Mix short and long sentences. Some sentences can be 4-6 words. Some can be longer and flow naturally.
2. Use simple everyday words only. Write like a 15-16 year old would speak.
3. Write in casual Hinglish when language is Hinglish. Do not use formal or textbook Hindi.
4. NEVER use these words/phrases: enthusiasts, delve, moreover, furthermore, seamless, elevate, unlock, game-changer, revolutionize, cutting-edge, robust, look no further, in today's world, whether you are, testament, beacon, paramount, dive into, ultimate, realm, exciting, amazing, incredible.
5. NEVER use em-dashes (—).
6. For Hinglish: Use "kare", "jaha", "hai" instead of formal versions like "karein", "jahan", "hain".

KEYWORD RULES (VERY IMPORTANT):
Naturally include these 3 variations in the description:
- "{appname}"
- "{appname} apk"
- "{appname} apk download"

Do not force them. Make them fit naturally in the sentences.

OUTPUT RULES:
- Return ONLY a valid JSON object.
- All values must be strings (not arrays).
- Use simple HTML tags: <p>, <ul>, <li>, <ol>
`;

function buildPrompt({ name, bonus, appSize, minWithdraw, language, extraNotes }) {
  return `
Write content for this app:

App Name: ${name}
Bonus: ₹${bonus}
App Size: ${appSize}
Minimum Withdrawal: ₹${minWithdraw}
Language: ${language}
${extraNotes ? `Extra Notes: ${extraNotes}` : ""}

Required Keywords (use naturally in description):
- "${name}"
- "${name} apk"
- "${name} apk download"

Return this exact JSON structure:

{
  "description": "<p>Write 2 short paragraphs about the app. First paragraph should introduce ${name} and mention the signup bonus. Second paragraph should talk about games available and ₹${minWithdraw} minimum withdrawal. Naturally include the keywords ${name}, ${name} apk and ${name} apk download. Keep total length between 140-200 words. Write casually.</p>",
  
  "keyHighlights": "<ul><li>Point about current bonus</li><li>Point about minimum withdrawal</li><li>Point about app size or performance</li><li>Point about games or referral</li><li>One more useful point</li></ul>",
  
  "howToDownload": "<ol><li>Click the Download button on this page to get ${name} apk</li><li>Go to Settings and allow Install from Unknown Sources</li><li>Open the downloaded APK file and tap Install</li><li>Open the app after installation</li><li>Register with your mobile number</li></ol>",
  
  "howToClaimBonus": "<ol><li>Open ${name} after installing</li><li>Tap on Sign Up</li><li>Enter your mobile number</li><li>Enter the OTP you receive</li><li>Your ₹${bonus} bonus will be added to wallet automatically</li></ol>"
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
    return { success: false, error: "App Name, Bonus, and App Size are required." };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY is not configured." };
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildPrompt({ name, bonus, appSize, minWithdraw, language, extraNotes });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.75,
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text);

    const requiredKeys = ["description", "keyHighlights", "howToDownload", "howToClaimBonus"];
    const missing = requiredKeys.filter((key) => typeof data[key] !== "string" || !data[key].trim());
    
    if (missing.length > 0) {
      return { success: false, error: `Missing fields: ${missing.join(", ")}` };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message || "Failed to generate content." };
  }
}