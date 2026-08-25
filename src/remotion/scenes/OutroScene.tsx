'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CameraRig } from '../motion/camera/CameraRig';
import { SpringEntrance } from '../motion/entrance/SpringEntrance';
import { PaperTexture } from '../motion/effects/PaperTexture';
import { GrainOverlay } from '../motion/effects/GrainOverlay';
import { Vignette } from '../motion/effects/Vignette';
import type { SceneData, BrandDNA } from '@/lib/video-spec/types';

interface OutroSceneProps {
  scene: SceneData;
  brand: BrandDNA;
}

export const OutroScene: React.FC<OutroSceneProps> = ({ scene, brand }) => {
  const { durationFrames } = scene;
  const ctaTitle = scene.props?.ctaTitle || 'Follow for Daily Deep Dives';
  const handle = scene.props?.handle || '@CatalystStudio';
  const subtext = scene.props?.subtext || 'Next episode drops tomorrow at 09:00 UTC';

  return (
    <AbsoluteFill className="bg-[#0b0d13] text-white overflow-hidden">
      <CameraRig camera={scene.camera || { type: 'push', intensity: 0.1 }} durationInFrames={durationFrames}>
        {/* Background */}
        <AbsoluteFill className="z-0">
          <div
            className="w-full h-full"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, ${brand.colors.primary}33 0%, ${brand.colors.background} 80%)`,
            }}
          />
        </AbsoluteFill>

        {/* Content */}
        <AbsoluteFill className="z-10 flex flex-col justify-center items-center p-12 text-center space-y-8">
          {/* Logo / Badge icon */}
          <SpringEntrance type="scale" delay={2} damping={10}>
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-black text-black shadow-2xl"
              style={{
                backgroundColor: brand.colors.accent,
                boxShadow: `0 0 40px ${brand.colors.accent}66`,
              }}
            >
              C
            </div>
          </SpringEntrance>

          <SpringEntrance type="slide-up" delay={6} className="space-y-3">
            <h2 className="text-4xl font-black tracking-tight text-white/95 max-w-md">
              {ctaTitle}
            </h2>
            <div className="inline-block px-5 py-2 rounded-full bg-white/10 border border-white/20 text-xl font-mono font-bold text-emerald-400">
              {handle}
            </div>
          </SpringEntrance>

          <SpringEntrance type="fade" delay={12}>
            <p className="text-sm font-medium text-white/50 tracking-wider uppercase font-mono">
              {subtext}
            </p>
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
