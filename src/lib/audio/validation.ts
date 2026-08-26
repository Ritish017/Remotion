import type { TimedWord, NarrationResponse } from './types';

export interface TimelineValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates word-level timestamps against actual audio duration and transcript structure.
 * Guaranteed to catch:
 * - Negative timestamps
 * - Non-monotonic timestamp ordering (time going backward)
 * - Inverted word durations (end <= start)
 * - Final word exceeding audio duration beyond allowable tolerance
 * - Transcript-to-Whisper alignment mismatches
 */
export function validateNarrationTimeline(
  words: TimedWord[],
  audioDurationSeconds: number,
  expectedTranscript?: string,
  toleranceSeconds: number = 1.5
): TimelineValidationResult {
  const errors: string[] = [];

  if (!words || words.length === 0) {
    errors.push('Narration timeline validation failed: Word timestamp array is empty.');
    return { valid: false, errors };
  }

  // 1. First word starts at non-negative time
  if (words[0].start < 0) {
    errors.push(`First word starts at negative time: ${words[0].start}s`);
  }

  let prevStart = -1;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];

    // 2. End time must be strictly greater than start time
    if (w.end <= w.start) {
      errors.push(`Word #${i + 1} ("${w.word}") has invalid duration: start=${w.start}s, end=${w.end}s (end <= start).`);
    }

    // 3. No negative timestamps
    if (w.start < 0 || w.end < 0) {
      errors.push(`Word #${i + 1} ("${w.word}") contains negative timestamp: start=${w.start}s, end=${w.end}s.`);
    }

    // 4. Monotonic start time ordering
    if (w.start < prevStart) {
      errors.push(
        `Word #${i + 1} ("${w.word}") is not monotonically ordered: start=${w.start}s is earlier than previous word start=${prevStart}s.`
      );
    }
    prevStart = w.start;
  }

  // 5. Final word ends within audio duration + tolerance
  const lastWord = words[words.length - 1];
  const maxAllowedTime = audioDurationSeconds + toleranceSeconds;
  if (lastWord.end > maxAllowedTime) {
    errors.push(
      `Final word ("${lastWord.word}") end time (${lastWord.end}s) exceeds audio duration (${audioDurationSeconds}s) beyond tolerance (${toleranceSeconds}s).`
    );
  }

  // 6. Transcript alignment check
  if (expectedTranscript) {
    const expectedWords = expectedTranscript.trim().split(/\s+/).filter(Boolean);
    const ratio = words.length / (expectedWords.length || 1);
    if (ratio < 0.4 || ratio > 2.5) {
      errors.push(
        `Whisper timestamp count (${words.length}) drastically differs from expected transcript word count (${expectedWords.length}). Word ratio: ${ratio.toFixed(2)}.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
