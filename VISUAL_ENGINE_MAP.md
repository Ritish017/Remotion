# CATALYST CONTENT OS — VISUAL ENGINE & MOTION GRAPHICS ARCHITECTURE

> **Authoritative Visual System Reverse-Engineering Document**  
> **Repository:** `Ritish017/Remotion`  
> **Visual Aesthetic Target:** Vox / Bloomberg / PolyMatter Editorial Documentary Style  
> **Core Subsystems:** `LayerStack.tsx`, `CameraRig.tsx`, `VisualBeatRenderer.tsx`, `VisualLanguageRegistry.tsx`, `KaraokeCaptions.tsx`

---

## 1. The 5-Layer Spatial Depth Hierarchy (`LayerStack.tsx`)

Catalyst renders every visual beat as a multiplane 2.5D physical composition inside `src/remotion/composition/LayerStack.tsx`. Layers are assigned strict parallax scaling multipliers and CSS z-indices to simulate physical camera depth:

```
[Layer 5: Typography Layer]    z: 50 | Parallax Multiplier: 1.50x (Fast foreground drift)
[Layer 4: Foreground Overlay]  z: 40 | Parallax Multiplier: 1.35x (Film grain, vignettes, HUD scans)
[Layer 3: Primary Subject]     z: 30 | Parallax Multiplier: 1.00x (Anchor focal plane / cutout / chart)
[Layer 2: Midground Elements]  z: 20 | Parallax Multiplier: 0.50x (Secondary diagrams / data clusters)
[Layer 1: Background Layer]    z: 10 | Parallax Multiplier: 0.15x (Archival canvas / dark editorial grid)
```

### Parallax Kinematics Formula
For any camera displacement $(X_c, Y_c)$ and rotation $\theta_c$, the layer transform applied is:
$$\text{Offset}_x(L) = X_c \times \text{ParallaxMultiplier}(L)$$
$$\text{Offset}_y(L) = Y_c \times \text{ParallaxMultiplier}(L)$$
$$\text{Scale}(L) = 1.0 + (S_c - 1.0) \times \text{ParallaxMultiplier}(L)$$

---

## 2. Dynamic Camera Rig (`CameraRig.tsx`)

Every scene is wrapped in an active mathematical camera rig (`src/remotion/composition/CameraRig.tsx`) driven by Remotion `useCurrentFrame()` and spring interpolation.

### Supported Camera Kinematics Modes
1. **Push / Zoom-In (`push`):** Smooth forward dolly scaling from $1.0\to 1.18$ with focal point centering.
2. **Pull / Zoom-Out (`pull`):** Revealing pullback from $1.15\to 1.0$ establishing macro scale.
3. **Pan Left / Right (`pan-left` / `pan-right`):** Lateral horizontal tracking ($-40\text{px}\to +40\text{px}$) across ultra-wide diagrammatic canvas.
4. **Orbit / Tilt (`orbit`):** 3D rotation along perspective axes ($X\text{-axis } 2^\circ\to -2^\circ$, $Y\text{-axis } -4^\circ\to 4^\circ$) creating tangible isometric depth.
5. **Multi-Axis Parallax (`parallax`):** Compound diagonal tracking with opposing layer velocity.
6. **Region Zoom (`zoom-region`):** Smooth coordinate translation centering on arbitrary $(X\%, Y\%)$ focal targets.

---

## 3. The 7 Production Visual Languages (`VisualLanguageRegistry.tsx`)

The visual engine exposes 7 documentary visual languages mapped to specialized React rendering components:

| Visual Language ID | Component Name | Visual Metaphor & Purpose | Depth Layer Breakdown |
|---|---|---|---|
| `cinematic-photo` | `CinematicImageView` | Archival macro photo with slow focal scan, dust particles, and letterbox bars. | L1: Dark vignette<br>L3: Hero photo<br>L4: Dust grain<br>L5: Monospace caption |
| `editorial-paper` | `EditorialPaperView` | Heavy cardstock paper background with torn edges, stamp graphics, and quote highlights. | L1: Paper texture<br>L2: Halftone stamp<br>L3: Document clip<br>L5: Headline typography |
| `technical-diagram` | `TechnicalDiagramView` | Blue/dark technical schematic grid with isometric chip dies, glowing bus lines, and component callouts. | L1: Grid matrix<br>L2: Circuit traces<br>L3: 3D Die cutout<br>L5: Tech spec badges |
| `data-story` | `DataStoryView` | Giant kinetic bar/growth curve charts with animated axis ticks and percentage multipliers. | L1: Grid lines<br>L2: Reference curves<br>L3: Monolith bar<br>L5: 400% Counter badge |
| `geographic-story` | `GeographicStoryView` | Vector continental map projection with glowing flight corridors, pulse rings, and regional pins. | L1: Topo map<br>L2: Trade routes<br>L3: Node beacons<br>L5: Region label |
| `statistic-big` | `StatisticSceneView` | Screen-filling kinetic numeric counter with label subtext and laser-scan glow bar. | L1: Radial gradient<br>L3: Giant number<br>L4: Scan line<br>L5: Explanatory copy |
| `cutout-explainer` | `CutoutSceneView` | 2.5D segmented cutout asset with dropped shadow, paper halo, and kinetic entry. | L1: Archival canvas<br>L3: Cutout subject<br>L4: Annotations<br>L5: Headline banner |

---

## 4. The 16 Script-to-Timeline Visual Families (`ScriptVisualPlanner.ts`)

In addition to the 7 core scene renderers, the `ScriptVisualPlanner` AI agent recognizes 16 micro visual families to ensure no visual beat repeats across a 45-second documentary:

1. `archive_photo_pan`: Historic archival photograph with directional Ken Burns sweep.
2. `document_redacted`: Declassified government/patent document with animated black redactions.
3. `split_contrast`: Side-by-side binary comparison grid.
4. `macro_lens`: Ultra-shallow depth-of-field macro texture shot.
5. `satellite_track`: Orbital satellite tile zooming to street coordinate.
6. `blueprint_iso`: 45-degree isometric wireframe schematic.
7. `kinetic_stat_surge`: Giant animated numerical multiplier surging from 0 to target.
8. `node_graph_cluster`: Network graph with interconnected glowing nodes.
9. `patent_wireframe`: Technical patent line illustration on dark blueprint paper.
10. `stock_ticker_waterfall`: Real-time financial ticker and market depth chart.
11. `newspaper_zoom`: Historic newspaper headline flying forward with highlighted columns.
12. `quote_monolith`: Giant bold typographic quote floating in 3D dark space.
13. `trade_corridor_arcs`: Curved ballistic shipping/data arcs crossing continents.
14. `wafer_die_zoom`: Microscopic semiconductor die inspection with laser scan bar.
15. `timeline_step`: Horizontal linear chronology highlighting historical breakthrough dates.
16. `payoff_hero_lock`: Dramatic final hero subject lock with brand badge lockup.

---

## 5. Visual Post-Processing Textures & Effects

Catalyst achieves its premium broadcast finish through 4 real-time SVG & CSS shader layers (`src/remotion/visuals/textures/`):

1. **Film Grain Shader (`GrainOverlay.tsx`):** Animated SVG fractal noise (`feTurbulence`) operating at 0.05–0.12 opacity, preventing banding and digital flatness.
2. **Halftone Dot Matrix (`HalftoneOverlay.tsx`):** Radial SVG dot pattern simulating physical editorial offset printing.
3. **Paper Fiber Texture (`PaperTexture.tsx`):** High-frequency fiber noise creating an organic paper tactile feel.
4. **Cinematic Vignette (`VignetteOverlay.tsx`):** Radial gradient falloff darkening peripheral frame edges to drive viewer focus to center-frame metrics.

---

## 6. Karaoke Subtitle System (`KaraokeCaptions.tsx`)

- **Timing Source:** Word timestamps generated by OpenAI Whisper (`VideoSpec.narration.words`).
- **Pill Container:** Frosted glass pill (`rgba(11, 13, 19, 0.85)` background with backdrop blur).
- **Word Animations:**
  - Inactive words: Subdued white (`#ffffff` at 60% opacity).
  - Active spoken word: High-contrast gold accent (`#ffd166`) or inverted black-on-yellow pill with pop scale ($1.08\times$).
  - Monospace font styling (`JetBrains Mono` / `Inter`).
