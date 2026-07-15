import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import App from '../../../../models/App';

export async function GET(request, { params }) {
  const { slug } = await params;
  const homeUrl = new URL('/', request.url);

  try {
    await dbConnect();

    const app = await App.findOne({ slug, isActive: true }).lean();

    if (!app || !app.referLink) {
      return NextResponse.redirect(homeUrl);
    }

    // Block search engine crawlers/ad bots from ever reaching the real affiliate link
    const userAgent = request.headers.get('user-agent') || '';
    if (/Googlebot|AdsBot-Google/i.test(userAgent)) {
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.redirect(app.referLink, 302);
  } catch (error) {
    console.error('Download redirect error:', error);
    return NextResponse.redirect(homeUrl);
  }
}
