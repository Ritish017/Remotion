'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CameraRig } from '../motion/camera/CameraRig';
import { SpringEntrance } from '../motion/entrance/SpringEntrance';
import { PaperTexture } from '../motion/effects/PaperTexture';
import { GrainOverlay } from '../motion/effects/GrainOverlay';
import { Vignette } from '../motion/effects/Vignette';
import type { SceneData, BrandDNA } from '@/lib/video-spec/types';

interface UIExplainerSceneProps {
  scene: SceneData;
  brand: BrandDNA;
}

export const UIExplainerScene: React.FC<UIExplainerSceneProps> = ({ scene, brand }) => {
  const { durationFrames } = scene;
  const headline = scene.props?.headline || 'Interactive Agent Interface';
  const codeSnippet = scene.props?.codeSnippet || `// Frame-accurate synthesis
const video = await catalyst.render({
  composition: "VerticalExplainer",
  fps: 30,
  durationInFrames: 1350
});`;

  return (
    <AbsoluteFill className="bg-[#0b0d13] text-white overflow-hidden">
      <CameraRig camera={scene.camera || { type: 'push', intensity: 0.15 }} durationInFrames={durationFrames}>
        <AbsoluteFill className="z-0">
          <div className="w-full h-full" style={{ background: `radial-gradient(ellipse at 50% 40%, #1e1b4b 0%, ${brand.colors.background} 80%)` }} />
        </AbsoluteFill>

        <AbsoluteFill className="z-10 flex flex-col justify-center items-center p-8 space-y-6">
          <SpringEntrance type="slide-down" delay={2} className="text-center space-y-1">
            <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">
              ENGINE ARCHITECTURE
            </div>
            <h2 className="text-3xl font-extrabold text-white/95">{headline}</h2>
          </SpringEntrance>

          {/* Browser / Code Window */}
          <SpringEntrance type="scale" delay={6} damping={12} className="w-full max-w-xl">
            <div className="rounded-2xl bg-[#0f1422] border border-white/20 shadow-2xl overflow-hidden">
              <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] font-mono text-white/40 ml-2">catalyst-engine.ts</span>
              </div>
              <div className="p-6 font-mono text-sm leading-relaxed text-emerald-300 whitespace-pre">
                {codeSnippet}
              </div>
            </div>
          </SpringEntrance>
        </AbsoluteFill>
      </CameraRig>

      {brand.textures?.paperTexture && <PaperTexture opacity={0.08} />}
      <GrainOverlay intensity={brand.textures?.grainIntensity ?? 0.08} />
      {brand.textures?.vignette && <Vignette opacity={0.4} />}
    </AbsoluteFill>
  );
};
