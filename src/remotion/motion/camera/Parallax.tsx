'use client';

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import type { CameraBeatConfig } from '@/lib/video-spec/visual';

export interface ParallaxLayerProps {
  children: React.ReactNode;
  depth: 'background' | 'midground' | 'subject' | 'foreground' | 'typography' | number;
  camera?: CameraBeatConfig | { movement: string; intensity?: number };
  durationInFrames: number;
  motionSeed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const DEPTH_FACTORS: Record<string, number> = {
  background: 0.15,
  midground: 0.5,
  subject: 1.0,
  foreground: 1.35,
  typography: 1.5,
};

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  depth,
  camera = { movement: 'push', intensity: 0.2 },
  durationInFrames,
  motionSeed = 42,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames)));
  const intensity = camera.intensity ?? 0.2;
  const movement = camera.movement || 'push';

  const depthMultiplier = typeof depth === 'number' ? depth : (DEPTH_FACTORS[depth] ?? 1.0);

  let translateX = 0;
  let translateY = 0;
  let scale = 1.0;
  let blurPx = 0;

  switch (movement) {
    case 'push':
      scale = interpolate(progress, [0, 1], [1.0, 1.0 + 0.08 * depthMultiplier * intensity * 3]);
      break;

    case 'pull':
      scale = interpolate(progress, [0, 1], [1.0 + 0.08 * depthMultiplier * intensity * 3, 1.0]);
      break;

    case 'pan-left':
      translateX = interpolate(progress, [0, 1], [40 * depthMultiplier * intensity, -40 * depthMultiplier * intensity]);
      break;

    case 'pan-right':
      translateX = interpolate(progress, [0, 1], [-40 * depthMultiplier * intensity, 40 * depthMultiplier * intensity]);
      break;

    case 'pan-up':
      translateY = interpolate(progress, [0, 1], [40 * depthMultiplier * intensity, -40 * depthMultiplier * intensity]);
      break;

    case 'pan-down':
      translateY = interpolate(progress, [0, 1], [-40 * depthMultiplier * intensity, 40 * depthMultiplier * intensity]);
      break;

    case 'orbit': {
      const angle = progress * Math.PI * 0.5;
      translateX = Math.sin(angle) * 25 * depthMultiplier * intensity;
      translateY = Math.cos(angle) * 12 * depthMultiplier * intensity;
      break;
    }

    case 'parallax':
      translateX = interpolate(progress, [0, 1], [-20 * depthMultiplier * intensity, 20 * depthMultiplier * intensity]);
      translateY = interpolate(progress, [0, 1], [15 * depthMultiplier * intensity, -15 * depthMultiplier * intensity]);
      scale = interpolate(progress, [0, 1], [1.0, 1.0 + 0.04 * depthMultiplier]);
      break;

    case 'micro-drift': {
      const driftFreq = (frame + motionSeed * 7) * 0.08;
      translateX = Math.sin(driftFreq) * 6 * depthMultiplier * intensity;
      translateY = Math.cos(driftFreq * 0.7) * 6 * depthMultiplier * intensity;
      break;
    }

    case 'rack-focus':
      if (depth === 'background' || depthMultiplier < 0.4) {
        blurPx = interpolate(progress, [0, 0.5, 1], [4, 0, 0]);
      } else if (depth === 'foreground' || depthMultiplier > 1.2) {
        blurPx = interpolate(progress, [0, 0.5, 1], [0, 0, 4]);
      }
      break;

    default:
      break;
  }

  return (
    <AbsoluteFill
      className={`pointer-events-none ${className}`}
      style={{
        ...style,
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        transform: `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0)`,
        filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
        transformOrigin: 'center center',
        willChange: 'transform',
      }}
    >
      <AbsoluteFill className="pointer-events-auto">
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
