import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { SourceType, Priority, Prisma } from '@prisma/client';
import { CreateSourceDto, UpdateSourceDto } from './dto/source.dto';

@Injectable()
export class SourcesService {
  private readonly logger = new Logger(SourcesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(options?: {
    type?: SourceType;
    isActive?: boolean;
    priority?: Priority;
  }) {
    const where: Prisma.SourceWhereInput = {};

    if (options?.type) where.type = options.type;
    if (options?.isActive !== undefined) where.isActive = options.isActive;
    if (options?.priority) where.priority = options.priority;

    return this.prisma.source.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const source = await this.prisma.source.findUnique({ where: { id } });
    if (!source) {
      throw new NotFoundException(`Source with ID "${id}" not found`);
    }
    return source;
  }

  async create(data: CreateSourceDto) {
    this.logger.log(`Creating source: ${data.name} (${data.type})`);
    return this.prisma.source.create({ data });
  }

  async update(id: string, data: UpdateSourceDto) {
    await this.findOne(id); // Ensure exists
    this.logger.log(`Updating source: ${id}`);
    return this.prisma.source.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure exists
    this.logger.log(`Deleting source: ${id}`);
    return this.prisma.source.delete({ where: { id } });
  }

  async getActiveByType(type: SourceType) {
    return this.prisma.source.findMany({
      where: { type, isActive: true },
      orderBy: { priority: 'desc' },
    });
  }

  async updateHealth(
    id: string,
    data: { lastFetchAt?: Date; lastError?: string; errorCount?: number },
  ) {
    return this.prisma.source.update({
      where: { id },
      data: {
        lastFetchAt: data.lastFetchAt,
        lastError: data.lastError,
        errorCount: data.errorCount,
      },
    });
  }

  async getSourceHealth() {
    const sources = await this.prisma.source.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        isActive: true,
        lastFetchAt: true,
        lastError: true,
        errorCount: true,
        relevanceRate: true,
        _count: { select: { items: true } },
      },
    });

    return sources.map((s) => ({
      sourceId: s.id,
      sourceName: s.name,
      type: s.type,
      lastFetch: s.lastFetchAt,
      errorCount: s.errorCount,
      relevanceRate: s.relevanceRate,
      itemCount: s._count.items,
      status: this.calculateHealthStatus(s),
    }));
  }

  private calculateHealthStatus(source: {
    isActive: boolean;
    lastFetchAt: Date | null;
    errorCount: number;
  }): 'healthy' | 'warning' | 'error' | 'inactive' {
    if (!source.isActive) return 'inactive';
    if (source.errorCount >= 5) return 'error';
    if (source.errorCount > 0) return 'warning';

    // Check if stale (no fetch in 3 days)
    if (source.lastFetchAt) {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      if (source.lastFetchAt < threeDaysAgo) return 'warning';
    }

    return 'healthy';
  }
}
