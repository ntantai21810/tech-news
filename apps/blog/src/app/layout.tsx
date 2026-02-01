import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <div className="container py-4 flex items-center justify-between">
              <a href="/" className="text-xl font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors">
                <span className="text-[var(--accent-primary)]">&lt;</span>
                TechIntel
                <span className="text-[var(--accent-primary)]">/&gt;</span>
              </a>
              <nav className="flex items-center gap-6">
                <a href="/digest" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  Digests
                </a>
                <a href="/category" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  Categories
                </a>
                <a href="/search" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  Search
                </a>
                <a href="/feed.xml" className="tag">
                  RSS
                </a>
              </nav>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-8">
            <div className="container text-center text-[var(--text-muted)]">
              <p>
                Built with ❤️ using Next.js | Powered by AI-curated intelligence
              </p>
              <p className="mt-2 text-sm">
                <a href="/feed.xml" className="hover:text-[var(--accent-primary)]">RSS</a>
                {' • '}
                <a href="https://github.com" className="hover:text-[var(--accent-primary)]">GitHub</a>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
