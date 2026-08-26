import type { VisualPlan } from '@/lib/video-spec/visual';
import type { NarrativeTimingAnalysis } from './NarrativeTimingAnalyzer';

export interface MotionPlan {
  motionSeed: number;
  sceneMotions: Array<{
    sceneId: string;
    cameraMovement: string;
    cameraIntensity: number;
    beatMotions: Array<{
      beatId: string;
      entrance: string;
      exit: string;
      motionPrimitives: string[];
      emphasisTrigger?: {
        word?: string;
        frame?: number;
        action: string;
      };
    }>;
  }>;
}

export async function runMotionDirector(
  visualPlan: VisualPlan,
  timingAnalysisOrSeed?: NarrativeTimingAnalysis | number
): Promise<MotionPlan> {
  const motionSeed = typeof timingAnalysisOrSeed === 'number'
    ? timingAnalysisOrSeed
    : visualPlan.motionSeed || 42;
  const timingAnalysis = typeof timingAnalysisOrSeed === 'object' ? timingAnalysisOrSeed : undefined;

  const sceneMotions = visualPlan.scenes.map((scene) => {
    const cameraMovement = scene.camera?.movement || 'push';
    const cameraIntensity = scene.camera?.intensity || 0.22;

    const beatMotions = scene.beats.map((beat) => {
      const entrance = beat.motion?.includes('spring_in') ? 'spring' : 'fade';
      const exit = 'fade';

      return {
        beatId: beat.id,
        entrance,
        exit,
        motionPrimitives: beat.motion || ['spring_in', 'slow_drift'],
        emphasisTrigger: beat.emphasis ? {
          word: beat.emphasis.targetWord,
          frame: beat.emphasis.triggerFrame || (beat.emphasis.targetWord && timingAnalysis?.triggerFrames[beat.emphasis.targetWord] ? timingAnalysis.triggerFrames[beat.emphasis.targetWord] : undefined),
          action: beat.emphasis.action || 'none',
        } : undefined,
      };
    });

    return {
      sceneId: scene.sceneId,
      cameraMovement,
      cameraIntensity,
      beatMotions,
    };
  });

  return {
    motionSeed,
    sceneMotions,
  };
}
