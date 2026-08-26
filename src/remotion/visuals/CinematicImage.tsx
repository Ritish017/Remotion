'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ASSET_REGISTRY } from '@/lib/assets/registry';
import type { BrandDNA } from '@/lib/video-spec/types';

export interface CinematicImageProps {
  src?: string;
  alt?: string;
  eyebrow?: string;
  headline?: string;
  subhead?: string;
  giantKeyword?: string;
  sourceTag?: string;
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
  eyebrow,
  headline,
  subhead,
  giantKeyword,
  sourceTag = 'DOCUMENTARY INVESTIGATION // 4K',
  treatment = 'cinematic_macro',
  animation = 'slow-push',
  durationInFrames,
  brand,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames)));

  let scale = 1.25;
  let translateX = 0;
  let translateY = 0;

  switch (animation) {
    case 'ken-burns':
      scale = interpolate(progress, [0, 1], [1.28, 1.45]);
      translateX = interpolate(progress, [0, 1], [-20, 20]);
      translateY = interpolate(progress, [0, 1], [15, -15]);
      break;
    case 'slow-push':
      scale = interpolate(progress, [0, 1], [1.22, 1.42]);
      break;
    case 'slow-pull':
      scale = interpolate(progress, [0, 1], [1.44, 1.24]);
      break;
    case 'pan-diagonal':
      scale = 1.35;
      translateX = interpolate(progress, [0, 1], [-30, 30]);
      translateY = interpolate(progress, [0, 1], [-18, 18]);
      break;
    case 'static':
    default:
      scale = 1.28;
      break;
  }

  const resolvedSrc = src && src.length > 5 ? src : ASSET_REGISTRY[1]?.url || ASSET_REGISTRY[0]?.url;
  const primaryColor = brand?.colors.primary || '#f0522a';
  const accentColor = brand?.colors.accent || '#ffc857';
  const mintColor = brand?.colors.secondary || '#64e2c5';

  let filter = 'contrast(1.35) brightness(0.68) saturate(0.85)';
  if (treatment === 'archival_grain') {
    filter = 'sepia(35%) contrast(1.4) brightness(0.65) grayscale(20%)';
  } else if (treatment === 'duotone_editorial') {
    filter = 'contrast(1.45) grayscale(60%) brightness(0.7)';
  } else if (treatment === 'blueprint_inverted') {
    filter = 'invert(90%) hue-rotate(180deg) contrast(1.4)';
  }

  const keywordSpring = spring({ frame: frame - 15, fps, config: { damping: 14, stiffness: 95 } });

  return (
    <div
      className={`relative w-full h-full select-none overflow-hidden ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#090b10',
        ...style,
      }}
    >
      {/* Full-Bleed Photographic Subject (135% Scale with Translate Crop) */}
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

      {/* Atmospheric Dual-Layer Lighting & Gradient Wash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(9,11,16,0.3) 0%, rgba(9,11,16,0.15) 45%, rgba(9,11,16,0.88) 85%, #090b10 100%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(9,11,16,0.4) 60%, rgba(9,11,16,0.92) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Frame Border Inset (Phase 6 Signature) */}
      <div
        style={{
          position: 'absolute',
          inset: '28px',
          border: '1px solid rgba(246,241,231,0.18)',
          pointerEvents: 'none',
        }}
      />

      {/* Eyebrow Header */}
      <div
        style={{
          position: 'absolute',
          top: '120px',
          left: '64px',
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '3.2px',
            color: accentColor,
            textTransform: 'uppercase',
            borderLeft: `5px solid ${accentColor}`,
            paddingLeft: '13px',
          }}
        >
          {eyebrow || '01 // THE PHYSICAL LIMIT'}
        </div>
      </div>

      {/* Brutalist Display Headline */}
      {headline && (
        <div
          style={{
            position: 'absolute',
            top: '168px',
            left: '64px',
            right: '64px',
            zIndex: 10,
            color: '#f6f1e7',
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontSize: '84px',
            letterSpacing: '-4px',
            lineHeight: 0.88,
            textTransform: 'uppercase',
            textShadow: '0 5px 22px #000, 0 10px 40px rgba(0,0,0,0.8)',
            maxWidth: '920px',
          }}
        >
          {headline}
        </div>
      )}

      {/* Giant Keyword Monolith (Middle-Center Pop) */}
      {giantKeyword && (
        <div
          style={{
            position: 'absolute',
            top: '620px',
            left: '64px',
            zIndex: 10,
            color: '#f6f1e7',
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontSize: '175px',
            letterSpacing: '-10px',
            lineHeight: 0.75,
            opacity: keywordSpring,
            transform: `scale(${interpolate(keywordSpring, [0, 1], [1.35, 1])})`,
            textShadow: `0 0 50px ${accentColor}44, 0 10px 40px rgba(0,0,0,0.9)`,
          }}
        >
          {giantKeyword}
        </div>
      )}

      {/* Georgia Serif Narrative Subtext (Bottom Third) */}
      {subhead && (
        <div
          style={{
            position: 'absolute',
            left: '64px',
            bottom: '180px',
            width: '800px',
            color: '#f6f1e7',
            fontFamily: 'Georgia, serif',
            fontSize: '36px',
            lineHeight: 1.15,
            zIndex: 10,
            textShadow: '0 2px 14px rgba(0,0,0,0.9)',
          }}
        >
          {subhead}
        </div>
      )}

      {/* Monospace Source Mark (Bottom Right) */}
      <div
        style={{
          position: 'absolute',
          bottom: '72px',
          right: '64px',
          color: mintColor,
          fontFamily: 'monospace',
          fontSize: '15px',
          letterSpacing: '2.2px',
          fontWeight: 800,
          zIndex: 10,
          textTransform: 'uppercase',
        }}
      >
        {sourceTag}
      </div>
    </div>
  );
};
