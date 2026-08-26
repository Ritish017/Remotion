# Catalyst Content OS — Visual Quality Standard

**Standard Identifier**: `CATALYST-VQS-2026.1`  
**Reference Quality Benchmark**: `Phase6RevisedShowcase` (Vox, Bloomberg Originals, WSJ Investigative)  
**Aspect Ratio**: 9:16 (1080×1920 portrait) and 16:9 (1920×1080 landscape)  
**Frame Rate**: 30 FPS  

---

## 1. Core Visual Principles

### 1.1 Canvas Occupancy & Spatial Density
- **Threshold**: 60% – 95% meaningful frame occupancy.
- **Rule**: Full-bleed background assets and large-scale subject layers must fill the visual field. Never place a small centered image with vast empty dark margins.

### 1.2 Unmistakable Protagonist
- Every scene must feature one dominant visual hero:
  - **Macro Photographic Hero**: Oversized crop ($130\%–160\%$), edge bleed, depth-of-field separation.
  - **Hero Typographic Monolith**: Font size $140\text{px}–365\text{px}$, high-contrast color accents (`#ffd166` Amber, `#64e2c5` Mint).
  - **3D Perspective Monolith**: Isometric CSS transforms, perspective angles ($45^\circ–60^\circ$), glowing circuit/bus routes.
  - **Full-Bleed Geographic Vector Matrix**: Planetary/orbital background with dynamic SVG routes and pulsing radar nodes.

### 1.3 Anti-Dashboard & Anti-UI Constraints
- **PROHIBITED**:
  - Rounded rectangular cards containing thumbnail images and paragraph text.
  - Generic purple neon or floating glassmorphic panels.
  - Random unmotivated particle emitters.
  - Centered slide-deck text layouts.
- **REQUIRED**:
  - Spatial layer separation (Background $\rightarrow$ Midground $\rightarrow$ Subject $\rightarrow$ Foreground $\rightarrow$ Typography).
  - Physical and editorial metaphors (film grain, halftone dot screens, light sheets, laser scan lines, technical annotation stamps).

### 1.4 Typographic Hierarchy
Every scene enforces a 5-tier typographic hierarchy:
1. **Eyebrow**: Monospace, $16\text{px}–18\text{px}$, uppercase, letter-spacing $3\text{px}$, left accent bar.
2. **Headline**: Arial Black / Sans-serif Display, $64\text{px}–82\text{px}$, line-height $0.88$, drop shadow.
3. **Hero Monolith / Keyword**: Display Font, $140\text{px}–365\text{px}$, letter-spacing $-10\text{px}$ to $-30\text{px}$, glowing bloom.
4. **Narrative Subtitle**: Georgia Serif / Editorial Font, $32\text{px}–36\text{px}$, high legibility over darkened vignettes.
5. **Source Mark**: Monospace Metadata Tag, $14\text{px}–16\text{px}$, letter-spacing $2\text{px}$, anchored in lower margin.

### 1.5 Temporal Progression & Motion States
Every scene must progress across 3 to 4 distinct temporal phases:
- `Phase 1 (0.0–1.2s)`: **Establish & Atmosphere** — Initial spatial framing, camera movement begins.
- `Phase 2 (1.2–2.8s)`: **Subject Entrance** — Primary protagonist or metric enters via spring physics.
- `Phase 3 (2.8–4.5s)`: **Transformation & Secondary Proof** — Laser scan lines, capacity towers, or circuit highlights activate.
- `Phase 4 (4.5–6.0s+)`: **Thematic Resolution & Match-Cut Preparation** — Aperture expansion or directional camera pull into next scene.

---

## 2. Machine-Checkable Quality Rules

| Metric | Passing Criteria | Automated Verification Mechanism |
| :--- | :--- | :--- |
| **Canvas Occupancy** | $\ge 60\%$ meaningful pixels | Multi-point bounding box & pixel density analysis |
| **Typography Contrast** | Contrast ratio $\ge 4.5:1$ against backdrop | Vignette & text-shadow assertion |
| **Visual Beat Duration** | $1.5\text{s} \le \text{Beat Duration} \le 6.0\text{s}$ | VideoSpec timeline frame range check |
| **Camera Movement** | Intensity between $0.10$ and $0.35$ | LayerStack transform matrix validator |
| **Safe Zone Margin** | Top/Bottom $\ge 120\text{px}$, Left/Right $\ge 50\text{px}$ | Safe zone boundary assertion |
| **Scene Variety** | No consecutive identical visual languages | Visual diversity matrix validator |
| **Audio-Visual Sync** | Narration words aligned monotonically | Word timestamp continuity check |
