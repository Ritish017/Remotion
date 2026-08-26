import type { VideoSpec } from '@/lib/video-spec/types';

export interface CameraBoundsReport {
  passed: boolean;
  score: number; // 0 to 100
  warnings: string[];
}

export function validateCameraBounds(spec: VideoSpec): CameraBoundsReport {
  const warnings: string[] = [];
  let violations = 0;

  for (const scene of spec.scenes) {
    const intensity = scene.camera?.intensity ?? 0.15;

    // Reject extreme camera overshoots that cause viewport tearing
    if (intensity > 0.45) {
      violations++;
      warnings.push(`Scene ${scene.sceneNumber}: Camera intensity (${intensity}) exceeds maximum safe threshold (0.45), which may clip subject framing.`);
    }

    if (scene.visualBeats) {
      for (const beat of scene.visualBeats) {
        const beatIntensity = beat.camera?.intensity ?? 0.2;
        if (beatIntensity > 0.45) {
          violations++;
          warnings.push(`Scene ${scene.sceneNumber} Beat "${beat.id}": Camera intensity (${beatIntensity}) is excessively high.`);
        }
      }
    }
  }

  const score = Math.max(0, 100 - violations * 20);

  return {
    passed: violations === 0,
    score,
    warnings,
  };
}
