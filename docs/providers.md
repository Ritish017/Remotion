# Catalyst Verified Provider Architecture

## Overview
Catalyst Content OS utilizes a decoupled, modular provider architecture located in `src/lib/providers/`.

---

## 1. Primary Creative Intelligence: Anthropic Claude
- **Status**: 🟢 **VERIFIED ACTIVE**
- **Models**: `claude-sonnet-4-5-20250929` (Primary), `claude-haiku-4-5-20251001` (Fast Iteration)
- **Role**:
  - `ContentDirector`: Scriptwriting, documentary narrative structure, research synthesis.
  - `StoryboardDirector`: Vox-style scene selection, camera choreography, and visual pacing.
  - `ProductionAgent`: Unified Zod `VideoSpec` compilation.
  - `ProductionAssistant`: Live natural-language scene modifications (`scene_update`, `scene_reorder`).
- **Environment Variables**:
  ```bash
  ANTHROPIC_API_KEY=sk-ant-...
  ANTHROPIC_MODEL_PRIMARY=claude-sonnet-4-5-20250929
  ANTHROPIC_MODEL_FAST=claude-haiku-4-5-20251001
  ```

---

## 2. Secondary Multimodal Intelligence: Google Gemini
- **Status**: 🟢 **AUTHENTICATED / ACTIVE**
- **Models**: `gemini-3.7-flash` (Primary GA), `gemini-2.5-flash`
- **Role**:
  - Screenshot and visual asset analysis.
  - Multimodal concept evaluation and moodboard extraction.
  - Secondary fact-checking.
- **Environment Variables**:
  ```bash
  GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
  GEMINI_MODEL_PRIMARY=gemini-3.7-flash
  GEMINI_MODEL_FAST=gemini-2.5-flash
  ```

---

## 3. Production Audio & Transcription: OpenAI
- **Status**: 🟢 **VERIFIED ACTIVE**
- **Models**: `tts-1` / `tts-1-hd` (Voice: `onyx`), `whisper-1` (Transcription & Alignment)
- **Role**:
  - Real high-definition neural voiceover generation.
  - Real word-level timestamps obtained directly from audio via Whisper.
  - Synchronized karaoke captions with millisecond precision.
- **Environment Variables**:
  ```bash
  OPENAI_API_KEY=sk-proj-...
  OPENAI_MODEL_PRIMARY=gpt-4o-mini
  OPENAI_TTS_MODEL=tts-1
  OPENAI_TRANSCRIPTION_MODEL=whisper-1
  ```

---

## 4. Web Extraction & Research: Firecrawl
- **Status**: 🟢 **VERIFIED ACTIVE**
- **Role**:
  - Deep web article scraping and markdown conversion.
  - Topic keyword discovery and content retrieval.
- **Environment Variables**:
  ```bash
  FIRECRAWL_API_KEY=fc-...
  ```

---

## 5. Structured Data Research: Apify
- **Status**: 🟢 **VERIFIED ACTIVE**
- **Role**:
  - Allowlisted actor execution (`apify/google-search-scraper`, `apify/web-scraper`).
  - Structured dataset collection for trend and competitor research.
- **Environment Variables**:
  ```bash
  APIFY_API_TOKEN=apify_api_...
  ```

---

## 6. Avatar & Presenter Video: HeyGen
- **Status**: 🟢 **VERIFIED ACTIVE**
- **Role**:
  - Optional presenter talking-head video generation (Template ID: `ca65db63001f4ff98a09b156c1259b77`).
- **Environment Variables**:
  ```bash
  HEYGEN_API_KEY=sk_V2_...
  HEYGEN_TEMPLATE_ID=ca65db63001f4ff98a09b156c1259b77
  ```

---

## 7. Conversational Voice Interface: Vapi
- **Status**: 🟢 **VERIFIED ACTIVE**
- **Role**:
  - Optional inbound voice interface for voice commands into Catalyst.
- **Environment Variables**:
  ```bash
  VAPI_API_KEY=376ffcb0-...
  ```

---

## 8. Transactional Notifications: Resend
- **Status**: 🟢 **VERIFIED ACTIVE**
- **Role**:
  - Real-time email dispatch on video render complete, render failed, and daily reports.
- **Environment Variables**:
  ```bash
  RESEND_API_KEY=re_...
  RESEND_FROM_EMAIL=onboarding@resend.dev
  RESEND_DEFAULT_RECIPIENT=pabbatek@gmail.com
  ```
