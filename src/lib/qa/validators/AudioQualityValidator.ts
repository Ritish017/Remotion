import type { VideoSpec } from '@/lib/video-spec/types';

export interface AudioQualityReport {
  passed: boolean;
  score: number;
  warnings: string[];
}

export function validateAudioQuality(spec: VideoSpec): AudioQualityReport {
  const warnings: string[] = [];
  const durationSec = spec.composition.durationInFrames / (spec.composition.fps || 30);
  const narrationDur = spec.narration?.durationSeconds || 0;
  let violations = 0;

  if (narrationDur > 0 && Math.abs(narrationDur - durationSec) > 3.0) {
    violations++;
    warnings.push(`Narration duration (${narrationDur.toFixed(1)}s) drifts significantly from composition timeline (${durationSec.toFixed(1)}s).`);
  }

  if (spec.audio?.voiceoverVolume <= 0) {
    violations++;
    warnings.push('Voiceover volume is muted (0.0).');
  }

  if (spec.audio?.musicVolume >= (spec.audio?.voiceoverVolume || 1.0)) {
    violations++;
    warnings.push('Music volume conflicts with voiceover level; voice clarity may be compromised.');
  }

  const score = Math.max(0, 100 - violations * 20);

  return {
    passed: violations === 0,
    score,
    warnings,
  };
}
