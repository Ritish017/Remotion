'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { BrandDNA } from '@/lib/video-spec/types';

export interface MapStoryProps {
  headline?: string;
  subhead?: string;
  region?: string;
  markers?: Array<{ id: string; label: string; x: number; y: number; info?: string; active?: boolean }>;
  routes?: Array<{ from: string; to: string; label?: string }>;
  brand?: BrandDNA;
  durationInFrames: number;
  className?: string;
  style?: React.CSSProperties;
}

export const MapStory: React.FC<MapStoryProps> = ({
  headline = 'GLOBAL SILICON ACCELERATION',
  subhead = 'Transcontinental Neuromorphic Development Corridor',
  region = 'TRANSCONTINENTAL CORRIDOR',
  markers = [
    { id: 'taiwan', label: 'Taiwan (TSMC)', x: 78, y: 52, info: '3nm Wafer Fab Hub', active: true },
    { id: 'sv', label: 'Silicon Valley', x: 24, y: 38, info: 'Neural Architecture Cluster', active: true },
    { id: 'europe', label: 'Munich (ASML / Zeiss)', x: 48, y: 30, info: 'EUV Optics Center', active: true },
  ],
  routes = [
    { from: 'europe', to: 'taiwan', label: 'High-NA Lithography Optics' },
    { from: 'taiwan', to: 'sv', label: 'Sub-3nm Silicon Shipments' },
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
  const pulsePhase = (frame * 0.12) % (Math.PI * 2);

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
      {/* Top Header */}
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
            backgroundColor: 'rgba(20, 184, 166, 0.15)',
            border: '1px solid rgba(20, 184, 166, 0.35)',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.1em',
            color: '#2dd4bf',
            marginBottom: '10px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '9999px',
              backgroundColor: '#2dd4bf',
              display: 'inline-block',
            }}
          />
          GEOGRAPHIC INTELLIGENCE // {region}
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

      {/* Center World Geo Visualizer - Large Canvas */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '750px',
          margin: 'auto 0',
          borderRadius: '32px',
          backgroundColor: 'rgba(15, 19, 29, 0.94)',
          border: '2px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
          overflow: 'hidden',
          padding: '24px',
          boxSizing: 'border-box',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* World Grid Matrix */}
        <svg viewBox="0 0 1000 600" style={{ width: '100%', height: '100%' }}>
          <defs>
            <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0b0d13" stopOpacity="0.98" />
            </radialGradient>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={secondaryColor} />
              <stop offset="50%" stopColor={accentColor} />
              <stop offset="100%" stopColor={primaryColor} />
            </linearGradient>
            <filter id="nodeGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="1000" height="600" fill="url(#mapGlow)" rx="20" />

          {/* Latitude & Longitude Coordinate Lines */}
          <g opacity="0.10" stroke="#ffffff" strokeWidth="1">
            <line x1="0" y1="150" x2="1000" y2="150" strokeDasharray="6 6" />
            <line x1="0" y1="300" x2="1000" y2="300" strokeDasharray="6 6" />
            <line x1="0" y1="450" x2="1000" y2="450" strokeDasharray="6 6" />
            <line x1="250" y1="0" x2="250" y2="600" strokeDasharray="6 6" />
            <line x1="500" y1="0" x2="500" y2="600" strokeDasharray="6 6" />
            <line x1="750" y1="0" x2="750" y2="600" strokeDasharray="6 6" />
          </g>

          {/* Continents Vector Silhouettes */}
          {/* North America */}
          <path
            d="M120,120 Q180,90 280,110 T320,240 T220,380 T140,240 Z"
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="2"
          />
          {/* Europe & Asia */}
          <path
            d="M440,110 Q560,70 780,90 T900,240 T720,400 T520,340 T440,180 Z"
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="2"
          />

          {/* Connecting Routes with Animated Pulses */}
          {routes.map((route, idx) => {
            const m1 = markers.find((m) => m.id === route.from);
            const m2 = markers.find((m) => m.id === route.to);
            if (!m1 || !m2) return null;

            const x1 = m1.x * 10;
            const y1 = m1.y * 6;
            const x2 = m2.x * 10;
            const y2 = m2.y * 6;

            const midX = (x1 + x2) / 2;
            const midY = Math.min(y1, y2) - 80;

            const routeSpring = spring({ frame: frame - 8 - idx * 8, fps, config: { damping: 14, stiffness: 80 } });

            return (
              <g key={idx}>
                <path
                  d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                  fill="none"
                  stroke="url(#routeGrad)"
                  strokeWidth="4"
                  strokeDasharray="10 8"
                  opacity={interpolate(routeSpring, [0, 1], [0, 0.95])}
                />
                {route.label && (
                  <text
                    x={midX}
                    y={midY - 14}
                    fill={accentColor}
                    fontSize="13"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    opacity={interpolate(routeSpring, [0, 1], [0, 1])}
                  >
                    {route.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Geo Markers */}
          {markers.map((m, idx) => {
            const markerSpring = spring({ frame: frame - idx * 6, fps, config: { damping: 12, stiffness: 100 } });
            const cx = m.x * 10;
            const cy = m.y * 6;

            return (
              <g
                key={m.id}
                transform={`translate(${cx}, ${cy}) scale(${markerSpring})`}
              >
                {/* Outer Concentric Radar Waves */}
                <circle
                  r={26 + Math.sin(pulsePhase + idx) * 10}
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="2.5"
                  opacity={0.6 + Math.sin(pulsePhase + idx) * 0.4}
                />
                <circle
                  r={44 + Math.sin(pulsePhase + idx) * 14}
                  fill="none"
                  stroke={secondaryColor}
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                  opacity={0.4}
                />

                {/* Center Node Bulb */}
                <circle
                  r="12"
                  fill={accentColor}
                  stroke="#000000"
                  strokeWidth="3"
                  filter="url(#nodeGlow)"
                />

                {/* Marker Card Tag */}
                <g transform="translate(22, -26)">
                  <rect
                    width="220"
                    height="54"
                    rx="10"
                    fill="#161922"
                    stroke="rgba(255,255,255,0.30)"
                    strokeWidth="2"
                    filter="url(#nodeGlow)"
                  />
                  <text x="14" y="24" fill="#ffffff" fontSize="15" fontWeight="900" fontFamily="Inter, system-ui, sans-serif">
                    {m.label}
                  </text>
                  <text x="14" y="42" fill={secondaryColor} fontSize="12" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                    {m.info || 'ACTIVE SOVEREIGN NODE'}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Telemetry Status */}
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
        <span>GLOBAL TRANSIT CORRIDOR // TSMC 3NM</span>
        <span style={{ color: secondaryColor }}>FABRICATION ALLIANCE ACTIVE</span>
      </div>
    </div>
  );
};
