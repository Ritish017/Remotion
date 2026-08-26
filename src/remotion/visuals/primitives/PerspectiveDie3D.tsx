'use client';

import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export interface PerspectiveDie3DProps {
  headline?: string;
  sublabel?: string;
  metric?: string;
  accentColor?: string;
  mintColor?: string;
  lineCount?: number;
  durationInFrames: number;
  className?: string;
  style?: React.CSSProperties;
}

export const PerspectiveDie3D: React.FC<PerspectiveDie3DProps> = ({
  headline = '3NM TRANSISTOR TERRITORY',
  sublabel = 'ARCHITECTURE // ATOMIC LOGIC GATES',
  metric = '3NM',
  accentColor = '#ffc857',
  mintColor = '#64e2c5',
  lineCount = 17,
  durationInFrames,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const rotation = interpolate(frame, [0, durationInFrames], [-8, 6]);
  const scale = interpolate(frame, [0, durationInFrames], [0.88, 1.18]);
  const lines = Array.from({ length: lineCount });

  return (
    <div
      className={`relative w-full h-full select-none overflow-hidden ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1300px',
        ...style,
      }}
    >
      {/* Background Radial Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 52% 56%, ${accentColor}18 0%, #10141c 45%, #090b10 85%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 3D Rotated Isometric Die Matrix */}
      <div
        style={{
          position: 'absolute',
          width: '1290px',
          height: '1120px',
          left: '-108px',
          top: '480px',
          transform: `perspective(1300px) rotateX(57deg) rotateZ(${rotation}deg) scale(${scale})`,
          transformOrigin: '50% 50%',
          background: 'linear-gradient(135deg, #1b3540, #071015 49%, #29353e)',
          border: `12px solid ${accentColor}`,
          boxShadow: `0 45px 100px #000, inset 0 0 110px ${mintColor}44`,
          willChange: 'transform',
        }}
      >
        {/* Glowing Circuit Bus Lines */}
        {lines.map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 52 + i * 72,
              top: 60 + (i % 3) * 32,
              height: 960 - (i % 4) * 150,
              width: i % 2 ? 26 : 14,
              background: i % 3 === 0 ? mintColor : accentColor,
              opacity: 0.45 + 0.35 * Math.sin((frame + i * 8) / 10),
              boxShadow: `0 0 30px ${i % 3 === 0 ? mintColor : accentColor}`,
            }}
          />
        ))}

        {/* Horizontal Etched Grid Lines */}
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={`h${i}`}
            style={{
              position: 'absolute',
              top: 100 + i * 85,
              left: 0,
              width: '100%',
              height: 2,
              background: 'rgba(246,241,231,0.25)',
            }}
          />
        ))}
      </div>

      {/* Hero Monolith Readout (Bottom Third) */}
      <div
        style={{
          position: 'absolute',
          left: '64px',
          bottom: '160px',
          zIndex: 10,
          color: '#f6f1e7',
          fontFamily: 'Arial Black, Arial, sans-serif',
          fontSize: '145px',
          letterSpacing: '-8px',
          lineHeight: 0.85,
          textShadow: '0 8px 32px rgba(0,0,0,0.9)',
        }}
      >
        {metric}
        <div
          style={{
            fontSize: '20px',
            letterSpacing: '5px',
            fontFamily: 'JetBrains Mono, monospace',
            color: mintColor,
            marginTop: '22px',
            textTransform: 'uppercase',
            fontWeight: 800,
          }}
        >
          {headline}
        </div>
        {sublabel && (
          <div
            style={{
              fontSize: '14px',
              letterSpacing: '2px',
              fontFamily: 'JetBrains Mono, monospace',
              color: '#94a3b8',
              marginTop: '6px',
            }}
          >
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
};
