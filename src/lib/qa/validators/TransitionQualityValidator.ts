import type { VideoSpec } from '@/lib/video-spec/types';

export interface TransitionQualityReport {
  passed: boolean;
  score: number;
  warnings: string[];
}

export function validateTransitionQuality(spec: VideoSpec): TransitionQualityReport {
  const warnings: string[] = [];
  let violations = 0;

  for (const scene of spec.scenes) {
    const dur = scene.transitionToNext?.durationFrames ?? 12;

    // Transitions longer than 24 frames (0.8s) break pacing
    if (dur > 24) {
      violations++;
      warnings.push(`Scene ${scene.sceneNumber}: Transition duration (${dur} frames) is excessively long, causing narrative drag.`);
    }

    if (scene.visualBeats) {
      for (const beat of scene.visualBeats) {
        const beatTransDur = beat.transition?.durationFrames ?? 12;
        if (beatTransDur > 20) {
          violations++;
          warnings.push(`Scene ${scene.sceneNumber} Beat "${beat.id}": Sub-beat transition (${beatTransDur}f) exceeds safe pacing limit.`);
        }
      }
    }
  }

  const score = Math.max(0, 100 - violations * 15);

  return {
    passed: violations === 0,
    score,
    warnings,
  };
}
