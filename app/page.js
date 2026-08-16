import Link from "next/link";
import Image from "next/image";
import dbConnect from "../lib/db";
import App from "../models/App";
import AppCard from "../components/AppCard";
import CategoryPills from "../components/CategoryPills";
import Footer from "../components/Footer";
import Header from "../components/Header";

const SITE_URL = "https://theyonorummy.com";

// A curated set, not every game every app has (100-200 is normal per app).
// Real official sites we checked do the same thing: showcase the popular
// ones, not an exhaustive list nobody would scroll through.
const POPULAR_GAMES = [
  { file: "icon_Rummy.png", name: "Rummy" },
  { file: "icon_7-Up-down.png", name: "7 Up Down" },
  { file: "icon_ander-banar.png", name: "Andar Bahar" },
  { file: "icon_Dragon-Tiger.png", name: "Dragon Tiger" },
  { file: "icon_Crash.png", name: "Crash" },
  { file: "icon_wingo-lottery.png", name: "Wingo Lottery" },
  { file: "icon_Poker.png", name: "Poker" },
  { file: "icon_Roulette.png", name: "Roulette" },
  { file: "icon_Jhandi-Munda.png", name: "Jhandi Munda" },
  { file: "icon_Ludo.png", name: "Ludo" },
];

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

  const title = `Yono Rummy Games ${currentYear} | All Yono Games List`;
  const description = `Download Yono Rummy games and all Yono Games in ${currentYear}. Play rummy, slots, and card games with signup bonus from ₹51 to ₹500 and instant payment with ₹100 minimum withdrawal.`;

  return {
    title,
    description,
    alternates: { canonical: SITE_URL },
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: "The Yono Rummy",
      images: [{ url: "/logo.webp", width: 512, height: 512, alt: "The Yono Rummy" }],
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
        name: "The Yono Rummy",
        url: SITE_URL,
        logo: `${SITE_URL}/logo.webp`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "The Yono Rummy",
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "CollectionPage",
        name: "Yono Rummy Games - All Yono Games",
        "description": "Directory of Yono Rummy games and all Yono Games with signup bonus from ₹51 to ₹500 and ₹100 minimum withdrawal.",
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
            Yono Rummy Games - All Yono Games 2026
          </h1>
          <p className="mt-1 max-w-xl text-justify text-[13px] leading-tight text-slate-600 lg:text-sm">
            Find the complete list of Yono Rummy games along with all Yono Games in one place. We personally download and check every new app before listing it here. You can play rummy, slots, and other real money games, get a signup bonus from ₹51 to ₹500, and withdraw with a minimum of just ₹100.</p>
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

       <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 lg:p-8">
  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 lg:text-2xl">
    Yono Rummy Games & All Yono Games List 2026
  </h2>

  <p className="mt-3 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
    If you are searching for Yono Rummy games or the complete list of all Yono
    Games, you are on the right website. We have listed all Yono Rummy apps and
    other Yono Games in one place so you do not have to visit multiple
    websites. Every app added here is personally checked before it is
    published.
  </p>

  <p className="mt-3 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
    With this Yono Rummy games list you can find the latest apps, check the
    current signup bonus of each one, and download whichever you like. Along
    with Yono Rummy games, you will also find other popular Yono Games
    available on the same network, all sorted in one directory.
  </p>

  <h3 className="mt-6 text-base font-bold text-slate-900">
    How much bonus do Yono Rummy games offer?
  </h3>
  <p className="mt-2 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
    Most Yono Rummy games and other Yono Games currently offer a signup bonus
    between ₹51 and ₹500. The amount is different for each app. It can also
    change from time to time depending on ongoing offers. After you register,
    the bonus is usually credited to your wallet so you can start playing
    without making any deposit.
  </p>
  <p className="mt-2 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
    The minimum withdrawal on most of these apps is ₹100. You can withdraw
    through UPI or bank transfer once you reach the limit. One tip: after
    installing, check the latest bonus offer and withdrawal rules inside the
    app once, because these change more often than the apps themselves.
  </p>

  <h3 className="mt-6 text-base font-bold text-slate-900">
    How to download Yono Rummy games and all Yono Games?
  </h3>
  <p className="mt-2 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
    You can download any Yono Rummy game or other Yono Games directly from
    this website. Just click the download button on the app you want, allow
    installation from unknown sources in your phone settings, and install the
    APK file. After opening the app, register with your mobile number and
    verify the OTP. Your signup bonus gets credited right after that.
  </p>
  <p className="mt-2 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
    This website is updated regularly. Whenever a new Yono Rummy game or any
    other Yono Game is launched, or when an existing app changes its bonus or
    download link, we update the details here the same day. No need to hunt
    through old pages on other sites for working links.
  </p>

  <h3 className="mt-6 text-base font-bold text-slate-900">
    What type of games are available in Yono Games?
  </h3>
  <p className="mt-2 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
    Yono Rummy games mainly focus on rummy and card games. But many apps from
    the same network also include slots, 777 games, spin games, and other real
    money options. That is why this website covers both Yono Rummy games and
    the wider list of all Yono Games, whether you play only rummy or like
    trying different game styles.
  </p>
  <p className="mt-2 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
    Every app usually has 100-200 games inside it, so here are some of the
    most popular ones you will commonly find. The exact games available can
    differ from app to app, so always check the in-app game list after
    installing.
  </p>
  <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
    {POPULAR_GAMES.map((game) => (
      <div
        key={game.file}
        className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-center"
      >
        <div className="relative h-12 w-12 overflow-hidden rounded-lg">
          <Image
            src={`/games/${game.file}`}
            alt={`${game.name} game`}
            fill
            sizes="48px"
            unoptimized
            className="object-contain"
          />
        </div>
        <span className="text-[11px] font-semibold text-slate-700">{game.name}</span>
      </div>
    ))}
  </div>
</section>

        {/* ================= Gaming Rules ================= */}
        <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 lg:p-8">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 lg:text-2xl">
            Important Notice and Gaming Rules
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-slate-600 lg:text-sm">
            Real money mobile gaming carries financial risk and can become habit-forming. Always set a limited budget before you play, and never chase losses to try and recover them. Real money card games are legally restricted in some Indian states, so check your local laws and state guidelines before downloading.
          </p>
        </section>
      </main>

      {/* ================= Footer ================= */}
      <Footer />
    </div>
  );
}
