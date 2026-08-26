'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export type EditorialMarkType = 
  | 'marker_circle'
  | 'marker_underline'
  | 'arrow_pointer'
  | 'measurement_callout'
  | 'verification_stamp'
  | 'highlighter_box'
  | 'tape_strip';

export interface EditorialMarkProps {
  type: EditorialMarkType;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  rotation?: number;
  delayFrames?: number;
  durationFrames?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const EditorialMarks: React.FC<EditorialMarkProps> = ({
  type,
  x = 0,
  y = 0,
  width = 200,
  height = 100,
  color = '#ef4444',
  label,
  sublabel,
  rotation = 0,
  delayFrames = 0,
  durationFrames = 30,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progressFrame = Math.max(0, frame - delayFrames);
  const drawSpring = spring({
    frame: progressFrame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const renderContent = () => {
    switch (type) {
      case 'marker_circle': {
        const pathLength = 380;
        const dashOffset = interpolate(drawSpring, [0, 1], [pathLength, 0]);
        return (
          <svg
            width={width}
            height={height}
            viewBox="0 0 200 100"
            style={{ overflow: 'visible' }}
          >
            <path
              d="M 25,50 C 25,20 175,20 175,50 C 175,80 25,80 20,45"
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={dashOffset}
              style={{ filter: 'drop-shadow(0 2px 8px rgba(239,68,68,0.4))' }}
            />
            {label && (
              <text
                x="100"
                y="-10"
                fill={color}
                fontSize="14"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
                textAnchor="middle"
                opacity={drawSpring}
              >
                {label}
              </text>
            )}
          </svg>
        );
      }

      case 'marker_underline': {
        const pathLength = 300;
        const dashOffset = interpolate(drawSpring, [0, 1], [pathLength, 0]);
        return (
          <svg
            width={width}
            height={height}
            viewBox="0 0 300 40"
            style={{ overflow: 'visible' }}
          >
            <path
              d="M 5,20 Q 150,32 295,18"
              fill="none"
              stroke={color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={dashOffset}
              style={{ filter: 'drop-shadow(0 2px 6px rgba(239,68,68,0.5))' }}
            />
          </svg>
        );
      }

      case 'arrow_pointer': {
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: drawSpring,
              transform: `scale(${drawSpring})`,
              transformOrigin: 'left center',
            }}
          >
            <svg width="48" height="24" viewBox="0 0 48 24">
              <path
                d="M 4,12 L 40,12 M 30,4 L 42,12 L 30,20"
                fill="none"
                stroke={color}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {label && (
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 800,
                  fontSize: '13px',
                  color: color,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </span>
            )}
          </div>
        );
      }

      case 'measurement_callout': {
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              border: `1.5px solid ${color}`,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              opacity: drawSpring,
              transform: `translateY(${interpolate(drawSpring, [0, 1], [15, 0])}px) scale(${drawSpring})`,
            }}
          >
            <div
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 900,
                fontSize: '15px',
                color: '#ffffff',
              }}
            >
              {label || 'METRIC // 3NM'}
            </div>
            {sublabel && (
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 600,
                  fontSize: '12px',
                  color: color,
                }}
              >
                {sublabel}
              </div>
            )}
          </div>
        );
      }

      case 'verification_stamp': {
        return (
          <div
            style={{
              border: `2.5px solid ${color}`,
              borderRadius: '6px',
              padding: '6px 14px',
              color: color,
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 900,
              fontSize: '14px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              boxShadow: `0 8px 20px ${color}33`,
              transform: `rotate(${rotation || 6}deg) scale(${drawSpring})`,
              opacity: drawSpring,
              display: 'inline-block',
            }}
          >
            {label || 'VERIFIED // 2026'}
          </div>
        );
      }

      case 'highlighter_box': {
        const scaleX = interpolate(drawSpring, [0, 1], [0, 1]);
        return (
          <div
            style={{
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: `${color}33`,
              border: `1.5px dashed ${color}`,
              borderRadius: '6px',
              transformOrigin: 'left center',
              transform: `scaleX(${scaleX})`,
              opacity: drawSpring,
              position: 'relative',
            }}
          >
            {label && (
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '4px',
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: color,
                  fontWeight: 800,
                }}
              >
                {label}
              </div>
            )}
          </div>
        );
      }

      case 'tape_strip': {
        return (
          <div
            style={{
              width: `${width}px`,
              height: '24px',
              backgroundColor: 'rgba(254, 243, 199, 0.45)',
              border: '1px solid rgba(253, 230, 138, 0.5)',
              backdropFilter: 'blur(8px)',
              borderRadius: '2px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
              transform: `rotate(${rotation || -2}deg) scale(${drawSpring})`,
              opacity: drawSpring,
            }}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      className={`select-none pointer-events-none ${className}`}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: 35,
        ...style,
      }}
    >
      {renderContent()}
    </div>
  );
};
