import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SourcesService } from '@/sources/sources.service';
import { GitHubCollector } from './github/github.collector';
import { RssCollector } from './rss/rss.collector';
import { RedditCollector } from './reddit/reddit.collector';
import { SourceType } from '@prisma/client';

@Injectable()
export class CollectorScheduler {
  private readonly logger = new Logger(CollectorScheduler.name);

  constructor(
    private readonly sourcesService: SourcesService,
    private readonly githubCollector: GitHubCollector,
    private readonly rssCollector: RssCollector,
    private readonly redditCollector: RedditCollector,
  ) {}

  // Run hourly collectors
  @Cron(CronExpression.EVERY_HOUR)
  async runHourlyCollectors() {
    this.logger.log('⏰ Running hourly collection cycle');
    await this.runCollectorsByFrequency('hourly');
  }

  // Run daily collectors at 6 AM
  @Cron('0 6 * * *')
  async runDailyCollectors() {
    this.logger.log('📅 Running daily collection cycle');
    await this.runCollectorsByFrequency('daily');
  }

  // Run weekly collectors on Sunday at 6 AM
  @Cron('0 6 * * 0')
  async runWeeklyCollectors() {
    this.logger.log('📆 Running weekly collection cycle');
    await this.runCollectorsByFrequency('weekly');
  }

  private async runCollectorsByFrequency(frequency: string) {
    const sources = await this.sourcesService.findAll({ isActive: true });
    const frequencySources = sources.filter(
      (s) => s.checkFrequency === frequency,
    );

    this.logger.log(
      `Found ${frequencySources.length} sources for ${frequency} collection`,
    );

    for (const source of frequencySources) {
      try {
        await this.collectFromSource(source);
        await this.sourcesService.updateHealth(source.id, {
          lastFetchAt: new Date(),
          lastError: undefined,
          errorCount: 0,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Failed to collect from ${source.name}: ${errorMessage}`);
        await this.sourcesService.updateHealth(source.id, {
          lastError: errorMessage,
          errorCount: source.errorCount + 1,
        });
      }
    }
  }

  private async collectFromSource(source: {
    id: string;
    type: SourceType;
    url: string;
    config: unknown;
  }) {
    switch (source.type) {
      case 'GITHUB':
        await this.githubCollector.collect(source);
        break;
      case 'RSS':
        await this.rssCollector.collect(source);
        break;
      case 'REDDIT':
        await this.redditCollector.collect(source);
        break;
      default:
        this.logger.warn(`Unsupported source type: ${source.type}`);
    }
  }

  // Manual trigger for testing
  async triggerCollection(sourceId: string) {
    const source = await this.sourcesService.findOne(sourceId);
    await this.collectFromSource(source);
    return { success: true, message: `Collected from ${source.name}` };
  }

  // Collect all active sources immediately
  async triggerAllCollections() {
    const sources = await this.sourcesService.findAll({ isActive: true });
    this.logger.log(`Triggering collection for ${sources.length} sources`);

    const results = [];
    for (const source of sources) {
      try {
        await this.collectFromSource(source);
        results.push({ sourceId: source.id, name: source.name, success: true });
      } catch (error) {
        results.push({
          sourceId: source.id,
          name: source.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }
}
