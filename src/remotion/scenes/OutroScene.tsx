'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CameraRig } from '../motion/camera/CameraRig';
import { SpringEntrance } from '../motion/entrance/SpringEntrance';
import { PaperTexture } from '../motion/effects/PaperTexture';
import { GrainOverlay } from '../motion/effects/GrainOverlay';
import { Vignette } from '../motion/effects/Vignette';
import type { SceneData, BrandDNA } from '@/lib/video-spec/types';

interface OutroSceneProps {
  scene: SceneData;
  brand: BrandDNA;
}

export const OutroScene: React.FC<OutroSceneProps> = ({ scene, brand }) => {
  const { durationFrames } = scene;
  const ctaTitle = scene.props?.ctaTitle || 'Subscribe for Daily Deep Dives';
  const handle = scene.props?.handle || '@CatalystStudio';
  const subtext = scene.props?.subtext || 'Next investigation drops tomorrow at 09:00 UTC';
  const channelName = scene.props?.channelName || 'CATALYST';
  const tagline = scene.props?.tagline || 'Engineering the Physical Frontier';

  const accentColor = brand?.colors?.accent || '#ffd166';
  const primaryColor = brand?.colors?.primary || '#f0522a';

  return (
    <AbsoluteFill className="bg-[#0b0d13] text-white overflow-hidden select-none">
      <CameraRig camera={scene.camera || { type: 'push', intensity: 0.15 }} durationInFrames={durationFrames}>
        {/* Background glow */}
        <AbsoluteFill className="z-0">
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              background: `radial-gradient(ellipse at 50% 45%, ${primaryColor}33 0%, ${brand.colors.background} 80%)`,
            }}
          />
        </AbsoluteFill>

        {/* Content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '64px 48px 180px 48px',
            textAlign: 'center',
            boxSizing: 'border-box',
            zIndex: 10,
          }}
        >
          {/* Logo / Monogram */}
          <SpringEntrance type="scale" delay={2} damping={10}>
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '56px',
                fontWeight: 900,
                fontFamily: 'Inter, system-ui, sans-serif',
                color: '#0b0d13',
                backgroundColor: accentColor,
                boxShadow: `0 0 50px ${accentColor}88`,
                marginBottom: '28px',
              }}
            >
              C
            </div>
          </SpringEntrance>

          <SpringEntrance type="slide-up" delay={6}>
            <div style={{ marginBottom: '24px' }}>
              <h2
                style={{
                  fontSize: '48px',
                  fontWeight: 900,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                  margin: '0 0 12px 0',
                }}
              >
                {channelName}
              </h2>
              <p
                style={{
                  fontSize: '20px',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#94a3b8',
                  margin: '0 0 20px 0',
                }}
              >
                {tagline}
              </p>
              <div
                style={{
                  display: 'inline-block',
                  padding: '12px 28px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.10)',
                  border: '1.5px solid rgba(255, 255, 255, 0.25)',
                  fontSize: '22px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 800,
                  color: '#34d399',
                }}
              >
                {handle}
              </div>
            </div>
          </SpringEntrance>

          <SpringEntrance type="fade" delay={12}>
            <p
              style={{
                fontSize: '16px',
                fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace',
                color: '#64748b',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              {subtext}
            </p>
          </SpringEntrance>
        </div>
      </CameraRig>

      {/* Textures */}
      {brand.textures?.paperTexture && <PaperTexture opacity={0.08} />}
      <GrainOverlay intensity={brand.textures?.grainIntensity ?? 0.08} />
      {brand.textures?.vignette && <Vignette opacity={0.4} />}
    </AbsoluteFill>
  );
};
