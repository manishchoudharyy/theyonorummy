"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

function parseAppFormData(formData) {
  const categories = String(formData.get("categories") || "")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);

  const keywords = String(formData.get("keywords") || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const faqQuestions = formData.getAll("faqQuestion");
  const faqAnswers = formData.getAll("faqAnswer");
  const faq = faqQuestions
    .map((question, i) => ({
      question: String(question).trim(),
      answer: String(faqAnswers[i] || "").trim(),
    }))
    .filter((f) => f.question && f.answer);

  return {
    name: String(formData.get("name") || "").trim(),
    slug: String(formData.get("slug") || "").trim().toLowerCase(),
    logo: String(formData.get("logo") || "").trim(),
    categories,
    bonus: String(formData.get("bonus") || "₹51").trim(),
    minWithdraw: Number(formData.get("minWithdraw")) || 100,
    appSize: String(formData.get("appSize") || "").trim(),
    version: String(formData.get("version") || "1.0.0").trim(),
    rating: Number(formData.get("rating")) || 0,
    downloads: String(formData.get("downloads") || "").trim(),
    isNewApp: formData.get("isNewApp") === "on",
    isTrending: formData.get("isTrending") === "on",
    isActive: formData.get("isActive") === "on",
    referLink: String(formData.get("referLink") || "").trim(),
    content: {
      description: String(formData.get("description") || "").trim(),
      whyChoose: String(formData.get("whyChoose") || "").trim(),
      howToDownload: String(formData.get("howToDownload") || "").trim(),
      additionalInfo: String(formData.get("additionalInfo") || "").trim(),
    },
    faq,
    seo: {
      metaTitle: String(formData.get("metaTitle") || "").trim(),
      metaDescription: String(formData.get("metaDescription") || "").trim(),
      keywords,
    },
  };
}

export async function createApp(formData) {
  await dbConnect();
  const data = parseAppFormData(formData);

  let created;
  try {
    const lastApp = await App.findOne({}).sort({ position: -1 }).lean();
    data.position = lastApp ? lastApp.position + 1 : 1;
    data.lastUpdated = new Date();
    created = await App.create(data);
  } catch (error) {
    redirect(`/admin/apps/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/admin/apps");
  redirect(`/admin/apps/${created._id}`);
}

export async function updateApp(id, formData) {
  await dbConnect();
  const data = parseAppFormData(formData);
  data.lastUpdated = new Date();

  try {
    await App.findByIdAndUpdate(id, data, { runValidators: true });
  } catch (error) {
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
