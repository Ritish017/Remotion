'use client';

import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { getVisualLanguageRenderer } from '../visuals/VisualLanguageRegistry';
import { MatchCut } from '../transitions/MatchCut';
import { LayerStack } from './LayerStack';
import type { VisualBeat } from '@/lib/video-spec/visual';
import type { BrandDNA, SceneData } from '@/lib/video-spec/types';

export interface VisualBeatRendererProps {
  scene: SceneData;
  brand?: BrandDNA;
  motionSeed?: number;
}

export const VisualBeatRenderer: React.FC<VisualBeatRendererProps> = ({
  scene,
  brand,
  motionSeed = 42,
}) => {
  const beats = scene.visualBeats && scene.visualBeats.length > 0
    ? scene.visualBeats
    : [
        {
          id: `${scene.id}-b1`,
          startFrame: 0,
          durationInFrames: scene.durationFrames,
          narrativePurpose: scene.title,
          visualIntent: 'Default scene visual representation',
          primaryVisual: scene.visualLanguage || scene.type || 'editorial-paper',
          secondaryVisuals: [],
          assets: [],
          layers: ['background', 'subject', 'typography'],
          camera: { movement: 'push' as const, intensity: 0.2, easing: 'ease-out' as const, focalPoint: { x: 50, y: 50 } },
          motion: ['spring_in'],
          transition: { type: 'fade' as const, durationFrames: 10, sharedGeometry: 'none' as const, direction: 'right' as const },
          props: scene.props || {},
        },
      ];

  return (
    <AbsoluteFill className="w-full h-full">
      {beats.map((beat, idx) => {
        const RendererComponent = getVisualLanguageRenderer(beat.primaryVisual);
        const relativeFrom = beat.startFrame >= scene.startFrame
          ? beat.startFrame - scene.startFrame
          : beat.startFrame;

        return (
          <Sequence
            key={beat.id || `beat-${idx}`}
            from={relativeFrom}
            durationInFrames={beat.durationInFrames}
            name={`Beat ${idx + 1} (${beat.primaryVisual})`}
          >
            <AbsoluteFill className="w-full h-full">
              {/* Optional Match-cut transition */}
              {beat.transition?.type === 'match-cut' && (
                <MatchCut
                  geometry={beat.transition.sharedGeometry || 'chip'}
                  durationFrames={beat.transition.durationFrames || 12}
                  color={brand?.colors.accent || '#ffd166'}
                />
              )}

              {/* Multi-layer Stack with Parallax & Camera */}
              <LayerStack
                camera={beat.camera}
                durationInFrames={beat.durationInFrames}
                motionSeed={motionSeed + idx * 17}
                brand={brand}
                subject={
                  <RendererComponent
                    beat={beat}
                    scene={scene}
                    brand={brand}
                    durationInFrames={beat.durationInFrames}
                  />
                }
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
