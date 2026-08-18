/**
 * Auto-categorize apps by name. An app's name is checked against known
 * category keywords, and every keyword that matches gets added to its
 * `categories` array — an app can (and often should) land in more than one
 * category, e.g. "Jaiho Rummy" -> ["jaiho", "rummy"], "Spin 777" ->
 * ["spin", "777"].
 *
 * Existing categories are kept (merged, not overwritten) — this only adds
 * missing tags, it never removes a category someone set by hand.
 *
 * Loads .env / .env.local itself (no --env-file flag needed) and polyfills
 * global crypto for older Node (e.g. the VPS's Node 18, which lacks both
 * --env-file and the global Web Crypto API the mongodb driver needs).
 *
 * Usage:
 *   node scripts/categorizeApps.mjs            (dry run — prints changes, writes nothing)
 *   node scripts/categorizeApps.mjs --apply    (actually writes the changes)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { webcrypto } from "crypto";
if (!globalThis.crypto) globalThis.crypto = webcrypto;

// Resolve .env files relative to the project root (one level up from this
// script's own location), not relative to process.cwd() — so this works
// the same whether you run it from the project root or from scripts/.
const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv(relativePath) {
  const filePath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv(".env");
loadEnv(".env.local");

const mongoose = (await import("mongoose")).default;

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not set. Make sure .env or .env.local exists in the project root and defines it."
  );
}

// category -> substrings that, if found anywhere in the app name
// (case-insensitive), mean that category applies.
const CATEGORY_KEYWORDS = {
  rummy: ["rummy"],
  slots: ["slots", "slot"],
  spin: ["spin"],
  "777": ["777"],
  vip: ["vip"],
  diwa: ["diwa"],
  jaiho: ["jaiho"],
  bet: ["bet"],
};

// Every app is fundamentally a Yono-style real-money card/casino app first —
// if nothing else matched, it still belongs in rummy rather than being left
// uncategorized.
const DEFAULT_CATEGORY = "rummy";

function detectCategories(name) {
  const lower = String(name || "").toLowerCase();
  const detected = Object.entries(CATEGORY_KEYWORDS)
    .filter(([, keywords]) => keywords.some((kw) => lower.includes(kw)))
    .map(([category]) => category);
  return detected.length > 0 ? detected : [DEFAULT_CATEGORY];
}

const APPLY = process.argv.includes("--apply");

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ MongoDB Connected:", mongoose.connection.host);
  console.log(APPLY ? "Mode: APPLY (writing changes)\n" : "Mode: DRY RUN (no writes — pass --apply to commit)\n");

  const collection = mongoose.connection.db.collection("apps");
  const apps = await collection.find({}).sort({ position: 1 }).toArray();

  let changedCount = 0;
  const ops = [];

  for (const app of apps) {
    const existing = Array.isArray(app.categories) ? app.categories : [];
    const detected = detectCategories(app.name);
    const merged = Array.from(new Set([...existing, ...detected])).sort();
    const existingSorted = [...existing].sort();
    const changed = JSON.stringify(merged) !== JSON.stringify(existingSorted);

    if (!changed) {
      continue;
    }

    changedCount++;
    console.log(
      `[${APPLY ? "UPDATED" : "WOULD UPDATE"}] ${app.name} (${app.slug}): [${existing.join(", ") || "none"}] -> [${merged.join(", ")}]`
    );

    if (APPLY) {
      ops.push({
        updateOne: { filter: { _id: app._id }, update: { $set: { categories: merged } } },
      });
    }
  }

  if (APPLY && ops.length > 0) {
    const result = await collection.bulkWrite(ops);
    console.log(`\nWrote changes: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
  }

  console.log(`\nTotal apps: ${apps.length} | changed: ${changedCount}`);
  if (!APPLY && changedCount > 0) {
    console.log("This was a dry run — nothing was written. Re-run with --apply to commit these changes.");
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("❌ categorizeApps failed:", error);
  process.exit(1);
});
