'use client';

import React from 'react';
import { useCurrentFrame } from 'remotion';

interface GrainOverlayProps {
  intensity?: number;
}

export const GrainOverlay: React.FC<GrainOverlayProps> = ({ intensity = 0.08 }) => {
  const frame = useCurrentFrame();
  const shiftX = (frame * 17) % 100;
  const shiftY = (frame * 23) % 100;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30 opacity-70 mix-blend-screen"
      style={{
        opacity: intensity,
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0.5px, transparent 1px)`,
        backgroundSize: '4px 4px',
        transform: `translate(${shiftX}px, ${shiftY}px)`,
      }}
    />
  );
};
