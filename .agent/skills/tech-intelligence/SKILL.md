---
name: tech-intelligence
description: Skills for developing and extending the Tech Intelligence System
---

# Tech Intelligence Development Skill

This skill provides context and patterns for working on the Tech Intelligence System.

## Overview

Tech Intelligence is a self-hosted news aggregation system with:
- Multi-source data collection (GitHub, RSS, Reddit)
- LLM-powered content processing
- Daily digest generation
- Public blog with SEO optimization

## File Locations

### Backend
| Purpose | Location |
|---------|----------|
| Entry point | `apps/backend/src/main.ts` |
| Root module | `apps/backend/src/app.module.ts` |
| Database | `apps/backend/prisma/schema.prisma` |
| Collectors | `apps/backend/src/collectors/` |
| LLM Service | `apps/backend/src/processing/llm/` |
| Digest | `apps/backend/src/digest/` |

### Blog
| Purpose | Location |
|---------|----------|
| Layout | `apps/blog/src/app/layout.tsx` |
| Homepage | `apps/blog/src/app/page.tsx` |
| API Client | `apps/blog/src/lib/api.ts` |
| Styles | `apps/blog/src/app/globals.css` |

### Shared
| Purpose | Location |
|---------|----------|
| Types | `packages/types/src/index.ts` |
| TS Config | `packages/config/typescript/` |

## Coding Patterns

### Adding a Collector

```typescript
@Injectable()
export class XxxCollector {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async collect(source: Source): Promise<number> {
    // 1. Fetch from API
    // 2. Deduplicate
    // 3. Save to RawItem
    // 4. Update source health
    return count;
  }
}
```

### Adding an LLM Provider

1. Create provider in `processing/llm/providers/`
2. Implement `ILlmProvider` interface
3. Register in `processing.module.ts`
4. Add to providers map in `llm.service.ts`
5. Add cost config to `llm.types.ts`

### Adding a Blog Page

```typescript
// app/{route}/page.tsx
import { getXxx } from '@/lib/api';

export const revalidate = 60; // ISR

export default async function XxxPage() {
  const data = await getXxx();
  return <div className="container">...</div>;
}
```

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--accent-primary` | #06b6d4 | Links, highlights |
| `--bg-primary` | #0a0a0b | Page background |
| `--bg-card` | #1c1c1f | Card backgrounds |
| `--text-primary` | #fafafa | Main text |
| `--text-muted` | #71717a | Secondary text |

## API Reference

### Sources
- `GET /api/sources` - List sources
- `POST /api/sources` - Create source
- `GET /api/sources/health` - Health check

### Digests
- `GET /api/digests` - List digests
- `GET /api/digests/latest` - Latest digest
- `POST /api/digests/generate` - Generate digest

### Stats
- `GET /api/stats` - System stats
- `GET /api/stats/llm` - LLM usage
- `GET /api/stats/tags` - Tag cloud

## Environment Requirements

```
DATABASE_URL - PostgreSQL connection
REDIS_URL - Redis connection
LLM_DEFAULT_PROVIDER - claude|openai|gemini|glm|ollama
ANTHROPIC_API_KEY - For Claude
GITHUB_TOKEN - For GitHub collector
```
