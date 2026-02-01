import { Digest } from '@/lib/api';
import { format } from 'date-fns';

interface DigestCardProps {
  digest: Digest;
  featured?: boolean;
}

export function DigestCard({ digest, featured = false }: DigestCardProps) {
  const date = new Date(digest.date);
  const formattedDate = format(date, 'MMMM d, yyyy');
  const dateSlug = format(date, 'yyyy-MM-dd');

  // Extract sections from items if available
  const itemCount = digest.items?.length || 0;
  const criticalCount = digest.items?.filter(
    (item) => item.processedItem.urgencyLevel === 'CRITICAL'
  ).length || 0;

  // Get preview of content (first 200 chars)
  const preview = digest.content
    .replace(/#+\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .slice(0, 200);

  return (
    <article className={`card animate-fade-in ${featured ? 'border-[var(--accent-primary)]' : ''}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <a href={`/digest/${dateSlug}`}>
            <h3 className={`font-bold hover:text-[var(--accent-primary)] transition-colors ${featured ? 'text-2xl' : 'text-xl'}`}>
              {digest.title}
            </h3>
          </a>
          <time className="text-sm text-[var(--text-muted)]" dateTime={digest.date}>
            {formattedDate}
          </time>
        </div>

        {criticalCount > 0 && (
          <span className="tag badge-critical flex-shrink-0">
            🚨 {criticalCount} Critical
          </span>
        )}
      </div>

      <p className="text-[var(--text-secondary)] mb-4">
        {preview}...
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
          <span>{itemCount} items</span>
          {digest.publishedAt && (
            <span>
              Published {format(new Date(digest.publishedAt), 'h:mm a')}
            </span>
          )}
        </div>

        <a
          href={`/digest/${dateSlug}`}
          className="text-[var(--accent-primary)] text-sm font-medium hover:underline"
        >
          Read Full Digest →
        </a>
      </div>
    </article>
  );
}
