# CAMPAIGN ENGINE IMPLEMENTATION PLAN
## Autonomous Campaign-Driven Documentary Content Production Studio

> **Comprehensive Technical Blueprint & Implementation Roadmap**  
> **Repository:** `Ritish017/Remotion`  
> **Mode:** Local-First Autonomous Studio Architecture  
> **Version:** 3.0.0

---

## 1. Executive Vision & Architectural Objective

Catalyst Content OS is an **Autonomous Campaign-Driven Documentary Content Production Studio**.

```
CAMPAIGN 
  └── MONTHLY CONTENT STRATEGY 
        └── 30-DAY CONTENT CALENDAR 
              └── DAILY EPISODE 
                    └── RESEARCH (Web / Facts / Evidence)
                          └── STORY & SCRIPT (7 Narrative Beats)
                                └── AUDIO & FORCED ALIGNMENT (TTS + Whisper)
                                      └── EPISODE DNA & NOVELTY GATE (Score >= 75)
                                            └── VISUAL DIRECTION (7 Depth Layers + Metaphors)
                                                  └── ASSETS & MOTION (20+ Visuals + 24+ Motions)
                                                        └── VIDEOSPEC ASSEMBLY
                                                              └── LIVE PREVIEW (Remotion Player)
                                                                    └── CLAUDE LIVE ITERATION
                                                                          └── VISUAL CRITIC & AUTO-REPAIR
                                                                                └── HEADLESS LOCAL RENDER
```

### Core Tenet
**NEVER generate 30 videos by reusing one template and replacing text/images.**  
Every episode is independently art-directed, narrative-grounded, and visually distinct, while remaining aligned with the broader campaign voice.

---

## 2. Technical System Specifications

### 2.1 First-Class Campaign Entity & Data Model
A campaign defines the overarching editorial franchise and brand universe.

```typescript
export interface Campaign {
  id: string;
  name: string; // e.g. "Daily AI News", "Robotics Explained", "Future Technology"
  description: string;
  niche: string;
  targetAudience: string;
  platforms: ('youtube-shorts' | 'tiktok' | 'instagram-reels' | 'x-video' | 'linkedin')[];
  publishingFrequency: 'daily' | 'weekdays' | 'tri-weekly';
  contentPillars: {
    id: string;
    title: string;
    description: string;
    weight: number; // 0.0 - 1.0 (distribution target)
  }[];
  tone: string; // "Investigative", "Analytical", "Cinematic", "Brutalist"
  editorialIdentity: {
    voice: string;
    narrativePacing: 'fast' | 'documentary' | 'deep-dive';
    complexityLevel: 'beginner' | 'intermediate' | 'expert' | 'progressive';
    citationStandard: 'rigorous_academic' | 'newsroom_verified' | 'industry_empirical';
  };
  visualIdentity: {
    primaryPalette: string; // preset ID or custom hex set
    typographyDisplay: string;
    typographyMono: string;
    textureStyle: 'paper_grain' | 'blueprint_grid' | 'film_grain' | 'clean_vector';
    editorialMarksStyle: 'red_marker' | 'patent_cyan' | 'declassified_amber';
  };
  preferredDurationSeconds: number; // e.g. 45 or 60
  aspectRatios: ('9:16' | '16:9' | '1:1')[];
  narrationStyle: {
    voice: 'onyx' | 'echo' | 'alloy' | 'fable' | 'nova' | 'shimmer';
    speed: number;
    cadenceWordsPerSec: number; // ~2.4 wps
  };
  ctaStrategy: {
    hookOutro: string;
    channelHandle: string;
    actionPrompt: string;
  };
  monthlyStrategy: {
    theme: string;
    learningProgressionEnabled: boolean;
    weeklyFocus: { week: number; focus: string }[];
  };
  campaignMemoryId: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### 2.2 Monthly Content Calendar Engine
The Calendar generates an intelligent 30/31-day editorial schedule with full state tracking.

```typescript
export type EpisodeProductionStatus = 
  | 'DRAFT'
  | 'RESEARCHING'
  | 'SCRIPT_READY'
  | 'DESIGNING'
  | 'PREVIEW'
  | 'RENDERING'
  | 'COMPLETED'
  | 'PUBLISHED'
  | 'FAILED';

export interface CalendarEpisodeDay {
  id: string;
  campaignId: string;
  date: string; // YYYY-MM-DD
  dayIndex: number; // 1..31
  topic: string;
  title: string;
  contentPillar: string;
  narrativeAngle: string;
  hook: string;
  estimatedDurationSeconds: number;
  priority: 'high' | 'standard' | 'breaking';
  
  // Pipeline Lifecycle States
  researchStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  scriptStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  visualStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  renderStatus: 'pending' | 'queued' | 'rendering' | 'completed' | 'failed';
  publishingStatus: 'draft' | 'scheduled' | 'published';
  overallStatus: EpisodeProductionStatus;
  
  // Intelligence Metrics
  episodeDNA?: EpisodeDNA;
  visualNoveltyScore?: number; // 0..100
  noveltyBreakdown?: {
    visualLanguageNovelty: number;
    compositionNovelty: number;
    motionNovelty: number;
    cameraNovelty: number;
    metaphorNovelty: number;
  };
  renderJobId?: string;
  outputMp4Path?: string;
}
```

---

### 2.3 Episode DNA (15 Distinct Dimensional Vectors)
Before any video is generated or rendered, Claude synthesizes a comprehensive **EpisodeDNA**.

```typescript
export interface EpisodeDNA {
  episodeId: string;
  // 1. Story Structure
  storyStructure: '7_beat_investigative' | 'problem_solution_breakthrough' | 'historical_chronology' | 'empirical_teardown' | 'planetary_macro_corridor' | 'counter_intuitive_disruption';
  // 2. Primary Visual Language
  visualLanguage: VisualLanguageId; // from 20+ library
  // 3. Secondary Visual Language
  secondaryVisualLanguage?: VisualLanguageId;
  // 4. Composition Language
  compositionLanguage: 'monolithic_subject_hero' | 'split_telemetry_grid' | 'diagonal_kinetic_drift' | 'isometric_schematic_plane' | 'archival_document_stack';
  // 5. Motion Language
  motionLanguage: 'high_velocity_kinetic' | 'editorial_spring_stagger' | 'micro_drift_cinematic' | 'laser_scanning_telemetry' | 'mechanical_assembly';
  // 6. Camera Language
  cameraLanguage: 'aggressive_push' | 'slow_parallax_orbit' | 'rack_focus_telephoto' | 'snap_zoom_reframe' | 'continuous_corridor_travel';
  // 7. Typography Language
  typographyLanguage: 'brutalist_display_monolith' | 'monospace_telemetry_readout' | 'editorial_newsreader_serif' | 'kinetic_mask_reveal';
  // 8. Transition Language
  transitionLanguage: 'match_cut_geometric' | 'paper_rip_slide' | 'zoom_through_portal' | 'whip_pan_momentum' | 'laser_line_wipe';
  // 9. Asset Treatment
  assetTreatment: 'cinematic_macro' | 'archival_grain' | 'duotone_editorial' | 'blueprint_inverted' | 'halftone_matrix' | 'high_contrast_bw';
  // 10. Color Treatment
  colorTreatment: {
    paletteId: string;
    base: string;
    surface: string;
    accent: string;
    secondaryAccent: string;
    highlight: string;
    text: string;
    mutedText: string;
  };
  // 11. Texture Treatment
  textureTreatment: {
    paperTexture: boolean;
    grainIntensity: number; // 0.0 - 0.25
    blueprintGrid: boolean;
    halftoneDotDensity: number;
    vignetteIntensity: number;
  };
  // 12. Caption Treatment
  captionTreatment: {
    preset: 'vox-editorial' | 'karaoke-pill' | 'kinetic-pop' | 'minimal-bottom';
    highlightColor: string;
    fontSizePx: number;
  };
  // 13. Sound Design
  soundDesign: {
    musicGenre: 'investigative_synth' | 'cinematic_strings' | 'minimal_ambient' | 'dark_electronic' | 'propulsive_percussion';
    sfxKit: 'cinematic_whooshes' | 'mechanical_clicks' | 'camera_shutters' | 'glitch_sweeps';
    duckingPercentage: number;
  };
  // 14. Editing Rhythm
  editingRhythm: {
    avgBeatDurationFrames: number; // 45..105 frames (1.5s - 3.5s)
    beatCountPerScene: number; // 2..4 beats
    microPacingRamp: 'constant' | 'escalating' | 'hook_drop_steady';
  };
  // 15. Visual Metaphors & Ending Treatment
  visualMetaphors: {
    sceneIndex: number;
    abstractConcept: string;
    concreteObject: string;
  }[];
  endingTreatment: 'signature_brand_monolith' | 'punchline_quote_stamp' | 'telemetry_archive_lock' | 'cta_kinetic_expand';
}
```

---

### 2.4 Anti-Generic Visual Style Memory & Novelty Scoring Engine

```typescript
export interface VisualStyleMemoryEntry {
  episodeId: string;
  date: string;
  topic: string;
  dna: EpisodeDNA;
}

export class AntiGenericEngine {
  /**
   * Calculates multi-dimensional Euclidean/cosine distance across historical episodes
   * Returns a score 0 - 100.
   * Target: 80 - 95.
   * Minimum acceptable: 75.
   */
  public calculateVisualNoveltyScore(
    proposedDNA: EpisodeDNA,
    history: VisualStyleMemoryEntry[]
  ): {
    score: number;
    passed: boolean;
    breakdown: {
      visualLanguageNovelty: number;
      compositionNovelty: number;
      motionNovelty: number;
      cameraNovelty: number;
      metaphorNovelty: number;
    };
    redesignRecommendations?: string[];
  };
}
```

If `score < 75`:
1. Redesign loop triggers automatically.
2. System instructs the Visual Director: *"Episode DNA too similar to Episode from [Date]. Visual language was used 2 days ago. Swap primary visual language from 'technical-diagram' to 'cinematic-statistic' with 'diagonal_kinetic_drift' and amber/cyan duotone palette."*
3. DNA is regenerated until `score >= 75`.

---

### 2.5 Story-First Visual Design Mapping
Visuals are never decoupled from narration. For every narration line:

$$\text{Narration} \longrightarrow \text{Claim} \longrightarrow \text{Narrative Purpose} \longrightarrow \text{Emotional Intent} \longrightarrow \text{Visual Metaphor} \longrightarrow \text{Protagonist} \longrightarrow \text{Composition} \longrightarrow \text{Motion} \longrightarrow \text{Transition}$$

```typescript
export interface StoryFirstVisualMapping {
  narrationSegment: string;
  wordRange: [number, number];
  claim?: string;
  narrativePurpose: string;
  emotionalIntent: 'curiosity' | 'alarm' | 'revelation' | 'technological_wonder' | 'sobering_reality' | 'triumph';
  visualMetaphor: {
    abstractConcept: string;
    concreteVisual: string;
    spatialAnchor: 'center' | 'full-bleed' | 'split-left' | 'isometric-grid';
  };
  visualProtagonist: string;
  visualBeat: VisualBeat;
  motionBehavior: MotionPhase;
  transition: TransitionBeatConfig;
  typographyTreatment: TypographyBeatConfig;
  soundCue?: SFXTrigger;
}
```

---

### 2.6 Visual Variety & Semantic Motion Libraries

#### 20+ Registered Visual Languages
1. `cinematic-photo` (Macro optics, shallow depth of field, natural lighting)
2. `investigative-editorial` (Archival paper, typewriter headlines, redaction bars)
3. `technical-blueprint` (Inverted schematic, cyan grid, component callouts)
4. `archival-collage` (Layered historical documents, vintage photo cutouts, tape marks)
5. `macro-photography` (Extreme close-up detail, subtle optical drift)
6. `kinetic-typography` (Full-frame typographic takeover, synchronized word bursts)
7. `data-journalism` (Monolithic bar charts, exponential growth curves, benchmark meters)
8. `geographic-storytelling` (Planetary node networks, fiber optic corridor paths)
9. `industrial-documentary` (Heavy machinery schematics, isometric factory floors)
10. `scientific-visualization` (Toroidal plasma rings, quantum orbital paths, molecular lattices)
11. `financial-terminal` (High-frequency telemetry, dark obsidian order books, ticker ribbons)
12. `newspaper-editorial` (Declassified broadsheet spread, ink stamp endorsements)
13. `evidence-board` (Pinboard strings, connected polaroids, temporal markers)
14. `satellite-reconnaissance` (High-altitude orbital imagery, coordinate HUD crosshairs)
15. `exploded-diagram` (3D separated sub-assembly components, dimension callouts)
16. `architectural-viz` (Wireframe perspective lines, elevation cross-sections)
17. `cinematic-cutout` (High-contrast subject cutout with dynamic 2.5D drop shadow)
18. `depth-2-5d-parallax` (Multiplane camera movement across isolated depth planes)
19. `isometric-world` (3D tilted technical micro-world with animated data streams)
20. `timeline-reconstruction` (Chronological sequence milestones with glowing event nodes)

#### 24+ Semantic Motion Primitives
1. `camera_push` (Steep linear or spring push-in toward focal point)
2. `camera_pull` (Heroic wide reveal of entire composition)
3. `camera_orbit` (Gentle 3D rotational tilt around dominant subject)
4. `parallax_travel` (Differential layer translation based on depth coordinate)
5. `depth_shift` (Foreground blur transition to background focus)
6. `match_cut_geometry` (Continuous alignment of geometric shape across scene boundary)
7. `mask_reveal` (Diagonal or radial wipe revealing underlying visual)
8. `object_reveal` (Spring-damped emergence from z-plane)
9. `typography_takeover` (Headline scales to fill 90% of screen before settling)
10. `kinetic_word_burst` (Word-by-word staggered entrance tied to Whisper alignment)
11. `image_slide_momentum` (Physical archival photo slide with momentum friction)
12. `foreground_wipe` (Rapid foreground asset transit occluding frame for cut)
13. `zoom_through_portal` (Camera accelerates into aperture/opening into next scene)
14. `perspective_travel` (3D grid motion into infinite vanishing point)
15. `mechanical_assembly` (Sub-parts converging into unified technical assembly)
16. `data_propagation` (Pulse wave travelling along network edges)
17. `map_corridor_travel` (Flight arc between two geographic coordinate pins)
18. `chart_transformation` (Bar heights dynamically inflating with spring physics)
19. `particle_flow` (Directed particulate streams conveying energy/data)
20. `signal_propagation` (Concentric radar/signal rings expanding from anchor)
21. `laser_sweep` (High-intensity neon scan bar sweeping across blueprint)
22. `light_sweep` (Diagonal specular highlight glinting across metallic textures)
23. `documentary_whip` (High-speed motion-blurred pan between subjects)
24. `rack_focus_simulation` (Simulated camera lens focus shift between two subjects)

---

### 2.7 Scene Architecture & Temporal Phases
Every scene is divided into 5 temporal phases:
- **ENTRY (0–15%)**: Establishing transition, subject entry with spring kinematics, background stabilization.
- **BUILD (15–40%)**: Secondary elements appear, telemetry labels draw, narrative context forms.
- **EMPHASIS (40–70%)**: Dominant keyword or metric explodes in scale, camera movement peaks, audio ducking tightens.
- **TRANSFORMATION (70–88%)**: Visual state pivots (e.g. chart turns into map, schematic explodes, data surges).
- **EXIT (88–100%)**: Transition lead-in, shared geometry alignment for match-cut.

---

### 2.8 Closed-Loop Visual Critic & Auto-Repair Engine

```typescript
export class AutoRepairController {
  /**
   * Executes iterative critique and automated repair loop:
   * VideoSpec -> Render Review Frames -> VisualCriticAgent -> CorrectionPatch -> VideoSpec Update -> Re-critique
   */
  public async executeRepairLoop(
    initialSpec: VideoSpec,
    options: {
      maxIterations: number; // default: 3
      targetScore: number; // default: 8.5
      projectId?: string;
    }
  ): Promise<{
    finalSpec: VideoSpec;
    iterations: number;
    passed: boolean;
    finalScore: number;
    auditLog: VisualCritiqueReport[];
  }>;
}
```

---

## 3. Phased Implementation Roadmap

### Phase 1: Database Entities & Campaign Schema Expansion
- [x] Audit SQLite database provider (`src/lib/database/SQLiteDatabaseProvider.ts`).
- [ ] Implement `campaigns`, `campaign_memory`, `episode_dna`, and `visual_style_memory` SQLite tables.
- [ ] Create repository functions in `SQLiteDatabaseProvider.ts` with full CRUD support.
- [ ] Create `/api/campaigns` endpoints for campaign lifecycle management.

### Phase 2: Campaign Director Agent & 30-Day Calendar Generator
- [ ] Create `CampaignDirector.ts` agent in `src/lib/ai/claude/agents/` using `ModelRouter`.
- [ ] Implement 30-day content calendar generator with learning progressions, pillar weighting, and topic novelty.
- [ ] Connect calendar API to SQLite database.

### Phase 3: Episode DNA Engine & Anti-Generic Novelty Scorer
- [ ] Implement `EpisodeDNASchema` and `AntiGenericEngine` in `src/lib/video-spec/dna.ts`.
- [ ] Build `VisualStyleMemory` persistence.
- [ ] Implement `calculateVisualNoveltyScore()` with $\ge 75$ threshold and auto-redesign fallback.

### Phase 4: Story-First Visual Mapping & Visual / Motion Library Expansion
- [ ] Implement `StoryFirstVisualMapper` in `src/lib/ai/claude/agents/`.
- [ ] Expand `VisualLanguageRegistry.tsx` to support 20+ full-bleed visual languages.
- [ ] Expand `SemanticMotionPrimitives.tsx` to support 24+ motion behaviors.
- [ ] Incorporate 5 temporal scene phases into `VisualBeatRenderer.tsx`.

### Phase 5: Closed-Loop Auto-Repair & Multimodal Vision Critic Controller
- [ ] Implement `AutoRepairController.ts` in `src/lib/qa/autoRepair.ts`.
- [ ] Connect `VisualCriticAgent` (Claude Vision) with automated VideoSpec patch application.
- [ ] Enforce Human Quality Gate standard ($\ge 8.5/10$).

### Phase 6: Full Campaign Studio UI & Interactive Calendar Workspace
- [ ] Update `src/app/campaigns/page.tsx` and `src/app/campaigns/[id]/page.tsx` with monthly calendar grid, status badges, and episode launcher.
- [ ] Connect calendar episode click to the full `RemotionProductionStudio` workspace.
- [ ] Enable Claude live iteration with instant zero-render preview updates.

### Phase 7: Verification, Automated Testing & Broadcast Rendering
- [ ] Run `npm test` and verify all unit/integration tests pass.
- [ ] Run `npx tsc --noEmit` and confirm 0 compilation errors.
- [ ] Run `npm run build` and verify Next.js production build passes.
- [ ] Produce real, multi-episode broadcast MP4 videos with frame-level visual verification.
