# Catalyst Remotion Studio — Full System Architecture

> **Architecture Standard:** Production-Grade AI Video Studio  
> **Execution Engine:** Remotion 4.0 Local & Lambda Runtimes  
> **Intelligence Engine:** Highest-Capability Flock / Claude Central Model Hub

---

## 1. End-to-End Production Pipeline

Catalyst Content OS operates as a multi-stage, AI-directed production pipeline where high-level storytelling decisions flow through specialized director agents to produce a deterministic, validated `VideoSpec`, which is rendered via Remotion.

```
+-------------------------------------------------------------------------+
|                           CAMPAIGN STRATEGY                             |
|  Niche, Audience, Content Pillars, Tone, Visual Identity, Calendar      |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                             STORY DIRECTOR                              |
|  Hook -> Curiosity Gap -> Context -> Escalation -> Reveal -> Payoff     |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                        VOICE & NARRATION ENGINE                         |
|  OpenAI TTS / ElevenLabs -> Whisper Word Timestamps -> Cadence Plan     |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                     VISUAL DIRECTOR & NOVELTY ENGINE                    |
|  20+ Visual Languages, 7-Plane LayerStack, Composition, Metaphor        |
|  (Checks SQLite VisualStyleMemory to avoid repetition)                  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                    MOTION & TRANSITION DIRECTORS                        |
|  Physics Springs, 3D WebGL (Three.js), Official Transition Shaders      |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                       STRUCTURED VIDEOSPEC (ZOD)                        |
|  Scenes, VisualBeats, CameraRig, Captions, SFX, Ducking, Metadata       |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                    REMOTION COMPOSITION & PLAYER                        |
|  MasterComposition -> LayerStack -> VisualBeatRenderer -> Audio Tracks  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                         AUTOMATED QA & CRITIQUE                         |
|  12-Point Heuristics -> High-Capability Model Critique -> Auto-Repair   |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                          HUMAN APPROVAL GATE                            |
|  Preview, Per-Scene Regeneration, Script Tweaks, Voice Switcher         |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                       PRODUCTION RENDER (MP4)                           |
|  Remotion Bundler -> Remotion Renderer (Chromium + FFmpeg)              |
+-------------------------------------------------------------------------+
```

---

## 2. Intelligence Layer & Model Policy

### Zero-Downgrade Central Model Policy
All strategic and creative tasks are routed through `src/lib/config/models.ts`:
- **Campaign Planning & Topic Selection:** Highest capability model (`CLAUDE_PRIMARY_MODEL` / `claude-3-5-sonnet-latest` / `claude-opus-5`).
- **Storytelling & Scriptwriting:** Highest capability model with adaptive reasoning tokens.
- **Visual Art Direction:** Highest capability model with multi-modal storyboard validation.
- **Motion & Transition Selection:** Highest capability model mapping scene emotional tension to physics parameters.
- **Visual Critique & QA:** Highest capability model inspecting frame renders for semantic density and brand alignment.

Silent model downgrades to low-end or fast fallback models are strictly forbidden in production mode.

---

## 3. Visual Execution Layer: 2.5D LayerStack + 3D Three.js

Each visual beat renders across a 7-depth spatial coordinate system inside `LayerStack.tsx`:

1. **Layer 0 (Depth 0.15):** Background Environment (Radial gradients, dark studio backdrop).
2. **Layer 1 (Depth 0.35):** Atmospheric Texture & Paper Grain (Grid lines, subtle scanlines, paper texture).
3. **Layer 2 (Depth 0.60):** Midground Schematics (Circuit tracks, topology nodes, secondary diagrams).
4. **Layer 3 (Depth 1.00):** Primary Anchor Subject (3D Three.js Canvas, Photographic Cutouts, Interactive Charts, Maps).
5. **Layer 4 (Depth 1.35):** Foreground Laser Scans & Telemetry (Animated laser bars, coordinate crosshairs).
6. **Layer 5 (Depth 1.50):** Typography & Display Headlines (Brutalist display titles, word spotlights).
7. **Layer 6 (Depth 1.65):** Editorial Marks (Red marker highlights, patent stamps, declassified tags).

---

## 4. Deterministic Audio Pipeline

- **Voiceover Track:** High-fidelity speech with Whisper-extracted word-level timestamps.
- **Dynamic Background Music:** Ducking factor automatically attenuates music volume by 70–80% whenever narrator speech is active (`frame >= word.start && frame <= word.end`).
- **SFX Engine:** Frame-accurate sound effects (impact thuds, whoosh sweeps, digital telemetry chirps) triggered synchronously on entrance beats.
