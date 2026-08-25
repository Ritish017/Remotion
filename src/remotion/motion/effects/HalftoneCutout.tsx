'use client';

import React from 'react';
import { Img } from 'remotion';

interface HalftoneCutoutProps {
  src: string;
  alt?: string;
  accentGlow?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const HalftoneCutout: React.FC<HalftoneCutoutProps> = ({
  src,
  alt = 'Cutout',
  accentGlow = '#ffd166',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        filter: `drop-shadow(0 20px 30px rgba(0,0,0,0.7)) drop-shadow(0 0 40px ${accentGlow}33)`,
        ...style,
      }}
    >
      <Img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        style={{
          maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
        }}
      />
    </div>
  );
};
