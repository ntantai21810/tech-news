import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  ILlmProvider,
  LlmMessage,
  LlmCompletionOptions,
  LlmCompletionResult,
  calculateCost,
} from '../llm.types';

@Injectable()
export class OpenAiProvider implements ILlmProvider {
  readonly name = 'openai' as const;
  readonly defaultModel = 'gpt-4o-mini';
  private readonly client: OpenAI | null = null;
  private readonly logger = new Logger(OpenAiProvider.name);

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
      this.logger.log('✅ OpenAI provider initialized');
    }
  }

  get isAvailable(): boolean {
    return this.client !== null;
  }

  async complete(
    messages: LlmMessage[],
    options?: LlmCompletionOptions,
  ): Promise<LlmCompletionResult> {
    if (!this.client) {
      throw new Error('OpenAI provider not configured');
    }

    const model = options?.model || this.defaultModel;

    const response = await this.client.chat.completions.create({
      model,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature ?? 0.7,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content = response.choices[0]?.message?.content || '';

    const usage = {
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    };

    return {
      content,
      usage,
      model,
      cost: calculateCost(model, usage.inputTokens, usage.outputTokens),
    };
  }
}
