'use client';

import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import type { CameraBeatConfig, SpatialTransform, VisualLayerRole } from '@/lib/video-spec/visual';

export interface ParallaxLayerProps {
  children: React.ReactNode;
  depth: VisualLayerRole | 'background' | 'backgroundMid' | 'midground' | 'subject' | 'foreground' | 'typography' | 'editorialMarks' | number;
  camera?: CameraBeatConfig | { movement: string; intensity?: number };
  transform?: Partial<SpatialTransform>;
  durationInFrames: number;
  motionSeed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const DEPTH_FACTORS: Record<string, number> = {
  background: 0.15,
  backgroundMid: 0.35,
  midground: 0.60,
  subject: 1.0,
  foreground: 1.35,
  typography: 1.5,
  editorialMarks: 1.65,
};

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  depth,
  camera = { movement: 'push', intensity: 0.22 },
  transform = {},
  durationInFrames,
  motionSeed = 42,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames)));
  const intensity = camera.intensity ?? 0.22;
  const movement = camera.movement || 'push';

  const depthMultiplier = typeof depth === 'number' ? depth : (DEPTH_FACTORS[depth] ?? 1.0);

  const baseScale = transform.scale ?? 1.0;
  const baseTranslateX = transform.x ?? 0;
  const baseTranslateY = transform.y ?? 0;
  const baseRotation = transform.rotation ?? 0;
  const baseOpacity = transform.opacity ?? 1.0;
  const baseBlur = transform.blurPx ?? 0;

  let deltaTranslateX = 0;
  let deltaTranslateY = 0;
  let dynamicScale = 1.0;
  let blurPx = baseBlur;

  switch (movement) {
    case 'push':
      dynamicScale = interpolate(progress, [0, 1], [1.0, 1.0 + 0.10 * depthMultiplier * intensity * 3]);
      break;

    case 'pull':
      dynamicScale = interpolate(progress, [0, 1], [1.0 + 0.10 * depthMultiplier * intensity * 3, 1.0]);
      break;

    case 'pan-left':
      deltaTranslateX = interpolate(progress, [0, 1], [50 * depthMultiplier * intensity, -50 * depthMultiplier * intensity]);
      break;

    case 'pan-right':
      deltaTranslateX = interpolate(progress, [0, 1], [-50 * depthMultiplier * intensity, 50 * depthMultiplier * intensity]);
      break;

    case 'pan-up':
      deltaTranslateY = interpolate(progress, [0, 1], [50 * depthMultiplier * intensity, -50 * depthMultiplier * intensity]);
      break;

    case 'pan-down':
      deltaTranslateY = interpolate(progress, [0, 1], [-50 * depthMultiplier * intensity, 50 * depthMultiplier * intensity]);
      break;

    case 'orbit': {
      const angle = progress * Math.PI * 0.5;
      deltaTranslateX = Math.sin(angle) * 30 * depthMultiplier * intensity;
      deltaTranslateY = Math.cos(angle) * 16 * depthMultiplier * intensity;
      break;
    }

    case 'parallax':
      deltaTranslateX = interpolate(progress, [0, 1], [-25 * depthMultiplier * intensity, 25 * depthMultiplier * intensity]);
      deltaTranslateY = interpolate(progress, [0, 1], [20 * depthMultiplier * intensity, -20 * depthMultiplier * intensity]);
      dynamicScale = interpolate(progress, [0, 1], [1.0, 1.0 + 0.05 * depthMultiplier]);
      break;

    case 'micro-drift': {
      const driftFreq = (frame + motionSeed * 7) * 0.08;
      deltaTranslateX = Math.sin(driftFreq) * 8 * depthMultiplier * intensity;
      deltaTranslateY = Math.cos(driftFreq * 0.7) * 8 * depthMultiplier * intensity;
      break;
    }

    case 'rack-focus':
      if (depth === 'background' || depthMultiplier < 0.4) {
        blurPx = interpolate(progress, [0, 0.5, 1], [6, 0, 0]);
      } else if (depth === 'foreground' || depthMultiplier > 1.2) {
        blurPx = interpolate(progress, [0, 0.5, 1], [0, 0, 6]);
      }
      break;

    default:
      break;
  }

  const finalScale = baseScale * dynamicScale;
  const finalX = baseTranslateX + deltaTranslateX;
  const finalY = baseTranslateY + deltaTranslateY;

  return (
    <AbsoluteFill
      className={`pointer-events-none ${className}`}
      style={{
        ...style,
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        transform: `scale(${finalScale}) translate3d(${finalX}px, ${finalY}px, 0) rotate(${baseRotation}deg)`,
        opacity: baseOpacity,
        filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
        transformOrigin: 'center center',
        willChange: 'transform, opacity',
      }}
    >
      <AbsoluteFill className="pointer-events-auto">
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
