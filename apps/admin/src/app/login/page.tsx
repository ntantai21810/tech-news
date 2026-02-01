'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, createAdmin } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.data) {
      setAuth(result.data.accessToken, result.data.admin);
      router.push('/dashboard');
    }
    setLoading(false);
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await createAdmin(email, password, name);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Auto-login after setup
    const loginResult = await login(email, password);
    if (loginResult.data) {
      setAuth(loginResult.data.accessToken, loginResult.data.admin);
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}
          >
            Tech Intel Admin
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {isSetup ? 'Create your admin account' : 'Sign in to continue'}
          </p>
        </div>

        <form
          onSubmit={isSetup ? handleSetup : handleLogin}
          className="card"
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {isSetup && (
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? 'Please wait...' : isSetup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
          }}
        >
          {isSetup ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsSetup(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  cursor: 'pointer',
                }}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              First time?{' '}
              <button
                type="button"
                onClick={() => setIsSetup(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  cursor: 'pointer',
                }}
              >
                Create account
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
