# Voice Production & Narration Engine

> **System:** Catalyst Voice & Audio OS  
> **Engines:** OpenAI TTS (`tts-1`, `tts-1-hd`) / ElevenLabs / Whisper (`whisper-1`)  
> **Synchronization:** Word-Level Timestamp Alignment driving Visual Frame Clocks

---

## 1. Campaign Voice Identities

Voice is an integral part of the visual and editorial brand. Each campaign selects an acoustic identity tailored to its niche and emotional tone:

| Campaign Type | Voice Preset | Pitch & Pacing | Emotional Character | Cadence (WPS) |
| :--- | :--- | :--- | :--- | :--- |
| **Daily AI News** | `onyx` (OpenAI) / `Adam` (ElevenLabs) | Deep, authoritative, measured | Urgent, investigative, newsroom-verified | 2.5 - 2.8 |
| **Future Technology** | `echo` / `George` | Resonant, cinematic, calm | Awe-inspiring, philosophical, analytical | 2.2 - 2.4 |
| **Robotics & Hardware** | `fable` / `Antony` | Crisp, precise, technical | Empirical, hardware-engineer, diagnostic | 2.4 - 2.6 |
| **Finance Explained** | `alloy` / `Marcus` | Fast, sharp, articulate | High-stakes, forensic, trading-desk intensity | 2.8 - 3.1 |
| **Science Documentary**| `nova` / `Rachel` | Warm, lucid, revelatory | Curious, lucid, educational clarity | 2.2 - 2.5 |

---

## 2. Word-Level Narration Timing Pipeline

```
1. Script Generation (Story Director)
   │
2. Voiceover Synthesis (TTS API)
   │ ──> Audio MP3 Buffer
3. Whisper Alignment (whisper-1 / whisper.cpp)
   │ ──> Word Timestamps: [{ word: "OpenAI", start: 0.12, end: 0.58 }, ...]
4. Frame Clock Mapping (fps = 30)
   │ ──> startFrame = Math.round(word.start * 30)
   │ ──> endFrame = Math.round(word.end * 30)
5. Visual Timeline Alignment (VisualDirector)
   │ ──> Scene 1: 0 to 180 frames (matches sentence 1)
   │ ──> Kinetic Text Highlights triggered exactly at word.startFrame
   │ ──> Dynamic Music Ducking drops background volume during active speech windows
```

---

## 3. Dynamic Sound Design & Music Ducking

- **Audio Ducking:** Whenever speech is detected on the voiceover track, the background music track's volume curve drops from `0.25` to `0.06` (`76% ducking reduction`) with a smooth 6-frame cosine ramp to ensure crystal-clear voice intelligibility.
- **Synchronized SFX Triggers:**
  - `impact_sub_bass`: Triggered on Hook entrance (Frame 0).
  - `whoosh_transition`: Triggered on scene transitions (e.g. Frame 150).
  - `digital_blip`: Triggered on data counter surge or blueprint pinout reveal.
  - `laser_hum`: Triggered on foreground laser scan sweep.
