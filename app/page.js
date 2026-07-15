import Link from "next/link";
import dbConnect from "../lib/db";
import App from "../models/App";
import AppCard from "../components/AppCard";
import CategoryPills from "../components/CategoryPills";
import Footer from "../components/Footer";
import Header from "../components/Header";

export const metadata = {
  title: "TheYonoRummy — Best Rummy & Earning Apps Directory",
  description:
    "Hand-reviewed rummy and earning apps with verified referral bonuses. Compare ratings, bonuses, and minimum withdrawal before you download.",
};

export default async function HomePage() {
  await dbConnect();

  const apps = await App.find({ isActive: true }).sort({ position: 1 }).lean();

  const trendingApps = apps.filter((app) => app.isTrending);
  const trending =
    trendingApps.length > 0
      ? trendingApps.slice(0, 5)
      : [...apps].sort((a, b) => b.rating - a.rating).slice(0, 5);

  const categories = [
    "All",
    ...Array.from(new Set(apps.flatMap((app) => app.categories || []))),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ================= Header ================= */}
      <Header />

      <main className="mx-auto max-w-6xl px-4">
        {/* ================= Trust Hero ================= */}
        <section className="mt-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 p-5 lg:p-8">
          <span className="inline-flex rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-emerald-600">
            ✓ Verified Referral Links
          </span>
          <h1 className="mt-3 text-xl font-bold leading-tight lg:text-3xl">
            Best Rummy &amp; Earning Apps
          </h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-slate-600 lg:text-sm">
            Hand-reviewed apps with verified sign-up bonuses and safe referral
            links. Compare ratings and minimum withdrawal before you download.
          </p>
          <dl className="mt-4 grid grid-cols-3 gap-2 lg:max-w-md">
            {[
              [`${apps.length}+`, "Apps Listed"],
              ["₹51+", "Signup Bonus"],
              ["100%", "Verified Links"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl bg-white px-2 py-2.5 text-center"
              >
                <dd className="text-base font-bold text-emerald-600">{value}</dd>
                <dt className="text-[10px] font-medium text-slate-500">
                  {label}
                </dt>
              </div>
            ))}
          </dl>
        </section>

        {/* ================= Category Pills ================= */}
        <div className="mt-4">
          <CategoryPills categories={categories} />
        </div>

        {/* ================= Grid + Trending sidebar ================= */}
        <div className="mt-4 flex flex-col gap-8 pb-10 lg:flex-row">
          <section className="min-w-0 flex-1">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Top Rated Apps</h2>
              <Link
                href="/"
                className="text-[13px] font-semibold text-blue-600 hover:underline"
              >
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {apps.map((app) => (
                <AppCard key={app.slug} app={app} />
              ))}
            </div>
          </section>

          {/* Trending — desktop only */}
          <aside className="hidden w-80 shrink-0 lg:block">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="text-base font-bold">Trending Apps</h2>
              <ol className="mt-3 flex flex-col gap-3">
                {trending.map((app, i) => (
                  <li key={app.slug}>
                    <Link
                      href={`/${app.slug}`}
                      className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-slate-50"
                    >
                      <span className="w-4 text-sm font-bold text-slate-400">
                        {i + 1}
                      </span>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                        <img
                          src={app.logo}
                          alt={app.name}
                          width={40}
                          height={40}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {app.name}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {app.rating.toFixed(1)} ★ · {app.appSize}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </main>

      {/* ================= Footer ================= */}
      <Footer />
    </div>
  );
}
