'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ParallaxLayer } from '../motion/camera/Parallax';
import { CameraRig } from '../motion/camera/CameraRig';
import type { CameraBeatConfig, SpatialTransform, VisualLayerSpec } from '@/lib/video-spec/visual';
import type { BrandDNA } from '@/lib/video-spec/types';

export interface LayerStackProps {
  // 7 Spatial Depth Planes
  background?: React.ReactNode;
  backgroundMid?: React.ReactNode;
  midground?: React.ReactNode;
  subject?: React.ReactNode;
  foreground?: React.ReactNode;
  typography?: React.ReactNode;
  editorialMarks?: React.ReactNode;

  // Optional layer transforms
  layerTransforms?: Partial<Record<string, Partial<SpatialTransform>>>;
  layerSpecs?: VisualLayerSpec[];

  camera?: CameraBeatConfig | { movement: string; intensity?: number };
  durationInFrames: number;
  motionSeed?: number;
  brand?: BrandDNA;
  className?: string;
}

export const LayerStack: React.FC<LayerStackProps> = ({
  background,
  backgroundMid,
  midground,
  subject,
  foreground,
  typography,
  editorialMarks,
  layerTransforms = {},
  layerSpecs,
  camera = { movement: 'push', intensity: 0.22 },
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
        {/* Layer 0: Background Environment (Depth 0.15) */}
        {background && (
          <ParallaxLayer
            depth="background"
            camera={camera}
            transform={layerTransforms.background}
            durationInFrames={durationInFrames}
            motionSeed={motionSeed}
          >
            {background}
          </ParallaxLayer>
        )}

        {/* Layer 1: Atmospheric Texture & Light Wash (Depth 0.35) */}
        {backgroundMid && (
          <ParallaxLayer
            depth="backgroundMid"
            camera={camera}
            transform={layerTransforms.backgroundMid}
            durationInFrames={durationInFrames}
            motionSeed={motionSeed + 1}
          >
            {backgroundMid}
          </ParallaxLayer>
        )}

        {/* Layer 2: Midground Elements / Grids / Secondary Diagrams (Depth 0.60) */}
        {midground && (
          <ParallaxLayer
            depth="midground"
            camera={camera}
            transform={layerTransforms.midground}
            durationInFrames={durationInFrames}
            motionSeed={motionSeed + 2}
          >
            {midground}
          </ParallaxLayer>
        )}

        {/* Layer 3: Primary Anchor Subject / Monolith / 3D Die (Depth 1.00) */}
        {subject && (
          <ParallaxLayer
            depth="subject"
            camera={camera}
            transform={layerTransforms.subject}
            durationInFrames={durationInFrames}
            motionSeed={motionSeed + 3}
          >
            {subject}
          </ParallaxLayer>
        )}

        {/* Layer 4: Foreground Overlays / Laser Scans / Measurement Callouts (Depth 1.35) */}
        {foreground && (
          <ParallaxLayer
            depth="foreground"
            camera={camera}
            transform={layerTransforms.foreground}
            durationInFrames={durationInFrames}
            motionSeed={motionSeed + 4}
          >
            {foreground}
          </ParallaxLayer>
        )}

        {/* Layer 5: Typography & Display Headlines (Depth 1.50) */}
        {typography && (
          <ParallaxLayer
            depth="typography"
            camera={camera}
            transform={layerTransforms.typography}
            durationInFrames={durationInFrames}
            motionSeed={motionSeed + 5}
          >
            {typography}
          </ParallaxLayer>
        )}

        {/* Layer 6: Editorial Annotations & Declassified Stamps (Depth 1.65) */}
        {editorialMarks && (
          <ParallaxLayer
            depth="editorialMarks"
            camera={camera}
            transform={layerTransforms.editorialMarks}
            durationInFrames={durationInFrames}
            motionSeed={motionSeed + 6}
          >
            {editorialMarks}
          </ParallaxLayer>
        )}
      </CameraRig>
    </AbsoluteFill>
  );
};
