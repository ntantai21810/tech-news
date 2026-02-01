import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDigestByDate } from '@/lib/api';
import { format } from 'date-fns';
import { marked } from 'marked';

interface Props {
  params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const digest = await getDigestByDate(date);

  if (!digest) {
    return { title: 'Digest Not Found' };
  }

  return {
    title: digest.title,
    description: `Tech digest for ${format(new Date(date), 'MMMM d, yyyy')} - Latest updates in JavaScript, TypeScript, Next.js, NestJS, and AI/ML.`,
    openGraph: {
      title: digest.title,
      description: `Daily tech digest covering the latest in web development and AI.`,
      type: 'article',
      publishedTime: digest.publishedAt || undefined,
    },
  };
}

export default async function DigestPage({ params }: Props) {
  const { date } = await params;
  const digest = await getDigestByDate(date);

  if (!digest) {
    notFound();
  }

  const formattedDate = format(new Date(date), 'MMMM d, yyyy');
  const htmlContent = await marked(digest.content);

  // Group items by section
  const sections: Record<string, typeof digest.items> = {};
  if (digest.items) {
    for (const item of digest.items) {
      if (!sections[item.section]) {
        sections[item.section] = [];
      }
      sections[item.section].push(item);
    }
  }

  return (
    <div className="container max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-[var(--text-muted)] mb-6">
        <a href="/" className="hover:text-[var(--accent-primary)]">Home</a>
        {' / '}
        <a href="/digest" className="hover:text-[var(--accent-primary)]">Digests</a>
        {' / '}
        <span className="text-[var(--text-secondary)]">{formattedDate}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{digest.title}</h1>
        <div className="flex items-center gap-4 text-[var(--text-muted)]">
          <time dateTime={date}>{formattedDate}</time>
          {digest.items && (
            <span>{digest.items.length} items</span>
          )}
          {digest.publishedAt && (
            <span>Published {format(new Date(digest.publishedAt), 'h:mm a')}</span>
          )}
        </div>
      </header>

      {/* Table of Contents */}
      {Object.keys(sections).length > 0 && (
        <nav className="card mb-8 bg-[var(--bg-secondary)]">
          <h2 className="font-semibold mb-3">Quick Navigation</h2>
          <ul className="flex flex-wrap gap-3">
            {Object.entries(sections).map(([section, items]) => (
              <li key={section}>
                <a 
                  href={`#${section}`}
                  className="tag hover:bg-[var(--accent-primary)] hover:text-white"
                >
                  {getSectionEmoji(section)} {section} ({items?.length})
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Content */}
      <article 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Items by Section */}
      {digest.items && digest.items.length > 0 && (
        <section className="mt-12 space-y-8">
          <h2 className="text-2xl font-bold">All Items</h2>
          {Object.entries(sections).map(([section, items]) => (
            <div key={section} id={section}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>{getSectionEmoji(section)}</span>
                <span className="capitalize">{section}</span>
              </h3>
              <div className="space-y-4">
                {items?.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Navigation */}
      <footer className="mt-12 pt-8 border-t border-[var(--border-subtle)] flex justify-between">
        <a href="/digest" className="btn btn-secondary">
          ← All Digests
        </a>
        <a href="/" className="btn btn-secondary">
          Back to Home
        </a>
      </footer>
    </div>
  );
}

function ItemCard({ item }: { item: NonNullable<Awaited<ReturnType<typeof getDigestByDate>>>['items'] extends (infer T)[] ? T : never }) {
  const pi = item.processedItem;
  const ri = pi.rawItem;

  return (
    <article className="card">
      <div className="flex items-start justify-between gap-4 mb-2">
        <a href={ri.url} target="_blank" rel="noopener noreferrer">
          <h4 className="font-semibold hover:text-[var(--accent-primary)]">
            {ri.title}
          </h4>
        </a>
        <span className={`tag ${getUrgencyClass(pi.urgencyLevel)}`}>
          {pi.urgencyLevel}
        </span>
      </div>
      
      <p className="text-[var(--text-secondary)] mb-3">{pi.summary}</p>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {pi.tags.slice(0, 5).map((tag) => (
          <a key={tag} href={`/tag/${tag}`} className="tag text-xs">
            {tag}
          </a>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
        <span>
          via {ri.source?.name || 'Unknown'} 
          {ri.author && ` • ${ri.author}`}
        </span>
        <span className="font-mono">
          Score: {(pi.relevanceScore * 100).toFixed(0)}%
        </span>
      </div>

      {pi.actionItems.length > 0 && (
        <div className="mt-3 p-3 bg-[var(--accent-muted)] rounded-lg">
          <strong className="text-sm">Action Items:</strong>
          <ul className="mt-1 text-sm list-disc list-inside">
            {pi.actionItems.map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function getSectionEmoji(section: string): string {
  const emojis: Record<string, string> = {
    critical: '🚨',
    releases: '🚀',
    news: '📰',
    ai: '🤖',
    reading: '📚',
    trending: '📊',
  };
  return emojis[section] || '📄';
}

function getUrgencyClass(urgency: string): string {
  switch (urgency) {
    case 'CRITICAL': return 'badge-critical';
    case 'HIGH': return 'badge-warning';
    default: return '';
  }
}
