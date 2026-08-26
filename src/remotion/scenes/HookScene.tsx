'use client';

import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CameraRig } from '../motion/camera/CameraRig';
import { SpringEntrance } from '../motion/entrance/SpringEntrance';
import { KineticText } from '../motion/typography/KineticText';
import { HalftoneCutout } from '../motion/effects/HalftoneCutout';
import { PaperTexture } from '../motion/effects/PaperTexture';
import { GrainOverlay } from '../motion/effects/GrainOverlay';
import { Vignette } from '../motion/effects/Vignette';
import { ASSET_REGISTRY } from '@/lib/assets/registry';
import type { SceneData, BrandDNA } from '@/lib/video-spec/types';

interface HookSceneProps {
  scene: SceneData;
  brand: BrandDNA;
}

export const HookScene: React.FC<HookSceneProps> = ({ scene, brand }) => {
  const { durationFrames } = scene;
  const headline = scene.props?.headline || scene.title || 'THE AI INFRASTRUCTURE RACE';
  const subtext = scene.props?.subtext || 'The trillion-dollar battle for sovereign compute power';
  const tag = scene.props?.tag || 'DOCUMENTARY INVESTIGATION';
  const imageUrl = scene.props?.imageUrl || scene.midground?.content?.url || ASSET_REGISTRY[0]?.url || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=85';
  const highlightWords = scene.props?.highlightWords || ['AI', 'INFRASTRUCTURE', 'RACE', 'POWER'];

  const primaryColor = brand?.colors.primary || '#f0522a';
  const accentColor = brand?.colors.accent || '#ffd166';

  return (
    <AbsoluteFill className="bg-[#0b0d13] text-white overflow-hidden select-none">
      <CameraRig camera={scene.camera || { type: 'push', intensity: 0.22 }} durationInFrames={durationFrames}>
        {/* Layer 1: Background Full-Frame Cinematic Photography */}
        <AbsoluteFill className="z-0">
          <img
            src={imageUrl}
            alt="Hook Background"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.75) contrast(115%)',
              display: 'block',
            }}
          />
          {/* Vignette and Dark Gradients */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, transparent 30%, rgba(11, 13, 19, 0.8) 85%, rgba(11, 13, 19, 0.98) 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '240px',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '380px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.98), rgba(0,0,0,0.7) 50%, transparent)',
            }}
          />
        </AbsoluteFill>

        {/* Layer 2: Midground Subtle Glow */}
        <AbsoluteFill className="z-10 pointer-events-none flex items-center justify-center">
          <div
            style={{
              width: '600px',
              height: '600px',
              borderRadius: '9999px',
              filter: 'blur(100px)',
              opacity: 0.35,
              backgroundColor: primaryColor,
            }}
          />
        </AbsoluteFill>

        {/* Layer 3: Foreground — Bold Kinetic Headline & Tag */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: '64px 48px 180px 48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            zIndex: 20,
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
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '9999px',
                  backgroundColor: primaryColor,
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                }}
              >
                {tag}
              </span>
            </div>
          </SpringEntrance>

          <div style={{ maxWidth: '850px', marginBottom: '20px' }}>
            <KineticText
              text={headline}
              highlightWords={highlightWords}
              highlightColor={accentColor}
              delay={4}
              fontSize="4.2rem"
              fontWeight={900}
              className="tracking-tight uppercase leading-[0.95] drop-shadow-2xl"
            />

            <SpringEntrance type="slide-up" delay={12}>
              <p
                style={{
                  fontSize: '22px',
                  fontWeight: 500,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#e2e8f0',
                  textShadow: '0 2px 10px rgba(0,0,0,0.9)',
                  margin: '16px 0 0 0',
                  lineHeight: 1.4,
                }}
              >
                {subtext}
              </p>
            </SpringEntrance>
          </div>
        </div>
      </CameraRig>

      {/* Global Texture & Vignette Passes */}
      {brand.textures?.paperTexture && <PaperTexture opacity={0.08} />}
      <GrainOverlay intensity={brand.textures?.grainIntensity ?? 0.08} />
      {brand.textures?.vignette && <Vignette opacity={0.4} />}
    </AbsoluteFill>
  );
};
