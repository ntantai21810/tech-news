'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { 
  LayoutDashboard, 
  Radio, 
  Newspaper, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Zap
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/sources', label: 'Sources', icon: Radio },
  { href: '/dashboard/digests', label: 'Digests', icon: Newspaper },
  { href: '/dashboard/content', label: 'Content', icon: FileText },
  { href: '/dashboard/stats', label: 'Statistics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="p-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--accent-primary)]">
              <Zap className="w-5 h-5 text-white" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Tech Intel
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Admin Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-item-icon">
                  <Icon className="w-5 h-5" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-[var(--border-subtle)]">
          <div className="mb-3">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {admin?.name || admin?.email}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate">
              {admin?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">{children}</main>
    </div>
  );
}
