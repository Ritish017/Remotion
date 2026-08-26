'use client';

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export type SemanticMotionType =
  | 'SPRING_IN'
  | 'SPRING_OUT'
  | 'STAGGER_REVEAL'
  | 'CAMERA_PUSH'
  | 'CAMERA_PULL'
  | 'PARALLAX_TRAVEL'
  | 'SUBJECT_REVEAL'
  | 'MASK_REVEAL'
  | 'TEXT_TAKEOVER'
  | 'MARKER_DRAW'
  | 'IMAGE_SLIDE'
  | 'FOREGROUND_WIPE'
  | 'DEPTH_SHIFT'
  | 'ORBIT'
  | 'ZOOM_THROUGH'
  | 'MATCH_CUT';

export interface SemanticMotionProps {
  type: SemanticMotionType;
  delayFrames?: number;
  durationFrames?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  intensity?: number;
  stiffness?: number;
  damping?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const SemanticMotion: React.FC<SemanticMotionProps> = ({
  type,
  delayFrames = 0,
  durationFrames = 30,
  direction = 'up',
  intensity = 1.0,
  stiffness = 100,
  damping = 14,
  children,
  className = '',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progressFrame = Math.max(0, frame - delayFrames);
  const s = spring({
    frame: progressFrame,
    fps,
    config: { damping, stiffness },
  });

  const linearT = Math.min(1, Math.max(0, progressFrame / Math.max(1, durationFrames)));

  let transform = '';
  let opacity = 1;
  let clipPath = undefined;

  switch (type) {
    case 'SPRING_IN': {
      const offset = 60 * intensity;
      if (direction === 'up') {
        transform = `translateY(${interpolate(s, [0, 1], [offset, 0])}px) scale(${interpolate(s, [0, 1], [0.92, 1])})`;
      } else if (direction === 'down') {
        transform = `translateY(${interpolate(s, [0, 1], [-offset, 0])}px) scale(${interpolate(s, [0, 1], [0.92, 1])})`;
      } else if (direction === 'left') {
        transform = `translateX(${interpolate(s, [0, 1], [offset, 0])}px) scale(${interpolate(s, [0, 1], [0.92, 1])})`;
      } else if (direction === 'right') {
        transform = `translateX(${interpolate(s, [0, 1], [-offset, 0])}px) scale(${interpolate(s, [0, 1], [0.92, 1])})`;
      } else {
        transform = `scale(${interpolate(s, [0, 1], [0.75, 1])})`;
      }
      opacity = interpolate(s, [0, 1], [0, 1]);
      break;
    }

    case 'SPRING_OUT': {
      const offset = 40 * intensity;
      transform = `translateY(${interpolate(linearT, [0, 1], [0, -offset])}px) scale(${interpolate(linearT, [0, 1], [1, 0.95])})`;
      opacity = interpolate(linearT, [0, 1], [1, 0]);
      break;
    }

    case 'STAGGER_REVEAL': {
      transform = `translateY(${interpolate(s, [0, 1], [30 * intensity, 0])}px)`;
      opacity = interpolate(s, [0, 1], [0, 1]);
      break;
    }

    case 'SUBJECT_REVEAL': {
      transform = `translateY(${interpolate(s, [0, 1], [80 * intensity, 0])}px) scale(${interpolate(s, [0, 1], [0.88, 1])})`;
      opacity = interpolate(s, [0, 1], [0, 1]);
      break;
    }

    case 'MASK_REVEAL': {
      const maskPct = interpolate(s, [0, 1], [0, 100]);
      clipPath = `polygon(0 0, ${maskPct}% 0, ${maskPct}% 100%, 0 100%)`;
      break;
    }

    case 'TEXT_TAKEOVER': {
      const scaleVal = interpolate(s, [0, 1], [1.25, 1.0]);
      transform = `scale(${scaleVal})`;
      opacity = interpolate(s, [0, 1], [0, 1]);
      break;
    }

    case 'CAMERA_PUSH': {
      const scalePush = interpolate(linearT, [0, 1], [1.0, 1.0 + 0.12 * intensity]);
      transform = `scale(${scalePush})`;
      break;
    }

    case 'CAMERA_PULL': {
      const scalePull = interpolate(linearT, [0, 1], [1.0 + 0.12 * intensity, 1.0]);
      transform = `scale(${scalePull})`;
      break;
    }

    case 'PARALLAX_TRAVEL': {
      const xTravel = interpolate(linearT, [0, 1], [-25 * intensity, 25 * intensity]);
      transform = `translateX(${xTravel}px)`;
      break;
    }

    case 'DEPTH_SHIFT': {
      const zScale = interpolate(linearT, [0, 1], [0.95, 1.05 * intensity]);
      transform = `scale(${zScale})`;
      break;
    }

    case 'ORBIT': {
      const angle = interpolate(linearT, [0, 1], [-2 * intensity, 2 * intensity]);
      transform = `rotate(${angle}deg) scale(1.04)`;
      break;
    }

    case 'ZOOM_THROUGH': {
      const zoom = interpolate(linearT, [0, 1], [1.0, 1.8 * intensity]);
      transform = `scale(${zoom})`;
      opacity = interpolate(linearT, [0.7, 1], [1, 0]);
      break;
    }

    case 'MATCH_CUT':
    default:
      opacity = interpolate(s, [0, 1], [0, 1]);
      break;
  }

  return (
    <div
      className={className}
      style={{
        transform,
        opacity,
        clipPath,
        transformOrigin: 'center center',
        willChange: 'transform, opacity',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
