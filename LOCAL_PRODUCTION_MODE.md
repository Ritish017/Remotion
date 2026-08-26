# Catalyst Content OS — Local-First Production Mode

## 1. Executive Summary

Catalyst Content OS is configured in **Local-First Production Mode**. In this mode, Catalyst operates entirely on the user's local Windows machine without requiring AWS, S3, Supabase, Lambda, or any other cloud infrastructure.

The core pipeline utilizes:
- **Anthropic Claude API** (`@anthropic-ai/sdk`): Primary creative director for research synthesis, narrative scriptwriting, storyboard scene construction, and automated video QA.
- **OpenAI TTS & Whisper API**: Neural speech synthesis (`tts-1` / Onyx voice) and monotonic word-level timestamp transcription (`whisper-1`).
- **Remotion Local Renderer** (`@remotion/renderer` + `@remotion/bundler`): High-performance GPU/CPU-accelerated local composition rendering to H.264 MP4.
- **Local Storage Provider** (`./storage`): Sanitized filesystem storage across 10 standardized subdirectories.
- **Local SQLite Database** (`storage/catalyst.db`): Zero-dependency local relational database powered by Node.js `node:sqlite` (`DatabaseSync`).

---

## 2. Target Architecture

```
User / Browser (Next.js Studio UI)
       │
       ▼
Next.js Catalyst Server (Local Windows Machine)
       │
       ├─► 1. Anthropic Claude API (claude-sonnet-4-5-20250929)
       │     └─► Editorial Script & 7-Beat Storyboard Generation
       │
       ├─► 2. OpenAI Audio API (tts-1 + whisper-1)
       │     └─► Neural Voiceover & Monotonic Word Timestamps
       │
       ├─► 3. Local Storage Provider (./storage)
       │     ├─► storage/audio/*.mp3
       │     ├─► storage/videospecs/*.json
       │     └─► storage/renders/*/*.mp4
       │
       ├─► 4. Local SQLite Database (storage/catalyst.db)
       │     └─► Projects, Episodes, Specs, Renders, Audios, Provider Usage
       │
       └─► 5. Remotion Local Renderer (@remotion/renderer)
             └─► Chromium Frame-by-Frame Local MP4 Rendering
```

---

## 3. Storage Directory Structure

Storage is organized into 10 standardized directories in `./storage`:

| Directory | Relative Path | Purpose |
|---|---|---|
| Projects | `storage/projects/` | Workspace project manifests & metadata |
| Research | `storage/research/` | Scraped source articles, citations, and verified facts |
| Scripts | `storage/scripts/` | Narrative scripts, story beats, and transcripts |
| Storyboards | `storage/storyboards/` | Timed scene layouts and camera motion directions |
| VideoSpecs | `storage/videospecs/` | Fully validated `VideoSpec` JSON files ready for playback/render |
| Audio | `storage/audio/` | Generated MP3 voiceover files and Whisper timestamp alignments |
| Renders | `storage/renders/` | Rendered high-definition MP4 video outputs |
| Thumbnails | `storage/thumbnails/` | Video preview frames and poster images |
| Assets | `storage/assets/` | Local media, SVG overlays, and brand textures |
| Exports | `storage/exports/` | Packaged platform export bundles |

---

## 4. SQLite Database Schema (`storage/catalyst.db`)

Managed via Node.js native `DatabaseSync` (`node:sqlite`) with WAL mode enabled:

1. **`projects`**: Project ID, name, channel ID, status, timestamps.
2. **`channels`**: Channel brand identity, primary topic, target platform.
3. **`episodes`**: Episode topic, status, script text, duration.
4. **`video_specs`**: VideoSpec ID, episode ID, version, full JSON specification.
5. **`research_sources`**: Ingested URLs, titles, extraction providers, timestamps.
6. **`research_facts`**: Extracted data facts, source IDs, confidence scores.
7. **`narration_artifacts`**: Audio ID, file path, transcript, word-level timestamps JSON.
8. **`render_jobs`**: Job ID, status (`QUEUED` \| `RENDERING` \| `COMPLETED` \| `FAILED`), progress, output path, error details.
9. **`provider_usage`**: Provider name, model, task type, token usage, estimated cost.

---

## 5. Local Rendering Engine

The local rendering pipeline uses `@remotion/renderer` and `@remotion/bundler`:
- **Path Resolution**: Webpack bundles `@/...` aliases directly from `src/`.
- **Audio Inlining**: Resolves local audio files into base64 data URIs for headless Chromium execution without relying on a separate HTTP web server.
- **Multi-Core Concurrency**: Automatically distributes frame evaluation across all available CPU/GPU cores.
- **Live Progress Reporting**: Streams frame render percentages in real time to SQLite and the UI.

---

## 6. Portability & Future Cloud Migration

The entire architecture is built against provider interfaces:
- `StorageProvider` (`LocalStorageProvider` vs future `S3StorageProvider`)
- `DatabaseProvider` (`SQLiteDatabaseProvider` vs future `SupabaseDatabaseProvider`)
- `AudioProvider` (`OpenAIAudioProvider` vs future `ElevenLabsAudioProvider`)

Switching between local-first mode and cloud mode requires only setting the environment variables:
```env
CATALYST_STORAGE_MODE=local   # or 's3'
CATALYST_DATABASE_MODE=sqlite # or 'supabase'
CATALYST_RENDER_MODE=local    # or 'lambda'
```
No core application code rewrite is necessary.
