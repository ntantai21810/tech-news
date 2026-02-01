'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';

export default function SettingsPage() {
  const { admin } = useAuthStore();
  const [llmProvider, setLlmProvider] = useState('claude');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real app, this would call an API to save settings
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Settings
      </h1>

      {/* Account Info */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Account
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              value={admin?.email || ''}
              readOnly
              style={{ opacity: 0.7 }}
            />
          </div>
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={admin?.name || ''}
              readOnly
              style={{ opacity: 0.7 }}
            />
          </div>
        </div>
      </div>

      {/* LLM Settings */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          LLM Provider
        </h2>
        <div style={{ maxWidth: '300px' }}>
          <label className="label">Default Provider</label>
          <select
            className="input"
            value={llmProvider}
            onChange={(e) => setLlmProvider(e.target.value)}
          >
            <option value="claude">Claude (Anthropic)</option>
            <option value="openai">GPT (OpenAI)</option>
            <option value="gemini">Gemini (Google)</option>
            <option value="glm">ChatGLM (Zhipu)</option>
            <option value="ollama">Ollama (Local)</option>
          </select>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '0.5rem',
            }}
          >
            This requires the corresponding API key in your .env file
          </p>
        </div>
      </div>

      {/* Collection Settings */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
          Collection Schedule
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="stat-card">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Hourly Sources
            </p>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.25rem' }}>
              Every hour
            </p>
          </div>
          <div className="stat-card">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Daily Sources
            </p>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.25rem' }}>
              6:00 AM
            </p>
          </div>
          <div className="stat-card">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Digest Generation
            </p>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.25rem' }}>
              7:00 AM
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={handleSave}>
          Save Settings
        </button>
        {saved && (
          <span style={{ color: 'var(--success)', fontSize: '0.875rem' }}>
            ✓ Settings saved
          </span>
        )}
      </div>
    </div>
  );
}
