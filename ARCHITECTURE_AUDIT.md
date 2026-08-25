# ARCHITECTURE AUDIT — CATALYST CONTENT OS

**Date:** 2026-08-25  
**Role:** Principal Architect & Systems Engineer  
**Objective:** Complete Architectural Audit prior to transforming Catalyst into a production-ready AI-native Remotion Video Creation Platform.

---

## 1. Executive Summary

Catalyst Content OS is an AI-driven video content operating system designed to manage campaigns, episodes, scripts, and video distribution. 

### Current State:
- **Web App**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui.
- **AI Stack**: Bedrock Nova models (`nova-micro`, `nova-lite`, `nova-pro`) called via `@aws-sdk/client-bedrock-runtime`. `@anthropic-ai/sdk` is installed but was unused.
- **Video Stack**: Relied on AWS Nova Reel (`amazon.nova-reel-v1:1`) generating 6-second abstract MP4 segments sequentially, stitched via an HTML/iframe preview player. No deterministic React-based timeline rendering existed.
- **Python / Legacy Footprint**: An unintegrated Python subpackage (`catalyst_core/brain/`) with legacy scheduler/watchers, and legacy references to HyperFrames / local FastAPI (`http://127.0.0.1:8000`).
- **Database**: Supabase PostgreSQL with 5 core tables (`campaigns`, `episodes`, `platform_posts`, `analytics`, `research_cache`, `live_event_states`).
- **Storage**: AWS S3 bucket (`catalyst-videos-759433041913`).

### Target State:
- **Core Video Engine**: Remotion (React 19 + TypeScript + Remotion Player + Remotion Lambda + S3).
- **Creative Intelligence**: Pure Anthropic Claude API (Claude 3.5 Sonnet / Haiku / Opus) with structured Zod tool validation and multi-agent director runtime.
- **Deterministic Motion OS**: Layered 3-layer composition engine (Background, Midground, Foreground), camera systems, kinetic typography, data visualization, maps, and audio design.
- **Zero Python/HyperFrames in Production**: All orchestration, reasoning, rendering, and previews run inside Next.js/TypeScript and Remotion Lambda.

---

## 2. Inventory & Analysis of Subsystems

### 2.1 Frontend UI Layer (`src/app/`, `src/components/`)
- **Root Layout (`src/app/layout.tsx`)**: Global dark-mode layout with fixed `Topbar` (52px) and `Sidebar` (60px / 220px).
- **Campaigns Flow (`src/app/campaigns/`)**:
  - `/campaigns`: Listing and 2-step campaign creation wizard.
  - `/campaigns/[id]`: Campaign detail with calendar and episodes list.
  - `/campaigns/[id]/episodes/[episodeId]`: 5-tab workspace (`Research`, `Script`, `Video`, `Distribute`, `Analytics`).
- **Studio Pages**: `/overview`, `/generate`, `/agents`, `/library`, `/ai-teaching`, `/social`, `/football`, `/analytics`, `/settings`.
- **Component Library (`src/components/`)**:
  - `src/components/ui/`: 13 shadcn components (`button`, `card`, `dialog`, `badge`, `tabs`, `input`, `select`, etc.).
  - `src/components/shared/`: 17 components including `VideoPlayer` (currently iframe-based), `ApprovalGate`, `AgentThinkingIndicator`, `MetricCard`, `PipelineTable`.
  - `src/components/brain/`: Placeholder components (`BrainPanel`, `BrainDecisionCard`, `WorldContextFeed`).

### 2.2 AI & Agent System
- **Current Endpoint (`/api/claude/route.ts`)**: Despite the name `claude`, it routed requests to AWS Bedrock Nova Pro/Lite.
- **Agents Hub (`/api/agents/route.ts`)**: 8 agent prompts executing on Bedrock Nova Pro with deterministic simulated fallbacks.
- **Campaign Brain (`/api/brain/run/route.ts`)**: Autonomous decision engine (435 lines) executing on Bedrock Nova Pro.
- **Requirement**: Replace Bedrock text logic with centralized Anthropic Claude Agent Runtime (`src/lib/ai/claude/`) with typed tool loops, schema enforcement via Zod, and specialized Director agents (Content Director, Storyboard Director, Visual Director, Production Agent, QA Agent).

### 2.3 Video Rendering & Composition
- **Current**: Sequential Nova Reel async invocations (1 clip at a time, ~75s per clip, max 512 chars prompt). Output is raw abstract video with web-based CSS text overlay in an iframe player.
- **Deficiencies**:
  - No deterministic timing or frame control.
  - No native animated typography, vector charts, geo-maps, or cutouts.
  - 1-concurrent invocation account bottleneck.
- **Target Replacement**: Full Remotion Studio & Player infrastructure:
  - `src/remotion/Root.tsx`
  - `src/remotion/compositions/MasterComposition.tsx`, `VerticalExplainer.tsx`, `HorizontalExplainer.tsx`
  - `src/remotion/scenes/` (Hook, Editorial, Cutout, Photo, Chart, Map, Timeline, Statistic, Comparison, UIExplainer, Outro)
  - `src/remotion/motion/` (Entrances, Exits, Camera, Typography, Effects, Transitions)
  - `src/remotion/registry/TemplateRegistry.ts`

### 2.4 Database & State Management
- **Supabase**: Active PostgreSQL backend.
- **Existing Tables**: `campaigns`, `episodes`, `platform_posts`, `analytics`, `research_cache`, `live_event_states`, `brain_runs`, `brain_memory`.
- **New Tables Required**:
  - `channel_brand_dna`: Channel visual/motion/typography profiles.
  - `video_specs`: Typed VideoSpec snapshots validated by Zod.
  - `video_storyboards`: Detailed scene-by-scene timing and direction.
  - `render_jobs`: Render lifecycle tracking (QUEUED, PREPARING, RENDERING, UPLOADING, COMPLETED, FAILED).
  - `video_assets`: Asset registry (images, audio, SFX, cutouts, fonts, maps).
  - `video_versions`: Historical versioning and rollback.
  - `production_qa`: Automated QA logs (timing, clipping, missing assets, brand violations).

### 2.5 Storage & Distribution
- **AWS S3**: Bucket `catalyst-videos-759433041913`.
- **Presigned URLs**: Used for secure downloads and preview streams.
- **Ayrshare**: Social publishing integration in `/api/post`.
- **YouTube API**: Competitor intelligence in `/api/research`.

---

## 3. Legacy Dependencies & Migration Plan

| Legacy Component | Path | Current Status | Action |
|---|---|---|---|
| Python Brain | `catalyst_core/brain/` | Standalone Python module | Isolated. Replaced by TS Agent Runtime. |
| Python Server | `_github_clone/server.py` | External reference | Removed from active paths. |
| Nova Reel Video API | `src/app/api/catalyst/generate/*` | Legacy Bedrock video generator | Kept as legacy fallback, bypassed by Remotion pipeline. |
| HTML Iframe Player | `src/app/api/catalyst/preview/*` | Web-rendered iframe | Replaced by native `<Player />` component from `@remotion/player`. |
| HyperFrames references | `src/app/agents/page.tsx` | Simulated logs | Removed and updated to Remotion engine logs. |
| Bedrock text routing | `src/app/api/claude/route.ts` | Bedrock masquerading as Claude | Replaced with native `@anthropic-ai/sdk` client. |

---

## 4. Reusable Code Assets

1. **Next.js Layout & Theme**: `Sidebar.tsx`, `Topbar.tsx`, `globals.css` with sleek dark mode aesthetics.
2. **Campaign Workspace Flow**: `src/app/campaigns/` provides the multi-step navigation.
3. **shadcn/ui Primitives**: Complete base component suite ready in `src/components/ui/`.
4. **SWR State Management**: Pattern established in `src/hooks/`.
5. **AWS S3 Client**: Presigning and bucket utilities ready in `@aws-sdk/client-s3`.
