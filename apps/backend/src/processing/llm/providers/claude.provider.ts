import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import {
  ILlmProvider,
  LlmMessage,
  LlmCompletionOptions,
  LlmCompletionResult,
  calculateCost,
} from '../llm.types';

@Injectable()
export class ClaudeProvider implements ILlmProvider {
  readonly name = 'claude' as const;
  readonly defaultModel = 'claude-3-5-sonnet-20241022';
  private readonly client: Anthropic | null = null;
  private readonly logger = new Logger(ClaudeProvider.name);

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
      this.logger.log('✅ Claude provider initialized');
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
      throw new Error('Claude provider not configured');
    }

    const model = options?.model || this.defaultModel;

    // Extract system message
    const systemMessage = messages.find((m) => m.role === 'system')?.content;
    const userMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const response = await this.client.messages.create({
      model,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature ?? 0.7,
      system: systemMessage,
      messages: userMessages,
    });

    const content =
      response.content[0].type === 'text' ? response.content[0].text : '';

    const usage = {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    };

    return {
      content,
      usage,
      model,
      cost: calculateCost(model, usage.inputTokens, usage.outputTokens),
    };
  }
}
