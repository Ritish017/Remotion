'use client';

import React from 'react';
import { CinematicImage } from './CinematicImage';
import { EditorialCollage } from './EditorialCollage';
import { TechnicalDiagram } from './TechnicalDiagram';
import { DataStory } from './DataStory';
import { MapStory } from './MapStory';
import { HookScene } from '../scenes/HookScene';
import { EditorialScene } from '../scenes/EditorialScene';
import { ChartScene } from '../scenes/ChartScene';
import { MapScene } from '../scenes/MapScene';
import { CutoutScene } from '../scenes/CutoutScene';
import { StatisticScene } from '../scenes/StatisticScene';
import { PhotoScene } from '../scenes/PhotoScene';
import { TimelineScene } from '../scenes/TimelineScene';
import { ComparisonScene } from '../scenes/ComparisonScene';
import { UIExplainerScene } from '../scenes/UIExplainerScene';
import { OutroScene } from '../scenes/OutroScene';
import { ThreeDScene } from './ThreeDScene';
import type { VisualBeat } from '@/lib/video-spec/visual';
import type { BrandDNA, SceneData } from '@/lib/video-spec/types';

export interface VisualLanguageRendererProps {
  beat: VisualBeat;
  scene: SceneData;
  brand?: BrandDNA;
  durationInFrames: number;
}

export const VISUAL_LANGUAGE_REGISTRY: Record<string, React.FC<VisualLanguageRendererProps>> = {
  'cinematic-photo': ({ beat, scene, brand, durationInFrames }) => (
    <CinematicImage
      src={beat.assets[0]?.url || beat.props?.imageUrl || scene.props?.imageUrl}
      headline={beat.typography?.headline || scene.props?.headline || scene.title}
      subhead={beat.narrativePurpose || scene.props?.subtext}
      treatment="cinematic_macro"
      animation="slow-push"
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'hero-photographic': ({ beat, scene, brand, durationInFrames }) => (
    <CinematicImage
      src={beat.assets[0]?.url || beat.props?.imageUrl || scene.props?.imageUrl}
      headline={beat.typography?.headline || scene.props?.headline || scene.title}
      subhead={beat.narrativePurpose || scene.props?.subtext}
      treatment="cinematic_macro"
      animation="slow-push"
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'archival-photo': ({ beat, scene, brand, durationInFrames }) => (
    <CinematicImage
      src={beat.assets[0]?.url || beat.props?.imageUrl || scene.props?.imageUrl}
      headline={beat.typography?.headline || scene.title}
      subhead={beat.narrativePurpose}
      treatment="archival_grain"
      animation="ken-burns"
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'macro-detail': ({ beat, scene, brand, durationInFrames }) => (
    <CinematicImage
      src={beat.assets[0]?.url || beat.props?.imageUrl || scene.props?.imageUrl}
      treatment="cinematic_macro"
      animation="pan-diagonal"
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'product-hero': ({ beat, scene, brand, durationInFrames }) => (
    <CinematicImage
      src={beat.assets[0]?.url || beat.props?.imageUrl || scene.props?.imageUrl}
      treatment="duotone_editorial"
      animation="slow-push"
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'editorial-paper': ({ beat, scene, brand, durationInFrames }) => (
    <EditorialCollage
      headline={beat.typography?.headline || scene.title}
      subhead={beat.narrativePurpose || 'Archival Technical Investigation'}
      sourceTag={beat.props?.sourceTag || 'CATALYST ARCHIVE // 2026'}
      cards={beat.props?.cards}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'archival-newspaper': ({ beat, scene, brand, durationInFrames }) => (
    <EditorialCollage
      headline={beat.typography?.headline || scene.title}
      subhead={beat.narrativePurpose || 'Declassified Engineering Analysis'}
      sourceTag="HISTORICAL ARCHIVE // 2026"
      cards={beat.props?.cards}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'documentary-collage': ({ beat, scene, brand, durationInFrames }) => (
    <EditorialCollage
      headline={beat.typography?.headline || scene.title}
      subhead={beat.visualIntent}
      cards={beat.props?.cards}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'technical-diagram': ({ beat, scene, brand, durationInFrames }) => (
    <TechnicalDiagram
      headline={beat.typography?.headline || scene.title}
      subhead={beat.narrativePurpose || 'Transistor & Optical Matrix Routing'}
      nodes={beat.props?.nodes}
      connections={beat.props?.connections}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'blueprint': ({ beat, scene, brand, durationInFrames }) => (
    <TechnicalDiagram
      headline={beat.typography?.headline || 'INVERTED BLUEPRINT SCHEMATIC'}
      subhead="Transistor Matrix & Event-Driven Circuit Layer"
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'schematic': ({ beat, scene, brand, durationInFrames }) => (
    <TechnicalDiagram
      headline={beat.typography?.headline || scene.title}
      subhead={beat.visualIntent}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'data-story': ({ beat, scene, brand, durationInFrames }) => (
    <DataStory
      headline={beat.typography?.headline || scene.title}
      title={beat.props?.chartTitle || scene.props?.chartTitle || 'EMPIRICAL BENCHMARK'}
      data={beat.props?.data || scene.props?.data}
      unit={beat.props?.unit || scene.props?.unit || ' PFLOPS'}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'cinematic-statistic': ({ beat, scene, brand, durationInFrames }) => (
    <StatisticScene
      scene={{
        ...scene,
        durationFrames: durationInFrames,
        props: {
          ...scene.props,
          headline: beat.typography?.headline || scene.props?.headline || scene.title,
          subtext: beat.narrativePurpose || scene.props?.subtext,
          targetValue: beat.props?.targetValue || scene.props?.targetValue || 100,
          suffix: beat.props?.suffix || scene.props?.suffix || 'X',
        },
      }}
      brand={brand || ({} as BrandDNA)}
    />
  ),

  'geographic-story': ({ beat, scene, brand, durationInFrames }) => (
    <MapStory
      headline={beat.typography?.headline || scene.title}
      subhead={beat.narrativePurpose || 'Global Fabrication Supply Corridor'}
      region={beat.props?.regionName || scene.props?.regionName || 'GLOBAL ALLIANCE'}
      markers={beat.props?.markers || scene.props?.markers}
      routes={beat.props?.routes || scene.props?.routes}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'satellite': ({ beat, scene, brand, durationInFrames }) => (
    <MapStory
      headline={beat.typography?.headline || 'SATELLITE FABRICATION RECONNAISSANCE'}
      subhead="Global Fabrication Hub Coordinates"
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'timeline-story': ({ beat, scene, brand, durationInFrames }) => (
    <TimelineScene
      scene={{ ...scene, durationFrames: durationInFrames, props: beat.props || scene.props }}
      brand={brand || ({} as BrandDNA)}
    />
  ),

  'comparison-story': ({ beat, scene, brand, durationInFrames }) => (
    <ComparisonScene
      scene={{ ...scene, durationFrames: durationInFrames, props: beat.props || scene.props }}
      brand={brand || ({} as BrandDNA)}
    />
  ),

  'cutout-explainer': ({ beat, scene, brand, durationInFrames }) => (
    <CutoutScene
      scene={{
        ...scene,
        durationFrames: durationInFrames,
        props: {
          ...scene.props,
          ...(beat.props || {}),
          headline: beat.typography?.headline || scene.props?.headline || scene.title,
        },
      }}
      brand={brand || ({} as BrandDNA)}
    />
  ),

  'hardware-cutout': ({ beat, scene, brand, durationInFrames }) => (
    <CutoutScene
      scene={{
        ...scene,
        durationFrames: durationInFrames,
        props: {
          ...scene.props,
          ...(beat.props || {}),
          headline: beat.typography?.headline || scene.props?.headline || scene.title,
        },
      }}
      brand={brand || ({} as BrandDNA)}
    />
  ),

  'interface-explainer': ({ beat, scene, brand, durationInFrames }) => (
    <UIExplainerScene
      scene={{ ...scene, durationFrames: durationInFrames, props: beat.props || scene.props }}
      brand={brand || ({} as BrandDNA)}
    />
  ),

  'code-explainer': ({ beat, scene, brand, durationInFrames }) => (
    <UIExplainerScene
      scene={{ ...scene, durationFrames: durationInFrames, props: beat.props || scene.props }}
      brand={brand || ({} as BrandDNA)}
    />
  ),

  'kinetic-headline': ({ beat, scene, brand, durationInFrames }) => (
    <HookScene
      scene={{
        ...scene,
        durationFrames: durationInFrames,
        props: {
          ...scene.props,
          headline: beat.typography?.headline || scene.props?.headline || scene.title,
          highlightWords: beat.typography?.emphasisWords || scene.props?.highlightWords,
          subtext: beat.narrativePurpose || scene.props?.subtext,
        },
      }}
      brand={brand || ({} as BrandDNA)}
    />
  ),

  'investigative-editorial': ({ beat, scene, brand, durationInFrames }) => (
    <EditorialCollage
      headline={beat.typography?.headline || scene.title}
      subhead={beat.narrativePurpose || 'Investigative Documentary Analysis'}
      sourceTag={beat.props?.sourceTag || 'DECLASSIFIED ARCHIVE // 2026'}
      cards={beat.props?.cards}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'archival-collage': ({ beat, scene, brand, durationInFrames }) => (
    <EditorialCollage
      headline={beat.typography?.headline || scene.title}
      subhead={beat.visualIntent || 'Historical Evidence & Document Mosaic'}
      cards={beat.props?.cards}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'newspaper-editorial': ({ beat, scene, brand, durationInFrames }) => (
    <EditorialCollage
      headline={beat.typography?.headline || scene.title}
      subhead={beat.narrativePurpose || 'Front-Page Broadsheet Investigative Edition'}
      sourceTag="SPECIAL INVESTIGATION // 2026"
      cards={beat.props?.cards}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'evidence-board': ({ beat, scene, brand, durationInFrames }) => (
    <EditorialCollage
      headline={beat.typography?.headline || 'EVIDENCE CORRIDOR & TELEMETRY'}
      subhead={beat.narrativePurpose || 'Connected nodes, timelines, and verified claims'}
      sourceTag="EVIDENCE BOARD // FORENSIC CASE"
      cards={beat.props?.cards}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'technical-blueprint': ({ beat, scene, brand, durationInFrames }) => (
    <TechnicalDiagram
      headline={beat.typography?.headline || 'TECHNICAL BLUEPRINT & SYSTEM ARCHITECTURE'}
      subhead={beat.narrativePurpose || 'Inverted cyan schematic and hardware pinouts'}
      nodes={beat.props?.nodes}
      connections={beat.props?.connections}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'exploded-diagram': ({ beat, scene, brand, durationInFrames }) => (
    <TechnicalDiagram
      headline={beat.typography?.headline || 'EXPLODED MECHANICAL ASSEMBLY'}
      subhead={beat.narrativePurpose || '3D Sub-component breakout and dimensional callouts'}
      nodes={beat.props?.nodes}
      connections={beat.props?.connections}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'scientific-visualization': ({ beat, scene, brand, durationInFrames }) => (
    <TechnicalDiagram
      headline={beat.typography?.headline || scene.title}
      subhead={beat.narrativePurpose || 'Toroidal Confinement & High-Energy Plasma Field'}
      nodes={beat.props?.nodes}
      connections={beat.props?.connections}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'financial-terminal': ({ beat, scene, brand, durationInFrames }) => (
    <DataStory
      headline={beat.typography?.headline || scene.title}
      title={beat.props?.chartTitle || 'HIGH-FREQUENCY ORDER BOOK & TELEMETRY'}
      data={beat.props?.data || scene.props?.data}
      unit={beat.props?.unit || ' μs'}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'data-journalism': ({ beat, scene, brand, durationInFrames }) => (
    <DataStory
      headline={beat.typography?.headline || scene.title}
      title={beat.props?.chartTitle || 'EMPIRICAL BENCHMARK & METRIC SCALING'}
      data={beat.props?.data || scene.props?.data}
      unit={beat.props?.unit || ' PFLOPS'}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'geographic-storytelling': ({ beat, scene, brand, durationInFrames }) => (
    <MapStory
      headline={beat.typography?.headline || scene.title}
      subhead={beat.narrativePurpose || 'Global Supply Chain & Intercontinental Routing'}
      region={beat.props?.regionName || 'GLOBAL ALLIANCE'}
      markers={beat.props?.markers || scene.props?.markers}
      routes={beat.props?.routes || scene.props?.routes}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'satellite-reconnaissance': ({ beat, scene, brand, durationInFrames }) => (
    <MapStory
      headline={beat.typography?.headline || 'SATELLITE ORBITAL RECONNAISSANCE'}
      subhead="Planetary Fabrication Hub Coordinates"
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'macro-photography': ({ beat, scene, brand, durationInFrames }) => (
    <CinematicImage
      src={beat.assets[0]?.url || beat.props?.imageUrl || scene.props?.imageUrl}
      headline={beat.typography?.headline || scene.props?.headline || scene.title}
      subhead={beat.narrativePurpose || scene.props?.subtext}
      treatment="cinematic_macro"
      animation="slow-push"
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'industrial-documentary': ({ beat, scene, brand, durationInFrames }) => (
    <CinematicImage
      src={beat.assets[0]?.url || beat.props?.imageUrl || scene.props?.imageUrl}
      headline={beat.typography?.headline || scene.title}
      subhead={beat.narrativePurpose || 'Industrial High-Precision Manufacturing'}
      treatment="cinematic_macro"
      animation="slow-push"
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'architectural-viz': ({ beat, scene, brand, durationInFrames }) => (
    <TechnicalDiagram
      headline={beat.typography?.headline || 'ARCHITECTURAL PERSPECTIVE MATRIX'}
      subhead={beat.narrativePurpose || 'Wireframe elevation and volumetric cross-section'}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'depth-2-5d-parallax': ({ beat, scene, brand, durationInFrames }) => (
    <CutoutScene
      scene={{
        ...scene,
        durationFrames: durationInFrames,
        props: {
          ...scene.props,
          ...(beat.props || {}),
          headline: beat.typography?.headline || scene.props?.headline || scene.title,
        },
      }}
      brand={brand || ({} as BrandDNA)}
    />
  ),

  'cinematic-cutout': ({ beat, scene, brand, durationInFrames }) => (
    <CutoutScene
      scene={{
        ...scene,
        durationFrames: durationInFrames,
        props: {
          ...scene.props,
          ...(beat.props || {}),
          headline: beat.typography?.headline || scene.props?.headline || scene.title,
        },
      }}
      brand={brand || ({} as BrandDNA)}
    />
  ),

  'isometric-world': ({ beat, scene, brand, durationInFrames }) => (
    <TechnicalDiagram
      headline={beat.typography?.headline || 'ISOMETRIC TECHNICAL SYSTEM'}
      subhead={beat.narrativePurpose || 'Autonomous robotics grid & localized data flow'}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'timeline-reconstruction': ({ beat, scene, brand, durationInFrames }) => (
    <TimelineScene
      scene={{ ...scene, durationFrames: durationInFrames, props: beat.props || scene.props }}
      brand={brand || ({} as BrandDNA)}
    />
  ),

  'kinetic-typography': ({ beat, scene, brand, durationInFrames }) => (
    <HookScene
      scene={{
        ...scene,
        durationFrames: durationInFrames,
        props: {
          ...scene.props,
          headline: beat.typography?.headline || scene.props?.headline || scene.title,
          highlightWords: beat.typography?.emphasisWords || scene.props?.highlightWords,
          subtext: beat.narrativePurpose || scene.props?.subtext,
        },
      }}
      brand={brand || ({} as BrandDNA)}
    />
  ),

  'quote-editorial': ({ beat, scene, brand, durationInFrames }) => (
    <EditorialScene
      scene={{ ...scene, durationFrames: durationInFrames, props: beat.props || scene.props }}
      brand={brand || ({} as BrandDNA)}
    />
  ),

  'chapter-card': ({ beat, scene, brand, durationInFrames }) => (
    <EditorialScene
      scene={{ ...scene, durationFrames: durationInFrames, props: beat.props || scene.props }}
      brand={brand || ({} as BrandDNA)}
    />
  ),

  'cinematic-outro': ({ beat, scene, brand, durationInFrames }) => (
    <OutroScene
      scene={{ ...scene, durationFrames: durationInFrames, props: beat.props || scene.props }}
      brand={brand || ({} as BrandDNA)}
    />
  ),

  '3d-semiconductor': ({ beat, scene, brand, durationInFrames }) => (
    <ThreeDScene
      sceneType="semiconductor"
      headline={beat.typography?.headline || scene.title}
      subhead={beat.narrativePurpose || '3D Silicon Wafer & Photonic Interconnect Telemetry'}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  '3d-neural-network': ({ beat, scene, brand, durationInFrames }) => (
    <ThreeDScene
      sceneType="neural-network"
      headline={beat.typography?.headline || scene.title}
      subhead={beat.narrativePurpose || 'High-Density Synaptic Graph & Spatial Reasoning Core'}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  '3d-fusion-reactor': ({ beat, scene, brand, durationInFrames }) => (
    <ThreeDScene
      sceneType="fusion-reactor"
      headline={beat.typography?.headline || scene.title}
      subhead={beat.narrativePurpose || 'Toroidal Tokamak High-Energy Plasma Confinement'}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  '3d-robotics-arm': ({ beat, scene, brand, durationInFrames }) => (
    <ThreeDScene
      sceneType="robotics-arm"
      headline={beat.typography?.headline || scene.title}
      subhead={beat.narrativePurpose || 'Multi-Axis Harmonic Drive & Kinematic Joint Telemetry'}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  '3d-engineering': ({ beat, scene, brand, durationInFrames }) => (
    <ThreeDScene
      sceneType="semiconductor"
      headline={beat.typography?.headline || scene.title}
      subhead={beat.narrativePurpose || 'Physical Hardware & Component Telemetry'}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),

  'three-d-scene': ({ beat, scene, brand, durationInFrames }) => (
    <ThreeDScene
      sceneType="general-tech"
      headline={beat.typography?.headline || scene.title}
      subhead={beat.narrativePurpose}
      brand={brand}
      durationInFrames={durationInFrames}
    />
  ),
};


export function getVisualLanguageRenderer(languageId: string, strict: boolean = false): React.FC<VisualLanguageRendererProps> {
  if (VISUAL_LANGUAGE_REGISTRY[languageId]) {
    return VISUAL_LANGUAGE_REGISTRY[languageId];
  }
  if (strict && process.env.NODE_ENV === 'production') {
    throw new Error(`[VisualLanguageRegistry] Unknown visual language identifier: "${languageId}". Valid options: ${Object.keys(VISUAL_LANGUAGE_REGISTRY).join(', ')}`);
  }
  console.warn(`[VisualLanguageRegistry] Warning: Unknown visual language "${languageId}". Falling back to editorial-paper.`);
  return VISUAL_LANGUAGE_REGISTRY['editorial-paper'];
}
