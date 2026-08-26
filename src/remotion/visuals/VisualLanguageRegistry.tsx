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
};

export function getVisualLanguageRenderer(languageId: string): React.FC<VisualLanguageRendererProps> {
  return VISUAL_LANGUAGE_REGISTRY[languageId] || VISUAL_LANGUAGE_REGISTRY['editorial-paper'];
}
