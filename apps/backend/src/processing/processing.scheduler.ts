import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SummarizerService } from './summarizer.service';

@Injectable()
export class ProcessingScheduler {
  private readonly logger = new Logger(ProcessingScheduler.name);
  private isProcessing = false;

  constructor(private readonly summarizer: SummarizerService) {}

  // Process unprocessed items every 30 minutes
  @Cron(CronExpression.EVERY_30_MINUTES)
  async runProcessingCycle() {
    if (this.isProcessing) {
      this.logger.log('Processing already in progress, skipping');
      return;
    }

    this.isProcessing = true;
    this.logger.log('🧠 Starting processing cycle');

    try {
      const processed = await this.summarizer.processBatch(20);
      this.logger.log(`Processing cycle complete: ${processed} items processed`);
    } catch (error) {
      this.logger.error(
        `Processing cycle failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      this.isProcessing = false;
    }
  }

  // Manual trigger for testing
  async triggerProcessing(limit = 20): Promise<number> {
    if (this.isProcessing) {
      throw new Error('Processing already in progress');
    }

    this.isProcessing = true;
    try {
      return await this.summarizer.processBatch(limit);
    } finally {
      this.isProcessing = false;
    }
  }
}
