"use server";

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionToken } from "../../lib/adminAuth";
import dbConnect from "../../lib/db";
import App from "../../models/App";

// On this VPS, the running Next.js/PM2 process doesn't pick up files newly
// written to public/ until the process restarts (confirmed: new icon
// uploads 404 until `pm2 restart`). Fire a non-blocking restart right after
// a new logo file lands on disk so it shows up without any manual step.
// Never throws — if pm2 isn't available (e.g. local dev), this is a no-op.
function scheduleServerRestartForNewAsset() {
  if (process.env.NODE_ENV !== "production") return;
  const pm2Name = process.env.PM2_APP_NAME || "theyonorummy";
  exec(`pm2 restart ${pm2Name}`, (error) => {
    if (error) {
      console.error("Auto pm2 restart after logo upload failed:", error.message);
    }
  });
}

function safeCompare(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function loginAction(formData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");

  const validUsername = safeCompare(username, process.env.ADMIN_USERNAME || "");
  const validPassword = safeCompare(password, process.env.ADMIN_PASSWORD || "");

  if (!validUsername || !validPassword) {
    redirect("/admin/login?error=1");
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}

async function saveLogoFile(file, slug) {
  const safeSlug = slug.replace(/[^a-z0-9-]/g, "") || "app";
  const ext = (file.name.split(".").pop() || "webp")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") || "webp";
  const filename = `${safeSlug}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "icons");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);

  scheduleServerRestartForNewAsset();

  return `/icons/${filename}`;
}

async function parseAppFormData(formData) {
  const categories = String(formData.get("categories") || "")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);

  const keywords = String(formData.get("keywords") || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const slug = String(formData.get("slug") || "").trim().toLowerCase();

  let logo = String(formData.get("logo") || "").trim();
  const logoFile = formData.get("logoFile");
  const isUploadedFile =
    logoFile &&
    typeof logoFile === "object" &&
    typeof logoFile.arrayBuffer === "function" &&
    logoFile.size > 0;
  if (isUploadedFile) {
    logo = await saveLogoFile(logoFile, slug);
  }

  return {
    name: String(formData.get("name") || "").trim(),
    appTitle: String(formData.get("appTitle") || "").trim(),
    slug,
    logo,
    categories,
    bonus: String(formData.get("bonus") || "₹51").trim(),
    minWithdraw: Number(formData.get("minWithdraw")) || 100,
    appSize: String(formData.get("appSize") || "").trim(),
    version: String(formData.get("version") || "1.0.0").trim(),
    rating: Number(formData.get("rating")) || 0,
    ratingCount: Number(formData.get("ratingCount")) || 5000,
    downloads: String(formData.get("downloads") || "").trim(),
    isNewApp: formData.get("isNewApp") === "on",
    isTrending: formData.get("isTrending") === "on",
    isActive: formData.get("isActive") === "on",
    referLink: String(formData.get("referLink") || "").trim(),
    content: {
      description: String(formData.get("description") || "").trim(),
      keyHighlights: String(formData.get("keyHighlights") || "").trim(),
      howToDownload: String(formData.get("howToDownload") || "").trim(),
      howToClaimBonus: String(formData.get("howToClaimBonus") || "").trim(),
    },
    seo: {
      metaTitle: String(formData.get("metaTitle") || "").trim(),
      metaDescription: String(formData.get("metaDescription") || "").trim(),
      keywords,
    },
  };
}

export async function createApp(formData) {
  let created;
  try {
    await dbConnect();
    const data = await parseAppFormData(formData);

    const lastApp = await App.findOne({}).sort({ position: -1 }).lean();
    data.position = lastApp ? lastApp.position + 1 : 1;
    data.lastUpdated = new Date();
    created = await App.create(data);
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("createApp failed:", error);
    redirect(`/admin/apps/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/apps");
  redirect(`/admin/apps/${created._id}`);
}

export async function updateApp(id, formData) {
  let data;
  try {
    await dbConnect();
    data = await parseAppFormData(formData);
    data.lastUpdated = new Date();

    await App.findByIdAndUpdate(id, data, { runValidators: true });
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    console.error("updateApp failed:", error);
    redirect(`/admin/apps/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/apps");
  revalidatePath(`/${data.slug}`);
  redirect("/admin/apps");
}

export async function moveAppPosition(id, direction) {
  await dbConnect();

  const app = await App.findById(id).lean();
  if (!app) return;

  const neighbor = await App.findOne({
    position: direction === "up" ? { $lt: app.position } : { $gt: app.position },
  })
    .sort({ position: direction === "up" ? -1 : 1 })
    .lean();

  if (!neighbor) return;

  await App.findByIdAndUpdate(app._id, { position: neighbor.position });
  await App.findByIdAndUpdate(neighbor._id, { position: app.position });

  revalidatePath("/");
  revalidatePath("/admin/apps");
}

export async function deleteApp(id) {
  await dbConnect();

  const app = await App.findByIdAndDelete(id).lean();

  revalidatePath("/");
  revalidatePath("/admin/apps");
  if (app?.slug) revalidatePath(`/${app.slug}`);
}
