'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CameraRig } from '../motion/camera/CameraRig';
import { SpringEntrance } from '../motion/entrance/SpringEntrance';
import { PaperTexture } from '../motion/effects/PaperTexture';
import { GrainOverlay } from '../motion/effects/GrainOverlay';
import { Vignette } from '../motion/effects/Vignette';
import type { SceneData, BrandDNA } from '@/lib/video-spec/types';

interface ComparisonSceneProps {
  scene: SceneData;
  brand: BrandDNA;
}

export const ComparisonScene: React.FC<ComparisonSceneProps> = ({ scene, brand }) => {
  const { durationFrames } = scene;
  const leftTitle = scene.props?.leftTitle || 'Legacy Model';
  const leftPoints = scene.props?.leftPoints || ['Slow manual editing', 'High render cost', 'Black box generation'];
  const rightTitle = scene.props?.rightTitle || 'Catalyst Engine';
  const rightPoints = scene.props?.rightPoints || ['Instant React compositing', 'Deterministic frame timing', 'Full AI agent control'];

  return (
    <AbsoluteFill className="bg-[#0b0d13] text-white overflow-hidden">
      <CameraRig camera={scene.camera || { type: 'push', intensity: 0.12 }} durationInFrames={durationFrames}>
        <AbsoluteFill className="z-0">
          <div className="w-full h-full" style={{ background: `linear-gradient(to right, #151010 0%, #0d1518 100%)` }} />
        </AbsoluteFill>

        <AbsoluteFill className="z-10 flex flex-col justify-center p-8 space-y-6">
          <SpringEntrance type="slide-down" delay={2} className="text-center">
            <h2 className="text-3xl font-black text-white/95 uppercase">Head-to-Head Comparison</h2>
          </SpringEntrance>

          <div className="grid grid-cols-2 gap-4">
            {/* Left Card */}
            <SpringEntrance type="slide-right" delay={5}>
              <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-3">
                <div className="text-red-400 font-bold text-lg">{leftTitle}</div>
                <div className="space-y-2 text-xs text-white/70">
                  {leftPoints.map((pt: string) => (
                    <div key={pt} className="flex items-center gap-1.5">
                      <span className="text-red-400 font-bold">✕</span> {pt}
                    </div>
                  ))}
                </div>
              </div>
            </SpringEntrance>

            {/* Right Card */}
            <SpringEntrance type="slide-left" delay={7}>
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <div className="text-emerald-400 font-bold text-lg">{rightTitle}</div>
                <div className="space-y-2 text-xs text-white/90">
                  {rightPoints.map((pt: string) => (
                    <div key={pt} className="flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">✓</span> {pt}
                    </div>
                  ))}
                </div>
              </div>
            </SpringEntrance>
          </div>
        </AbsoluteFill>
      </CameraRig>

      {brand.textures?.paperTexture && <PaperTexture opacity={0.08} />}
      <GrainOverlay intensity={brand.textures?.grainIntensity ?? 0.08} />
      {brand.textures?.vignette && <Vignette opacity={0.4} />}
    </AbsoluteFill>
  );
};
