'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { BrandDNA } from '@/lib/video-spec/types';

export interface DataStoryProps {
  headline?: string;
  chartType?: 'bars' | 'line' | 'donut' | 'progress' | 'counter';
  title?: string;
  unit?: string;
  data?: Array<{ label: string; value: number; color?: string; sublabel?: string }>;
  counterValue?: number;
  counterSuffix?: string;
  brand?: BrandDNA;
  durationInFrames: number;
  className?: string;
  style?: React.CSSProperties;
}

export const DataStory: React.FC<DataStoryProps> = ({
  headline = 'EXPONENTIAL COMPUTE ACCELERATION',
  chartType = 'bars',
  title = 'PFLOPS / MEGAWATT SCALING (2020–2026)',
  unit = ' PFLOPS',
  data = [
    { label: 'Legacy GPU Cluster (2020)', value: 12, sublabel: '12 PFLOPS / MW baseline' },
    { label: 'Hopper H100 Array (2023)', value: 68, sublabel: '5.6x compute multiplier' },
    { label: 'Blackwell NVL72 (2026)', value: 290, sublabel: '24x ultra-scale liquid density' },
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

  const introSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const maxVal = Math.max(...data.map((d) => d.value), 1);

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
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.3,
          background: `radial-gradient(ellipse at 50% 40%, ${accentColor}33 0%, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          opacity: interpolate(introSpring, [0, 1], [0, 1]),
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.1em',
            color: '#fbbf24',
            marginBottom: '10px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '9999px',
              backgroundColor: '#fbbf24',
              display: 'inline-block',
            }}
          />
          EMPIRICAL DATA // BENCHMARK
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
          {title}
        </p>
      </div>

      {/* Chart Body - High Visual Density */}
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
        {data.map((item, idx) => {
          const itemSpring = spring({ frame: frame - idx * 6, fps, config: { damping: 14, stiffness: 90 } });
          const barWidthPct = interpolate(itemSpring, [0, 1], [0, (item.value / maxVal) * 100]);
          const barColor =
            item.color || (idx === data.length - 1 ? accentColor : idx === data.length - 2 ? secondaryColor : primaryColor);

          const animatedValue = Math.round(interpolate(itemSpring, [0, 1], [0, item.value]));

          return (
            <div
              key={idx}
              style={{
                padding: '30px',
                borderRadius: '26px',
                backgroundColor: 'rgba(22, 25, 34, 0.94)',
                border: '2px solid rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.75)',
                opacity: interpolate(itemSpring, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(itemSpring, [0, 1], [-20, 0])}px)`,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <span
                  style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    color: '#ffffff',
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: '36px',
                    fontWeight: 900,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: barColor,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {animatedValue.toLocaleString()}{unit}
                </span>
              </div>

              {/* Bar track */}
              <div
                style={{
                  width: '100%',
                  height: '28px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  border: '1.5px solid rgba(255, 255, 255, 0.14)',
                  overflow: 'hidden',
                  padding: '3px',
                  boxSizing: 'border-box',
                  marginBottom: '14px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: '9999px',
                    width: `${Math.max(4, barWidthPct)}%`,
                    background: `linear-gradient(to right, ${barColor}99, ${barColor})`,
                    boxShadow: `0 0 20px ${barColor}99`,
                  }}
                />
              </div>

              {item.sublabel && (
                <div
                  style={{
                    fontSize: '15px',
                    color: '#94a3b8',
                    fontFamily: 'JetBrains Mono, monospace',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ color: barColor }}>▶</span>
                  <span>{item.sublabel}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
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
        <span>DATA SOURCE: IEEE & LAB BENCHMARKS</span>
        <span style={{ color: accentColor }}>24X EFFICIENCY MULTIPLIER CONFIRMED</span>
      </div>
    </div>
  );
};
