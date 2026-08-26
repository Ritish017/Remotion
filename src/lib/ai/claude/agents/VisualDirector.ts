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

  const systemPrompt = `You are the Lead Visual Director for Catalyst Content OS, producing world-class cinematic editorial motion graphics videos in the style of Vox, Bloomberg Originals, and premium documentary explainers.

YOUR MISSION:
Transform the storyboard into a cinematic VisualPlan. For EACH scene, decompose it into 2 to 4 micro "Visual Beats" (each lasting 2 to 5 seconds) that continuously evolve the visual layer, keeping the viewer visually engaged and clarifying the narrative.

15 VISUAL DIRECTOR RULES:
1. Every visual must answer: "What should the viewer SEE while hearing this sentence?"
2. Never add motion purely for decoration — motion must direct attention, reveal depth, or demonstrate a mechanism.
3. Prefer concrete documentary subjects (photographic cutouts, semiconductor wafers, datacenter clusters, animated maps, telemetry gauges).
4. Full-Frame Imagery: Important subjects should occupy a significant portion of the 1080x1920 canvas (>40%), never a tiny floating rectangle.
5. Avoid using the same visual language consecutively (create a visual journey: Hook -> Context -> Data -> Map -> Cutout -> Diagram -> Outro).
6. Avoid static streaks — introduce camera pushes, label reveals, or layered motion every 2–4 seconds.
7. Use camera movement intentionally (e.g. slow push on reveals, pan across comparisons, orbit on hardware cutouts, zoom on map hubs).
8. Multi-Layer Depth: Background (depth 0.15) -> Midground (0.50) -> Primary Subject (1.0) -> Foreground/Data (1.35) -> Typography (1.5).
9. Typography is an editorial asset with kinetic reveals, keyword spotlighting, and structured hierarchy.
10. Use data charts ONLY when concrete numbers exist.
11. Safe Areas: Strictly respect ${format} mobile composition margins.
12. Narration-Synchronization: Match visual transitions to word timestamps.
13. Match-Cut Continuity: Morph shared geometry or colors across scene transitions.
14. Color Treatment: Use high-contrast editorial palettes with semantic accent colors.
15. Never default to generic gradients or placeholder boxes.`;

  const promptMessage = `Create the cinematic VisualPlan for:
Title: "${content.title}"
Storyboard Summary: ${storyboard.map(s => `Scene ${s.sceneNumber} (${s.type}, ${s.durationFrames}f): "${s.title}" — Narration: "${s.narrationText || ''}"`).join('\n')}
Word Timestamps Available: ${words.slice(0, 30).map(w => `${w.word} (${w.start.toFixed(1)}s)`).join(', ')}...
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
  const isInfrastructure = content.title.toLowerCase().includes('infra') || content.title.toLowerCase().includes('chip') || content.title.toLowerCase().includes('ai');
  const isRobotics = content.title.toLowerCase().includes('robot') || content.title.toLowerCase().includes('humanoid');
  const isFintech = content.title.toLowerCase().includes('nanosecond') || content.title.toLowerCase().includes('trillion') || content.title.toLowerCase().includes('financ');

  // 7 distinct documentary visual languages
  const visualLanguages = [
    'cinematic-photo',
    'editorial-paper',
    'data-story',
    'geographic-story',
    'cutout-explainer',
    'technical-diagram',
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

    const sourceCite = content.research_sources?.[0]?.title || 'CATALYST RESEARCH // 2026';

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
          visualIntent: 'Full-frame subject anchor with atmospheric depth',
          primaryVisual: vLang,
          secondaryVisuals: ['editorial-paper'],
          assets: [{
            type: idx === 0 ? 'photo' as const : idx === 3 ? 'map' as const : 'photo' as const,
            subject: scene.title,
            treatment: idx === 4 ? 'cutout_shadow' as const : 'cinematic_macro' as const,
            aspectRatio: '16:9' as const,
          }],
          layers: ['background', 'midground', 'subject', 'typography'],
          camera: { movement: camMove, intensity: 0.2, easing: 'ease-out' as const, focalPoint: { x: 50, y: 50 } },
          motion: ['spring_in', 'slow_drift'],
          typography: {
            treatment: 'editorial_kinetic' as const,
            headline: (scene.props?.headline || scene.title).toUpperCase(),
            emphasisWords: scene.title.split(' ').slice(0, 2),
            position: 'center' as const,
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
          primaryVisual: vLang === 'cinematic-photo' ? 'editorial-paper' : vLang === 'technical-diagram' ? 'blueprint' : vLang === 'data-story' ? 'cinematic-statistic' : vLang,
          secondaryVisuals: ['technical-diagram'],
          assets: [],
          layers: ['background', 'midground', 'subject', 'foreground', 'typography'],
          camera: { movement: 'push' as const, intensity: 0.26, easing: 'ease-out' as const, focalPoint: { x: 50, y: 50 } },
          motion: ['counter_start', 'diagram_pulse'],
          typography: {
            treatment: 'keyword_spotlight' as const,
            headline: (scene.props?.headline || scene.title).toUpperCase(),
            emphasisWords: [scene.title.split(' ')[0] || 'KEY'],
            position: 'bottom' as const,
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
