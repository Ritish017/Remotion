import { z } from 'zod';

export const MotionConfigSchema = z.object({
  entrance: z.enum([
    'spring',
    'fade',
    'slide-up',
    'slide-down',
    'slide-left',
    'slide-right',
    'scale',
    'mask-reveal',
    'clip-reveal',
    'stagger',
    'none'
  ]).default('spring'),
  exit: z.enum([
    'fade',
    'slide-up',
    'slide-down',
    'scale-down',
    'dissolve',
    'mask-exit',
    'none'
  ]).default('fade'),
  delayFrames: z.number().nonnegative().optional().default(0),
  durationFrames: z.number().positive().optional().default(15),
  springDamping: z.number().optional().default(12),
  springStiffness: z.number().optional().default(100),
  springMass: z.number().optional().default(0.5),
});

export const CameraConfigSchema = z.object({
  type: z.enum([
    'push',
    'pull',
    'pan-left',
    'pan-right',
    'zoom-region',
    'subtle-shake',
    'parallax',
    'static'
  ]).default('push'),
  intensity: z.number().min(0).max(1).optional().default(0.15),
  focalPoint: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100)
  }).optional(),
});

export const BrandDNASchema = z.object({
  brandId: z.string().default('default-brand'),
  name: z.string().default('Catalyst Editorial'),
  colors: z.object({
    primary: z.string().default('#f0522a'),
    secondary: z.string().default('#00c9a7'),
    accent: z.string().default('#ffd166'),
    background: z.string().default('#0b0d13'),
    surface: z.string().default('#161922'),
    text: z.string().default('#f8fafc'),
    textMuted: z.string().default('#94a3b8'),
  }),
  typography: z.object({
    fontFamilyHeading: z.string().default('Inter, system-ui, sans-serif'),
    fontFamilyBody: z.string().default('Inter, system-ui, sans-serif'),
    fontFamilyMono: z.string().default('JetBrains Mono, monospace'),
    headingWeight: z.union([z.string(), z.number()]).default('800'),
    bodyWeight: z.union([z.string(), z.number()]).default('400'),
  }),
  motionStyle: z.enum(['kinetic', 'editorial', 'cinematic', 'smooth', 'dramatic']).default('editorial'),
  textures: z.object({
    paperTexture: z.boolean().optional().default(true),
    grainIntensity: z.number().min(0).max(1).optional().default(0.12),
    halftoneEffect: z.boolean().optional().default(false),
    vignette: z.boolean().optional().default(true),
  }).default({
    paperTexture: true,
    grainIntensity: 0.12,
    halftoneEffect: false,
    vignette: true,
  }),
  captionStyle: z.object({
    preset: z.enum(['karaoke-pill', 'vox-editorial', 'kinetic-pop', 'minimal-bottom']).default('vox-editorial'),
    fontSize: z.number().positive().default(48),
    highlightColor: z.string().default('#ffd166'),
    activeTextColor: z.string().default('#0b0d13'),
    inactiveTextColor: z.string().default('#ffffff'),
    boxBackground: z.string().optional().default('rgba(0, 0, 0, 0.75)'),
  }),
});

export const WordTimestampSchema = z.object({
  word: z.string(),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
  confidence: z.number().min(0).max(1).optional(),
});

export const NarrationDataSchema = z.object({
  audioUrl: z.string().optional(),
  durationSeconds: z.number().nonnegative().default(0),
  transcript: z.string().default(''),
  words: z.array(WordTimestampSchema).default([]),
});

export const LayerDataSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'cutout', 'chart', 'map', 'timeline', 'statistic', 'shape', 'texture']),
  content: z.any().optional(),
  position: z.object({
    x: z.union([z.number(), z.string()]).optional(),
    y: z.union([z.number(), z.string()]).optional(),
    scale: z.number().optional().default(1),
    rotation: z.number().optional().default(0),
    zIndex: z.number().optional(),
    opacity: z.number().min(0).max(1).optional().default(1),
  }).optional(),
  motion: MotionConfigSchema.optional(),
  styling: z.record(z.string(), z.any()).optional(),
});

export const SceneDataSchema = z.object({
  id: z.string(),
  sceneNumber: z.number().int().positive(),
  type: z.enum([
    'hook',
    'editorial',
    'cutout',
    'photo',
    'chart',
    'map',
    'timeline',
    'statistic',
    'comparison',
    'ui-explainer',
    'outro'
  ]),
  templateId: z.string(),
  title: z.string(),
  startFrame: z.number().nonnegative(),
  durationFrames: z.number().positive(),
  narrationText: z.string().optional(),
  narrationStart: z.number().nonnegative().optional(),
  narrationEnd: z.number().nonnegative().optional(),
  camera: CameraConfigSchema.optional(),
  background: LayerDataSchema.optional(),
  midground: LayerDataSchema.optional(),
  foreground: LayerDataSchema.optional(),
  props: z.record(z.string(), z.any()).optional().default({}),
  transitionToNext: z.object({
    type: z.enum(['fade', 'slide', 'wipe', 'flip', 'none']).default('fade'),
    durationFrames: z.number().nonnegative().default(12),
  }).optional(),
});

export const SFXTriggerSchema = z.object({
  sfxId: z.string(),
  url: z.string(),
  frame: z.number().nonnegative(),
  volume: z.number().min(0).max(1).optional().default(0.8),
});

export const AudioSystemSpecSchema = z.object({
  voiceoverUrl: z.string().optional(),
  voiceoverVolume: z.number().min(0).max(1).default(1.0),
  musicUrl: z.string().optional(),
  musicVolume: z.number().min(0).max(1).default(0.25),
  duckingPercentage: z.number().min(0).max(1).default(0.25),
  sfx: z.array(SFXTriggerSchema).default([]),
});

export const VideoSpecSchema = z.object({
  version: z.string().default('1.0.0'),
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  composition: z.object({
    format: z.enum(['9:16', '16:9', '1:1']).default('9:16'),
    width: z.number().positive().default(1080),
    height: z.number().positive().default(1920),
    fps: z.number().positive().default(30),
    durationInFrames: z.number().positive().default(1350), // default 45s @ 30fps
  }),
  brand: BrandDNASchema,
  narration: NarrationDataSchema,
  scenes: z.array(SceneDataSchema).min(1),
  audio: AudioSystemSpecSchema.default({
    voiceoverVolume: 1.0,
    musicVolume: 0.25,
    duckingPercentage: 0.25,
    sfx: [],
  }),
  assets: z.array(z.object({
    id: z.string(),
    type: z.string(),
    url: z.string(),
    description: z.string().optional(),
  })).default([]),
  metadata: z.object({
    topic: z.string().optional(),
    targetPlatform: z.string().optional(),
    targetAudience: z.string().optional(),
    generatedAt: z.string().optional(),
    versionTag: z.string().optional(),
  }).optional(),
});
