'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CameraRig } from '../motion/camera/CameraRig';
import { SpringEntrance } from '../motion/entrance/SpringEntrance';
import { PaperTexture } from '../motion/effects/PaperTexture';
import { GrainOverlay } from '../motion/effects/GrainOverlay';
import { Vignette } from '../motion/effects/Vignette';
import { ASSET_REGISTRY } from '@/lib/assets/registry';
import type { SceneData, BrandDNA } from '@/lib/video-spec/types';

interface PhotoSceneProps {
  scene: SceneData;
  brand: BrandDNA;
}

export const PhotoScene: React.FC<PhotoSceneProps> = ({ scene, brand }) => {
  const { durationFrames } = scene;
  const photoUrl = scene.props?.imageUrl || scene.props?.photoUrl || ASSET_REGISTRY[0]?.url || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=85';
  const headline = scene.props?.headline || scene.title || 'CRITICAL INFRASTRUCTURE';
  const caption = scene.props?.subtext || scene.props?.caption || scene.narrationText || 'Hyperscale AI datacenter architecture';
  const timestamp = scene.props?.timestamp || 'DEVALUATION ARCHIVE // 2026';

  const accentColor = brand?.colors.accent || '#ffd166';
  const primaryColor = brand?.colors.primary || '#f0522a';

  return (
    <AbsoluteFill className="bg-[#0b0d13] text-white overflow-hidden select-none">
      <CameraRig camera={scene.camera || { type: 'push', intensity: 0.22 }} durationInFrames={durationFrames}>
        {/* Full-Frame Cinematic Photo Layer */}
        <AbsoluteFill className="z-0">
          <img
            src={photoUrl}
            alt={caption}
            className="w-full h-full object-cover filter contrast-[115%] brightness-[0.88] saturate-[110%]"
          />
        </AbsoluteFill>

        {/* Shading Gradients */}
        <AbsoluteFill className="z-10 bg-gradient-to-t from-black via-transparent to-black/70 p-10 flex flex-col justify-between">
          <SpringEntrance type="slide-down" delay={2}>
            <div className="inline-flex items-center gap-2 font-mono text-xs px-3.5 py-1.5 bg-black/70 border border-white/20 rounded-full self-start text-white backdrop-blur-md">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              {timestamp}
            </div>
          </SpringEntrance>

          <SpringEntrance type="slide-up" delay={8}>
            <div className="p-6 rounded-2xl bg-black/80 border border-white/20 backdrop-blur-xl max-w-xl space-y-2 mb-28 shadow-2xl">
              <h3 className="text-2xl font-black text-white tracking-tight uppercase" style={{ color: accentColor }}>
                {headline}
              </h3>
              <p className="text-sm font-medium text-zinc-300 font-mono leading-relaxed">{caption}</p>
            </div>
          </SpringEntrance>
        </AbsoluteFill>
      </CameraRig>

      {brand.textures?.paperTexture && <PaperTexture opacity={0.08} />}
      <GrainOverlay intensity={brand.textures?.grainIntensity ?? 0.12} />
      {brand.textures?.vignette && <Vignette opacity={0.5} />}
    </AbsoluteFill>
  );
};
