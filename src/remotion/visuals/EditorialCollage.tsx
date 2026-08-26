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

  const accentColor = brand?.colors.accent || '#ffc857';
  const mintColor = brand?.colors.secondary || '#64e2c5';
  const rustColor = brand?.colors.primary || '#ef6544';

  const titleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const card1Spring = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 90 } });
  const card2Spring = spring({ frame: frame - 12, fps, config: { damping: 14, stiffness: 90 } });

  const springs = [card1Spring, card2Spring];

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
      {/* Background Architectural Grid & Paper Blueprint Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.20,
          backgroundImage: `radial-gradient(circle at 50% 50%, ${mintColor}33 0%, transparent 70%), linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 60px 60px, 60px 60px',
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
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
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
          02 // DECLASSIFIED ARCHIVE
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

      {/* Declassified Stamp (Top Right) */}
      <div
        style={{
          position: 'absolute',
          top: '120px',
          right: '64px',
          border: '3px solid rgba(239, 68, 68, 0.9)',
          borderRadius: '4px',
          padding: '8px 16px',
          color: '#f87171',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 900,
          fontSize: '16px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
          transform: `rotate(${interpolate(titleSpring, [0, 1], [0, 6])}deg) scale(${titleSpring})`,
          zIndex: 15,
        }}
      >
        VERIFIED // 2026
      </div>

      {/* Center Archival Evidence Spreads */}
      <div
        style={{
          position: 'absolute',
          left: '64px',
          right: '64px',
          top: '440px',
          bottom: '180px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          zIndex: 10,
        }}
      >
        {cards.map((card, idx) => {
          const s = springs[idx % springs.length];
          const rot = card.rotation ?? (idx % 2 === 0 ? -1.5 : 1.8);

          return (
            <div
              key={idx}
              style={{
                position: 'relative',
                padding: '36px 44px',
                background: 'linear-gradient(135deg, rgba(22, 27, 38, 0.96) 0%, rgba(14, 17, 24, 0.98) 100%)',
                borderLeft: `8px solid ${idx % 2 === 0 ? mintColor : accentColor}`,
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 30px 60px rgba(0, 0, 0, 0.85)',
                transform: `rotate(${interpolate(s, [0, 1], [0, rot])}deg) translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
                opacity: interpolate(s, [0, 1], [0, 1]),
              }}
            >
              {/* Tape Stamp */}
              <div
                style={{
                  position: 'absolute',
                  top: '-14px',
                  left: '40px',
                  width: '130px',
                  height: '26px',
                  backgroundColor: 'rgba(254, 243, 199, 0.35)',
                  border: '1px solid rgba(253, 230, 138, 0.40)',
                  borderRadius: '2px',
                  transform: 'rotate(-1deg)',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '16px',
                  color: '#94a3b8',
                  fontWeight: 700,
                }}
              >
                <span>{card.tag || `ITEM 0${idx + 1}`}</span>
                <span style={{ color: mintColor }}>CONFIRMED MEASUREMENT</span>
              </div>

              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 900,
                  fontFamily: 'Arial Black, Arial, sans-serif',
                  color: '#f6f1e7',
                  marginBottom: '10px',
                }}
              >
                {card.title}
              </div>

              {card.value && (
                <div
                  style={{
                    fontSize: '64px',
                    fontWeight: 900,
                    fontFamily: 'Arial Black, Arial, sans-serif',
                    color: accentColor,
                    letterSpacing: '-2px',
                    lineHeight: 0.9,
                    marginBottom: '14px',
                  }}
                >
                  {card.value}
                </div>
              )}

              {card.annotation && (
                <div
                  style={{
                    fontSize: '20px',
                    fontFamily: 'Georgia, serif',
                    color: '#e2e8f0',
                    lineHeight: 1.3,
                  }}
                >
                  ▶ {card.annotation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Source Tag */}
      <div
        style={{
          position: 'absolute',
          left: '64px',
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
