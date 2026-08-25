'use client';

import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { EntranceType } from '@/lib/video-spec/types';

interface SpringEntranceProps {
  children: React.ReactNode;
  type?: EntranceType;
  delay?: number; // in frames
  durationInFrames?: number;
  damping?: number;
  stiffness?: number;
  mass?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const SpringEntrance: React.FC<SpringEntranceProps> = ({
  children,
  type = 'spring',
  delay = 0,
  damping = 12,
  stiffness = 100,
  mass = 0.5,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (type === 'none') {
    return <div className={className} style={style}>{children}</div>;
  }

  const spr = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping, stiffness, mass },
  });

  let transform = '';
  let opacity = spr;

  switch (type) {
    case 'spring':
    case 'scale':
      transform = `scale(${0.8 + 0.2 * spr})`;
      break;
    case 'slide-up':
      transform = `translateY(${(1 - spr) * 60}px)`;
      break;
    case 'slide-down':
      transform = `translateY(${(1 - spr) * -60}px)`;
      break;
    case 'slide-left':
      transform = `translateX(${(1 - spr) * 80}px)`;
      break;
    case 'slide-right':
      transform = `translateX(${(1 - spr) * -80}px)`;
      break;
    case 'fade':
      transform = 'none';
      break;
    case 'clip-reveal':
    case 'mask-reveal':
      return (
        <div
          className={className}
          style={{
            ...style,
            clipPath: `inset(${(1 - spr) * 100}% 0 0 0)`,
            opacity: Math.min(1, spr * 1.5),
          }}
        >
          {children}
        </div>
      );
    default:
      transform = `scale(${0.9 + 0.1 * spr})`;
  }

  return (
    <div
      className={className}
      style={{
        ...style,
        transform,
        opacity,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
};
