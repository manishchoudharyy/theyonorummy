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
  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 lg:text-2xl">
    All Yono Games Hub — Features, Bonus & Verified Links
  </h2>
  <p className="mt-3 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
    Agar aap internet par latest yono games ya unke verified application files dhoond rahe hain, toh aap bilkul sahi jagah aaye hain. Is directory par humne all yono games ko ek hi jagah list kiya hai taaki aapko alag-alag websites par bhatakna na pade. Har ek application ka withdrawal speed aur loading metrics personally test karne ke baad hi yahan index kiya jata hai.
  </p>

  <h3 className="mt-6 text-base font-bold text-slate-900">
    Yono Rummy aur Slots Apps me kitna Bonus milta hai?
  </h3>
  <p className="mt-2 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
    Jab aap is list se koi bhi yono rummy ya popular yono slots apps download karte hain, toh aapko registration ke time ₹51 se lekar ₹500 tak ka instant sign-up bonus dekhne ko mil sakta hai. In sabhi variants me minimum withdrawal limit standard ₹100 rakhi gayi hai, jise aap direct apne UPI id ya bank account me secure transfer kar sakte hain. Halanki, sabhi game operators apne rules time-to-time change karte rehte hain, isliye download karne ke baad official terms zaroor check karein.
  </p>

  <h3 className="mt-5 text-base font-bold text-slate-900">
    Yono 777 aur New Yono Games kaise download karein?
  </h3>
  <p className="mt-2 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
    Market me aane waale har ek premium arcade launch jaise yono 777 aur baaki sabhi new yono games ke safe redirect links yahan available hain. Hum direct official tracking nodes aur secure servers ka use karte hain taaki aapko koi corrupted ya unverified third-party APK file na mile. Humare system me direct updates integrated hain, jisse jab bhi koi naya update aayega, aapko hamesha secure working versions hi milenge.
  </p>

  <h3 className="mt-5 text-base font-bold text-slate-900">
    Zaroori Soochna aur Gaming Rules
  </h3>
  <p className="mt-2 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
    Real-money mobile gaming me financial risk hota hai aur iski aadat bhi lag sakti hai. Hamesha ek limited budget set karke hi khele aur kabhi bhi losses ko recover karne ke liye dimaag kharab na karein. Bharat ke kuch states me real-money card games par legal restrictions hain, isliye download karne se pehle apne local laws aur state guidelines ko zaroor check kar lein.
  </p>
</section>
      </main>

      {/* ================= Footer ================= */}
      <Footer />
    </div>
  );
}
