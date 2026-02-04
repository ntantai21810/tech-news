import { getDigests } from '@/lib/api';
import { format } from 'date-fns';

const BASE_URL = process.env.BLOG_URL || 'http://localhost:3000';

// Force dynamic rendering - sitemap needs fresh data
export const dynamic = 'force-dynamic';

export async function GET() {
  const digests = await getDigests(100);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/digest</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/category</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/search</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  ${digests
    .map((digest) => {
      const dateSlug = format(new Date(digest.date), 'yyyy-MM-dd');
      return `
  <url>
    <loc>${BASE_URL}/digest/${dateSlug}</loc>
    <lastmod>${digest.publishedAt || digest.date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
