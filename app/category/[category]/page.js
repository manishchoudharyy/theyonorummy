import Link from "next/link";
import { notFound } from "next/navigation";
import dbConnect from "../../../lib/db";
import App from "../../../models/App";
import AppCard from "../../../components/AppCard";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import { getCategoryContent, FEATURED_CATEGORIES, NAV_CATEGORIES } from "../../../lib/categoryContent";

const SITE_URL = "https://theyonorummy.com";

function toLabel(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export async function generateStaticParams() {
  await dbConnect();
  const dbCategories = await App.distinct("categories", { isActive: true });
  const navSlugs = NAV_CATEGORIES.map((c) => c.slug);
  const allSlugs = new Set([...dbCategories, ...FEATURED_CATEGORIES, ...navSlugs]);
  return Array.from(allSlugs).map((category) => ({ category }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const currentYear = new Date().getFullYear();
  const content = getCategoryContent(category);
  const label = content?.label || toLabel(category);
  const url = `${SITE_URL}/category/${category}`;

  const title = content?.metaTitle || `Yono ${label} Apps ${currentYear} — Download & Bonus Offers | TheYonoRummy`;
  const description =
    content?.metaDescription ||
    `Browse verified Yono ${label} apps with signup bonuses from ₹51 to ₹500. Compare ratings and find safe referral links for all Yono ${label} games.`;

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

  const content = getCategoryContent(category);
  const isNavCategory = NAV_CATEGORIES.some((c) => c.slug === category.toLowerCase());
  const isFeatured = FEATURED_CATEGORIES.includes(category.toLowerCase()) || isNavCategory;

  const apps = await App.find({ isActive: true, categories: category })
    .sort({ position: 1 })
    .lean();

  // Featured categories (linked from the navbar) stay live with their
  // content even before any app is tagged for them — a 404 here would mean
  // an indexed nav link points nowhere. Any other/unknown category with no
  // matching apps genuinely doesn't exist as a page.
  if (apps.length === 0 && !isFeatured) notFound();

  const label = content?.label || toLabel(category);
  const heroTitle = content?.heroTitle || `Yono ${label} Apps`;
  const heroSubtitle =
    content?.heroSubtitle ||
    `Verified Yono ${label} apps with signup bonuses from ₹51 to ₹500 and safe, tracked referral links.`;
  const categoryUrl = `${SITE_URL}/category/${category}`;

  // Same set as the navbar, minus whichever category we're already on —
  // "Other Categories" should always mirror what's actually in the nav.
  const otherCategories = NAV_CATEGORIES.filter(
    (c) => c.slug !== category.toLowerCase()
  );

  // Breadcrumb trail wants the short nav-style name ("Yono Slots"), not the
  // fuller page heading ("Yono Slots Apps") — different node, different
  // convention.
  const breadcrumbLabel =
    NAV_CATEGORIES.find((c) => c.slug === category.toLowerCase())?.label ||
    `Yono ${label}`;

  // BreadcrumbList: only nodes with a real, navigable URL. "Categories" is
  // shown in the visible breadcrumb below but is NOT a real page, so it's
  // deliberately left out here — Google requires `item` on every node
  // except the last one, and a fake/missing URL on a middle node is a
  // validation error in Search Console, not just a style nit.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: breadcrumbLabel, item: categoryUrl },
        ],
      },
      {
        "@type": "CollectionPage",
        name: heroTitle,
        description: heroSubtitle,
        url: categoryUrl,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: apps.length,
          itemListElement: apps.map((app, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: `${SITE_URL}/${app.slug}`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ================= Header ================= */}
      <Header />

      <main className="mx-auto max-w-6xl px-4">
        {/* ================= Breadcrumb ================= */}
        <nav aria-label="Breadcrumb" className="mt-3 text-[12px] text-slate-500">
          <Link href="/" className="hover:text-emerald-600">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span>Categories</span>
          <span className="mx-1.5">/</span>
          <span className="font-medium text-slate-700">{breadcrumbLabel}</span>
        </nav>

        {/* ================= Category Hero ================= */}
        <section className="mt-2 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 p-2 lg:p-6">
          <h1 className="text-xl font-bold leading-tight lg:text-3xl">{heroTitle}</h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-slate-600 lg:text-sm">
            {heroSubtitle}
          </p>
        </section>

        {/* ================= App Grid ================= */}
        <section className="mt-4 pb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">{heroTitle}</h2>
            <Link
              href="/"
              className="text-[13px] font-semibold text-blue-600 hover:underline"
            >
              ← All Apps
            </Link>
          </div>
          {apps.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {apps.map((app) => (
                <AppCard key={app.slug} app={app} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
              No {label} apps listed yet. Check back soon, or browse{" "}
              <Link href="/" className="font-semibold text-emerald-600 hover:underline">
                all Yono games
              </Link>{" "}
              in the meantime.
            </p>
          )}
        </section>

        {/* ================= Other Categories (internal linking) ================= */}
        {otherCategories.length > 0 && (
          <section className="mb-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Explore Other Categories
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {otherCategories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="flex items-center justify-center whitespace-nowrap rounded-xl bg-emerald-50 px-1.5 py-3.5 text-center text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 sm:text-sm"
                >
                  {c.label}
                </Link>
              ))}
              <Link
                href="/"
                className="flex items-center justify-center whitespace-nowrap rounded-xl bg-slate-100 px-1.5 py-3.5 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-200 sm:text-sm"
              >
                All Yono Games
              </Link>
            </div>
          </section>
        )}

        {/* ================= SEO Content ================= */}
        {content?.sections?.length > 0 && (
          <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 lg:p-8">
            {content.sections.map((sec) => (
              <div key={sec.heading} className="mb-5 last:mb-0">
                <h3 className="text-base font-bold text-slate-900">{sec.heading}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
                  {sec.body}
                </p>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* ================= Footer ================= */}
      <Footer />
    </div>
  );
}
