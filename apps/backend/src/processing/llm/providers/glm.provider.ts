import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  ILlmProvider,
  LlmMessage,
  LlmCompletionOptions,
  LlmCompletionResult,
  calculateCost,
} from '../llm.types';

interface GlmResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class GlmProvider implements ILlmProvider {
  readonly name = 'glm' as const;
  readonly defaultModel = 'glm-4-flash';
  private readonly apiKey: string | null = null;
  private readonly baseUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  private readonly logger = new Logger(GlmProvider.name);

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('GLM_API_KEY') || null;
    if (this.apiKey) {
      this.logger.log('✅ GLM (ChatGLM) provider initialized');
    }
  }

  get isAvailable(): boolean {
    return this.apiKey !== null;
  }

  async complete(
    messages: LlmMessage[],
    options?: LlmCompletionOptions,
  ): Promise<LlmCompletionResult> {
    if (!this.apiKey) {
      throw new Error('GLM provider not configured');
    }

    const model = options?.model || this.defaultModel;

    const response = await axios.post<GlmResponse>(
      this.baseUrl,
      {
        model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature ?? 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const content = response.data.choices[0]?.message?.content || '';

    const usage = {
      inputTokens: response.data.usage.prompt_tokens,
      outputTokens: response.data.usage.completion_tokens,
      totalTokens: response.data.usage.total_tokens,
    };

    return {
      content,
      usage,
      model,
      cost: calculateCost(model, usage.inputTokens, usage.outputTokens),
    };
  }
}
