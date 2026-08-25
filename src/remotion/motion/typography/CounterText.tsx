'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface CounterTextProps {
  targetValue: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
  durationFrames?: number;
  fontSize?: number | string;
  fontWeight?: string | number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CounterText: React.FC<CounterTextProps> = ({
  targetValue,
  prefix = '',
  suffix = '',
  decimals = 0,
  delay = 0,
  durationFrames = 45,
  fontSize = '4.5rem',
  fontWeight = 900,
  color = '#ffd166',
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progressFrame = Math.max(0, frame - delay);
  const spr = spring({
    frame: progressFrame,
    fps,
    config: { damping: 18, stiffness: 80, mass: 0.8 },
  });

  const animatedValue = interpolate(
    spr,
    [0, 1],
    [0, targetValue],
    { extrapolateRight: 'clamp' }
  );

  const formattedNumber = decimals > 0 
    ? animatedValue.toFixed(decimals)
    : Math.round(animatedValue).toLocaleString();

  return (
    <div
      className={`font-mono tracking-tight ${className}`}
      style={{
        fontSize,
        fontWeight,
        color,
        ...style,
      }}
    >
      <span className="opacity-80 text-[0.7em] mr-1">{prefix}</span>
      <span>{formattedNumber}</span>
      <span className="opacity-80 text-[0.7em] ml-1">{suffix}</span>
    </div>
  );
};
