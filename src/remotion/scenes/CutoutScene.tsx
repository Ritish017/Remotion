'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CameraRig } from '../motion/camera/CameraRig';
import { SpringEntrance } from '../motion/entrance/SpringEntrance';
import { HalftoneCutout } from '../motion/effects/HalftoneCutout';
import { PaperTexture } from '../motion/effects/PaperTexture';
import { GrainOverlay } from '../motion/effects/GrainOverlay';
import { Vignette } from '../motion/effects/Vignette';
import type { SceneData, BrandDNA } from '@/lib/video-spec/types';

interface CutoutSceneProps {
  scene: SceneData;
  brand: BrandDNA;
}

export const CutoutScene: React.FC<CutoutSceneProps> = ({ scene, brand }) => {
  const { durationFrames } = scene;
  const headline = scene.props?.headline || 'The Neural Architecture';
  const cutoutUrl = scene.props?.cutoutUrl || scene.midground?.content?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
  const callouts = scene.props?.callouts || [
    { title: 'Deterministic Timeline', desc: 'Frame-accurate React orchestration' },
    { title: 'Dynamic Props', desc: 'Live AI parameters & brand theming' },
    { title: 'Zero Artifacts', desc: 'Lossless vector typography & charts' },
  ];

  return (
    <AbsoluteFill className="bg-[#0b0d13] text-white overflow-hidden">
      <CameraRig camera={scene.camera || { type: 'parallax', intensity: 0.16 }} durationInFrames={durationFrames}>
        {/* Layer 1: Background */}
        <AbsoluteFill className="z-0">
          <div
            className="w-full h-full"
            style={{
              background: `radial-gradient(ellipse at 30% 50%, ${brand.colors.primary}25 0%, ${brand.colors.background} 85%)`,
            }}
          />
        </AbsoluteFill>

        {/* Layer 2: Midground Cutout */}
        <AbsoluteFill className="z-10 flex items-center justify-start pl-8 pt-32">
          <SpringEntrance type="slide-left" delay={4} damping={12}>
            <div className="w-[360px] h-[520px]">
              <HalftoneCutout
                src={cutoutUrl}
                accentGlow={brand.colors.primary}
                alt="Explainer Subject"
              />
            </div>
          </SpringEntrance>
        </AbsoluteFill>

        {/* Layer 3: Foreground Cards */}
        <AbsoluteFill className="z-20 flex flex-col justify-center items-end pr-10 space-y-4 pt-16">
          <SpringEntrance type="slide-down" delay={2} className="self-end text-right mb-2">
            <h3 className="text-3xl font-extrabold tracking-tight text-white/95">
              {headline}
            </h3>
          </SpringEntrance>

          {callouts.map((item: any, idx: number) => (
            <SpringEntrance
              key={item.title}
              type="slide-right"
              delay={8 + idx * 5}
              className="w-72 p-4 rounded-xl bg-black/60 border border-white/15 backdrop-blur-md shadow-xl"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: brand.colors.accent }} />
                <span className="font-bold text-sm text-white/90">{item.title}</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">{item.desc}</p>
            </SpringEntrance>
          ))}
        </AbsoluteFill>
      </CameraRig>

      {/* Textures */}
      {brand.textures?.paperTexture && <PaperTexture opacity={0.08} />}
      <GrainOverlay intensity={brand.textures?.grainIntensity ?? 0.08} />
      {brand.textures?.vignette && <Vignette opacity={0.4} />}
    </AbsoluteFill>
  );
};
