# LEGACY MIGRATION PLAN & RETIREMENT RECORD — CATALYST CONTENT OS

**Date:** 2026-08-25  
**Version:** 2.0.0 (Production Hardened)  
**Target Architecture:** 100% TypeScript / Next.js 16 / Remotion 4 / Claude 3.5 & 4.5 / Supabase / AWS S3 & Remotion Lambda

---

## 1. Migration Audit Summary

All legacy and obsolete subsystems have been fully migrated or retired from the production codebase. No Python runtimes, Bedrock video APIs, or simulated fallbacks remain in the active application tree.

| Component | Legacy Role | Production Replacement | Status | Final Action |
|---|---|---|---|---|
| `catalyst_core/` (*.py) | APScheduler & legacy python loops | TypeScript AI Agents, Next.js cron & routes | Removed | Completely removed from repository |
| `FastAPI server.py` (`:8000`) | Local Python endpoints | Next.js API Routes (`/api/*`) | Retired | Client calls unified to internal Next.js API |
| `@aws-sdk/client-bedrock-runtime` | Amazon Nova Reel / Bedrock text video | Remotion Motion Engine + Remotion Lambda | Removed | Package uninstalled; imports refactored |
| Nova Reel Video API | Text-to-video segment generation | Remotion MasterComposition & Lambda | Replaced | Multi-layer Remotion templates with exact frames |
| HTML Iframe Preview | Iframe layering HTML text | `<Player />` component from `@remotion/player` | Replaced | Remotion Production Studio with timeline scrubber |
| Local Synthesizer / Fake Speech | Offline audio synth fallback in production | OpenAI TTS (`tts-1`) + Whisper Word Timestamps + S3 | Hardened | Production TTS failure strictly throws error |
| Fake S3 Presigned URL Fallback | Presigned URLs for unrendered keys / local MP4 | Remotion Lambda polling + S3 HeadObject verification | Hardened | Strict verification before COMPLETED status |
| Hardcoded Script Fallback | "The Silicon Breakthrough" on Claude failure | 3-tier Claude structured retry & typed error | Hardened | Errors propagate to user; zero false content |

---

## 2. Production Architecture Specifications

### 2.1 Video Rendering Engine
- **Request Flow**: `User / API` → `VideoSpec (Zod-validated)` → `Remotion Lambda` → `S3 Cloud Storage` → `HeadObject Verification` → `Signed Download URL`.
- **Frame Accuracy**: Real voiceover audio duration controls timeline length (`Math.round(durationSeconds * fps)`).
- **Exact End**: All scenes scaled proportionally, with the final scene ending precisely at `composition.durationInFrames`.

### 2.2 AI & Research Pipeline
- **Orchestration**: `Topic` → `ResearchOrchestrator (Firecrawl / Apify)` → `Evidence Dossier` → `Claude ContentDirector` → `Claude StoryboardDirector` → `OpenAI Audio (TTS + Whisper)` → `ProductionAgent` → `Automated QA` → `Remotion Lambda`.
- **Resilience**: Claude structured outputs use 3-attempt resilience (Parse → Repair → Stricter Retry → Typed Error).
- **Authentication**: All providers use standard HTTP headers (`Authorization: Bearer ...`, `x-goog-api-key`), with zero tokens in URLs or query strings.
