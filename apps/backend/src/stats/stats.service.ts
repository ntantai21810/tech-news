import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { subDays, startOfDay } from 'date-fns';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSystemStats() {
    const [
      totalSources,
      activeSources,
      totalItems,
      processedItems,
      totalDigests,
      publishedDigests,
      llmUsage,
    ] = await Promise.all([
      this.prisma.source.count(),
      this.prisma.source.count({ where: { isActive: true } }),
      this.prisma.rawItem.count(),
      this.prisma.processedItem.count(),
      this.prisma.digest.count(),
      this.prisma.digest.count({ where: { status: 'PUBLISHED' } }),
      this.getLlmUsageStats(),
    ]);

    return {
      totalSources,
      activeSources,
      totalItems,
      processedItems,
      totalDigests,
      publishedDigests,
      llmUsage,
    };
  }

  async getLlmUsageStats(days = 30) {
    const since = startOfDay(subDays(new Date(), days));

    const byProvider = await this.prisma.llmUsage.groupBy({
      by: ['provider'],
      where: { createdAt: { gte: since } },
      _sum: {
        tokensIn: true,
        tokensOut: true,
        cost: true,
      },
    });

    const totals = await this.prisma.llmUsage.aggregate({
      where: { createdAt: { gte: since } },
      _sum: {
        tokensIn: true,
        tokensOut: true,
        cost: true,
      },
    });

    return {
      totalTokens: (totals._sum.tokensIn || 0) + (totals._sum.tokensOut || 0),
      totalCost: totals._sum.cost || 0,
      byProvider: byProvider.reduce(
        (acc, p) => {
          acc[p.provider] = {
            tokens: (p._sum.tokensIn || 0) + (p._sum.tokensOut || 0),
            cost: p._sum.cost || 0,
          };
          return acc;
        },
        {} as Record<string, { tokens: number; cost: number }>,
      ),
    };
  }

  async getCollectionStats(days = 7) {
    const since = startOfDay(subDays(new Date(), days));

    const bySource = await this.prisma.rawItem.groupBy({
      by: ['sourceId'],
      where: { fetchedAt: { gte: since } },
      _count: true,
    });

    const sources = await this.prisma.source.findMany({
      select: { id: true, name: true, type: true },
    });

    const sourceMap = new Map(sources.map((s) => [s.id, s]));

    return bySource.map((s) => ({
      source: sourceMap.get(s.sourceId),
      itemCount: s._count,
    }));
  }

  async getCategoryDistribution() {
    const items = await this.prisma.processedItem.findMany({
      select: { categories: true },
    });

    const distribution: Record<string, number> = {};
    for (const item of items) {
      for (const cat of item.categories) {
        distribution[cat] = (distribution[cat] || 0) + 1;
      }
    }

    return Object.entries(distribution)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  async getTagCloud(limit = 30) {
    const items = await this.prisma.processedItem.findMany({
      select: { tags: true },
    });

    const tagCounts: Record<string, number> = {};
    for (const item of items) {
      for (const tag of item.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}
