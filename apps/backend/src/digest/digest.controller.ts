import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { DigestGeneratorService } from './digest-generator.service';

@Controller('digests')
export class DigestController {
  constructor(private readonly digestService: DigestGeneratorService) {}

  @Get()
  findAll(
    @Query('status') status?: 'DRAFT' | 'REVIEW' | 'PUBLISHED',
    @Query('limit') limit?: string,
  ) {
    return this.digestService.getDigests({
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('latest')
  getLatest() {
    return this.digestService.getLatestDigest();
  }

  @Get(':date')
  getByDate(@Param('date') date: string) {
    return this.digestService.getDigestByDate(new Date(date));
  }

  @Post('generate')
  async generate(@Query('date') date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const digest = await this.digestService.generateDigestForDate(targetDate);
    return { success: true, digest };
  }

  @Post(':id/publish')
  async publish(@Param('id') id: string) {
    const digest = await this.digestService.publishDigest(id);
    return { success: true, digest };
  }
}
