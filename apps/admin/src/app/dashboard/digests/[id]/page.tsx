'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface DigestDetail {
  id: string;
  date: string;
  title: string;
  content: string;
  status: string;
  items: Array<{
    id: string;
    section: string;
    order: number;
    processedItem: {
      id: string;
      summary: string;
      categories: string[];
      tags: string[];
      relevanceScore: number;
      urgencyLevel: string;
      rawItem: {
        title: string;
        url: string;
        author: string | null;
      };
    };
  }>;
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export default function DigestEditorPage() {
  const params = useParams();
  const router = useRouter();
  const [digest, setDigest] = useState<DigestDetail | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadDigest() {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${BACKEND_URL}/api/digests/${params.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setDigest(data);
        setTitle(data.title);
        setContent(data.content);
      }
      setLoading(false);
    }
    loadDigest();
  }, [params.id]);

  async function handleSave() {
    setSaving(true);
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${BACKEND_URL}/api/digests/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) {
      setMessage('Saved successfully!');
      setTimeout(() => setMessage(''), 2000);
    }
    setSaving(false);
  }

  async function handlePublish() {
    const token = localStorage.getItem('admin_token');
    await fetch(`${BACKEND_URL}/api/digests/${params.id}/publish`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    router.push('/dashboard/digests');
  }

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading digest...</div>;
  }

  if (!digest) {
    return <div style={{ color: 'var(--error)' }}>Digest not found</div>;
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
        <div>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              marginBottom: '0.5rem',
            }}
          >
            ← Back to Digests
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Edit Digest</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {message && (
            <span style={{ color: 'var(--success)', fontSize: '0.875rem' }}>
              {message}
            </span>
          )}
          <button
            className="btn btn-secondary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          {digest.status !== 'PUBLISHED' && (
            <button className="btn btn-primary" onClick={handlePublish}>
              Publish
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
        {/* Editor */}
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <label className="label">Title</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Daily Tech Digest"
            />
          </div>
          <div>
            <label className="label">Content (Markdown)</label>
            <textarea
              className="input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={25}
              style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {/* Sidebar - Included Items */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: 'var(--text-secondary)',
            }}
          >
            Included Items ({digest.items?.length || 0})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {digest.items?.length ? (
              digest.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '0.75rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <span
                      className="badge"
                      style={{
                        background: 'var(--accent-muted)',
                        color: 'var(--accent-primary)',
                        fontSize: '0.625rem',
                      }}
                    >
                      {item.section}
                    </span>
                    <span
                      className={`badge ${
                        item.processedItem.urgencyLevel === 'CRITICAL'
                          ? 'badge-error'
                          : item.processedItem.urgencyLevel === 'HIGH'
                          ? 'badge-warning'
                          : ''
                      }`}
                      style={
                        !['CRITICAL', 'HIGH'].includes(item.processedItem.urgencyLevel)
                          ? { background: 'var(--bg-card)', color: 'var(--text-muted)' }
                          : {}
                      }
                    >
                      {item.processedItem.urgencyLevel}
                    </span>
                  </div>
                  <p style={{ fontWeight: 500, marginBottom: '0.25rem' }}>
                    {item.processedItem.rawItem.title}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.processedItem.summary}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No items in this digest</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
