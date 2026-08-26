'use client';

import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export interface MatchCutProps {
  geometry?: 'circle' | 'rect' | 'chip' | 'card' | 'line' | 'none';
  durationFrames?: number;
  color?: string;
  className?: string;
}

export const MatchCut: React.FC<MatchCutProps> = ({
  geometry = 'circle',
  durationFrames = 12,
  color = '#ffd166',
  className = '',
}) => {
  const frame = useCurrentFrame();
  if (frame >= durationFrames) return null;

  const progress = frame / durationFrames;
  const scale = interpolate(progress, [0, 0.5, 1], [0.1, 1.2, 2.5]);
  const opacity = interpolate(progress, [0, 0.4, 1], [1, 0.7, 0]);

  return (
    <div className={`absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-50 ${className}`}>
      {geometry === 'circle' && (
        <div
          className="rounded-full border-4"
          style={{
            width: '240px',
            height: '240px',
            borderColor: color,
            transform: `scale(${scale})`,
            opacity,
            boxShadow: `0 0 30px ${color}80`,
          }}
        />
      )}
      {geometry === 'chip' && (
        <div
          className="rounded-2xl border-4"
          style={{
            width: '280px',
            height: '280px',
            borderColor: color,
            transform: `scale(${scale}) rotate(${progress * 45}deg)`,
            opacity,
            boxShadow: `0 0 40px ${color}80`,
          }}
        />
      )}
      {geometry === 'card' && (
        <div
          className="rounded-xl border-2"
          style={{
            width: '320px',
            height: '180px',
            borderColor: color,
            transform: `scale(${scale})`,
            opacity,
          }}
        />
      )}
    </div>
  );
};
