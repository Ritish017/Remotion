'use client';

import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { WordTimestamp, BrandDNA } from '@/lib/video-spec/types';

interface KaraokeCaptionsProps {
  words: WordTimestamp[];
  brand?: BrandDNA;
  className?: string;
  style?: React.CSSProperties;
}

export const KaraokeCaptions: React.FC<KaraokeCaptionsProps> = ({
  words = [],
  brand,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  if (!words || words.length === 0) return null;

  // Find currently active word index
  const activeWordIndex = words.findIndex(
    (w) => currentTime >= w.start && currentTime <= w.end
  );

  // Fallback: if between words, find nearest past word
  const currentIdx = activeWordIndex !== -1 
    ? activeWordIndex 
    : words.findLastIndex((w) => currentTime >= w.start);

  if (currentIdx === -1) return null;

  // Chunk into 4-6 words around current index to maintain readable subtitle lines
  const windowSize = 5;
  const startIdx = Math.max(0, currentIdx - 2);
  const endIdx = Math.min(words.length, startIdx + windowSize);
  const visibleWords = words.slice(startIdx, endIdx);

  const highlightColor = brand?.captionStyle?.highlightColor || '#ffd166';
  const activeTextColor = brand?.captionStyle?.activeTextColor || '#000000';
  const inactiveTextColor = brand?.captionStyle?.inactiveTextColor || '#ffffff';
  const preset = brand?.captionStyle?.preset || 'vox-editorial';

  return (
    <div
      className={`absolute bottom-28 left-0 right-0 z-40 flex justify-center px-8 pointer-events-none ${className}`}
      style={style}
    >
      <div
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-6 py-3 rounded-2xl backdrop-blur-md transition-all shadow-2xl"
        style={{
          backgroundColor: brand?.captionStyle?.boxBackground || 'rgba(11, 13, 19, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        {visibleWords.map((w, i) => {
          const absoluteIdx = startIdx + i;
          const isActive = absoluteIdx === currentIdx;

          if (preset === 'karaoke-pill') {
            return (
              <span
                key={`${w.word}-${absoluteIdx}`}
                className="px-2.5 py-1 rounded-lg font-black text-2xl tracking-tight transition-all duration-150 uppercase"
                style={{
                  backgroundColor: isActive ? highlightColor : 'transparent',
                  color: isActive ? activeTextColor : inactiveTextColor,
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: isActive ? `0 0 20px ${highlightColor}88` : 'none',
                }}
              >
                {w.word}
              </span>
            );
          }

          // Vox-style editorial caption
          return (
            <span
              key={`${w.word}-${absoluteIdx}`}
              className="font-black text-3xl tracking-tight transition-all duration-100"
              style={{
                color: isActive ? highlightColor : inactiveTextColor,
                transform: isActive ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
                textShadow: isActive ? `0 2px 10px rgba(0,0,0,0.9), 0 0 15px ${highlightColor}66` : '0 2px 8px rgba(0,0,0,0.8)',
                display: 'inline-block',
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
