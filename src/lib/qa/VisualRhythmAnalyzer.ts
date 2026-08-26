import type { VideoSpec } from '@/lib/video-spec/types';

export interface VisualRhythmReport {
  passed: boolean;
  score: number; // 0 to 100
  warnings: string[];
  visualChangeFrequencySeconds?: number;
  metrics: {
    averageBeatDurationSeconds: number;
    visualChangeFrequency: number; // changes per 10 seconds
    scenePacingVariance: number;
    motionDensityScore: number;
  };
}

export type VisualRhythmScore = VisualRhythmReport;

export function analyzeVisualRhythm(spec: VideoSpec): VisualRhythmReport {
  const warnings: string[] = [];
  const fps = spec.composition?.fps || 30;
  const totalFrames = spec.composition?.durationInFrames || 45 * fps;
  const totalDurationSeconds = totalFrames / fps;

  let totalVisualBeats = 0;
  const beatDurationsSeconds: number[] = [];

  for (const scene of spec.scenes) {
    if (scene.visualBeats && scene.visualBeats.length > 0) {
      totalVisualBeats += scene.visualBeats.length;
      scene.visualBeats.forEach(b => {
        beatDurationsSeconds.push(b.durationInFrames / fps);
      });
    } else {
      totalVisualBeats += 1;
      beatDurationsSeconds.push(scene.durationFrames / fps);
    }
  }

  const averageBeatDurationSeconds = totalVisualBeats > 0
    ? Number((totalDurationSeconds / totalVisualBeats).toFixed(2))
    : 4.0;

  const changeFrequency = Number(((totalVisualBeats / totalDurationSeconds) * 10).toFixed(2));

  // Pacing Score calculation
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
        if (b.camera?.movement) cameraTypes.add(b.camera.movement);
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
    densityScore * 0.25 +
    varietyScore * 0.25 +
    motionScore * 0.15
  );

  // Variance calculation
  const mean = averageBeatDurationSeconds;
  const variance = beatDurationsSeconds.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (beatDurationsSeconds.length || 1);

  if (averageBeatDurationSeconds > 6.0) {
    warnings.push(`SLOW_PACING: Average visual beat duration (${averageBeatDurationSeconds}s) exceeds optimal documentary threshold (4.0s).`);
  }
  if (changeFrequency < 2.0) {
    warnings.push(`LOW_CHANGE_FREQUENCY: Only ${changeFrequency} visual shifts per 10 seconds.`);
  }

  return {
    passed: score >= 70,
    score,
    warnings,
    visualChangeFrequencySeconds: averageBeatDurationSeconds,
    metrics: {
      averageBeatDurationSeconds,
      visualChangeFrequency: changeFrequency,
      scenePacingVariance: Number(variance.toFixed(2)),
      motionDensityScore: densityScore,
    },
  };
}
