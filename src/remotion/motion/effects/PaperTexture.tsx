'use client';

import React from 'react';

interface PaperTextureProps {
  opacity?: number;
}

export const PaperTexture: React.FC<PaperTextureProps> = ({ opacity = 0.08 }) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-30 mix-blend-overlay"
      style={{
        opacity,
        backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#000000 1px, transparent 1px)`,
        backgroundSize: '24px 24px, 12px 12px',
        backgroundPosition: '0 0, 6px 6px',
      }}
    />
  );
};
