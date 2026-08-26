'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { BrandDNA } from '@/lib/video-spec/types';

export interface TechnicalDiagramProps {
  headline?: string;
  subhead?: string;
  diagramType?: 'neuromorphic-circuit' | 'memory-logic-bus' | 'neural-network' | 'energy-flow';
  nodes?: Array<{ id: string; label: string; sublabel?: string; x: number; y: number; highlighted?: boolean }>;
  connections?: Array<{ from: string; to: string; label?: string; flowSpeed?: number }>;
  brand?: BrandDNA;
  durationInFrames: number;
  className?: string;
  style?: React.CSSProperties;
}

export const TechnicalDiagram: React.FC<TechnicalDiagramProps> = ({
  headline = 'OPTICAL INTERCONNECT & WAFER LOGIC MATRIX',
  subhead = 'Direct-to-Die Co-Packaged Optics & Sub-Nanosecond Latency Core',
  diagramType = 'memory-logic-bus',
  nodes = [
    { id: 'optics', label: 'Co-Packaged Optics', sublabel: '25.6 Tbps Bandwidth', x: 25, y: 50, highlighted: true },
    { id: 'logic', label: '3nm Compute Cores', sublabel: 'Direct Gate Layer', x: 75, y: 50, highlighted: true },
    { id: 'sram', label: 'In-Memory SRAM', sublabel: 'Zero Transit Loss', x: 50, y: 25, highlighted: false },
    { id: 'thermal', label: 'Liquid Thermal Matrix', sublabel: 'Sub-40°C Direct Cooling', x: 50, y: 75, highlighted: false },
  ],
  connections = [
    { from: 'optics', to: 'logic', label: 'Ultra-Low Latency Bus' },
    { from: 'sram', to: 'logic', label: 'High-Density Interconnect' },
    { from: 'thermal', to: 'logic', label: 'Thermodynamic Dissipation' },
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
  const pulsePhase = (frame * 0.1) % (Math.PI * 2);

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
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.1em',
            color: '#60a5fa',
            marginBottom: '10px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '9999px',
              backgroundColor: '#60a5fa',
              display: 'inline-block',
            }}
          />
          TECHNICAL SCHEMATIC // HARDWARE ARCHITECTURE
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

      {/* Center Interactive SVG Diagram */}
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg viewBox="0 0 1000 600" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="busGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.9" />
            </linearGradient>
            <filter id="diagramGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <pattern id="techGrid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </pattern>
          <rect width="1000" height="600" fill="url(#techGrid)" rx="20" />

          {/* Connections */}
          {connections.map((conn, idx) => {
            const fromNode = nodes.find((n) => n.id === conn.from);
            const toNode = nodes.find((n) => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            const x1 = fromNode.x * 10;
            const y1 = fromNode.y * 6.0;
            const x2 = toNode.x * 10;
            const y2 = toNode.y * 6.0;

            const packetT = ((frame * 2.5 + idx * 35) % 100) / 100;
            const packetX = interpolate(packetT, [0, 1], [x1, x2]);
            const packetY = interpolate(packetT, [0, 1], [y1, y2]);

            return (
              <g key={idx}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#busGrad)"
                  strokeWidth="4.5"
                  strokeDasharray="10 8"
                  opacity="0.85"
                />
                <circle
                  cx={packetX}
                  cy={packetY}
                  r="9"
                  fill={accentColor}
                  filter="url(#diagramGlow)"
                />
                {conn.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 16}
                    fill="#e2e8f0"
                    fontSize="13"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {conn.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node, idx) => {
            const nodeSpring = spring({ frame: frame - idx * 5, fps, config: { damping: 12, stiffness: 110 } });
            const cx = node.x * 10;
            const cy = node.y * 6.0;
            const isHigh = node.highlighted;

            return (
              <g
                key={node.id}
                transform={`translate(${cx}, ${cy}) scale(${nodeSpring})`}
              >
                <circle
                  r={isHigh ? 64 : 52}
                  fill="#161922"
                  stroke={isHigh ? accentColor : '#475569'}
                  strokeWidth={isHigh ? '4' : '2.5'}
                  filter={isHigh ? 'url(#diagramGlow)' : undefined}
                />
                {isHigh && (
                  <circle
                    r={64 + Math.sin(pulsePhase) * 12}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth="2.5"
                    opacity={0.5 + Math.sin(pulsePhase) * 0.4}
                  />
                )}
                <text
                  y="-6"
                  fill="#ffffff"
                  fontSize="16"
                  fontWeight="900"
                  fontFamily="Inter, system-ui, sans-serif"
                  textAnchor="middle"
                >
                  {node.label}
                </text>
                {node.sublabel && (
                  <text
                    y="18"
                    fill={isHigh ? secondaryColor : '#94a3b8'}
                    fontSize="12"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {node.sublabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Status */}
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
        <span>CIRCUIT INTEGRATION // 3NM CO-PACKAGED OPTICS</span>
        <span style={{ color: secondaryColor }}>ZERO DATA BUS BOTTLENECK</span>
      </div>
    </div>
  );
};
