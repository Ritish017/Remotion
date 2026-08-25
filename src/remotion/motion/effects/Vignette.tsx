'use client';

import React from 'react';

interface VignetteProps {
  color?: string;
  opacity?: number;
}

export const Vignette: React.FC<VignetteProps> = ({
  color = '#000000',
  opacity = 0.45,
}) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-20"
      style={{
        background: `radial-gradient(ellipse at center, transparent 40%, ${color} 100%)`,
        opacity,
      }}
    />
  );
};
