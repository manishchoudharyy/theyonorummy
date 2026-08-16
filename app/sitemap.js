import dbConnect from '../lib/db';
import App from '../models/App';
import { FEATURED_CATEGORIES } from '../lib/categoryContent';

const SITE_URL = 'https://theyonorummy.com';

export default async function sitemap() {
  await dbConnect();

  const apps = await App.find({ isActive: true }).select('slug lastUpdated categories').lean();

  const appEntries = apps.map((app) => ({
    url: `${SITE_URL}/${app.slug}`,
    lastModified: app.lastUpdated ? new Date(app.lastUpdated) : new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Union with FEATURED_CATEGORIES so nav-linked category pages (slots,
  // 777, spin, vip, diwa) are always in the sitemap, even before any app
  // has actually been tagged with that category yet.
  const categories = Array.from(
    new Set([...apps.flatMap((app) => app.categories || []), ...FEATURED_CATEGORIES])
  );
  const categoryEntries = categories.map((category) => ({
    url: `${SITE_URL}/category/${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  const staticEntries = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  return [...staticEntries, ...categoryEntries, ...appEntries];
}
