---
trigger: always_on
---

# Tech Intelligence System - GEMINI Context

> LLM-specific context for Antigravity/Gemini when working on this project.

## Project Summary

**Tech Intelligence System** - Self-hosted AI-powered tech news aggregator.

| Component | Status | Port |
|-----------|--------|------|
| Backend (NestJS) | ✅ Complete | 3001 |
| Blog (Next.js) | ✅ Complete | 3000 |
| Admin Dashboard | 🔲 Pending | 3002 |

## Priority Context Files

Read these in order when starting:

1. `AI-INSTRUCTIONS.md` - Development rules
2. `CODEBASE.md` - Architecture reference  
3. `PROGRESS.md` - What's done, what's pending

## Current Phase: 2 (Admin Dashboard)

The next priority tasks are:
- Authentication module (JWT)
- Source management UI
- Stats dashboard

## Tech Stack Constraints

- **Monorepo**: Turborepo + pnpm (use workspace packages)
- **Backend**: NestJS with Prisma
- **Frontend**: Next.js 15 + React 19
- **Database**: PostgreSQL via Docker
- **LLM**: Multi-provider (Claude, GPT, Gemini, GLM, Ollama)

## Critical Patterns

### Backend Module Structure
```
{feature}/
├── {feature}.module.ts
├── {feature}.service.ts
├── {feature}.controller.ts
└── dto/{feature}.dto.ts
```

### Import Paths
```typescript
// ✅ Correct
import { PrismaService } from '@/common/prisma/prisma.service';
import { SourceType } from '@tech-intel/types';

// ❌ Wrong - no relative paths to packages
import { SourceType } from '../../../packages/types';
```

### Blog Data Fetching
```typescript
// Always use lib/api.ts functions
import { getLatestDigest } from '@/lib/api';
```

## Workflows Available

- `/continue` - Resume development
- `/add-collector` - Add new data source collector

## Quick Commands

```bash
pnpm dev              # Start all
pnpm db:studio        # Prisma Studio
docker-compose up -d  # Start DB
```
