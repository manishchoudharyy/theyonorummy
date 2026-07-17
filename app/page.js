import Link from "next/link";
import dbConnect from "../lib/db";
import App from "../models/App";
import AppCard from "../components/AppCard";
import CategoryPills from "../components/CategoryPills";
import Footer from "../components/Footer";
import Header from "../components/Header";

const SITE_URL = "https://theyonorummy.com";

export async function generateMetadata() {
  const currentYear = new Date().getFullYear();
  return {
    title: `Yono Rummy Apps ${currentYear} — Download All Yono Games`,
    description: `Download verified Yono Rummy apps in ${currentYear}. Get signup bonus from ₹51 to ₹500, compare ratings, and find safe referral links for all Yono games.`,
  };
}

export default async function HomePage({ searchParams }) {
  await dbConnect();

  const resolvedSearchParams = await searchParams;
  const q = (resolvedSearchParams?.q || "").trim().toLowerCase();

  const allApps = await App.find({ isActive: true }).sort({ position: 1 }).lean();

  const apps = q
    ? allApps.filter(
        (app) =>
          app.name.toLowerCase().includes(q) ||
          app.categories?.some((c) => c.toLowerCase().includes(q))
      )
    : allApps;

  const categories = [
    "All",
    ...Array.from(new Set(allApps.flatMap((app) => app.categories || []))),
  ];

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Yono Rummy Apps - Yono Games",
    description:
      "Directory of verified Yono Rummy and earning apps with signup bonuses and safe referral links.",
    url: SITE_URL,
    itemListElement: apps.map((app, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/${app.slug}`,
      name: app.name,
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      {/* ================= Header ================= */}
      <Header />

      <main className="mx-auto max-w-6xl px-4">
        {/* ================= Trust Hero ================= */}
        <section className="mt-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 p-2 lg:p-6">
          <h1 className="text-xl font-bold leading-tight lg:text-3xl">
            Yono Rummy Apps - Yono Games
          </h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-slate-600 lg:text-sm">
            Download all yono games and get bonus upto 51₹ to 500₹. Download
            latest yono rummy games.
          </p>
        </section>

        {/* ================= Category Pills ================= */}
        <div className="mt-4">
          <CategoryPills categories={categories} />
        </div>

        {/* ================= Full App Grid ================= */}
        <section className="mt-4 pb-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {q ? `Search results for "${q}"` : "All Yono Games"}
            </h2>
            {q && (
              <Link
                href="/"
                className="text-[13px] font-semibold text-blue-600 hover:underline"
              >
                Clear search
              </Link>
            )}
          </div>
          {apps.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {apps.map((app) => (
                <AppCard key={app.slug} app={app} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
              No apps found for &quot;{q}&quot;. Try a different search term.
            </p>
          )}
        </section>

        {/* ================= SEO Info Block ================= */}
        <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 lg:p-8">
          <h2 className="text-lg font-bold text-slate-900 lg:text-xl">
            About Real-Money Rummy &amp; Earning Apps
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
            TheYonoRummy lists real-money rummy and card-game apps from the
            Yono Games network. Every listing below is checked before
            publishing — here&apos;s what that means in practice.
          </p>

          <h3 className="mt-5 text-sm font-bold text-slate-900">
            Signup Bonuses &amp; Minimum Withdrawal
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
            Most apps in this directory offer a one-time signup bonus
            ranging from ₹51 to ₹500 upon registration. Minimum withdrawal
            amounts are typically ₹100 and are processed via UPI or bank
            transfer. Bonus amounts and withdrawal terms are set by each
            individual app and can change without notice — always check the
            current terms inside the app before playing.
          </p>

          <h3 className="mt-4 text-sm font-bold text-slate-900">
            Verified Referral Tracking
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
            Every download link on this site routes through a tracked
            referral redirect. This confirms the link you click points to
            the app&apos;s official server rather than an unverified or
            forwarded APK file, and lets us keep listings current.
          </p>

          <h3 className="mt-4 text-sm font-bold text-slate-900">
            Play Responsibly
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
            Real-money rummy carries financial risk and can be
            habit-forming. Set a budget before you play, avoid chasing
            losses, and stop if it stops being fun. Rummy is restricted or
            banned in some Indian states — confirm your local regulations
            before downloading.
          </p>
        </section>
      </main>

      {/* ================= Footer ================= */}
      <Footer />
    </div>
  );
}
