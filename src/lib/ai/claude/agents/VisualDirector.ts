import { z } from 'zod';
import { generateStructuredOutput } from '../utils/structuredOutput';
import { VisualPlanSchema, type VisualPlan, type VisualBeat, type VisualPlanScene } from '@/lib/video-spec/visual';
import type { ContentDirectorOutput } from './ContentDirector';
import type { BrandDNA, SceneData, WordTimestamp } from '@/lib/video-spec/types';

export interface VisualDirectorInput {
  content: ContentDirectorOutput;
  storyboard: SceneData[];
  words?: WordTimestamp[];
  researchFacts?: string[];
  brand?: BrandDNA;
  format?: '9:16' | '16:9' | '1:1';
  durationSeconds?: number;
}

export async function runVisualDirector(input: VisualDirectorInput): Promise<VisualPlan> {
  const { content, storyboard, words = [], researchFacts = [], format = '9:16', durationSeconds = 45 } = input;
  const fps = 30;
  const totalFrames = durationSeconds * fps;

  const systemPrompt = `You are the Lead Visual Director for Catalyst Content OS, producing world-class cinematic editorial motion graphics in the broadcast style of Vox, Bloomberg Originals, and premium investigative documentaries.

YOUR MISSION:
Transform the storyboard into a physical, full-bleed spatial VisualPlan. For EACH scene, decompose it into 2 to 4 micro "Visual Beats" (2 to 5 seconds each) that continuously evolve the visual layer, keeping the viewer visually engaged.

MANDATORY ART DIRECTION PRINCIPLES (PHASE 7 STANDARD):
1. FULL-CANVAS PHYSICAL COMPOSITION: The primary visual must occupy 60% to 95% of meaningful canvas. NEVER create small centered cards, floating UI boxes, or empty dashboards.
2. 7-PLANE 2.5D SPATIAL DEPTH: Organize every beat across 7 depth layers (Background 0.15 -> BackgroundMid 0.35 -> Midground 0.60 -> Subject 1.00 -> Foreground 1.35 -> Typography 1.50 -> EditorialMarks 1.65).
3. DOMINANT SUBJECT MONOLITHS: Every scene must have ONE unmistakable dominant visual subject (e.g. 3D perspective die, skewed monolith towers, extreme macro photographic crop, or planetary telemetry corridors).
4. BRUTALIST DISPLAY TYPOGRAPHY: Headlines must be massive (72px to 140px, bold tracking), hero statistics must be monolithic (140px to 365px), paired with monospace metadata tags.
5. CONCRETE VISUAL METAPHORS: For every abstract concept, create a concrete visual metaphor (e.g. magnetic plasma confinement -> toroidal glowing chamber; sub-millisecond execution -> laser scan line across optical fiber routes).
6. 16 DIVERSE VISUAL FAMILIES: Alternate languages (cinematic-photo -> technical-diagram -> data-story -> geographic-story -> editorial-paper -> cinematic-statistic -> cinematic-outro).
7. NARRATION-SYNCHRONIZED MOTION: Tie camera moves and element reveals to word timestamps.
8. MATCH-CUT TRANSITIONS: Connect scene boundaries with shared geometric elements or continuous camera momentum.

Return a strict JSON object conforming to the VisualPlanSchema.`;

  const promptMessage = `Create the Phase 7 Broadcast VisualPlan for:
Title: "${content.title}"
Storyboard Summary: ${storyboard.map(s => `Scene ${s.sceneNumber} (${s.type}, ${s.durationFrames}f): "${s.title}" — Narration: "${s.narrationText || ''}"`).join('\n')}
Word Timestamps Available: ${words.slice(0, 35).map(w => `${w.word} (${w.start.toFixed(1)}s)`).join(', ')}...
Research Facts: ${researchFacts.join(' | ')}
Duration: ${totalFrames} frames (${durationSeconds}s @ 30fps)`;

  return generateStructuredOutput<VisualPlan>({
    agentName: 'VisualDirector',
    systemPrompt,
    userPrompt: promptMessage,
    schema: VisualPlanSchema,
    maxTokens: 4000,
    fallbackGenerator: () => generateDeterministicVisualPlan(content, storyboard, format, totalFrames),
  });
}

export function generateDeterministicVisualPlan(
  content: ContentDirectorOutput,
  storyboard: SceneData[],
  format: '9:16' | '16:9' | '1:1',
  totalFrames: number
): VisualPlan {
  const visualLanguages = [
    'cinematic-photo',
    'editorial-paper',
    'data-story',
    'geographic-story',
    'technical-diagram',
    'cinematic-statistic',
    'cinematic-outro',
  ];

  const cameraMoves: Array<'push' | 'pull' | 'pan-left' | 'pan-right' | 'orbit' | 'parallax' | 'zoom-region'> = [
    'push',
    'parallax',
    'push',
    'zoom-region',
    'orbit',
    'push',
    'pull',
  ];

  const scenes: VisualPlanScene[] = storyboard.map((scene, idx) => {
    const vLang = visualLanguages[idx % visualLanguages.length];
    const camMove = cameraMoves[idx % cameraMoves.length];
    const halfDur = Math.floor(scene.durationFrames / 2);
    const restDur = scene.durationFrames - halfDur;
    const sourceCite = content.research_sources?.[0]?.title || 'CATALYST INVESTIGATION // 2026';

    return {
      sceneId: scene.id || `scene-${idx + 1}`,
      sceneNumber: idx + 1,
      narrativePurpose: `Communicate ${scene.title}`,
      visualIntent: `Full-frame editorial visualization of ${scene.title}`,
      visualLanguage: vLang,
      camera: { movement: camMove, intensity: 0.22, easing: 'ease-out' as const, focalPoint: { x: 50, y: 50 } },
      transition: {
        type: idx === 0 ? 'fade' as const : 'match-cut' as const,
        durationFrames: 12,
        sharedGeometry: 'none' as const,
        direction: 'right' as const,
      },
      beats: [
        {
          id: `s${idx + 1}-b1`,
          beatIndex: 0,
          startFrame: 0,
          durationInFrames: halfDur,
          narrativePurpose: `Establish primary subject for ${scene.title}`,
          visualIntent: 'Full-frame monolithic subject anchor with atmospheric depth',
          visualMetaphor: `${scene.title} physical architecture`,
          primaryVisual: vLang,
          secondaryVisuals: ['editorial-paper'],
          composition: {
            anchor: 'full-bleed',
            focalPoint: { x: 50, y: 50 },
            occupancyPct: 85,
            safeZoneRespect: true,
            negativeSpaceOrientation: 'top',
          },
          assets: [{
            type: idx === 0 ? 'photo' as const : idx === 3 ? 'map' as const : 'photo' as const,
            subject: scene.title,
            treatment: idx === 4 ? 'blueprint_inverted' as const : 'cinematic_macro' as const,
            aspectRatio: '16:9' as const,
            canvasCoveragePct: 85,
          }],
          layers: ['background', 'midground', 'subject', 'typography', 'editorialMarks'],
          layerSpecs: [
            { id: `s${idx + 1}-b1-bg`, role: 'background', depth: 0.15, transform: { x: 0, y: 0, scale: 1.35, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
            { id: `s${idx + 1}-b1-sub`, role: 'subject', depth: 1.0, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
            { id: `s${idx + 1}-b1-typ`, role: 'typography', depth: 1.5, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
            { id: `s${idx + 1}-b1-marks`, role: 'editorialMarks', depth: 1.65, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
          ],
          camera: { movement: camMove, intensity: 0.22, easing: 'ease-out' as const, focalPoint: { x: 50, y: 50 } },
          motion: ['spring_in', 'slow_drift'],
          typography: {
            treatment: 'brutalist_display' as const,
            eyebrow: `0${idx + 1} // ${scene.type.toUpperCase()}`,
            headline: (scene.props?.headline || scene.title).toUpperCase(),
            emphasisWords: scene.title.split(' ').slice(0, 2),
            position: 'top' as const,
            fontScale: 'display_giant' as const,
          },
          transition: { type: 'fade' as const, durationFrames: 10, sharedGeometry: 'none' as const, direction: 'right' as const },
          props: {
            ...scene.props,
            sourceCitation: sourceCite,
            factConfidence: 0.98,
          },
        },
        {
          id: `s${idx + 1}-b2`,
          beatIndex: 1,
          startFrame: halfDur,
          durationInFrames: restDur,
          narrativePurpose: `Reveal technical context and data for ${scene.title}`,
          visualIntent: 'Layered documentary depth and active metric progression',
          visualMetaphor: `${scene.title} empirical evidence`,
          primaryVisual: vLang === 'cinematic-photo' ? 'editorial-paper' : vLang === 'technical-diagram' ? 'blueprint' : vLang === 'data-story' ? 'cinematic-statistic' : vLang,
          secondaryVisuals: ['technical-diagram'],
          composition: {
            anchor: 'full-bleed',
            focalPoint: { x: 50, y: 50 },
            occupancyPct: 88,
            safeZoneRespect: true,
            negativeSpaceOrientation: 'top',
          },
          assets: [],
          layers: ['background', 'midground', 'subject', 'foreground', 'typography', 'editorialMarks'],
          layerSpecs: [
            { id: `s${idx + 1}-b2-bg`, role: 'background', depth: 0.15, transform: { x: 0, y: 0, scale: 1.35, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
            { id: `s${idx + 1}-b2-sub`, role: 'subject', depth: 1.0, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
            { id: `s${idx + 1}-b2-fg`, role: 'foreground', depth: 1.35, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
            { id: `s${idx + 1}-b2-typ`, role: 'typography', depth: 1.5, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
          ],
          camera: { movement: 'push' as const, intensity: 0.26, easing: 'ease-out' as const, focalPoint: { x: 50, y: 50 } },
          motion: ['counter_start', 'laser_scan'],
          typography: {
            treatment: 'keyword_spotlight' as const,
            eyebrow: `0${idx + 1} // EMPIRICAL EVIDENCE`,
            headline: (scene.props?.headline || scene.title).toUpperCase(),
            emphasisWords: [scene.title.split(' ')[0] || 'KEY'],
            position: 'top' as const,
            fontScale: 'display_giant' as const,
          },
          transition: { type: 'fade' as const, durationFrames: 10, sharedGeometry: 'none' as const, direction: 'right' as const },
          props: {
            ...scene.props,
            sourceCitation: sourceCite,
            factConfidence: 0.99,
          },
        },
      ],
    };
  });

  return {
    title: content.title,
    totalDurationFrames: totalFrames,
    format,
    motionSeed: 42,
    scenes,
  };
}
