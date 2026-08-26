'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CorridorFlightArcs } from './primitives/CorridorFlightArcs';
import { ASSET_REGISTRY } from '@/lib/assets/registry';
import type { BrandDNA } from '@/lib/video-spec/types';

export interface MapStoryProps {
  headline?: string;
  subhead?: string;
  region?: string;
  sourceTag?: string;
  markers?: Array<{ id: string; label: string; x: number; y: number; info?: string; active?: boolean }>;
  routes?: Array<{ from: string; to: string; label?: string }>;
  brand?: BrandDNA;
  durationInFrames: number;
  className?: string;
  style?: React.CSSProperties;
}

export const MapStory: React.FC<MapStoryProps> = ({
  headline = 'TRANSCONTINENTAL CORRIDORS',
  subhead = 'Global Sovereign Supply Chains & High-Bandwidth Transit Arcs',
  region = 'GLOBAL GEOGRAPHIC MATRIX',
  sourceTag = 'NOCTURNAL SATELLITE TELEMETRY // 2026',
  markers = [
    { id: 'asia', label: 'Tokyo / Taipei', x: 80, y: 45, info: 'Fab & Assembly Hub', active: true },
    { id: 'us', label: 'North America', x: 25, y: 35, info: 'Architecture & Compute', active: true },
    { id: 'eu', label: 'Western Europe', x: 50, y: 28, info: 'Lithography Optics', active: true },
  ],
  routes = [],
  brand,
  durationInFrames,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const accentColor = brand?.colors.accent || '#ffc857';
  const mintColor = brand?.colors.secondary || '#64e2c5';

  const introSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const mapAsset = ASSET_REGISTRY[3]?.url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=85';

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
      {/* Background Nocturnal Earth Satellite Image (Full Bleed Scale 135%) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          transform: `scale(${interpolate(frame, [0, durationInFrames], [1.25, 1.45])})`,
          filter: 'contrast(1.42) brightness(0.65) saturate(0.9)',
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      >
        <img
          src={mapAsset}
          alt="Satellite Map"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Atmospheric Radial Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(9,11,16,0.6) 65%, #090b10 100%)',
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
          zIndex: 15,
        }}
      />

      {/* Top Header & Monospace Eyebrow */}
      <div
        style={{
          position: 'absolute',
          top: '120px',
          left: '64px',
          right: '64px',
          zIndex: 10,
          opacity: interpolate(introSpring, [0, 1], [0, 1]),
        }}
      >
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '3.2px',
            color: accentColor,
            textTransform: 'uppercase',
            borderLeft: `5px solid ${accentColor}`,
            paddingLeft: '13px',
            marginBottom: '14px',
          }}
        >
          04 // {region}
        </div>

        <div
          style={{
            color: '#f6f1e7',
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontSize: '76px',
            letterSpacing: '-4px',
            lineHeight: 0.88,
            textTransform: 'uppercase',
            textShadow: '0 5px 22px #000, 0 10px 40px rgba(0,0,0,0.8)',
            maxWidth: '920px',
          }}
        >
          {headline}
        </div>

        {subhead && (
          <div
            style={{
              fontSize: '28px',
              fontFamily: 'Georgia, serif',
              color: '#e2e8f0',
              marginTop: '16px',
              maxWidth: '820px',
              lineHeight: 1.2,
            }}
          >
            {subhead}
          </div>
        )}
      </div>

      {/* Full-Canvas Ballistic Flight Corridor Paths */}
      <CorridorFlightArcs
        amberColor={accentColor}
        mintColor={mintColor}
        durationInFrames={durationInFrames}
      />

      {/* Bottom Source Tag */}
      <div
        style={{
          position: 'absolute',
          right: '64px',
          bottom: '72px',
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
