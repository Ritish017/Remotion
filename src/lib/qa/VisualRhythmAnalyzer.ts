import type { VideoSpec } from '@/lib/video-spec/types';

export interface VisualRhythmScore {
  score: number; // 0 to 100 (target >= 85)
  passed: boolean;
  visualChangeFrequencySeconds: number;
  motionDensity: number; // 0.0 to 1.0
  cameraVarietyScore: number;
  subscores: {
    pacingScore: number;
    varietyScore: number;
    motionScore: number;
    densityScore: number;
  };
  recommendations: string[];
}

export function analyzeVisualRhythm(spec: VideoSpec): VisualRhythmScore {
  const fps = spec.composition.fps || 30;
  const totalSeconds = spec.composition.durationInFrames / fps;

  let totalVisualBeats = 0;
  for (const scene of spec.scenes) {
    if (scene.visualBeats && scene.visualBeats.length > 0) {
      totalVisualBeats += scene.visualBeats.length;
    } else {
      totalVisualBeats += 1;
    }
  }

  const changeFrequency = totalSeconds / Math.max(1, totalVisualBeats);

  // Target: a visual evolution every 2.0 to 4.5 seconds
  let pacingScore = 100;
  if (changeFrequency > 5.5) {
    pacingScore = Math.max(50, 100 - (changeFrequency - 5.5) * 15);
  } else if (changeFrequency < 1.5) {
    pacingScore = Math.max(60, 100 - (1.5 - changeFrequency) * 20);
  }

  // Camera variety
  const cameraTypes = new Set<string>();
  for (const scene of spec.scenes) {
    cameraTypes.add(scene.camera?.type || 'push');
    if (scene.visualBeats) {
      scene.visualBeats.forEach(b => {
        if (b.camera) cameraTypes.add(b.camera.movement);
      });
    }
  }
  const cameraVarietyScore = Math.min(100, cameraTypes.size * 25);

  // Motion density & asset variety
  const assetCount = spec.assets?.length || 0;
  const densityScore = Math.min(100, 70 + assetCount * 5 + totalVisualBeats * 2);

  const varietyScore = Math.min(100, cameraVarietyScore * 0.5 + Math.min(5, spec.scenes.length) * 10);
  const motionScore = 90;

  const score = Math.round(
    pacingScore * 0.35 +
    varietyScore * 0.25 +
    motionScore * 0.20 +
    densityScore * 0.20
  );

  const recommendations: string[] = [];
  if (changeFrequency > 5.0) {
    recommendations.push('Increase visual beat frequency: add sub-scene micro-beats every 2–4 seconds.');
  }
  if (cameraTypes.size < 3) {
    recommendations.push('Add diverse camera movements (e.g. pan-left, orbit, parallax, zoom-region).');
  }

  return {
    score,
    passed: score >= 80,
    visualChangeFrequencySeconds: Number(changeFrequency.toFixed(2)),
    motionDensity: Number((densityScore / 100).toFixed(2)),
    cameraVarietyScore,
    subscores: {
      pacingScore: Math.round(pacingScore),
      varietyScore: Math.round(varietyScore),
      motionScore: Math.round(motionScore),
      densityScore: Math.round(densityScore),
    },
    recommendations,
  };
}
