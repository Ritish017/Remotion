'use client';

import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { ASSET_REGISTRY } from '@/lib/assets/registry';
import type { BrandDNA } from '@/lib/video-spec/types';

export interface CinematicImageProps {
  src?: string;
  alt?: string;
  headline?: string;
  subhead?: string;
  tag?: string;
  treatment?: 'cinematic_macro' | 'archival_grain' | 'duotone_editorial' | 'cutout_shadow' | 'paper_textured' | 'blueprint_inverted' | 'standard';
  animation?: 'ken-burns' | 'slow-push' | 'slow-pull' | 'pan-diagonal' | 'static';
  durationInFrames: number;
  brand?: BrandDNA;
  className?: string;
  style?: React.CSSProperties;
}

export const CinematicImage: React.FC<CinematicImageProps> = ({
  src,
  alt = 'Cinematic Documentary Subject',
  headline,
  subhead,
  tag = 'PRIMARY INVESTIGATION',
  treatment = 'cinematic_macro',
  animation = 'slow-push',
  durationInFrames,
  brand,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames)));

  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;

  switch (animation) {
    case 'ken-burns':
      scale = interpolate(progress, [0, 1], [1.05, 1.18]);
      translateX = interpolate(progress, [0, 1], [-20, 20]);
      translateY = interpolate(progress, [0, 1], [15, -15]);
      break;
    case 'slow-push':
      scale = interpolate(progress, [0, 1], [1.0, 1.14]);
      break;
    case 'slow-pull':
      scale = interpolate(progress, [0, 1], [1.15, 1.02]);
      break;
    case 'pan-diagonal':
      scale = 1.10;
      translateX = interpolate(progress, [0, 1], [-25, 25]);
      translateY = interpolate(progress, [0, 1], [-15, 15]);
      break;
    case 'static':
    default:
      scale = 1.0;
      break;
  }

  // Fallback to high-resolution curated documentary image from registry if empty
  const resolvedSrc = (src && src.length > 5) ? src : ASSET_REGISTRY[0]?.url;
  const primaryColor = brand?.colors.primary || '#f0522a';
  const accentColor = brand?.colors.accent || '#ffd166';
  const secondaryColor = brand?.colors.secondary || '#00c9a7';

  let filter = 'contrast(110%) brightness(92%) saturate(108%)';
  if (treatment === 'archival_grain') {
    filter = 'sepia(25%) contrast(125%) brightness(90%) grayscale(15%)';
  } else if (treatment === 'duotone_editorial') {
    filter = 'contrast(135%) grayscale(45%)';
  } else if (treatment === 'blueprint_inverted') {
    filter = 'invert(90%) hue-rotate(180deg) contrast(140%)';
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#0b0d13',
        ...style,
      }}
    >
      {/* Full-Frame Cinematic Image Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          transform: `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0)`,
          filter,
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      >
        <img
          src={resolvedSrc}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>

      {/* Atmospheric Lighting Gradients & Safe Margin Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 45%, transparent 35%, rgba(11, 13, 19, 0.70) 80%, rgba(11, 13, 19, 0.96) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle Top & Bottom Cinematic Edge Shading */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '320px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.92), rgba(0,0,0,0.6) 60%, transparent)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '360px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.6) 50%, transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Editorial Content Overlay - Upper Third for zero subtitle overlap */}
      <div
        style={{
          position: 'absolute',
          top: '140px',
          left: '56px',
          right: '56px',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'none',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(12px)',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.1em',
              color: '#e2e8f0',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '9999px',
                backgroundColor: primaryColor,
                display: 'inline-block',
              }}
            />
            {tag}
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              color: '#94a3b8',
              letterSpacing: '0.05em',
            }}
          >
            CATALYST INVESTIGATION // 4K
          </div>
        </div>

        {headline && (
          <div style={{ maxWidth: '880px' }}>
            <h2
              style={{
                fontSize: '48px',
                fontWeight: 900,
                fontFamily: 'Inter, system-ui, sans-serif',
                color: '#ffffff',
                textTransform: 'uppercase',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                textShadow: '0 4px 20px rgba(0,0,0,0.95)',
                margin: 0,
                marginBottom: '10px',
              }}
            >
              {headline}
            </h2>
            {subhead && (
              <p
                style={{
                  fontSize: '20px',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#cbd5e1',
                  textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                  margin: 0,
                  lineHeight: 1.35,
                }}
              >
                {subhead}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
