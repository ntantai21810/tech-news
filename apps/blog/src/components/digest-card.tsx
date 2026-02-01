import { Digest } from '@/lib/api';
import { format } from 'date-fns';
import { AlertTriangle, ArrowRight, Clock, FileText } from 'lucide-react';

interface DigestCardProps {
  digest: Digest;
  featured?: boolean;
}

export function DigestCard({ digest, featured = false }: DigestCardProps) {
  const date = new Date(digest.date);
  const formattedDate = format(date, 'MMMM d, yyyy');
  const dateSlug = format(date, 'yyyy-MM-dd');

  const itemCount = digest.items?.length || 0;
  const criticalCount = digest.items?.filter(
    (item) => item.processedItem.urgencyLevel === 'CRITICAL'
  ).length || 0;

  const preview = digest.content
    .replace(/#+\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .slice(0, 200);

  return (
    <article 
      className="card"
      style={{
        cursor: 'pointer',
        borderColor: featured ? 'var(--accent-primary)' : undefined,
        boxShadow: featured ? '0 0 20px rgba(59, 130, 246, 0.2)' : undefined,
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between', 
        gap: '1rem',
        marginBottom: '1rem',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <a href={`/digest/${dateSlug}`} style={{ textDecoration: 'none' }}>
            <h3 style={{ 
              fontSize: featured ? '1.5rem' : '1.25rem', 
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.25rem',
            }}>
              {digest.title}
            </h3>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock style={{ width: '0.875rem', height: '0.875rem', color: 'var(--text-muted)' }} />
            <time style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }} dateTime={digest.date}>
              {formattedDate}
            </time>
          </div>
        </div>

        {criticalCount > 0 && (
          <span className="badge badge-critical" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.25rem',
            flexShrink: 0,
          }}>
            <AlertTriangle style={{ width: '0.75rem', height: '0.75rem' }} />
            {criticalCount} Critical
          </span>
        )}
      </div>

      <p style={{ 
        color: 'var(--text-secondary)', 
        marginBottom: '1rem',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {preview}...
      </p>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <FileText style={{ width: '1rem', height: '1rem' }} />
            {itemCount} items
          </span>
          {digest.publishedAt && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Clock style={{ width: '1rem', height: '1rem' }} />
              {format(new Date(digest.publishedAt), 'h:mm a')}
            </span>
          )}
        </div>

        <a
          href={`/digest/${dateSlug}`}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.375rem',
            color: 'var(--accent-primary)',
            fontSize: '0.875rem',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Read Full Digest
          <ArrowRight style={{ width: '1rem', height: '1rem' }} />
        </a>
      </div>
    </article>
  );
}
