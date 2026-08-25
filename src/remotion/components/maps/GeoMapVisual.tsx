'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface MapMarker {
  id: string;
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  accentColor?: string;
  info?: string;
}

interface GeoMapVisualProps {
  markers?: MapMarker[];
  route?: { from: string; to: string };
  regionName?: string;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const GeoMapVisual: React.FC<GeoMapVisualProps> = ({
  markers = [
    { id: '1', label: 'San Francisco', x: 28, y: 44, accentColor: '#00c9a7', info: 'AI Innovation Hub' },
    { id: '2', label: 'Tokyo', x: 78, y: 48, accentColor: '#ffd166', info: 'Robotics Center' },
  ],
  regionName = 'Global Network',
  delay = 5,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spr = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 15, stiffness: 80, mass: 0.6 },
  });

  return (
    <div
      className={`relative w-full max-w-2xl aspect-[16/10] rounded-2xl bg-[#0d131f] border border-white/10 overflow-hidden shadow-2xl ${className}`}
      style={style}
    >
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Styled stylized continent SVG shapes */}
      <svg className="absolute inset-0 w-full h-full text-white/10" viewBox="0 0 800 500" fill="currentColor">
        {/* Americas stylized */}
        <path d="M120,80 Q180,100 200,160 Q220,240 180,320 Q220,400 240,480 Q190,440 150,380 Q100,280 90,180 Z" opacity="0.4" />
        <path d="M220,280 Q270,300 290,360 Q300,430 260,490 Q220,460 210,390 Z" opacity="0.4" />
        {/* Eurasia / Africa stylized */}
        <path d="M380,80 Q520,60 640,120 Q680,220 620,300 Q540,240 460,260 Q400,200 370,120 Z" opacity="0.4" />
        <path d="M400,240 Q490,250 510,340 Q480,440 430,460 Q380,380 390,290 Z" opacity="0.4" />
        {/* Asia / Pacific stylized */}
        <path d="M600,180 Q740,160 760,280 Q700,380 620,360 Q650,260 600,180 Z" opacity="0.4" />
      </svg>

      {/* Region label header */}
      <div className="absolute top-4 left-5 z-10">
        <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          GEO INTEL // {regionName}
        </div>
      </div>

      {/* Render Markers */}
      {markers.map((marker, idx) => {
        const markerDelay = delay + idx * 6;
        const mSpr = spring({
          frame: Math.max(0, frame - markerDelay),
          fps,
          config: { damping: 12, stiffness: 120, mass: 0.4 },
        });

        const color = marker.accentColor || '#00c9a7';

        return (
          <div
            key={marker.id}
            className="absolute z-20"
            style={{
              left: `${marker.x}%`,
              top: `${marker.y}%`,
              transform: `translate(-50%, -50%) scale(${mSpr})`,
              opacity: mSpr,
            }}
          >
            {/* Pulsing ring */}
            <div
              className="absolute -inset-3 rounded-full opacity-40 animate-ping"
              style={{ backgroundColor: color }}
            />
            {/* Center dot */}
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: color }}
            />
            {/* Label card */}
            <div
              className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-md bg-black/80 border border-white/20 text-[11px] font-bold text-white shadow-xl backdrop-blur-sm"
            >
              {marker.label}
              {marker.info && (
                <span className="block text-[9px] font-normal text-white/60">{marker.info}</span>
              )}
            </div>
          </div>
        );
      })}

      {/* Dynamic connecting line between first two markers */}
      {markers.length >= 2 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-15" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line
            x1={markers[0].x}
            y1={markers[0].y}
            x2={interpolate(spr, [0, 1], [markers[0].x, markers[1].x])}
            y2={interpolate(spr, [0, 1], [markers[0].y, markers[1].y])}
            stroke="#ffd166"
            strokeWidth="0.8"
            strokeDasharray="2 2"
            opacity="0.8"
          />
        </svg>
      )}
    </div>
  );
};
