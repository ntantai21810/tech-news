import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import {
  ILlmProvider,
  LlmMessage,
  LlmCompletionOptions,
  LlmCompletionResult,
  calculateCost,
} from '../llm.types';

@Injectable()
export class GeminiProvider implements ILlmProvider {
  readonly name = 'gemini' as const;
  readonly defaultModel = 'gemini-2.0-flash';
  private readonly client: GoogleGenerativeAI | null = null;
  private readonly logger = new Logger(GeminiProvider.name);

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GOOGLE_AI_API_KEY');
    if (apiKey) {
      this.client = new GoogleGenerativeAI(apiKey);
      this.logger.log('✅ Gemini provider initialized');
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
      throw new Error('Gemini provider not configured');
    }

    const modelName = options?.model || this.defaultModel;
    const model: GenerativeModel = this.client.getGenerativeModel({
      model: modelName,
    });

    // Convert messages to Gemini format
    const systemInstruction = messages.find((m) => m.role === 'system')?.content;
    const history = messages
      .filter((m) => m.role !== 'system')
      .slice(0, -1)
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const lastMessage = messages.filter((m) => m.role !== 'system').pop();

    const chat = model.startChat({
      history: history as Parameters<typeof model.startChat>[0]['history'],
      generationConfig: {
        maxOutputTokens: options?.maxTokens || 4096,
        temperature: options?.temperature ?? 0.7,
      },
      systemInstruction: systemInstruction
        ? { parts: [{ text: systemInstruction }], role: 'user' }
        : undefined,
    });

    const result = await chat.sendMessage(lastMessage?.content || '');
    const response = result.response;
    const content = response.text();

    // Gemini doesn't provide exact token counts in all cases
    const usage = {
      inputTokens: response.usageMetadata?.promptTokenCount || 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata?.totalTokenCount || 0,
    };

    return {
      content,
      usage,
      model: modelName,
      cost: calculateCost(modelName, usage.inputTokens, usage.outputTokens),
    };
  }
}
