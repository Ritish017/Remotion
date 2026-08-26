# Visual System Specification — Catalyst 22 Visual Languages

This document catalogues all 22 composable visual languages available in Catalyst Content OS, their parameters, treatment modes, and visual composition rules.

---

## 1. Catalog of 22 Visual Languages

| # | Visual Language ID | Component | Primary Narrative Use Case |
|---|---|---|---|
| 1 | `kinetic-headline` | `HookScene` | High-impact 0–3s opening hooks, pattern interrupts. |
| 2 | `cinematic-photo` | `CinematicImage` | High-res real-world imagery with macro zoom & light sweeps. |
| 3 | `archival-photo` | `CinematicImage` | Historical or classified imagery with sepia & grain. |
| 4 | `editorial-paper` | `EditorialCollage` | Layered cards, paper textures, stamps, and annotations. |
| 5 | `technical-diagram` | `TechnicalDiagram` | Pure SVG circuit schematics, node matrices, pulse packets. |
| 6 | `blueprint` | `TechnicalDiagram` | Inverted blueprint schematic for hardware architectures. |
| 7 | `schematic` | `TechnicalDiagram` | Flow matrix & logic bus routing. |
| 8 | `data-story` | `DataStory` | Animated comparative bar charts, progress trackers. |
| 9 | `cinematic-statistic`| `StatisticScene` / `DataStory` | Giant numeric multiplier reveals with radial energy glow. |
| 10 | `geographic-story` | `MapStory` | Territory vector maps with connecting route arcs & pulse pins. |
| 11 | `satellite` | `MapStory` | Reconnaissance-style coordinate inspection visualizer. |
| 12 | `timeline-story` | `TimelineScene` | Sequential chronological milestone progression. |
| 13 | `comparison-story` | `ComparisonScene` | Side-by-side A/B architecture breakdown. |
| 14 | `cutout-explainer` | `CutoutScene` | Isolated subject cutout with parallax drop shadow. |
| 15 | `interface-explainer`| `UIExplainerScene` | Application UI mockups with interactive highlights. |
| 16 | `code-explainer` | `UIExplainerScene` | Code snippet syntax highlighting with line reveals. |
| 17 | `macro-detail` | `CinematicImage` | Diagonal panning close-up of hardware silicon. |
| 18 | `product-hero` | `CinematicImage` | High-contrast duotone studio hardware showcase. |
| 19 | `quote-editorial` | `EditorialScene` | Direct expert statement with quotation typography. |
| 20 | `chapter-card` | `EditorialScene` | Section title transition card. |
| 21 | `documentary-collage`| `EditorialCollage` | Multi-card evidence dossier with vintage tape graphics. |
| 22 | `cinematic-outro` | `OutroScene` | Final brand stamp, social handles, and next-episode hook. |

---

## 2. Cinematic Image Treatment Tokens

`CinematicImage` supports 7 distinct post-processing treatments:

```typescript
export type ImageTreatment = 
  | 'cinematic_macro'      // High contrast, subtle vignette, slow push
  | 'archival_grain'       // 25% sepia, 120% contrast, subtle 35mm grain simulation
  | 'duotone_editorial'    // Grayscale base mapped into Brand primary/accent colors
  | 'cutout_shadow'        // Deep 50px drop shadow for floating cutout depth
  | 'paper_textured'       // Radial dot matrix texture overlay
  | 'blueprint_inverted'   // 180deg inverted blue matrix for engineering schematics
  | 'standard';            // Pure unfiltered broadcast video frame
```

---

## 3. Motion & Transition Tokens

### Motion Entrance Primitives:
- `spring_in`: Bouncy spring entrance (`damping: 12, stiffness: 100`).
- `fade`: Smooth linear alpha blend (10–12 frames).
- `counter_start`: Elastic numeric counter interpolation from 0 to target value.
- `diagram_pulse`: Harmonic sinus wave pulsing on highlighted SVG nodes.
- `slow_drift`: Continuous 1% scale / 5px coordinate drift during hold.

### Transition Primitives:
- `fade`: 10-frame alpha crossfade.
- `match-cut`: Shared geometric anchor (circle, chip, card, rect) scaling/morphing smoothly across the cut.
- `camera-push`: Rapid forward push into the incoming visual.
- `camera-pull`: Rapid backward pull revealing the incoming visual.
- `whip`: High-speed horizontal displacement.
- `paper-slide`: Editorial card sliding up or down into position.

---

## 4. Visual Quality Scoring Rubric

Every generated VideoSpec is evaluated across four automated QA analyzers in `src/lib/qa/`:

1. **Technical QA (100 pts max)**:
   - Frame continuity across all scenes.
   - Word timestamp alignment with voiceover duration.
   - Resolution conformity (1080x1920, 1920x1080, 1080x1080).
   - Voice ducking hierarchy.

2. **Visual Diversity QA (100 pts max)**:
   - Penalizes repeated consecutive visual languages (`-10 pts`).
   - Penalizes repetitive camera movements (`-20 pts`).
   - Requires >= 3 unique visual languages.

3. **Visual Rhythm Score (100 pts max, Target >= 85)**:
   - Evaluates visual evolution frequency: target is one visual change every **2.0s to 4.5s**.
   - Evaluates camera motion variety and asset density.

4. **Cinematic Quality Score (100 pts max, Target >= 80)**:
   - Evaluates 5-layer depth stack utilization.
   - Evaluates typography hierarchy and keyword emphasis.
   - Evaluates visual storytelling clarity.
