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
  | 'MATCH_CUT'
  | 'KINETIC_WORD_BURST'
  | 'PERSPECTIVE_TRAVEL'
  | 'MECHANICAL_ASSEMBLY'
  | 'DATA_PROPAGATION'
  | 'MAP_CORRIDOR_TRAVEL'
  | 'CHART_TRANSFORMATION'
  | 'PARTICLE_FLOW'
  | 'SIGNAL_PROPAGATION'
  | 'LASER_SWEEP'
  | 'LIGHT_SWEEP'
  | 'DOCUMENTARY_WHIP'
  | 'RACK_FOCUS_SIMULATION';

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
  let filter = '';
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
      const scaleVal = interpolate(s, [0, 1], [1.35, 1.0]);
      transform = `scale(${scaleVal})`;
      opacity = interpolate(s, [0, 1], [0, 1]);
      break;
    }

    case 'KINETIC_WORD_BURST': {
      const wordScale = interpolate(s, [0, 0.5, 1], [0.6, 1.15, 1.0]);
      transform = `scale(${wordScale})`;
      opacity = interpolate(s, [0, 0.2], [0, 1]);
      break;
    }

    case 'CAMERA_PUSH': {
      const scalePush = interpolate(linearT, [0, 1], [1.0, 1.0 + 0.16 * intensity]);
      transform = `scale(${scalePush})`;
      break;
    }

    case 'CAMERA_PULL': {
      const scalePull = interpolate(linearT, [0, 1], [1.0 + 0.16 * intensity, 1.0]);
      transform = `scale(${scalePull})`;
      break;
    }

    case 'PARALLAX_TRAVEL': {
      const xTravel = interpolate(linearT, [0, 1], [-30 * intensity, 30 * intensity]);
      transform = `translateX(${xTravel}px)`;
      break;
    }

    case 'PERSPECTIVE_TRAVEL': {
      const zMove = interpolate(linearT, [0, 1], [-100 * intensity, 50 * intensity]);
      transform = `perspective(1000px) translateZ(${zMove}px)`;
      break;
    }

    case 'MECHANICAL_ASSEMBLY': {
      const transY = interpolate(s, [0, 1], [120 * intensity, 0]);
      const rot = interpolate(s, [0, 1], [-8 * intensity, 0]);
      transform = `translateY(${transY}px) rotate(${rot}deg)`;
      opacity = interpolate(s, [0, 1], [0, 1]);
      break;
    }

    case 'DATA_PROPAGATION': {
      const glowScale = interpolate(s, [0, 0.5, 1], [0.95, 1.08, 1.0]);
      transform = `scale(${glowScale})`;
      opacity = interpolate(s, [0, 1], [0.2, 1]);
      break;
    }

    case 'CHART_TRANSFORMATION': {
      const barScale = interpolate(s, [0, 1], [0.1, 1.0]);
      transform = `scaleY(${barScale})`;
      break;
    }

    case 'DEPTH_SHIFT': {
      const zScale = interpolate(linearT, [0, 1], [0.95, 1.08 * intensity]);
      transform = `scale(${zScale})`;
      break;
    }

    case 'ORBIT': {
      const angle = interpolate(linearT, [0, 1], [-2.5 * intensity, 2.5 * intensity]);
      transform = `rotate(${angle}deg) scale(1.04)`;
      break;
    }

    case 'ZOOM_THROUGH': {
      const zoom = interpolate(linearT, [0, 1], [1.0, 2.0 * intensity]);
      transform = `scale(${zoom})`;
      opacity = interpolate(linearT, [0.65, 1], [1, 0]);
      break;
    }

    case 'DOCUMENTARY_WHIP': {
      const whipX = interpolate(s, [0, 0.4, 1], [0, -300 * intensity, 0]);
      transform = `translateX(${whipX}px)`;
      filter = `blur(${interpolate(s, [0, 0.3, 0.8, 1], [0, 12, 4, 0])}px)`;
      break;
    }

    case 'RACK_FOCUS_SIMULATION': {
      const blurVal = interpolate(linearT, [0, 0.5, 1], [0, 8 * intensity, 0]);
      filter = `blur(${blurVal}px)`;
      break;
    }

    case 'LIGHT_SWEEP': {
      const sweepX = interpolate(linearT, [0, 1], [-100, 100]);
      transform = `translateX(${sweepX * intensity}px)`;
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
        filter: filter || undefined,
        transformOrigin: 'center center',
        willChange: 'transform, opacity, filter',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
