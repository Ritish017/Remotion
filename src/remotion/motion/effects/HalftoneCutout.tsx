'use client';

import React, { useState } from 'react';

interface HalftoneCutoutProps {
  src?: string;
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
  const [hasError, setHasError] = useState(false);

  // If no valid src or if error occurred, render vector cyber-cutout silhouette
  const showFallback = !src || hasError;

  return (
    <div
      className={`relative inline-block w-full h-full ${className}`}
      style={{
        filter: `drop-shadow(0 20px 30px rgba(0,0,0,0.7)) drop-shadow(0 0 40px ${accentGlow}33)`,
        ...style,
      }}
    >
      {!showFallback ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-contain"
          style={{
            maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-4">
          <svg
            viewBox="0 0 300 420"
            className="w-full h-full max-h-[480px] drop-shadow-2xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ambient Background Glow */}
            <circle cx="150" cy="180" r="120" fill={`${accentGlow}15`} filter="blur(20px)" />
            
            {/* Cyber Cutout Subject Silhouette */}
            <path
              d="M150 40 C175 40 195 60 195 85 C195 105 180 125 150 130 C120 125 105 105 105 85 C105 60 125 40 150 40 Z"
              fill="#181c28"
              stroke={accentGlow}
              strokeWidth="2.5"
            />
            {/* Head Visor Glow */}
            <path d="M125 80 Q150 88 175 80" stroke="#00c9a7" strokeWidth="3" strokeLinecap="round" />
            
            {/* Torso & Shoulder Plating */}
            <path
              d="M100 145 C70 170 65 240 60 380 L240 380 C235 240 230 170 200 145 C185 155 165 160 150 160 C135 160 115 155 100 145 Z"
              fill="#11141e"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="2"
            />
            
            {/* Neural Core / Heart */}
            <circle cx="150" cy="220" r="28" fill={`${accentGlow}20`} stroke={accentGlow} strokeWidth="2" />
            <circle cx="150" cy="220" r="14" fill={accentGlow} />
            
            {/* Circuit Line Accents */}
            <path d="M150 160 L150 192" stroke={accentGlow} strokeWidth="2" strokeDasharray="3 3" />
            <path d="M122 220 L75 220 L65 260" stroke="#00c9a7" strokeWidth="2" strokeLinecap="round" />
            <path d="M178 220 L225 220 L235 260" stroke="#00c9a7" strokeWidth="2" strokeLinecap="round" />
            <path d="M150 248 L150 340" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          </svg>
        </div>
      )}
    </div>
  );
};
