export type AspectRatio = '9:16' | '16:9' | '1:1';

export type MotionPreset = 'kinetic' | 'editorial' | 'cinematic' | 'smooth' | 'dramatic';

export type EntranceType = 
  | 'spring'
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'mask-reveal'
  | 'clip-reveal'
  | 'stagger'
  | 'none';

export type ExitType = 
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'scale-down'
  | 'dissolve'
  | 'mask-exit'
  | 'none';

export type CameraMovementType = 
  | 'push'
  | 'pull'
  | 'pan'
  | 'pan-left'
  | 'pan-right'
  | 'pan-up'
  | 'pan-down'
  | 'zoom-in'
  | 'zoom-out'
  | 'zoom-region'
  | 'orbit'
  | 'parallax'
  | 'rack-focus'
  | 'handheld'
  | 'micro-drift'
  | 'whip-pan'
  | 'snap-zoom'
  | 'subtle-shake'
  | 'match-cut'
  | 'tilt'
  | 'static';

export type SceneType =
  | 'hook'
  | 'editorial'
  | 'cutout'
  | 'photo'
  | 'chart'
  | 'map'
  | 'timeline'
  | 'statistic'
  | 'comparison'
  | 'ui-explainer'
  | 'outro';

export interface MotionConfig {
  entrance: EntranceType;
  exit: ExitType;
  delayFrames?: number;
  durationFrames?: number;
  springDamping?: number;
  springStiffness?: number;
  springMass?: number;
}

export interface CameraConfig {
  type: CameraMovementType | string;
  movement?: string;
  intensity?: number; // 0.0 to 1.0
  startScale?: number;
  endScale?: number;
  xMovement?: number;
  yMovement?: number;
  rotation?: number;
  focusTarget?: string;
  focalPoint?: { x: number; y: number }; // percentage 0-100
}

export interface BrandDNA {
  brandId: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
  };
  typography: {
    fontFamilyHeading: string;
    fontFamilyBody: string;
    fontFamilyMono: string;
    headingWeight: string | number;
    bodyWeight: string | number;
  };
  motionStyle: MotionPreset;
  textures: {
    paperTexture?: boolean;
    grainIntensity?: number; // 0.0 to 1.0
    halftoneEffect?: boolean;
    vignette?: boolean;
  };
  captionStyle: {
    preset: 'karaoke-pill' | 'vox-editorial' | 'kinetic-pop' | 'minimal-bottom';
    fontSize: number;
    highlightColor: string;
    activeTextColor: string;
    inactiveTextColor: string;
    boxBackground?: string;
  };
}

export interface WordTimestamp {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
  confidence?: number;
}

export interface NarrationData {
  audioUrl?: string;
  durationSeconds: number;
  transcript: string;
  words: WordTimestamp[];
}

export interface LayerData {
  id: string;
  type: 'text' | 'image' | 'cutout' | 'chart' | 'map' | 'timeline' | 'statistic' | 'shape' | 'texture';
  content?: any;
  position?: {
    x?: number | string;
    y?: number | string;
    scale?: number;
    rotation?: number;
    zIndex?: number;
    opacity?: number;
  };
  motion?: MotionConfig;
  styling?: Record<string, any>;
}

export * from './visual';
import type { VisualBeat, VisualLanguageId } from './visual';

export interface ResearchSource {
  sourceId: string;
  title: string;
  url?: string;
  publisher?: string;
  publishDate?: string;
}

export interface ResearchFact {
  factId: string;
  sourceId: string;
  claim: string;
  confidence: number; // 0.0 to 1.0
  category?: string;
}

export interface FactClaim {
  claimId: string;
  text: string;
  sourceId?: string;
  factId?: string;
  confidence?: number;
}

export interface StoryboardAsset {
  type: string;
  query?: string;
  role: 'foreground' | 'midground' | 'background' | 'data' | 'texture' | 'subject';
  importance?: number;
  url?: string;
  description?: string;
}

export interface StoryboardComposition {
  layout?: string;
  subjectPosition?: string;
  scale?: number;
  crop?: string;
  focalPoint?: string | { x: number; y: number };
  negativeSpace?: string;
}

export interface StoryboardLayer {
  role: string;
  asset?: string;
  assetUrl?: string;
  depth?: number;
  opacity?: number;
}

export interface StoryboardTypography {
  headline?: string;
  supportingText?: string;
  hierarchy?: string;
  position?: string;
  animation?: string;
  emphasisWords?: string[];
}

export interface StoryboardTransition {
  in?: string;
  out?: string;
  motivation?: string;
  type?: 'fade' | 'slide' | 'wipe' | 'flip' | 'match-cut' | 'zoom-through' | 'none';
  durationFrames?: number;
  sharedGeometry?: string;
  direction?: string;
}

export interface SceneData {
  id: string;
  sceneNumber: number;
  type: SceneType;
  templateId: string;
  title: string;
  startFrame: number;
  durationFrames: number;
  narrationText?: string;
  narrationStart?: number; // seconds
  narrationEnd?: number;   // seconds
  claimIds?: string[];
  
  // Phase 4B Visual Storyboard Fields
  visualIntent?: string;
  visualType?: string;
  primarySubject?: string;
  visualMetaphor?: string;
  assets?: StoryboardAsset[];
  composition?: StoryboardComposition;
  layers?: StoryboardLayer[];
  camera?: CameraConfig | Record<string, any>;
  typography?: StoryboardTypography;
  dataVisualization?: any;
  transition?: StoryboardTransition;

  background?: LayerData;
  midground?: LayerData;
  foreground?: LayerData;
  visualLanguage?: VisualLanguageId | string;
  visualBeats?: VisualBeat[];
  props?: Record<string, any> & {
    factConfidence?: number;
    sourceCitation?: string;
  };
  transitionToNext?: {
    type: 'fade' | 'slide' | 'wipe' | 'flip' | 'match-cut' | 'zoom-through' | 'none';
    durationFrames: number;
  };
}

export interface SFXTrigger {
  sfxId: string;
  url: string;
  frame: number;
  volume?: number;
}

export interface AudioSystemSpec {
  voiceoverUrl?: string;
  voiceoverVolume: number; // 0.0 to 1.0
  musicUrl?: string;
  musicVolume: number;     // 0.0 to 1.0
  duckingPercentage: number; // e.g. 0.3 for 70% reduction during speech
  sfx: SFXTrigger[];
}

export interface VideoSpec {
  version: '1.0.0' | '2.0.0' | string;
  id: string;
  title: string;
  description?: string;
  motionSeed?: number;
  research_sources?: ResearchSource[];
  research_facts?: ResearchFact[];
  claims?: FactClaim[];
  composition: {
    format: AspectRatio;
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
  };
  brand: BrandDNA;
  narration: NarrationData;
  scenes: SceneData[];
  audio: AudioSystemSpec;
  assets: Array<{
    id: string;
    type: string;
    url: string;
    description?: string;
  }>;
  metadata?: {
    topic?: string;
    targetPlatform?: string;
    targetAudience?: string;
    generatedAt?: string;
    versionTag?: string;
  };
}
