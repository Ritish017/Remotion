import { z } from 'zod';

export const VisualLanguageIdSchema = z.enum([
  'cinematic-photo',
  'archival-photo',
  'hero-photographic',
  'macro-detail',
  'macro-photography',
  'product-hero',
  'editorial-paper',
  'investigative-editorial',
  'archival-newspaper',
  'newspaper-editorial',
  'documentary-collage',
  'archival-collage',
  'technical-diagram',
  'technical-blueprint',
  'blueprint',
  'schematic',
  'exploded-diagram',
  'data-story',
  'data-journalism',
  'cinematic-statistic',
  'geographic-story',
  'geographic-storytelling',
  'satellite',
  'satellite-reconnaissance',
  'timeline-story',
  'timeline-reconstruction',
  'comparison-story',
  'cutout-explainer',
  'cinematic-cutout',
  'hardware-cutout',
  'interface-explainer',
  'code-explainer',
  'kinetic-headline',
  'kinetic-typography',
  'quote-editorial',
  'chapter-card',
  'cinematic-outro',
  'industrial-documentary',
  'scientific-visualization',
  'financial-terminal',
  'evidence-board',
  'architectural-viz',
  'depth-2-5d-parallax',
  'isometric-world',
  '3d-semiconductor',
  '3d-neural-network',
  '3d-fusion-reactor',
  '3d-robotics-arm',
  '3d-engineering',
  'three-d-scene'
]);

export type VisualLanguageId = z.infer<typeof VisualLanguageIdSchema>;


export const AssetTreatmentSchema = z.enum([
  'cinematic_macro',
  'archival_grain',
  'duotone_editorial',
  'cutout_shadow',
  'paper_textured',
  'clean_vector',
  'blueprint_inverted',
  'halftone_matrix',
  'high_contrast_bw',
  'thermal_luminescence',
  'standard'
]).default('standard');

export type AssetTreatment = z.infer<typeof AssetTreatmentSchema>;

export const AssetRequestSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['photo', 'archive', 'icon', 'logo', 'map', 'diagram', 'screenshot', 'video', 'texture', 'generatedGraphic', 'cutout']),
  subject: z.string(),
  purpose: z.string().optional(),
  treatment: AssetTreatmentSchema.optional().default('standard'),
  url: z.string().optional(),
  localPath: z.string().optional(),
  aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:3', 'custom']).optional().default('16:9'),
  canvasCoveragePct: z.number().min(0).max(100).optional().default(75),
});

export interface AssetRequest {
  id?: string;
  type: 'photo' | 'archive' | 'icon' | 'logo' | 'map' | 'diagram' | 'screenshot' | 'video' | 'texture' | 'generatedGraphic' | 'cutout';
  subject: string;
  purpose?: string;
  treatment?: AssetTreatment;
  url?: string;
  localPath?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | 'custom';
  canvasCoveragePct?: number;
}

export const SpatialTransformSchema = z.object({
  x: z.number().optional().default(0),
  y: z.number().optional().default(0),
  scale: z.number().optional().default(1.0),
  rotation: z.number().optional().default(0),
  opacity: z.number().min(0).max(1).optional().default(1.0),
  blurPx: z.number().nonnegative().optional().default(0),
  perspectiveX: z.number().optional(),
  perspectiveY: z.number().optional(),
  perspectiveZ: z.number().optional(),
});

export interface SpatialTransform {
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
  blurPx?: number;
  perspectiveX?: number;
  perspectiveY?: number;
  perspectiveZ?: number;
}

export const VisualLayerRoleSchema = z.enum([
  'background',
  'backgroundMid',
  'midground',
  'subject',
  'foreground',
  'typography',
  'editorialMarks'
]);

export type VisualLayerRole = z.infer<typeof VisualLayerRoleSchema>;

export const VisualLayerSpecSchema = z.object({
  id: z.string(),
  role: VisualLayerRoleSchema,
  depth: z.number().optional().default(1.0),
  asset: AssetRequestSchema.optional(),
  transform: SpatialTransformSchema.optional().default({
    x: 0,
    y: 0,
    scale: 1.0,
    rotation: 0,
    opacity: 1.0,
    blurPx: 0,
  }),
  treatment: AssetTreatmentSchema.optional(),
  visible: z.boolean().optional().default(true),
  customProps: z.record(z.string(), z.any()).optional().default({}),
});

export interface VisualLayerSpec {
  id: string;
  role: VisualLayerRole;
  depth?: number;
  asset?: AssetRequest;
  transform?: SpatialTransform;
  treatment?: AssetTreatment;
  visible?: boolean;
  customProps?: Record<string, any>;
}

export const SpatialCompositionSpecSchema = z.object({
  anchor: z.enum(['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'full-bleed', 'split-left', 'split-right']).optional().default('full-bleed'),
  focalPoint: z.object({
    x: z.number().min(0).max(100).default(50),
    y: z.number().min(0).max(100).default(50),
  }).optional().default({ x: 50, y: 50 }),
  occupancyPct: z.number().min(20).max(100).optional().default(80),
  safeZoneRespect: z.boolean().optional().default(true),
  negativeSpaceOrientation: z.enum(['top', 'bottom', 'left', 'right', 'distributed']).optional().default('top'),
});

export interface SpatialCompositionSpec {
  anchor?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'full-bleed' | 'split-left' | 'split-right';
  focalPoint?: { x: number; y: number };
  occupancyPct?: number;
  safeZoneRespect?: boolean;
  negativeSpaceOrientation?: 'top' | 'bottom' | 'left' | 'right' | 'distributed';
}

export const TypographyBeatConfigSchema = z.object({
  treatment: z.enum([
    'editorial_kinetic',
    'word_by_word',
    'phrase_reveal',
    'mask_reveal',
    'tracking_expansion',
    'keyword_spotlight',
    'marker_highlight',
    'counter_emphasis',
    'understated_caption',
    'bold_headline',
    'brutalist_display',
    'none'
  ]).optional().default('brutalist_display'),
  eyebrow: z.string().optional(),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  giantKeyword: z.string().optional(),
  heroStatistic: z.string().optional(),
  narrative: z.string().optional(),
  source: z.string().optional(),
  emphasisWords: z.array(z.string()).optional().default([]),
  annotation: z.string().optional(),
  position: z.enum(['top', 'center', 'bottom', 'left', 'right', 'split']).optional().default('top'),
  fontSize: z.number().optional(),
  fontScale: z.enum(['monolith_huge', 'display_giant', 'editorial_bold', 'monospace_readout']).optional().default('display_giant'),
  highlightColor: z.string().optional(),
});

export interface TypographyBeatConfig {
  treatment?: 'editorial_kinetic' | 'word_by_word' | 'phrase_reveal' | 'mask_reveal' | 'tracking_expansion' | 'keyword_spotlight' | 'marker_highlight' | 'counter_emphasis' | 'understated_caption' | 'bold_headline' | 'brutalist_display' | 'none';
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  giantKeyword?: string;
  heroStatistic?: string;
  narrative?: string;
  source?: string;
  emphasisWords?: string[];
  annotation?: string;
  position?: 'top' | 'center' | 'bottom' | 'left' | 'right' | 'split';
  fontSize?: number;
  fontScale?: 'monolith_huge' | 'display_giant' | 'editorial_bold' | 'monospace_readout';
  highlightColor?: string;
}

export const CameraBeatConfigSchema = z.object({
  movement: z.enum([
    'push',
    'pull',
    'pan-left',
    'pan-right',
    'pan-up',
    'pan-down',
    'zoom-region',
    'orbit',
    'parallax',
    'rack-focus',
    'handheld',
    'micro-drift',
    'whip-pan',
    'snap-zoom',
    'static'
  ]).optional().default('push'),
  intensity: z.number().min(0).max(1).optional().default(0.22),
  easing: z.enum(['ease-in-out', 'ease-out', 'linear', 'spring', 'snap']).optional().default('ease-out'),
  startScale: z.number().optional(),
  endScale: z.number().optional(),
  focalPoint: z.object({
    x: z.number().min(0).max(100).default(50),
    y: z.number().min(0).max(100).default(50),
  }).optional().default({ x: 50, y: 50 }),
});

export interface CameraBeatConfig {
  movement?: 'push' | 'pull' | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'zoom-region' | 'orbit' | 'parallax' | 'rack-focus' | 'handheld' | 'micro-drift' | 'whip-pan' | 'snap-zoom' | 'static';
  intensity?: number;
  easing?: 'ease-in-out' | 'ease-out' | 'linear' | 'spring' | 'snap';
  startScale?: number;
  endScale?: number;
  focalPoint?: { x: number; y: number };
}

export const TransitionBeatConfigSchema = z.object({
  type: z.enum([
    'cut',
    'fade',
    'crossfade',
    'match-cut',
    'film-burn',
    'linear-blur',
    'cross-zoom',
    'push-cut',
    'dreamy-zoom',
    'clock-wipe',
    'slide',
    'wipe',
    'flip',
    'dissolve',
    'mask-reveal',
    'camera-push',
    'camera-pull',
    'whip',
    'paper-slide',
    'shape-morph',
    'zoom-through',
    'light-flash',
    'laser-sweep',
    'none'
  ]).optional().default('fade'),
  durationFrames: z.number().int().nonnegative().optional().default(12),
  sharedGeometry: z.enum(['circle', 'rect', 'chip', 'line', 'card', 'ring', 'die', 'none']).optional().default('none'),
  direction: z.enum(['left', 'right', 'up', 'down', 'in', 'out']).optional().default('right'),
});

export interface TransitionBeatConfig {
  type?: 'cut' | 'fade' | 'crossfade' | 'match-cut' | 'wipe' | 'mask-reveal' | 'camera-push' | 'camera-pull' | 'whip' | 'paper-slide' | 'shape-morph' | 'zoom-through' | 'light-flash' | 'laser-sweep' | 'none';
  durationFrames?: number;
  sharedGeometry?: 'circle' | 'rect' | 'chip' | 'line' | 'card' | 'ring' | 'die' | 'none';
  direction?: 'left' | 'right' | 'up' | 'down' | 'in' | 'out';
}

export const MotionPhaseSchema = z.object({
  phase: z.number().int().nonnegative().optional().default(0),
  triggerWord: z.string().optional(),
  frameOffset: z.number().int().optional().default(0),
  action: z.enum([
    'SPRING_IN',
    'SPRING_OUT',
    'CAMERA_PUSH',
    'CAMERA_PULL',
    'LASER_SCAN_SWEEP',
    'COUNTER_SURGE',
    'TOWER_ELEVATE',
    'DIE_ROTATE_3D',
    'CORRIDOR_TRACE',
    'TEXT_TAKEOVER',
    'KEYWORD_POP',
    'MARKER_DRAW',
    'DEPTH_SHIFT',
    'ORBIT',
    'MATCH_CUT'
  ]).optional().default('SPRING_IN'),
  targetLayer: VisualLayerRoleSchema.optional().default('subject'),
  durationFrames: z.number().int().positive().optional().default(15),
  params: z.record(z.string(), z.any()).optional().default({}),
});

export interface MotionPhase {
  phase?: number;
  triggerWord?: string;
  frameOffset?: number;
  action?: 'SPRING_IN' | 'SPRING_OUT' | 'CAMERA_PUSH' | 'CAMERA_PULL' | 'LASER_SCAN_SWEEP' | 'COUNTER_SURGE' | 'TOWER_ELEVATE' | 'DIE_ROTATE_3D' | 'CORRIDOR_TRACE' | 'TEXT_TAKEOVER' | 'KEYWORD_POP' | 'MARKER_DRAW' | 'DEPTH_SHIFT' | 'ORBIT' | 'MATCH_CUT';
  targetLayer?: VisualLayerRole;
  durationFrames?: number;
  params?: Record<string, any>;
}

export const VisualBeatSchema = z.object({
  id: z.string(),
  beatIndex: z.number().int().nonnegative().optional(),
  startFrame: z.number().int().nonnegative(),
  durationInFrames: z.number().int().positive(),
  narrativePurpose: z.string(),
  visualIntent: z.string(),
  visualMetaphor: z.string().optional(),
  primaryVisual: z.string().default('editorial-paper'),
  secondaryVisuals: z.array(z.string()).optional().default([]),
  composition: SpatialCompositionSpecSchema.optional().default({
    anchor: 'full-bleed',
    focalPoint: { x: 50, y: 50 },
    occupancyPct: 80,
    safeZoneRespect: true,
    negativeSpaceOrientation: 'top',
  }),
  layerSpecs: z.array(VisualLayerSpecSchema).optional().default([]),
  layers: z.array(z.string()).optional().default(['background', 'subject', 'typography']),
  assets: z.array(AssetRequestSchema).default([]),
  camera: CameraBeatConfigSchema.optional().default({ movement: 'push', intensity: 0.22, easing: 'ease-out', focalPoint: { x: 50, y: 50 } }),
  motion: z.array(z.string()).optional().default(['spring_in', 'slow_drift']),
  motionChoreography: z.array(MotionPhaseSchema).optional().default([]),
  typography: TypographyBeatConfigSchema.optional(),
  transition: TransitionBeatConfigSchema.optional().default({ type: 'fade', durationFrames: 12, sharedGeometry: 'none', direction: 'right' }),
  emphasis: z.object({
    targetWord: z.string().optional(),
    triggerFrame: z.number().int().nonnegative().optional(),
    action: z.enum(['pop', 'glow', 'camera_push', 'counter_start', 'diagram_pulse', 'laser_scan', 'none']).default('none'),
  }).optional(),
  props: z.record(z.string(), z.any()).optional().default({}),
});

export interface VisualBeat {
  id: string;
  beatIndex?: number;
  startFrame: number;
  durationInFrames: number;
  narrativePurpose: string;
  visualIntent: string;
  visualMetaphor?: string;
  primaryVisual: string;
  secondaryVisuals?: string[];
  composition?: SpatialCompositionSpec;
  layerSpecs?: VisualLayerSpec[];
  layers?: string[];
  assets: AssetRequest[];
  camera?: CameraBeatConfig;
  motion?: string[];
  motionChoreography?: MotionPhase[];
  typography?: TypographyBeatConfig;
  transition?: TransitionBeatConfig;
  emphasis?: {
    targetWord?: string;
    triggerFrame?: number;
    action?: 'pop' | 'glow' | 'camera_push' | 'counter_start' | 'diagram_pulse' | 'laser_scan' | 'none';
  };
  props?: Record<string, any>;
}

export const VisualPlanSceneSchema = z.object({
  sceneId: z.string(),
  sceneNumber: z.number().int().positive(),
  narrativePurpose: z.string(),
  visualIntent: z.string(),
  visualMetaphor: z.string().optional(),
  visualLanguage: z.string().optional().default('editorial-paper'),
  beats: z.array(VisualBeatSchema).min(1),
  camera: CameraBeatConfigSchema.optional(),
  transition: TransitionBeatConfigSchema.optional(),
});

export interface VisualPlanScene {
  sceneId: string;
  sceneNumber: number;
  narrativePurpose: string;
  visualIntent: string;
  visualMetaphor?: string;
  visualLanguage?: string;
  beats: VisualBeat[];
  camera?: CameraBeatConfig;
  transition?: TransitionBeatConfig;
}

export const VisualPlanSchema = z.object({
  title: z.string(),
  totalDurationFrames: z.number().int().positive(),
  scenes: z.array(VisualPlanSceneSchema).min(1),
  brandIdentity: z.string().optional(),
  format: z.enum(['9:16', '16:9', '1:1']).optional().default('9:16'),
  motionSeed: z.number().int().optional().default(42),
});

export interface VisualPlan {
  title: string;
  totalDurationFrames: number;
  scenes: VisualPlanScene[];
  brandIdentity?: string;
  format?: '9:16' | '16:9' | '1:1';
  motionSeed?: number;
}
