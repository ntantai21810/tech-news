---
description: Add new data collector to Tech Intelligence System
---

# Add New Collector

Use this workflow to add a new data source collector.

## 1. Determine Collector Type

Ask the user:
- What data source? (e.g., Hacker News, Twitter, Dev.to)
- Does it require authentication?
- What's the API endpoint/feed URL?

## 2. Create Collector File

Create `apps/backend/src/collectors/{name}/{name}.collector.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Source } from '@prisma/client';

@Injectable()
export class {Name}Collector {
  private readonly logger = new Logger({Name}Collector.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async collect(source: Source): Promise<number> {
    this.logger.log(`Collecting from ${source.name}`);
    
    try {
      // 1. Fetch data from source API
      // 2. Parse response
      // 3. Check for duplicates
      // 4. Save to RawItem
      // 5. Update source health
      
      return savedCount;
    } catch (error) {
      this.logger.error(`Failed: ${error.message}`);
      await this.updateSourceError(source, error);
      return 0;
    }
  }
}
```

## 3. Register in Module

Update `apps/backend/src/collectors/collectors.module.ts`:

```typescript
import { {Name}Collector } from './{name}/{name}.collector';

@Module({
  providers: [
    // ... existing
    {Name}Collector,
  ],
})
```

## 4. Add to Scheduler

Update `apps/backend/src/collectors/collector.scheduler.ts`:

In `collectFromSource()` switch statement:
```typescript
case '{TYPE}':
  return this.{name}Collector.collect(source);
```

## 5. Add Source Type (if new)

If adding a new source type:

1. Update `packages/types/src/index.ts`:
```typescript
export enum SourceType {
  // ...existing
  {TYPE},
}
```

2. Update `apps/backend/prisma/schema.prisma`:
```prisma
enum SourceType {
  // ...existing
  {TYPE}
}
```

3. Run migration:
```bash
cd apps/backend && pnpm db:migrate dev
```

## 6. Test

```bash
# Start dev server
pnpm dev

# Create test source via API
curl -X POST http://localhost:3001/api/sources \
  -H "Content-Type: application/json" \
  -d '{"type":"{TYPE}","name":"Test","url":"...","checkFrequency":"hourly"}'

# Trigger collection manually or wait for cron
```

## 7. Update Documentation

Add collector to CODEBASE.md and PROGRESS.md.
