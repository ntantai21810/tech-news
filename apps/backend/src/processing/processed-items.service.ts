import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class ProcessedItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: {
    limit?: number;
    offset?: number;
    category?: string;
  }) {
    const { limit = 50, offset = 0, category } = options;

    return this.prisma.processedItem.findMany({
      where: category
        ? {
            categories: { has: category },
          }
        : undefined,
      include: {
        rawItem: {
          include: {
            source: {
              select: { id: true, name: true, type: true },
            },
          },
        },
      },
      orderBy: [{ processedAt: 'desc' }],
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    return this.prisma.processedItem.findUnique({
      where: { id },
      include: {
        rawItem: {
          include: {
            source: true,
          },
        },
      },
    });
  }

  async updateModerationStatus(id: string, status: 'approved' | 'rejected') {
    // For now, we'll use a simple approach - update relevance score
    // In a full implementation, you'd add a moderationStatus field to the schema
    const relevanceScore = status === 'approved' ? 1.0 : 0.0;
    
    return this.prisma.processedItem.update({
      where: { id },
      data: { relevanceScore },
    });
  }

  async getStats() {
    const [total, categories] = await Promise.all([
      this.prisma.processedItem.count(),
      this.prisma.processedItem.groupBy({
        by: ['categories'],
        _count: true,
      }),
    ]);

    return { total, categoryCounts: categories };
  }
}
