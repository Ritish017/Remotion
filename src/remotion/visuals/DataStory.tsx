'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SkewedMonolithTowers } from './primitives/SkewedMonolithTowers';
import type { BrandDNA } from '@/lib/video-spec/types';

export interface DataStoryProps {
  headline?: string;
  title?: string;
  subhead?: string;
  sourceTag?: string;
  statistic?: string;
  counterTarget?: number;
  counterSuffix?: string;
  data?: any;
  unit?: string;
  metrics?: Array<{
    label: string;
    value: string;
    targetValue?: number;
    sublabel?: string;
    color?: string;
  }>;
  brand?: BrandDNA;
  durationInFrames: number;
  className?: string;
  style?: React.CSSProperties;
}

export const DataStory: React.FC<DataStoryProps> = ({
  headline = 'EXPONENTIAL COMPUTE DENSITY',
  title,
  subhead = 'Laboratory Benchmarks & Physical Scaling Multipliers',
  sourceTag = 'CATALYST RESEARCH // CONFIRMED DATA',
  statistic = '400%',
  counterTarget = 400,
  counterSuffix = '%',
  data,
  unit,
  metrics = [
    { label: 'ENERGY SCALING', value: '400%', targetValue: 400, sublabel: 'Compute per megawatt', color: '#ffc857' },
    { label: 'TRANSLATION LATENCY', value: '0.12ms', targetValue: 85, sublabel: 'Sub-millisecond interconnect', color: '#64e2c5' },
    { label: 'CAPITAL DENSITY', value: '$1.4T', targetValue: 95, sublabel: 'Annual sovereign expenditure', color: '#ef6544' },
  ],
  brand,
  durationInFrames,
  className = '',
  style = {},
}) => {
  const accentColor = brand?.colors.accent || '#ffc857';
  const mintColor = brand?.colors.secondary || '#64e2c5';
  const rustColor = brand?.colors.primary || '#ef6544';

  const numTarget = counterTarget || parseInt(statistic.replace(/[^0-9]/g, ''), 10) || 400;
  const displayHeadline = headline || title || 'EXPONENTIAL COMPUTE DENSITY';

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
      {/* Background Architectural Blueprint Grid & Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.16,
          backgroundImage: `radial-gradient(circle at 50% 50%, ${mintColor}33 0%, transparent 70%), linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 70px 70px, 70px 70px',
        }}
      />

      {/* Atmospheric Top Light Wash */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 20%, rgba(255, 200, 87, 0.12) 0%, transparent 60%)',
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

      {/* Top Header & Monospace Eyebrow */}
      <div
        style={{
          position: 'absolute',
          top: '120px',
          left: '64px',
          right: '64px',
          zIndex: 10,
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
          03 // EMPIRICAL EVIDENCE
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
          {displayHeadline}
        </div>
      </div>

      {/* Full-Canvas Skewed Monolith Towers & Hero Counter Primitive */}
      <SkewedMonolithTowers
        counterTarget={numTarget}
        counterSuffix={unit || counterSuffix}
        headline={metrics[0]?.sublabel || displayHeadline}
        sublabel={subhead}
        sourceText={sourceTag}
        towerCount={7}
        accentColor={accentColor}
        mintColor={mintColor}
        rustColor={rustColor}
        durationInFrames={durationInFrames}
      />
    </div>
  );
};
