---
description: Continue development on Tech Intelligence System using existing patterns and architecture
---

# Continue Tech Intelligence Development

Use this workflow when resuming work on the Tech Intelligence System.

## Pre-flight Checks

// turbo
1. Read AI-INSTRUCTIONS.md to understand project rules
```bash
cat AI-INSTRUCTIONS.md
```

// turbo
2. Check current progress
```bash
cat PROGRESS.md
```

// turbo
3. Verify Docker services are running
```bash
docker-compose ps
```

// turbo
4. If services are down, start them
```bash
docker-compose up -d
```

## Development Start

// turbo
5. Install dependencies (if needed)
```bash
pnpm install
```

// turbo
6. Generate Prisma client
```bash
cd apps/backend && pnpm db:generate
```

// turbo
7. Start development servers
```bash
pnpm dev
```

## Before Making Changes

8. Read CODEBASE.md for file locations and patterns

9. Follow the patterns established:
   - Backend: NestJS modules with service/controller
   - Blog: Server components with lib/api.ts
   - Use @tech-intel/types for shared types

## After Completing Work

10. Update PROGRESS.md with:
    - New completed items
    - Any new issues discovered
    - Updated remaining work

11. Test changes:
    - Backend: curl endpoints
    - Blog: Check pages in browser

## Common Tasks

### Add Admin Dashboard (Phase 2)
1. Create apps/admin with Next.js
2. Add auth module to backend
3. Create protected API routes
4. Build dashboard pages

### Add New Collector
1. Create collector file in apps/backend/src/collectors/{name}/
2. Register in collectors.module.ts
3. Add to collector.scheduler.ts

### Fix LLM Issues
1. Check API keys in .env
2. Try switching provider via LLM_DEFAULT_PROVIDER
3. Ollama is the fallback (requires local setup)
