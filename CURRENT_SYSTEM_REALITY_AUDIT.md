# Catalyst Remotion Studio — Current State Reality Audit

> **Audit Date:** August 27, 2026  
> **Target Scope:** Entire codebase runtime execution paths, data persistence, AI agent orchestration, Remotion compositions, and UI integration.  
> **Status:** Read-only architectural and operational audit. No source code was modified during this audit.

---

## Executive Reality Check

Catalyst Remotion Studio has successfully integrated a **working local Remotion rendering pipeline**, **Three.js 3D WebGL scenes**, **20+ procedural visual languages**, **multi-style captions**, **official Remotion transitions**, **anti-repetition DNA tracking**, and **Node.js SQLite persistence**. 

However, the codebase currently contains **two distinct evolutionary eras running side by side**:
1. **The Modern Catalyst Remotion Architecture (Phase 4–7 / September 2026 standard):** Uses SQLite (`storage/catalyst.db`), `VideoSpec`, `MasterComposition.tsx`, `VisualBeatRenderer.tsx`, `ThreeDScene.tsx`, `CampaignDirector`, `ProductionAgent`, `local.ts`, and local filesystem storage. **This pipeline is real, executable, and fully tested.**
2. **The Legacy Cloud Engine (Phase 1–3 / AWS / Supabase era):** Uses `@aws-sdk/client-s3`, `@supabase/supabase-js`, Nova Reel video stitching, `live_event_states`, and legacy routes in `/api/catalyst/*` and `/app/social`, `/app/football`, `/app/ai-teaching`. **These paths are dead or broken in local development.**

---

## A. Current Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                               │
├───────────────────────┬──────────────────────────────┬──────────────────────┤
│  Campaign Management  │  Monthly Calendar (30 Days)  │  Episode Studio UI   │
│  /app/campaigns       │  /app/campaigns/[id]         │  /episodes/[epId]    │
└───────────┬───────────┴──────────────┬───────────────┴──────────┬───────────┘
            │                          │                          │
            ▼                          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API ROUTING LAYER                                 │
├──────────────────────────────────────┬──────────────────────────────────────┤
│  /api/campaigns                      │  CRUD Campaigns in SQLite            │
│  /api/campaigns/[id]/calendar        │  Generate 30-Day Calendar & DNA      │
│  /api/campaigns/[id]/episodes/[epId] │  Autonomous Produce Pipeline         │
│  /api/remotion/render                │  Trigger Webpack Bundle & Chromium   │
│  /api/remotion/spec                  │  Claude Live Refinement & Validation │
└──────────────────────────────────────┴──────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AI CREATIVE INTELLIGENCE LAYER                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  ModelHub (models.ts) -> ModelRouter -> Anthropic SDK (Claude 3.7 / 3.5)    │
│  ├── CampaignDirector (Theme, Pillars, 30-Day Topics, Metaphors)           │
│  ├── ContentDirector (7-Beat Investigative Documentary Script)              │
│  ├── StoryboardDirector (Scene Graph, Spatial Depth, Layouts)               │
│  ├── VisualDirector (2.5D Visual Beats, 7-Plane LayerStack, Match-Cuts)     │
│  ├── AntiGenericEngine (Novelty Score vs SQLite Visual Memory Stack)        │
│  ├── AssetDirector & MotionDirector (Asset & Choreography Mapping)          │
│  └── ProductionAgent (assembleVideoSpecV2 -> VideoSpec validation)          │
└──────────────────────────────────────┬──────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUDIO & SYNCHRONIZATION                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  OpenAI TTS-1 / Whisper-1 Word-Level Forced Alignment                      │
│  ├── Fallback: LocalSynthesizerProvider (44.1kHz PCM WAV + Phonetic Clocks) │
│  └── NarrativeTimingAnalyzer (Frame-accurate scene boundary alignment)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      REMOTION COMPOSITION PIPELINE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  MasterComposition.tsx (Root Video Engine)                                  │
│  ├── LayerStack.tsx (7-Plane Spatial Coordinate System with Parallax)       │
│  ├── CameraRig.tsx (Push, Orbit, Whip-Pan, Telephoto, Rack Focus)          │
│  ├── VisualBeatRenderer.tsx (Beat Sequencing & Match-Cut Detection)        │
│  ├── ThreeDScene.tsx (@remotion/three WebGL Silicon Wafer, Synapses, Tokamak)│
│  ├── Visual Languages (20+ Procedural Graphic Renderers)                   │
│  ├── OfficialTransitions.tsx (Film Burn, Linear Blur, Cross Zoom, Push Cut) │
│  ├── DocumentaryCaptions.tsx (Vox, Karaoke Pill, Kinetic Pop, Minimal)     │
│  └── Dynamic Audio Ducking (Voiceover, Looping Music Bed, SFX Triggers)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      LOCAL RENDERING & QA GATE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  @remotion/bundler (Webpack Web bundle) -> @remotion/renderer (Chromium)    │
│  ├── 12-Point Automated QA Gate (Continuity, Density, Typography, Audio)    │
│  ├── Keyframe Extraction (11 Multi-percentage verification frames)          │
│  ├── FFmpeg Stitching (H.264 / AAC 44.1kHz MP4 Output)                      │
│  └── SQLite Database (Storage of video_specs, render_jobs, episode_dna)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## B. Actual Runtime Execution Graph

```mermaid
flowchart TD
    A[Campaign Creation UI] -->|POST /api/campaigns| B[(SQLite: campaigns)]
    B --> C[Generate Month UI]
    C -->|POST /api/campaigns/:id/calendar| D[CampaignDirector Agent]
    D -->|Query Past DNA| E[(SQLite: visual_style_memory)]
    D -->|AntiGenericEngine.calculateNovelty| F{Novelty >= 75%?}
    F -->|No| D
    F -->|Yes| G[(SQLite: 30x episodes)]
    G --> H[Open Episode Workspace]
    H -->|Click 'Auto-Produce'| I[produce/route.ts]
    I --> J[ResearchOrchestrator]
    J --> K[ContentDirector: 7 Beats]
    K --> L[NarrationFactory: TTS + Whisper Alignment]
    L --> M[StoryboardDirector: 7 Scenes]
    M --> N[VisualDirector: 2.5D Beats]
    N --> O[AntiGenericEngine: Verify Episode DNA]
    O --> P[ProductionAgent: assembleVideoSpecV2]
    P --> Q[validateVideoSpec: Auto-Repair]
    Q --> R[(SQLite: video_specs & episode_dna)]
    R --> S[Remotion Live Player In-Browser]
    S -->|Human Tweak / Prompt| T[ClaudeIterationDrawer]
    T -->|POST /api/remotion/spec| S
    S -->|Click 'Render Video'| U[POST /api/remotion/render]
    U --> V[executeLocalRenderAsync]
    V --> W[@remotion/bundler Webpack]
    W --> X[@remotion/renderer Chromium Workers]
    X --> Y[FFmpeg Stitching]
    Y --> Z[storage/renders/jobId/output.mp4]
    Z --> AA[11 Keyframe QA Analysis]
    AA --> AB[(SQLite: render_jobs COMPLETED)]
```

---

## C. Implemented Capabilities (Verified & Operational)

1. **Local Remotion Bundling & Rendering (`src/lib/rendering/local.ts`):**
   - Uses official `@remotion/bundler` with Webpack.
   - Headless Chromium frame rendering via `@remotion/renderer`.
   - Audio URI conversion (base64 PCM/MP3 inline streaming to prevent headless asset drops).
   - Multi-frame QA snapshot extraction (11 percentage-spaced PNGs).
   - Produces verified broadcast-ready MP4s (verified on 3 distinct September episodes).

2. **Procedural 3D WebGL Integration (`src/remotion/visuals/ThreeDScene.tsx`):**
   - Powered by `@remotion/three` and `three`.
   - 3 Procedural WebGL Environments:
     - Silicon Wafer Die with glowing optical interconnects and bus telemetry.
     - Synaptic Neural Graph sphere with animated pulse signals.
     - Toroidal Tokamak Fusion Reactor with glowing plasma ring.
   - Deterministic rotation mapped to Remotion `useCurrentFrame()`.

3. **Official Transitions (`src/remotion/transitions/OfficialTransitions.tsx`):**
   - Integrated into `VisualBeatRenderer.tsx`.
   - Supports: `film-burn`, `linear-blur`, `cross-zoom`, `push-cut`, `dreamy-zoom`, `clock-wipe`, `wipe`, `slide`, `flip`, `dissolve`, and `match-cut`.

4. **Multi-Style Caption System (`src/remotion/components/captions/DocumentaryCaptions.tsx`):**
   - Synchronized with Whisper word timestamp clock.
   - Presets: `vox-editorial`, `karaoke-pill`, `kinetic-pop`, `minimal-bottom`, `word-spotlight`.

5. **2.5D LayerStack & Camera Rig (`src/remotion/composition/LayerStack.tsx` & `CameraRig.tsx`):**
   - 7 spatial planes (`background`, `backgroundMid`, `midground`, `subject`, `foreground`, `typography`, `editorialMarks`).
   - Dynamic parallax scaling based on plane depth.
   - Camera moves: `push`, `pull`, `pan-left`, `pan-right`, `orbit`, `parallax`, `whip-pan`, `zoom-region`.

6. **SQLite Local Persistence (`src/lib/database/SQLiteDatabaseProvider.ts`):**
   - Native Node.js `node:sqlite` in WAL mode.
   - Tables: `campaigns`, `episodes`, `episode_dna`, `visual_style_memory`, `render_jobs`, `video_specs`, `projects`, `channels`.

7. **Anti-Repetition & Novelty Scoring (`src/lib/video-spec/dna.ts`):**
   - 10-dimensional DNA distance algorithm checking visual language, composition, camera, motion, typography, transitions, color palettes, textures, and metaphors.
   - Auto-redesign loops in `CampaignDirector`.

8. **Automated Video QA Engine (`src/lib/qa/index.ts`):**
   - 12-point automated heuristic matrix verifying frame continuity, duration alignment, visual density, camera bounds, and typography scaling.

---

## D. Partially Implemented Capabilities

1. **Autonomous Auto-Repair Loop (`src/lib/qa/autoRepair.ts`):**
   - **Status:** The `AutoRepairController` and `VisualCriticAgent` code exists and is capable of analyzing keyframe PNGs and producing patch objects (`scaleMultiplier`, `cameraIntensity`, `typographyScale`).
   - **Gap:** It is currently a standalone class and is **not automatically triggered** as a post-render self-healing retry loop inside `executeLocalRenderAsync` or the UI.

2. **Episode Workspace Tab Integration (`src/app/campaigns/[id]/episodes/[episodeId]/page.tsx`):**
   - **Status:** The "Video" tab has the "Auto-Produce" button which triggers the complete modern pipeline (`produce/route.ts`).
   - **Gap:** The separate "Research" and "Script" tabs use legacy simulated API calls instead of reading directly from the `VideoSpec` generated by `produce/route.ts`.

3. **Live Web Research (`src/lib/research/ResearchOrchestrator.ts`):**
   - **Status:** Firecrawl and Apify providers are implemented.
   - **Gap:** In development environments without active Firecrawl/Apify API keys, it silently falls back to an internal technical dossier without notifying the user in the UI.

---

## E. Fake / Mock / Hardcoded Paths

| Path / Feature | Location | Reality & Current State |
| :--- | :--- | :--- |
| **Simulated Research Steps** | `src/app/campaigns/[id]/episodes/[episodeId]/page.tsx` (L81-L86) | UI uses `setTimeout(r, 400)` and `setTimeout(r, 200)` to simulate search steps. |
| **Legacy S3 / Nova Reel Preview** | `src/app/api/catalyst/preview/[jobId]/route.ts` | Generates signed S3 URLs for AWS Nova Reel clips; fails if AWS S3 bucket is unavailable. |
| **Hardcoded Topic Metaphors Fallback** | `src/lib/ai/claude/agents/CampaignDirector.ts` (L294-L305) | When Claude API key is unavailable, cycles through 10 hardcoded engineering metaphors using `(dayIndex - 1) % 10`. |
| **Audio Synthesizer Fallback** | `src/lib/audio/providers/synthesizer.ts` | When `OPENAI_API_KEY` is missing, generates pure silence WAV buffer with estimated word timestamps. |
| **Sample Spec Fallback** | `src/app/api/remotion/render/route.ts` (L58) | In non-production environments, falls back to `SAMPLE_SHOWCASE_SPEC` if request body is empty. |

---

## F. Dead / Legacy Code

The following modules belong to the previous cloud architecture and are superseded by the Remotion pipeline:

1. **`src/app/api/catalyst/generate/social/route.ts`** — Old Supabase + Nova Reel generator.
2. **`src/app/api/catalyst/generate/sports/preview/route.ts`** — Legacy sports highlights generator.
3. **`src/app/api/catalyst/generate/tutorial/route.ts`** — Legacy tutorial generator.
4. **`src/app/api/catalyst/preview/[jobId]/route.ts`** — S3 MP4 segment preview player.
5. **`src/app/api/catalyst/download/[jobId]/route.ts`** — S3 presigned downloader.
6. **`src/app/api/catalyst/status/[jobId]/route.ts`** — Supabase status checker.
7. **`src/app/social/page.tsx`** — Deprecated social branding UI.
8. **`src/app/football/page.tsx`** — Deprecated football highlights UI.
9. **`src/app/ai-teaching/page.tsx`** — Deprecated AI teaching UI.
10. **`src/lib/ai/claude/agents/ScriptVisualPlanner.ts`** — Orphaned; superseded by `VisualDirector.ts`.
11. **`src/lib/ai/claude/agents/StoryFirstVisualMapper.ts`** — Orphaned; superseded by `ContentDirector.ts`.

---

## G. Missing Integrations

1. **Auto-Repair in Production Render Pipeline:**
   - `executeLocalRenderAsync` extracts 11 QA frames, but does not invoke `autoRepairController.executeRepairLoop` to automatically re-render if visual quality falls below 8.0.
2. **Episode Workspace Unified State:**
   - Research, Script, Storyboard, and Video tabs should all bind to a single reactive `VideoSpec` record in SQLite rather than having disconnected form states.
3. **Official Remotion Reference Upgrades:**
   - 136 packages exist in `official-remotion/`. We should selectively integrate `@remotion/noise` (procedural organic grain), `@remotion/google-fonts` (runtime font loader), and `@remotion/motion-blur` (cinematic camera shutter).

---

## H. Critical Bugs

1. **`UNIQUE constraint failed` on SQLite Upserts:**
   - **Root Cause:** Raw `INSERT INTO` statements failed when regenerating a campaign or render job with an existing ID.
   - **Status:** Fixed during test runs by switching to `INSERT OR REPLACE INTO` in `SQLiteDatabaseProvider.ts`.
2. **Transition Schema Enum Mismatch:**
   - **Root Cause:** `TransitionBeatConfigSchema` lacked official transition IDs (`film-burn`, `linear-blur`, `cross-zoom`, `push-cut`, `dreamy-zoom`, `clock-wipe`).
   - **Status:** Resolved in `visual.ts` and `schema.ts`.
3. **Audio Dropping in Webpack Bundle:**
   - **Root Cause:** Headless Chromium rendering fails to load relative `/audio/*.mp3` URLs because the local web server is not accessed during static bundle execution.
   - **Status:** Resolved in `local.ts` by converting audio tracks into self-contained base64 data URIs before bundle execution.

---

## I. Technical Risks

1. **Chromium Concurrency on High Frame Counts:**
   - Long videos (60s+ = 1800+ frames) with Three.js 3D WebGL scenes can exhaust GPU context memory if Chromium worker concurrency is set too high.
2. **Model API Rate Limits on Full 30-Day Batch Generation:**
   - Generating 30 full VideoSpecs in parallel without rate limiting could trigger Claude API 429 throttling.

---

## J. Creative-Quality Risks

1. **Metaphor Repetition in Fallback Mode:**
   - If Claude API is offline, the deterministic fallback repeats metaphors after 10 days.
2. **Audio Monotony:**
   - Relying on a single voiceover voice (e.g. `onyx`) across an entire 30-day campaign without voice variety can cause listener fatigue.

---

## K–O. Workflow Gaps Matrix

| Domain | Gap Description | Impact | Recommended Solution |
| :--- | :--- | :--- | :--- |
| **K. Campaign Workflow** | No bulk export for 30 rendered videos. | Low | Add a "Batch Export All 30 Episodes" queue button. |
| **L. Calendar Workflow** | Calendar grid lacks a "Render Entire Month" one-click action. | Medium | Add batch render scheduler iterating through all 30 days. |
| **M. Episode Workflow** | Research and Script tabs in UI do not sync bidirectionally with VideoSpec. | Medium | Refactor episode page tabs to read/write from unified SQLite VideoSpec. |
| **N. Visual Variation** | 3D scenes currently have 3 presets (Wafer, Synapse, Tokamak). | Low | Add 3 more 3D WebGL presets (Robotic Arm, Supercomputer Rack, Satellite Orbit). |
| **O. Production Rendering** | Auto-repair does not trigger automatically on render completion. | Medium | Wire `autoRepairController` into `createLocalRenderJob`. |

---

## P. Exact Recommended Implementation Order

```
[Phase 1: Cleanup & Unified State]
  ├── Step 1: Remove or isolate legacy S3/Supabase routes in /api/catalyst/*
  └── Step 2: Unify Episode Workspace tabs to bind to SQLite VideoSpec

[Phase 2: Closed-Loop Auto-Repair Integration]
  ├── Step 3: Wire AutoRepairController into executeLocalRenderAsync
  └── Step 4: Add Visual Critic feedback cards to the Studio QA Panel

[Phase 3: Visual & 3D Expansion]
  ├── Step 5: Add 3 additional 3D WebGL environments to ThreeDScene.tsx
  └── Step 6: Integrate @remotion/noise and @remotion/motion-blur

[Phase 4: Full Month Batch Production Engine]
  ├── Step 7: Build Batch Render Queue in Calendar UI
  └── Step 8: Multi-platform export packaging (Shorts, Reels, TikTok, X)
```

---

## Prioritized Action List

### P0 — Must Fix Before Real Campaign Production
- [x] Ensure `SQLiteDatabaseProvider.ts` uses `INSERT OR REPLACE` across all tables.
- [x] Ensure all official transition types are valid in `VideoSpecSchema`.
- [x] Ensure audio tracks resolve to base64 data URIs during headless Chromium rendering.
- [ ] Connect Episode Workspace Research & Script tabs directly to SQLite `VideoSpec` instead of legacy mock endpoints.

### P1 — Required for Reliable Production
- [ ] Wire `AutoRepairController` into `executeLocalRenderAsync` for automatic keyframe inspection and auto-patching.
- [ ] Deprecate and isolate legacy `/api/catalyst/*` S3/Supabase routes.
- [ ] Implement Batch 30-Day Render Queue for full monthly calendar exports.

### P2 — Quality Improvements
- [ ] Add 3 more Three.js WebGL scenes (Robotic Arm, Supercomputer Server Rack, Orbital Satellite).
- [ ] Integrate `@remotion/noise` for procedural organic paper grain and halftone shaders.
- [ ] Support multi-voice rotation across content pillars (e.g. `onyx` for tech, `echo` for science, `fable` for futures).

### P3 — Future & Cloud Features
- [ ] Remotion Lambda distributed rendering configuration for sub-60-second cloud exports.
- [ ] Multi-platform social publishing webhooks (YouTube Shorts API, TikTok Content Posting API).
