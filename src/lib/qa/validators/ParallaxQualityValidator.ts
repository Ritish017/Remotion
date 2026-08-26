import type { VideoSpec } from '@/lib/video-spec/types';

export interface ParallaxQualityReport {
  passed: boolean;
  score: number;
  warnings: string[];
}

export function validateParallaxQuality(spec: VideoSpec): ParallaxQualityReport {
  const warnings: string[] = [];
  let violations = 0;

  for (const scene of spec.scenes) {
    if (scene.visualBeats) {
      for (const beat of scene.visualBeats) {
        const layers = beat.layers || [];
        // Require layered separation for cinematic storytelling
        if (layers.length < 2) {
          violations++;
          warnings.push(`Scene ${scene.sceneNumber} Beat "${beat.id}": Flattened single-layer composition detected; multi-depth stack recommended.`);
        }
      }
    }
  }

  const score = Math.max(0, 100 - violations * 10);

  return {
    passed: score >= 80,
    score,
    warnings,
  };
}
