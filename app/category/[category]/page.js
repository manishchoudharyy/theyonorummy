import Link from "next/link";
import { notFound } from "next/navigation";
import dbConnect from "../../../lib/db";
import App from "../../../models/App";
import AppCard from "../../../components/AppCard";
import CategoryPills from "../../../components/CategoryPills";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";

const SITE_URL = "https://theyonorummy.com";

function toLabel(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export async function generateStaticParams() {
  await dbConnect();
  const categories = await App.distinct("categories", { isActive: true });
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const currentYear = new Date().getFullYear();
  const label = toLabel(category);
  const title = `Yono ${label} Apps ${currentYear} — Download & Bonus Offers | TheYonoRummy`;
  const description = `Browse verified Yono ${label} apps with signup bonuses from ₹51 to ₹500. Compare ratings and find safe referral links for all Yono ${label} games.`;
  const url = `${SITE_URL}/category/${category}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
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

export default async function CategoryPage({ params }) {
  const { category } = await params;
  await dbConnect();

  const [apps, distinctCategories] = await Promise.all([
    App.find({ isActive: true, categories: category }).sort({ position: 1 }).lean(),
    App.distinct("categories", { isActive: true }),
  ]);

  if (apps.length === 0) notFound();

  const categories = ["All", ...distinctCategories];

  const label = toLabel(category);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Yono ${label} Apps`,
    description: `Directory of verified Yono ${label} apps with signup bonuses and safe referral links.`,
    url: `${SITE_URL}/category/${category}`,
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
        {/* ================= Category Hero ================= */}
        <section className="mt-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 p-2 lg:p-6">
          <h1 className="text-xl font-bold leading-tight lg:text-3xl">
            Yono {label} Apps
          </h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-slate-600 lg:text-sm">
            Verified Yono {label} apps with signup bonuses from ₹51 to ₹500 and
            safe, tracked referral links.
          </p>
        </section>

        {/* ================= Category Pills ================= */}
        <div className="mt-4">
          <CategoryPills categories={categories} activeCategory={category} />
        </div>

        {/* ================= App Grid ================= */}
        <section className="mt-4 pb-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Yono {label} Apps</h2>
            <Link
              href="/"
              className="text-[13px] font-semibold text-blue-600 hover:underline"
            >
              ← All Apps
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {apps.map((app) => (
              <AppCard key={app.slug} app={app} />
            ))}
          </div>
        </section>
      </main>

      {/* ================= Footer ================= */}
      <Footer />
    </div>
  );
}
