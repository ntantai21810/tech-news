import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search through curated tech news, articles, and updates.',
};

export default function SearchPage() {
  return (
    <div className="container max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Search</h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Find articles, updates, and news across all digests.
      </p>

      {/* Search Form */}
      <form action="/search" method="GET" className="mb-8">
        <div className="flex gap-3">
          <input
            type="search"
            name="q"
            placeholder="Search for topics, packages, or technologies..."
            className="flex-1 px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            autoFocus
          />
          <button type="submit" className="btn btn-primary px-6">
            Search
          </button>
        </div>
      </form>

      {/* Popular Searches */}
      <section className="card">
        <h2 className="font-semibold mb-4">Popular Searches</h2>
        <div className="flex flex-wrap gap-2">
          {['nextjs', 'nestjs', 'react', 'typescript', 'ai', 'security', 'nodejs', 'performance'].map((term) => (
            <a
              key={term}
              href={`/search?q=${term}`}
              className="tag hover:bg-[var(--accent-primary)] hover:text-white"
            >
              {term}
            </a>
          ))}
        </div>
      </section>

      {/* Recent Tags */}
      <section className="card mt-6">
        <h2 className="font-semibold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/category/frontend" className="p-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-center transition-colors">
            🎨 Frontend
          </a>
          <a href="/category/backend" className="p-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-center transition-colors">
            ⚙️ Backend
          </a>
          <a href="/category/ai" className="p-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-center transition-colors">
            🤖 AI/ML
          </a>
          <a href="/category/security" className="p-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-center transition-colors">
            🔒 Security
          </a>
        </div>
      </section>
    </div>
  );
}
