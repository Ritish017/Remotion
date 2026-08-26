'use client';

import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export interface CorridorFlightArcsProps {
  amberColor?: string;
  mintColor?: string;
  durationInFrames: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CorridorFlightArcs: React.FC<CorridorFlightArcsProps> = ({
  amberColor = '#ffc857',
  mintColor = '#64e2c5',
  durationInFrames,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const dashOffset = 2100 - frame * 14;

  const nodes = [
    { x: 140, y: 1260, delay: 10 },
    { x: 840, y: 650, delay: 30 },
    { x: 260, y: 1480, delay: 50 },
    { x: 960, y: 940, delay: 70 },
  ];

  return (
    <div
      className={`pointer-events-none absolute inset-0 w-full h-full overflow-hidden ${className}`}
      style={{ ...style }}
    >
      <svg
        width="1080"
        height="1920"
        viewBox="0 0 1080 1920"
        style={{ position: 'absolute', inset: 0, zIndex: 6 }}
      >
        {/* Ballistic flight paths with stroke-dashoffset */}
        <path
          d="M-20 1360 C250 940, 530 1040, 840 650"
          fill="none"
          stroke={amberColor}
          strokeWidth="12"
          strokeDasharray="35 19"
          strokeDashoffset={dashOffset}
          style={{ filter: `drop-shadow(0 0 12px ${amberColor}88)` }}
        />
        <path
          d="M110 1540 C430 1110, 710 1250, 1130 870"
          fill="none"
          stroke={mintColor}
          strokeWidth="9"
          strokeDasharray="17 23"
          strokeDashoffset={-dashOffset}
          style={{ filter: `drop-shadow(0 0 12px ${mintColor}88)` }}
        />

        {/* Pulsing Planetary Node Beacons */}
        {nodes.map((node, i) => {
          const pulse = Math.sin((frame + i * 8) / 8);
          const r = 54 + pulse * 10;
          const opacity = interpolate(frame, [node.delay, node.delay + 20], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <g key={i} opacity={opacity}>
              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill="none"
                stroke={i % 2 ? mintColor : amberColor}
                strokeWidth="3"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r="16"
                fill="#f6f1e7"
                style={{ filter: `drop-shadow(0 0 8px ${amberColor})` }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
