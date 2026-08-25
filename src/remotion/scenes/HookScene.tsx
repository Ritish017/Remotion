'use client';

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CameraRig } from '../motion/camera/CameraRig';
import { SpringEntrance } from '../motion/entrance/SpringEntrance';
import { KineticText } from '../motion/typography/KineticText';
import { HalftoneCutout } from '../motion/effects/HalftoneCutout';
import { PaperTexture } from '../motion/effects/PaperTexture';
import { GrainOverlay } from '../motion/effects/GrainOverlay';
import { Vignette } from '../motion/effects/Vignette';
import type { SceneData, BrandDNA } from '@/lib/video-spec/types';

interface HookSceneProps {
  scene: SceneData;
  brand: BrandDNA;
}

export const HookScene: React.FC<HookSceneProps> = ({ scene, brand }) => {
  const { durationFrames } = scene;
  const headline = scene.props?.headline || scene.title || 'THE FUTURE OF AI';
  const subtext = scene.props?.subtext || 'Everything is about to change';
  const tag = scene.props?.tag || 'DOCUMENTARY INVESTIGATION';
  const cutoutUrl = scene.props?.cutoutUrl || scene.midground?.content?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
  const highlightWords = scene.props?.highlightWords || ['AI', 'FUTURE', 'CHANGE', 'BREAKTHROUGH'];

  return (
    <AbsoluteFill className="bg-[#0b0d13] text-white overflow-hidden">
      <CameraRig camera={scene.camera || { type: 'push', intensity: 0.18 }} durationInFrames={durationFrames}>
        {/* Layer 1: Background */}
        <AbsoluteFill className="z-0">
          <div
            className="w-full h-full"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${brand.colors.primary}33 0%, ${brand.colors.background} 80%)`,
            }}
          />
          {/* Subtle grid lines */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `linear-gradient(to right, ${brand.colors.textMuted} 1px, transparent 1px), linear-gradient(to bottom, ${brand.colors.textMuted} 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </AbsoluteFill>

        {/* Layer 2: Midground — Editorial Cutout / Subject */}
        <AbsoluteFill className="z-10 flex items-center justify-center pt-24">
          <SpringEntrance type="spring" delay={4} damping={10} stiffness={90}>
            <div className="w-[420px] h-[540px]">
              <HalftoneCutout
                src={cutoutUrl}
                accentGlow={brand.colors.accent}
                alt="Hook Subject"
              />
            </div>
          </SpringEntrance>
        </AbsoluteFill>

        {/* Layer 3: Foreground — Bold Kinetic Headline & Badge */}
        <AbsoluteFill className="z-20 flex flex-col justify-between p-12 pb-36">
          <SpringEntrance type="slide-down" delay={2}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md self-start">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-white/90">
                {tag}
              </span>
            </div>
          </SpringEntrance>

          <div className="space-y-4">
            <KineticText
              text={headline}
              highlightWords={highlightWords}
              highlightColor={brand.colors.accent}
              delay={6}
              fontSize="4.2rem"
              fontWeight={900}
              className="tracking-tight uppercase leading-[0.95]"
            />

            <SpringEntrance type="slide-up" delay={14}>
              <p className="text-xl font-medium text-white/70 max-w-lg tracking-wide">
                {subtext}
              </p>
            </SpringEntrance>
          </div>
        </AbsoluteFill>
      </CameraRig>

      {/* Global Texture & Vignette Passes */}
      {brand.textures?.paperTexture && <PaperTexture opacity={0.08} />}
      <GrainOverlay intensity={brand.textures?.grainIntensity ?? 0.08} />
      {brand.textures?.vignette && <Vignette opacity={0.4} />}
    </AbsoluteFill>
  );
};
