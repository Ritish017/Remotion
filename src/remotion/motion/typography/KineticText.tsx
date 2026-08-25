'use client';

import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface KineticTextProps {
  text: string;
  highlightWords?: string[];
  highlightColor?: string;
  delay?: number;
  staggerFrames?: number;
  fontSize?: number | string;
  fontWeight?: string | number;
  fontFamily?: string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  highlightWords = [],
  highlightColor = '#ffd166',
  delay = 0,
  staggerFrames = 2,
  fontSize = '3.5rem',
  fontWeight = 800,
  fontFamily = 'inherit',
  color = '#f8fafc',
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(' ');
  const normalizedHighlights = highlightWords.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''));

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 leading-tight ${className}`}
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        color,
        ...style,
      }}
    >
      {words.map((word, idx) => {
        const wordDelay = delay + idx * staggerFrames;
        const spr = spring({
          frame: Math.max(0, frame - wordDelay),
          fps,
          config: { damping: 14, stiffness: 120, mass: 0.4 },
        });

        const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isHighlighted = normalizedHighlights.includes(cleanWord);

        return (
          <span
            key={`${word}-${idx}`}
            style={{
              display: 'inline-block',
              transform: `translateY(${(1 - spr) * 24}px) scale(${0.85 + 0.15 * spr})`,
              opacity: spr,
              color: isHighlighted ? highlightColor : color,
              textShadow: isHighlighted ? `0 0 20px ${highlightColor}44` : 'none',
              willChange: 'transform, opacity',
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
