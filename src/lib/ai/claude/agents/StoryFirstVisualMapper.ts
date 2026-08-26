import { z } from 'zod';
import { generateStructuredOutput } from '../utils/structuredOutput';
import {
  type VisualBeat,
  type SpatialCompositionSpec,
  type TypographyBeatConfig,
  type TransitionBeatConfig,
  type MotionPhase,
  VisualBeatSchema,
} from '@/lib/video-spec/visual';
import type { WordTimestamp } from '@/lib/video-spec/types';

export interface StoryFirstMappingInput {
  narrationLine: string;
  wordTimestamps?: WordTimestamp[];
  claimText?: string;
  sceneNumber: number;
  durationFrames: number;
  brandVoice?: string;
}

export const StoryFirstMappingOutputSchema = z.object({
  claim: z.string().optional(),
  narrativePurpose: z.string(),
  emotionalIntent: z.enum([
    'curiosity',
    'alarm',
    'revelation',
    'technological_wonder',
    'sobering_reality',
    'triumph',
    'analytical_focus'
  ]).default('analytical_focus'),
  visualMetaphor: z.object({
    abstractConcept: stringOrEmpty(),
    concreteVisual: stringOrEmpty(),
    spatialAnchor: z.enum(['center', 'full-bleed', 'split-left', 'split-right', 'top-left', 'bottom-right']).default('full-bleed'),
  }),
  visualProtagonist: z.string(),
  visualBeat: VisualBeatSchema,
  temporalPhases: z.object({
    entryAction: z.string().default('Spring entrance of dominant subject with parallax depth blur'),
    buildAction: z.string().default('Telemetry markers and source citation materialize'),
    emphasisAction: z.string().default('Key metric expands to display giant scale with counter surge'),
    transformationAction: z.string().default('Camera pushes deep into focal coordinate'),
    exitAction: z.string().default('Shared geometric element stabilizes for match-cut'),
  }),
});

function stringOrEmpty() {
  return z.string().default('');
}

export type StoryFirstMappingOutput = z.infer<typeof StoryFirstMappingOutputSchema>;

/**
 * StoryFirstVisualMapper
 * 
 * Enforces the core rule: Visuals must never be generated independently of narration.
 * Pipeline: Narration -> Meaning -> Emotional Intent -> Visual Metaphor -> Protagonist -> Composition -> Motion -> Transition
 */
export async function runStoryFirstVisualMapper(input: StoryFirstMappingInput): Promise<StoryFirstMappingOutput> {
  const { narrationLine, claimText = '', sceneNumber, durationFrames, brandVoice = 'Investigative' } = input;

  const systemPrompt = `You are the Lead Story-First Visual Director for Catalyst Content OS.
YOUR CORE RULE: NEVER generate visuals independently from narration.

For every narration line, calculate:
1. claim: What concrete assertion or empirical fact is being stated?
2. narrativePurpose: What does the viewer need to understand at this exact second?
3. emotionalIntent: What feeling should this visual evoke (curiosity, alarm, revelation, technological_wonder, sobering_reality, triumph)?
4. visualMetaphor: What concrete physical object represents the abstract concept?
5. visualProtagonist: What single monolithic object dominates 60-95% of the frame?
6. temporalPhases: Define what happens in the 5 temporal phases (ENTRY, BUILD, EMPHASIS, TRANSFORMATION, EXIT).
7. visualBeat: Structured VisualBeat conforming to the schema.

Return a strict JSON conforming to StoryFirstMappingOutputSchema.`;

  const userPrompt = `Map this narration segment into a story-first visual layout:
Scene #${sceneNumber} (${durationFrames} frames, ~${(durationFrames / 30).toFixed(1)}s)
Narration: "${narrationLine}"
Fact / Claim: "${claimText}"
Brand Voice: "${brandVoice}"`;

  return generateStructuredOutput<StoryFirstMappingOutput>({
    agentName: 'StoryFirstVisualMapper',
    systemPrompt,
    userPrompt,
    schema: StoryFirstMappingOutputSchema,
    maxTokens: 2500,
    fallbackGenerator: () => generateDeterministicStoryFirstMapping(input),
  });
}

export function generateDeterministicStoryFirstMapping(input: StoryFirstMappingInput): StoryFirstMappingOutput {
  const { narrationLine, claimText, sceneNumber, durationFrames } = input;

  return {
    claim: claimText || narrationLine,
    narrativePurpose: `Establish visual clarity for: ${narrationLine.slice(0, 60)}`,
    emotionalIntent: sceneNumber === 1 ? 'curiosity' : sceneNumber === 7 ? 'triumph' : 'revelation',
    visualMetaphor: {
      abstractConcept: narrationLine,
      concreteVisual: 'Physical architectural schematic and illuminated optical network',
      spatialAnchor: 'full-bleed',
    },
    visualProtagonist: 'Monolithic physical engineering layout',
    temporalPhases: {
      entryAction: 'Spring entrance of dominant subject with parallax depth blur',
      buildAction: 'Telemetry markers and source citation materialize',
      emphasisAction: 'Key metric expands to display giant scale with counter surge',
      transformationAction: 'Camera pushes deep into focal coordinate',
      exitAction: 'Shared geometric element stabilizes for match-cut',
    },
    visualBeat: {
      id: `s${sceneNumber}-b1`,
      beatIndex: 0,
      startFrame: 0,
      durationInFrames: durationFrames,
      narrativePurpose: narrationLine,
      visualIntent: 'Full-bleed physical documentary composition',
      visualMetaphor: 'Physical architectural schematic',
      primaryVisual: sceneNumber === 3 ? 'data-story' : sceneNumber === 4 ? 'geographic-story' : 'editorial-paper',
      secondaryVisuals: ['editorial-paper'],
      composition: {
        anchor: 'full-bleed',
        focalPoint: { x: 50, y: 50 },
        occupancyPct: 85,
        safeZoneRespect: true,
        negativeSpaceOrientation: 'top',
      },
      layers: ['background', 'subject', 'typography'],
      layerSpecs: [
        { id: `s${sceneNumber}-bg`, role: 'background', depth: 0.15, transform: { x: 0, y: 0, scale: 1.35, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
        { id: `s${sceneNumber}-sub`, role: 'subject', depth: 1.0, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
        { id: `s${sceneNumber}-typ`, role: 'typography', depth: 1.5, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
      ],
      assets: [],
      camera: {
        movement: 'push',
        intensity: 0.22,
        easing: 'ease-out',
        focalPoint: { x: 50, y: 50 },
      },
      motion: ['spring_in', 'slow_drift'],
      motionChoreography: [
        { phase: 1, action: 'SPRING_IN', targetLayer: 'subject', frameOffset: 0, durationFrames: 25, params: {} },
      ],
      typography: {
        treatment: 'brutalist_display',
        headline: narrationLine.slice(0, 40).toUpperCase(),
        narrative: narrationLine,
        position: 'top',
        fontScale: 'display_giant',
        emphasisWords: [],
      },
      transition: {
        type: sceneNumber === 1 ? 'fade' : 'match-cut',
        durationFrames: 12,
        sharedGeometry: 'none',
        direction: 'right',
      },
      props: {},
    },
  };
}
