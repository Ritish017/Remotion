# Visual Variation & Novelty Memory Engine

> **Core Mandate:** Anti-Generic AI Video Generation  
> **Rule:** No two consecutive videos may share the same visual language, camera system, or transition style.

---

## 1. Visual Languages Spectrum (20+ Distinct Styles)

Catalyst provides a rich library of visual languages registered in `src/remotion/visuals/VisualLanguageRegistry.tsx`:

1. **`cinematic-photo`**: High-contrast, cinematic macro photography with atmospheric grain and volumetric lighting.
2. **`investigative-editorial`**: Documentary broadsheet collage with declassified stamps, paper textures, and red marker underlines.
3. **`technical-blueprint`**: Inverted cyan schematic blueprint with wireframes, pinouts, and dimensional callouts.
4. **`data-story`**: Empirical benchmark bars, animated time-series charts, and scaling curves with unit tickers.
5. **`geographic-story`**: Intercontinental supply chain map, geographic corridors, and glowing route vectors.
6. **`satellite-reconnaissance`**: High-altitude satellite imagery with target crosshairs and coordinate overlays.
7. **`3d-semiconductor`**: Three.js WebGL procedural microchip with glowing transistor routing and orbital camera.
8. **`3d-neural-network`**: Interactive 3D particle graph with firing synaptic pulses and dynamic node scaling.
9. **`3d-fusion-reactor`**: Toroidal magnetic confinement field with pulsating plasma coils.
10. **`kinetic-headline`**: High-energy brutalist typography with word-by-word tracking expansion and spotlight glow.
11. **`cutout-explainer`**: 2.5D layered photographic cutouts with directional drop-shadows and subtle physics floating.
12. **`hardware-cutout`**: Physical component tear-down with exploded part breakouts and leader lines.
13. **`interface-explainer`**: Terminal UI code editor and developer dashboard with syntax highlighting.
14. **`financial-terminal`**: High-frequency order book, candlestick metrics, and microsecond telemetry readouts.
15. **`evidence-board`**: Forensic corkboard with connected yarn strings, pinned photos, and timeline dates.
16. **`timeline-reconstruction`**: Horizontal narrative event timeline with historical milestone cards.
17. **`comparison-story`**: Split-screen comparative analysis with synchronized camera push-in.
18. **`architectural-viz`**: Isometric wireframe elevations and volumetric room cross-sections.
19. **`quote-editorial`**: High-impact editorial pull-quote with author citation and typewriter highlight.
20. **`cinematic-outro`**: High-status channel callout, subscribe token, and episode payoff card.

---

## 2. Visual Novelty Engine & Historical Memory

### Novelty Scoring Formula
Before a new episode's visual plan is finalized, the **Visual Director** queries the SQLite table `visual_style_memory` for the campaign's last 10 episodes.

```
Novelty Score = (
  0.35 * VisualLanguageNovelty +
  0.20 * CameraNovelty +
  0.20 * TransitionNovelty +
  0.15 * PaletteNovelty +
  0.10 * 3DUsageNovelty
) * 100
```

### Anti-Repetition Rules
- **Rule 1 (Language Variety):** The exact visual language of Episode $N$ cannot match Episode $N-1$ or Episode $N-2$.
- **Rule 2 (Transition Variance):** If Episode $N-1$ used `filmBurn`, Episode $N$ must use `linearBlur`, `crossZoom`, or `matchCut`.
- **Rule 3 (Camera Rhythm):** Continuous push-ins must be alternated with orbital 3D, whip-pans, or static analytical frames.
- **Rule 4 (Pacing Shift):** Fast-cut kinetic episodes must be balanced with atmospheric documentary pacing in adjacent releases.
