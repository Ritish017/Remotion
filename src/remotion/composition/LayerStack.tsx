'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ParallaxLayer } from '../motion/camera/Parallax';
import { CameraRig } from '../motion/camera/CameraRig';
import type { CameraBeatConfig } from '@/lib/video-spec/visual';
import type { BrandDNA } from '@/lib/video-spec/types';

export interface LayerStackProps {
  background?: React.ReactNode;
  midground?: React.ReactNode;
  subject?: React.ReactNode;
  foreground?: React.ReactNode;
  typography?: React.ReactNode;
  camera?: CameraBeatConfig | { movement: string; intensity?: number };
  durationInFrames: number;
  motionSeed?: number;
  brand?: BrandDNA;
  className?: string;
}

export const LayerStack: React.FC<LayerStackProps> = ({
  background,
  midground,
  subject,
  foreground,
  typography,
  camera = { movement: 'push', intensity: 0.2 },
  durationInFrames,
  motionSeed = 42,
  brand,
  className = '',
}) => {
  return (
    <AbsoluteFill className={className}>
      <CameraRig
        camera={camera}
        durationInFrames={durationInFrames}
        motionSeed={motionSeed}
        className="w-full h-full"
      >
        {/* 1. Background Layer (Depth 0.15) */}
        {background && (
          <ParallaxLayer
            depth="background"
            camera={camera}
            durationInFrames={durationInFrames}
            motionSeed={motionSeed}
          >
            {background}
          </ParallaxLayer>
        )}

        {/* 2. Midground Layer (Depth 0.5) */}
        {midground && (
          <ParallaxLayer
            depth="midground"
            camera={camera}
            durationInFrames={durationInFrames}
            motionSeed={motionSeed}
          >
            {midground}
          </ParallaxLayer>
        )}

        {/* 3. Subject Layer (Depth 1.0) */}
        {subject && (
          <ParallaxLayer
            depth="subject"
            camera={camera}
            durationInFrames={durationInFrames}
            motionSeed={motionSeed}
          >
            {subject}
          </ParallaxLayer>
        )}

        {/* 4. Foreground Layer (Depth 1.35) */}
        {foreground && (
          <ParallaxLayer
            depth="foreground"
            camera={camera}
            durationInFrames={durationInFrames}
            motionSeed={motionSeed}
          >
            {foreground}
          </ParallaxLayer>
        )}

        {/* 5. Typography Layer (Depth 1.5) */}
        {typography && (
          <ParallaxLayer
            depth="typography"
            camera={camera}
            durationInFrames={durationInFrames}
            motionSeed={motionSeed}
          >
            {typography}
          </ParallaxLayer>
        )}
      </CameraRig>
    </AbsoluteFill>
  );
};
