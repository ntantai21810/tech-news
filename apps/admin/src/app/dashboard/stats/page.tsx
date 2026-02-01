'use client';

import { useEffect, useState } from 'react';
import { getStats, getLlmStats, getCategoryStats } from '@/lib/api';

export default function StatsPage() {
  const [stats, setStats] = useState<{
    sources: { total: number; active: number; types: Record<string, number> };
    items: { raw: number; processed: number; todayProcessed: number };
    digests: { total: number; published: number; draft: number };
  } | null>(null);
  const [llmStats, setLlmStats] = useState<{
    totalCost: number;
    totalTokens: number;
    byProvider: Record<string, { cost: number; tokens: number; count: number }>;
  } | null>(null);
  const [categories, setCategories] = useState<Array<{ category: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [statsRes, llmRes, catRes] = await Promise.all([
        getStats(),
        getLlmStats(),
        getCategoryStats(),
      ]);
      if (statsRes.data) setStats(statsRes.data);
      if (llmRes.data) setLlmStats(llmRes.data);
      if (catRes.data) setCategories(catRes.data);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading statistics...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Statistics
      </h1>

      {/* Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card">
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Total Items
          </h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats?.items.raw ?? 0}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {stats?.items.processed ?? 0} processed
          </p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            LLM Tokens Used
          </h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>
            {(llmStats?.totalTokens ?? 0).toLocaleString()}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            ${llmStats?.totalCost.toFixed(4) ?? '0.00'} total cost
          </p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Digests Published
          </h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>
            {stats?.digests.published ?? 0}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {stats?.digests.draft ?? 0} drafts
          </p>
        </div>
      </div>

      {/* Source Types & Categories */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
        }}
      >
        {/* Source Types */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Sources by Type
          </h2>
          {stats?.sources.types && Object.keys(stats.sources.types).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(stats.sources.types).map(([type, count]) => (
                <div
                  key={type}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ textTransform: 'capitalize' }}>{type.toLowerCase()}</span>
                  <span
                    className="badge"
                    style={{ background: 'var(--accent-muted)', color: 'var(--accent-primary)' }}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No sources</p>
          )}
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Content by Category
          </h2>
          {categories.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {categories.slice(0, 8).map(({ category, count }) => (
                <div
                  key={category}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ textTransform: 'capitalize' }}>{category}</span>
                  <span
                    className="badge"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No data yet</p>
          )}
        </div>
      </div>

      {/* LLM Provider Breakdown */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          LLM Provider Usage
        </h2>
        {llmStats?.byProvider && Object.keys(llmStats.byProvider).length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>API Calls</th>
                <th>Tokens Used</th>
                <th>Cost</th>
                <th>Avg Cost/Call</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(llmStats.byProvider).map(([provider, data]) => (
                <tr key={provider}>
                  <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                    {provider}
                  </td>
                  <td>{data.count.toLocaleString()}</td>
                  <td>{data.tokens.toLocaleString()}</td>
                  <td>${data.cost.toFixed(4)}</td>
                  <td>${(data.cost / data.count).toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No LLM usage data</p>
        )}
      </div>
    </div>
  );
}
