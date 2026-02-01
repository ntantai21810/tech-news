import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { SourcesService } from './sources.service';
import { CreateSourceDto, UpdateSourceDto } from './dto/source.dto';
import { SourceType, Priority } from '@prisma/client';

@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Get()
  findAll(
    @Query('type') type?: SourceType,
    @Query('isActive') isActive?: string,
    @Query('priority') priority?: Priority,
  ) {
    return this.sourcesService.findAll({
      type,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      priority,
    });
  }

  @Get('health')
  getHealth() {
    return this.sourcesService.getSourceHealth();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sourcesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSourceDto) {
    return this.sourcesService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSourceDto) {
    return this.sourcesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sourcesService.remove(id);
  }
}
