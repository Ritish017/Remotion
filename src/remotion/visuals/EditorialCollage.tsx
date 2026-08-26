'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { BrandDNA } from '@/lib/video-spec/types';

export interface EditorialCollageProps {
  headline?: string;
  subhead?: string;
  sourceTag?: string;
  cards?: Array<{
    title: string;
    value?: string;
    annotation?: string;
    tag?: string;
    rotation?: number;
  }>;
  brand?: BrandDNA;
  durationInFrames: number;
  className?: string;
  style?: React.CSSProperties;
}

export const EditorialCollage: React.FC<EditorialCollageProps> = ({
  headline = 'ARCHIVAL DOCUMENTATION',
  subhead = 'Laboratory Benchmarks & Declassified Engineering Notes',
  sourceTag = 'PATENT // 2026-US-891',
  cards = [
    { title: 'In-Memory 3nm Logic Cell', value: '0.12 pJ / bit', annotation: 'Direct SRAM-Logic Interconnect', tag: 'EFFICIENCY', rotation: -2.0 },
    { title: 'Optical Interconnect Bandwidth', value: '25.6 Tb / s', annotation: 'Co-Packaged Optical Transceiver Array', tag: 'THROUGHPUT', rotation: 2.2 },
  ],
  brand,
  durationInFrames,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const primaryColor = brand?.colors.primary || '#f0522a';
  const secondaryColor = brand?.colors.secondary || '#00c9a7';
  const accentColor = brand?.colors.accent || '#ffd166';

  const titleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const card1Spring = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 90 } });
  const card2Spring = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 90 } });

  const springs = [card1Spring, card2Spring];

  return (
    <div
      className={`relative w-full h-full select-none ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '140px 56px 180px 56px',
        backgroundColor: '#0b0d13',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* Background Architectural Grid & Blueprint Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.25,
          backgroundImage: `radial-gradient(circle at 50% 50%, ${secondaryColor}33 0%, transparent 70%), linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 60px 60px, 60px 60px',
        }}
      />

      {/* Top Header & Stamp */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '24px',
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.10)',
              border: '1px solid rgba(255, 255, 255, 0.20)',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.1em',
              color: '#e2e8f0',
              marginBottom: '10px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '9999px',
                backgroundColor: '#34d399',
                display: 'inline-block',
              }}
            />
            {sourceTag}
          </div>
          <h2
            style={{
              fontSize: '42px',
              fontWeight: 900,
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {headline}
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: '#94a3b8',
              fontFamily: 'JetBrains Mono, monospace',
              margin: '6px 0 0 0',
            }}
          >
            {subhead}
          </p>
        </div>

        {/* Vintage Verification Stamp */}
        <div
          style={{
            border: '2.5px solid rgba(239, 68, 68, 0.9)',
            borderRadius: '8px',
            padding: '8px 16px',
            color: '#f87171',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 900,
            fontSize: '14px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
            transform: `rotate(${interpolate(titleSpring, [0, 1], [0, 8])}deg) scale(${titleSpring})`,
            flexShrink: 0,
          }}
        >
          VERIFIED // 2026
        </div>
      </div>

      {/* Center Layered Collage Cards */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          margin: 'auto 0',
          width: '100%',
          maxWidth: '860px',
          alignSelf: 'center',
        }}
      >
        {cards.map((card, idx) => {
          const s = springs[idx % springs.length];
          const rot = card.rotation ?? (idx % 2 === 0 ? -1.8 : 2.0);

          return (
            <div
              key={idx}
              style={{
                position: 'relative',
                padding: '32px',
                borderRadius: '28px',
                backgroundColor: 'rgba(22, 25, 34, 0.94)',
                border: '2px solid rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
                transform: `rotate(${interpolate(s, [0, 1], [0, rot])}deg) translateY(${interpolate(s, [0, 1], [30, 0])}px) scale(${s})`,
                opacity: interpolate(s, [0, 1], [0, 1]),
                boxSizing: 'border-box',
              }}
            >
              {/* Archival Tape Graphic */}
              <div
                style={{
                  position: 'absolute',
                  top: '-14px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(-1deg)',
                  width: '120px',
                  height: '28px',
                  backgroundColor: 'rgba(254, 243, 199, 0.40)',
                  border: '1px solid rgba(253, 230, 138, 0.40)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '3px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '15px',
                  fontFamily: 'JetBrains Mono, monospace',
                  marginBottom: '12px',
                }}
              >
                <span style={{ color: '#94a3b8', fontWeight: 700 }}>
                  {card.tag || `SPEC 0${idx + 1}`}
                </span>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: `${secondaryColor}25`,
                    color: secondaryColor,
                  }}
                >
                  VALIDATED DATA
                </span>
              </div>

              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  color: '#ffffff',
                  marginBottom: '8px',
                }}
              >
                {card.title}
              </div>

              {card.value && (
                <div
                  style={{
                    fontSize: '44px',
                    fontWeight: 900,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: accentColor,
                    marginBottom: '16px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {card.value}
                </div>
              )}

              {card.annotation && (
                <div
                  style={{
                    fontSize: '16px',
                    color: '#e2e8f0',
                    fontFamily: 'JetBrains Mono, monospace',
                    backgroundColor: 'rgba(0, 0, 0, 0.70)',
                    padding: '14px 18px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ color: primaryColor }}>▶</span>
                  <span>{card.annotation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Technical Readout */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '14px',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#94a3b8',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          paddingTop: '16px',
        }}
      >
        <span>CATALYST EDITORIAL ARCHIVE</span>
        <span style={{ color: accentColor }}>CONFIRMED HARDWARE SCHEMATICS</span>
      </div>
    </div>
  );
};
