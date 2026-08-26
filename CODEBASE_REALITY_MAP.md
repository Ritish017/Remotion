# Catalyst Content OS — Codebase Reality Map (Phase 0 Reconnaissance)

**Document Date**: 2026-08-26  
**Audited Directory**: `c:\remotion\Remotion`  
**Git Branch**: `main` (authoritative)  
**Verification Method**: Source code inspection, API probing, build/test execution, render verification.

---

## 1. Actual Architecture

Catalyst Content OS is an AI-orchestrated documentary motion graphics production engine.

```
[ Topic Brief ]
       │
       ▼
[ ResearchOrchestrator ] ──(Firecrawl / Web Evidence / Verified Facts)
       │
       ▼
[ ContentDirector ] ──────(Claude Opus 5: 7-Beat Script + Provenance)
       │
       ▼
[ Audio / Narrator ] ─────(OpenAI TTS + Whisper Word Timestamps)
       │
       ▼
[ ScriptVisualPlanner ] ──(Claude Opus 5: Temporal Script-to-Timeline Beats)
       │
       ▼
[ VisualDirector ] ───────(Multi-Layer VisualPlan + 16 Visual Languages)
       │
       ▼
[ AssetDirector ] ────────(Semantic Resolution + Deterministic AssetCache)
       │
       ▼
[ MotionDirector ] ───────(Semantic Motion Primitives + Camera Physics)
       │
       ▼
[ ProductionAgent ] ──────(VideoSpec v2.0 Assembly & Zod Strict Validation)
       │
       ▼
[ MasterComposition ] ────(Remotion Engine + VisualBeatRenderer + LayerStack)
       │
       ▼
[ Technical & Visual QA ] ─(12-Point Automated QA + Multi-Modal Vision Critic)
       │
       ▼
[ Frame Extraction ] ─────(Percentile Keyframe Audit + Scene MP4 Clips)
       │
       ▼
[ Final Master MP4 ] ─────(1080×1920 @ 30fps H.264 High-Bitrate Export)
```

---

## 2. Entry Points

- **CLI / Automated Production**: `scripts/run-verified-production-pipeline.ts` & `scripts/render-phase6-revised.ts`
- **Next.js Web Application**: `src/app/page.tsx` (Dashboard) & `src/app/studio/page.tsx` (Remotion Production Studio)
- **Remotion Composition Root**: `src/remotion/Root.tsx` (`src/remotion/index.ts`)
  - `MasterComposition` (Authoritative parameterized multi-beat composition)
  - `Phase6RevisedShowcase` (Golden visual quality benchmark)
  - `VerticalExplainer` (9:16 portrait wrapper)
  - `HorizontalExplainer` (16:9 landscape wrapper)
- **API Endpoints**:
  - `src/app/api/catalyst/generate/social/route.ts`
  - `src/app/api/remotion/render/route.ts`
  - `src/app/api/remotion/qa/route.ts`
  - `src/app/api/remotion/spec/route.ts`

---

## 3. AI Pipeline

- **LLM Engine**: Anthropic Claude SDK (`@anthropic-ai/sdk`)
- **Active Model Verification**:
  - `claude-opus-5`: **CONFIRMED WORKING & ACCESSIBLE** (Primary creative director, editorial, visual plan, critique)
  - `claude-sonnet-5`: **CONFIRMED WORKING & ACCESSIBLE** (Fast transformations, captions, metadata)
- **Architecture**: `ModelRouter` (`src/lib/ai/claude/modelRouter.ts`) routes tasks based on cognitive stakes.
- **Robustness**: Structured output repair engine (`src/lib/ai/claude/utils/structuredOutput.ts`) handles markdown fences, JSON trailing commas, and schema repair.

---

## 4. Research Pipeline

- **Source Code**: `src/lib/research/`
  - `ResearchOrchestrator.ts`: Synthesizes evidence dossiers.
  - `ResearchReport.ts`: Structured key metrics, hook recommendations, claims.
  - `ResearchEvidence.ts`, `ResearchFact.ts`, `ResearchSource.ts`: Provenance entities.
- **Integrations**: Firecrawl Provider (`src/lib/providers/research/firecrawl/FirecrawlProvider.ts`) and Apify Provider for live scraping.

---

## 5. Script Pipeline

- **Source Code**: `src/lib/ai/claude/agents/ContentDirector.ts`
- **Functionality**:
  - Enforces strict 7-beat narrative structure: Hook, Context, Data Surge, Geography, Mechanism Explanation, Empirical Payoff, Outro.
  - Generates full spoken transcript, word count budgeting (~2.4 words/sec), and structured fact claim maps.

---

## 6. Storyboard Pipeline

- **Source Code**: `src/lib/ai/claude/agents/StoryboardDirector.ts` & `src/lib/ai/claude/agents/ScriptVisualPlanner.ts`
- **Principle**: `SCRIPT = TIMELINE`.
- **Temporal Decomposition**: Spoken ideas are mapped to micro visual beats with explicit spatial roles (Background, Midground, Subject, Foreground, Typography, Camera, Transition).

---

## 7. VideoSpec Pipeline

- **Source Code**: `src/lib/video-spec/`
  - `types.ts`: Comprehensive TypeScript interfaces for scenes, layers, visual beats, audio, and brand DNA.
  - `schema.ts`: Strict Zod schema enforcing types, non-negative frames, and valid color/motion presets.
  - `validator.ts`: Frame normalization, timing alignment, duration drift correction, and spec repair.
  - `visual.ts` & `visualSystem.ts`: Formal visual language tokens and preset configurations.

---

## 8. Asset Pipeline

- **Source Code**: `src/lib/storage/AssetCache.ts` & `src/lib/assets/registry.ts`
- **Resolution Strategy**:
  1. Local disk assets in `public/`
  2. Curated high-resolution documentary photography registry (`ASSET_REGISTRY`)
  3. Deterministic SHA-256 caching in `storage/assets/`
  4. Vector SVG synthesis fallback for offline/isolated execution

---

## 9. Rendering Pipeline

- **Engine**: Remotion v4.0.517 (`remotion`, `@remotion/cli`, `@remotion/player`)
- **Render Modes**:
  - Local GPU/CPU rendering (`src/lib/rendering/local.ts`) via Remotion CLI / Node child process
  - Remotion Studio live preview (`src/app/studio/page.tsx`)
  - Remotion Lambda (`src/lib/rendering/lambda.ts`) with S3 deployment site configuration

---

## 10. Audio Pipeline

- **Source Code**: `src/lib/audio/narrator.ts` & `src/lib/providers/audio/openai/OpenAIAudioProvider.ts`
- **Engines**:
  - OpenAI TTS (`tts-1-hd` / `nova` / `onyx`) with Whisper timestamp alignment
  - ElevenLabs provider (`src/lib/audio/providers/elevenlabs.ts`)
  - Local synthesizer fallback (`src/lib/audio/providers/synthesizer.ts`)
- **Mixing**: Audio ducking during narration, background music looping, discrete SFX triggering.

---

## 11. Caption Pipeline

- **Source Code**: `src/remotion/components/captions/KaraokeCaptions.tsx` & `src/lib/qa/validators/CaptionQualityValidator.ts`
- **Rendering**: Word-level highlight timing with active pill backgrounds, high contrast, and safe margin compliance.

---

## 12. QA Pipeline

- **Source Code**: `src/lib/qa/`
  - `index.ts`: Orchestrates 12 distinct verification suites (Technical, Rhythm, Cinematic, Human Visual, Camera Bounds, Parallax, Typography, Caption, Audio, Transitions, Diversity).
  - `VisualCriticAgent.ts` (`src/lib/ai/claude/agents/VisualCriticAgent.ts`): Multi-modal vision critic reviewing extracted frame PNGs.

---

## 13. Frontend / Dashboard Pipeline

- **Source Code**: `src/app/`, `src/components/remotion/studio/`
- **Components**:
  - `RemotionProductionStudio.tsx`: Proportional timeline, live Remotion player, scene inspector, Claude iteration drawer, QA visual panels.
  - `Sidebar.tsx`, `NewVideoModal.tsx`, `FinalRenderComparison.tsx`.

---

## 14. Deployment Pipeline

- **Next.js**: Next.js 16 App Router on React 19.
- **Remotion Lambda**: Bundling scripts in `package.json` (`remotion lambda sites create`).
- **Database**: SQLite database provider (`src/lib/database/SQLiteDatabaseProvider.ts`) with schema migrations for local persistence.

---

## 15. Legacy Systems

- **Legacy Python Core**: `catalyst_core/` (fully deleted and migrated to pure TypeScript/Next.js/Remotion).
- **Legacy Flat Templates**: Old static scenes (`HookScene.tsx`, `EditorialScene.tsx`, `ChartScene.tsx`) when run without `visualBeats`.

---

## 16. Duplicate Systems

- `scripts/extract-21-frames.ts`, `scripts/extract-all-11-frames.ts`, `scripts/extract-phase6-21-frames.ts` (all superseded by `scripts/extract-phase6-frames.ts`).
- `src/lib/providers/ai/claude/ClaudeProvider.ts` vs `src/lib/ai/claude/client.ts` (needs unified routing via `ModelRouter`).

---

## 17. Dead / Unreferenced Code

- Deprecated model names (`claude-3-5-sonnet-20241022`, `claude-3-7-sonnet-20250219`, `claude-3-haiku-20240307` which are not provisioned on the current Anthropic key).

---

## 18. Incomplete Systems

- Automatic scene redesign loop (VisualCritic feedback passing directly to SceneRedesignAgent for automated re-render iterations).
- Fallback visual language error throwing in production mode (was silently defaulting to `editorial-paper`).

---

## 19. Currently Working Systems

- **Claude Opus 5 & Sonnet 5 Integration**: 100% verified.
- **VisualBeatRenderer + LayerStack + VisualLanguageRegistry**: 100% functional.
- **Remotion Render Engine**: 100% verified (rendered 1350 frames of 1080×1920 in ~40s).
- **QA Test Suite**: 12/12 test suites passing (`npm test`).
- **Phase 6 Revised Showcase**: High-density editorial documentary output.

---

## 20. Current Authoritative Production Path

```
Topic Input
  ↓
ResearchOrchestrator.conductResearch()
  ↓
ContentDirector.runContentDirector()
  ↓
generateNarration() [Audio + Timestamps]
  ↓
ScriptVisualPlanner.planTimeline()
  ↓
VisualDirector.runVisualDirector()
  ↓
AssetDirector.runAssetDirector() [AssetCache]
  ↓
MotionDirector.runMotionDirector()
  ↓
assembleVideoSpecV2() -> VideoSpec (Validated via Zod)
  ↓
MasterComposition [Remotion]
  ↓
VisualBeatRenderer -> LayerStack -> VisualLanguageRegistry
  ↓
Remotion Render (1080x1920 H.264)
  ↓
Frame Extraction (30+ Keyframes)
  ↓
VisualCriticAgent (Multimodal Vision Feedback)
  ↓
Technical & Visual QA Gate (Score >= 80)
  ↓
Master MP4 Output (storage/qa/e2e/)
```
