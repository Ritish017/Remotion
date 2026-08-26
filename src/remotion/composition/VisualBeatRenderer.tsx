'use client';

import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { getVisualLanguageRenderer } from '../visuals/VisualLanguageRegistry';
import { MatchCut } from '../transitions/MatchCut';
import { OfficialTransitionOverlay } from '../transitions/OfficialTransitions';
import { LayerStack } from './LayerStack';
import { LaserScanBar } from '../visuals/primitives/LaserScanBar';
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
  const accentColor = brand?.colors.accent || '#ffc857';
  const mintColor = brand?.colors.secondary || '#64e2c5';

  const defaultBeat: VisualBeat = {
    id: `${scene.id}-b1`,
    beatIndex: 0,
    startFrame: 0,
    durationInFrames: scene.durationFrames,
    narrativePurpose: scene.title,
    visualIntent: 'Default scene visual representation',
    visualMetaphor: scene.visualMetaphor || 'Physical technological foundation',
    primaryVisual: scene.visualLanguage || scene.type || 'editorial-paper',
    secondaryVisuals: [],
    composition: {
      anchor: 'full-bleed',
      focalPoint: { x: 50, y: 50 },
      occupancyPct: 85,
      safeZoneRespect: true,
      negativeSpaceOrientation: 'top',
    },
    layerSpecs: [
      { id: `${scene.id}-b1-bg`, role: 'background', depth: 0.15, transform: { x: 0, y: 0, scale: 1.35, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
      { id: `${scene.id}-b1-sub`, role: 'subject', depth: 1.0, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
      { id: `${scene.id}-b1-typ`, role: 'typography', depth: 1.5, transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1, blurPx: 0 }, visible: true, customProps: {} },
    ],
    assets: [],
    layers: ['background', 'midground', 'subject', 'typography', 'editorialMarks'],
    camera: { movement: 'push', intensity: 0.22, easing: 'ease-out', focalPoint: { x: 50, y: 50 } },
    motion: ['spring_in', 'slow_drift'],
    motionChoreography: [],
    typography: {
      treatment: 'brutalist_display',
      headline: (scene.props?.headline || scene.title).toUpperCase(),
      position: 'top',
      fontScale: 'display_giant',
      emphasisWords: [],
    },
    transition: { type: 'fade', durationFrames: 10, sharedGeometry: 'none', direction: 'right' },
    props: scene.props || {},
  };

  const beats: VisualBeat[] = scene.visualBeats && scene.visualBeats.length > 0
    ? scene.visualBeats
    : [defaultBeat];

  return (
    <AbsoluteFill className="w-full h-full">
      {beats.map((beat, idx) => {
        const RendererComponent = getVisualLanguageRenderer(beat.primaryVisual);
        const relativeFrom = beat.startFrame >= scene.startFrame
          ? beat.startFrame - scene.startFrame
          : beat.startFrame;

        const hasScanMotion = beat.motion?.includes('laser_scan') || beat.emphasis?.action === 'laser_scan';

        return (
          <Sequence
            key={beat.id || `beat-${idx}`}
            from={relativeFrom}
            durationInFrames={beat.durationInFrames}
            name={`Beat ${idx + 1} (${beat.primaryVisual})`}
          >
            <AbsoluteFill className="w-full h-full">
              {/* Official & Custom Transitions */}
              {beat.transition?.type === 'match-cut' ? (
                <MatchCut
                  geometry={(beat.transition.sharedGeometry as any) || 'chip'}
                  durationFrames={beat.transition.durationFrames || 12}
                  color={accentColor}
                />
              ) : (
                beat.transition?.type && beat.transition.type !== 'none' && (
                  <OfficialTransitionOverlay
                    type={beat.transition.type as any}
                    durationFrames={beat.transition.durationFrames || 12}
                    direction={beat.transition.direction as any || 'right'}
                    color={accentColor}
                  />
                )
              )}

              {/* Multi-layer 2.5D Stack with Active Parallax & Camera Rig */}
              <LayerStack
                camera={beat.camera}
                durationInFrames={beat.durationInFrames}
                motionSeed={motionSeed + idx * 17}
                brand={brand}
                background={
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: '#090b10',
                      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(20, 25, 36, 0.6) 0%, #090b10 100%)',
                    }}
                  />
                }
                backgroundMid={
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0.12,
                      backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)`,
                      backgroundSize: '80px 80px',
                    }}
                  />
                }
                subject={
                  <RendererComponent
                    beat={beat}
                    scene={scene}
                    brand={brand}
                    durationInFrames={beat.durationInFrames}
                  />
                }
                foreground={
                  hasScanMotion ? (
                    <LaserScanBar
                      laserColor={mintColor}
                      durationInFrames={beat.durationInFrames}
                    />
                  ) : undefined
                }
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
