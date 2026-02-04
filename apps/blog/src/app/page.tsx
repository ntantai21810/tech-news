import { getLatestDigest, getDigests, getTagCloud, getStats } from '@/lib/api';
import { DigestCard } from '@/components/digest-card';
import { TagCloud } from '@/components/tag-cloud';
import { StatsOverview } from '@/components/stats-overview';
import { Newspaper, BookOpen, Tag, Rss, Zap } from 'lucide-react';

// Use dynamic rendering - data comes from backend API
export const dynamic = 'force-dynamic';

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
      <section style={{ 
        textAlign: 'center', 
        padding: '4rem 0 3rem',
        marginBottom: '3rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          background: 'var(--accent-muted)',
          color: 'var(--accent-primary)',
          fontSize: '0.875rem',
          fontWeight: 500,
          marginBottom: '1.5rem',
        }}>
          <Zap style={{ width: '1rem', height: '1rem' }} />
          AI-Powered Tech Intelligence
        </div>
        <h1 style={{ 
          fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
          fontWeight: 700, 
          marginBottom: '1.5rem',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>
          Stay Ahead in{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Tech</span>
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: 'var(--text-secondary)', 
          maxWidth: '40rem', 
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          AI-curated daily digests covering JavaScript, TypeScript, Next.js, NestJS, 
          Node.js, and the latest in AI/ML. Quality over quantity.
        </p>
      </section>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(0, 1fr)', 
        gap: '2rem',
      }}>
        {/* Desktop: 2 columns + sidebar */}
        <style>{`
          @media (min-width: 1024px) {
            .main-grid { grid-template-columns: 2fr 1fr !important; }
          }
        `}</style>
        <div className="main-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: '2rem',
        }}>
          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Latest Digest */}
            {latestDigest ? (
              <section>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2.5rem',
                    height: '2.5rem',
                    background: 'var(--accent-muted)',
                    color: 'var(--accent-primary)',
                    borderRadius: '0.75rem',
                  }}>
                    <Newspaper style={{ width: '1.25rem', height: '1.25rem' }} />
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Latest Digest</h2>
                </div>
                <DigestCard digest={latestDigest} featured />
              </section>
            ) : (
              <section className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <Newspaper style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-muted)' }}>
                  No digests published yet. Check back soon!
                </p>
              </section>
            )}

            {/* Recent Digests */}
            {recentDigests.length > 1 && (
              <section>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2.5rem',
                    height: '2.5rem',
                    background: 'var(--accent-muted)',
                    color: 'var(--accent-primary)',
                    borderRadius: '0.75rem',
                  }}>
                    <BookOpen style={{ width: '1.25rem', height: '1.25rem' }} />
                  </span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Recent Digests</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentDigests.slice(1).map((digest) => (
                    <DigestCard key={digest.id} digest={digest} />
                  ))}
                </div>
                <a href="/digest" className="btn btn-secondary" style={{ 
                  marginTop: '1.5rem', 
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}>
                  View All Digests
                  <span>→</span>
                </a>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Stats */}
            {stats && <StatsOverview stats={stats} />}

            {/* Tag Cloud */}
            {tags.length > 0 && (
              <section className="card">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  marginBottom: '1rem',
                }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '0.5rem',
                    background: 'var(--accent-muted)',
                  }}>
                    <Tag style={{ width: '1rem', height: '1rem', color: 'var(--accent-primary)' }} />
                  </span>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Trending Topics</h3>
                </div>
                <TagCloud tags={tags} />
              </section>
            )}

            {/* RSS Feed */}
            <section className="card" style={{ 
              background: 'linear-gradient(135deg, var(--accent-muted), var(--bg-card))',
              borderColor: 'rgba(59, 130, 246, 0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.5rem',
                  background: 'var(--accent-primary)',
                }}>
                  <Rss style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                </span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Subscribe via RSS</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Get digests delivered to your favorite reader.
              </p>
              <a href="/feed.xml" className="btn btn-primary" style={{ width: '100%' }}>
                Subscribe to Feed
              </a>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
