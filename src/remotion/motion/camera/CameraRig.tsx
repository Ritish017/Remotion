'use client';

import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { CameraConfig } from '@/lib/video-spec/types';

interface CameraRigProps {
  children: React.ReactNode;
  camera?: CameraConfig;
  durationInFrames: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  children,
  camera = { type: 'push', intensity: 0.15 },
  durationInFrames,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const intensity = camera.intensity ?? 0.15;
  const progress = Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames)));

  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;
  let rotate = 0;

  switch (camera.type) {
    case 'push':
      scale = interpolate(progress, [0, 1], [1.0, 1.0 + 0.12 * intensity * 5]);
      break;
    case 'pull':
      scale = interpolate(progress, [0, 1], [1.0 + 0.12 * intensity * 5, 1.0]);
      break;
    case 'pan-left':
      scale = 1.04;
      translateX = interpolate(progress, [0, 1], [30 * intensity * 5, -30 * intensity * 5]);
      break;
    case 'pan-right':
      scale = 1.04;
      translateX = interpolate(progress, [0, 1], [-30 * intensity * 5, 30 * intensity * 5]);
      break;
    case 'zoom-region': {
      const focalX = camera.focalPoint?.x ?? 50;
      const focalY = camera.focalPoint?.y ?? 50;
      scale = interpolate(progress, [0, 1], [1.0, 1.25]);
      translateX = interpolate(progress, [0, 1], [0, (50 - focalX) * 4]);
      translateY = interpolate(progress, [0, 1], [0, (50 - focalY) * 4]);
      break;
    }
    case 'subtle-shake': {
      scale = 1.03;
      const shakeFreq = frame * 0.15;
      translateX = Math.sin(shakeFreq) * 3 * intensity;
      translateY = Math.cos(shakeFreq * 0.8) * 3 * intensity;
      rotate = Math.sin(shakeFreq * 0.5) * 0.2 * intensity;
      break;
    }
    case 'parallax':
      scale = interpolate(progress, [0, 1], [1.02, 1.08]);
      translateY = interpolate(progress, [0, 1], [10, -10]);
      break;
    case 'static':
    default:
      scale = 1.0;
      break;
  }

  return (
    <div
      className={`w-full h-full overflow-hidden ${className}`}
      style={{
        ...style,
        transform: `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}deg)`,
        transformOrigin: 'center center',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
};
