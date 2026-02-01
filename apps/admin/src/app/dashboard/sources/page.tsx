'use client';

import { useEffect, useState } from 'react';
import { getSources, createSource, updateSource, deleteSource } from '@/lib/api';

interface Source {
  id: string;
  type: string;
  name: string;
  url: string;
  isActive: boolean;
  lastFetchAt: string | null;
  errorCount: number;
}

const SOURCE_TYPES = ['GITHUB', 'RSS', 'REDDIT', 'HACKERNEWS', 'WEBSITE'];

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'RSS',
    name: '',
    url: '',
    checkFrequency: 'daily',
  });

  useEffect(() => {
    loadSources();
  }, []);

  async function loadSources() {
    const result = await getSources();
    if (result.data) {
      setSources(result.data);
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createSource(formData);
    setShowForm(false);
    setFormData({ type: 'RSS', name: '', url: '', checkFrequency: 'daily' });
    loadSources();
  }

  async function handleToggle(id: string, isActive: boolean) {
    await updateSource(id, { isActive: !isActive });
    loadSources();
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this source?')) {
      await deleteSource(id);
      loadSources();
    }
  }

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading sources...</div>;
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
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Sources</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Source'}
        </button>
      </div>

      {/* Add Source Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="card"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <label className="label">Type</label>
            <select
              className="input"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              {SOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., React Blog"
              required
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label className="label">URL</label>
            <input
              className="input"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
              required
            />
          </div>
          <div>
            <label className="label">Check Frequency</label>
            <select
              className="input"
              value={formData.checkFrequency}
              onChange={(e) =>
                setFormData({ ...formData, checkFrequency: e.target.value })
              }
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              Create Source
            </button>
          </div>
        </form>
      )}

      {/* Sources Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>URL</th>
              <th>Status</th>
              <th>Last Fetch</th>
              <th>Errors</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: 'center', color: 'var(--text-muted)' }}
                >
                  No sources configured yet
                </td>
              </tr>
            ) : (
              sources.map((source) => (
                <tr key={source.id}>
                  <td style={{ fontWeight: 500 }}>{source.name}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {source.type}
                    </span>
                  </td>
                  <td
                    style={{
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--text-muted)',
                      fontSize: '0.875rem',
                    }}
                  >
                    {source.url}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        source.isActive ? 'badge-success' : 'badge-warning'
                      }`}
                    >
                      {source.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {source.lastFetchAt
                      ? new Date(source.lastFetchAt).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td>
                    {source.errorCount > 0 ? (
                      <span className="badge badge-error">{source.errorCount}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>0</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                        onClick={() => handleToggle(source.id, source.isActive)}
                      >
                        {source.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        className="btn"
                        style={{
                          padding: '0.375rem 0.75rem',
                          fontSize: '0.75rem',
                          background: 'transparent',
                          color: 'var(--error)',
                          border: '1px solid var(--error)',
                        }}
                        onClick={() => handleDelete(source.id)}
                      >
                        Delete
                      </button>
                    </div>
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
