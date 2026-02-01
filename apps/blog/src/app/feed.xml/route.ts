import { getDigests } from '@/lib/api';
import { format } from 'date-fns';

export async function GET() {
  const digests = await getDigests(20);
  const baseUrl = process.env.BLOG_URL || 'http://localhost:3000';

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tech Intelligence - Daily Digests</title>
    <description>AI-curated daily tech news covering JavaScript, TypeScript, Next.js, NestJS, Node.js, and AI/ML.</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${digests
      .map((digest) => {
        const date = new Date(digest.date);
        const dateSlug = format(date, 'yyyy-MM-dd');
        const preview = digest.content
          .replace(/#+\s/g, '')
          .replace(/\*\*/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .slice(0, 500);

        return `
    <item>
      <title>${escapeXml(digest.title)}</title>
      <description>${escapeXml(preview)}</description>
      <link>${baseUrl}/digest/${dateSlug}</link>
      <guid isPermaLink="true">${baseUrl}/digest/${dateSlug}</guid>
      <pubDate>${date.toUTCString()}</pubDate>
    </item>`;
      })
      .join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
