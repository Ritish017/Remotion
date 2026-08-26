'use client';

import React from 'react';

export interface HalftoneProcessorProps {
  src: string;
  dotSize?: number;
  duotone?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  contrast?: number;
  brightness?: number;
  offsetShadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const HalftoneProcessor: React.FC<HalftoneProcessorProps> = ({
  src,
  dotSize = 4,
  duotone = true,
  primaryColor = '#ffd166',
  secondaryColor = '#0b0d13',
  contrast = 1.35,
  brightness = 0.95,
  offsetShadow = true,
  shadowColor = 'rgba(0, 0, 0, 0.85)',
  shadowBlur = 35,
  alt = 'Editorial Cutout',
  className = '',
  style = {},
}) => {
  const filterId = `halftone-${dotSize}-${Math.round(contrast * 10)}`;

  return (
    <div
      className={`relative select-none ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        filter: offsetShadow ? `drop-shadow(0 20px ${shadowBlur}px ${shadowColor})` : undefined,
        ...style,
      }}
    >
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values={`
                0.33 0.33 0.33 0 0
                0.33 0.33 0.33 0 0
                0.33 0.33 0.33 0 0
                0    0    0    1 0
              `}
              result="grayscale"
            />
            <feComponentTransfer in="grayscale" result="contrasted">
              <feFuncR type="linear" slope={contrast} intercept={-0.15} />
              <feFuncG type="linear" slope={contrast} intercept={-0.15} />
              <feFuncB type="linear" slope={contrast} intercept={-0.15} />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      {/* Processed Cutout Image with Halftone SVG Matrix */}
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          filter: `url(#${filterId}) brightness(${brightness})`,
          mixBlendMode: 'normal',
        }}
      />

      {/* Duotone Color Tint Overlay if enabled */}
      {duotone && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${primaryColor}25 0%, transparent 60%, ${secondaryColor}80 100%)`,
            mixBlendMode: 'color-dodge',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};
