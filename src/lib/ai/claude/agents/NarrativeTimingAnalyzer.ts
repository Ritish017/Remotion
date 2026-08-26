import type { WordTimestamp } from '@/lib/video-spec/types';

export type WordCategory = 'HOOK' | 'FACT' | 'STATISTIC' | 'CONTRAST' | 'CAUSE' | 'EFFECT' | 'CONCLUSION' | 'EMPHASIS';

export interface ClassifiedWord {
  word: string;
  start: number;
  end: number;
  category: WordCategory;
  frameStart: number;
  frameEnd: number;
  weight: number; // 0.0 to 1.0
}

export interface NarrativeTimingAnalysis {
  classifiedWords: ClassifiedWord[];
  keyEmphasisWords: string[];
  suggestedPacing: 'fast_kinetic' | 'editorial_measured' | 'dramatic_slow';
  triggerFrames: Record<string, number>;
}

const STATISTIC_REGEX = /\b(\d+|[0-9]+%|[0-9]+x|billion|million|trillion|gigawatt|terawatt|joules|watts)\b/i;
const CONTRAST_WORDS = new Set(['but', 'however', 'instead', 'versus', 'unlike', 'breakthrough', 'wall', 'flaw', 'crisis']);
const CAUSE_WORDS = new Set(['because', 'due', 'eliminates', 'delivers', 'forces', 'mimics', 'requires', 'ignites']);
const HOOK_WORDS = new Set(['secret', 'physics', 'energy', 'revolution', 'rewriting', 'death', 'end', 'first', 'breakthrough']);

export function analyzeNarrativeTiming(words: WordTimestamp[], fps: number = 30): NarrativeTimingAnalysis {
  const classifiedWords: ClassifiedWord[] = [];
  const keyEmphasisWords: string[] = [];
  const triggerFrames: Record<string, number> = {};

  for (const w of words) {
    const clean = w.word.toLowerCase().replace(/[^a-z0-9%]/g, '');
    let category: WordCategory = 'EMPHASIS';
    let weight = 0.5;

    if (STATISTIC_REGEX.test(clean)) {
      category = 'STATISTIC';
      weight = 0.95;
      keyEmphasisWords.push(w.word);
    } else if (CONTRAST_WORDS.has(clean)) {
      category = 'CONTRAST';
      weight = 0.8;
      keyEmphasisWords.push(w.word);
    } else if (CAUSE_WORDS.has(clean)) {
      category = 'CAUSE';
      weight = 0.75;
    } else if (HOOK_WORDS.has(clean)) {
      category = 'HOOK';
      weight = 0.9;
      keyEmphasisWords.push(w.word);
    }

    const frameStart = Math.round(w.start * fps);
    const frameEnd = Math.round(w.end * fps);

    classifiedWords.push({
      word: w.word,
      start: w.start,
      end: w.end,
      category,
      frameStart,
      frameEnd,
      weight,
    });

    if (weight > 0.8) {
      triggerFrames[w.word] = frameStart;
    }
  }

  const wordsPerSecond = words.length > 0 && words[words.length - 1].end > 0
    ? words.length / words[words.length - 1].end
    : 2.5;

  const suggestedPacing = wordsPerSecond > 2.8
    ? 'fast_kinetic'
    : wordsPerSecond < 2.0
    ? 'dramatic_slow'
    : 'editorial_measured';

  return {
    classifiedWords,
    keyEmphasisWords: Array.from(new Set(keyEmphasisWords)),
    suggestedPacing,
    triggerFrames,
  };
}
