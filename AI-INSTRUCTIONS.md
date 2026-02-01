---
trigger: always_on
---

# Tech Intelligence System - AI Instructions

> Read this file first when working on this project.

## Project Context

This is a **self-hosted tech news aggregator** that:
1. Collects from GitHub, RSS, Reddit (and more)
2. Processes with LLMs (summarization, categorization)
3. Generates daily digests
4. Publishes to a public blog

**Current State**: Phase 1 MVP complete. Backend + Blog working. Admin Dashboard pending.

---

## Critical Files to Read First

When starting work on this project, read these files in order:

1. **[CODEBASE.md](./CODEBASE.md)** - Full architecture reference
2. **[PROGRESS.md](./PROGRESS.md)** - Current status and remaining work
3. **[.env.example](./.env.example)** - Required configuration
4. **[prisma/schema.prisma](./apps/backend/prisma/schema.prisma)** - Database models

---

## Development Rules

### Monorepo Structure

```
apps/backend    → NestJS API (port 3001)
apps/blog       → Next.js blog (port 3000)
packages/types  → Shared TypeScript types
packages/config → Shared ESLint, TS configs
```

**Always use workspace packages**:
```typescript
// ✅ Correct
import { SourceType } from '@tech-intel/types';

// ❌ Wrong
import { SourceType } from '../../../packages/types';
```

### Backend Patterns

1. **Module structure**: Each feature has `module.ts`, `service.ts`, `controller.ts`
2. **Inject PrismaService** for database access
3. **Use class-validator** for DTOs
4. **Log with NestJS Logger** (not console.log)

```typescript
// Standard service pattern
@Injectable()
export class XxxService {
  private readonly logger = new Logger(XxxService.name);
  
  constructor(private readonly prisma: PrismaService) {}
  
  async findAll() {
    return this.prisma.xxx.findMany();
  }
}
```

### Blog Patterns

1. Use **async Server Components** for data fetching
2. Fetch from backend via **`lib/api.ts`** functions
3. Use **CSS variables** from globals.css for theming
4. Set **revalidate** for ISR caching

```typescript
// Standard page pattern
export const revalidate = 60;

export default async function XxxPage() {
  const data = await fetchXxx();
  return <div>...</div>;
}
```

### LLM Integration

When adding new LLM features:

1. Use `LlmService.complete()` for all LLM calls
2. Provider is switchable via `LLM_DEFAULT_PROVIDER` env
3. All usage is automatically logged to `LlmUsage` table
4. Cost tracking is automatic per `llm.types.ts`

---

## Common Tasks

### Add a New Collector

1. Create `apps/backend/src/collectors/{name}/{name}.collector.ts`
2. Implement:
```typescript
@Injectable()
export class XxxCollector {
  async collect(source: Source): Promise<number> {
    // Fetch data, save to RawItem, return count
  }
}
```
3. Register in `collectors.module.ts`
4. Add case to `collector.scheduler.ts`

### Add a New API Endpoint

1. Create or update controller in appropriate module
2. Add DTO if needed with class-validator decorators
3. Test with curl or Postman

### Add a New Blog Page

1. Create `apps/blog/src/app/{route}/page.tsx`
2. Add data fetching function to `lib/api.ts` if needed
3. Export metadata for SEO

---

## Phase 2 Implementation Guide

### Admin Dashboard Setup

```bash
# Create new Next.js app
cd apps
npx -y create-next-app@latest admin --typescript --tailwind --app
```

### Required Backend Changes

Add auth module:
```
apps/backend/src/auth/
├── auth.module.ts
├── auth.service.ts  
├── auth.controller.ts
├── jwt.strategy.ts
├── auth.guard.ts
└── dto/login.dto.ts
```

Protect admin routes with `@UseGuards(JwtAuthGuard)`.

---

## Testing Checklist

Before considering a feature complete:

- [ ] API endpoints work (test with curl)
- [ ] Database operations complete
- [ ] Error handling in place
- [ ] Logging added for debugging
- [ ] Blog pages render correctly
- [ ] Mobile responsive
- [ ] SEO metadata present

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| DB connection failed | `docker-compose up -d` |
| Prisma client outdated | `pnpm db:generate` |
| Type errors | `pnpm typecheck` |
| Port in use | Check for other processes on 3000/3001 |
| LLM fails | Check API keys in .env |
