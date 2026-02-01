'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/sources', label: 'Sources', icon: '📡' },
  { href: '/dashboard/digests', label: 'Digests', icon: '📰' },
  { href: '/dashboard/stats', label: 'Statistics', icon: '📈' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <h1
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--accent-primary)',
            }}
          >
            Tech Intel
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Admin Dashboard
          </p>
        </div>

        <nav style={{ padding: '1rem' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '0.25rem',
                  textDecoration: 'none',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-muted)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <span>{item.icon}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ marginBottom: '0.75rem' }}>
            <p
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              {admin?.name || admin?.email}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {admin?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">{children}</main>
    </div>
  );
}
