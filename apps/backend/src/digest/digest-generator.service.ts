import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@/common/prisma/prisma.service';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

const DIGEST_TEMPLATE = `# Tech Digest - {{date}}

## 🚨 Critical Updates (Security/Breaking Changes)
{{critical}}

## 🚀 Major Releases
{{releases}}

## 📰 Notable News
{{news}}

## 🤖 AI/ML Updates
{{ai}}

## 📚 Worth Reading
{{reading}}

## 📊 Trending This Week
{{trending}}

---

*Generated automatically by Tech Intelligence System*
`;

interface DigestSection {
  title: string;
  summary: string;
  url: string;
  source: string;
  relevanceScore: number;
  tags: string[];
}

@Injectable()
export class DigestGeneratorService {
  private readonly logger = new Logger(DigestGeneratorService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Generate daily digest at 7 AM
  @Cron('0 7 * * *')
  async generateDailyDigest() {
    this.logger.log('📝 Starting daily digest generation');
    const today = new Date();
    await this.generateDigestForDate(today);
  }

  /**
   * Generate digest for a specific date
   */
  async generateDigestForDate(date: Date) {
    const digestDate = startOfDay(date);
    const dateStr = format(digestDate, 'yyyy-MM-dd');

    // Check if digest already exists
    const existing = await this.prisma.digest.findUnique({
      where: { date: digestDate },
    });

    if (existing?.status === 'PUBLISHED') {
      this.logger.log(`Digest for ${dateStr} already published`);
      return existing;
    }

    // Get processed items from the last day
    const yesterday = subDays(digestDate, 1);
    const items = await this.prisma.processedItem.findMany({
      where: {
        processedAt: {
          gte: startOfDay(yesterday),
          lt: endOfDay(yesterday),
        },
        relevanceScore: { gte: 0.3 }, // Only include relevant items
      },
      include: {
        rawItem: {
          include: { source: true },
        },
      },
      orderBy: [{ urgencyLevel: 'desc' }, { relevanceScore: 'desc' }],
    });

    if (items.length === 0) {
      this.logger.log(`No items to include in digest for ${dateStr}`);
      return null;
    }

    // Categorize items
    const sections = this.categorizeItems(items);
    const content = this.buildDigestContent(dateStr, sections);

    // Create or update digest
    const digest = existing
      ? await this.prisma.digest.update({
          where: { id: existing.id },
          data: {
            title: `Tech Digest - ${format(digestDate, 'MMMM d, yyyy')}`,
            content,
            status: 'DRAFT',
          },
        })
      : await this.prisma.digest.create({
          data: {
            date: digestDate,
            title: `Tech Digest - ${format(digestDate, 'MMMM d, yyyy')}`,
            content,
            status: 'DRAFT',
          },
        });

    // Create digest items links
    const digestItems = items.map((item, index) => ({
      digestId: digest.id,
      processedItemId: item.id,
      section: this.determineSection(item),
      order: index,
    }));

    // Clear existing items and recreate
    await this.prisma.digestItem.deleteMany({
      where: { digestId: digest.id },
    });

    await this.prisma.digestItem.createMany({
      data: digestItems,
      skipDuplicates: true,
    });

    this.logger.log(`✅ Generated digest for ${dateStr} with ${items.length} items`);
    return digest;
  }

  /**
   * Publish a draft digest
   */
  async publishDigest(digestId: string) {
    return this.prisma.digest.update({
      where: { id: digestId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  /**
   * Get all digests
   */
  async getDigests(options?: { status?: 'DRAFT' | 'REVIEW' | 'PUBLISHED'; limit?: number }) {
    return this.prisma.digest.findMany({
      where: options?.status ? { status: options.status } : undefined,
      orderBy: { date: 'desc' },
      take: options?.limit,
      include: {
        items: {
          include: {
            processedItem: {
              include: {
                rawItem: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  /**
   * Get digest by date
   */
  async getDigestByDate(date: Date) {
    return this.prisma.digest.findUnique({
      where: { date: startOfDay(date) },
      include: {
        items: {
          include: {
            processedItem: {
              include: {
                rawItem: { include: { source: true } },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  /**
   * Get latest published digest
   */
  async getLatestDigest() {
    return this.prisma.digest.findFirst({
      where: { status: 'PUBLISHED' },
      orderBy: { date: 'desc' },
      include: {
        items: {
          include: {
            processedItem: {
              include: {
                rawItem: { include: { source: true } },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  private categorizeItems(
    items: Array<{
      urgencyLevel: string;
      categories: string[];
      rawItem: { title: string; url: string; source: { name: string } };
      summary: string;
      relevanceScore: number;
      tags: string[];
    }>,
  ): Record<string, DigestSection[]> {
    const sections: Record<string, DigestSection[]> = {
      critical: [],
      releases: [],
      news: [],
      ai: [],
      reading: [],
      trending: [],
    };

    for (const item of items) {
      const section: DigestSection = {
        title: item.rawItem.title,
        summary: item.summary,
        url: item.rawItem.url,
        source: item.rawItem.source.name,
        relevanceScore: item.relevanceScore,
        tags: item.tags,
      };

      const sectionName = this.determineSection(item);
      sections[sectionName].push(section);
    }

    return sections;
  }

  private determineSection(item: {
    urgencyLevel: string;
    categories: string[];
  }): string {
    if (
      item.urgencyLevel === 'CRITICAL' ||
      item.categories.includes('security') ||
      item.categories.includes('breaking-change')
    ) {
      return 'critical';
    }

    if (item.categories.includes('ai')) {
      return 'ai';
    }

    // Check for releases (GitHub releases, version announcements)
    if (item.categories.includes('release')) {
      return 'releases';
    }

    if (item.categories.includes('tutorial') || item.categories.includes('deep-dive')) {
      return 'reading';
    }

    return 'news';
  }

  private buildDigestContent(
    dateStr: string,
    sections: Record<string, DigestSection[]>,
  ): string {
    const formatItems = (items: DigestSection[]): string => {
      if (items.length === 0) {
        return '*No items for today*\n';
      }

      return items
        .slice(0, 5) // Limit to 5 items per section
        .map((item) => {
          const tags = item.tags.slice(0, 3).map((t) => `\`${t}\``).join(' ');
          return `- **[${item.title}](${item.url})** - ${item.summary.slice(0, 150)}...
  *Source: ${item.source}* ${tags}`;
        })
        .join('\n\n');
    };

    let content = DIGEST_TEMPLATE.replace('{{date}}', dateStr)
      .replace('{{critical}}', formatItems(sections.critical))
      .replace('{{releases}}', formatItems(sections.releases))
      .replace('{{news}}', formatItems(sections.news))
      .replace('{{ai}}', formatItems(sections.ai))
      .replace('{{reading}}', formatItems(sections.reading))
      .replace('{{trending}}', formatItems(sections.trending));

    return content;
  }
}
