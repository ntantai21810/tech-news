import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from './llm/llm.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RawItem, ProcessedItem } from '@prisma/client';

const SYSTEM_PROMPT = `You are a tech news analyst specializing in JavaScript/TypeScript, Next.js, NestJS, Node.js, and AI/ML technologies.

Your task is to analyze tech content and provide:
1. A concise summary (2-3 sentences for news, up to 5 for major releases)
2. Categories (frontend, backend, ai, security, devops, breaking-change, performance, tooling)
3. Tags (specific technologies: nextjs, nestjs, react, nodejs, typescript, etc.)
4. Relevance score (0-1) based on how important this is for a JS/TS developer
5. Urgency level (CRITICAL, HIGH, NORMAL, LOW)
6. Action items if applicable (e.g., "Update package X to fix CVE-XXX")
7. Sentiment (POSITIVE, NEGATIVE, NEUTRAL, CONTROVERSIAL)

Respond in JSON format:
{
  "summary": "...",
  "categories": ["..."],
  "tags": ["..."],
  "relevanceScore": 0.8,
  "urgencyLevel": "NORMAL",
  "actionItems": ["..."],
  "sentiment": "NEUTRAL"
}`;

interface AnalysisResult {
  summary: string;
  categories: string[];
  tags: string[];
  relevanceScore: number;
  urgencyLevel: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  actionItems: string[];
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'CONTROVERSIAL' | null;
}

@Injectable()
export class SummarizerService {
  private readonly logger = new Logger(SummarizerService.name);

  constructor(
    private readonly llm: LlmService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Process a single raw item
   */
  async processItem(rawItem: RawItem): Promise<ProcessedItem> {
    this.logger.debug(`Processing item: ${rawItem.title.slice(0, 50)}...`);

    const prompt = `Analyze this tech content:

Title: ${rawItem.title}

Content:
${rawItem.content.slice(0, 8000)}

URL: ${rawItem.url}
${rawItem.author ? `Author: ${rawItem.author}` : ''}`;

    const response = await this.llm.complete([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ]);

    const analysis = this.parseAnalysis(response.content);

    // Create processed item
    const processed = await this.prisma.processedItem.create({
      data: {
        rawItemId: rawItem.id,
        summary: analysis.summary,
        categories: analysis.categories,
        tags: analysis.tags,
        relevanceScore: analysis.relevanceScore,
        urgencyLevel: analysis.urgencyLevel,
        sentiment: analysis.sentiment,
        actionItems: analysis.actionItems,
        llmModel: response.model,
        llmTokensUsed: response.usage.totalTokens,
        llmCost: response.cost,
      },
    });

    // Mark raw item as processed
    await this.prisma.rawItem.update({
      where: { id: rawItem.id },
      data: { isProcessed: true },
    });

    return processed;
  }

  /**
   * Process multiple items in batch
   */
  async processBatch(limit = 20): Promise<number> {
    const unprocessed = await this.prisma.rawItem.findMany({
      where: { isProcessed: false },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    if (unprocessed.length === 0) {
      this.logger.log('No unprocessed items to process');
      return 0;
    }

    this.logger.log(`Processing batch of ${unprocessed.length} items`);

    let processed = 0;
    for (const item of unprocessed) {
      try {
        await this.processItem(item);
        processed++;
      } catch (error) {
        this.logger.error(
          `Failed to process item ${item.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    this.logger.log(`✅ Processed ${processed}/${unprocessed.length} items`);
    return processed;
  }

  /**
   * Parse LLM response into structured analysis
   */
  private parseAnalysis(content: string): AnalysisResult {
    try {
      // Extract JSON from response (may have markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        summary: parsed.summary || 'No summary available',
        categories: Array.isArray(parsed.categories) ? parsed.categories : [],
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        relevanceScore: Math.max(0, Math.min(1, Number(parsed.relevanceScore) || 0.5)),
        urgencyLevel: this.validateUrgency(parsed.urgencyLevel),
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
        sentiment: this.validateSentiment(parsed.sentiment),
      };
    } catch (error) {
      this.logger.warn(`Failed to parse LLM response: ${error}`);
      // Return default values
      return {
        summary: content.slice(0, 500),
        categories: [],
        tags: [],
        relevanceScore: 0.5,
        urgencyLevel: 'NORMAL',
        actionItems: [],
        sentiment: null,
      };
    }
  }

  private validateUrgency(
    value: string,
  ): 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW' {
    const valid = ['CRITICAL', 'HIGH', 'NORMAL', 'LOW'];
    return valid.includes(value?.toUpperCase())
      ? (value.toUpperCase() as 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW')
      : 'NORMAL';
  }

  private validateSentiment(
    value: string,
  ): 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'CONTROVERSIAL' | null {
    const valid = ['POSITIVE', 'NEGATIVE', 'NEUTRAL', 'CONTROVERSIAL'];
    return valid.includes(value?.toUpperCase())
      ? (value.toUpperCase() as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'CONTROVERSIAL')
      : null;
  }
}
