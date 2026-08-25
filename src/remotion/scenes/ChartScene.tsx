'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CameraRig } from '../motion/camera/CameraRig';
import { SpringEntrance } from '../motion/entrance/SpringEntrance';
import { AnimatedBarChart, type ChartDataPoint } from '../components/charts/AnimatedBarChart';
import { PaperTexture } from '../motion/effects/PaperTexture';
import { GrainOverlay } from '../motion/effects/GrainOverlay';
import { Vignette } from '../motion/effects/Vignette';
import type { SceneData, BrandDNA } from '@/lib/video-spec/types';

interface ChartSceneProps {
  scene: SceneData;
  brand: BrandDNA;
}

export const ChartScene: React.FC<ChartSceneProps> = ({ scene, brand }) => {
  const { durationFrames } = scene;
  const chartTitle = scene.props?.chartTitle || 'ADOPTION VELOCITY (2024–2026)';
  const unit = scene.props?.unit || '%';
  const headline = scene.props?.headline || 'The Exponential Surge';
  const description = scene.props?.description || 'Growth rates across automated production workflows have tripled year-over-year.';

  const data: ChartDataPoint[] = scene.props?.data || [
    { label: 'Traditional Workflow', value: 24, color: '#94a3b8' },
    { label: 'Hybrid Tooling', value: 58, color: brand.colors.secondary },
    { label: 'Autonomous AI Engine', value: 92, color: brand.colors.accent },
  ];

  return (
    <AbsoluteFill className="bg-[#0b0d13] text-white overflow-hidden">
      <CameraRig camera={scene.camera || { type: 'push', intensity: 0.14 }} durationInFrames={durationFrames}>
        {/* Layer 1: Background */}
        <AbsoluteFill className="z-0">
          <div
            className="w-full h-full"
            style={{
              background: `radial-gradient(ellipse at 50% 60%, ${brand.colors.secondary}22 0%, ${brand.colors.background} 75%)`,
            }}
          />
        </AbsoluteFill>

        {/* Layer 2 & 3: Content */}
        <AbsoluteFill className="z-10 flex flex-col justify-center items-center p-10 space-y-8">
          <SpringEntrance type="slide-down" delay={2} className="text-center space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-widest uppercase">
              DATA INVESTIGATION
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white/95">
              {headline}
            </h2>
            <p className="text-sm text-white/60 max-w-md mx-auto">
              {description}
            </p>
          </SpringEntrance>

          <SpringEntrance type="scale" delay={6} damping={12} className="w-full flex justify-center">
            <AnimatedBarChart
              data={data}
              title={chartTitle}
              unit={unit}
              accentColor={brand.colors.accent}
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
