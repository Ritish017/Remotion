# Phase 3 Codebase Audit — Catalyst Content OS

**Audit Date**: 2026-08-26  
**Auditor**: Catalyst Content OS Hardening Agent  
**Scope**: Full repository (`src/`, `scripts/`, `storage/`, `remotion.config.ts`, `next.config.ts`, `.env.example`)  

---

## 1. Executive Summary

This audit identifies all fallback paths, mock handlers, hardcoded values, deprecated model references, and potential false success triggers to transition Catalyst from a single showcase demo to a hardened, enterprise-grade production engine.

---

## 2. Classified Findings Matrix

| Finding ID | Component / File | Description | Severity | Remediation Plan |
|---|---|---|---|---|
| **AUD-01** | `src/lib/providers/ai/claude/config.ts` & `client.ts` | Obsolete/placeholder model identifiers (`claude-sonnet-4-5-20250929`). Missing standardized `CLAUDE_MODEL` env variable. | 🔴 **CRITICAL** | Standardize on `CLAUDE_MODEL` with fallback to `ANTHROPIC_MODEL_PRIMARY` (defaulting to `claude-3-5-sonnet-latest`). |
| **AUD-02** | `src/lib/ai/claude/agents/*` | `allowDemoFallback` silently catches API errors and returns hardcoded silicon scripts. In production, this can hide API auth/rate-limit failures. | 🔴 **CRITICAL** | Fail fast in production mode. If Anthropic or OpenAI fails, return structured error and mark job `FAILED` in SQLite. Only permit explicit opt-in demo mode in dev. |
| **AUD-03** | `src/lib/audio/narrator.ts` | Local tone synthesizer fallback emits `.wav` when OpenAI key is absent. If marked production, it must fail explicitly instead of silently succeeding with tones. | 🔴 **CRITICAL** | Require real OpenAI TTS/Whisper in production (`NARRATION_MODE=production`), failing with clear actionable guidance if keys are invalid. |
| **AUD-04** | `src/lib/rendering/local.ts` | Job marked `COMPLETED` before verifying MP4 file size, playability, and frame count via ffprobe/fs stat. | 🔴 **CRITICAL** | Verify output file existence, non-zero byte size, and duration before transitioning SQLite status to `COMPLETED`. |
| **AUD-05** | `src/lib/video-spec/types.ts` & `visual.ts` | VideoSpec v2 metadata lacks formal research fact provenance (`claimId`, `sourceId`, `factId`, `factConfidence`, `sourceCitation`). | 🟡 **HIGH** | Add research provenance metadata to `VideoSpec`, `SceneData`, `DataStory`, and `TechnicalDiagram`. |
| **AUD-06** | `src/lib/storage/AssetCache.ts` | Asset cache generates SVG vector stubs on demand but does not validate image dimensions, MIME type, or reject corrupt/0-byte downloads. | 🟡 **HIGH** | Implement `sha256` content hashing, dimension extraction, MIME checking, and reject 0-byte/HTML masquerading assets. |
| **AUD-07** | `src/lib/qa/index.ts` | QA scoring only evaluates structural JSON parameters without inspecting rendered frames or camera/layer boundary collisions. | 🟡 **HIGH** | Implement `CameraBoundsValidator`, `ParallaxQualityValidator`, `TypographyValidator`, `CaptionQualityValidator`, and actual frame QA in `scripts/inspect-video.ts`. |
| **AUD-08** | `src/remotion/compositions/MasterComposition.tsx` | Platform aspect ratio presets (`YouTubeLandscape`, `YouTubeShorts`, `InstagramReels`, `InstagramSquare`) need explicit safe-zone enforcement. | 🟢 **MEDIUM** | Implement platform presets with safe-zone guides and UI exclusion bounding boxes. |
| **AUD-09** | `src/app/api/post/route.ts` & `src/app/generate/page.tsx` | Legacy mock endpoints from early prototype stage. | 🟢 **LOW** | Clean up or guard behind production environment checks. |
| **AUD-10** | `src/lib/rendering/local.ts` | Render concurrency was hardcoded to 4 without reading `REMOTION_CONCURRENCY` env or detecting available CPU cores. | 🟢 **MEDIUM** | Add dynamic CPU detection and configurable `REMOTION_CONCURRENCY` env option. |

---

## 3. Detailed File Audits

### 3.1 AI Agents (`src/lib/ai/claude/agents/`)
- **ContentDirector.ts**: Contains deterministic fallback script for "The Silicon Breakthrough". Must strictly throw when `ALLOW_DEMO_FALLBACK` is false.
- **StoryboardDirector.ts**: Contains 7-scene fallback timeline. Must enforce strict schema parsing and retry on malformed JSON.
- **VisualDirector.ts**: Contains 14-beat fallback plan. Must enforce Zod validation with auto-repair and retry prompt before failure.
- **AssetDirector.ts** & **MotionDirector.ts**: Deterministic resolution pipeline verified, but requires research fact provenance tagging.
- **ProductionAgent.ts**: Orchestrates assembly and Whisper timestamp sanitization. Verified monotonic word ordering, needs strict audio duration matching.

### 3.2 Storage & Database (`src/lib/storage/`, `src/lib/database/`)
- **SQLiteDatabaseProvider.ts**: Uses native Node.js SQLite (`node:sqlite`). Database schema verified with WAL mode. Jobs persist across server restarts.
- **LocalStorageProvider.ts**: Verified local storage under `./storage/` with 10 dedicated subdirectories.

### 3.3 Remotion Components (`src/remotion/`)
- **LayerStack.tsx & Parallax.tsx**: 5-plane depth system (0.15x to 1.50x) verified.
- **CameraRig.tsx**: 14 camera movement types verified. Needs bounded coordinate clamps to prevent off-screen drifting.
- **VisualLanguageRegistry.tsx**: 22 visual languages verified.
- **MasterComposition.tsx**: Audio ducking and word-level karaoke captions verified.

---

## 4. Next Steps for Phase 3 Hardening

1. Implement strict environment and model validation (`CLAUDE_MODEL`).
2. Harden all Claude agents with Zod validation, JSON auto-repair, and strict retry loops.
3. Integrate research fact provenance into VideoSpec v2.
4. Implement specialized QA validators (CameraBounds, Parallax, Typography, Captions, Audio).
5. Build `scripts/inspect-video.ts` and automated frame QA.
6. Execute 3 independent multi-topic showcase renders (AI Chips, Robotics, Fintech) in 60–90s documentary format.
