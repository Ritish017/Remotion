import type { VideoSpec } from '@/lib/video-spec/types';

export interface VisualDiversityReport {
  passed: boolean;
  score: number; // 0 to 100
  warnings: string[];
  metrics: {
    uniqueVisualLanguages: number;
    uniqueCameraMovements: number;
    uniqueTransitions: number;
    consecutiveRepeats: number;
  };
}

export function validateVisualDiversity(spec: VideoSpec): VisualDiversityReport {
  const warnings: string[] = [];
  const visualLanguages: string[] = [];
  const cameraMovements: string[] = [];
  const transitions: string[] = [];

  for (const scene of spec.scenes) {
    visualLanguages.push(scene.visualLanguage || scene.type);
    cameraMovements.push(scene.camera?.type || 'push');
    transitions.push(scene.transitionToNext?.type || 'fade');

    if (scene.visualBeats && scene.visualBeats.length > 0) {
      for (const beat of scene.visualBeats) {
        visualLanguages.push(beat.primaryVisual);
        if (beat.camera) {
          cameraMovements.push(beat.camera.movement);
        }
      }
    }
  }

  // Check consecutive duplicates
  let consecutiveRepeats = 0;
  for (let i = 1; i < visualLanguages.length; i++) {
    if (visualLanguages[i] === visualLanguages[i - 1] && visualLanguages[i] !== 'editorial-paper') {
      consecutiveRepeats++;
      warnings.push(`REPEATED_VISUAL_TREATMENT: Consecutive visual treatment "${visualLanguages[i]}" at index ${i}`);
    }
  }

  // Check camera repetition
  for (let i = 2; i < cameraMovements.length; i++) {
    if (cameraMovements[i] === cameraMovements[i - 1] && cameraMovements[i] === cameraMovements[i - 2]) {
      warnings.push(`CAMERA_REPETITION: Consecutive camera movement "${cameraMovements[i]}" at index ${i}`);
    }
  }

  const uniqueVisualLanguages = new Set(visualLanguages).size;
  const uniqueCameraMovements = new Set(cameraMovements).size;
  const uniqueTransitions = new Set(transitions).size;

  let score = 100;
  if (uniqueVisualLanguages < 3) score -= 25;
  if (uniqueCameraMovements < 2) score -= 20;
  score -= consecutiveRepeats * 10;
  score = Math.max(0, Math.min(100, score));

  return {
    passed: score >= 70,
    score,
    warnings,
    metrics: {
      uniqueVisualLanguages,
      uniqueCameraMovements,
      uniqueTransitions,
      consecutiveRepeats,
    },
  };
}
