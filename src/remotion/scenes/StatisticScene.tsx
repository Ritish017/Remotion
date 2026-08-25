'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CameraRig } from '../motion/camera/CameraRig';
import { SpringEntrance } from '../motion/entrance/SpringEntrance';
import { CounterText } from '../motion/typography/CounterText';
import { KineticText } from '../motion/typography/KineticText';
import { PaperTexture } from '../motion/effects/PaperTexture';
import { GrainOverlay } from '../motion/effects/GrainOverlay';
import { Vignette } from '../motion/effects/Vignette';
import type { SceneData, BrandDNA } from '@/lib/video-spec/types';

interface StatisticSceneProps {
  scene: SceneData;
  brand: BrandDNA;
}

export const StatisticScene: React.FC<StatisticSceneProps> = ({ scene, brand }) => {
  const { durationFrames } = scene;
  const targetValue = scene.props?.targetValue ?? 100;
  const prefix = scene.props?.prefix || '';
  const suffix = scene.props?.suffix || 'X';
  const tag = scene.props?.tag || 'PERFORMANCE MULTIPLIER';
  const headline = scene.props?.headline || 'Faster Turnaround';
  const subtext = scene.props?.subtext || 'From concept to finished 4K render in under sixty seconds.';

  return (
    <AbsoluteFill className="bg-[#0b0d13] text-white overflow-hidden">
      <CameraRig camera={scene.camera || { type: 'push', intensity: 0.2 }} durationInFrames={durationFrames}>
        {/* Background glow */}
        <AbsoluteFill className="z-0">
          <div
            className="w-full h-full"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${brand.colors.accent}2a 0%, ${brand.colors.background} 75%)`,
            }}
          />
        </AbsoluteFill>

        {/* Big Number & Callouts */}
        <AbsoluteFill className="z-10 flex flex-col justify-center items-center p-12 text-center space-y-6">
          <SpringEntrance type="slide-down" delay={2}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-400">
                {tag}
              </span>
            </div>
          </SpringEntrance>

          <SpringEntrance type="scale" delay={5} damping={10} stiffness={90}>
            <CounterText
              targetValue={targetValue}
              prefix={prefix}
              suffix={suffix}
              delay={6}
              durationFrames={40}
              fontSize="8.5rem"
              color={brand.colors.accent}
              className="tracking-tighter font-black drop-shadow-[0_0_50px_rgba(255,209,102,0.35)]"
            />
          </SpringEntrance>

          <div className="space-y-2 max-w-lg">
            <h3 className="text-4xl font-extrabold tracking-tight text-white/95 uppercase">
              {headline}
            </h3>
            <SpringEntrance type="slide-up" delay={14}>
              <p className="text-lg text-white/70 font-medium">
                {subtext}
              </p>
            </SpringEntrance>
          </div>
        </AbsoluteFill>
      </CameraRig>

      {/* Textures */}
      {brand.textures?.paperTexture && <PaperTexture opacity={0.08} />}
      <GrainOverlay intensity={brand.textures?.grainIntensity ?? 0.08} />
      {brand.textures?.vignette && <Vignette opacity={0.4} />}
    </AbsoluteFill>
  );
};
