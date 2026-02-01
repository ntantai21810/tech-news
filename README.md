# Tech Intelligence System

> Self-hosted AI-powered tech news aggregator and daily digest publisher.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start database services
docker-compose up -d

# Configure environment
cp .env.example .env
# Add API keys: ANTHROPIC_API_KEY, GITHUB_TOKEN, etc.

# Initialize database
pnpm db:generate && pnpm db:push

# Run development
pnpm dev
# Backend: http://localhost:3001
# Blog: http://localhost:3000
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────┐   ┌─────────────────┐   ┌───────────────┐  │
│  │     BACKEND     │   │  ADMIN (TODO)   │   │  PUBLIC BLOG  │  │
│  │                 │   │                 │   │               │  │
│  │  - Collectors   │   │  - Source mgmt  │   │  - Digests    │  │
│  │  - LLM Process  │──►│  - Stats UI     │──►│  - Search     │  │
│  │  - Digest Gen   │   │  - Auth         │   │  - RSS        │  │
│  │  - API          │   │                 │   │  - SEO        │  │
│  └─────────────────┘   └─────────────────┘   └───────────────┘  │
│          │                                            │         │
│          └──────────────► PostgreSQL ◄────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Monorepo | Turborepo + pnpm |
| Backend | NestJS, Prisma, BullMQ |
| Blog | Next.js 15, React 19 |
| Database | PostgreSQL, Redis |
| LLM | Claude, GPT, Gemini, GLM, Ollama |
| Styling | Tailwind CSS v4 |

## Project Structure

```
tech-news/
├── apps/
│   ├── backend/        # NestJS API (port 3001)
│   └── blog/           # Next.js blog (port 3000)
├── packages/
│   ├── types/          # Shared TypeScript types
│   └── config/         # Shared configs
├── docker-compose.yml  # PostgreSQL + Redis
└── turbo.json          # Build pipeline
```

## Documentation

- [CODEBASE.md](./CODEBASE.md) - Full architecture and file reference
- [PROGRESS.md](./PROGRESS.md) - Current status and remaining work
- [.env.example](./.env.example) - Environment configuration

## Scripts

```bash
pnpm dev          # Run all apps
pnpm build        # Build all
pnpm db:studio    # Open Prisma Studio
pnpm db:migrate   # Run migrations
```

## License

MIT
