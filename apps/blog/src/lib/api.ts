const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export interface Digest {
  id: string;
  date: string;
  title: string;
  content: string;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED';
  publishedAt: string | null;
  items?: DigestItem[];
}

export interface DigestItem {
  id: string;
  section: string;
  order: number;
  processedItem: ProcessedItem;
}

export interface ProcessedItem {
  id: string;
  summary: string;
  categories: string[];
  tags: string[];
  relevanceScore: number;
  urgencyLevel: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'CONTROVERSIAL' | null;
  actionItems: string[];
  rawItem: RawItem;
}

export interface RawItem {
  id: string;
  title: string;
  url: string;
  author: string | null;
  publishedAt: string;
  source: Source;
}

export interface Source {
  id: string;
  name: string;
  type: string;
}

export interface SystemStats {
  totalSources: number;
  activeSources: number;
  totalItems: number;
  processedItems: number;
  totalDigests: number;
  publishedDigests: number;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

async function fetchApi<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api${endpoint}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText}`);
      return null;
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
}

export async function getLatestDigest(): Promise<Digest | null> {
  return fetchApi<Digest>('/digests/latest');
}

export async function getDigests(limit = 10): Promise<Digest[]> {
  const digests = await fetchApi<Digest[]>(`/digests?status=PUBLISHED&limit=${limit}`);
  return digests || [];
}

export async function getDigestByDate(date: string): Promise<Digest | null> {
  return fetchApi<Digest>(`/digests/${date}`);
}

export async function getStats(): Promise<SystemStats | null> {
  return fetchApi<SystemStats>('/stats');
}

export async function getTagCloud(limit = 30): Promise<TagCount[]> {
  const tags = await fetchApi<TagCount[]>(`/stats/tags?limit=${limit}`);
  return tags || [];
}

export async function getCategories(): Promise<CategoryCount[]> {
  const cats = await fetchApi<CategoryCount[]>('/stats/categories');
  return cats || [];
}

export async function searchItems(query: string): Promise<ProcessedItem[]> {
  const items = await fetchApi<ProcessedItem[]>(`/items?search=${encodeURIComponent(query)}`);
  return items || [];
}
