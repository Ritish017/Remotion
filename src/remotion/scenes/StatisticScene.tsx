'use client';

import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CameraRig } from '../motion/camera/CameraRig';
import { SpringEntrance } from '../motion/entrance/SpringEntrance';
import { CounterText } from '../motion/typography/CounterText';
import { PaperTexture } from '../motion/effects/PaperTexture';
import { GrainOverlay } from '../motion/effects/GrainOverlay';
import { Vignette } from '../motion/effects/Vignette';
import type { SceneData, BrandDNA } from '@/lib/video-spec/types';

interface StatisticSceneProps {
  scene: SceneData;
  brand: BrandDNA;
}

export const StatisticScene: React.FC<StatisticSceneProps> = ({ scene, brand }) => {
  const { durationFrames } = scene;
  const targetValue = scene.props?.targetValue ?? 100;
  const prefix = scene.props?.prefix || '';
  const suffix = scene.props?.suffix || 'X';
  const tag = scene.props?.tag || 'PERFORMANCE MULTIPLIER';
  const headline = scene.props?.headline || 'THROUGHPUT EXPANSION';
  const subtext = scene.props?.subtext || 'Hundred-fold expansion in continuous compute velocity';

  const accentColor = brand?.colors?.accent || '#ffd166';
  const primaryColor = brand?.colors?.primary || '#f0522a';

  return (
    <AbsoluteFill className="bg-[#0b0d13] text-white overflow-hidden select-none">
      <CameraRig camera={scene.camera || { type: 'push', intensity: 0.2 }} durationInFrames={durationFrames}>
        {/* Background glow */}
        <AbsoluteFill className="z-0">
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              background: `radial-gradient(circle at 50% 50%, ${accentColor}33 0%, ${brand.colors.background} 80%)`,
            }}
          />
        </AbsoluteFill>

        {/* Big Number & Callouts */}
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
          <SpringEntrance type="slide-down" delay={2}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1.5px solid rgba(245, 158, 11, 0.40)',
                marginBottom: '24px',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#fbbf24',
                }}
              >
                {tag}
              </span>
            </div>
          </SpringEntrance>

          <SpringEntrance type="scale" delay={5} damping={10} stiffness={90}>
            <div style={{ margin: '12px 0' }}>
              <CounterText
                targetValue={targetValue}
                prefix={prefix}
                suffix={suffix}
                delay={6}
                durationFrames={40}
                fontSize="9.5rem"
                color={accentColor}
                className="tracking-tighter font-black drop-shadow-[0_0_60px_rgba(255,209,102,0.40)]"
              />
            </div>
          </SpringEntrance>

          <div style={{ maxWidth: '800px', marginTop: '16px' }}>
            <h3
              style={{
                fontSize: '46px',
                fontWeight: 900,
                fontFamily: 'Inter, system-ui, sans-serif',
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                margin: '0 0 12px 0',
              }}
            >
              {headline}
            </h3>
            <SpringEntrance type="slide-up" delay={14}>
              <p
                style={{
                  fontSize: '20px',
                  color: '#cbd5e1',
                  fontFamily: 'JetBrains Mono, monospace',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {subtext}
              </p>
            </SpringEntrance>
          </div>
        </div>
      </CameraRig>

      {/* Textures */}
      {brand.textures?.paperTexture && <PaperTexture opacity={0.08} />}
      <GrainOverlay intensity={brand.textures?.grainIntensity ?? 0.08} />
      {brand.textures?.vignette && <Vignette opacity={0.4} />}
    </AbsoluteFill>
  );
};
