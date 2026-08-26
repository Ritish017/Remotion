# Remotion Full Capability Audit & Source Analysis

> **Audit Date:** August 2026  
> **Source Repository:** `official-remotion` (`https://github.com/remotion-dev/remotion`)  
> **Audited By:** Catalyst Content OS Core Engineering Team  
> **Application Target:** Catalyst Remotion Studio Full Production Engine Upgrade

---

## 1. Executive Summary

This document provides a comprehensive audit of the official Remotion repository (v4.0.517+), inspecting all packages, primitives, execution runtimes, audio/video APIs, bundling engines, transition systems, 3D WebGL modules, and typography managers. It contrasts official capabilities with Catalyst Studio's architecture, defining the integration boundary where Remotion serves as the **deterministic video execution engine** and Catalyst acts as the **AI-directed art direction & storytelling layer**.

---

## 2. Capability Audit by Domain

### 2.1 Core Composition & Timing Engine (`packages/core`)

| Capability | Official Remotion API | Description & Mechanism | Catalyst Current Usage | Deep Upgrade Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Compositions** | `<Composition>` | Registers deterministic render targets with width, height, fps, durationInFrames, schema, and defaultProps. | Used in `Root.tsx` for `VerticalExplainer`, `HorizontalExplainer`, `MasterComposition`. | Retain as primary composition registry; inject dynamic schemas. |
| **Dynamic Compositions** | `calculateMetadata` | Async function executed prior to render to calculate dynamic duration, dimensions, or props based on external data/audio files. | Partial manual calculation in API routes. | Adopt `calculateMetadata` directly in `MasterComposition` for automatic frame-duration calculation from audio voiceover duration. |
| **Frame Access** | `useCurrentFrame()` | Returns current integer frame index (0 to duration-1) within the active Sequence. | Core to all visual components and motion hooks. | Standardize as the single time source for all interpolations. |
| **Video Config** | `useVideoConfig()` | Returns `{ width, height, fps, durationInFrames, id }`. | Used in components to derive pixel scaling and aspect ratios. | Use for responsive layout calculations across 9:16, 16:9, and 1:1. |
| **Spatial Canvas** | `<AbsoluteFill>` | `div` with absolute positioning filling 100% width and height. | Used in all scene wrappers and background stacks. | Base container for all 2.5D layer planes. |
| **Time Slicing** | `<Sequence>` | Shifts time context (`from`, `durationInFrames`) and mounts children only during active window. | Used for scene sequencing in `MasterComposition`. | Use for modular scene sequences and individual visual beat blocks. |
| **Series Sequencing** | `<Series>` | Automatically chains child sequences end-to-end without computing manual `from` offsets. | Not used in legacy templates. | Combine with `TransitionSeries` for seamless scene flow. |
| **Folder Organization**| `<Folder>` | Groups compositions in Remotion Studio UI hierarchy. | Used flatly. | Organize compositions by Campaign and Episode categories. |
| **Static Assets** | `staticFile()` | Resolves public directory assets safely across local Studio and SSR Lambda bundles. | Used in audio/image paths. | Enforce everywhere for deterministic asset URL resolution. |
| **Async Hold** | `delayRender()`, `continueRender()` | Freezes frame rendering until fonts, 3D models, or high-res images are fully loaded. | Minimal usage. | Wrap all Three.js meshes, canvas shaders, and remote images with `delayRender()` handles. |

---

### 2.2 Animation & Motion Utilities (`packages/core`, `packages/animation-utils`)

| Capability | Official Remotion API | Description & Mechanism | Catalyst Upgrade Integration |
| :--- | :--- | :--- | :--- |
| **Linear & Curve Interpolation** | `interpolate(frame, inputRange, outputRange, options)` | Deterministic mapping of frame values to spatial/opacity coordinates with extrapolate left/right controls and Easing functions. | Standardize throughout `Parallax.tsx`, `CameraRig.tsx`, and `EditorialCollage.tsx`. |
| **Physics Springs** | `spring({ frame, fps, config: { damping, stiffness, mass } })` | Second-order differential equation physics spring generating natural bounce and settle curves. | Core of `SpringEntrance.tsx` and text animations. |
| **Color Interpolation** | `interpolateColors(frame, inputRange, colorRange)` | Smooth HSL/RGB color shifts across timeline frames. | Used for dynamic accent glowing and heat-map data visualizations. |
| **Curated Easings** | `Easing.bezier()`, `Easing.inOut()`, `Easing.cubic` | Cubic bezier and standard timing curves. | Applied to camera pans, push-ins, and metric counters. |
| **Randomness Control** | `random(seed)` | Seeded pseudo-random generator producing reproducible values on every render pass. | Powering `motionSeed` in `CameraRig` for non-repeating yet deterministic micro-drifts. |

---

### 2.3 Transitions & Scene Linking (`packages/transitions`)

| Capability | Official Remotion API | Description | Catalyst Integration Strategy |
| :--- | :--- | :--- | :--- |
| **Transition Series** | `<TransitionSeries>` | High-level component managing overlapping scenes and transition timing. | Replaces manual sequence overlaps. |
| **Official Presentations** | `fade()`, `slide()`, `wipe()`, `flip()`, `filmBurn()`, `linearBlur()`, `crossZoom()`, `pushCut()`, `dreamyZoom()`, `clockWipe()`, `dissolve()`, `bookFlip()` | WebGL and CSS-accelerated transition shaders. | Integrated into `TransitionDirector` to assign transitions matching narrative tension. |
| **Custom Shaders** | `makeHtmlInCanvasPresentation()` | Custom canvas and WebGL fragment shader transitions. | Used for Catalyst custom `MatchCut` and `LaserSweep`. |
| **Timing Models** | `springTiming()`, `linearTiming()` | Controls transition easing and duration curve. | Synchronized with audio beat drops and narrator cadence. |

---

### 2.4 Media Handling (`packages/core`, `packages/media-utils`, `packages/gif`)

| Capability | Official Remotion API | Description | Catalyst Integration Strategy |
| :--- | :--- | :--- | :--- |
| **Images** | `<Img>` | Deterministic image loader supporting `delayRender()` automatically. | Standard for all photographic and editorial assets. |
| **HTML5 Video** | `<Video>` | Synchronized video playback locked to Remotion current frame. | Used for background B-roll and archive video clips. |
| **Frame-Accurate Video** | `<OffthreadVideo>` | Extracts video frames in Node/Chromium worker threads for stutter-free server rendering. | Used during high-fidelity production rendering of archival video. |
| **Audio Tracks** | `<Audio>` | Frame-synchronized audio element supporting volume curves and looping. | Used for Voiceover narration, Background Music, and SFX stems. |
| **Animated GIFs** | `<Gif>` (`@remotion/gif`) | Frame-accurate GIF playback synced to timeline. | Used for retro and technical loop animations. |
| **Audio Analysis** | `getAudioData()`, `useAudioData()` | Real-time FFT spectrum and waveform extraction. | Drives visual audio reactive pulses and oscilloscope diagrams. |

---

### 2.5 Captions & Subtitles (`packages/captions`)

| Capability | Official Remotion API | Description | Catalyst Integration Strategy |
| :--- | :--- | :--- | :--- |
| **SRT Parsing & Formatting** | `parseSrt()`, `serializeSrt()` | Parses subtitle files into structured token arrays. | Ingests external transcripts. |
| **Line Splitting** | `ensureMaxCharactersPerLine()` | Wraps words cleanly without breaking semantic phrasing. | Powers documentary subtitle line breaks. |
| **TikTok/Reels Engine** | `createTikTokStyleCaptions()` | Paginates word-level timestamps into dynamic active-word pages. | Drives `KaraokeCaptions` and `KineticCaptions`. |
| **Custom Highlighting** | Custom Word Callouts | Colors active spoken words and highlights keywords. | Driven by Story Director's `emphasisWords`. |

---

### 2.6 3D & WebGL Systems (`packages/three`)

| Capability | Official Remotion API | Description | Catalyst Integration Strategy |
| :--- | :--- | :--- | :--- |
| **Three Canvas** | `<ThreeCanvas>` | Synchronizes Three.js WebGL render loop with Remotion frame timeline. | Renders 3D semiconductor dies, fusion tokamak chambers, and orbital models. |
| **Camera Animation** | `PerspectiveCamera` | Animated focal length, orbit angle, and depth of field. | Powers cinematic 3D macro orbits. |
| **Shader Materials** | `ShaderMaterial` | Custom GLSL fragment shaders for glowing matrices, plasma, and laser scans. | Enhances technical diagram scenes. |
| **Particle Systems** | `Points` & `BufferGeometry` | Multi-thousand particle networks drifting in 3D space. | Ambient tech backdrop for deep-tech campaigns. |

---

### 2.7 Remotion Player (`packages/player`)

| Capability | Official Remotion API | Description | Catalyst Integration Strategy |
| :--- | :--- | :--- | :--- |
| **Live Playback** | `<Player>` | In-browser preview player with timeline seeking, volume, and playback rates. | Core of `LivePlayerViewport.tsx` in Episode Workspace. |
| **Player Ref** | `PlayerRef` | Programmatic controls (`play()`, `pause()`, `seekTo()`, `getCurrentFrame()`). | Synchronized with timeline scrubber and inspector. |
| **Dynamic Props** | `inputProps` | Live props injection allowing instant preview of VideoSpec edits without reload. | Powers Claude iteration drawer and live style switcher. |

---

### 2.8 Rendering & Export Engine (`packages/renderer`, `packages/bundler`)

| Capability | Official Remotion API | Description | Catalyst Integration Strategy |
| :--- | :--- | :--- | :--- |
| **Webpack Bundler** | `bundle()` | Compiles React/Remotion tree into a production Webpack bundle with code-splitting and asset resolution. | Managed in `src/lib/rendering/local.ts` with singleton cache. |
| **Media Renderer** | `renderMedia()` | Executes headless Chromium frames, stitches video via FFmpeg, renders audio, applies CRF/codec. | Powers local production export (`mp4`, `h264`, `prores`). |
| **Still Renderer** | `renderStill()` | Renders single high-resolution frame at specified timecode. | Used for QA frame inspection and thumbnail generation. |
| **Concurrency Control** | `concurrency`, `chromiumOptions` | Multi-process Chromium pooling for fast parallel rendering. | Configured via `REMOTION_CONCURRENCY` env var (default: 4 cores). |

---

### 2.9 Typography & Fonts (`packages/google-fonts`, `packages/fonts`)

| Capability | Official Remotion API | Description | Catalyst Integration Strategy |
| :--- | :--- | :--- | :--- |
| **Deterministic Fonts** | `loadFont()` | Preloads Google Fonts and local TTF/WOFF2 before frame evaluation. | Integrated into `Root.tsx` to prevent typography layout shifts during rendering. |
| **Variable Weights** | Dynamic Font Weight | Seamless interpolation between light and ultra-black weights. | Applied to brutalist display headlines and monospace telemetry readouts. |

---

## 3. Gap Analysis & Architecture Realignment

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CATALYST ART DIRECTION LAYER                       │
│  Campaign Strategy ──> Storytelling ──> VisualDirector ──> MotionPlan   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                             (Structured VideoSpec)
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                    REMOTION VIDEO EXECUTION ENGINE                      │
│  ┌─────────────────────────┐ ┌─────────────────────────┐                │
│  │    @remotion/core       │ │  @remotion/transitions  │                │
│  │ (Sequence, interpolate) │ │  (filmBurn, linearBlur) │                │
│  └─────────────────────────┘ └─────────────────────────┘                │
│  ┌─────────────────────────┐ ┌─────────────────────────┐                │
│  │    @remotion/three      │ │   @remotion/captions    │                │
│  │ (ThreeCanvas, Shaders)  │ │ (Word-level TikTok/Doc) │                │
│  └─────────────────────────┘ └─────────────────────────┘                │
│  ┌─────────────────────────┐ ┌─────────────────────────┐                │
│  │    @remotion/player     │ │   @remotion/renderer    │                │
│  │ (Live Browser Studio)   │ │ (Chromium + FFmpeg MP4) │                │
│  └─────────────────────────┘ └─────────────────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Conclusion

By anchoring Catalyst on official Remotion primitives, we eliminate custom timeline hacks and unlock broadcast-grade rendering reliability, frame-accurate Three.js 3D, official transition shaders, and deterministic font rendering.
