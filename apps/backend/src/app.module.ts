import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';

import { PrismaModule } from './common/prisma/prisma.module';
import { SourcesModule } from './sources/sources.module';
import { CollectorsModule } from './collectors/collectors.module';
import { ProcessingModule } from './processing/processing.module';
import { DigestModule } from './digest/digest.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Scheduling for cron jobs
    ScheduleModule.forRoot(),

    // BullMQ for job queues
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),

    // Database
    PrismaModule,

    // Feature modules
    SourcesModule,
    CollectorsModule,
    ProcessingModule,
    DigestModule,
    StatsModule,
  ],
})
export class AppModule {}
