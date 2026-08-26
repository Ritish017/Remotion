'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CameraRig } from '../motion/camera/CameraRig';
import { SpringEntrance } from '../motion/entrance/SpringEntrance';
import { HalftoneCutout } from '../motion/effects/HalftoneCutout';
import { PaperTexture } from '../motion/effects/PaperTexture';
import { GrainOverlay } from '../motion/effects/GrainOverlay';
import { Vignette } from '../motion/effects/Vignette';
import { ASSET_REGISTRY } from '@/lib/assets/registry';
import type { SceneData, BrandDNA } from '@/lib/video-spec/types';

interface CutoutSceneProps {
  scene: SceneData;
  brand: BrandDNA;
}

export const CutoutScene: React.FC<CutoutSceneProps> = ({ scene, brand }) => {
  const { durationFrames } = scene;
  const headline = scene.props?.headline || 'DIRECT SILICON CO-DESIGN';
  const subtext = scene.props?.subtext || 'Eliminating compiler and translation latency';
  const cutoutUrl = scene.props?.imageUrl || scene.props?.cutoutUrl || ASSET_REGISTRY[4]?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85';
  const callouts = scene.props?.callouts || [
    { title: 'Deterministic Routing', desc: 'Direct gate-level execution without OS interrupts' },
    { title: 'Sub-Nanosecond Memory', desc: 'In-situ SRAM array eliminating bus transit loss' },
    { title: 'Zero Artifact Telemetry', desc: 'Direct hardware-verified pipeline throughput' },
  ];

  const primaryColor = brand?.colors.primary || '#f0522a';
  const secondaryColor = brand?.colors.secondary || '#00c9a7';
  const accentColor = brand?.colors.accent || '#ffd166';

  return (
    <AbsoluteFill className="bg-[#0b0d13] text-white overflow-hidden select-none">
      <CameraRig camera={scene.camera || { type: 'orbit', intensity: 0.22 }} durationInFrames={durationFrames}>
        {/* Layer 1: Atmospheric Background with Blueprint Traces */}
        <AbsoluteFill className="z-0">
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              background: `radial-gradient(ellipse at 40% 50%, ${primaryColor}22 0%, ${brand.colors.background} 80%)`,
            }}
          />
          {/* Technical schematic grid overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.15,
              backgroundImage: `linear-gradient(to right, ${brand.colors.textMuted} 1px, transparent 1px), linear-gradient(to bottom, ${brand.colors.textMuted} 1px, transparent 1px)`,
              backgroundSize: '80px 80px',
            }}
          />
        </AbsoluteFill>

        {/* Layer 2: Midground Large Subject Cutout positioned left */}
        <div
          style={{
            position: 'absolute',
            left: '20px',
            bottom: '120px',
            width: '540px',
            height: '960px',
            zIndex: 10,
          }}
        >
          <SpringEntrance type="slide-left" delay={4} damping={12}>
            <div style={{ width: '540px', height: '960px', filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.85))' }}>
              <HalftoneCutout
                src={cutoutUrl}
                accentGlow={accentColor}
                alt="Lead Systems Architect"
              />
            </div>
          </SpringEntrance>
        </div>

        {/* Layer 3: Foreground Header & Animated Callouts positioned top right */}
        <div
          style={{
            position: 'absolute',
            top: '140px',
            right: '48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '14px',
            maxWidth: '440px',
            zIndex: 20,
          }}
        >
          <SpringEntrance type="slide-down" delay={2}>
            <div style={{ textAlign: 'right', marginBottom: '6px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  color: '#fbbf24',
                  marginBottom: '8px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    backgroundColor: '#fbbf24',
                    display: 'inline-block',
                  }}
                />
                HUMAN // HARDWARE INTERACTION
              </div>
              <h3
                style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                  lineHeight: 1.1,
                  margin: '0 0 6px 0',
                }}
              >
                {headline}
              </h3>
              {subtext && (
                <p
                  style={{
                    fontSize: '15px',
                    color: '#94a3b8',
                    fontFamily: 'JetBrains Mono, monospace',
                    margin: 0,
                  }}
                >
                  {subtext}
                </p>
              )}
            </div>
          </SpringEntrance>

          {callouts.map((item: any, idx: number) => (
            <SpringEntrance
              key={item.title}
              type="slide-right"
              delay={8 + idx * 6}
            >
              <div
                style={{
                  width: '360px',
                  padding: '20px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(22, 25, 34, 0.94)',
                  border: '1.5px solid rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '9999px',
                      backgroundColor: idx === 0 ? accentColor : idx === 1 ? secondaryColor : primaryColor,
                      display: 'inline-block',
                    }}
                  />
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: '15px',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      color: '#ffffff',
                    }}
                  >
                    {item.title}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#cbd5e1',
                    fontFamily: 'JetBrains Mono, monospace',
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </SpringEntrance>
          ))}
        </div>
      </CameraRig>

      {/* Textures */}
      {brand.textures?.paperTexture && <PaperTexture opacity={0.08} />}
      <GrainOverlay intensity={brand.textures?.grainIntensity ?? 0.08} />
      {brand.textures?.vignette && <Vignette opacity={0.4} />}
    </AbsoluteFill>
  );
};
