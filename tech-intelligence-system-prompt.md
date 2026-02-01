# Tech Intelligence System - Requirements Prompt

## Context

I am a software engineer who needs to stay updated with the fast-moving tech ecosystem. I want to build a **Personal Tech Intelligence System** that automatically collects, processes, and publishes curated tech news and updates relevant to my work.

---

## Project Goal

Build a self-hosted system that:
1. Collects information from multiple sources (Twitter/X, Reddit, GitHub, documentation, blogs, etc.)
2. Processes and summarizes the information using LLMs
3. Generates daily digest blog posts with deep-dive summaries
4. Provides actionable recommendations (e.g., "Update package X - critical CVE found")
5. Hosts the output as a searchable website/blog

---

## My Tech Focus Areas

**Primary Stack (highest priority):**
- JavaScript/TypeScript ecosystem
- Next.js (frontend framework)
- NestJS (backend framework)
- Node.js runtime

**Secondary Areas:**
- AI/ML tools and models (Claude, GPT, Gemini, open-source models like LLaMA, GLM, etc.)
- Frontend frameworks and libraries (React ecosystem)
- Backend/DevOps tools
- Security vulnerabilities and advisories

---

## Data Sources to Monitor

| Source | Specific Targets |
|--------|------------------|
| **GitHub Releases** | Next.js, NestJS, React, Node.js, Bun, Deno, popular npm packages |
| **npm Security Advisories** | Security vulnerabilities affecting JS ecosystem |
| **Reddit** | r/javascript, r/nextjs, r/node, r/reactjs, r/MachineLearning, r/LocalLLaMA |
| **Twitter/X** | Vercel team, key JS developers, AI researchers, framework maintainers |
| **Hacker News** | Front page + keyword filtering for relevant topics |
| **RSS/Blogs** | Vercel blog, OpenAI blog, Anthropic blog, Dev.to, official documentation blogs |
| **Documentation Changelogs** | Official docs for Next.js, NestJS, Node.js |
| **YouTube** (optional) | Tech channels like Fireship, Theo, AI-focused channels |

---

## Source Management System

The system needs a **Source Management** feature that combines manual input with intelligent auto-discovery.

### 1. Manual Source Input (Required)
A simple admin interface or config file to add/edit/remove sources:

**For each source type, user can input:**

| Source Type | User Inputs |
|-------------|-------------|
| **GitHub Repos** | Repository URL or `owner/repo` format (e.g., `vercel/next.js`) |
| **npm Packages** | Package names to monitor for updates and security issues |
| **Reddit** | Subreddit names (e.g., `javascript`, `nextjs`) |
| **Twitter/X** | Usernames or account handles to follow |
| **RSS Feeds** | Direct RSS/Atom feed URLs |
| **Websites/Blogs** | URLs to scrape (with CSS selectors if needed) |
| **YouTube Channels** | Channel URLs or IDs |
| **Keywords** | Global keywords to filter/search across all platforms |

**Source Configuration Options:**
- **Priority Level**: High / Medium / Low (affects relevance scoring)
- **Check Frequency**: How often to poll (hourly, daily, weekly)
- **Category Tags**: Pre-assign categories to sources (e.g., mark `r/MachineLearning` as `AI`)
- **Active/Inactive Toggle**: Temporarily disable without deleting
- **Notes**: Personal notes about why this source matters

### 2. Auto-Discovery Feature (Add-on)
The system should suggest new relevant sources based on:

| Discovery Method | How It Works |
|------------------|--------------|
| **Dependency Analysis** | Scan my `package.json` files → auto-suggest GitHub repos for all dependencies |
| **Link Extraction** | When processing articles, extract and suggest frequently mentioned sources |
| **Community Cross-Reference** | If r/nextjs often links to a blog, suggest that blog |
| **Trending Detection** | Surface new repos/accounts that are gaining traction in my focus areas |
| **Similar Source Suggestion** | "You follow Vercel blog, consider also following: [list]" |

**Auto-Discovery Workflow:**
1. System finds potential new sources
2. Presents suggestions with reasoning (e.g., "Found in 5 articles this week")
3. User approves/rejects suggestions
4. Approved sources are added to monitoring list

### 3. Source Health Monitoring
Track the quality and status of each source:

| Metric | Purpose |
|--------|---------|
| **Last Successful Fetch** | Detect broken sources |
| **Content Frequency** | How often source produces new content |
| **Relevance Rate** | % of content from this source that passed relevance filter |
| **Error Rate** | API failures, rate limits, scraping issues |

Alert user when:
- A source hasn't produced content in X days (may be dead)
- A source has high error rate (may need fixing)
- A source has low relevance rate (consider removing)

### 4. Import/Export
- **Import from OPML**: For existing RSS subscriptions
- **Import from GitHub Stars**: Auto-add repos I've starred
- **Import from npm**: Scan project's `package.json` and add all dependencies
- **Export Config**: Backup all source configurations as JSON/YAML

---

## Core Features Required

### 1. Data Collection
- Scheduled crawlers/workers to fetch data from all sources
- Rate limiting and respectful scraping
- Raw data storage for processing
- Support for both API-based and scraping-based collection
- Deduplication of content appearing across multiple sources

### 2. Processing & Intelligence
- **LLM Summarization**: Condense articles, threads, and releases into digestible summaries
- **Auto-categorization**: Tag content as `frontend`, `backend`, `AI`, `security`, `devops`, `breaking-change`, etc.
- **Relevance Scoring**: Prioritize content based on my stack (Next.js/NestJS content scores higher)
- **Urgency Detection**: Flag security vulnerabilities, breaking changes, and major releases
- **Sentiment Analysis**: Gauge community reception (positive/negative/controversial)
- **Impact Assessment**: Determine if updates affect my specific dependencies

### 3. Storage
- Structured database for articles, metadata, and tags
- Vector database for semantic search across all content
- Version history tracking for libraries
- Full-text search capability

### 4. Output & Publishing
- **Daily Digest**: Auto-generated daily blog post organized by category
- **Deep-Dive Articles**: Comprehensive breakdowns for major releases
- **Actionable Recommendations**: Clear upgrade/action items with reasoning
- **RSS Feed**: Subscribe to the curated feed
- **Static Website**: Searchable, browsable archive of all content
- **Markdown Export**: Plain file backup for portability

### 5. Alerts & Notifications (Add-on)
- Push notifications or email for critical security issues
- Breaking change alerts for monitored packages

---

## Add-on Features (Future Phases)

- **Dependency Scanner Integration**: Connect to my repositories, auto-check if updates affect my projects
- **Migration Guide Generator**: When breaking changes are detected, generate upgrade guides
- **Code Example Extractor**: Pull relevant code snippets from tutorials and docs
- **Comparison Generator**: Auto-generate "What changed" comparisons between versions
- **Trend Visualization**: Graphs showing rising/falling interest in technologies
- **"What I Missed" Weekly Summary**: Catch-up digest of the most important items
- **Multi-user Support**: Allow team members with different stack interests (future community feature)

---

## System Architecture

The system consists of **3 main components**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────────────────────┐     ┌─────────────────────┐     ┌───────────────┐  │
│  │   BACKEND SERVICE   │     │   ADMIN DASHBOARD   │     │  PUBLIC BLOG  │  │
│  │                     │     │                     │     │               │  │
│  │  - Data collectors  │     │  - Source mgmt UI   │     │  - Daily      │  │
│  │  - Schedulers       │◄────┤  - Stats & metrics  │     │    digests    │  │
│  │  - LLM processing   │     │  - Config settings  │     │  - Search     │  │
│  │  - Database         │     │  - Auth protected   │     │  - RSS feed   │  │
│  │  - API endpoints    │     │                     │     │  - SEO ready  │  │
│  │                     │     └─────────────────────┘     │  - Public     │  │
│  │                     │                                 │               │  │
│  │                     ├────────────────────────────────►│               │  │
│  └─────────────────────┘                                 └───────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component 1: Backend Service

The core engine that runs in the background.

| Feature | Description |
|---------|-------------|
| **Data Collectors** | Workers that fetch data from all configured sources (GitHub, Reddit, Twitter, RSS, etc.) |
| **Job Scheduler** | Cron-based scheduling for periodic data collection (hourly, daily, weekly per source) |
| **LLM Processing Pipeline** | Summarization, categorization, relevance scoring, urgency detection |
| **Database Management** | Store raw data, processed content, source configs, metrics |
| **Digest Generator** | Auto-generate daily/weekly digest posts |
| **API Endpoints** | REST/GraphQL API for Admin Dashboard and Public Blog to consume |
| **Background Tasks** | Deduplication, cleanup, health checks, auto-discovery |

### Component 2: Admin Dashboard (Protected)

A web UI for me to manage the system. **Requires authentication.**

| Feature | Description |
|---------|-------------|
| **Authentication** | Login system (email/password or OAuth) to protect admin access |
| **Source Management** | Add, edit, delete, toggle sources via UI forms |
| **Source Discovery** | View auto-suggested sources, approve or reject with one click |
| **Source Health** | Dashboard showing status, error rates, last fetch time for all sources |
| **Content Moderation** | Preview generated digests before publishing (optional manual review mode) |
| **Statistics & Metrics** | Charts showing content volume, category distribution, trending topics |
| **System Settings** | Configure LLM settings, digest schedule, notification preferences |
| **Logs & Debug** | View collector logs, processing errors, API usage |
| **Import/Export** | Bulk import sources from OPML, package.json, GitHub stars; export config backup |

### Component 3: Public Blog (SEO-Optimized)

A public-facing website to display all curated content. **No authentication required.**

| Feature | Description |
|---------|-------------|
| **Homepage** | Latest daily digest with preview of recent posts |
| **Daily Digest Pages** | Full digest posts organized by date |
| **Category Pages** | Browse by category: Frontend, Backend, AI, Security, etc. |
| **Tag Pages** | Browse by technology: Next.js, NestJS, React, Node.js, etc. |
| **Search** | Full-text search across all content |
| **Individual Article Pages** | Deep-dive summaries as standalone SEO-friendly pages |
| **RSS Feed** | Subscribe to new digests |
| **Archive** | Browse all past digests by month/year |

**SEO Requirements:**
| Feature | Description |
|---------|-------------|
| **Server-Side Rendering (SSR) or Static Site Generation (SSG)** | Pre-rendered HTML for search engines |
| **Meta Tags** | Dynamic title, description, Open Graph, Twitter cards per page |
| **Semantic HTML** | Proper heading hierarchy, article tags, structured data |
| **Sitemap** | Auto-generated sitemap.xml |
| **robots.txt** | Proper crawler instructions |
| **Canonical URLs** | Prevent duplicate content issues |
| **Fast Loading** | Optimized images, minimal JS, good Core Web Vitals |
| **Mobile Responsive** | Works on all device sizes |
| **Structured Data (JSON-LD)** | Article schema, BreadcrumbList for rich search results |

---

## Technical Constraints & Preferences

| Aspect | Preference |
|--------|------------|
| **Primary Language** | JavaScript/TypeScript (Node.js) |
| **Hosting** | Self-hosted (Docker preferred) |
| **Budget** | No strict budget constraints, but prefer cost-effective solutions |
| **LLM** | Claude API for quality, with option to fall back to local models (Ollama) for cost savings |
| **Database** | PostgreSQL preferred for main storage |
| **Vector DB** | Self-hostable option (Qdrant, ChromaDB, or similar) |
| **Frontend** | Next.js for the output website (familiar stack) |

---

## Output Format Requirements

### Daily Digest Structure
```
# Tech Digest - [Date]

## 🚨 Critical Updates (Security/Breaking Changes)
- [Actionable items with severity and affected packages]

## 🚀 Major Releases
- [New versions of frameworks/tools with summary of changes]

## 📰 Notable News
- [Important articles, announcements, discussions]

## 🤖 AI/ML Updates
- [Model releases, tool updates, research highlights]

## 📚 Worth Reading
- [Tutorials, deep-dives, interesting blog posts]

## 📊 Trending This Week
- [Rising topics, popular discussions]
```

### Each Entry Should Include
- Source attribution (with link)
- Publication/detection date
- Category tags
- Relevance score (to my stack)
- Summary (2-3 sentences for news, longer for deep-dives)
- Action items (if applicable)

---

## Success Criteria

1. **Automation**: System runs daily without manual intervention
2. **Relevance**: At least 80% of surfaced content is relevant to my stack
3. **Timeliness**: Critical security issues surfaced within 24 hours of disclosure
4. **Comprehensiveness**: No major releases or security issues in my focus areas are missed
5. **Actionability**: Clear recommendations on what to update and why
6. **Searchability**: Can easily find past information on any topic

---

## Questions for You (the LLM)

Based on these requirements, please help me with:
1. [INSERT YOUR SPECIFIC REQUEST HERE - e.g., "Design the system architecture", "Create the database schema", "Write the data collection module", "Build the LLM processing pipeline", etc.]

---

## Additional Context

- This is initially for personal use, but may expand to serve a community in the future
- I prefer quality over quantity - better to surface 10 highly relevant items than 100 noisy ones
- The system should be extensible to add new sources and processing rules easily
- I value deep-dive summaries over shallow headlines
