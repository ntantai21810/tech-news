import { Controller, Get, Query } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  getSystemStats() {
    return this.statsService.getSystemStats();
  }

  @Get('llm')
  getLlmUsage(@Query('days') days?: string) {
    return this.statsService.getLlmUsageStats(days ? parseInt(days, 10) : 30);
  }

  @Get('collection')
  getCollectionStats(@Query('days') days?: string) {
    return this.statsService.getCollectionStats(days ? parseInt(days, 10) : 7);
  }

  @Get('categories')
  getCategoryDistribution() {
    return this.statsService.getCategoryDistribution();
  }

  @Get('tags')
  getTagCloud(@Query('limit') limit?: string) {
    return this.statsService.getTagCloud(limit ? parseInt(limit, 10) : 30);
  }
}
