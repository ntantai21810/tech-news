import { Module } from '@nestjs/common';
import { LlmService } from './llm/llm.service';
import { ClaudeProvider } from './llm/providers/claude.provider';
import { OpenAiProvider } from './llm/providers/openai.provider';
import { GeminiProvider } from './llm/providers/gemini.provider';
import { GlmProvider } from './llm/providers/glm.provider';
import { OllamaProvider } from './llm/providers/ollama.provider';
import { SummarizerService } from './summarizer.service';
import { ProcessingScheduler } from './processing.scheduler';
import { ProcessedItemsController } from './processed-items.controller';
import { ProcessedItemsService } from './processed-items.service';

@Module({
  controllers: [ProcessedItemsController],
  providers: [
    // LLM Providers
    ClaudeProvider,
    OpenAiProvider,
    GeminiProvider,
    GlmProvider,
    OllamaProvider,

    // Services
    LlmService,
    SummarizerService,
    ProcessingScheduler,
    ProcessedItemsService,
  ],
  exports: [LlmService, SummarizerService, ProcessedItemsService],
})
export class ProcessingModule {}

