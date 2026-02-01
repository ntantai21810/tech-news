'use client';

import { useEffect, useState } from 'react';
import { getStats, getLlmStats, getSourceHealth } from '@/lib/api';
import { 
  Radio, 
  FileText, 
  Newspaper, 
  DollarSign, 
  Heart, 
  AlertCircle, 
  Power,
  Cpu,
  Activity,
  Clock
} from 'lucide-react';

interface Stats {
  sources: { total: number; active: number; types: Record<string, number> };
  items: { raw: number; processed: number; todayProcessed: number };
  digests: { total: number; published: number; draft: number };
}

interface LlmStats {
  totalCost: number;
  totalTokens: number;
  byProvider: Record<string, { cost: number; tokens: number; count: number }>;
}

interface HealthData {
  healthy: number;
  unhealthy: number;
  inactive: number;
}

function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <div className="skeleton w-12 h-12 rounded-lg mb-3" />
      <div className="skeleton w-20 h-8 mb-2" />
      <div className="skeleton w-24 h-4" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton w-32 h-5 mb-4" />
      <div className="space-y-3">
        <div className="skeleton w-full h-12" />
        <div className="skeleton w-full h-12" />
        <div className="skeleton w-full h-12" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [llmStats, setLlmStats] = useState<LlmStats | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [statsRes, llmRes, healthRes] = await Promise.all([
        getStats(),
        getLlmStats(),
        getSourceHealth(),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (llmRes.data) setLlmStats(llmRes.data);
      if (healthRes.data) setHealth(healthRes.data);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="page-title mb-6">Dashboard</h1>
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="two-column">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Active Sources',
      value: stats?.sources.active ?? 0,
      icon: Radio,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Processed Items',
      value: stats?.items.processed ?? 0,
      icon: FileText,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    {
      label: 'Published Digests',
      value: stats?.digests.published ?? 0,
      icon: Newspaper,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
    {
      label: 'LLM Cost',
      value: `$${llmStats?.totalCost.toFixed(2) ?? '0.00'}`,
      icon: DollarSign,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10'
    },
  ];

  return (
    <div>
      <h1 className="page-title mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card">
              <div className={`stat-icon ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="two-column">
        {/* Source Health */}
        <div className="card">
          <div className="section-header">
            <span className="section-icon">
              <Activity className="w-4 h-4" />
            </span>
            <h2>Source Health</h2>
          </div>
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500/10 mb-2">
                <Heart className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {health?.healthy ?? 0}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Healthy</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-amber-500/10 mb-2">
                <AlertCircle className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {health?.unhealthy ?? 0}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Unhealthy</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--bg-tertiary)] mb-2">
                <Power className="w-6 h-6 text-[var(--text-muted)]" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {health?.inactive ?? 0}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Inactive</p>
            </div>
          </div>
        </div>

        {/* LLM Usage by Provider */}
        <div className="card">
          <div className="section-header">
            <span className="section-icon">
              <Cpu className="w-4 h-4" />
            </span>
            <h2>LLM Usage by Provider</h2>
          </div>
          {llmStats?.byProvider && Object.keys(llmStats.byProvider).length > 0 ? (
            <table className="table mt-4">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Calls</th>
                  <th>Tokens</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(llmStats.byProvider).map(([provider, data]) => (
                  <tr key={provider}>
                    <td className="capitalize font-medium">{provider}</td>
                    <td>{data.count}</td>
                    <td>{data.tokens.toLocaleString()}</td>
                    <td className="font-mono">${data.cost.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <Cpu className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)]" />
              <p className="text-[var(--text-muted)] text-sm">
                No LLM usage data yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Today's Activity */}
      <div className="card mt-6">
        <div className="section-header">
          <span className="section-icon">
            <Clock className="w-4 h-4" />
          </span>
          <h2>Today&apos;s Activity</h2>
        </div>
        <div className="flex gap-8 mt-4">
          <div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              {stats?.items.todayProcessed ?? 0}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Items Processed Today
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              {stats?.digests.draft ?? 0}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Draft Digests
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
