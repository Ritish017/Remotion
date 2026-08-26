'use client';

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { WordTimestamp, BrandDNA } from '@/lib/video-spec/types';

export type CaptionPreset =
  | 'vox-editorial'
  | 'karaoke-pill'
  | 'documentary-subtitles'
  | 'kinetic-pop'
  | 'word-spotlight'
  | 'minimal-bottom';

export interface MultiStyleCaptionsProps {
  words: WordTimestamp[];
  preset?: CaptionPreset;
  brand?: BrandDNA;
  className?: string;
}

export const DocumentaryCaptions: React.FC<MultiStyleCaptionsProps> = ({
  words = [],
  preset = 'vox-editorial',
  brand,
  className = '',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const validWords = React.useMemo(() => {
    return (words || [])
      .map((w) => ({
        ...w,
        word: (w.word || '').replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim(),
      }))
      .filter((w) => w.word.length > 0);
  }, [words]);

  if (!validWords || validWords.length === 0) return null;

  const activeWordIndex = validWords.findIndex(
    (w) => currentTime >= w.start && currentTime <= w.end
  );

  const currentIdx =
    activeWordIndex !== -1
      ? activeWordIndex
      : validWords.findLastIndex((w) => currentTime >= w.start);

  if (currentIdx === -1) return null;

  const highlightColor = brand?.captionStyle?.highlightColor || '#ffd166';
  const activeWord = validWords[currentIdx];

  // 1. Kinetic Single-Word Pop
  if (preset === 'kinetic-pop') {
    const wordProgress = interpolate(
      currentTime,
      [activeWord.start, activeWord.end],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const scale = interpolate(wordProgress, [0, 0.2, 1], [0.8, 1.25, 1.05]);

    return (
      <div className={`absolute bottom-36 inset-x-0 flex justify-center items-center z-50 pointer-events-none ${className}`}>
        <div
          className="px-8 py-4 rounded-3xl bg-black/85 backdrop-blur-2xl border border-white/20 shadow-2xl"
          style={{ transform: `scale(${scale})` }}
        >
          <span
            className="text-5xl font-black uppercase tracking-tight text-white drop-shadow-2xl"
            style={{ color: highlightColor, fontFamily: 'Inter, sans-serif' }}
          >
            {activeWord.word}
          </span>
        </div>
      </div>
    );
  }

  // 2. Minimal Bottom Subtitle
  if (preset === 'minimal-bottom' || preset === 'documentary-subtitles') {
    const windowSize = 7;
    const startIdx = Math.max(0, currentIdx - 3);
    const endIdx = Math.min(validWords.length, startIdx + windowSize);
    const visibleWords = validWords.slice(startIdx, endIdx);

    return (
      <div className={`absolute bottom-20 inset-x-0 flex justify-center px-12 z-50 pointer-events-none ${className}`}>
        <div className="px-6 py-2.5 rounded-lg bg-black/65 backdrop-blur-md border border-white/10 text-center max-w-2xl">
          <p className="text-xl md:text-2xl font-medium tracking-normal text-slate-200 leading-relaxed font-sans">
            {visibleWords.map((w, i) => {
              const absIdx = startIdx + i;
              const isActive = absIdx === currentIdx;
              return (
                <span
                  key={`min-${w.word}-${absIdx}`}
                  className={`mx-1 transition-colors duration-100 ${
                    isActive ? 'font-bold text-white underline decoration-2 underline-offset-4' : 'text-slate-400'
                  }`}
                  style={{ textDecorationColor: isActive ? highlightColor : 'transparent' }}
                >
                  {w.word}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    );
  }

  // 3. Multi-word Box Caption (Vox-editorial / Karaoke-pill / Word-spotlight)
  const windowSize = 5;
  const startIdx = Math.max(0, currentIdx - 2);
  const endIdx = Math.min(validWords.length, startIdx + windowSize);
  const visibleWords = validWords.slice(startIdx, endIdx);

  return (
    <div className={`absolute bottom-28 inset-x-0 flex justify-center px-8 z-50 pointer-events-none ${className}`}>
      <div className="flex flex-wrap items-center justify-center gap-3 px-7 py-3.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/20 shadow-2xl max-w-3xl">
        {visibleWords.map((w, i) => {
          const absIdx = startIdx + i;
          const isActive = absIdx === currentIdx;

          return (
            <span
              key={`doc-${w.word}-${absIdx}`}
              className={`text-3xl md:text-4xl font-black uppercase tracking-tight px-2 py-1 rounded-lg transition-all duration-100 ${
                isActive
                  ? 'bg-amber-400 text-slate-950 scale-110 shadow-lg'
                  : 'text-white/90 bg-transparent'
              }`}
              style={{
                backgroundColor: isActive ? highlightColor : 'transparent',
                color: isActive ? '#0b0d13' : '#ffffff',
                fontFamily: brand?.typography.fontFamilyHeading || 'Inter, sans-serif',
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
