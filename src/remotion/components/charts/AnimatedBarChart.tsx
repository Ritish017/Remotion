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

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div
      className={`w-full max-w-xl p-8 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md ${className}`}
      style={style}
    >
      {title && (
        <div className="text-xl font-bold tracking-tight text-white/90 mb-6 flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs font-mono font-normal uppercase text-white/40 tracking-wider">Metrics {unit ? `(${unit})` : ''}</span>
        </div>
      )}

      <div className="space-y-4">
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
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between text-sm font-semibold tracking-wide">
                <span className="text-white/80">{item.label}</span>
                <span className="font-mono text-white/90">
                  {Math.round(item.value * spr).toLocaleString()} {unit}
                </span>
              </div>
              <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: barColor,
                    boxShadow: `0 0 15px ${barColor}66`,
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
