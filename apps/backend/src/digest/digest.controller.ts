import { Controller, Get, Post, Put, Param, Query, Body } from '@nestjs/common';
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

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.digestService.getDigestById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { title?: string; content?: string },
  ) {
    return this.digestService.updateDigest(id, body);
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
