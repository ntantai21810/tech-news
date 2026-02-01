import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import { PrismaService } from '@/common/prisma/prisma.service';

interface RssSourceConfig {
  itemLimit?: number;
  titleFilter?: string;
}

@Injectable()
export class RssCollector {
  private readonly logger = new Logger(RssCollector.name);
  private readonly parser: Parser;

  constructor(private readonly prisma: PrismaService) {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'TechIntelligence/1.0',
      },
    });
  }

  async collect(source: {
    id: string;
    url: string;
    config: unknown;
  }): Promise<number> {
    const sourceConfig = source.config as RssSourceConfig;

    this.logger.log(`📰 Collecting RSS feed from ${source.url}`);

    try {
      const feed = await this.parser.parseURL(source.url);
      let savedCount = 0;

      const itemLimit = sourceConfig?.itemLimit || 50;
      const items = feed.items.slice(0, itemLimit);

      for (const item of items) {
        // Skip if no link (required for deduplication)
        if (!item.link) continue;

        // Apply title filter if configured
        if (sourceConfig?.titleFilter) {
          const regex = new RegExp(sourceConfig.titleFilter, 'i');
          if (!regex.test(item.title || '')) continue;
        }

        // Generate external ID from link
        const externalId = this.generateExternalId(item.link);

        // Check if already exists
        const existing = await this.prisma.rawItem.findUnique({
          where: { sourceId_externalId: { sourceId: source.id, externalId } },
        });

        if (!existing) {
          await this.prisma.rawItem.create({
            data: {
              sourceId: source.id,
              externalId,
              title: item.title || 'Untitled',
              content: this.extractContent(item),
              url: item.link,
              author: item.creator || item.author,
              publishedAt: item.pubDate
                ? new Date(item.pubDate)
                : new Date(),
              metadata: {
                feedTitle: feed.title,
                categories: item.categories,
                enclosure: item.enclosure,
              } as any,
            },
          });
          savedCount++;
          this.logger.debug(`Saved RSS item: ${item.title}`);
        }
      }

      this.logger.log(`✅ Collected ${savedCount} new items from RSS feed`);
      return savedCount;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse RSS feed: ${error.message}`);
      }
      throw error;
    }
  }

  private extractContent(item: Parser.Item): string {
    // Prefer content:encoded, then content, then description
    const content =
      (item as any)['content:encoded'] ||
      item.content ||
      item.contentSnippet ||
      item.summary ||
      '';

    // Clean HTML if present
    return this.stripHtml(content);
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private generateExternalId(url: string): string {
    // Create a consistent ID from the URL
    return `rss-${Buffer.from(url).toString('base64').slice(0, 50)}`;
  }
}
