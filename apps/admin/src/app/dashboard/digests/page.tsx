'use client';

import { useEffect, useState } from 'react';
import { getDigests, generateDigest, publishDigest } from '@/lib/api';

interface Digest {
  id: string;
  date: string;
  title: string;
  status: string;
  publishedAt: string | null;
}

export default function DigestsPage() {
  const [digests, setDigests] = useState<Digest[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadDigests();
  }, []);

  async function loadDigests() {
    const result = await getDigests();
    if (result.data) {
      setDigests(result.data);
    }
    setLoading(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    await generateDigest();
    await loadDigests();
    setGenerating(false);
  }

  async function handlePublish(id: string) {
    await publishDigest(id);
    loadDigests();
  }

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading digests...</div>;
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Digests</h1>
        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? 'Generating...' : '+ Generate Digest'}
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Status</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {digests.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: 'center', color: 'var(--text-muted)' }}
                >
                  No digests yet. Click &quot;Generate Digest&quot; to create one.
                </td>
              </tr>
            ) : (
              digests.map((digest) => (
                <tr key={digest.id}>
                  <td style={{ fontWeight: 500 }}>
                    {new Date(digest.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td>{digest.title}</td>
                  <td>
                    <span
                      className={`badge ${
                        digest.status === 'PUBLISHED'
                          ? 'badge-success'
                          : digest.status === 'REVIEW'
                          ? 'badge-warning'
                          : ''
                      }`}
                      style={
                        digest.status === 'DRAFT'
                          ? {
                              background: 'var(--bg-tertiary)',
                              color: 'var(--text-secondary)',
                            }
                          : {}
                      }
                    >
                      {digest.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {digest.publishedAt
                      ? new Date(digest.publishedAt).toLocaleString()
                      : '—'}
                  </td>
                  <td>
                    {digest.status !== 'PUBLISHED' && (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                        onClick={() => handlePublish(digest.id)}
                      >
                        Publish
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
