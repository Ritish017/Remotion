import { z } from 'zod';
import { CameraConfigSchema, MotionConfigSchema } from './schema';

export const VisualLanguageIdSchema = z.enum([
  'cinematic-photo',
  'archival-photo',
  'hero-photographic',
  'editorial-paper',
  'technical-diagram',
  'data-story',
  'geographic-story',
  'timeline-story',
  'comparison-story',
  'cutout-explainer',
  'hardware-cutout',
  'interface-explainer',
  'code-explainer',
  'cinematic-statistic',
  'kinetic-headline',
  'documentary-collage',
  'archival-newspaper',
  'blueprint',
  'schematic',
  'satellite',
  'macro-detail',
  'product-hero',
  'quote-editorial',
  'chapter-card',
  'cinematic-outro'
]);

export type VisualLanguageId = z.infer<typeof VisualLanguageIdSchema>;

export const AssetRequestSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['photo', 'archive', 'icon', 'logo', 'map', 'diagram', 'screenshot', 'video', 'texture', 'generatedGraphic']),
  subject: z.string(),
  purpose: z.string().optional(),
  treatment: z.enum([
    'cinematic_macro',
    'archival_grain',
    'duotone_editorial',
    'cutout_shadow',
    'paper_textured',
    'clean_vector',
    'blueprint_inverted',
    'standard'
  ]).default('standard'),
  url: z.string().optional(),
  localPath: z.string().optional(),
  aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:3', 'custom']).optional().default('16:9'),
});

export type AssetRequest = z.infer<typeof AssetRequestSchema>;

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
    'none'
  ]).default('editorial_kinetic'),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  emphasisWords: z.array(z.string()).default([]),
  annotation: z.string().optional(),
  position: z.enum(['top', 'center', 'bottom', 'left', 'right', 'split']).default('center'),
  fontSize: z.number().optional(),
  highlightColor: z.string().optional(),
});

export type TypographyBeatConfig = z.infer<typeof TypographyBeatConfigSchema>;

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
  ]).default('push'),
  intensity: z.number().min(0).max(1).default(0.2),
  easing: z.enum(['ease-in-out', 'ease-out', 'linear', 'spring', 'snap']).default('ease-out'),
  focalPoint: z.object({
    x: z.number().min(0).max(100).default(50),
    y: z.number().min(0).max(100).default(50),
  }).default({ x: 50, y: 50 }),
});

export type CameraBeatConfig = z.infer<typeof CameraBeatConfigSchema>;

export const TransitionBeatConfigSchema = z.object({
  type: z.enum([
    'cut',
    'fade',
    'crossfade',
    'match-cut',
    'wipe',
    'mask-reveal',
    'camera-push',
    'camera-pull',
    'whip',
    'paper-slide',
    'shape-morph',
    'zoom-through',
    'light-flash',
    'none'
  ]).default('fade'),
  durationFrames: z.number().int().nonnegative().default(12),
  sharedGeometry: z.enum(['circle', 'rect', 'chip', 'line', 'card', 'none']).optional().default('none'),
  direction: z.enum(['left', 'right', 'up', 'down', 'in', 'out']).optional().default('right'),
});

export type TransitionBeatConfig = z.infer<typeof TransitionBeatConfigSchema>;

export const VisualBeatSchema = z.object({
  id: z.string(),
  beatIndex: z.number().int().nonnegative().optional(),
  startFrame: z.number().int().nonnegative(),
  durationInFrames: z.number().int().positive(),
  narrativePurpose: z.string(),
  visualIntent: z.string(),
  primaryVisual: z.string().default('editorial-paper'),
  secondaryVisuals: z.array(z.string()).default([]),
  assets: z.array(AssetRequestSchema).default([]),
  layers: z.array(z.string()).default(['background', 'subject', 'typography']),
  camera: CameraBeatConfigSchema.default({ movement: 'push', intensity: 0.2, easing: 'ease-out', focalPoint: { x: 50, y: 50 } }),
  motion: z.array(z.string()).default(['spring_in', 'slow_drift']),
  typography: TypographyBeatConfigSchema.optional(),
  transition: TransitionBeatConfigSchema.default({ type: 'fade', durationFrames: 12, sharedGeometry: 'none', direction: 'right' }),
  emphasis: z.object({
    targetWord: z.string().optional(),
    triggerFrame: z.number().int().nonnegative().optional(),
    action: z.enum(['pop', 'glow', 'camera_push', 'counter_start', 'diagram_pulse', 'none']).default('none'),
  }).optional(),
  props: z.record(z.string(), z.any()).default({}),
});

export type VisualBeat = z.infer<typeof VisualBeatSchema>;

export const VisualPlanSceneSchema = z.object({
  sceneId: z.string(),
  sceneNumber: z.number().int().positive(),
  narrativePurpose: z.string(),
  visualIntent: z.string(),
  visualLanguage: z.string().default('editorial-paper'),
  beats: z.array(VisualBeatSchema).min(1),
  camera: CameraBeatConfigSchema.optional(),
  transition: TransitionBeatConfigSchema.optional(),
});

export type VisualPlanScene = z.infer<typeof VisualPlanSceneSchema>;

export const VisualPlanSchema = z.object({
  title: z.string(),
  totalDurationFrames: z.number().int().positive(),
  scenes: z.array(VisualPlanSceneSchema).min(1),
  brandIdentity: z.string().optional(),
  format: z.enum(['9:16', '16:9', '1:1']).default('9:16'),
  motionSeed: z.number().int().default(42),
});

export type VisualPlan = z.infer<typeof VisualPlanSchema>;
