import dbConnect from '../lib/db';
import App from '../models/App';
import { FEATURED_CATEGORIES } from '../lib/categoryContent';

const SITE_URL = 'https://theyonorummy.com';

// Only attach lastModified when we actually have a real date for it — an
// absent field is honest (Google just won't use it as a freshness signal);
// a fabricated "now" on every regeneration is worse than no date at all.
function withLastModified(entry, date) {
  return date ? { ...entry, lastModified: new Date(date) } : entry;
}

// The most recent lastUpdated among a set of apps — this IS the real
// "content changed" signal for a page whose only dynamc content is that
// app list (homepage, category pages).
function mostRecentUpdate(apps) {
  const times = apps.map((a) => a.lastUpdated).filter(Boolean).map((d) => new Date(d).getTime());
  return times.length > 0 ? new Date(Math.max(...times)) : null;
}

export default async function sitemap() {
  await dbConnect();

  const apps = await App.find({ isActive: true }).select('slug lastUpdated categories').lean();

  const appEntries = apps.map((app) =>
    withLastModified(
      { url: `${SITE_URL}/${app.slug}`, changeFrequency: 'daily', priority: 0.8 },
      app.lastUpdated
    )
  );

  // Union with FEATURED_CATEGORIES so nav-linked category pages (slots,
  // 777, spin, vip, diwa) are always in the sitemap, even before any app
  // has actually been tagged with that category yet.
  const categories = Array.from(
    new Set([...apps.flatMap((app) => app.categories || []), ...FEATURED_CATEGORIES])
  );
  const categoryEntries = categories.map((category) => {
    const appsInCategory = apps.filter((app) => app.categories?.includes(category));
    return withLastModified(
      { url: `${SITE_URL}/category/${category}`, changeFrequency: 'daily', priority: 0.6 },
      mostRecentUpdate(appsInCategory)
    );
  });

  const staticEntries = [
    withLastModified(
      { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
      mostRecentUpdate(apps)
    ),
  ];

  // Legal/informational pages have no tracked "last changed" date behind
  // them (no CMS revision history) — omit lastModified rather than fake one.
  const legalPaths = ['about', 'contact', 'privacy-policy', 'terms', 'responsible-gaming'];
  const legalEntries = legalPaths.map((path) => ({
    url: `${SITE_URL}/${path}`,
    changeFrequency: 'monthly',
    priority: 0.3,
  }));

  return [...staticEntries, ...categoryEntries, ...appEntries, ...legalEntries];
}
