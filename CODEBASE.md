# Tech Intelligence System - Codebase Reference

> Complete reference for LLM tools to understand and extend this project.

---

## Project Overview

**Purpose**: Self-hosted system that collects tech news from multiple sources, processes with LLMs, and publishes curated daily digests.

**Status**: Phase 1 MVP Complete (Backend + Blog). Phase 2 (Admin Dashboard) pending.

---

## Directory Structure

```
tech-news/
├── apps/
│   ├── backend/                    # NestJS API Service
│   │   ├── src/
│   │   │   ├── main.ts             # Entry point (port 3001)
│   │   │   ├── app.module.ts       # Root module
│   │   │   ├── common/
│   │   │   │   └── prisma/         # Database service
│   │   │   ├── sources/            # Source management CRUD
│   │   │   │   ├── sources.module.ts
│   │   │   │   ├── sources.service.ts
│   │   │   │   ├── sources.controller.ts
│   │   │   │   └── dto/source.dto.ts
│   │   │   ├── collectors/         # Data collection
│   │   │   │   ├── collectors.module.ts
│   │   │   │   ├── collector.scheduler.ts    # Cron jobs
│   │   │   │   ├── github/github.collector.ts
│   │   │   │   ├── rss/rss.collector.ts
│   │   │   │   └── reddit/reddit.collector.ts
│   │   │   ├── processing/         # LLM integration
│   │   │   │   ├── processing.module.ts
│   │   │   │   ├── summarizer.service.ts     # Content analysis
│   │   │   │   ├── processing.scheduler.ts
│   │   │   │   └── llm/
│   │   │   │       ├── llm.service.ts        # Unified LLM interface
│   │   │   │       ├── llm.types.ts          # Types + cost config
│   │   │   │       └── providers/
│   │   │   │           ├── claude.provider.ts
│   │   │   │           ├── openai.provider.ts
│   │   │   │           ├── gemini.provider.ts
│   │   │   │           ├── glm.provider.ts
│   │   │   │           └── ollama.provider.ts
│   │   │   ├── digest/             # Daily digest generation
│   │   │   │   ├── digest.module.ts
│   │   │   │   ├── digest-generator.service.ts
│   │   │   │   └── digest.controller.ts
│   │   │   └── stats/              # Analytics
│   │   │       ├── stats.module.ts
│   │   │       ├── stats.service.ts
│   │   │       └── stats.controller.ts
│   │   └── prisma/
│   │       └── schema.prisma       # Database schema
│   │
│   └── blog/                       # Next.js Public Website
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx      # Root layout + nav
│       │   │   ├── page.tsx        # Homepage
│       │   │   ├── globals.css     # Design system
│       │   │   ├── digest/
│       │   │   │   ├── page.tsx    # Digest archive
│       │   │   │   └── [date]/page.tsx  # Digest detail
│       │   │   ├── category/page.tsx
│       │   │   ├── search/page.tsx
│       │   │   ├── feed.xml/route.ts    # RSS feed
│       │   │   └── sitemap.xml/route.ts
│       │   ├── components/
│       │   │   ├── digest-card.tsx
│       │   │   ├── tag-cloud.tsx
│       │   │   └── stats-overview.tsx
│       │   └── lib/
│       │       └── api.ts          # Backend API client
│       └── public/
│           └── robots.txt
│
├── packages/
│   ├── types/
│   │   └── src/index.ts            # Shared TypeScript types
│   └── config/
│       ├── typescript/             # TS configs
│       └── package.json
│
├── docker-compose.yml              # PostgreSQL + Redis
├── turbo.json                      # Monorepo pipeline
├── pnpm-workspace.yaml             # Workspace config
├── package.json                    # Root scripts
├── .env.example                    # Environment template
└── .gitignore
```

---

## Database Schema (Prisma)

### Core Models

| Model | Purpose |
|-------|---------|
| `Source` | Data source configuration (GitHub, RSS, Reddit, etc.) |
| `RawItem` | Unprocessed content fetched from sources |
| `ProcessedItem` | LLM-analyzed content with summary, categories, tags |
| `Digest` | Daily generated digest with markdown content |
| `DigestItem` | Links processed items to digests by section |
| `LlmUsage` | API usage tracking for cost monitoring |
| `Setting` | System configuration key-value store |

### Key Relationships

```
Source ──1:N──► RawItem ──1:1──► ProcessedItem ──N:M──► Digest
                                      │
                                      └──► DigestItem
```

### Important Enums

- `SourceType`: GITHUB, REDDIT, RSS, TWITTER, HACKERNEWS, WEBSITE
- `Priority`: HIGH, MEDIUM, LOW
- `UrgencyLevel`: CRITICAL, HIGH, NORMAL, LOW
- `DigestStatus`: DRAFT, REVIEW, PUBLISHED

---

## API Endpoints

### Sources API (`/api/sources`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all sources |
| GET | `/health` | Source health status |
| GET | `/:id` | Get specific source |
| POST | `/` | Create source |
| PUT | `/:id` | Update source |
| DELETE | `/:id` | Delete source |

### Digests API (`/api/digests`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List digests (filter by status) |
| GET | `/latest` | Latest published digest |
| GET | `/:date` | Get digest by date (YYYY-MM-DD) |
| POST | `/generate` | Trigger digest generation |
| POST | `/:id/publish` | Publish a draft digest |

### Stats API (`/api/stats`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | System overview stats |
| GET | `/llm` | LLM usage metrics |
| GET | `/collection` | Collection stats by source |
| GET | `/categories` | Category distribution |
| GET | `/tags` | Tag cloud data |

---

## LLM Provider Configuration

### Supported Providers

| Provider | Env Variable | Default Model |
|----------|--------------|---------------|
| Claude | `ANTHROPIC_API_KEY` | claude-3-5-sonnet-20241022 |
| OpenAI | `OPENAI_API_KEY` | gpt-4o-mini |
| Gemini | `GOOGLE_AI_API_KEY` | gemini-2.0-flash |
| ChatGLM | `GLM_API_KEY` | glm-4-flash |
| Ollama | `OLLAMA_BASE_URL` | llama3:8b |

### Switching Providers

Set `LLM_DEFAULT_PROVIDER` in `.env` to: `claude`, `openai`, `gemini`, `glm`, or `ollama`.

The system automatically falls back to Ollama if the primary provider fails.

---

## Cron Schedules

| Job | Schedule | Description |
|-----|----------|-------------|
| Hourly collection | `0 * * * *` | Fetch from hourly sources |
| Daily collection | `0 6 * * *` | Fetch from daily sources (6 AM) |
| Weekly collection | `0 6 * * 0` | Fetch from weekly sources (Sunday 6 AM) |
| Processing | `*/30 * * * *` | Process unprocessed items (every 30 min) |
| Digest generation | `0 7 * * *` | Generate daily digest (7 AM) |

---

## Design System (Blog)

### Color Tokens

| Token | Dark Mode | Purpose |
|-------|-----------|---------|
| `--bg-primary` | #0a0a0b | Main background |
| `--bg-card` | #1c1c1f | Card backgrounds |
| `--text-primary` | #fafafa | Main text |
| `--text-secondary` | #a1a1aa | Secondary text |
| `--accent-primary` | #06b6d4 | Cyan accent |
| `--critical` | #ef4444 | Critical alerts |

### Typography

- **Body**: Inter
- **Code**: JetBrains Mono

---

## Common Development Tasks

### Add a New Data Collector

1. Create `apps/backend/src/collectors/{name}/{name}.collector.ts`
2. Implement the `collect()` method following existing patterns
3. Register in `collectors.module.ts`
4. Add to `collector.scheduler.ts` switch statement

### Add a New LLM Provider

1. Create `apps/backend/src/processing/llm/providers/{name}.provider.ts`
2. Implement `ILlmProvider` interface
3. Register in `processing.module.ts`
4. Add to `llm.service.ts` providers map
5. Update `llm.types.ts` with cost config

### Add a New Blog Page

1. Create `apps/blog/src/app/{route}/page.tsx`
2. Use `getXxx()` functions from `lib/api.ts` for data fetching
3. Follow existing page patterns for SEO metadata

---

## External Dependencies

### APIs Used

- **GitHub API**: Fetch releases (optional token for rate limits)
- **Reddit API**: OAuth or public JSON endpoints
- **RSS**: Standard feed parsing
- **LLM APIs**: Claude, OpenAI, Gemini, ChatGLM

### Key NPM Packages

| Package | Purpose |
|---------|---------|
| `@anthropic-ai/sdk` | Claude API |
| `openai` | OpenAI API |
| `@google/generative-ai` | Gemini API |
| `rss-parser` | RSS feed parsing |
| `marked` | Markdown to HTML |
| `date-fns` | Date formatting |
| `recharts` | Charts (for stats) |
