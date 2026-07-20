import Link from "next/link";
import dbConnect from "../lib/db";
import App from "../models/App";
import AppCard from "../components/AppCard";
import CategoryPills from "../components/CategoryPills";
import Footer from "../components/Footer";
import Header from "../components/Header";

const SITE_URL = "https://theyonorummy.com";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function generateMetadata({ searchParams }) {
  const currentYear = new Date().getFullYear();
  const resolvedSearchParams = await searchParams;
  const q = (resolvedSearchParams?.q || "").trim();
  const categoryFilter = (resolvedSearchParams?.category || "").trim();

  if (q) {
    return {
      title: `Search results for "${q}" | TheYonoRummy`,
      description: `Search results for "${q}" across all Yono Rummy and earning apps on TheYonoRummy.`,
      robots: { index: false, follow: true },
      alternates: { canonical: SITE_URL },
    };
  }

  if (categoryFilter) {
    const label = categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1);
    return {
      title: `Yono ${label} Apps ${currentYear} | TheYonoRummy`,
      description: `Browse verified Yono ${label} apps with signup bonuses from ₹51 to ₹500 and safe referral links.`,
      robots: { index: false, follow: true },
      alternates: { canonical: `${SITE_URL}/category/${categoryFilter}` },
    };
  }

  const title = `Yono Rummy Apps ${currentYear} — Download All Yono Games`;
  const description = `Download verified Yono Rummy apps in ${currentYear}. Get signup bonus from ₹51 to ₹500, compare ratings, and find safe referral links for all Yono games.`;

  return {
    title,
    description,
    alternates: { canonical: SITE_URL },
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: "TheYonoRummy",
      images: [{ url: "/logo.webp", width: 512, height: 512, alt: "TheYonoRummy" }],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/logo.webp"],
    },
  };
}

export default async function HomePage({ searchParams }) {
  await dbConnect();

  const resolvedSearchParams = await searchParams;
  const q = (resolvedSearchParams?.q || "").trim();
  const categoryFilter = (resolvedSearchParams?.category || "").trim().toLowerCase();

  const conditions = [{ isActive: true }];
  if (categoryFilter) {
    conditions.push({ categories: categoryFilter });
  }
  if (q) {
    const safeQ = escapeRegex(q);
    conditions.push({
      $or: [
        { name: { $regex: safeQ, $options: "i" } },
        { categories: { $regex: safeQ, $options: "i" } },
      ],
    });
  }
  const query = conditions.length > 1 ? { $and: conditions } : conditions[0];

  const [apps, distinctCategories] = await Promise.all([
    App.find(query).sort({ position: 1 }).lean(),
    App.distinct("categories", { isActive: true }),
  ]);

  const categories = ["All", ...distinctCategories];

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "TheYonoRummy",
        url: SITE_URL,
        logo: `${SITE_URL}/logo.webp`,
      },
      {
        "@type": "WebSite",
        name: "TheYonoRummy",
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "CollectionPage",
        name: "Yono Rummy Apps - Yono Games",
        description:
          "Directory of verified Yono Rummy and earning apps with signup bonuses and safe referral links.",
        url: SITE_URL,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: apps.length,
          itemListElement: apps.map((app, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${SITE_URL}/${app.slug}`,
            name: app.name,
          })),
        },
      },
    ],
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
          <p className="mt-1 max-w-xl text-justify text-[13px] leading-tight text-slate-600 lg:text-sm">
            Download all yono games in one place. As soon as a new yono games app is launched, we first download, use, and verify it ourselves before adding it here. Download any app from this yono games list and get a sign-up bonus from ₹51 up to ₹500.</p>
        </section>

        {/* ================= Category Pills ================= */}
        <div className="mt-4">
          <CategoryPills
            categories={categories}
            activeCategory={categoryFilter || "All"}
            inPlace
          />
        </div>

        {/* ================= Full App Grid ================= */}
        <section className="mt-4 pb-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {q
                ? `Search results for "${q}"`
                : categoryFilter
                  ? `Yono ${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Apps`
                  : "All Yono Games"}
            </h2>
            {(q || categoryFilter) && (
              <Link
                href="/"
                className="text-[13px] font-semibold text-blue-600 hover:underline"
              >
                {q ? "Clear search" : "Clear filter"}
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
              {q
                ? `No apps found for "${q}". Try a different search term.`
                : "No apps found in this category."}
            </p>
          )}
        </section>

        {/* ================= SEO Info Block ================= */}
        <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 lg:p-8">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 lg:text-2xl">
            All Yono Games List - Download All Yono Games Apps with Bonus
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
            Agar aap internet par latest yono games ya unke verified links dhundh rahe hain to aap bilkul sahi jagah aaye hai. The yono rummy par humne all yono games ko ek hi jagah list kiya hai taaki aapko alag-alag websites par bhatakna na pade. Har ek app ko personally use karne ke baad hi yaha list kiya jata hai.
          </p>

          <h3 className="mt-6 text-base font-bold text-slate-900">
            Yono Rummy aur Yono Slots Apps me kitna Bonus milta hai?
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
            Jab aap is list se koi bhi yono rummy ya popular yono slots apps download karte hai toh aapko registration ke time ₹51 se lekar ₹500 tak ka instant sign-up bonus dekhne ko milta hai. In sabhi apps me minimum withdrawal limit standard ₹100 rakhi gayi hai jise aap direct apne bank account me securely transfer kar sakte hain. Halanki  sabhi game operators apne rules time-to-time change karte rehte hain isliye download karne ke baad official terms zaroor check kare.
          </p>

          <h3 className="mt-5 text-base font-bold text-slate-900">
            Yono 777 aur New Yono Games kaise download kare?
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
            Market me aane waale har ek premium arcade launch jaise yono 777 aur baaki sabhi new yono games ke safe download links yaha available hai. Hum direct official tracking nodes aur secure servers ka use karte hai taaki aapko koi corrupted ya unverified third-party APK file na mile. Humare system me direct updates integrated hain jisse jab bhi koi naya update jaise signup bonus change ya new app version ya new download link aayega to aapko humari is website par sabse pahle update dekhne ko milega.
          </p>

          <h3 className="mt-5 text-base font-bold text-slate-900">
            Zaroori Soochna aur Gaming Rules
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
            Real money mobile gaming me financial risk hota hai aur iski aadat bhi lag sakti hai. Hamesha ek limited budget set karke hi khele aur kabhi bhi losses ko recover karne ke liye dimaag kharab na kare. Bharat ke kuch states me real money card games par legal restrictions hai isliye download karne se pehle apne local laws aur state guidelines ko zaroor check kar le.
          </p>
        </section>
      </main>

      {/* ================= Footer ================= */}
      <Footer />
    </div>
  );
}
