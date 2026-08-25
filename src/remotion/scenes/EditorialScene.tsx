'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CameraRig } from '../motion/camera/CameraRig';
import { SpringEntrance } from '../motion/entrance/SpringEntrance';
import { KineticText } from '../motion/typography/KineticText';
import { PaperTexture } from '../motion/effects/PaperTexture';
import { GrainOverlay } from '../motion/effects/GrainOverlay';
import { Vignette } from '../motion/effects/Vignette';
import type { SceneData, BrandDNA } from '@/lib/video-spec/types';

interface EditorialSceneProps {
  scene: SceneData;
  brand: BrandDNA;
}

export const EditorialScene: React.FC<EditorialSceneProps> = ({ scene, brand }) => {
  const { durationFrames } = scene;
  const chapter = scene.props?.chapter || '01';
  const chapterTitle = scene.props?.chapterTitle || 'THE CONTEXT';
  const quote = scene.props?.quote || 'The shift occurred when computational power crossed the threshold of human reaction time.';
  const source = scene.props?.source || 'Source: Deep Learning Institute (2026)';
  const keyPoints = scene.props?.keyPoints || [
    'Autonomous multi-agent orchestration',
    'Sub-100ms reasoning latencies',
    'Real-time synthesis across 4 billion parameters',
  ];

  return (
    <AbsoluteFill className="bg-[#0b0d13] text-white overflow-hidden">
      <CameraRig camera={scene.camera || { type: 'pan-left', intensity: 0.12 }} durationInFrames={durationFrames}>
        {/* Layer 1: Background — Dark Newspaper/Document Atmosphere */}
        <AbsoluteFill className="z-0">
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${brand.colors.background} 0%, #111625 100%)`,
            }}
          />
          {/* Subtle watermark chapter number */}
          <div className="absolute right-[-40px] top-[10%] font-mono text-[280px] font-black text-white/[0.03] select-none pointer-events-none">
            {chapter}
          </div>
        </AbsoluteFill>

        {/* Layer 2: Midground — Evidence Cards & Key Points */}
        <AbsoluteFill className="z-10 flex flex-col justify-center p-12 space-y-8 pt-20">
          {/* Chapter header */}
          <SpringEntrance type="slide-down" delay={2}>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                CH. {chapter}
              </span>
              <span className="text-sm font-mono tracking-widest uppercase text-white/50">
                {chapterTitle}
              </span>
            </div>
          </SpringEntrance>

          {/* Pull Quote Box */}
          <SpringEntrance type="scale" delay={6} damping={14}>
            <div className="relative p-8 rounded-2xl bg-white/[0.04] border-l-4 border border-white/10 backdrop-blur-md shadow-2xl" style={{ borderLeftColor: brand.colors.accent }}>
              <div className="text-5xl font-serif text-white/20 absolute -top-4 left-4">“</div>
              <p className="text-2xl font-semibold text-white/95 leading-snug pl-4 italic">
                {quote}
              </p>
              <div className="mt-4 pl-4 text-xs font-mono text-white/40 tracking-wider">
                {source}
              </div>
            </div>
          </SpringEntrance>

          {/* Key Bullet List */}
          <div className="space-y-3 pl-2">
            {keyPoints.map((point: string, idx: number) => (
              <SpringEntrance key={point} type="slide-right" delay={12 + idx * 4}>
                <div className="flex items-center gap-3 text-lg text-white/80 font-medium">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brand.colors.secondary }} />
                  <span>{point}</span>
                </div>
              </SpringEntrance>
            ))}
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
