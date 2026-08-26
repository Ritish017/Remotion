import type { VideoSpec } from '@/lib/video-spec/types';

export interface CaptionQualityReport {
  passed: boolean;
  score: number;
  wordCount: number;
  warnings: string[];
}

export function validateCaptionQuality(spec: VideoSpec): CaptionQualityReport {
  const warnings: string[] = [];
  const words = spec.narration?.words || [];
  const totalSeconds = spec.composition.durationInFrames / (spec.composition.fps || 30);
  let violations = 0;

  if (words.length === 0) {
    return {
      passed: true,
      score: 85,
      wordCount: 0,
      warnings: ['No word-level timestamps provided in narration.'],
    };
  }

  for (let i = 0; i < words.length; i++) {
    const curr = words[i];

    // Monotonicity check
    if (curr.start < 0 || curr.end <= curr.start) {
      violations++;
      warnings.push(`Word "${curr.word}" at index ${i} has invalid bounds [${curr.start}s - ${curr.end}s].`);
    }

    // Overlap check with previous word
    if (i > 0 && curr.start < words[i - 1].start) {
      violations++;
      warnings.push(`Word "${curr.word}" timestamp is out of chronological sequence.`);
    }

    // Video bounds check
    if (curr.end > totalSeconds + 1.5) {
      violations++;
      warnings.push(`Word "${curr.word}" (${curr.end.toFixed(1)}s) exceeds composition duration (${totalSeconds.toFixed(1)}s).`);
    }
  }

  const score = Math.max(0, 100 - violations * 10);

  return {
    passed: violations === 0,
    score,
    wordCount: words.length,
    warnings,
  };
}
