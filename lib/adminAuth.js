const encoder = new TextEncoder();
const decoder = new TextDecoder();
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function toBase64Url(bytes) {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value) {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken() {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const payloadB64 = toBase64Url(encoder.encode(payload));
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  const sigB64 = toBase64Url(new Uint8Array(signature));
  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(token) {
  if (!token || !token.includes(".")) return false;

  const [payloadB64, sigB64] = token.split(".");

  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sigB64),
      encoder.encode(payloadB64)
    );
    if (!valid) return false;

    const payload = JSON.parse(decoder.decode(fromBase64Url(payloadB64)));
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
