# LEGACY MIGRATION PLAN — CATALYST CONTENT OS

**Date:** 2026-08-25  
**Version:** 1.0.0  
**Target:** Pure TypeScript / Next.js / Remotion / Claude AI / Supabase / S3 Production Stack

---

## 1. Migration Overview

This document tracks all legacy and obsolete subsystems, detailing their current role, replacement architecture, migration status, and retirement schedule.

| Component | Current Purpose | Replacement | Status | Removal Plan |
|---|---|---|---|---|
| `catalyst_core/` (Python) | APScheduler & background python loop | TypeScript AI Agents & Next.js cron/API | Isolated | Non-blocking archive |
| `FastAPI server.py` (`http://127.0.0.1:8000`) | Legacy local Python endpoints in `src/lib/api.ts` | Next.js API Routes (`/api/*`) | Deprecated | Redirect all client calls to internal `/api` |
| `Nova Reel` Video Generator | Sequential 6-sec text-to-video | Remotion React Motion Engine + Remotion Lambda | Migrating | Retain as secondary asset generator if needed, remove from primary pipeline |
| HTML Iframe Preview | `src/app/api/catalyst/preview/[jobId]` | `@remotion/player` React Player | Migrating | Upgrade `VideoPlayer.tsx` to use Remotion Player |
| Bedrock Text Routing | `src/app/api/claude/route.ts` using Bedrock | Native `@anthropic-ai/sdk` with Claude 3.5 models | Migrating | Switch to `src/lib/ai/claude/client.ts` |
| HyperFrames / GSAP | Mock mentions in agent logs and prompts | Remotion Motion OS primitives | Removed | Updated to Remotion nomenclature |

---

## 2. Component Migration Specifications

### 2.1 Video Rendering Engine Migration
- **Old System**:
  - Request → Bedrock Nova Reel `StartAsyncInvokeCommand`
  - Polling every 12s for MP4 output
  - Iframe preview layering HTML text on top of MP4
- **New System**:
  - Request → Claude AI creates structured `VideoSpec` (validated by Zod)
  - Interactive preview via `<Player />` component from `@remotion/player`
  - Production rendering via Remotion Lambda / CLI → MP4 → S3 bucket
  - Frame-accurate audio, captions, transitions, 3-layer scenes (Background, Midground, Foreground)

### 2.2 AI Engine Migration
- **Old System**:
  - Bedrock `ConverseCommand` with custom system prompt string concatenation
  - Unvalidated JSON parsing with markdown stripping
- **New System**:
  - Centralized Anthropic SDK in `src/lib/ai/claude/`
  - Strongly typed agents with Zod validation
  - Director roles: Content Director, Storyboard Director, Visual Director, Production Agent, QA Agent
  - Controlled tool execution loop

### 2.3 Frontend Workspace Migration
- **Old System**:
  - Episode workspace tab 3 loaded an iframe showing a static HTML page
- **New System**:
  - Episode workspace tab 3 loads the Remotion Production Studio with timeline scrubber, live composition selection, aspect ratio toggle (9:16, 16:9, 1:1), and AI Production Assistant sidebar.
