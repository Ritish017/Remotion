'use client';

import React from 'react';
import { AbsoluteFill, Img } from 'remotion';
import { CameraRig } from '../motion/camera/CameraRig';
import { SpringEntrance } from '../motion/entrance/SpringEntrance';
import { PaperTexture } from '../motion/effects/PaperTexture';
import { GrainOverlay } from '../motion/effects/GrainOverlay';
import { Vignette } from '../motion/effects/Vignette';
import type { SceneData, BrandDNA } from '@/lib/video-spec/types';

interface PhotoSceneProps {
  scene: SceneData;
  brand: BrandDNA;
}

export const PhotoScene: React.FC<PhotoSceneProps> = ({ scene, brand }) => {
  const { durationFrames } = scene;
  const photoUrl = scene.props?.photoUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';
  const caption = scene.props?.caption || 'Satellite view of data transmission hubs';
  const timestamp = scene.props?.timestamp || 'ARCHIVE // 2026';

  return (
    <AbsoluteFill className="bg-[#0b0d13] text-white overflow-hidden">
      <CameraRig camera={scene.camera || { type: 'push', intensity: 0.2 }} durationInFrames={durationFrames}>
        <AbsoluteFill className="z-0">
          <Img
            src={photoUrl}
            className="w-full h-full object-cover filter grayscale contrast-125 brightness-90"
          />
        </AbsoluteFill>

        <AbsoluteFill className="z-10 bg-gradient-to-t from-black via-transparent to-black/60 p-12 flex flex-col justify-between">
          <SpringEntrance type="slide-down" delay={2}>
            <div className="font-mono text-xs px-3 py-1 bg-black/60 border border-white/20 rounded-md self-start text-white/80">
              {timestamp}
            </div>
          </SpringEntrance>

          <SpringEntrance type="slide-up" delay={8}>
            <div className="p-4 rounded-xl bg-black/70 border border-white/15 backdrop-blur-md max-w-md">
              <p className="text-sm font-semibold text-white/90">{caption}</p>
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
