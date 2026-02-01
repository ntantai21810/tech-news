import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '@/common/prisma/prisma.service';

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  published_at: string;
  author: {
    login: string;
  };
  prerelease: boolean;
  draft: boolean;
}

interface GitHubSourceConfig {
  owner?: string;
  repo?: string;
  includePrerelease?: boolean;
}

@Injectable()
export class GitHubCollector {
  private readonly logger = new Logger(GitHubCollector.name);
  private readonly baseUrl = 'https://api.github.com';

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async collect(source: {
    id: string;
    url: string;
    config: unknown;
  }): Promise<number> {
    const sourceConfig = source.config as GitHubSourceConfig;

    // Parse owner/repo from URL or config
    let owner: string;
    let repo: string;

    if (sourceConfig?.owner && sourceConfig?.repo) {
      owner = sourceConfig.owner;
      repo = sourceConfig.repo;
    } else {
      const match = source.url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        throw new Error(`Invalid GitHub URL: ${source.url}`);
      }
      owner = match[1];
      repo = match[2].replace('.git', '');
    }

    this.logger.log(`📦 Collecting GitHub releases from ${owner}/${repo}`);

    const releases = await this.fetchReleases(owner, repo);
    let savedCount = 0;

    for (const release of releases) {
      // Skip pre-releases unless configured to include them
      if (release.prerelease && !sourceConfig?.includePrerelease) {
        continue;
      }

      // Skip drafts
      if (release.draft) continue;

      const externalId = `release-${release.id}`;

      // Check if already exists
      const existing = await this.prisma.rawItem.findUnique({
        where: { sourceId_externalId: { sourceId: source.id, externalId } },
      });

      if (!existing) {
        await this.prisma.rawItem.create({
          data: {
            sourceId: source.id,
            externalId,
            title: `${repo} ${release.tag_name}${release.name ? `: ${release.name}` : ''}`,
            content: release.body || 'No release notes provided.',
            url: release.html_url,
            author: release.author?.login,
            publishedAt: new Date(release.published_at),
            metadata: {
              tagName: release.tag_name,
              prerelease: release.prerelease,
              owner,
              repo,
            },
          },
        });
        savedCount++;
        this.logger.debug(`Saved release: ${release.tag_name}`);
      }
    }

    this.logger.log(
      `✅ Collected ${savedCount} new releases from ${owner}/${repo}`,
    );
    return savedCount;
  }

  private async fetchReleases(
    owner: string,
    repo: string,
  ): Promise<GitHubRelease[]> {
    const token = this.config.get<string>('GITHUB_TOKEN');

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'TechIntelligence/1.0',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await axios.get<GitHubRelease[]>(
        `${this.baseUrl}/repos/${owner}/${repo}/releases`,
        {
          headers,
          params: { per_page: 20 },
        },
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`Repository not found: ${owner}/${repo}`);
        }
        if (error.response?.status === 403) {
          throw new Error('GitHub API rate limit exceeded');
        }
        throw new Error(`GitHub API error: ${error.response?.status}`);
      }
      throw error;
    }
  }
}
