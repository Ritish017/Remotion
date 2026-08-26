'use client';

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import type { CameraConfig } from '@/lib/video-spec/types';
import type { CameraBeatConfig } from '@/lib/video-spec/visual';

interface CameraRigProps {
  children: React.ReactNode;
  camera?: CameraConfig | CameraBeatConfig | { movement?: string; type?: string; intensity?: number; focalPoint?: { x: number; y: number } };
  durationInFrames: number;
  motionSeed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  children,
  camera = { type: 'push', intensity: 0.15 },
  durationInFrames,
  motionSeed = 42,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const intensity = camera.intensity ?? 0.15;
  const progress = Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames)));

  const camType = (camera && 'movement' in camera && typeof camera.movement === 'string')
    ? camera.movement
    : (camera && 'type' in camera && typeof camera.type === 'string')
    ? camera.type
    : 'push';

  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;
  let rotate = 0;
  let filter = '';

  switch (camType) {
    case 'push':
      scale = interpolate(progress, [0, 1], [1.0, 1.0 + 0.14 * intensity * 5]);
      break;

    case 'pull':
      scale = interpolate(progress, [0, 1], [1.0 + 0.14 * intensity * 5, 1.0]);
      break;

    case 'pan-left':
      scale = 1.04;
      translateX = interpolate(progress, [0, 1], [40 * intensity * 5, -40 * intensity * 5]);
      break;

    case 'pan-right':
      scale = 1.04;
      translateX = interpolate(progress, [0, 1], [-40 * intensity * 5, 40 * intensity * 5]);
      break;

    case 'pan-up':
      scale = 1.04;
      translateY = interpolate(progress, [0, 1], [40 * intensity * 5, -40 * intensity * 5]);
      break;

    case 'pan-down':
      scale = 1.04;
      translateY = interpolate(progress, [0, 1], [-40 * intensity * 5, 40 * intensity * 5]);
      break;

    case 'zoom-region': {
      const focalX = camera.focalPoint?.x ?? 50;
      const focalY = camera.focalPoint?.y ?? 50;
      scale = interpolate(progress, [0, 1], [1.0, 1.25 + 0.1 * intensity]);
      translateX = interpolate(progress, [0, 1], [0, (50 - focalX) * 4]);
      translateY = interpolate(progress, [0, 1], [0, (50 - focalY) * 4]);
      break;
    }

    case 'orbit': {
      scale = 1.05;
      const angle = progress * Math.PI * 0.5;
      translateX = Math.sin(angle) * 30 * intensity;
      translateY = Math.cos(angle) * 15 * intensity;
      rotate = Math.sin(angle) * 0.8 * intensity;
      break;
    }

    case 'parallax':
      scale = interpolate(progress, [0, 1], [1.02, 1.08]);
      translateX = interpolate(progress, [0, 1], [-15 * intensity, 15 * intensity]);
      translateY = interpolate(progress, [0, 1], [10 * intensity, -10 * intensity]);
      break;

    case 'rack-focus':
      scale = interpolate(progress, [0, 1], [1.0, 1.05]);
      if (progress < 0.3) {
        const b = interpolate(progress, [0, 0.3], [3 * intensity, 0]);
        filter = `blur(${b}px)`;
      }
      break;

    case 'handheld': {
      scale = 1.04;
      const t = (frame + motionSeed * 13) * 0.1;
      translateX = (Math.sin(t) + Math.sin(t * 1.7)) * 4 * intensity;
      translateY = (Math.cos(t * 0.9) + Math.cos(t * 1.4)) * 3 * intensity;
      rotate = Math.sin(t * 0.6) * 0.4 * intensity;
      break;
    }

    case 'micro-drift': {
      scale = interpolate(progress, [0, 1], [1.0, 1.03]);
      const t = (frame + motionSeed * 7) * 0.05;
      translateX = Math.sin(t) * 5 * intensity;
      translateY = Math.cos(t * 0.8) * 4 * intensity;
      break;
    }

    case 'whip-pan': {
      scale = 1.08;
      if (progress < 0.25) {
        translateX = interpolate(progress, [0, 0.25], [-120 * intensity, 0]);
      } else if (progress > 0.85) {
        translateX = interpolate(progress, [0.85, 1], [0, 120 * intensity]);
      }
      break;
    }

    case 'snap-zoom': {
      if (progress < 0.2) {
        scale = interpolate(progress, [0, 0.2], [1.0, 1.15 + 0.1 * intensity]);
      } else {
        scale = interpolate(progress, [0.2, 1], [1.15 + 0.1 * intensity, 1.18 + 0.1 * intensity]);
      }
      break;
    }

    case 'static':
    default:
      scale = 1.0;
      break;
  }

  return (
    <AbsoluteFill
      className={`overflow-hidden ${className}`}
      style={{
        ...style,
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        transform: `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}deg)`,
        filter: filter || undefined,
        transformOrigin: 'center center',
        willChange: 'transform',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
