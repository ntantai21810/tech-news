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

interface OllamaResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

@Injectable()
export class OllamaProvider implements ILlmProvider {
  readonly name = 'ollama' as const;
  readonly defaultModel = 'llama3:8b';
  private readonly baseUrl: string;
  private readonly logger = new Logger(OllamaProvider.name);
  private _isAvailable = false;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('OLLAMA_BASE_URL') || 'http://localhost:11434';

    // Check availability on startup
    this.checkAvailability();
  }

  private async checkAvailability() {
    try {
      await axios.get(`${this.baseUrl}/api/tags`, { timeout: 2000 });
      this._isAvailable = true;
      this.logger.log('✅ Ollama provider available');
    } catch {
      this._isAvailable = false;
      this.logger.warn('⚠️ Ollama not available (local models disabled)');
    }
  }

  get isAvailable(): boolean {
    return this._isAvailable;
  }

  async complete(
    messages: LlmMessage[],
    options?: LlmCompletionOptions,
  ): Promise<LlmCompletionResult> {
    const model =
      options?.model ||
      this.config.get<string>('OLLAMA_MODEL') ||
      this.defaultModel;

    try {
      const response = await axios.post<OllamaResponse>(
        `${this.baseUrl}/api/chat`,
        {
          model,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: false,
          options: {
            num_predict: options?.maxTokens || 4096,
            temperature: options?.temperature ?? 0.7,
          },
        },
        { timeout: 120000 }, // 2 minute timeout for local models
      );

      const content = response.data.message?.content || '';

      // Ollama provides approximate token counts
      const usage = {
        inputTokens: response.data.prompt_eval_count || 0,
        outputTokens: response.data.eval_count || 0,
        totalTokens:
          (response.data.prompt_eval_count || 0) +
          (response.data.eval_count || 0),
      };

      return {
        content,
        usage,
        model,
        cost: calculateCost(model, usage.inputTokens, usage.outputTokens), // Free for local
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          this._isAvailable = false;
          throw new Error('Ollama server not running');
        }
        throw new Error(`Ollama error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * List available local models
   */
  async listModels(): Promise<string[]> {
    if (!this._isAvailable) return [];

    try {
      const response = await axios.get<{ models: Array<{ name: string }> }>(
        `${this.baseUrl}/api/tags`,
      );
      return response.data.models.map((m) => m.name);
    } catch {
      return [];
    }
  }
}
