import { getBrandDNA } from '@/lib/brand/presets';
import { generateNarration } from '@/lib/audio/narrator';
import { validateVideoSpec } from '@/lib/video-spec/validator';
import { runVisualDirector } from './VisualDirector';
import { runAssetDirector, type AssetDirectorOutput } from './AssetDirector';
import { runMotionDirector, type MotionPlan } from './MotionDirector';
import { analyzeNarrativeTiming } from './NarrativeTimingAnalyzer';
import type { VideoSpec, SceneData, WordTimestamp } from '@/lib/video-spec/types';
import type { VisualPlan } from '@/lib/video-spec/visual';
import type { ContentDirectorOutput } from './ContentDirector';

export interface ProductionInput {
  title: string;
  transcript: string;
  scenes: SceneData[];
  brandId?: string;
  format?: '9:16' | '16:9' | '1:1';
  visualPlan?: VisualPlan;
  assetPlan?: AssetDirectorOutput;
  motionPlan?: MotionPlan;
  researchFacts?: string[];
}

export interface AssembleV2Params {
  content: ContentDirectorOutput;
  storyboard: SceneData[];
  visualPlan: VisualPlan;
  motionPlan: MotionPlan;
  resolvedAssets: AssetDirectorOutput;
  words?: WordTimestamp[];
  audioUrl?: string;
  durationSeconds?: number;
  brandId?: string;
}

export function assembleVideoSpecV2(params: AssembleV2Params): VideoSpec {
  const {
    content,
    storyboard,
    visualPlan,
    motionPlan,
    resolvedAssets,
    words = [],
    audioUrl,
    durationSeconds = 45,
    brandId,
  } = params;

  const brand = getBrandDNA(brandId);
  const format = visualPlan.format || '9:16';
  const width = format === '9:16' ? 1080 : format === '16:9' ? 1920 : 1080;
  const height = format === '9:16' ? 1920 : format === '16:9' ? 1080 : 1080;
  const fps = 30;
  const totalFrames = Math.round(durationSeconds * fps);

  let currentStart = 0;
  const syncedScenes: SceneData[] = storyboard.map((s, idx) => {
    const isLast = idx === storyboard.length - 1;
    const dur = Math.round(isLast ? totalFrames - currentStart : s.durationFrames);
    const startFrame = Math.round(currentStart);
    currentStart += dur;

    const planScene = visualPlan.scenes[idx];
    const beatCount = planScene?.beats?.length || 1;
    const beatDur = Math.max(1, Math.floor(dur / beatCount));

    const visualBeats = planScene?.beats?.map((b, bIdx) => {
      const isLastBeat = bIdx === beatCount - 1;
      const bDuration = isLastBeat ? Math.max(1, dur - bIdx * beatDur) : beatDur;
      const assetUrl = resolvedAssets.resolvedAssets[idx]?.url || b.assets[0]?.url;
      return {
        ...b,
        beatIndex: bIdx,
        startFrame: Math.round(bIdx * beatDur),
        durationInFrames: Math.round(bDuration),
        props: {
          ...(b.props || {}),
          imageUrl: assetUrl || b.props?.imageUrl,
        },
      };
    });

    const primaryAssetUrl = resolvedAssets.resolvedAssets[idx]?.url;

    return {
      ...s,
      sceneNumber: idx + 1,
      startFrame,
      durationFrames: dur,
      visualIntent: planScene?.visualIntent || s.visualIntent || `Full-frame editorial visualization of ${s.title}`,
      visualType: s.visualType || planScene?.visualLanguage || s.type,
      primarySubject: s.primarySubject || s.title,
      visualMetaphor: s.visualMetaphor || `Dynamic technological visualization`,
      visualLanguage: planScene?.visualLanguage || s.type || 'editorial-paper',
      visualBeats,
      composition: s.composition || { layout: 'full-frame', scale: 1.05 },
      typography: s.typography || {
        headline: (s.props?.headline || s.title).toUpperCase(),
        supportingText: s.narrationText,
        hierarchy: 'HEADLINE',
      },
      props: {
        ...(s.props || {}),
        imageUrl: primaryAssetUrl || s.props?.imageUrl,
        factConfidence: 0.98,
      },
    };
  });

  const spec: VideoSpec = {
    version: '2.0.0',
    id: `spec-${Date.now()}`,
    title: content.title,
    motionSeed: visualPlan.motionSeed || motionPlan.motionSeed || 42,
    research_sources: content.research_sources,
    research_facts: content.research_facts,
    claims: content.claims,
    composition: {
      format,
      width,
      height,
      fps,
      durationInFrames: totalFrames,
    },
    brand,
    narration: {
      audioUrl: audioUrl || '/audio/voiceover.mp3',
      durationSeconds,
      transcript: content.fullTranscript,
      words,
    },
    scenes: syncedScenes,
    audio: {
      voiceoverUrl: audioUrl || '/audio/voiceover.mp3',
      voiceoverVolume: 1.0,
      musicVolume: 0.22,
      duckingPercentage: 0.35,
      sfx: [],
    },
    assets: resolvedAssets.resolvedAssets,
    metadata: {
      topic: content.title,
      generatedAt: new Date().toISOString(),
      versionTag: 'v2.0.0',
    },
  };

  const validation = validateVideoSpec(spec);
  return validation.repairedSpec || spec;
}

export async function runProductionAgent(input: ProductionInput): Promise<VideoSpec> {
  const brand = getBrandDNA(input.brandId);
  const format = input.format || '9:16';
  const fps = 30;

  // 1. Generate real narration audio and verified word timestamps
  const narrationResult = await generateNarration(input.transcript);

  // 2. Analyze narrative timing from word timestamps
  const timingAnalysis = analyzeNarrativeTiming(narrationResult.words || [], fps);

  // 3. Derive exact required frame count from actual narration duration
  const requiredFrames = Math.max(
    Math.round(narrationResult.durationSeconds * fps),
    input.scenes.reduce((sum, s) => sum + s.durationFrames, 0)
  );

  // 4. Generate or use VisualPlan
  let visualPlan = input.visualPlan;
  if (!visualPlan) {
    visualPlan = await runVisualDirector({
      content: {
        title: input.title,
        hook: {
          headline: input.scenes[0]?.title || input.title,
          subtext: input.scenes[0]?.narrationText || '',
          tag: 'ANALYSIS',
          highlightWords: [],
        },
        fullTranscript: input.transcript,
        narrativeStructure: {
          hook: input.scenes[0]?.narrationText || '',
          context: input.scenes[1]?.narrationText || '',
          dataSurge: input.scenes[2]?.narrationText || '',
          geography: input.scenes[3]?.narrationText || '',
          explanation: input.scenes[4]?.narrationText || '',
          payoff: input.scenes[5]?.narrationText || '',
          outro: input.scenes[6]?.narrationText || '',
        },
        targetDurationSeconds: Math.ceil(requiredFrames / fps),
        research_sources: [],
        research_facts: [],
        claims: [],
      },
      storyboard: input.scenes,
      words: narrationResult.words,
      researchFacts: input.researchFacts,
      brand,
      format,
      durationSeconds: Math.ceil(requiredFrames / fps),
    });
  }

  // 5. Resolve Assets & Motion
  const assetPlan = input.assetPlan || await runAssetDirector(visualPlan);
  const motionPlan = input.motionPlan || await runMotionDirector(visualPlan, timingAnalysis);

  return assembleVideoSpecV2({
    content: {
      title: input.title,
      hook: {
        headline: input.scenes[0]?.title || input.title,
        subtext: input.scenes[0]?.narrationText || '',
        tag: 'ANALYSIS',
        highlightWords: [],
      },
      fullTranscript: input.transcript,
      narrativeStructure: {
        hook: input.scenes[0]?.narrationText || '',
        context: input.scenes[1]?.narrationText || '',
        dataSurge: input.scenes[2]?.narrationText || '',
        geography: input.scenes[3]?.narrationText || '',
        explanation: input.scenes[4]?.narrationText || '',
        payoff: input.scenes[5]?.narrationText || '',
        outro: input.scenes[6]?.narrationText || '',
      },
      targetDurationSeconds: Math.ceil(requiredFrames / fps),
      research_sources: [],
      research_facts: [],
      claims: [],
    },
    storyboard: input.scenes,
    visualPlan,
    motionPlan,
    resolvedAssets: assetPlan,
    words: narrationResult.words,
    audioUrl: narrationResult.audioUrl,
    durationSeconds: narrationResult.durationSeconds,
    brandId: input.brandId,
  });
}
