'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface SkewedMonolithTowersProps {
  counterTarget?: number;
  counterSuffix?: string;
  headline?: string;
  sublabel?: string;
  sourceText?: string;
  towerCount?: number;
  accentColor?: string;
  mintColor?: string;
  rustColor?: string;
  durationInFrames: number;
  className?: string;
  style?: React.CSSProperties;
}

export const SkewedMonolithTowers: React.FC<SkewedMonolithTowersProps> = ({
  counterTarget = 400,
  counterSuffix = '%',
  headline = 'MORE COMPUTE PER MEGAWATT',
  sublabel = 'PHYSICAL SCALING // MONOLITHIC DENSITY',
  sourceText = 'LAB BENCHMARK // CONFIRMED',
  towerCount = 7,
  accentColor = '#ffc857',
  mintColor = '#64e2c5',
  rustColor = '#ef6544',
  durationInFrames,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const count = Math.round(
    interpolate(frame, [15, Math.min(durationInFrames - 15, 120)], [0, counterTarget], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  const towerSprings = Array.from({ length: towerCount }).map((_, i) =>
    spring({
      frame: frame - 12 - i * 8,
      fps,
      config: { damping: 16, stiffness: 85 },
    })
  );

  const colors = [rustColor, accentColor, mintColor];

  return (
    <div
      className={`relative w-full h-full select-none overflow-hidden ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        ...style,
      }}
    >
      {/* Giant Screen-Filling Percentage Display (Middle Third) */}
      <div
        style={{
          position: 'absolute',
          left: '64px',
          top: '460px',
          color: '#f6f1e7',
          fontFamily: 'Arial Black, Arial, sans-serif',
          fontSize: '280px',
          letterSpacing: '-22px',
          lineHeight: 0.75,
          zIndex: 12,
          textShadow: '0 10px 40px rgba(0,0,0,0.95)',
        }}
      >
        {count}
        <span style={{ color: accentColor, fontSize: '150px', letterSpacing: '-6px', marginLeft: '8px' }}>
          {counterSuffix}
        </span>
      </div>

      {/* Sub-headline typography */}
      <div
        style={{
          position: 'absolute',
          left: '68px',
          top: '720px',
          color: '#f6f1e7',
          fontFamily: 'Arial Black, Arial, sans-serif',
          fontSize: '44px',
          lineHeight: 0.96,
          zIndex: 12,
          textTransform: 'uppercase',
          maxWidth: '800px',
        }}
      >
        {headline}
        <div
          style={{
            fontSize: '18px',
            fontFamily: 'JetBrains Mono, monospace',
            color: mintColor,
            letterSpacing: '3px',
            marginTop: '14px',
            fontWeight: 800,
          }}
        >
          {sublabel}
        </div>
      </div>

      {/* Rising Physical Skewed Monolith Towers (Bottom Half) */}
      <div
        style={{
          position: 'absolute',
          left: '62px',
          right: '62px',
          bottom: '150px',
          height: '460px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-end',
          zIndex: 8,
        }}
      >
        {towerSprings.map((v, i) => {
          const color = colors[i % colors.length];
          const targetHeight = 15 + (i % 3) * 28 + (i * 5);

          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${interpolate(v, [0, 1], [4, targetHeight])}%`,
                background: color,
                transform: `skewY(-10deg) translateY(${interpolate(v, [0, 1], [180, 0])}px)`,
                boxShadow: `0 -18px 48px ${color}55`,
                borderRadius: '2px 2px 0 0',
                willChange: 'transform, height',
              }}
            />
          );
        })}
      </div>

      {/* Source Citation Mark */}
      <div
        style={{
          position: 'absolute',
          left: '64px',
          bottom: '80px',
          color: '#cbd5e1',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '16px',
          letterSpacing: '2px',
          fontWeight: 700,
          zIndex: 12,
        }}
      >
        {sourceText}
      </div>
    </div>
  );
};
