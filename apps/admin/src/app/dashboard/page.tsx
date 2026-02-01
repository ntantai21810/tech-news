'use client';

import { useEffect, useState } from 'react';
import { getStats, getLlmStats, getSourceHealth } from '@/lib/api';

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
      <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Dashboard
      </h1>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="stat-card">
          <div className="stat-value">{stats?.sources.active ?? 0}</div>
          <div className="stat-label">Active Sources</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.items.processed ?? 0}</div>
          <div className="stat-label">Processed Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.digests.published ?? 0}</div>
          <div className="stat-label">Published Digests</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            ${llmStats?.totalCost.toFixed(2) ?? '0.00'}
          </div>
          <div className="stat-label">LLM Cost</div>
        </div>
      </div>

      {/* Source Health & LLM Usage */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
        }}
      >
        {/* Source Health */}
        <div className="card">
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: 'var(--text-secondary)',
            }}
          >
            Source Health
          </h2>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div>
              <span
                className="badge badge-success"
                style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}
              >
                {health?.healthy ?? 0}
              </span>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.5rem',
                }}
              >
                Healthy
              </p>
            </div>
            <div>
              <span
                className="badge badge-warning"
                style={{ fontSize: '1.5rem', padding: '0.5rem 1rem' }}
              >
                {health?.unhealthy ?? 0}
              </span>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.5rem',
                }}
              >
                Unhealthy
              </p>
            </div>
            <div>
              <span
                className="badge"
                style={{
                  fontSize: '1.5rem',
                  padding: '0.5rem 1rem',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-muted)',
                }}
              >
                {health?.inactive ?? 0}
              </span>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.5rem',
                }}
              >
                Inactive
              </p>
            </div>
          </div>
        </div>

        {/* LLM Usage by Provider */}
        <div className="card">
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: 'var(--text-secondary)',
            }}
          >
            LLM Usage by Provider
          </h2>
          {llmStats?.byProvider && Object.keys(llmStats.byProvider).length > 0 ? (
            <table className="table">
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
                    <td style={{ textTransform: 'capitalize' }}>{provider}</td>
                    <td>{data.count}</td>
                    <td>{data.tokens.toLocaleString()}</td>
                    <td>${data.cost.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No LLM usage data yet
            </p>
          )}
        </div>
      </div>

      {/* Today's Activity */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: 'var(--text-secondary)',
          }}
        >
          Today&apos;s Activity
        </h2>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div>
            <p style={{ fontSize: '2rem', fontWeight: 700 }}>
              {stats?.items.todayProcessed ?? 0}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Items Processed Today
            </p>
          </div>
          <div>
            <p style={{ fontSize: '2rem', fontWeight: 700 }}>
              {stats?.digests.draft ?? 0}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Draft Digests
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
