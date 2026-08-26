'use client';

import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export type TransitionPresentationType =
  | 'film-burn'
  | 'linear-blur'
  | 'cross-zoom'
  | 'push-cut'
  | 'dreamy-zoom'
  | 'clock-wipe'
  | 'fade'
  | 'slide'
  | 'wipe'
  | 'flip'
  | 'dissolve'
  | 'match-cut'
  | 'none';

export interface OfficialTransitionOverlayProps {
  type: TransitionPresentationType;
  durationFrames?: number;
  direction?: 'left' | 'right' | 'up' | 'down' | 'in' | 'out';
  color?: string;
  className?: string;
}

/**
 * High-performance Remotion transition overlay renderer supporting all official styles:
 * filmBurn, linearBlur, crossZoom, pushCut, dreamyZoom, clockWipe, fade, slide, wipe, flip, dissolve, matchCut.
 */
export const OfficialTransitionOverlay: React.FC<OfficialTransitionOverlayProps> = ({
  type = 'fade',
  durationFrames = 12,
  direction = 'right',
  color = '#ffd166',
  className = '',
}) => {
  const frame = useCurrentFrame();
  if (frame >= durationFrames || type === 'none') return null;

  const progress = frame / durationFrames;

  switch (type) {
    case 'film-burn': {
      // Warm volumetric film exposure flash
      const burnOpacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 0.95, 0.8, 0]);
      const burnScale = interpolate(progress, [0, 1], [1, 1.4]);
      return (
        <div
          className={`absolute inset-0 pointer-events-none z-50 mix-blend-screen overflow-hidden ${className}`}
          style={{ opacity: burnOpacity }}
        >
          <div
            className="w-full h-full"
            style={{
              background: `radial-gradient(ellipse at 60% 40%, rgba(255, 180, 50, 0.9) 0%, rgba(255, 60, 20, 0.7) 40%, rgba(200, 20, 10, 0.3) 70%, transparent 100%)`,
              transform: `scale(${burnScale})`,
              filter: 'blur(30px)',
            }}
          />
        </div>
      );
    }

    case 'linear-blur': {
      // Horizontal/Vertical optical streak blur
      const blurPx = interpolate(progress, [0, 0.5, 1], [0, 24, 0]);
      const opacity = interpolate(progress, [0, 0.5, 1], [0, 0.8, 0]);
      return (
        <div
          className={`absolute inset-0 pointer-events-none z-50 backdrop-blur-md bg-white/5 ${className}`}
          style={{
            backdropFilter: `blur(${blurPx}px)`,
            opacity,
          }}
        />
      );
    }

    case 'cross-zoom': {
      // Rapid optical snap zoom through the frame
      const zoomScale = interpolate(progress, [0, 0.5, 1], [1, 1.35, 1]);
      const flash = interpolate(progress, [0, 0.5, 1], [0, 0.6, 0]);
      return (
        <div
          className={`absolute inset-0 pointer-events-none z-50 bg-white ${className}`}
          style={{
            opacity: flash,
            transform: `scale(${zoomScale})`,
          }}
        />
      );
    }

    case 'push-cut': {
      // High-energy directional whip displacement
      const shiftPct = interpolate(progress, [0, 1], [0, 100]);
      return (
        <div
          className={`absolute inset-0 pointer-events-none z-50 bg-gradient-to-r from-black/80 via-white/20 to-transparent ${className}`}
          style={{
            transform: direction === 'left' ? `translateX(-${shiftPct}%)` : `translateX(${shiftPct}%)`,
            opacity: interpolate(progress, [0, 0.5, 1], [1, 0.8, 0]),
          }}
        />
      );
    }

    case 'dreamy-zoom': {
      // Soft radial bloom and light leak
      const bloom = interpolate(progress, [0, 0.4, 1], [0, 0.85, 0]);
      return (
        <div
          className={`absolute inset-0 pointer-events-none z-50 mix-blend-screen ${className}`}
          style={{
            opacity: bloom,
            background: `radial-gradient(circle at 50% 50%, rgba(200, 230, 255, 0.8) 0%, rgba(100, 180, 255, 0.4) 50%, transparent 80%)`,
          }}
        />
      );
    }

    case 'clock-wipe': {
      // Radial conical wipe sweep
      const angle = interpolate(progress, [0, 1], [0, 360]);
      return (
        <div
          className={`absolute inset-0 pointer-events-none z-50 ${className}`}
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(0,0,0,0.85) ${angle}deg, transparent ${angle + 10}deg)`,
            opacity: interpolate(progress, [0, 0.8, 1], [1, 0.8, 0]),
          }}
        />
      );
    }

    case 'wipe': {
      // Crisp directional scan line wipe
      const wipePos = interpolate(progress, [0, 1], [0, 100]);
      return (
        <div
          className={`absolute inset-0 pointer-events-none z-50 bg-gradient-to-r from-[#0b0d13] via-[#00c9a7]/40 to-transparent ${className}`}
          style={{
            clipPath: `inset(0 ${100 - wipePos}% 0 0)`,
            opacity: interpolate(progress, [0, 0.8, 1], [1, 0.9, 0]),
          }}
        />
      );
    }

    case 'slide': {
      // Clean graphic slide bar
      const slideX = interpolate(progress, [0, 1], [-100, 100]);
      return (
        <div
          className={`absolute inset-y-0 w-24 pointer-events-none z-50 bg-gradient-to-r from-transparent via-white/30 to-transparent ${className}`}
          style={{
            left: `${slideX + 50}%`,
            opacity: interpolate(progress, [0, 0.5, 1], [0, 1, 0]),
          }}
        />
      );
    }

    case 'flip': {
      // 3D perspective flip flash
      const flipRot = interpolate(progress, [0, 1], [0, 90]);
      return (
        <div
          className={`absolute inset-0 pointer-events-none z-50 bg-[#0b0d13] ${className}`}
          style={{
            transform: `perspective(800px) rotateY(${flipRot}deg)`,
            opacity: interpolate(progress, [0, 0.5, 1], [0, 0.9, 0]),
          }}
        />
      );
    }

    case 'fade':
    case 'dissolve':
    default: {
      // Standard crossfade dip
      const fadeOpacity = interpolate(progress, [0, 0.5, 1], [0, 0.7, 0]);
      return (
        <div
          className={`absolute inset-0 pointer-events-none z-50 bg-[#0b0d13] ${className}`}
          style={{ opacity: fadeOpacity }}
        />
      );
    }
  }
};
