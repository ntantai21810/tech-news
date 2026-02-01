import { getLatestDigest, getDigests, getTagCloud, getStats } from '@/lib/api';
import { DigestCard } from '@/components/digest-card';
import { TagCloud } from '@/components/tag-cloud';
import { StatsOverview } from '@/components/stats-overview';

export const revalidate = 60; // Revalidate every minute

export default async function HomePage() {
  const [latestDigest, recentDigests, tags, stats] = await Promise.all([
    getLatestDigest(),
    getDigests(5),
    getTagCloud(20),
    getStats(),
  ]);

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="text-center py-12 mb-12 border-b border-[var(--border-subtle)]">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Stay Ahead in <span className="text-[var(--accent-primary)]">Tech</span>
        </h1>
        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
          AI-curated daily digests covering JavaScript, TypeScript, Next.js, NestJS, 
          Node.js, and the latest in AI/ML. Quality over quantity.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Latest Digest */}
          {latestDigest ? (
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-[var(--accent-primary)]">📰</span> 
                Latest Digest
              </h2>
              <DigestCard digest={latestDigest} featured />
            </section>
          ) : (
            <section className="card text-center py-12">
              <p className="text-[var(--text-muted)]">
                No digests published yet. Check back soon!
              </p>
            </section>
          )}

          {/* Recent Digests */}
          {recentDigests.length > 1 && (
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-[var(--accent-primary)]">📚</span>
                Recent Digests
              </h2>
              <div className="space-y-4">
                {recentDigests.slice(1).map((digest) => (
                  <DigestCard key={digest.id} digest={digest} />
                ))}
              </div>
              <a href="/digest" className="btn btn-secondary mt-4 w-full">
                View All Digests →
              </a>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Stats */}
          {stats && <StatsOverview stats={stats} />}

          {/* Tag Cloud */}
          {tags.length > 0 && (
            <section className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-[var(--accent-primary)]">🏷️</span>
                Trending Topics
              </h3>
              <TagCloud tags={tags} />
            </section>
          )}

          {/* RSS Feed */}
          <section className="card bg-[var(--accent-muted)]">
            <h3 className="text-lg font-semibold mb-2">Subscribe via RSS</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Get digests delivered to your favorite reader.
            </p>
            <a href="/feed.xml" className="btn btn-primary w-full">
              Subscribe to Feed
            </a>
          </section>
        </aside>
      </div>
    </div>
  );
}
