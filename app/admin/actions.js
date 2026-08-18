"use server";

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { createSessionToken } from "../../lib/adminAuth";
import dbConnect from "../../lib/db";
import App from "../../models/App";

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

  revalidateTag("apps");
  revalidatePath("/");
  revalidatePath("/admin/apps");
  redirect(`/admin/apps/${created._id}?created=1`);
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

  revalidateTag("apps");
  revalidatePath("/");
  revalidatePath("/admin/apps");
  revalidatePath(`/${data.slug}`);
  redirect("/admin/apps?updated=1");
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

  revalidateTag("apps");
  revalidatePath("/");
  revalidatePath("/admin/apps");
}

// Move an app straight to an arbitrary position, shifting everything
// between its old and new spot by one to keep positions dense (1..N) with
// no gaps or duplicates.
export async function setAppPosition(id, newPosition) {
  await dbConnect();

  const app = await App.findById(id).lean();
  if (!app) return;

  // Clamp against the real highest position value in the collection, not
  // the document count — the two can drift apart if positions ever end up
  // with gaps (e.g. from an app being deleted), so count alone could stop
  // an admin short of the true last slot.
  const highest = await App.findOne({}).sort({ position: -1 }).select("position").lean();
  const maxPosition = highest?.position || 1;
  const target = Math.max(1, Math.min(Math.round(Number(newPosition)) || 1, maxPosition));
  const current = app.position;

  if (target === current) return;

  if (target < current) {
    // Moving earlier: everything from target..current-1 shifts down by one.
    await App.updateMany(
      { position: { $gte: target, $lt: current } },
      { $inc: { position: 1 } }
    );
  } else {
    // Moving later: everything from current+1..target shifts up by one.
    await App.updateMany(
      { position: { $gt: current, $lte: target } },
      { $inc: { position: -1 } }
    );
  }

  await App.findByIdAndUpdate(app._id, { position: target });

  revalidateTag("apps");
  revalidatePath("/");
  revalidatePath("/admin/apps");
}

export async function deleteApp(id) {
  await dbConnect();

  const app = await App.findByIdAndDelete(id).lean();

  revalidateTag("apps");
  revalidatePath("/");
  revalidatePath("/admin/apps");
  if (app?.slug) revalidatePath(`/${app.slug}`);
}
