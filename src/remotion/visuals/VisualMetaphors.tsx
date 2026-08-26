'use client';

import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import type { BrandDNA } from '@/lib/video-spec/types';

export interface VisualMetaphorProps {
  type: 'energy-particles' | 'growth-matrix' | 'comparative-scale' | 'system-interconnect';
  headline?: string;
  brand?: BrandDNA;
  durationInFrames: number;
  motionSeed?: number;
  className?: string;
}

export const VisualMetaphor: React.FC<VisualMetaphorProps> = ({
  type,
  headline,
  brand,
  durationInFrames,
  motionSeed = 42,
  className = '',
}) => {
  const frame = useCurrentFrame();
  const primaryColor = brand?.colors.primary || '#f0522a';
  const secondaryColor = brand?.colors.secondary || '#00c9a7';
  const accentColor = brand?.colors.accent || '#ffd166';

  if (type === 'energy-particles') {
    // Generate deterministic particles flowing towards neural center
    const particles = Array.from({ length: 32 }).map((_, i) => {
      const angle = (i / 32) * Math.PI * 2;
      const speed = 1.5 + (i % 5) * 0.4;
      const dist = 280 - ((frame * speed * 2 + i * 20) % 280);
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist;
      const r = 2 + (i % 4);
      const col = i % 3 === 0 ? accentColor : i % 3 === 1 ? secondaryColor : primaryColor;

      return { px, py, r, col, id: i };
    });

    return (
      <div className={`relative w-full h-full flex items-center justify-center p-8 select-none ${className}`}>
        <svg viewBox="-300 -300 600 600" className="w-full h-full max-w-[480px]">
          {/* Central Reactor Core */}
          <circle cx="0" cy="0" r="50" fill={`${accentColor}20`} stroke={accentColor} strokeWidth="3" />
          <circle cx="0" cy="0" r="30" fill={accentColor} />
          
          {/* Particles */}
          {particles.map(p => (
            <circle
              key={p.id}
              cx={p.px}
              cy={p.py}
              r={p.r}
              fill={p.col}
              opacity={0.8}
            />
          ))}

          {/* Core Label */}
          <text y="90" fill="#ffffff" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            {headline || 'ZERO DRAIN REVERSIBLE CORE'}
          </text>
        </svg>
      </div>
    );
  }

  // Growth Matrix / Comparative Scale fallback
  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center p-8 select-none ${className}`}>
      <div className="text-xl font-bold text-white mb-4">{headline || 'SCALABLE ARCHITECTURE'}</div>
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xs font-mono text-zinc-400">
          VON NEUMANN
        </div>
        <div className="text-2xl font-black" style={{ color: accentColor }}>➔</div>
        <div className="w-36 h-36 rounded-2xl border-2 flex flex-col items-center justify-center p-4 shadow-2xl" style={{ borderColor: accentColor, backgroundColor: `${accentColor}15` }}>
          <span className="text-sm font-black text-white">NEUROMORPHIC</span>
          <span className="text-xs font-mono font-bold mt-1" style={{ color: secondaryColor }}>10,000x BOOST</span>
        </div>
      </div>
    </div>
  );
};
