import { Metadata } from 'next';
import { getCategories } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse tech news by category - Frontend, Backend, AI, Security, DevOps, and more.',
};

// Use dynamic rendering - data comes from backend API
export const dynamic = 'force-dynamic';

const CATEGORY_INFO: Record<string, { emoji: string; description: string }> = {
  frontend: { emoji: '🎨', description: 'UI, React, styling, components' },
  backend: { emoji: '⚙️', description: 'APIs, servers, databases' },
  ai: { emoji: '🤖', description: 'Machine learning, LLMs, AI tools' },
  security: { emoji: '🔒', description: 'Vulnerabilities, CVEs, security updates' },
  devops: { emoji: '🚀', description: 'Deployment, CI/CD, infrastructure' },
  performance: { emoji: '⚡', description: 'Optimization, profiling, speed' },
  tooling: { emoji: '🛠️', description: 'Developer tools, IDEs, extensions' },
  'breaking-change': { emoji: '⚠️', description: 'Major changes requiring action' },
  release: { emoji: '📦', description: 'New versions and releases' },
  tutorial: { emoji: '📖', description: 'Guides and learning resources' },
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Categories</h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Browse curated tech news organized by topic.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const info = CATEGORY_INFO[cat.category] || { emoji: '📄', description: '' };

          return (
            <a
              key={cat.category}
              href={`/category/${cat.category}`}
              className="card hover:border-[var(--accent-primary)] group"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{info.emoji}</span>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold capitalize group-hover:text-[var(--accent-primary)] transition-colors">
                    {cat.category}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] mb-2">
                    {info.description}
                  </p>
                  <span className="tag">
                    {cat.count} items
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-[var(--text-muted)]">No categories yet.</p>
        </div>
      )}
    </div>
  );
}
