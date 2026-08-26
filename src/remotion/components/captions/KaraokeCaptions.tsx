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

export function cleanTranscriptWord(word: string): string {
  if (!word) return '';
  // Remove noise like [music], (applause), etc.
  const cleaned = word.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
  return cleaned;
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

  // Filter out artifact/empty words
  const validWords = React.useMemo(() => {
    return (words || [])
      .map((w) => ({
        ...w,
        word: cleanTranscriptWord(w.word),
      }))
      .filter((w) => w.word.length > 0);
  }, [words]);

  if (!validWords || validWords.length === 0) return null;

  // Find currently active word index
  const activeWordIndex = validWords.findIndex(
    (w) => currentTime >= w.start && currentTime <= w.end
  );

  // Fallback: if between words, find nearest past word
  const currentIdx = activeWordIndex !== -1 
    ? activeWordIndex 
    : validWords.findLastIndex((w) => currentTime >= w.start);

  if (currentIdx === -1) return null;

  // Chunk into 4-5 words around current index to maintain clean 1-2 line documentary subtitle
  const windowSize = 5;
  const startIdx = Math.max(0, currentIdx - 2);
  const endIdx = Math.min(validWords.length, startIdx + windowSize);
  const visibleWords = validWords.slice(startIdx, endIdx);

  const highlightColor = brand?.captionStyle?.highlightColor || '#ffd166';
  const activeTextColor = brand?.captionStyle?.activeTextColor || '#0b0d13';
  const inactiveTextColor = brand?.captionStyle?.inactiveTextColor || '#ffffff';
  const preset = brand?.captionStyle?.preset || 'vox-editorial';

  return (
    <div
      className={`absolute bottom-28 left-0 right-0 z-50 flex justify-center px-8 pointer-events-none ${className}`}
      style={{
        position: 'absolute',
        bottom: '120px',
        left: '40px',
        right: '40px',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 50,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <div
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-6 py-3 rounded-2xl backdrop-blur-xl shadow-2xl max-w-2xl"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '16px 28px',
          borderRadius: '24px',
          backgroundColor: brand?.captionStyle?.boxBackground || 'rgba(11, 13, 19, 0.90)',
          border: '1.5px solid rgba(255, 255, 255, 0.20)',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(16px)',
          maxWidth: '920px',
        }}
      >
        {visibleWords.map((w, i) => {
          const absoluteIdx = startIdx + i;
          const isActive = absoluteIdx === currentIdx;

          if (preset === 'karaoke-pill') {
            return (
              <span
                key={`${w.word}-${absoluteIdx}`}
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 900,
                  fontSize: '32px',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                  backgroundColor: isActive ? highlightColor : 'transparent',
                  color: isActive ? activeTextColor : inactiveTextColor,
                  transform: isActive ? 'scale(1.08)' : 'scale(1.0)',
                  boxShadow: isActive ? `0 0 24px ${highlightColor}99` : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {w.word}
              </span>
            );
          }

          // Vox-style editorial documentary caption
          return (
            <span
              key={`${w.word}-${absoluteIdx}`}
              style={{
                display: 'inline-block',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 900,
                fontSize: '36px',
                letterSpacing: '-0.02em',
                color: isActive ? highlightColor : inactiveTextColor,
                transform: isActive ? 'scale(1.10) translateY(-2px)' : 'scale(1.0)',
                textShadow: isActive
                  ? `0 2px 14px rgba(0,0,0,0.95), 0 0 22px ${highlightColor}88`
                  : '0 2px 8px rgba(0,0,0,0.85)',
                transition: 'all 0.1s ease',
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
