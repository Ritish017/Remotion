# Catalyst Content OS — Authoritative Target Architecture

**Status**: ACTIVE PRODUCTION SPECIFICATION  
**Target Quality Level**: Vox / Bloomberg Originals / Phase 6 Revised Standard  
**Pipeline Standard**: Arbitrary Documentary Topic $\rightarrow$ Automated End-to-End Broadcast Render

---

## 1. Runtime Pipeline Architecture

```
                       USER CONTENT BRIEF
                              │
                              ▼
                   RESEARCH ORCHESTRATOR
                (Firecrawl / Web Synthesis)
                              │
                              ▼
                      CONTENT DIRECTOR
           (Claude Opus 5: 7-Beat Script & Facts)
                              │
                              ▼
                     AUDIO SYNCHRONIZER
             (OpenAI TTS + Whisper Timestamps)
                              │
                              ▼
                   SCRIPT VISUAL PLANNER
          (Claude Opus 5: SCRIPT = TIMELINE Beats)
                              │
                              ▼
                    VISUAL ART DIRECTOR
               (Multi-Layer Visual Strategy)
                              │
                              ▼
                        ASSET DIRECTOR
            (Semantic Query -> AssetCache / SVG)
                              │
                              ▼
                       MOTION DIRECTOR
              (Semantic Motion & Camera Physics)
                              │
                              ▼
                      PRODUCTION AGENT
                (VideoSpec Assembly & Zod QA)
                              │
                              ▼
                     MASTER COMPOSITION
              (VisualBeatRenderer + LayerStack)
                              │
                              ▼
                       REMOTION RENDER
                  (1080×1920 @ 30fps H.264)
                              │
                              ▼
                      FRAME EXTRACTION
                    (34+ Review Keyframes)
                              │
                              ▼
                     VISUAL CRITIC AGENT
                (Multimodal Vision Inspection)
                              │
                      [Score >= 80% ?]
                     /                \
                   YES                 NO (Iter <= 3)
                   /                    \
                  /                 SCENE REDESIGN
                 /                  (Targeted Beat Polish)
                ▼                        │
          TECHNICAL QA                   ▼
       (12-Point Suite)            RE-RENDER SCENE
                │                        │
                ▼                        ▼
       FINAL PRODUCTION MP4 ◄────────────┘
```

---

## 2. Mandatory Architectural Invariants

1. **Script is the Temporal Spine (`SCRIPT = TIMELINE`)**: Every spoken sentence or concept corresponds to a discrete `VisualBeat`.
2. **VisualBeats are Mandatory**: In production mode, all scenes must contain populated `visualBeats`. Fallback to flat templates is restricted to migration/legacy development.
3. **No UI Cards / Anti-Dashboard Rule**: Zero floating rounded rectangles or dashboard cards. Compositions must use full-bleed spatial layers (Background, Midground, Subject, Foreground, Typography).
4. **Canvas Occupancy Gate**: Meaningful frame occupancy must measure between **60% and 95%**.
5. **Dominant Protagonist**: Every scene must feature an unmistakable visual hero (Macro Wafer, 3NM Lithography, Datacenter Monoliths, Global Orbital Satellite, 3D Perspective Die, Nanometre Laser Reticle, 100× Hero Monolith).
6. **5-Tier Typography Hierarchy**: Eyebrow $\rightarrow$ Display Headline $\rightarrow$ Giant Numeric/Keyword Hero $\rightarrow$ Narrative Subtitle $\rightarrow$ Monospace Source Mark.
7. **Strict Visual Language Validation**: Unknown visual language identifiers fail validation immediately in production mode rather than silently degrading.
8. **Dual-Model Cognitive Routing**:
   - `CLAUDE_PRIMARY_MODEL` (`claude-opus-5`): High-stakes editorial, visual direction, storyboard architecture, vision critique, redesign.
   - `CLAUDE_FAST_MODEL` (`claude-sonnet-5`): Routine transformations, metadata, fast caption alignment.
9. **Automated Vision Critic & Redesign Gate**: Vision evaluation analyzes rendered frames and triggers up to 3 iterative redesign cycles before final export.
10. **Objective Audit Assertion**: Automated QA scores are strictly demarcated as `ENGINE_SCORE` and `AI_VISUAL_REVIEW`, with human visual approval marked as `HUMAN_REVIEW_REQUIRED: PENDING` until reviewed by the operator.
