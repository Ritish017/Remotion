'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CameraRig } from '../motion/camera/CameraRig';
import { SpringEntrance } from '../motion/entrance/SpringEntrance';
import { PaperTexture } from '../motion/effects/PaperTexture';
import { GrainOverlay } from '../motion/effects/GrainOverlay';
import { Vignette } from '../motion/effects/Vignette';
import type { SceneData, BrandDNA } from '@/lib/video-spec/types';

interface TimelineSceneProps {
  scene: SceneData;
  brand: BrandDNA;
}

export const TimelineScene: React.FC<TimelineSceneProps> = ({ scene, brand }) => {
  const { durationFrames } = scene;
  const events = scene.props?.events || [
    { year: '2023', title: 'Monolithic Models', desc: 'Single prompt-response systems' },
    { year: '2025', title: 'Agent Swarms', desc: 'Autonomous tool-using pipelines' },
    { year: '2026', title: 'Deterministic Engines', desc: 'Frame-accurate code-rendered video' },
  ];

  return (
    <AbsoluteFill className="bg-[#0b0d13] text-white overflow-hidden">
      <CameraRig camera={scene.camera || { type: 'pan-right', intensity: 0.12 }} durationInFrames={durationFrames}>
        <AbsoluteFill className="z-0">
          <div className="w-full h-full" style={{ background: `radial-gradient(circle at 50% 50%, #171f30 0%, ${brand.colors.background} 85%)` }} />
        </AbsoluteFill>

        <AbsoluteFill className="z-10 flex flex-col justify-center p-12 space-y-6">
          <SpringEntrance type="slide-down" delay={2}>
            <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold mb-1">
              CHRONOLOGY // EVOLUTION
            </div>
            <h2 className="text-3xl font-black text-white/95">The Timeline of Transformation</h2>
          </SpringEntrance>

          <div className="space-y-4 relative border-l-2 border-white/20 pl-6 ml-3">
            {events.map((ev: any, idx: number) => (
              <SpringEntrance key={ev.year} type="slide-left" delay={6 + idx * 5} className="relative">
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ backgroundColor: idx === events.length - 1 ? brand.colors.accent : brand.colors.secondary }} />
                <div className="font-mono text-sm font-bold text-amber-300">{ev.year}</div>
                <div className="font-bold text-lg text-white/90">{ev.title}</div>
                <div className="text-xs text-white/60">{ev.desc}</div>
              </SpringEntrance>
            ))}
          </div>
        </AbsoluteFill>
      </CameraRig>

      {brand.textures?.paperTexture && <PaperTexture opacity={0.08} />}
      <GrainOverlay intensity={brand.textures?.grainIntensity ?? 0.08} />
      {brand.textures?.vignette && <Vignette opacity={0.4} />}
    </AbsoluteFill>
  );
};
