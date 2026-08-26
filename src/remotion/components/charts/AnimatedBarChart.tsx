'use client';

import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface AnimatedBarChartProps {
  data: ChartDataPoint[];
  title?: string;
  unit?: string;
  delay?: number;
  accentColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const AnimatedBarChart: React.FC<AnimatedBarChartProps> = ({
  data,
  title,
  unit = '',
  delay = 5,
  accentColor = '#00c9a7',
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div
      className={`w-full max-w-2xl p-8 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-md ${className}`}
      style={{
        width: '100%',
        maxWidth: '860px',
        padding: '36px',
        borderRadius: '28px',
        backgroundColor: 'rgba(15, 19, 29, 0.94)',
        border: '2px solid rgba(255, 255, 255, 0.16)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            fontSize: '24px',
            fontWeight: 800,
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#ffffff',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{title}</span>
          <span
            style={{
              fontSize: '14px',
              fontFamily: 'JetBrains Mono, monospace',
              color: '#94a3b8',
              fontWeight: 'normal',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Metrics {unit ? `(${unit})` : ''}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {data.map((item, idx) => {
          const itemDelay = delay + idx * 4;
          const spr = spring({
            frame: Math.max(0, frame - itemDelay),
            fps,
            config: { damping: 14, stiffness: 100, mass: 0.5 },
          });

          const pct = Math.min(100, (item.value / maxValue) * 100 * spr);
          const barColor = item.color || (idx === 0 ? accentColor : idx === 1 ? '#ffd166' : '#f0522a');

          return (
            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '18px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                <span>{item.label}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: barColor, fontWeight: 900 }}>
                  {Math.round(item.value * spr).toLocaleString()} {unit}
                </span>
              </div>
              <div
                style={{
                  height: '20px',
                  width: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.70)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  padding: '3px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: '9999px',
                    width: `${pct}%`,
                    backgroundColor: barColor,
                    boxShadow: `0 0 16px ${barColor}99`,
                    transition: 'all 0.1s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
