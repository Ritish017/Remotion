import { VideoSpecSchema } from './schema';
import type { VideoSpec } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  repairedSpec?: VideoSpec;
}

export function validateVideoSpec(data: unknown): ValidationResult {
  const result = VideoSpecSchema.safeParse(data);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      warnings: [],
    };
  }

  const spec = result.data as VideoSpec;
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check scene sequence & timing continuity
  let currentFrame = 0;
  for (let i = 0; i < spec.scenes.length; i++) {
    const scene = spec.scenes[i];
    if (scene.startFrame !== currentFrame) {
      warnings.push(`Scene ${scene.sceneNumber} starts at frame ${scene.startFrame}, but expected frame ${currentFrame}. Timing will be normalized.`);
    }
    if (scene.durationFrames <= 0) {
      errors.push(`Scene ${scene.sceneNumber} has non-positive durationFrames (${scene.durationFrames}).`);
    }
    currentFrame += scene.durationFrames;
  }

  if (spec.composition.durationInFrames !== currentFrame) {
    warnings.push(`Composition duration (${spec.composition.durationInFrames}f) does not match total scene duration (${currentFrame}f). Adjusting composition duration.`);
  }

  // Auto-repair spec and visual beats to guarantee flawless rendering
  const repairedScenes = spec.scenes.map((scene, idx) => {
    const prevDuration = spec.scenes.slice(0, idx).reduce((sum, s) => sum + s.durationFrames, 0);
    
    // Normalize visual beats if present
    let repairedBeats = scene.visualBeats;
    if (repairedBeats && repairedBeats.length > 0) {
      let beatCurrentFrame = 0;
      repairedBeats = repairedBeats.map((beat, bIdx) => {
        const beatDur = Math.max(1, beat.durationInFrames);
        const beatObj = {
          ...beat,
          beatIndex: bIdx,
          startFrame: beatCurrentFrame,
          durationInFrames: beatDur,
        };
        beatCurrentFrame += beatDur;
        return beatObj;
      });

      // If total beat duration differs from scene duration, normalize
      if (beatCurrentFrame !== scene.durationFrames && beatCurrentFrame > 0) {
        const ratio = scene.durationFrames / beatCurrentFrame;
        let cumulative = 0;
        repairedBeats = repairedBeats.map((beat, bIdx) => {
          const isLast = bIdx === repairedBeats!.length - 1;
          const adjustedDur = isLast
            ? Math.max(1, scene.durationFrames - cumulative)
            : Math.max(1, Math.round(beat.durationInFrames * ratio));
          const adjustedBeat = {
            ...beat,
            startFrame: cumulative,
            durationInFrames: adjustedDur,
          };
          cumulative += adjustedDur;
          return adjustedBeat;
        });
      }
    }

    return {
      ...scene,
      startFrame: prevDuration,
      sceneNumber: idx + 1,
      visualBeats: repairedBeats,
    };
  });

  const totalFrames = repairedScenes.reduce((sum, s) => sum + s.durationFrames, 0);

  const repairedSpec: VideoSpec = {
    ...spec,
    version: spec.version || '2.0.0',
    motionSeed: spec.motionSeed ?? 42,
    scenes: repairedScenes,
    composition: {
      ...spec.composition,
      durationInFrames: totalFrames,
    },
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    repairedSpec,
  };
}
