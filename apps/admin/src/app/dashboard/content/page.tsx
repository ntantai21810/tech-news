'use client';

import { useEffect, useState } from 'react';

interface ProcessedItem {
  id: string;
  summary: string;
  categories: string[];
  tags: string[];
  relevanceScore: number;
  urgencyLevel: string;
  processedAt: string;
  rawItem: {
    title: string;
    url: string;
    author: string | null;
    publishedAt: string;
    source: {
      name: string;
      type: string;
    };
  };
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export default function ContentModerationPage() {
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${BACKEND_URL}/api/processed-items?limit=50`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
    setLoading(false);
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    const token = localStorage.getItem('admin_token');
    await fetch(`${BACKEND_URL}/api/processed-items/${id}/${action}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    // Remove from list or update status
    setItems(items.filter((item) => item.id !== id));
  }

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading content...</div>;
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Content Moderation</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(f)}
              style={{ textTransform: 'capitalize' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: 'center', color: 'var(--text-muted)' }}
          >
            No items to moderate
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="card" style={{ padding: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      className="badge"
                      style={{
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {item.rawItem.source.type}
                    </span>
                    <span
                      className={`badge ${
                        item.urgencyLevel === 'CRITICAL'
                          ? 'badge-error'
                          : item.urgencyLevel === 'HIGH'
                          ? 'badge-warning'
                          : 'badge-success'
                      }`}
                    >
                      {item.urgencyLevel}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Score: {(item.relevanceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                    }}
                  >
                    <a
                      href={item.rawItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}
                    >
                      {item.rawItem.title}
                    </a>
                  </h3>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {item.summary}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {item.categories.map((cat) => (
                      <span
                        key={cat}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          background: 'var(--accent-muted)',
                          color: 'var(--accent-primary)',
                          borderRadius: '0.25rem',
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                    {item.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-muted)',
                          borderRadius: '0.25rem',
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    minWidth: '100px',
                  }}
                >
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.5rem', fontSize: '0.75rem' }}
                    onClick={() => handleAction(item.id, 'approve')}
                  >
                    ✓ Approve
                  </button>
                  <button
                    className="btn"
                    style={{
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      background: 'transparent',
                      color: 'var(--error)',
                      border: '1px solid var(--error)',
                    }}
                    onClick={() => handleAction(item.id, 'reject')}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
              <div
                style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Source: {item.rawItem.source.name}</span>
                <span>
                  Processed: {new Date(item.processedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
