import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import dbConnect from "../../lib/db";
import App from "../../models/App";
import AppCard from "../../components/AppCard";
import FaqAccordion from "../../components/FaqAccordion";
import LegalAlert from "../../components/LegalAlert";
import PlatformDisclaimer from "../../components/PlatformDisclaimer";
import Footer from "../../components/Footer";

const getApp = cache(async (slug) => {
  await dbConnect();
  return App.findOne({ slug, isActive: true }).lean();
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const app = await getApp(slug);
  if (!app) return {};
  return {
    title:
      app.seo?.metaTitle ||
      `${app.name} APK Download — ${app.bonus} Bonus | TheYonoRummy`,
    description:
      app.seo?.metaDescription ||
      `Download ${app.name} and get ${app.bonus} signup bonus. ${app.appSize}. Min withdrawal ₹${app.minWithdraw}.`,
    keywords: app.seo?.keywords || [],
  };
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const full = s <= Math.floor(rating);
        const half = !full && s === Math.ceil(rating) && rating % 1 >= 0.5;
        return (
          <svg key={s} viewBox="0 0 20 20" className="h-4 w-4">
            {half ? (
              <>
                <defs>
                  <linearGradient id={`h${s}`}>
                    <stop offset="50%" stopColor="#FBBF24" />
                    <stop offset="50%" stopColor="#E2E8F0" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#h${s})`}
                  d="M10 1l2.4 5 5.6.8-4 3.9.9 5.5L10 13.5l-4.9 2.7.9-5.5L2 6.8l5.6-.8z"
                />
              </>
            ) : (
              <path
                fill={full ? "#FBBF24" : "#E2E8F0"}
                d="M10 1l2.4 5 5.6.8-4 3.9.9 5.5L10 13.5l-4.9 2.7.9-5.5L2 6.8l5.6-.8z"
              />
            )}
          </svg>
        );
      })}
    </div>
  );
}

const proseClasses =
  "flex flex-col gap-3 text-[15px] leading-[1.7] text-slate-600 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 [&_strong]:font-semibold [&_strong]:text-slate-900";

export default async function AppPage({ params }) {
  const { slug } = await params;
  const app = await getApp(slug);
  if (!app) notFound();

  await dbConnect();
  const categoryMatches = await App.find({
    isActive: true,
    slug: { $ne: app.slug },
    categories: { $in: app.categories },
  })
    .sort({ position: 1 })
    .limit(8)
    .lean();

  const remainingSlots = 8 - categoryMatches.length;
  const excludedSlugs = [app.slug, ...categoryMatches.map((a) => a.slug)];

  const fillerApps =
    remainingSlots > 0
      ? await App.find({
          isActive: true,
          slug: { $nin: excludedSlugs },
        })
          .sort({ position: 1 })
          .limit(remainingSlots)
          .lean()
      : [];

  const relatedApps = [...categoryMatches, ...fillerApps];

  const faqJsonLd = app.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: app.faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* ══════════ TOP NAV ══════════ */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.webp"
              alt="TheYonoRummy"
              className="h-7 w-7 rounded-lg object-cover"
            />
            <span className="text-base font-bold text-slate-900">TheYonoRummy</span>
          </Link>
          <Link
            href="/"
            className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <svg
              viewBox="0 0 9 16"
              className="h-3.5 w-2 stroke-slate-600"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 1L1 8l7 7" />
            </svg>
            All Apps
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-2 pb-2 lg:pb-10">

        {/* ══════════ BREADCRUMB ══════════ */}
        <nav
          aria-label="Breadcrumb"
          className="mt-3 flex flex-wrap items-center gap-1 text-[11px] font-medium text-slate-400"
        >
          <Link href="/" className="hover:text-emerald-600">Home</Link>
          <span>/</span>
          <Link href="/" className="uppercase hover:text-emerald-600">All Apps</Link>
          {app.categories?.[0] && (
            <>
              <span>/</span>
              <Link href="/" className="uppercase hover:text-emerald-600">
                {app.categories[0]}
              </Link>
            </>
          )}
        </nav>

        {/* ══════════ H1 TITLE ══════════ */}
        <h1 className="mt-3 text-xl font-extrabold leading-snug text-slate-900 lg:text-3xl">
          {app.name} APK Download —{" "}
          <span className="text-emerald-600">{app.bonus} Bonus</span>
        </h1>

        {/* ══════════ CATEGORY TAGS ══════════ */}
        {app.categories?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {app.categories.map((tag) => (
              <Link
                key={tag}
                href="/"
                className="rounded-md bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-blue-700"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        <p className="mt-1 text-xs font-semibold text-slate-400">
          Updated {formatDate(app.lastUpdated)}
        </p>

        {/* ══════════════════════════════════════════════════════
            2-COLUMN GRID — works on mobile (grid-cols-2) AND desktop
            Left  → Logo + Download CTA + Bonus pill + Rating
            Right → Spec table
        ══════════════════════════════════════════════════════ */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
        <div className="grid grid-cols-2 gap-3">

          {/* ── COL 1: Logo + CTA ── */}
          <div className="flex flex-col gap-2.5">

            {/* Logo (1:1) */}
            <div className="mx-auto aspect-square w-32 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:w-40">
              <img
                src={app.logo}
                alt={`${app.name} APK`}
                className="h-full w-full object-contain p-2"
              />
            </div>

            {/* Download CTA */}
            <a
              href={`/api/download/${app.slug}`}
              className="flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500 text-[13px] font-extrabold tracking-wide text-white shadow-md shadow-emerald-200 transition active:scale-[.98] hover:bg-emerald-600"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-white">
                <path d="M10 14l-5-5h3V3h4v6h3l-5 5zm-7 2h14v2H3v-2z" />
              </svg>
              DOWNLOAD
            </a>

            {/* Telegram CTA */}
            <a
              href="#"
              className="flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-blue-500 text-[13px] font-extrabold tracking-wide text-white shadow-md shadow-blue-200 transition active:scale-[.98] hover:bg-blue-600"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.014 9.488c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.6l-2.95-.924c-.64-.203-.654-.64.136-.948l11.532-4.448c.535-.194 1.003.13.364 1.968z" />
              </svg>
              TELEGRAM
            </a>
          </div>

          {/* ── COL 2: Rating + Spec Table ── */}
          <div className="flex flex-col gap-3">
            {/* Rating */}
            <div className="flex flex-col gap-1 rounded-xl border border-slate-100 px-3 py-2.5">
              <StarRating rating={app.rating} />
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold text-slate-900">
                  {app.rating.toFixed(1)}
                </span>
                <span className="text-[11px] text-slate-400">/5</span>
              </div>
              <p className="text-[10px] text-slate-400">{app.downloads} downloads</p>
            </div>

            {/* Spec table */}
            <div className="rounded-2xl border border-slate-100 px-3 py-0.5 h-fit">
              {[
                ["Signup Bonus", app.bonus],
                ["Min. Withdraw", `₹${app.minWithdraw}`],
                ["Size", app.appSize],
                ["Downloads", app.downloads],
                ["Updated", formatDate(app.lastUpdated)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-0 border-b border-slate-100 py-1 last:border-0"
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    {label}
                  </span>
                  <span className="text-[12px] font-bold text-slate-800 leading-tight">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>

        {/* ══════════ SEO CONTENT ══════════ */}
        {(app.content?.description ||
          app.content?.whyChoose ||
          app.content?.howToDownload ||
          app.content?.additionalInfo) && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
            {app.content?.description && (
              <article>
                <h2 className="mb-3 text-lg font-bold text-slate-900">
                  About {app.name}
                </h2>
                <div
                  className={proseClasses}
                  dangerouslySetInnerHTML={{ __html: app.content.description }}
                />
              </article>
            )}

            {app.content?.whyChoose && (
              <article className="mt-6">
                <h2 className="mb-3 text-lg font-bold text-slate-900">
                  Why Choose {app.name}?
                </h2>
                <div
                  className={proseClasses}
                  dangerouslySetInnerHTML={{ __html: app.content.whyChoose }}
                />
              </article>
            )}

            {app.content?.howToDownload && (
              <article className="mt-6">
                <h2 className="mb-3 text-lg font-bold text-slate-900">
                  How To Download {app.name}
                </h2>
                <div
                  className={proseClasses}
                  dangerouslySetInnerHTML={{ __html: app.content.howToDownload }}
                />
              </article>
            )}

            {app.content?.additionalInfo && (
              <article className="mt-6">
                <h2 className="mb-3 text-lg font-bold text-slate-900">
                  Additional Info
                </h2>
                <div
                  className={proseClasses}
                  dangerouslySetInnerHTML={{ __html: app.content.additionalInfo }}
                />
              </article>
            )}
          </div>
        )}

        {/* ══════════ RELATED APPS ══════════ */}
        {relatedApps.length > 0 && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-2">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Related Apps
            </h2>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {relatedApps.map((relatedApp) => (
                <AppCard key={relatedApp.slug} app={relatedApp} />
              ))}
            </div>
          </section>
        )}

        {/* ══════════ FAQ ══════════ */}
        {app.faq?.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <FaqAccordion faqs={app.faq} />
          </section>
        )}

        {/* ══════════ LEGAL & DISCLAIMER ══════════ */}
        <div className="mt-8 flex flex-col gap-4 pb-4">
          <LegalAlert />
          <PlatformDisclaimer />
        </div>
      </main>

      {/* ══════════ STICKY BOTTOM BAR — mobile only ══════════ */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <a
          href={`/api/download/${app.slug}`}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-[14px] font-extrabold text-white shadow-md active:scale-[.98]"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5 fill-white">
            <path d="M10 14l-5-5h3V3h4v6h3l-5 5zm-7 2h14v2H3v-2z" />
          </svg>
          DOWNLOAD — {app.bonus} Bonus
        </a>
      </div>

      <Footer />
    </div>
  );
}