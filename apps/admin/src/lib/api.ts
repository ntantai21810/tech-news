const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Auth
export async function login(email: string, password: string) {
  return apiRequest<{
    accessToken: string;
    admin: { id: string; email: string; name: string | null };
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getProfile() {
  return apiRequest<{
    id: string;
    email: string;
    name: string | null;
    isActive: boolean;
    lastLoginAt: string | null;
  }>('/auth/me');
}

export async function createAdmin(email: string, password: string, name?: string) {
  return apiRequest<{ id: string; email: string; name: string | null }>('/auth/setup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

// Sources
export async function getSources() {
  return apiRequest<Array<{
    id: string;
    type: string;
    name: string;
    url: string;
    isActive: boolean;
    lastFetchAt: string | null;
    errorCount: number;
  }>>('/sources');
}

export async function getSourceHealth() {
  return apiRequest<{
    healthy: number;
    unhealthy: number;
    inactive: number;
    sources: Array<{
      id: string;
      name: string;
      status: 'healthy' | 'unhealthy' | 'inactive';
      lastError?: string;
    }>;
  }>('/sources/health');
}

export async function createSource(data: {
  type: string;
  name: string;
  url: string;
  checkFrequency?: string;
  priority?: string;
  categoryTags?: string[];
}) {
  return apiRequest('/sources', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSource(id: string, data: Partial<{
  name: string;
  url: string;
  isActive: boolean;
  checkFrequency: string;
  priority: string;
}>) {
  return apiRequest(`/sources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSource(id: string) {
  return apiRequest(`/sources/${id}`, { method: 'DELETE' });
}

// Stats
export async function getStats() {
  return apiRequest<{
    sources: { total: number; active: number; types: Record<string, number> };
    items: { raw: number; processed: number; todayProcessed: number };
    digests: { total: number; published: number; draft: number };
  }>('/stats');
}

export async function getLlmStats() {
  return apiRequest<{
    totalCost: number;
    totalTokens: number;
    byProvider: Record<string, { cost: number; tokens: number; count: number }>;
    recentUsage: Array<{ date: string; cost: number; tokens: number }>;
  }>('/stats/llm');
}

export async function getCategoryStats() {
  return apiRequest<Array<{ category: string; count: number }>>('/stats/categories');
}

// Digests
export async function getDigests(status?: string) {
  const query = status ? `?status=${status}` : '';
  return apiRequest<Array<{
    id: string;
    date: string;
    title: string;
    status: string;
    publishedAt: string | null;
  }>>(`/digests${query}`);
}

export async function generateDigest() {
  return apiRequest('/digests/generate', { method: 'POST' });
}

export async function publishDigest(id: string) {
  return apiRequest(`/digests/${id}/publish`, { method: 'POST' });
}
