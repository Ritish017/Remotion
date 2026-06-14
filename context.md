# CATALYST CONTENT OS — COMPLETE TECHNICAL & FUNCTIONAL CONTEXT

**Stack:** Next.js 16 · React 19 · TypeScript 5 · AWS Bedrock (Nova models) · Supabase (PostgreSQL) · Tailwind CSS 4 · shadcn/ui · SWR · Recharts  
**Purpose:** AI-powered video content operating system. Full pipeline from campaign planning → AI research → AI script → AI video generation → social distribution → analytics.

---

## WHAT THIS APPLICATION DOES

Catalyst is an end-to-end content OS for creators and brands. A user creates a campaign, the AI plans 30–90 episodes, and each episode moves through a 6-stage pipeline:

```
Campaign Created
  → Episodes Auto-Planned (AI)
    → Research (AI + YouTube)
      → Script (AI)
        → Video Generated (AWS Nova Reel)
          → Posted to Social (Ayrshare)
            → Analytics Tracked
```

Everything is driven by AI. The user's only manual steps are approving content and clicking "Post".

---

## CAMPAIGN VERTICALS

Three content verticals, each with its own AI prompting logic and visual style:

| Vertical | Use Case | Default Palette | Segments |
|---|---|---|---|
| `ai-teaching` | AI/dev tutorials (LangGraph, RAG, agents) | `tutorial-neon` / `graph-tech` | 4 (hook, problem, solution, CTA) |
| `social-branding` | Viral short-form content | `neon-purple` | 3 (hook, content, CTA) |
| `football` | FIFA World Cup 2026 match previews | `ai-fire` | 3 (intro, stadium, glory) |

---

## DATABASE SCHEMA (Supabase / PostgreSQL)

### `campaigns`
Top-level content series container.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `name` | text | "30-Day LangGraph Mastery" |
| `type` | text | `ai-teaching` · `social-branding` · `football` |
| `description` | text | Campaign brief |
| `target_platforms` | text[] | `['instagram','youtube','x','linkedin']` |
| `start_date` / `end_date` | date | Campaign run period |
| `status` | text | `planning` → `active` → `paused` → `completed` |
| `brand_voice` | text | "Energetic and technical" |
| `target_audience` | text | "Junior developers learning AI" |
| `accent_color` | text | `#6366f1` (hex) |
| `duration_days` | int | Number of episodes planned |
| `created_at` / `updated_at` | timestamptz | |

### `episodes`
Individual content pieces within a campaign.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `campaign_id` | UUID FK | → `campaigns.id` |
| `episode_number` | int | Sequential 1…N |
| `title` | text | "What is LangGraph and Why Should You Care?" |
| `topic` | text | Pre-filled from title; gates script/video buttons |
| `status` | text | `idea` → `researched` → `scripted` → `video_generated` → `scheduled` → `posted` → `analysed` |
| `scheduled_date` | date | Auto-set: start_date + (episode_number - 1) days |
| `scheduled_time` | time | Posting time (default null) |
| `research` | jsonb | `ResearchBrief` object |
| `script` | jsonb | `ScriptData` object |
| `video_job_id` | UUID | Nova Reel job ID |
| `video_url` | text | S3 presigned URL after render |
| `virality_score` | int | 0–100 predicted engagement |
| `storytelling_prompt` | text | AI-generated guide for the scriptwriter |
| `video_prompt` | text | AI-generated guide for the video generator |
| `description` | text | Episode summary |
| `episode_type` | text | `tutorial`, `explainer`, `reaction`, etc. |
| `urgency` | text | `breaking` · `high` · `normal` · `low` |
| `auto_triggered` | bool | Created autonomously by the Brain |
| `brain_reasoning` | text | Why the Brain chose this topic |
| `world_context_used` | jsonb | Live data used in decision |
| `created_at` / `updated_at` | timestamptz | |

### `platform_posts`
Social media distribution records per episode per platform.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `episode_id` | UUID FK | → `episodes.id` |
| `platform` | text | `instagram` · `youtube` · `x` · `linkedin` |
| `caption` | text | Platform-specific post text |
| `hashtags` | text[] | Array of tags |
| `title` / `description` | text | YouTube metadata |
| `ayrshare_post_id` | text | Reference from Ayrshare API |
| `status` | text | `draft` → `approved` → `scheduled` → `posted` → `failed` |
| `scheduled_at` / `posted_at` | timestamptz | |
| `post_url` | text | Link to live published post |

### `analytics`
Performance metrics pulled from Ayrshare after posting.

| Column | Type | Notes |
|---|---|---|
| `episode_id` | UUID FK | |
| `platform` | text | |
| `views` / `likes` / `comments` / `shares` / `saves` | int | |
| `ctr` / `retention_pct` | float | Click-through rate, average retention |
| `impressions` | int | |
| `fetched_at` | timestamptz | |

### `live_event_states`
Tracks Nova Reel video generation jobs in real time.

| Column | Type | Notes |
|---|---|---|
| `event_key` | text PK | Format: `video_job:{jobId}` |
| `campaign_type` | text | |
| `event_data` | jsonb | Full `VideoJob` object (segments, invocationArns, prompts) |
| `updated_at` | timestamptz | Upserted after every segment starts |

### `brain_runs` / `brain_memory`
Campaign Brain decision log and persistent memory (tables exist; UI is placeholder).

---

## AWS BEDROCK MODELS

| Model | ID | Used For |
|---|---|---|
| Nova Micro | `amazon.nova-micro-v1:0` | Fast/cheap analysis, hashtags |
| Nova Lite | `amazon.nova-lite-v1:0` | Research synthesis, quick scripts |
| Nova Pro | `amazon.nova-pro-v1:0` | Full scripts, campaign planning, agent reasoning |
| Nova Reel | `amazon.nova-reel-v1:1` | Async text-to-video generation |

**AWS Region:** `us-east-1` (hardcoded — Nova Reel only available here)  
**S3 Bucket:** `catalyst-videos-759433041913`  
**Nova Reel output path:** `videos/{jobId}/segment_{i}/{invocationId}/output.mp4`

### Nova Reel Constraints
- **Concurrent invocation limit:** 1 per account (enforced — account quota, not a code choice)
- **Prompt max length:** 512 characters
- **Segment duration:** 6 seconds each (fixed)
- **Resolution:** 1280×720, 24fps
- **Render time:** ~75–90 seconds per 6-second clip
- **Total render time:** ~5–6 minutes for a 4-segment video

---

## API ROUTES (Complete Reference)

### LLM / Agent APIs

#### `POST /api/claude`
Universal LLM endpoint. Accepts two formats:

**Format A — Content OS (agents, scripts, research):**
```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "system": "RESEARCH_AGENT_PROMPT | SCRIPT_AGENT_PROMPT | ...",
  "model": "amazon.nova-pro-v1:0",
  "max_tokens": 4096
}
```
**Format B — Legacy generate page:**
```json
{ "prompt": "...", "vertical": "ai-teaching", "platform": "youtube", "model": "nova-pro" }
```
**Response:** `{ result: <parsed JSON>, raw: <text> }`  
**Bedrock Command:** `ConverseCommand`

#### `POST /api/agents`
Execute one of 8 specialized content agents.

```json
{ "agentName": "Virality Scorer", "input": "video script or topic text" }
```

| Agent | Output Shape |
|---|---|
| Virality Scorer | `{ overall_score, label, breakdown, platform_scores, improvements }` |
| Hashtag Engine | `{ hashtags: [{ tag, reach, description }] }` |
| Title Optimizer | `{ titles: [{ platform, title, ctr_estimate }] }` |
| Views Analyst | `{ avg_duration, retention_warning, drop_off_points }` |
| Description Writer | `{ description, timestamps: [{time, label}] }` |
| Thumbnail AI | `{ layout, text_overlay, palette, style }` |
| Trend Spotter | `{ trends: [{ keyword, score, title_ideas }] }` |
| 30-Day Planner | `{ days: [{ day, format, duration, hook }] }` |

Falls back to deterministic simulated responses if Bedrock is unavailable.

---

### Campaign & Episode APIs

#### `POST /api/campaigns/plan`
Auto-generate all episodes for a new campaign using AI.

**Request:**
```json
{
  "campaignId": "uuid",
  "name": "30-Day LangGraph Mastery",
  "type": "ai-teaching",
  "description": "...",
  "brandVoice": "Technical but accessible",
  "targetAudience": "Python developers new to AI agents",
  "startDate": "2026-06-15",
  "episodeCount": 30
}
```

**Process:**
1. Calls Nova Pro with a campaign planning prompt
2. Nova Pro returns a JSON array of `episodeCount` episode objects
3. Each episode: `{ title, description, storytelling_prompt, video_prompt }`
4. Inserts all episodes into Supabase with:
   - `status: 'idea'`
   - `topic: ep.title` (pre-filled so Research/Script/Video buttons are immediately enabled)
   - `scheduled_date: startDate + i days`

**Response:** `{ success: true, count: 30 }`

---

### Video Generation APIs

#### `POST /api/catalyst/generate/tutorial`
Generate AI teaching video (4 segments: hook → problem → solution → CTA).

**Request:**
```json
{
  "topic": "LangGraph for Developers",
  "duration": 60,
  "palette": "graph-tech",
  "motion_preset": "smooth",
  "content_map": {
    "hook":     { "headline": "...", "stat": "..." },
    "problem":  { "headline": "...", "bullets": ["...", "..."], "stat": "..." },
    "solution": { "headline": "...", "key_points": ["...", "..."], "stat": "..." },
    "cta":      { "text": "...", "urgency": "..." }
  }
}
```

**Process (sequential — 1 concurrent limit):**
1. `buildTutorialSegments()` builds 4 visual prompts + text overlay definitions
2. For each segment in order:
   - `StartAsyncInvokeCommand` → Nova Reel → gets `invocationArn`
   - Upserts partial job to `live_event_states` (UI shows progress after each)
   - `GetAsyncInvokeCommand` polls every 12s until `Completed`/`Failed`
   - Then starts next segment
3. Total time: ~5–6 minutes for all 4 segments

**Response:** `{ job_id: "uuid", segments: 4 }`

#### `POST /api/catalyst/generate/social`
Social branding video (3 segments). Same structure, uses `buildSocialSegments()`.  
Request: `{ brief, palette, motion_preset, content_map }`

#### `POST /api/catalyst/generate/sports/preview`
Sports preview video (3 segments). Uses `buildSportsSegments()`.  
Request: `{ home, away, competition, palette }`

#### `GET /api/catalyst/status/[jobId]`
Poll job render progress.

**Response:**
```json
{
  "status": "rendering | done | error | unknown",
  "progress": "2/4 segments complete",
  "message": "error description if applicable"
}
```

Polls each segment's `GetAsyncInvokeCommand`. Returns `done` when ALL segments are `Completed`.

#### `GET /api/catalyst/preview/[jobId]`
Returns a self-contained HTML video player page (loaded in an `<iframe>`).

**Features:**
- Inter + JetBrains Mono fonts
- Multi-layer vignette (subtle radial gradients, not harsh black)
- Animated text: headline fades up, bullets slide in sequentially, code block fades in
- Code snippet display for the solution segment (LangGraph syntax-highlighted)
- Segment type badge (01 · Hook / 02 · The Problem / 03 · Solution / 04 · Next Steps)
- Pill-shaped progress dots at top
- Progress bar at bottom
- Crossfade transition between segments
- Accent color per segment type: indigo (hook), amber (problem), emerald (solution), pink (CTA)
- Auto-loops after all segments play

For untracked/orphaned jobs: scans S3 with `ListObjectsV2Command` to discover segments.

#### `GET /api/catalyst/download/[jobId]?segment=0`
Generates a presigned S3 URL and redirects to download a specific clip.

**S3 key pattern:** `videos/{jobId}/segment_{i}/{invocationId}/output.mp4`

#### `GET /api/catalyst/library`
Lists all generated videos by scanning S3 directly.

**Process:**
1. `ListObjectsV2Command` on `videos/` prefix → finds all `output.mp4` files
2. Groups by `jobId` (the UUID folder between `videos/` and `segment_N/`)
3. Merges with Supabase metadata for tracked jobs (topic, palette, campaign type)
4. Generates presigned download URLs for each clip
5. Marks untracked jobs as `orphan: true`

**Response:** `{ videos: [{job_id, topic, palette, segment_count, total_size_mb, segments: [{index, url, size}], tracked, created_at}] }`

#### `GET /api/catalyst/jobs`
Live job dashboard data (tracked + orphaned).

**Response:** `{ jobs: [...], in_progress_total: N, rate_limited: bool }`

#### `GET /api/catalyst/invocations`
Lists all recent Bedrock async invocations (up to 20).

**Response:** `{ invocations: [{arn, status, submitTime, endTime}], in_progress: N, total: N }`

---

### Content Synthesis APIs

#### `POST /api/research`
AI-powered episode research using YouTube competitor data.

**Request:** `{ topic: "LangGraph agents", campaignType: "ai-teaching" }`

**Process:**
1. `searchYouTube(topic)` → YouTube Data API v3 → top 5 videos with view counts
2. Sends to `/api/claude` with `RESEARCH_AGENT_PROMPT` + YouTube context
3. Nova Pro synthesizes research brief

**Response:**
```json
{
  "research": {
    "topic_summary": "2–3 sentence overview",
    "trending_score": 78,
    "trend_direction": "rising",
    "hook_angles": [{ "angle": "...", "why": "...", "predicted_virality": 85 }],
    "what_to_avoid": ["..."],
    "hashtags": {
      "instagram": ["#LangGraph", "#AIAgents"],
      "youtube": ["langgraph tutorial"],
      "x": ["#AI", "#Python"],
      "linkedin": ["#ArtificialIntelligence"]
    },
    "competitor_insights": "...",
    "unique_angle": "...",
    "competing_videos": [{ "title", "views", "creator", "insight" }]
  }
}
```

#### `POST /api/post`
Schedule or post content to social media via Ayrshare.

**Request:**
```json
{
  "platforms": ["instagram", "youtube"],
  "mediaUrl": "https://s3.amazonaws.com/...",
  "caption": "Here's how LangGraph actually works 🧠",
  "hashtags": ["#LangGraph", "#AIAgents"],
  "scheduleDate": "2026-06-20T09:00:00Z",
  "title": "LangGraph Explained in 60 Seconds",
  "description": "Full YouTube description..."
}
```

Falls back to mock response when `AYRSHARE_API_KEY` is not set.

---

## VIDEO GENERATION PIPELINE (Deep Dive)

### Visual Prompts by Palette

| Palette | Visual Style | Best For |
|---|---|---|
| `tutorial-neon` | Cyberpunk neon, electric blue/purple, dark tech | Generic AI tutorials |
| `graph-tech` | Dark navy, softly glowing graph nodes + edges, network topology | LangGraph, agents, workflows |
| `dark-bold` | Deep charcoal, soft indigo glows, minimalist geometric depth | Professional explainers |
| `tutorial-warm` | Golden amber, cozy modern tech, warm bokeh | Beginner-friendly content |
| `ai-electric` | White/blue lightning arcs, plasma discharge | High-energy AI content |
| `ai-cyber` | Matrix green code cascade, circuit board patterns | Cybersecurity, hacking, systems |
| `ai-fire` | Orange/red flames, heat distortion | Sports, competition |
| `neon-purple` | Violet/magenta neon, atmospheric night | Social/lifestyle content |

### Motion Presets

| Preset | Movement Style |
|---|---|
| `kinetic` | Fast-paced, quick dynamic cuts, high energy |
| `smooth` | Flowing cinematic, elegant fluid transitions |
| `dramatic` | Slow reveal, epic scale panning, sweeping |
| `minimal` | Subtle gentle motion, calm steady camera |

### Segment Structure (Tutorial — 4 segments)

```
Segment 0 — HOOK (6s)
  Visual: Single glowing node → edges radiate outward → complete network forms
  Overlay: headline + stat
  Accent: Indigo (#818cf8)

Segment 1 — PROBLEM (6s)
  Visual: Network connections severing, nodes flickering out, broken pathways
  Overlay: headline + 2 bullet points + stat
  Accent: Amber-orange (#fb923c)

Segment 2 — SOLUTION (6s)
  Visual: State machine diagram, directed edges, emerald glow on completed steps
  Overlay: headline + 2 key points + stat + code snippet (JetBrains Mono)
  Accent: Emerald (#34d399)

Segment 3 — CTA (6s)
  Visual: Complete graph at full power, all nodes lit, cinematic pull-back
  Overlay: headline + urgency line
  Accent: Pink (#f472b6)
```

### content_map Structure (Required for Tutorial Generation)

```typescript
{
  hook: {
    headline: string,   // Main attention-grabbing statement
    subtext?: string,   // Supporting line
    stat?: string       // Compelling statistic (max ~60 chars)
  },
  problem: {
    headline: string,   // Problem statement
    bullets: string[],  // 2 specific pain points
    stat?: string       // Problem scale stat
  },
  solution: {
    headline: string,   // Solution name/concept
    key_points: string[], // 2 concrete benefits/mechanics
    stat?: string       // Result/proof stat
  },
  cta: {
    text: string,       // Action to take
    urgency: string     // Why now / low barrier
  }
}
```

This structure comes directly from the Script Agent (`SCRIPT_AGENT_PROMPT`) — the script output's `content_map` is passed unchanged to the video generator.

---

## FRONTEND PAGES (Complete Reference)

### `/campaigns` — Campaign List
- Cards grid: active, planning, completed sections
- "New Campaign" modal (2-step wizard):
  1. Name, type, description, dates, duration
  2. Platforms, brand voice, audience, accent color, episode count
- On submit: creates campaign → calls `/api/campaigns/plan` → inserts all episodes
- Stats: count of active/planning/completed campaigns

### `/campaigns/[id]` — Campaign Detail
- Hero card: name, type, status, progress bar (episodes scripted / total)
- **Overview tab:** 30-day calendar grid + episode list by status with color coding
- **Brain tab:** placeholder for autonomous agent memory/decisions

### `/campaigns/[id]/episodes/[episodeId]` — Episode Workspace (Core)

5-panel tabbed workspace. Each tab is gated on the previous stage being complete.

**Tab 1 — Research**
- Input: topic (pre-filled from `episode.topic`)
- Output: Topic summary, trending score gauge, hook angles, hashtag grid by platform, what-to-avoid list, competitor table
- Saves to: `episode.research` (JSON), sets status → `researched`

**Tab 2 — Script**
- Input: tone selector, platform focus, duration, feedback textarea
- Calls: `/api/claude` with `SCRIPT_AGENT_PROMPT` + research brief
- Output in 5 sub-tabs:
  - **Hook:** Headline, subtext, stat
  - **Content Map:** Problem bullets + solution key points
  - **Voiceover:** Full script text, word count, estimated duration
  - **CTA:** Action text + urgency
  - **Distribution Copy:** YouTube title/description, LinkedIn post, X thread
- Saves to: `episode.script`, sets status → `scripted`

**Tab 3 — Video**
- Input: palette, motion preset, duration
- Passes `episode.script.content_map` to generate endpoint
- Calls: `/api/catalyst/generate/tutorial` (or social/sports based on campaign type)
- Polling: `/api/catalyst/status/[jobId]` every 5s
- Preview: iframe → `/api/catalyst/preview/[jobId]`
- Download: per-segment buttons → `/api/catalyst/download/[jobId]?segment=N`
- Progress: segment dots fill as each of 4 clips completes
- Saves: `episode.video_job_id`, sets status → `video_generated`

**Tab 4 — Distribution**
- Pre-filled per platform: caption (from script), hashtags (from research), schedule date/time
- "Post" button → approval gate modal → `/api/post` → Ayrshare
- Shows: post status badge per platform, ayrshare_post_id
- Saves to: `platform_posts` table

**Tab 5 — Analytics**
- Shows post URLs (links to live content)
- Displays metrics: views, likes, shares, comments, saves, CTR, retention
- Pulls from: `analytics` table (populated after Ayrshare reports back)

### `/library` — Video Library
- Grid of all generated videos (S3-scanned, not just tracked ones)
- Per card: play button (iframe preview), segment download buttons, size info, orphan badge
- Search by topic or job ID
- Header: total jobs, total MB, total clips

### `/generate` — Quick Generate
- Free-form brief input + vertical/platform/model/duration selectors
- Calls `/api/claude` for narrative → calls `/api/catalyst/generate/*` for video
- Batch planner: queue multiple briefs
- Live jobs panel: segment progress bars + download buttons

### `/agents` — AI Agents Hub
- 8 agent cards with run/input modals
- Activity log with real-time job updates
- Agent output renders per-type (structured cards for each agent's result)

### `/overview`, `/ai-teaching`, `/social`, `/football` — Dashboards
- Metric cards: videos generated, total views, monthly cost, avg virality
- Pipeline table: recent jobs with status, model, cost per video
- Side panels: cost breakdown, virality distribution, hashtag cloud

### `/analytics` — Analytics Overview
- Aggregate views/likes/shares/comments across all platforms
- Bar chart: views by platform (Recharts)
- Campaign list with episode counts and status

---

## KEY DATA FLOWS

### Campaign Creation → Episode Plan
```
User fills modal
  → POST /api/campaigns/plan
    → Nova Pro generates JSON array of N episodes
      → INSERT INTO episodes (title, topic, storytelling_prompt, video_prompt, scheduled_date, status='idea')
        → Redirect to /campaigns/[id]
```

### Research → Script → Video (Episode Pipeline)
```
User clicks Research
  → POST /api/research { topic }
    → YouTube Data API → top 5 videos
      → POST /api/claude { system: RESEARCH_AGENT_PROMPT, context: youtube_data }
        → Nova Pro returns ResearchBrief JSON
          → UPDATE episodes SET research=..., status='researched'

User clicks Generate Script
  → POST /api/claude { system: SCRIPT_AGENT_PROMPT, context: research_brief }
    → Nova Pro returns ScriptData JSON (voiceover + content_map + metadata)
      → UPDATE episodes SET script=..., status='scripted'

User clicks Generate Video
  → POST /api/catalyst/generate/tutorial { topic, content_map, palette, motion_preset }
    → For each of 4 segments (sequential):
        StartAsyncInvokeCommand → Nova Reel → invocationArn
        Upsert live_event_states (partial job saved)
        Poll GetAsyncInvokeCommand every 12s until Completed
    → UPDATE episodes SET video_job_id=..., status='video_generated'

Frontend polls /api/catalyst/status/[jobId] every 5s
  → Shows segment dots filling: ○○○○ → ●○○○ → ●●○○ → ●●●○ → ●●●●
  → On done: shows preview iframe + download buttons
```

### Social Distribution
```
User sets caption/hashtags/schedule per platform
  → POST /api/post { platforms, mediaUrl, caption, hashtags, scheduleDate }
    → Ayrshare API → posts/schedules to Instagram, YouTube, X, LinkedIn
      → Returns ayrshare_post_id, status
        → INSERT INTO platform_posts

Later: analytics fetched from Ayrshare
  → INSERT INTO analytics (views, likes, ctr, retention_pct...)
    → Shown in Analytics tab
```

---

## SYSTEM PROMPTS (Summary)

### `RESEARCH_AGENT_PROMPT`
Returns JSON: `{ topic_summary, trending_score, trend_direction, hook_angles[{angle, why, predicted_virality}], what_to_avoid, hashtags{instagram,youtube,x,linkedin}, competitor_insights, unique_angle, competing_videos[{title,views,creator,insight}] }`

### `SCRIPT_AGENT_PROMPT`
Returns JSON: `{ hook{headline,subtext,stat}, problem{headline,bullets[],stat}, solution{headline,key_points[],stat}, cta{text,urgency}, voiceover_script, metadata{word_count, duration_estimate, youtube_title, youtube_description, linkedin_post, x_thread} }`

### `VIRALITY_AGENT_PROMPT`
Returns JSON: `{ overall_score, label: "Weak|Average|Good|Great|Viral", breakdown{hook_strength, pacing, emotional_pull, clarity, cta_strength}, platform_scores{instagram,youtube,x,linkedin}, improvements[], strengths[] }`

---

## ENVIRONMENT VARIABLES

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dqulknatinxqqwoygzwt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<jwt>
SUPABASE_SERVICE_ROLE_KEY=<jwt>         # Used server-side for writes

# AWS (credentials via instance role or env)
AWS_REGION=us-east-1
AWS_DEFAULT_REGION=us-east-1
S3_VIDEO_BUCKET=catalyst-videos-759433041913

# External APIs
ANTHROPIC_API_KEY=<key>                 # Present but not actively used (Bedrock preferred)
YOUTUBE_API_KEY=<key>                   # Required for /api/research
AYRSHARE_API_KEY=<key>                  # Required for /api/post (falls back to mock)

# Internal routing
NEXT_PUBLIC_CATALYST_URL=/api/catalyst  # Must be /api/catalyst (NOT a Python backend URL)
```

---

## EXTERNAL SERVICE INTEGRATIONS

### AWS Bedrock
- **SDK:** `@aws-sdk/client-bedrock-runtime`
- **Commands:** `ConverseCommand` (text), `StartAsyncInvokeCommand` / `GetAsyncInvokeCommand` / `ListAsyncInvokesCommand` (video)
- **Auth:** AWS SDK default credential chain (env vars or instance role)

### AWS S3
- **SDK:** `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`
- **Commands:** `GetObjectCommand`, `ListObjectsV2Command`
- **Presigned URLs:** 1-hour expiry for downloads, 3600s for library previews

### Supabase
- **SDK:** `@supabase/supabase-js`
- **Client:** Server-side uses service role key; client-side uses anon key
- **RLS:** Must allow inserts/upserts on `live_event_states`, `episodes`, `platform_posts`

### Ayrshare
- **Endpoint:** `https://api.ayrshare.com/api/post`
- **Auth:** `Bearer <AYRSHARE_API_KEY>`
- **Platforms:** Instagram, YouTube (categoryId: 28), X, LinkedIn
- **Features:** Immediate post + scheduled post + analytics retrieval

### YouTube Data API v3
- **Used by:** `/api/research` for competitor analysis
- **Endpoints:** `search` + `videos` (for view counts)
- **Requires:** `YOUTUBE_API_KEY`

---

## KNOWN CONSTRAINTS & IMPORTANT NOTES

### Nova Reel (Critical)
- **1 concurrent invocation** per account — all generate routes fire segments sequentially, waiting ~75s per clip before starting next
- **512-character prompt limit** — visual prompts must stay under this
- **us-east-1 only** — hardcoded, cannot be changed without breaking video generation
- **Total video time:** 4 segments × 6s = 24 seconds of actual video (not 60s despite the `duration` parameter — that's a legacy input)

### Routing (Critical)
- `NEXT_PUBLIC_CATALYST_URL` **must** be `/api/catalyst` — if set to a Python backend URL, all status/preview/download calls route to the wrong server
- All video job routes are specific Next.js API routes (`/api/catalyst/...`) that take precedence over any catch-all proxy

### Status Polling
- Frontend polls `/api/catalyst/status/[jobId]` every 5s
- The status route polls Bedrock's `GetAsyncInvokeCommand` for each segment on every request
- With 4 segments and a ~6-minute total render, expect ~70 polling calls per video

### YouTube API
- Currently unconfigured (`YOUTUBE_API_KEY` empty in `.env`)
- Research panel works but returns no competitor data — Nova Pro still generates a research brief without YouTube context

### Ayrshare
- Currently unconfigured — distribution returns mock responses
- Mock format: `mock-{platform}-{timestamp}`

### Orphaned Nova Reel Jobs
- Jobs started during rate-limit failures (where `StartAsyncInvokeCommand` succeeded but the loop crashed) create "orphaned" invocations
- These exist in Bedrock and S3 but have no `live_event_states` record
- Library page discovers and shows them by scanning S3 directly
- Preview works for orphaned jobs via S3 fallback scan

---

## PROJECT FILE STRUCTURE

```
src/
├── app/
│   ├── page.tsx                              → redirects to /campaigns
│   ├── layout.tsx                            → root layout (Topbar + Sidebar)
│   ├── campaigns/
│   │   ├── page.tsx                          → campaign list + new campaign modal
│   │   └── [id]/
│   │       ├── page.tsx                      → campaign detail (overview + brain tabs)
│   │       └── episodes/[episodeId]/
│   │           └── page.tsx                  → 5-panel episode workspace (THE CORE)
│   ├── library/page.tsx                      → video library (S3-based)
│   ├── generate/page.tsx                     → quick generate + batch planner
│   ├── agents/page.tsx                       → 8 AI agents hub
│   ├── overview/page.tsx                     → cross-campaign dashboard
│   ├── ai-teaching/page.tsx                  → AI teaching vertical dashboard
│   ├── social/page.tsx                       → social branding vertical dashboard
│   ├── football/page.tsx                     → football vertical dashboard
│   ├── analytics/page.tsx                    → analytics overview
│   └── api/
│       ├── claude/route.ts                   → universal LLM endpoint
│       ├── agents/route.ts                   → 8 agent executors
│       ├── research/route.ts                 → YouTube + AI research
│       ├── post/route.ts                     → Ayrshare distribution
│       ├── campaigns/
│       │   └── plan/route.ts                 → AI episode planning
│       ├── brain/
│       │   ├── run/route.ts                  → campaign brain trigger
│       │   ├── status/route.ts               → brain status
│       │   └── history/route.ts              → brain run history
│       └── catalyst/
│           ├── generate/
│           │   ├── tutorial/route.ts         → Nova Reel AI teaching (4 segs)
│           │   ├── social/route.ts           → Nova Reel social (3 segs)
│           │   └── sports/preview/route.ts   → Nova Reel sports (3 segs)
│           ├── status/[jobId]/route.ts       → job render progress
│           ├── preview/[jobId]/route.ts      → HTML video player
│           ├── download/[jobId]/route.ts     → S3 presigned download
│           ├── library/route.ts              → S3-scanned video library
│           ├── jobs/route.ts                 → live job dashboard data
│           └── invocations/route.ts          → raw Bedrock invocation list
├── components/
│   ├── layout/                               → Topbar, Sidebar
│   ├── shared/                               → MetricCard, StatusBadge, PipelineTable, etc.
│   ├── brain/                                → BrainPanel and sub-components (placeholder UI)
│   └── ui/                                   → shadcn components
├── hooks/
│   ├── useCampaign.ts                        → campaigns CRUD + SWR
│   ├── useEpisode.ts                         → episode CRUD + SWR
│   └── useAnalytics.ts                       → analytics fetch + SWR
└── lib/
    ├── types.ts                              → all TypeScript interfaces
    ├── constants.ts                          → models, palettes, system prompts
    ├── video-generation.ts                   → buildTutorialSegments, buildSocialSegments, buildSportsSegments
    ├── catalyst.ts                           → video job client wrappers
    ├── supabase.ts                           → Supabase client singleton
    ├── research.ts                           → YouTube search utility
    ├── ayrshare.ts                           → Ayrshare API client
    └── utils.ts                              → cn(), model mapping, mock metrics
```
