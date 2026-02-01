import { TagCount } from '@/lib/api';

interface TagCloudProps {
  tags: TagCount[];
}

export function TagCloud({ tags }: TagCloudProps) {
  const maxCount = Math.max(...tags.map((t) => t.count));
  const minCount = Math.min(...tags.map((t) => t.count));

  const getStyles = (count: number): React.CSSProperties => {
    if (maxCount === minCount) {
      return { fontSize: '0.875rem', fontWeight: 500, opacity: 1 };
    }
    const normalized = (count - minCount) / (maxCount - minCount);
    if (normalized > 0.7) {
      return { fontSize: '1rem', fontWeight: 600, opacity: 1 };
    }
    if (normalized > 0.4) {
      return { fontSize: '0.875rem', fontWeight: 500, opacity: 0.9 };
    }
    return { fontSize: '0.75rem', fontWeight: 500, opacity: 0.75 };
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {tags.map((tag) => (
        <a
          key={tag.tag}
          href={`/search?q=${encodeURIComponent(tag.tag)}`}
          className="tag"
          style={{
            ...getStyles(tag.count),
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          {tag.tag}
          <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
            {tag.count}
          </span>
        </a>
      ))}
    </div>
  );
}
