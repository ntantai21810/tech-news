import { LlmProvider } from '@tech-intel/types';

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmCompletionOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface LlmCompletionResult {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
  cost: number;
}

export interface ILlmProvider {
  readonly name: LlmProvider;
  readonly isAvailable: boolean;
  readonly defaultModel: string;

  complete(
    messages: LlmMessage[],
    options?: LlmCompletionOptions,
  ): Promise<LlmCompletionResult>;
}

// Cost per 1M tokens (in USD)
export const LLM_COSTS: Record<string, { input: number; output: number }> = {
  // Claude
  'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },

  // OpenAI
  'gpt-4o': { input: 2.5, output: 10.0 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4-turbo': { input: 10.0, output: 30.0 },

  // Gemini
  'gemini-1.5-pro': { input: 1.25, output: 5.0 },
  'gemini-1.5-flash': { input: 0.075, output: 0.3 },
  'gemini-2.0-flash': { input: 0.1, output: 0.4 },

  // GLM
  'glm-4-plus': { input: 0.5, output: 0.5 },
  'glm-4-flash': { input: 0.01, output: 0.01 },

  // Ollama (local - free)
  'llama3:8b': { input: 0, output: 0 },
  'mistral:7b': { input: 0, output: 0 },
  'qwen2.5:7b': { input: 0, output: 0 },
};

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const costs = LLM_COSTS[model];
  if (!costs) return 0;

  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;
  return inputCost + outputCost;
}
