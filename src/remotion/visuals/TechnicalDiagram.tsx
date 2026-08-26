'use client';

import React from 'react';
import { PerspectiveDie3D } from './primitives/PerspectiveDie3D';
import { LaserScanBar } from './primitives/LaserScanBar';
import type { BrandDNA } from '@/lib/video-spec/types';

export interface TechnicalDiagramProps {
  headline?: string;
  subhead?: string;
  sourceTag?: string;
  metric?: string;
  nodes?: Array<{ id: string; label: string; sublabel?: string; value?: string; color?: string }>;
  connections?: any;
  brand?: BrandDNA;
  durationInFrames: number;
  className?: string;
  style?: React.CSSProperties;
}

export const TechnicalDiagram: React.FC<TechnicalDiagramProps> = ({
  headline = '3NM TRANSISTOR TERRITORY',
  subhead = 'DECLASSIFIED ARCHITECTURE // ATOMIC LOGIC GATES',
  sourceTag = 'CATALYST HARDWARE SCHEMATIC // 2026',
  metric = '3NM',
  nodes = [],
  connections,
  brand,
  durationInFrames,
  className = '',
  style = {},
}) => {
  const accentColor = brand?.colors.accent || '#ffc857';
  const mintColor = brand?.colors.secondary || '#64e2c5';

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
      {/* Top Header & Monospace Eyebrow */}
      <div
        style={{
          position: 'absolute',
          top: '120px',
          left: '64px',
          right: '64px',
          zIndex: 15,
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
          05 // PHYSICAL ARCHITECTURE
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
      </div>

      {/* Full-Canvas 3D Perspective Die Matrix */}
      <PerspectiveDie3D
        headline={nodes[0]?.label || headline}
        sublabel={subhead}
        metric={metric || nodes[0]?.value || '3NM'}
        accentColor={accentColor}
        mintColor={mintColor}
        lineCount={17}
        durationInFrames={durationInFrames}
      />

      {/* Foreground Laser Scan Sweep Bar */}
      <LaserScanBar
        laserColor={mintColor}
        glowColor="rgba(100, 226, 197, 0.45)"
        ringCount={2}
        durationInFrames={durationInFrames}
        direction="horizontal"
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

      {/* Source Citation Mark */}
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
          zIndex: 15,
          textTransform: 'uppercase',
        }}
      >
        {sourceTag}
      </div>
    </div>
  );
};
