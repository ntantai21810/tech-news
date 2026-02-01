import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmProvider } from '@tech-intel/types';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  ILlmProvider,
  LlmMessage,
  LlmCompletionOptions,
  LlmCompletionResult,
} from './llm.types';
import { ClaudeProvider } from './providers/claude.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { GlmProvider } from './providers/glm.provider';
import { OllamaProvider } from './providers/ollama.provider';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly providers: Map<LlmProvider, ILlmProvider>;
  private currentProvider: LlmProvider;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    claudeProvider: ClaudeProvider,
    openaiProvider: OpenAiProvider,
    geminiProvider: GeminiProvider,
    glmProvider: GlmProvider,
    ollamaProvider: OllamaProvider,
  ) {
    // Register all providers
    this.providers = new Map<LlmProvider, ILlmProvider>([
      ['claude', claudeProvider],
      ['openai', openaiProvider],
      ['gemini', geminiProvider],
      ['glm', glmProvider],
      ['ollama', ollamaProvider],
    ]);

    // Set default provider from config
    this.currentProvider =
      (this.config.get<LlmProvider>('LLM_DEFAULT_PROVIDER') as LlmProvider) ||
      'claude';

    this.logger.log(`🧠 LLM Service initialized with provider: ${this.currentProvider}`);
  }

  /**
   * Get current active provider
   */
  getActiveProvider(): LlmProvider {
    return this.currentProvider;
  }

  /**
   * Switch to a different provider
   */
  setProvider(provider: LlmProvider): void {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Unknown LLM provider: ${provider}`);
    }
    if (!providerInstance.isAvailable) {
      throw new Error(`LLM provider ${provider} is not configured`);
    }
    this.currentProvider = provider;
    this.logger.log(`Switched to LLM provider: ${provider}`);
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): Array<{
    name: LlmProvider;
    available: boolean;
    defaultModel: string;
  }> {
    return Array.from(this.providers.entries()).map(([name, provider]) => ({
      name,
      available: provider.isAvailable,
      defaultModel: provider.defaultModel,
    }));
  }

  /**
   * Complete a prompt using the current provider
   */
  async complete(
    messages: LlmMessage[],
    options?: LlmCompletionOptions & { provider?: LlmProvider },
  ): Promise<LlmCompletionResult> {
    const providerName = options?.provider || this.currentProvider;
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`Unknown LLM provider: ${providerName}`);
    }

    if (!provider.isAvailable) {
      // Try fallback to ollama
      this.logger.warn(
        `Provider ${providerName} not available, falling back to ollama`,
      );
      const ollama = this.providers.get('ollama');
      if (!ollama?.isAvailable) {
        throw new Error('No LLM providers available');
      }
      return this.executeWithLogging(ollama, messages, options, 'summarize');
    }

    return this.executeWithLogging(provider, messages, options, 'summarize');
  }

  /**
   * Execute completion and log usage
   */
  private async executeWithLogging(
    provider: ILlmProvider,
    messages: LlmMessage[],
    options: LlmCompletionOptions | undefined,
    operation: string,
  ): Promise<LlmCompletionResult> {
    const result = await provider.complete(messages, options);

    // Log usage to database
    await this.prisma.llmUsage.create({
      data: {
        model: result.model,
        provider: provider.name,
        tokensIn: result.usage.inputTokens,
        tokensOut: result.usage.outputTokens,
        cost: result.cost,
        operation,
      },
    });

    return result;
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const usage = await this.prisma.llmUsage.groupBy({
      by: ['provider', 'model'],
      where: { createdAt: { gte: since } },
      _sum: {
        tokensIn: true,
        tokensOut: true,
        cost: true,
      },
      _count: true,
    });

    const totals = await this.prisma.llmUsage.aggregate({
      where: { createdAt: { gte: since } },
      _sum: {
        tokensIn: true,
        tokensOut: true,
        cost: true,
      },
      _count: true,
    });

    return {
      byProvider: usage.map((u) => ({
        provider: u.provider,
        model: u.model,
        requests: u._count,
        tokensIn: u._sum.tokensIn || 0,
        tokensOut: u._sum.tokensOut || 0,
        cost: u._sum.cost || 0,
      })),
      totals: {
        requests: totals._count,
        tokensIn: totals._sum.tokensIn || 0,
        tokensOut: totals._sum.tokensOut || 0,
        cost: totals._sum.cost || 0,
      },
    };
  }
}
