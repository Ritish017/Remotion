import { z } from 'zod';
import { VisualLanguageIdSchema, AssetTreatmentSchema, type VisualLanguageId } from './visual';

export const StoryStructureSchema = z.enum([
  '7_beat_investigative',
  'problem_solution_breakthrough',
  'historical_chronology',
  'empirical_teardown',
  'planetary_macro_corridor',
  'counter_intuitive_disruption',
  'forensic_case_study',
  'architectural_blueprint_reveal'
]);

export type StoryStructure = z.infer<typeof StoryStructureSchema>;

export const CompositionLanguageSchema = z.enum([
  'monolithic_subject_hero',
  'split_telemetry_grid',
  'diagonal_kinetic_drift',
  'isometric_schematic_plane',
  'archival_document_stack',
  'full_bleed_macro_optic',
  'multiplane_corridor_corridor',
  'brutalist_typographic_grid'
]);

export type CompositionLanguage = z.infer<typeof CompositionLanguageSchema>;

export const MotionLanguageSchema = z.enum([
  'high_velocity_kinetic',
  'editorial_spring_stagger',
  'micro_drift_cinematic',
  'laser_scanning_telemetry',
  'mechanical_assembly',
  'continuous_momentum_push',
  'rack_focus_depth_shift',
  'documentary_whip_snap'
]);

export type MotionLanguage = z.infer<typeof MotionLanguageSchema>;

export const CameraLanguageSchema = z.enum([
  'aggressive_push',
  'slow_parallax_orbit',
  'rack_focus_telephoto',
  'snap_zoom_reframe',
  'continuous_corridor_travel',
  'pan_diagonal_drift',
  'subtle_handheld_micro',
  'overhead_satellite_zoom'
]);

export type CameraLanguage = z.infer<typeof CameraLanguageSchema>;

export const TypographyLanguageSchema = z.enum([
  'brutalist_display_monolith',
  'monospace_telemetry_readout',
  'editorial_newsreader_serif',
  'kinetic_mask_reveal',
  'tracking_expansion_bold',
  'understated_archive_caption'
]);

export type TypographyLanguage = z.infer<typeof TypographyLanguageSchema>;

export const TransitionLanguageSchema = z.enum([
  'match_cut_geometric',
  'paper_rip_slide',
  'zoom_through_portal',
  'whip_pan_momentum',
  'laser_line_wipe',
  'foreground_element_transit',
  'crossfade_dissolve',
  'none'
]);

export type TransitionLanguage = z.infer<typeof TransitionLanguageSchema>;

export const ColorTreatmentSchema = z.object({
  paletteId: z.string().default('vox_investigation_dark'),
  base: z.string().default('#0b0d13'),
  surface: z.string().default('#161922'),
  accent: z.string().default('#ffd166'),
  secondaryAccent: z.string().default('#00c9a7'),
  highlight: z.string().default('#f0522a'),
  text: z.string().default('#f8fafc'),
  mutedText: z.string().default('#94a3b8'),
});

export type ColorTreatment = z.infer<typeof ColorTreatmentSchema>;

export const TextureTreatmentSchema = z.object({
  paperTexture: z.boolean().default(true),
  grainIntensity: z.number().min(0).max(1).default(0.10),
  blueprintGrid: z.boolean().default(true),
  halftoneDotDensity: z.number().min(0).max(10).default(4),
  vignetteIntensity: z.number().min(0).max(1).default(0.40),
});

export type TextureTreatment = z.infer<typeof TextureTreatmentSchema>;

export const CaptionTreatmentSchema = z.object({
  preset: z.enum(['vox-editorial', 'karaoke-pill', 'kinetic-pop', 'minimal-bottom']).default('vox-editorial'),
  highlightColor: z.string().default('#ffd166'),
  fontSizePx: z.number().positive().default(42),
});

export type CaptionTreatment = z.infer<typeof CaptionTreatmentSchema>;

export const SoundDesignSchema = z.object({
  musicGenre: z.enum([
    'investigative_synth',
    'cinematic_strings',
    'minimal_ambient',
    'dark_electronic',
    'propulsive_percussion',
    'architectural_drone'
  ]).default('investigative_synth'),
  sfxKit: z.enum([
    'cinematic_whooshes',
    'mechanical_clicks',
    'camera_shutters',
    'glitch_sweeps',
    'telemetry_beeps'
  ]).default('cinematic_whooshes'),
  duckingPercentage: z.number().min(0).max(1).default(0.25),
});

export type SoundDesign = z.infer<typeof SoundDesignSchema>;

export const EditingRhythmSchema = z.object({
  avgBeatDurationFrames: z.number().int().positive().default(75), // 2.5s @ 30fps
  beatCountPerScene: z.number().int().min(1).max(5).default(3),
  microPacingRamp: z.enum(['constant', 'escalating', 'hook_drop_steady']).default('escalating'),
});

export type EditingRhythm = z.infer<typeof EditingRhythmSchema>;

export const VisualMetaphorItemSchema = z.object({
  sceneIndex: z.number().int().nonnegative(),
  abstractConcept: z.string(),
  concreteObject: z.string(),
});

export type VisualMetaphorItem = z.infer<typeof VisualMetaphorItemSchema>;

export const EpisodeDNASchema = z.object({
  episodeId: z.string(),
  storyStructure: StoryStructureSchema.default('7_beat_investigative'),
  visualLanguage: VisualLanguageIdSchema.default('editorial-paper'),
  secondaryVisualLanguage: VisualLanguageIdSchema.optional(),
  compositionLanguage: CompositionLanguageSchema.default('monolithic_subject_hero'),
  motionLanguage: MotionLanguageSchema.default('editorial_spring_stagger'),
  cameraLanguage: CameraLanguageSchema.default('aggressive_push'),
  typographyLanguage: TypographyLanguageSchema.default('brutalist_display_monolith'),
  transitionLanguage: TransitionLanguageSchema.default('match_cut_geometric'),
  assetTreatment: AssetTreatmentSchema.default('cinematic_macro'),
  colorTreatment: ColorTreatmentSchema.default({
    paletteId: 'vox_investigation_dark',
    base: '#0b0d13',
    surface: '#161922',
    accent: '#ffd166',
    secondaryAccent: '#00c9a7',
    highlight: '#f0522a',
    text: '#f8fafc',
    mutedText: '#94a3b8',
  }),
  textureTreatment: TextureTreatmentSchema.default({
    paperTexture: true,
    grainIntensity: 0.10,
    blueprintGrid: true,
    halftoneDotDensity: 4,
    vignetteIntensity: 0.40,
  }),
  captionTreatment: CaptionTreatmentSchema.default({
    preset: 'vox-editorial',
    highlightColor: '#ffd166',
    fontSizePx: 42,
  }),
  soundDesign: SoundDesignSchema.default({
    musicGenre: 'investigative_synth',
    sfxKit: 'cinematic_whooshes',
    duckingPercentage: 0.25,
  }),
  editingRhythm: EditingRhythmSchema.default({
    avgBeatDurationFrames: 75,
    beatCountPerScene: 3,
    microPacingRamp: 'escalating',
  }),
  visualMetaphors: z.array(VisualMetaphorItemSchema).default([]),
  endingTreatment: z.enum([
    'signature_brand_monolith',
    'punchline_quote_stamp',
    'telemetry_archive_lock',
    'cta_kinetic_expand'
  ]).default('signature_brand_monolith'),
});

export type EpisodeDNA = z.infer<typeof EpisodeDNASchema>;

export interface VisualNoveltyResult {
  score: number; // 0 to 100
  passed: boolean; // >= 75
  breakdown: {
    visualLanguageNovelty: number;
    compositionNovelty: number;
    motionNovelty: number;
    cameraNovelty: number;
    metaphorNovelty: number;
  };
  redesignRecommendations?: string[];
}

/**
 * AntiGenericEngine
 * 
 * Computes multi-dimensional distance across historical episode DNA to ensure
 * every episode feels genuinely unique and art-directed.
 */
export class AntiGenericEngine {
  public static readonly MIN_ACCEPTABLE_NOVELTY = 75;
  public static readonly TARGET_MIN_NOVELTY = 80;
  public static readonly TARGET_MAX_NOVELTY = 95;

  /**
   * Calculates visual novelty score for a proposed EpisodeDNA against historical records
   */
  public static calculateNoveltyScore(
    proposed: EpisodeDNA,
    history: Array<{ dna: EpisodeDNA | any; date?: string; episodeId?: string }>
  ): VisualNoveltyResult {
    if (!history || history.length === 0) {
      // First episode in campaign receives baseline maximum novelty
      return {
        score: 95,
        passed: true,
        breakdown: {
          visualLanguageNovelty: 95,
          compositionNovelty: 95,
          motionNovelty: 95,
          cameraNovelty: 95,
          metaphorNovelty: 95,
        },
      };
    }

    // Inspect the recent window (up to past 10 episodes)
    const recentHistory = history.slice(0, 10);
    const recommendations: string[] = [];

    // 1. Visual Language Frequency & Recency Check (Weight: 30%)
    let vLangMatchCount = 0;
    let immediatePrevVLangMatch = false;
    recentHistory.forEach((item, idx) => {
      const histVLang = item.dna?.visualLanguage || item.dna?.visual_language;
      if (histVLang === proposed.visualLanguage) {
        vLangMatchCount++;
        if (idx === 0) immediatePrevVLangMatch = true;
      }
    });

    let visualLanguageNovelty = 100 - (vLangMatchCount * 22);
    if (immediatePrevVLangMatch) {
      visualLanguageNovelty -= 25;
      recommendations.push(
        `Visual language "${proposed.visualLanguage}" was used in the previous episode. Swap to an alternative language (e.g. data-story, technical-diagram, or archival-collage).`
      );
    }
    visualLanguageNovelty = Math.max(20, Math.min(100, visualLanguageNovelty));

    // 2. Composition Language Check (Weight: 20%)
    let compMatchCount = 0;
    recentHistory.forEach((item, idx) => {
      const histComp = item.dna?.compositionLanguage || item.dna?.composition_language;
      if (histComp === proposed.compositionLanguage) {
        compMatchCount += idx === 0 ? 2 : 1;
      }
    });
    let compositionNovelty = Math.max(30, Math.min(100, 100 - compMatchCount * 18));
    if (compositionNovelty < 75) {
      recommendations.push(
        `Composition style "${proposed.compositionLanguage}" repeats recent structure. Shift to diagonal_kinetic_drift or split_telemetry_grid.`
      );
    }

    // 3. Motion Language Check (Weight: 20%)
    let motionMatchCount = 0;
    recentHistory.forEach((item) => {
      const histMotion = item.dna?.motionLanguage || item.dna?.motion_language;
      if (histMotion === proposed.motionLanguage) motionMatchCount++;
    });
    let motionNovelty = Math.max(35, Math.min(100, 100 - motionMatchCount * 15));

    // 4. Camera Language Check (Weight: 15%)
    let cameraMatchCount = 0;
    recentHistory.forEach((item) => {
      const histCam = item.dna?.cameraLanguage || item.dna?.camera_language;
      if (histCam === proposed.cameraLanguage) cameraMatchCount++;
    });
    let cameraNovelty = Math.max(40, Math.min(100, 100 - cameraMatchCount * 15));

    // 5. Visual Metaphors Uniqueness Check (Weight: 15%)
    let metaphorClash = false;
    const proposedMetaphors = proposed.visualMetaphors.map(m => m.concreteObject.toLowerCase());
    recentHistory.forEach((item) => {
      const pastMetaphors: string[] = (item.dna?.visualMetaphors || []).map((m: any) => (m.concreteObject || '').toLowerCase());
      proposedMetaphors.forEach((p) => {
        if (p && pastMetaphors.includes(p)) {
          metaphorClash = true;
        }
      });
    });
    let metaphorNovelty = metaphorClash ? 60 : 95;
    if (metaphorClash) {
      recommendations.push(`One or more visual metaphors overlap with recent episodes. Introduce fresh physical analogies.`);
    }

    // Weighted Overall Calculation
    const overallScore = Math.round(
      visualLanguageNovelty * 0.30 +
      compositionNovelty * 0.20 +
      motionNovelty * 0.20 +
      cameraNovelty * 0.15 +
      metaphorNovelty * 0.15
    );

    const passed = overallScore >= AntiGenericEngine.MIN_ACCEPTABLE_NOVELTY;

    return {
      score: overallScore,
      passed,
      breakdown: {
        visualLanguageNovelty,
        compositionNovelty,
        motionNovelty,
        cameraNovelty,
        metaphorNovelty,
      },
      redesignRecommendations: recommendations.length > 0 ? recommendations : undefined,
    };
  }
}
