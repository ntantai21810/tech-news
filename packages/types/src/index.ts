// ============================================
// Source Types
// ============================================

export type SourceType = 
  | 'GITHUB'
  | 'REDDIT'
  | 'RSS'
  | 'TWITTER'
  | 'HACKERNEWS'
  | 'WEBSITE';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Source {
  id: string;
  type: SourceType;
  name: string;
  url: string;
  config: Record<string, unknown>;
  priority: Priority;
  checkFrequency: 'hourly' | 'daily' | 'weekly';
  categoryTags: string[];
  isActive: boolean;
  notes?: string;
  lastFetchAt?: Date;
  lastError?: string;
  errorCount: number;
  relevanceRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSourceDto {
  type: SourceType;
  name: string;
  url: string;
  config?: Record<string, unknown>;
  priority?: Priority;
  checkFrequency?: 'hourly' | 'daily' | 'weekly';
  categoryTags?: string[];
  notes?: string;
}

export interface UpdateSourceDto extends Partial<CreateSourceDto> {
  isActive?: boolean;
}

// ============================================
// Raw Item Types
// ============================================

export interface RawItem {
  id: string;
  sourceId: string;
  externalId: string;
  title: string;
  content: string;
  url: string;
  author?: string;
  publishedAt: Date;
  fetchedAt: Date;
  metadata?: Record<string, unknown>;
  isProcessed: boolean;
}

// ============================================
// Processed Item Types
// ============================================

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
export type Sentiment = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'CONTROVERSIAL';

export interface ProcessedItem {
  id: string;
  rawItemId: string;
  summary: string;
  categories: string[];
  tags: string[];
  relevanceScore: number;
  urgencyLevel: UrgencyLevel;
  sentiment?: Sentiment;
  actionItems: string[];
  llmModel: string;
  llmTokensUsed: number;
  llmCost: number;
  processedAt: Date;
}

// ============================================
// Digest Types
// ============================================

export type DigestStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED';

export type DigestSection = 
  | 'critical'
  | 'releases'
  | 'news'
  | 'ai'
  | 'reading'
  | 'trending';

export interface Digest {
  id: string;
  date: Date;
  title: string;
  content: string;
  status: DigestStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DigestItem {
  id: string;
  digestId: string;
  processedItemId: string;
  section: DigestSection;
  order: number;
  processedItem?: ProcessedItem;
}

export interface DigestWithItems extends Digest {
  items: DigestItem[];
}

// ============================================
// LLM Types
// ============================================

export type LlmProvider = 'claude' | 'openai' | 'gemini' | 'glm' | 'ollama';

export interface LlmConfig {
  provider: LlmProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LlmUsage {
  id: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  operation: string;
  createdAt: Date;
}

export interface LlmResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
  cost: number;
}

// ============================================
// API Response Types
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// ============================================
// Stats Types
// ============================================

export interface SystemStats {
  totalSources: number;
  activeSources: number;
  totalItems: number;
  processedItems: number;
  totalDigests: number;
  publishedDigests: number;
  llmUsage: {
    totalTokens: number;
    totalCost: number;
    byProvider: Record<string, { tokens: number; cost: number }>;
  };
}

export interface SourceHealth {
  sourceId: string;
  sourceName: string;
  lastFetch: Date | null;
  errorCount: number;
  relevanceRate: number;
  contentFrequency: number; // items per day
  status: 'healthy' | 'warning' | 'error' | 'inactive';
}
