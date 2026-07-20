import dbConnect from '../lib/db';
import App from '../models/App';

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

  const categories = Array.from(new Set(apps.flatMap((app) => app.categories || [])));
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
