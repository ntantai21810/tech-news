import { TagCount } from '@/lib/api';

interface TagCloudProps {
  tags: TagCount[];
}

export function TagCloud({ tags }: TagCloudProps) {
  // Calculate relative sizes
  const maxCount = Math.max(...tags.map((t) => t.count));
  const minCount = Math.min(...tags.map((t) => t.count));

  const getSize = (count: number): string => {
    if (maxCount === minCount) return 'text-sm';
    const normalized = (count - minCount) / (maxCount - minCount);
    if (normalized > 0.7) return 'text-lg font-semibold';
    if (normalized > 0.4) return 'text-base font-medium';
    return 'text-sm';
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <a
          key={tag.tag}
          href={`/tag/${encodeURIComponent(tag.tag)}`}
          className={`tag hover:bg-[var(--accent-primary)] hover:text-white transition-colors ${getSize(tag.count)}`}
        >
          {tag.tag}
          <span className="ml-1 opacity-60 text-xs">({tag.count})</span>
        </a>
      ))}
    </div>
  );
}
