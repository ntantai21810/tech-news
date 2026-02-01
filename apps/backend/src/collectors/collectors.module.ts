import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';

import { GitHubCollector } from './github/github.collector';
import { RssCollector } from './rss/rss.collector';
import { RedditCollector } from './reddit/reddit.collector';
import { CollectorScheduler } from './collector.scheduler';
import { SourcesModule } from '@/sources/sources.module';

@Module({
  imports: [
    ScheduleModule,
    BullModule.registerQueue({ name: 'collector' }),
    SourcesModule,
  ],
  providers: [
    GitHubCollector,
    RssCollector,
    RedditCollector,
    CollectorScheduler,
  ],
  exports: [GitHubCollector, RssCollector, RedditCollector],
})
export class CollectorsModule {}
