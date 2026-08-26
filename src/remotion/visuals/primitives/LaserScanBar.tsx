'use client';

import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export interface LaserScanBarProps {
  laserColor?: string;
  glowColor?: string;
  ringCount?: number;
  durationInFrames: number;
  direction?: 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
}

export const LaserScanBar: React.FC<LaserScanBarProps> = ({
  laserColor = '#64e2c5',
  glowColor = 'rgba(100, 226, 197, 0.45)',
  ringCount = 3,
  durationInFrames,
  direction = 'horizontal',
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const scanPos = interpolate(frame, [0, durationInFrames], [-80, 1160]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 w-full h-full overflow-hidden ${className}`}
      style={{ ...style }}
    >
      {/* Laser Scanning Line */}
      {direction === 'horizontal' ? (
        <div
          style={{
            position: 'absolute',
            left: `${scanPos}px`,
            top: '180px',
            width: '8px',
            height: '1440px',
            background: laserColor,
            boxShadow: `0 0 46px ${laserColor}, 0 0 160px ${laserColor}`,
            opacity: 0.92,
            zIndex: 15,
            willChange: 'left',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            top: `${scanPos}px`,
            left: '40px',
            width: '1000px',
            height: '8px',
            background: laserColor,
            boxShadow: `0 0 46px ${laserColor}, 0 0 160px ${laserColor}`,
            opacity: 0.92,
            zIndex: 15,
            willChange: 'top',
          }}
        />
      )}

      {/* Pulsing Concentric Aperture Rings */}
      {Array.from({ length: ringCount }).map((_, i) => {
        const ringSize = 720 + i * 180;
        const ringScale = 0.65 + (frame / Math.max(1, durationInFrames)) * 0.45 + i * 0.06;
        const ringOpacity = Math.max(0, 0.65 - i * 0.15);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${ringSize}px`,
              height: `${ringSize}px`,
              left: `${155 - i * 90}px`,
              top: `${560 - i * 90}px`,
              border: `2px solid ${i === 0 ? laserColor : glowColor}`,
              borderRadius: '50%',
              transform: `scale(${ringScale})`,
              opacity: ringOpacity,
              zIndex: 10,
              willChange: 'transform',
            }}
          />
        );
      })}
    </div>
  );
};
