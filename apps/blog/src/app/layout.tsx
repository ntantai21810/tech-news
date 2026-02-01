import type { Metadata } from 'next';
import { DM_Sans, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { Newspaper, LayoutGrid, Search, Rss } from 'lucide-react';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Tech Intelligence - Daily Curated Tech News',
    template: '%s | Tech Intelligence',
  },
  description:
    'Stay updated with curated tech news, framework updates, and AI developments. Daily digests focusing on JavaScript, TypeScript, Next.js, NestJS, and AI/ML.',
  keywords: [
    'tech news',
    'javascript',
    'typescript',
    'nextjs',
    'nestjs',
    'nodejs',
    'react',
    'ai',
    'machine learning',
    'web development',
  ],
  authors: [{ name: 'Tech Intelligence' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Tech Intelligence',
    title: 'Tech Intelligence - Daily Curated Tech News',
    description:
      'Stay updated with curated tech news, framework updates, and AI developments.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tech Intelligence',
    description: 'Daily Curated Tech News',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${dmSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(30, 41, 59, 0.9)',
            backdropFilter: 'blur(12px)',
          }}>
            <div className="container" style={{
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              {/* Logo */}
              <a 
                href="/" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                }}
              >
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '0.5rem',
                  background: 'var(--accent-primary)',
                  color: 'white',
                }}>
                  <Newspaper style={{ width: '1.25rem', height: '1.25rem' }} />
                </span>
                <span>
                  Tech<span style={{ color: 'var(--accent-primary)' }}>Intel</span>
                </span>
              </a>
              
              {/* Navigation */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <a 
                  href="/digest" 
                  className="nav-link"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <Newspaper style={{ width: '1rem', height: '1rem' }} />
                  <span>Digests</span>
                </a>
                <a 
                  href="/category" 
                  className="nav-link"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <LayoutGrid style={{ width: '1rem', height: '1rem' }} />
                  <span>Categories</span>
                </a>
                <a 
                  href="/search" 
                  className="nav-link"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <Search style={{ width: '1rem', height: '1rem' }} />
                  <span>Search</span>
                </a>
                <a 
                  href="/feed.xml" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginLeft: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    background: 'var(--accent-muted)',
                    color: 'var(--accent-primary)',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <Rss style={{ width: '1rem', height: '1rem' }} />
                  <span>RSS</span>
                </a>
              </nav>
            </div>
          </header>

          {/* Main content */}
          <main style={{ flex: 1, padding: '2rem 0' }}>
            {children}
          </main>

          {/* Footer */}
          <footer style={{
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            padding: '2rem 0',
          }}>
            <div className="container">
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
              }}>
                {/* Logo & Description */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.5rem',
                    background: 'var(--accent-muted)',
                  }}>
                    <Newspaper style={{ width: '1.25rem', height: '1.25rem', color: 'var(--accent-primary)' }} />
                  </span>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Tech Intelligence</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>AI-curated tech news</p>
                  </div>
                </div>
                
                {/* Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <a 
                    href="/feed.xml" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none' }}
                  >
                    <Rss style={{ width: '1rem', height: '1rem' }} />
                    RSS Feed
                  </a>
                  <span style={{ color: 'var(--border-default)' }}>•</span>
                  <p>Built with Next.js</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
