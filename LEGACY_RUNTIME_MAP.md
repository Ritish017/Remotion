# Catalyst Content OS — Legacy & Runtime Path Classification

**Status**: AUDITED & CLASSIFIED  
**Codebase Root**: `c:\remotion\Remotion`

---

## 1. Classification Overview

| Category | Definition | Action |
| :--- | :--- | :--- |
| **ACTIVE** | Core production pipeline components in current active use | Preserve, maintain, and harden |
| **MIGRATION** | Components bridging legacy structures to VisualBeat architecture | Maintain fallback with explicit developer warnings |
| **LEGACY** | Historical single-layer scene renderers superseded by VisualBeatRenderer | Mark as legacy / development only |
| **DEAD** | Unreachable files or obsolete scripts | Safe cleanup |
| **DUPLICATE** | Redundant implementations of identical functionality | Consolidate into single authoritative module |
| **EXPERIMENTAL** | Research prototypes or alternate showcases | Isolate for benchmarking |

---

## 2. Detailed Component Inventory

### 2.1 AI & Agent Pipeline
- `src/lib/ai/claude/modelRouter.ts`: **ACTIVE** (Directs Claude Opus 5 & Sonnet 5).
- `src/lib/ai/claude/client.ts`: **ACTIVE** (Anthropic SDK lazy client & structured output proxy).
- `src/lib/ai/claude/agents/ContentDirector.ts`: **ACTIVE** (7-beat script generation & research claims).
- `src/lib/ai/claude/agents/ScriptVisualPlanner.ts`: **ACTIVE** (Script-to-timeline beat decomposition).
- `src/lib/ai/claude/agents/VisualDirector.ts`: **ACTIVE** (Multi-layer visual plan synthesis).
- `src/lib/ai/claude/agents/AssetDirector.ts`: **ACTIVE** (Semantic asset resolution & AssetCache).
- `src/lib/ai/claude/agents/MotionDirector.ts`: **ACTIVE** (Semantic motion primitives & camera plans).
- `src/lib/ai/claude/agents/ProductionAgent.ts`: **ACTIVE** (VideoSpec assembly & Zod validation).
- `src/lib/ai/claude/agents/VisualCriticAgent.ts`: **ACTIVE** (Multimodal vision frame evaluation).
- `src/lib/ai/claude/agents/StoryboardDirector.ts`: **MIGRATION** (Bridging classic storyboard format to VisualPlans).
- `src/lib/ai/claude/agents/NarrativeTimingAnalyzer.ts`: **ACTIVE** (Word timestamp emphasis extraction).

### 2.2 Remotion Compositions & Renderers
- `src/remotion/composition/VisualBeatRenderer.tsx`: **ACTIVE** (Authoritative multi-beat scene renderer).
- `src/remotion/composition/LayerStack.tsx`: **ACTIVE** (Multi-layer spatial parallax and camera rig).
- `src/remotion/visuals/VisualLanguageRegistry.tsx`: **ACTIVE** (Registry for 16 editorial visual languages).
- `src/remotion/compositions/MasterComposition.tsx`: **ACTIVE** (Authoritative production entry point).
- `src/remotion/compositions/Phase6RevisedShowcase.tsx`: **EXPERIMENTAL / BENCHMARK** (Visual benchmark composition).
- `src/remotion/compositions/VerticalExplainer.tsx`: **ACTIVE** (9:16 portrait composition).
- `src/remotion/compositions/HorizontalExplainer.tsx`: **ACTIVE** (16:9 landscape composition).
- `src/remotion/scenes/HookScene.tsx` & other standalone scenes: **LEGACY / MIGRATION** (Used as fallback when scenes lack visualBeats).

### 2.3 Storage & Persistence
- `src/lib/storage/AssetCache.ts`: **ACTIVE** (Deterministic asset resolver & SVG synthesizer).
- `src/lib/storage/LocalStorageProvider.ts`: **ACTIVE** (Disk storage provider).
- `src/lib/database/SQLiteDatabaseProvider.ts`: **ACTIVE** (Local SQLite persistence).

### 2.4 QA & Validation
- `src/lib/qa/index.ts`: **ACTIVE** (12-suite automated QA engine).
- `src/lib/video-spec/validator.ts`: **ACTIVE** (Zod validator and auto-repair engine).

### 2.5 Obsolete & Redundant Scripts
- `scripts/extract-21-frames.ts`: **DEAD** (Superseded by `scripts/extract-phase6-frames.ts`).
- `scripts/extract-all-11-frames.ts`: **DEAD** (Superseded).
- `scripts/extract-phase6-21-frames.ts`: **DEAD** (Superseded).
