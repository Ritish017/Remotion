'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CameraRig } from '../motion/camera/CameraRig';
import { SpringEntrance } from '../motion/entrance/SpringEntrance';
import { GeoMapVisual, type MapMarker } from '../components/maps/GeoMapVisual';
import { PaperTexture } from '../motion/effects/PaperTexture';
import { GrainOverlay } from '../motion/effects/GrainOverlay';
import { Vignette } from '../motion/effects/Vignette';
import type { SceneData, BrandDNA } from '@/lib/video-spec/types';

interface MapSceneProps {
  scene: SceneData;
  brand: BrandDNA;
}

export const MapScene: React.FC<MapSceneProps> = ({ scene, brand }) => {
  const { durationFrames } = scene;
  const headline = scene.props?.headline || 'Global Infrastructure';
  const regionName = scene.props?.regionName || 'PACIFIC TRANSIT CORRIDOR';
  const markers: MapMarker[] = scene.props?.markers || [
    { id: '1', label: 'San Francisco', x: 28, y: 44, accentColor: brand.colors.secondary, info: 'Primary Model Training' },
    { id: '2', label: 'Tokyo', x: 78, y: 48, accentColor: brand.colors.accent, info: 'Distributed Inference Node' },
    { id: '3', label: 'Frankfurt', x: 48, y: 35, accentColor: brand.colors.primary, info: 'EU Cloud Cluster' },
  ];

  return (
    <AbsoluteFill className="bg-[#0b0d13] text-white overflow-hidden">
      <CameraRig camera={scene.camera || { type: 'zoom-region', intensity: 0.2, focalPoint: { x: 50, y: 45 } }} durationInFrames={durationFrames}>
        {/* Background */}
        <AbsoluteFill className="z-0">
          <div
            className="w-full h-full"
            style={{
              background: `radial-gradient(circle at 50% 50%, #151c2e 0%, ${brand.colors.background} 90%)`,
            }}
          />
        </AbsoluteFill>

        {/* Content */}
        <AbsoluteFill className="z-10 flex flex-col justify-center items-center p-8 space-y-6">
          <SpringEntrance type="slide-down" delay={2} className="text-center space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase">
              GEOGRAPHIC FOOTPRINT
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white/95">
              {headline}
            </h2>
          </SpringEntrance>

          <SpringEntrance type="scale" delay={6} damping={14} className="w-full flex justify-center">
            <GeoMapVisual
              markers={markers}
              regionName={regionName}
              delay={8}
            />
          </SpringEntrance>
        </AbsoluteFill>
      </CameraRig>

      {/* Textures */}
      {brand.textures?.paperTexture && <PaperTexture opacity={0.08} />}
      <GrainOverlay intensity={brand.textures?.grainIntensity ?? 0.08} />
      {brand.textures?.vignette && <Vignette opacity={0.4} />}
    </AbsoluteFill>
  );
};
