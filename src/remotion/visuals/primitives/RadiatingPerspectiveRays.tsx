'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface RadiatingPerspectiveRaysProps {
  rayCount?: number;
  centerText?: string;
  subText?: string;
  metric?: string;
  amberColor?: string;
  mintColor?: string;
  durationInFrames: number;
  className?: string;
  style?: React.CSSProperties;
}

export const RadiatingPerspectiveRays: React.FC<RadiatingPerspectiveRaysProps> = ({
  rayCount = 29,
  centerText = 'MORE THROUGHPUT CHANGES THE FRONTIER',
  subText = 'THE PHYSICAL FOUNDATION OF THE NEXT ERA',
  metric = '100×',
  amberColor = '#ffc857',
  mintColor = '#64e2c5',
  durationInFrames,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const popSpring = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 85 } });

  return (
    <div
      className={`relative w-full h-full select-none overflow-hidden ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 43%, #39473f 0%, #161a1b 38%, #090b10 80%)',
        ...style,
      }}
    >
      {/* 29 Radiating Perspective Ray Lines */}
      {Array.from({ length: rayCount }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: i % 4 === 0 ? '5px' : '2px',
            height: '2100px',
            left: `${18 + i * 38}px`,
            top: '-120px',
            background: i % 3 ? amberColor : mintColor,
            opacity: 0.18 + 0.12 * Math.sin((frame + i * 4) / 8),
            transform: `rotate(${(i - Math.floor(rayCount / 2)) * 3.2}deg)`,
            transformOrigin: 'bottom center',
          }}
        />
      ))}

      {/* Hero Centered Metric (e.g. 100x) */}
      <div
        style={{
          position: 'absolute',
          top: '320px',
          width: '100%',
          textAlign: 'center',
          color: '#f6f1e7',
          fontFamily: 'Arial Black, Arial, sans-serif',
          fontSize: '320px',
          letterSpacing: '-26px',
          lineHeight: 0.76,
          transform: `scale(${interpolate(popSpring, [0, 1], [0.55, 1.0])})`,
          textShadow: `0 0 70px ${amberColor}66, 0 10px 40px rgba(0,0,0,0.9)`,
          zIndex: 10,
        }}
      >
        {metric}
      </div>

      {/* Headline Narrative */}
      <div
        style={{
          position: 'absolute',
          top: '740px',
          width: '100%',
          textAlign: 'center',
          color: '#f6f1e7',
          fontFamily: 'Arial Black, Arial, sans-serif',
          fontSize: '56px',
          letterSpacing: '-3px',
          lineHeight: 0.94,
          textTransform: 'uppercase',
          padding: '0 40px',
          boxSizing: 'border-box',
          zIndex: 10,
        }}
      >
        {centerText}
      </div>

      {/* Monospace Editorial Payoff */}
      <div
        style={{
          position: 'absolute',
          bottom: '160px',
          left: '60px',
          right: '60px',
          color: mintColor,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '18px',
          letterSpacing: '4px',
          fontWeight: 800,
          textAlign: 'center',
          textTransform: 'uppercase',
          zIndex: 10,
        }}
      >
        {subText}
      </div>
    </div>
  );
};
