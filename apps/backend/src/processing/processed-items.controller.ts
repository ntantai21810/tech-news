import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ProcessedItemsService } from './processed-items.service';

@Controller('processed-items')
export class ProcessedItemsController {
  constructor(private readonly processedItemsService: ProcessedItemsService) {}

  @Get()
  findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('category') category?: string,
  ) {
    return this.processedItemsService.findAll({
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
      category,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.processedItemsService.findOne(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.processedItemsService.updateModerationStatus(id, 'approved');
  }

  @Post(':id/reject')
  reject(@Param('id') id: string) {
    return this.processedItemsService.updateModerationStatus(id, 'rejected');
  }
}
