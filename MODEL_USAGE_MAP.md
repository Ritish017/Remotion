# CATALYST CONTENT OS — MODEL USAGE & AI PROVIDER MAP

> **Authoritative AI Provider & Model Verification Document**  
> **Repository:** `Ritish017/Remotion`  
> **Timestamp:** August 2026 / Local Production Mode  
> **Verification Standard:** Code-traced across `src/lib/providers/`, `src/lib/ai/`, `src/app/api/`, `.env`, and `scripts/`.

---

## 1. Executive Summary of Models in Codebase

Catalyst Content OS utilizes a multi-model, multi-provider AI architecture organized into primary, fast, multimodal, and audio intelligence layers.

```
+---------------------------------------------------------------------------------------+
|                                    TASK ROUTER                                        |
+---------------------------------------------------------------------------------------+
         |                                |                            |
         v                                v                            v
+------------------+             +------------------+         +------------------+
|  ANTHROPIC       |             |  OPENAI          |         |  GOOGLE GEMINI   |
|  (Scripting,     |             |  (Narration &    |         |  (Multimodal,    |
|   Storyboard,    |             |   Whisper Word   |         |   Visual Quality |
|   VideoSpec, QA) |             |   Timestamps)    |         |   & Fallback)    |
+------------------+             +------------------+         +------------------+
```

---

## 2. Complete Model Matrix

| Provider | Model Identifier | Configured Env Var | Source Location / Files | Role & Responsibility | Fallback Mechanism | Verified in Code |
|---|---|---|---|---|---|---|
| **Anthropic** | `claude-sonnet-4-5-20250929` / `claude-3-5-sonnet-latest` | `ANTHROPIC_MODEL_PRIMARY` / `CLAUDE_PRIMARY_MODEL` | `src/lib/providers/ai/claude/config.ts`<br>`src/lib/ai/claude/client.ts`<br>`src/lib/ai/claude/agents/*.ts` | Primary creative reasoning, 7-beat documentary scriptwriting, narrative pacing, and VideoSpec assembly. | Google Gemini Flash / Deterministic script generator | **YES** |
| **Anthropic** | `claude-haiku-4-5-20251001` / `claude-3-5-haiku-latest` | `ANTHROPIC_MODEL_FAST` / `CLAUDE_FAST_MODEL` | `src/lib/providers/ai/claude/config.ts`<br>`src/lib/ai/claude/client.ts`<br>`src/app/api/research/route.ts`<br>`src/app/api/remotion/spec/route.ts` | High-speed structured JSON parsing, real-time UI scene modifications in studio, metadata tagging. | Internal regex repair / deterministic templates | **YES** |
| **Anthropic** | `claude-opus-5-20251101` / `claude-3-opus-20240229` | `ANTHROPIC_MODEL_OPUS` | `src/lib/ai/claude/agents/ScriptVisualPlanner.ts`<br>`src/lib/ai/claude/agents/VisualCriticAgent.ts` | Script-to-timeline deep visual decomposition (16 visual families) and multi-modal frame critique of rendered PNGs. | Sonnet 3.5 / Automated rule-based QA | **YES** |
| **OpenAI** | `tts-1` / `tts-1-hd` (Voice: `onyx`) | `OPENAI_TTS_MODEL` | `src/lib/providers/audio/openai/OpenAIAudioProvider.ts`<br>`src/lib/audio/narrator.ts` | High-fidelity editorial text-to-speech audio synthesis for all scenes. | Local silent WAV synthesizer with speech estimation | **YES** |
| **OpenAI** | `whisper-1` (`verbose_json`, `word` timestamps) | `OPENAI_TRANSCRIPTION_MODEL` | `src/lib/providers/audio/openai/OpenAIAudioProvider.ts`<br>`src/lib/audio/narrator.ts` | Forced-alignment speech-to-text generating millisecond start/end timestamps for every spoken word. | Heuristic word timing based on speech rate (140 wpm) | **YES** |
| **OpenAI** | `gpt-4o-mini` / `gpt-4o` | `OPENAI_MODEL_PRIMARY` | `src/lib/providers/ai/openai/OpenAIProvider.ts` | Standalone OpenAI provider for general text generation and alternative script synthesis. | Claude Sonnet / Gemini | **YES** |
| **Google** | `gemini-3.7-flash` / `gemini-2.5-flash` / `gemini-1.5-flash` | `GOOGLE_GEMINI_MODEL` | `src/lib/providers/ai/gemini/GeminiProvider.ts`<br>`src/lib/providers/ai/gemini/config.ts` | Fast secondary multimodal reasoning, visual asset analysis, and AI fallback provider via REST API. | Anthropic Claude | **YES** |
| **AWS Bedrock** | `amazon.nova-reel-v1:0` | `BEDROCK_MODEL_ID` | `src/lib/video-generation.ts`<br>`src/app/api/catalyst/jobs/route.ts`<br>`src/app/api/catalyst/generate/*` | *(Legacy Cloud Engine)* Async text-to-video / image-to-video 6-second segment generator. | None (Legacy cloud path) | **YES** |
| **HeyGen** | `v2/video/generate` (Avatar API) | `HEYGEN_API_KEY` | `src/lib/providers/presenter/heygen/HeyGenProvider.ts` | Optional talking-head presenter avatar video overlay. | Pure motion graphics mode | **YES** |
| **Vapi** | Conversational Voice AI | `VAPI_API_KEY` | `src/lib/providers/voice/vapi/VapiProvider.ts` | Voice control assistant interface for conversational editing. | Web UI buttons | **YES** |

---

## 3. Deep Dive into Provider Implementations

### 1. Anthropic Claude Engine
- **SDK:** `@anthropic-ai/sdk` version `0.104.1`.
- **Client Configuration:** `src/lib/providers/ai/claude/ClaudeProvider.ts` and `src/lib/ai/claude/client.ts`.
- **Invocation Helper:** `callClaudeStructured<T>` (`src/lib/ai/claude/structuredOutput.ts`) provides:
  - System prompt injection.
  - Temperature control (0.2–0.4 for deterministic structured JSON).
  - Built-in JSON block stripping (```json ... ```) and `repairJsonString()` regex parser for trailing commas and unescaped quotes.
  - Exponential backoff retry loop (3 attempts).
- **Deterministic Fallback:** If `ALLOW_DEMO_FALLBACK=true` (or when Anthropic API key is absent), agent functions (`runContentDirector`, `runStoryboardDirector`, `runVisualDirector`) gracefully return hardcoded deterministic engineering dossiers (e.g. *Silicon Breakthrough*, *Fintech Infrastructure*, *Autonomous Robotics*).

### 2. OpenAI Narration & Whisper Alignment Engine
- **SDK:** `openai` version `4.73.0`.
- **Provider Location:** `src/lib/providers/audio/openai/OpenAIAudioProvider.ts`.
- **Two-Step Narration Pipeline:**
  1. `client.audio.speech.create({ model: 'tts-1', voice: 'onyx', input: transcript, response_format: 'mp3' })`: Returns MP3 audio binary.
  2. `client.audio.transcriptions.create({ file: toFile(buffer), model: 'whisper-1', response_format: 'verbose_json', timestamp_granularities: ['word'] })`: Returns exact word start and end offsets in seconds.
- **Remotion Integration:** Words are formatted into `WordTimestamp[]` (`{ word, start, end, duration }`) passed into `VideoSpec.narration.words` for frame-accurate karaoke subtitle rendering in Remotion (`KaraokeCaptions.tsx`).

### 3. Google Gemini Engine
- **Implementation:** Native REST fetch against `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}` (`src/lib/providers/ai/gemini/GeminiProvider.ts`).
- **Configuration:** `src/lib/providers/ai/gemini/config.ts`.
- **Features:** Supports multimodal image payload analysis, temperature tuning, and system instructions.

### 4. Specialized Tool Providers
- **Firecrawl (`FirecrawlProvider.ts`):** Fetches clean markdown web content from `https://api.firecrawl.dev/v1/search` and `scrape`.
- **Apify (`ApifyProvider.ts`):** Executes Google Search datasets and Twitter scrapers via Apify Client.
- **Resend (`ResendEmailProvider.ts`):** Sends transactional emails when local video renders complete via `https://api.resend.com/emails`.
