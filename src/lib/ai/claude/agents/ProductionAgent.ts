import { getBrandDNA } from '@/lib/brand/presets';
import { generateNarration } from '@/lib/audio/narrator';
import { validateVideoSpec } from '@/lib/video-spec/validator';
import type { VideoSpec, SceneData } from '@/lib/video-spec/types';

export interface ProductionInput {
  title: string;
  transcript: string;
  scenes: SceneData[];
  brandId?: string;
  format?: '9:16' | '16:9' | '1:1';
}

export async function runProductionAgent(input: ProductionInput): Promise<VideoSpec> {
  const brand = getBrandDNA(input.brandId);
  const format = input.format || '9:16';
  const width = format === '9:16' ? 1080 : format === '16:9' ? 1920 : 1080;
  const height = format === '9:16' ? 1920 : format === '16:9' ? 1080 : 1080;

  // 1. Generate real narration audio and frame-accurate word timestamps
  const narrationResult = await generateNarration(input.transcript);

  // 2. Adjust total frames based on real voiceover duration
  const requiredFrames = Math.max(
    Math.round(narrationResult.durationSeconds * 30),
    input.scenes.reduce((sum, s) => sum + s.durationFrames, 0)
  );

  // 3. Normalize scene durations and start frames proportionally
  let currentStart = 0;
  const totalOriginalFrames = input.scenes.reduce((sum, s) => sum + s.durationFrames, 0);
  const scaleRatio = requiredFrames / (totalOriginalFrames || 1);

  const syncedScenes = input.scenes.map((s, idx) => {
    const scaledDuration = Math.round(s.durationFrames * scaleRatio);
    const startFrame = currentStart;
    currentStart += scaledDuration;
    return {
      ...s,
      sceneNumber: idx + 1,
      startFrame,
      durationFrames: scaledDuration,
    };
  });

  // Ensure exact frame count match on the last scene
  const actualTotalFrames = syncedScenes.reduce((sum, s) => sum + s.durationFrames, 0);

  const spec: VideoSpec = {
    version: '1.0.0',
    id: `spec-${Date.now()}`,
    title: input.title,
    composition: {
      format,
      width,
      height,
      fps: 30,
      durationInFrames: actualTotalFrames,
    },
    brand,
    narration: {
      audioUrl: narrationResult.audioUrl,
      durationSeconds: narrationResult.durationSeconds,
      transcript: narrationResult.transcript,
      words: narrationResult.words,
    },
    scenes: syncedScenes,
    audio: {
      voiceoverUrl: narrationResult.audioUrl,
      voiceoverVolume: 1.0,
      musicVolume: 0.22,
      duckingPercentage: 0.35,
      sfx: [],
    },
    assets: [],
    metadata: {
      generatedAt: new Date().toISOString(),
      versionTag: 'v1.0.0',
    },
  };

  const validation = validateVideoSpec(spec);
  if (!validation.valid && validation.repairedSpec) {
    return validation.repairedSpec;
  }

  return spec;
}
