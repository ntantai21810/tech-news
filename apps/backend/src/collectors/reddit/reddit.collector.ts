import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '@/common/prisma/prisma.service';

interface RedditPost {
  data: {
    id: string;
    title: string;
    selftext: string;
    url: string;
    permalink: string;
    author: string;
    created_utc: number;
    score: number;
    num_comments: number;
    link_flair_text?: string;
    is_self: boolean;
  };
}

interface RedditListing {
  data: {
    children: RedditPost[];
    after: string | null;
  };
}

interface RedditSourceConfig {
  subreddit?: string;
  sort?: 'hot' | 'new' | 'top' | 'rising';
  minScore?: number;
  limit?: number;
  flairFilter?: string[];
}

@Injectable()
export class RedditCollector {
  private readonly logger = new Logger(RedditCollector.name);
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async collect(source: {
    id: string;
    url: string;
    config: unknown;
  }): Promise<number> {
    const sourceConfig = source.config as RedditSourceConfig;

    // Parse subreddit from URL or config
    let subreddit: string;
    if (sourceConfig?.subreddit) {
      subreddit = sourceConfig.subreddit;
    } else {
      const match = source.url.match(/reddit\.com\/r\/([^/]+)/);
      if (!match) {
        throw new Error(`Invalid Reddit URL: ${source.url}`);
      }
      subreddit = match[1];
    }

    this.logger.log(`🔴 Collecting from r/${subreddit}`);

    const posts = await this.fetchPosts(subreddit, sourceConfig);
    let savedCount = 0;

    for (const post of posts) {
      const postData = post.data;

      // Apply minimum score filter
      if (sourceConfig?.minScore && postData.score < sourceConfig.minScore) {
        continue;
      }

      // Apply flair filter
      if (sourceConfig?.flairFilter?.length) {
        if (!sourceConfig.flairFilter.includes(postData.link_flair_text || '')) {
          continue;
        }
      }

      const externalId = `post-${postData.id}`;

      // Check if already exists
      const existing = await this.prisma.rawItem.findUnique({
        where: { sourceId_externalId: { sourceId: source.id, externalId } },
      });

      if (!existing) {
        await this.prisma.rawItem.create({
          data: {
            sourceId: source.id,
            externalId,
            title: postData.title,
            content: postData.selftext || `External link: ${postData.url}`,
            url: `https://reddit.com${postData.permalink}`,
            author: postData.author,
            publishedAt: new Date(postData.created_utc * 1000),
            metadata: {
              subreddit,
              score: postData.score,
              numComments: postData.num_comments,
              flair: postData.link_flair_text,
              isSelf: postData.is_self,
              externalUrl: postData.is_self ? null : postData.url,
            },
          },
        });
        savedCount++;
        this.logger.debug(`Saved Reddit post: ${postData.title.slice(0, 50)}...`);
      }
    }

    this.logger.log(`✅ Collected ${savedCount} new posts from r/${subreddit}`);
    return savedCount;
  }

  private async fetchPosts(
    subreddit: string,
    config?: RedditSourceConfig,
  ): Promise<RedditPost[]> {
    const sort = config?.sort || 'hot';
    const limit = config?.limit || 50;

    // Try OAuth first, fall back to public API
    try {
      await this.ensureAccessToken();
      if (this.accessToken) {
        return this.fetchWithOAuth(subreddit, sort, limit);
      }
    } catch {
      this.logger.warn('OAuth failed, falling back to public API');
    }

    return this.fetchPublic(subreddit, sort, limit);
  }

  private async fetchWithOAuth(
    subreddit: string,
    sort: string,
    limit: number,
  ): Promise<RedditPost[]> {
    const response = await axios.get<RedditListing>(
      `https://oauth.reddit.com/r/${subreddit}/${sort}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'User-Agent': this.config.get('REDDIT_USER_AGENT', 'TechIntelligence/1.0'),
        },
        params: { limit },
      },
    );

    return response.data.data.children;
  }

  private async fetchPublic(
    subreddit: string,
    sort: string,
    limit: number,
  ): Promise<RedditPost[]> {
    const response = await axios.get<RedditListing>(
      `https://www.reddit.com/r/${subreddit}/${sort}.json`,
      {
        headers: {
          'User-Agent': this.config.get('REDDIT_USER_AGENT', 'TechIntelligence/1.0'),
        },
        params: { limit },
      },
    );

    return response.data.data.children;
  }

  private async ensureAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return;
    }

    const clientId = this.config.get<string>('REDDIT_CLIENT_ID');
    const clientSecret = this.config.get<string>('REDDIT_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      this.accessToken = null;
      return;
    }

    try {
      const response = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        'grant_type=client_credentials',
        {
          auth: { username: clientId, password: clientSecret },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.config.get('REDDIT_USER_AGENT', 'TechIntelligence/1.0'),
          },
        },
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000;
    } catch (error) {
      this.logger.warn('Failed to get Reddit OAuth token');
      this.accessToken = null;
    }
  }
}
