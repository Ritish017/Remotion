# Catalyst Motion OS — Full Context Document
## Functional & Technical Requirements

> Version: 4.0 | Date: 2026-06-14 | Stack: Next.js 16 + Python FastAPI + Supabase

---

## 1. Application Overview

**Catalyst Motion OS** is a full-stack AI-powered video production and content management system. It enables a single creator to go from an idea to a posted, analysed video across multiple social platforms — without a team, without a traditional render farm, and at near-zero cost per video.

### Core Value Proposition
- Generate high-motion, broadcast-quality short-form videos from a text brief in seconds
- AI pipeline handles research, scripting, narration, and virality scoring
- $0/render via local HyperFrames renderer (HTML→MP4 via Electron)
- ~$0.0002/video AI cost for the complete pipeline
- Three specialised content families: AI Teaching, Social Branding, and Football/FIFA
- Multi-platform publishing (Instagram, YouTube, X, LinkedIn) via Ayrshare

### Architecture Summary
```
┌─────────────────────────────────────────┐
│   Next.js 16 Frontend (App Router)      │
│   React 19 · TypeScript · Tailwind v4   │
│   Supabase (PostgreSQL + RLS)           │
└──────────────┬──────────────────────────┘
               │ HTTP (REST)
┌──────────────▼──────────────────────────┐
│   Python FastAPI Backend                │
│   Port 8000 · 18 endpoints             │
│   catalyst_core/ Python modules         │
└──────┬──────────┬──────────┬────────────┘
       │          │          │
  AWS Bedrock  HyperFrames  API-Football
  (LLM cascade) (local      (live sports
                 renderer)   data)
```

---

## 2. Technology Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.9 (App Router) |
| Runtime | React 19.2.4 |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Data Fetching | SWR 2.x |
| Charts | Recharts 3.x |
| Database Client | @supabase/supabase-js 2.x |
| AI Client | @anthropic-ai/sdk 0.104.1 |

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | Python FastAPI |
| Server | Uvicorn (ASGI) |
| Port | 8000 |
| LLM Provider | AWS Bedrock (via boto3) |
| Renderer | HyperFrames (local Electron process) |
| Animation | GSAP 3.13+ (all plugins free since April 2025) |
| Sports Data | API-Football v3 (api-sports.io) |
| Environment | `.env` file (manual parse, no python-dotenv dependency) |

### Database
| Layer | Technology |
|-------|-----------|
| Provider | Supabase (hosted PostgreSQL) |
| Auth | Supabase Auth (single-user, open RLS policies) |
| Schema | 5 tables with RLS enabled |
| Client | supabase-js (browser-side only) |

### External Services
| Service | Purpose | Cost |
|---------|---------|------|
| AWS Bedrock | LLM inference (Qwen, DeepSeek, Nova, etc.) | ~$0.0001–0.0002/call |
| Anthropic API | 8 AI agents, narrative generation | ~$0.0001/call (Sonnet 4.6) |
| Ayrshare | Multi-platform social posting | Subscription |
| YouTube Data API v3 | Competitor research | Free tier |
| API-Football v3 | Live match data, standings, player stats | 100 req/day free |
| Supabase | PostgreSQL DB + Auth | Free tier |

---

## 3. Project Structure

```
catalyst-video-studio/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # App shell (Topbar + Sidebar)
│   │   ├── page.tsx                # Dashboard home
│   │   ├── campaigns/page.tsx      # Campaign management UI
│   │   ├── generate/page.tsx       # Video generation UI
│   │   ├── analytics/page.tsx      # Analytics dashboard
│   │   ├── schedule/page.tsx       # Content calendar
│   │   └── api/
│   │       ├── agents/route.ts     # 8 Claude-powered AI agents
│   │       ├── claude/route.ts     # Narrative generation (dual-mode)
│   │       └── post/route.ts       # Ayrshare social posting
│   ├── lib/
│   │   ├── types.ts                # Full TypeScript type system
│   │   ├── constants.ts            # Model config, agent prompts, palettes
│   │   ├── api.ts                  # FastAPI backend client (18 endpoints)
│   │   ├── catalyst.ts             # Video generation client (jobs)
│   │   ├── supabase.ts             # Supabase client init
│   │   ├── ayrshare.ts             # Social posting functions
│   │   └── research.ts             # YouTube competitor research
│   └── hooks/
│       └── useEpisode.ts           # Episode + platform post SWR hooks
├── catalyst_core/
│   ├── seed_library.py             # 48 scene specs (deterministic seeding)
│   ├── content_injector.py         # data-placeholder content injection
│   ├── variation_engine.py         # CSS token variation (16 palettes, 3 formats)
│   ├── story_agent.py              # Nova Micro narrative generation
│   └── sports_data.py              # API-Football fetcher (5-min cache)
├── scenes/
│   ├── tutorial-teaching/          # 1920×1080 landscape (12 scenes)
│   ├── ai-social/                  # 1080×1920 vertical (12 scenes)
│   └── fifa-sports/                # 1080×1080 square (12 scenes)
├── jobs/                           # HyperFrames render job output
├── server.py                       # FastAPI server (18 endpoints)
├── .env                            # Environment variables
├── supabase/
│   └── schema.sql                  # Full DB schema
└── package.json                    # Next.js dependencies
```

---

## 4. Database Schema

### 4.1 Table: `campaigns`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
name          TEXT NOT NULL
type          TEXT NOT NULL  -- 'ai-teaching' | 'social-branding' | 'football'
status        TEXT DEFAULT 'planning'  -- planning | active | paused | completed
goal          TEXT
target_views  INTEGER DEFAULT 10000
accent_color  TEXT DEFAULT '#6c47ff'
platform_focus TEXT[]
created_at    TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()
```

### 4.2 Table: `episodes`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
campaign_id   UUID REFERENCES campaigns(id) ON DELETE CASCADE
title         TEXT NOT NULL
status        TEXT DEFAULT 'idea'
  -- States: idea → researched → scripted → video_generated → scheduled → posted → analysed
topic         TEXT
research      JSONB   -- ResearchBrief
script        JSONB   -- ScriptData
video_job_id  TEXT    -- HyperFrames job ID
video_url     TEXT
thumbnail_url TEXT
virality_score JSONB  -- ViralityScore
scheduled_at  TIMESTAMPTZ
posted_at     TIMESTAMPTZ
created_at    TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()
```

### 4.3 Table: `platform_posts`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
episode_id    UUID REFERENCES episodes(id) ON DELETE CASCADE
platform      TEXT NOT NULL  -- instagram | youtube | x | linkedin
post_id       TEXT           -- External post ID from Ayrshare
status        TEXT DEFAULT 'pending'  -- pending | posted | failed
caption       TEXT
hashtags      TEXT[]
post_url      TEXT
posted_at     TIMESTAMPTZ
analytics     JSONB
created_at    TIMESTAMPTZ DEFAULT NOW()
```

### 4.4 Table: `analytics`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
episode_id    UUID REFERENCES episodes(id) ON DELETE CASCADE
platform      TEXT NOT NULL
views         INTEGER DEFAULT 0
likes         INTEGER DEFAULT 0
comments      INTEGER DEFAULT 0
shares        INTEGER DEFAULT 0
saves         INTEGER DEFAULT 0
reach         INTEGER DEFAULT 0
impressions   INTEGER DEFAULT 0
engagement_rate FLOAT DEFAULT 0
fetched_at    TIMESTAMPTZ DEFAULT NOW()
```

### 4.5 Table: `research_cache`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
query         TEXT NOT NULL
source        TEXT NOT NULL  -- 'youtube' | 'trends'
data          JSONB
expires_at    TIMESTAMPTZ DEFAULT NOW() + interval '24 hours'
created_at    TIMESTAMPTZ DEFAULT NOW()
```

---

## 5. Episode Lifecycle & Workflow

Each episode progresses through a linear state machine:

```
idea
  │  [Research Agent runs — YouTube search + AI analysis]
  ▼
researched
  │  [Script Agent runs — hook/body/CTA + platform variants]
  ▼
scripted
  │  [Video generation — StoryAgent + VariationEngine + HyperFrames render]
  ▼
video_generated
  │  [Virality scoring — ViralityAgent evaluates script]
  │  [Schedule for posting — user picks time]
  ▼
scheduled
  │  [Ayrshare fires at scheduled_at time]
  ▼
posted
  │  [Analytics fetched from Ayrshare 24h after post]
  ▼
analysed
```

---

## 6. Campaign Types

### 6.1 AI Teaching (`ai-teaching`)
- Topics: AI tools, models, tutorials, coding education
- Scene family: `tutorial-teaching` (landscape 1920×1080) or `ai-social` (vertical 1080×1920)
- Default platform: YouTube long-form or Shorts
- Tone: Educational, step-by-step, specific numbers and statistics
- Accent: `#00c9a7`

### 6.2 Social Branding (`social-branding`)
- Topics: SaaS, startup launches, product demos, personal brand
- Scene family: `ai-social` (vertical 1080×1920) or `saas-kinetic`
- Default platform: Instagram Reels, TikTok
- Tone: Punchy, fast, energetic
- Accent: `#f0522a`

### 6.3 Football / FIFA (`football`)
- Topics: Match previews, live scores, standings, player stats, FIFA World Cup 2026
- Scene family: `fifa-sports` (square 1080×1080)
- Default platform: Instagram, X
- Tone: Broadcast, cinematic, stadium atmosphere
- Accent: `#f5c518`
- Live data: API-Football v3 (100 req/day free tier)

---

## 7. AI Model Cascade

The Python backend uses AWS Bedrock with a waterfall of models (fastest/cheapest first):

```
Request
  │
  ▼
Qwen3 Coder (primary — code/technical tasks)
  │ (fail/timeout)
  ▼
DeepSeek V3.2 (alternative reasoning)
  │ (fail/timeout)
  ▼
Devstral (code-specialized fallback)
  │ (fail/timeout)
  ▼
Nova Pro (Amazon — general purpose)
  │ (fail/timeout)
  ▼
Nova Lite (Amazon — fast, cheap)
```

**StoryAgent** uses `us.amazon.nova-micro-v1:0` specifically — the cheapest Nova model at $0.0001/call — for narrative generation. Falls back to heuristic rules if Bedrock is unavailable.

**Frontend AI Agents** (8 total) use `claude-sonnet-4-6` directly via the Anthropic SDK through the `/api/agents` Next.js route.

### Cost Model
| Component | Cost |
|-----------|------|
| StoryAgent (Nova Micro) | ~$0.00001/call |
| Script Agent (Claude Sonnet 4.6) | ~$0.0001/call |
| Virality Scorer (Claude Sonnet 4.6) | ~$0.00005/call |
| HyperFrames render | $0.00 (local) |
| **Total per video** | **~$0.0002** |

---

## 8. Backend API Endpoints (18 total)

Base URL: `http://127.0.0.1:8000`

### 8.1 Video Generation
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/generate/tutorial` | Generate AI teaching video (StoryAgent + render) |
| `POST` | `/generate/social` | Generate vertical social video |
| `POST` | `/generate/sports/preview` | Match preview video with live API-Football data |
| `POST` | `/batch/generate` | Fire-and-forget batch (up to 20 briefs) |

**`POST /generate/tutorial` request:**
```json
{
  "brief": "How Claude 4 changed AI coding forever",
  "duration": 60,
  "palette": "tutorial-neon",
  "motion_preset": "kinetic"
}
```

**`POST /generate/social` request:**
```json
{
  "brief": "Why ChatGPT is losing to Claude",
  "platform": "reels",
  "palette": "ai-electric"
}
```

**`POST /generate/sports/preview` request:**
```json
{
  "fixture_id": 1035443,
  "palette": "fifa-gold"
}
```

**`POST /batch/generate` request:**
```json
{
  "briefs": ["Brief 1", "Brief 2", ...],
  "platform": "youtube",
  "duration": 60
}
```
Returns: `{ "accepted": 12, "job_ids": ["..."] }`

### 8.2 Job Management
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/jobs` | List all render jobs |
| `GET` | `/status/{job_id}` | Poll job status |
| `GET` | `/download/{job_id}` | Download rendered MP4 |
| `GET` | `/preview/{job_id}` | Preview job (thumbnail/stream) |

### 8.3 Scene Library
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/scenes` | List all scenes (filter by `?scene_type=hook`) |
| `GET` | `/library/families` | All 3 scene families with metadata |

### 8.4 Templates
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/templates` | List saved templates |
| `POST` | `/templates/import-job/{job_id}` | Save render job as template |

### 8.5 Core Video
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/mix` | Mix selected scenes into a composition |
| `GET` | `/health` | Health check |

---

## 9. Frontend API Routes (Next.js)

### `POST /api/agents`
Runs any of the 8 AI agents backed by `claude-sonnet-4-6`.

**Request:**
```json
{
  "agent": "virality-scorer",
  "payload": { "script": "...", "platform": "youtube" }
}
```

**Available Agents:**
| Agent | Input | Output |
|-------|-------|--------|
| `virality-scorer` | script + platform | ViralityScore JSON |
| `hashtag-engine` | topic + platform | Platform-specific hashtag arrays |
| `title-optimizer` | title + niche | 5 optimised title variants |
| `views-analyst` | analytics data | Trend insights + recommendations |
| `description-writer` | script + metadata | YouTube/LinkedIn descriptions |
| `thumbnail-ai` | title + hook | Thumbnail concept + overlay text |
| `trend-spotter` | niche | 10 trending topics with scores |
| `30-day-planner` | campaign brief | 30-day content calendar JSON |

All agents have hash-seeded deterministic fallbacks that fire without network calls if the Anthropic request fails.

### `POST /api/claude`
Dual-mode narrative generation:
- **Content OS mode**: `{ messages: [...], system: "..." }` — passes directly to Claude
- **Legacy mode**: `{ prompt: "...", vertical: "ai", platform: "reels" }` — injects system context

### `POST /api/post`
Posts content to social platforms via Ayrshare.

**Request:**
```json
{
  "platforms": ["instagram", "youtube"],
  "text": "Caption here",
  "mediaUrls": ["https://..."],
  "scheduleDate": "2026-06-15T10:00:00Z"
}
```
Returns mock response when `AYRSHARE_API_KEY` is not set.

---

## 10. Motion Engine

### 10.1 Scene Families

| Family | Resolution | Format | Use Case |
|--------|-----------|--------|----------|
| `tutorial-teaching` | 1920×1080 | Landscape | YouTube tutorials, coding education |
| `ai-social` | 1080×1920 | Vertical | Reels, TikTok, Shorts |
| `fifa-sports` | 1080×1080 | Square | Instagram match previews, X posts |

### 10.2 Scene Types (4 per family)

Each family has 4 scene types, each with 3 palette variants (a/b/c):

| Scene Type | Description |
|-----------|-------------|
| `hook` | Opening attention-grabber (0–3s) |
| `problem` | Problem statement / pain point |
| `solution` | Solution reveal / key points |
| `cta` | Call to action / close |

**Total: 3 families × 4 types × 3 variants = 36 HTML scenes**

### 10.3 GSAP Animation Rules
- All GSAP plugins are free since April 2025: SplitText, MorphSVG, DrawSVG, MotionPath, ScrambleText, Physics2D, Flip, CustomEase, InertiaPlugin
- **Never use** `tl.from()` or `tl.fromTo()` — always `gsap.set()` for initial states + `tl.to()` for animations
- All timelines registered as: `window.__timelines["scene-id"] = tl` (paused, for HyperFrames scrubbing)
- Custom easings: `CustomEase.create('premium', 'M0,0 C0.16,1 0.3,1 1,1')` and `punchIn`
- Content placeholders use `data-placeholder="key"` attributes for injection

### 10.4 Color Palettes (16 total)

**Tutorial-Teaching:**
- `tutorial-neon` — `#00ff88` accent on `#0a0a0a`
- `tutorial-warm` — `#fbbf24` amber on `#0d0d0d`

**AI-Social:**
- `ai-electric` — `#00d4ff` cyan + `#7b2fff` purple on `#000000`
- `ai-cyber` — `#ff00aa` magenta + `#00ffcc` teal
- `ai-fire` — `#ff6b35` fire orange
- `neon-purple` — `#6c47ff`

**FIFA-Sports:**
- `fifa-gold` — `#FFD700` on `#050a14` broadcast dark
- `fifa-silver` — `#c0c0c0` on dark
- `fifa-home` — `#e63946` red
- `fifa-away` — `#4361ee` blue
- `fifa-cool` — cool blue broadcast
- `fifa-red` — deep red

**SaaS-Kinetic:**
- `neon-cyan`, `dark-bold`, `neon-purple`

### 10.5 Format Modes & CSS Tokens

```css
/* Landscape */
--video-width: 1920px; --video-height: 1080px;
--safe-zone-top: 48px; --safe-zone-bottom: 48px;

/* Vertical */
--video-width: 1080px; --video-height: 1920px;
--safe-zone-top: 120px; --safe-zone-bottom: 200px;

/* Square */
--video-width: 1080px; --video-height: 1080px;
--safe-zone-top: 60px; --safe-zone-bottom: 60px;
```

Global motion tokens:
- `--motion-speed`: `0.5` (minimal) to `1.5` (dramatic)
- `--color-accent`, `--color-bg`, `--color-glow`, `--color-secondary`
- `--color-panel`: semi-transparent accent overlay for sports scenes

### 10.6 VariationEngine

Located at `catalyst_core/variation_engine.py`.

Key methods:
```python
def apply_variation(composition_html, seed, content_map,
                    motion_preset=None, color_palette=None,
                    format_mode=None, scene_family=None) -> str
    # Injects CSS tokens into HTML + calls ContentInjector

def get_applied_settings(seed, motion_preset, color_palette,
                         format_mode, scene_family) -> dict
    # Returns resolved settings without modifying HTML

def list_palettes_for_family(scene_family: str) -> list[str]
    # Returns valid palettes for a family
```

**Seed-based determinism**: SHA256 hash of seed → struct unpack → LCG PRNG. Same seed always produces identical variation regardless of environment.

### 10.7 ContentInjector

Replaces `data-placeholder="key"` attributes in scene HTML:
```html
<span data-placeholder="hook_headline">Default text</span>
```
Gets replaced with the matching key from `content_map`.

**Standard content_map keys:**
`hook_headline`, `hook_subtext`, `hook_stat`, `problem_headline`, `problem_1`–`problem_3`, `solution_headline`, `solution_key_1`–`solution_key_3`, `cta_text`, `cta_urgency`, `home_team`, `away_team`, `competition`, `venue`, `match_time`

### 10.8 SeedLibrary

Located at `catalyst_core/seed_library.py`.

- 48 SCENE_SPECS total (12 original + 36 new in v4.0)
- Each spec: `{ "seed": int, "scene_id": str, "family": str, "type": str, "palette": str, "motion_preset": str }`
- 12 specs per family (tutorial-teaching, ai-social, fifa-sports)

---

## 11. StoryAgent

Located at `catalyst_core/story_agent.py`.

Generates structured narrative JSON from a plain-language brief.

### Input
```python
agent = StoryAgent(bedrock_client=boto3_client)
result = agent.generate_narrative(
    brief="How Claude 4 changed AI coding",
    platform="youtube"
)
content_map = agent.narrative_to_content_map(result)
```

### Output JSON
```json
{
  "content_type": "tutorial",
  "platform": "youtube",
  "narrative": {
    "hook":     { "headline": "...", "subtext": "...", "stat": "..." },
    "problem":  { "headline": "...", "bullets": ["...", "...", "..."], "stat": "..." },
    "solution": { "headline": "...", "key_points": ["...", "...", "..."], "stat": "..." },
    "cta":      { "text": "...", "urgency": "..." }
  },
  "recommended_family": "tutorial-teaching",
  "tone": "educational",
  "duration_seconds": 60,
  "sport_context": null
}
```

### Family Detection
StoryAgent detects the appropriate scene family from keywords in the brief:
- `tutorial-teaching`: "tutorial", "how to", "guide", "learn", "code", etc.
- `ai-social`: "ai ", "gpt", "chatgpt", "model", "automation", etc.
- `fifa-sports`: "fifa", "world cup", "match", "vs", "football", etc.
- `saas-kinetic`: "saas", "startup", "product", "launch", etc.

### Platform Durations
- `youtube`: 60s | `shorts`: 30s | `reels`: 15s | `tiktok`: 15s

---

## 12. SportsDataFetcher

Located at `catalyst_core/sports_data.py`.

Integrates with API-Football v3 (`https://v3.football.api-sports.io`).

```python
fetcher = SportsDataFetcher(api_key="9e0f132813a7d3d74b9cb8e94ce83148")

# Match preview
preview = fetcher.get_match_preview(fixture_id=1035443)
# → { teams, venue, kickoff, h2h (last 5 matches), odds }

# Live score
score = fetcher.get_live_score(fixture_id=1035443)
# → { status, score, elapsed, events[] }

# League standings
table = fetcher.get_standings(league_id=2, season=2026)
# → { league_name, standings[] }

# Player stats
stats = fetcher.get_player_stats(player_id=276, season=2026)
# → { name, team, goals, assists, rating, appearances }
```

**Caching**: 5-minute in-memory cache per endpoint. Cache key = `(path, params)`.
**Rate limit**: API-Football free tier = 100 requests/day. Cache prevents exhaustion.
**Dependencies**: stdlib only (`urllib`, `json`, `hashlib`). No `requests` required.

---

## 13. Frontend Pages & UI

### App Shell
- Layout: Fixed sidebar (220px wide) + topbar + `ml-[220px]` main content area
- All pages are React Server Components (Next.js App Router)

### `/` — Dashboard
- Overview metrics: total videos, posts, average views, engagement rate
- Recent episodes table
- Quick-action buttons for each campaign type

### `/campaigns` — Campaign Management
- Create campaigns (name, type, goal, target views, platform focus, accent color)
- List all campaigns with status badges
- Drill into campaign to see all episodes

### `/generate` — Video Generation
- Form: brief text, duration, platform, palette, motion preset
- Dispatches to appropriate `/generate/*` backend endpoint based on brief content
- Job status polling (SWR, 2s interval while pending)
- Preview and download on completion

### `/analytics` — Analytics Dashboard
- Recharts-powered bar/line charts for views, engagement, reach
- Per-platform breakdown
- Episode-level analytics table

### `/schedule` — Content Calendar
- Calendar view of scheduled posts
- Schedule new posts at optimal platform times:
  - Instagram: 08:00 and 19:30
  - YouTube: Tuesday 14:00 / Thursday 15:00
  - X: Weekdays 09:30
  - LinkedIn: Tuesday 09:00 / Thursday 08:30

---

## 14. AI Agent System (Frontend)

8 agents accessible via `POST /api/agents`:

| # | Agent | Model | Key Output |
|---|-------|-------|-----------|
| 1 | Virality Scorer | claude-sonnet-4-6 | Score 0–100, label, breakdown, improvements |
| 2 | Hashtag Engine | claude-sonnet-4-6 | Platform-specific hashtag arrays |
| 3 | Title Optimizer | claude-sonnet-4-6 | 5 A/B-testable title variants |
| 4 | Views Analyst | claude-sonnet-4-6 | Trend insights from analytics data |
| 5 | Description Writer | claude-sonnet-4-6 | YouTube + LinkedIn descriptions |
| 6 | Thumbnail AI | claude-sonnet-4-6 | Thumbnail concept + overlay text |
| 7 | Trend Spotter | claude-sonnet-4-6 | 10 trending topics with virality scores |
| 8 | 30-Day Planner | claude-sonnet-4-6 | Full month content calendar JSON |

All agents include **hash-seeded deterministic fallbacks**: if the Anthropic API call fails, a seeded PRNG generates a plausible response locally at zero cost.

### Research Agent (separate, in constants.ts)
Used for the `researched` episode stage:
- Calls YouTube Data API v3 (`src/lib/research.ts`)
- Returns: `topic_summary`, `trending_score`, `trend_direction`, `hook_angles[]` (with virality predictions), `hashtags` (per platform), `competitor_insights`, `unique_angle`

### Script Agent (separate, in constants.ts)
Used for the `scripted` episode stage:
- Returns: `hook` (text + duration + virality score), `main_content` (sections), `cta` (platform variants), `metadata` (word count, YouTube title × 4 variants, YouTube description, LinkedIn post, X thread × 5 tweets)

---

## 15. Social Publishing

### Ayrshare Integration (`src/lib/ayrshare.ts`)
```typescript
postToSocial(platforms, text, mediaUrls, scheduleDate?)
  → { success, post_ids, refId }

getPostAnalytics(refId, platform)
  → { views, likes, comments, shares, saves, reach, impressions }

deletePost(refId, platform)
  → { success }
```

Base URL: `https://app.ayrshare.com/api`
Auth: Bearer token from `AYRSHARE_API_KEY`

**Mock mode**: When `AYRSHARE_API_KEY` is not set, `POST /api/post` returns a mock success response — useful for local development.

### Supported Platforms
`instagram` | `youtube` | `x` | `linkedin`

---

## 16. YouTube Research

`src/lib/research.ts`:
```typescript
searchYouTube(topic: string, maxResults: number = 10)
  → { videos: [{ id, title, channelTitle, viewCount, publishedAt, url }] }
```

Results cached in `research_cache` table for 24 hours. Used during the `researched` episode stage to analyse competitor content.

---

## 17. TypeScript Type System

Key types in `src/lib/types.ts`:

```typescript
type CampaignType = 'ai-teaching' | 'social-branding' | 'football'
type CampaignStatus = 'planning' | 'active' | 'paused' | 'completed'
type EpisodeStatus = 'idea' | 'researched' | 'scripted' | 'video_generated'
                   | 'scheduled' | 'posted' | 'analysed'
type Platform = 'instagram' | 'youtube' | 'x' | 'linkedin'

interface Campaign {
  id: string; name: string; type: CampaignType; status: CampaignStatus
  goal: string; target_views: number; accent_color: string
  platform_focus: Platform[]; created_at: string; updated_at: string
}

interface Episode {
  id: string; campaign_id: string; title: string; status: EpisodeStatus
  topic: string; research: ResearchBrief | null; script: ScriptData | null
  video_job_id: string | null; video_url: string | null; thumbnail_url: string | null
  virality_score: ViralityScore | null; scheduled_at: string | null
  posted_at: string | null; created_at: string; updated_at: string
}

interface ResearchBrief {
  topic_summary: string; trending_score: number; trend_direction: string
  hook_angles: { angle: string; why: string; predicted_virality: number }[]
  what_to_avoid: string[]; hashtags: Record<Platform, string[]>
  competitor_insights: string; unique_angle: string
}

interface ScriptData {
  hook: { text: string; duration_seconds: number; virality_score: number }
  main_content: { text: string; sections: { title: string; text: string }[] }
  cta: { text: string; platform_variants: Record<Platform, string> }
  metadata: {
    word_count: number; estimated_duration_seconds: number
    youtube_title: string; youtube_title_variants: string[]
    youtube_description: string; linkedin_post: string; x_thread: string[]
  }
}

interface ViralityScore {
  overall_score: number; label: 'Weak' | 'Average' | 'Good' | 'Great' | 'Viral'
  breakdown: { hook_strength: number; pacing: number; emotional_pull: number
               clarity: number; cta_strength: number }
  platform_scores: Record<Platform, number>
  improvements: { issue: string; fix: string; impact: 'high' | 'medium' | 'low' }[]
  strengths: string[]
}
```

---

## 18. Environment Variables

```bash
# Sports Data
FOOTBALL_API_KEY=<api-football key>
FOOTBALL_API_HOST=v3.football.api-sports.io

# AI / LLM
ANTHROPIC_API_KEY=<claude api key>

# Database
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>

# Social Publishing
AYRSHARE_API_KEY=<ayrshare api key>

# Research
YOUTUBE_API_KEY=<youtube data api v3 key>

# Backend URL (consumed by Next.js frontend)
NEXT_PUBLIC_CATALYST_URL=http://127.0.0.1:8000
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
```

**Auto-loading**: `server.py` and `sports_data.py` both include a `_load_env_file()` function that manually parses `.env` at startup using stdlib only — no `python-dotenv` dependency required.

---

## 19. v4.0 Extensions (What Was Built)

Seven extensions were implemented in v4.0:

| # | Extension | Status |
|---|-----------|--------|
| 1 | 100+ motion primitives (GSAP scene library) | Complete |
| 2 | 36 scene HTML files (3 families × 4 types × 3 variants) | Complete |
| 3 | StoryAgent (`story_agent.py`) — Nova Micro narrative generation | Complete |
| 4 | VariationEngine update — 8 new palettes + 3 format modes | Complete |
| 5 | SportsDataFetcher (`sports_data.py`) — API-Football integration | Complete |
| 6 | ContentInjector (`content_injector.py`) | Complete |
| 7 | 5 new API endpoints + batch generation in `server.py` | Complete |

---

## 20. Local Development Setup

### Prerequisites
- Python 3.10+ (backend)
- Node.js 20+ (frontend)
- AWS credentials with Bedrock access (optional — fallbacks exist)
- HyperFrames Electron app installed

### Start Backend
```bash
cd catalyst-video-studio
python server.py
# FastAPI runs on http://127.0.0.1:8000
```

### Start Frontend
```bash
cd catalyst-video-studio
npm install
npm run dev
# Next.js runs on http://localhost:3000
```

### Seed Scene Library
```bash
python catalyst_core/seed_library.py \
  --families tutorial-teaching,ai-social,fifa-sports
```

### Smoke Tests
```bash
# Test tutorial generation end-to-end
curl -X POST http://127.0.0.1:8000/generate/tutorial \
  -H "Content-Type: application/json" \
  -d '{"brief": "How Claude 4 changed AI coding", "duration": 60}'

# Test live sports preview (requires valid fixture_id)
curl -X POST http://127.0.0.1:8000/generate/sports/preview \
  -H "Content-Type: application/json" \
  -d '{"fixture_id": 1035443, "palette": "fifa-gold"}'

# Check scene library
curl http://127.0.0.1:8000/library/families

# Batch generation
curl -X POST http://127.0.0.1:8000/batch/generate \
  -H "Content-Type: application/json" \
  -d '{"briefs": ["Brief 1", "Brief 2"], "platform": "youtube"}'
```

---

## 21. Known Constraints & Notes

- **API-Football free tier**: 100 requests/day. The 5-minute in-memory cache in `sports_data.py` prevents exhaustion during normal use.
- **HyperFrames**: Must be running locally for video rendering. Render jobs queue if HyperFrames is not available.
- **AWS Bedrock**: Required for the full model cascade. StoryAgent falls back to heuristic rules if boto3/Bedrock is unavailable.
- **Ayrshare**: Without `AYRSHARE_API_KEY`, posting returns mock responses. Real publishing requires an active Ayrshare subscription.
- **No CORS headers configured**: Frontend and backend must run on same machine (or configure CORS in `server.py` for remote backends).
- **Single-user application**: Supabase RLS is configured with open policies for single-user operation. Multi-user would require auth-scoped RLS.
- **No python-dotenv**: Both `server.py` and `sports_data.py` parse `.env` manually via `_load_env_file()` using stdlib only.
