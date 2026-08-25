import React from 'react';
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
import type { SceneData, BrandDNA, SceneType } from '@/lib/video-spec/types';

export interface TemplateDefinition {
  id: string;
  name: string;
  category: SceneType;
  description: string;
  supportedAspectRatios: Array<'9:16' | '16:9' | '1:1'>;
  component: React.FC<{ scene: SceneData; brand: BrandDNA }>;
  defaultProps: Record<string, any>;
}

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  'hook-primary': {
    id: 'hook-primary',
    name: 'Primary Editorial Hook',
    category: 'hook',
    description: 'High-impact hook opener with bold spring typography, tag badge, and cutout subject',
    supportedAspectRatios: ['9:16', '16:9', '1:1'],
    component: HookScene,
    defaultProps: {
      tag: 'DOCUMENTARY INVESTIGATION',
      headline: 'THE FUTURE OF AI',
      subtext: 'Everything is about to change',
      highlightWords: ['AI', 'FUTURE', 'CHANGE'],
    },
  },
  'editorial-quote': {
    id: 'editorial-quote',
    name: 'Editorial Context & Quote',
    category: 'editorial',
    description: 'Documentary context layout with chapter marker, prominent pull quote, and key facts',
    supportedAspectRatios: ['9:16', '16:9', '1:1'],
    component: EditorialScene,
    defaultProps: {
      chapter: '01',
      chapterTitle: 'THE CONTEXT',
      quote: 'The shift occurred when computational power crossed the threshold of human reaction time.',
      source: 'Source: AI Systems Journal',
      keyPoints: ['Autonomous multi-agent orchestration', 'Sub-100ms reasoning latencies'],
    },
  },
  'chart-bar': {
    id: 'chart-bar',
    name: 'Animated Data Bar Chart',
    category: 'chart',
    description: 'Animated SVG/CSS bar chart with live spring progression and metric callouts',
    supportedAspectRatios: ['9:16', '16:9', '1:1'],
    component: ChartScene,
    defaultProps: {
      headline: 'The Exponential Surge',
      chartTitle: 'ADOPTION VELOCITY',
      unit: '%',
      data: [
        { label: 'Traditional Workflow', value: 24 },
        { label: 'Hybrid Tooling', value: 58 },
        { label: 'Autonomous AI Engine', value: 92 },
      ],
    },
  },
  'map-geo': {
    id: 'map-geo',
    name: 'Geographic Visualizer',
    category: 'map',
    description: 'Interactive territory map with animated node markers, connecting routes, and geo-intel badges',
    supportedAspectRatios: ['9:16', '16:9', '1:1'],
    component: MapScene,
    defaultProps: {
      headline: 'Global Infrastructure',
      regionName: 'TRANSIT CORRIDOR',
      markers: [
        { id: '1', label: 'San Francisco', x: 28, y: 44, info: 'Primary Training' },
        { id: '2', label: 'Tokyo', x: 78, y: 48, info: 'Distributed Node' },
      ],
    },
  },
  'cutout-explainer': {
    id: 'cutout-explainer',
    name: 'Cutout & Floating Cards',
    category: 'cutout',
    description: 'Layered subject cutout with floating technical feature callouts and parallax motion',
    supportedAspectRatios: ['9:16', '16:9', '1:1'],
    component: CutoutScene,
    defaultProps: {
      headline: 'The Neural Architecture',
      callouts: [
        { title: 'Deterministic Timeline', desc: 'Frame-accurate React orchestration' },
        { title: 'Dynamic Props', desc: 'Live AI parameters & brand theming' },
      ],
    },
  },
  'statistic-big': {
    id: 'statistic-big',
    name: 'Big Number Counter & Payoff',
    category: 'statistic',
    description: 'Dynamic animated counter number with glowing drop shadow and dramatic payoff copy',
    supportedAspectRatios: ['9:16', '16:9', '1:1'],
    component: StatisticScene,
    defaultProps: {
      targetValue: 100,
      prefix: '',
      suffix: 'X',
      tag: 'PERFORMANCE MULTIPLIER',
      headline: 'Faster Turnaround',
      subtext: 'From concept to finished render in seconds.',
    },
  },
  'photo-archive': {
    id: 'photo-archive',
    name: 'Archival Photo & Ken Burns',
    category: 'photo',
    description: 'Cinematic photography with grain, vintage contrast, and lower-third metadata',
    supportedAspectRatios: ['9:16', '16:9', '1:1'],
    component: PhotoScene,
    defaultProps: {
      caption: 'Satellite view of data transmission hubs',
      timestamp: 'ARCHIVE // 2026',
    },
  },
  'timeline-flow': {
    id: 'timeline-flow',
    name: 'Timeline Chronology',
    category: 'timeline',
    description: 'Vertical chronological timeline with animated milestones',
    supportedAspectRatios: ['9:16', '16:9', '1:1'],
    component: TimelineScene,
    defaultProps: {
      events: [
        { year: '2023', title: 'Monolithic Models', desc: 'Single prompt-response systems' },
        { year: '2025', title: 'Agent Swarms', desc: 'Autonomous tool-using pipelines' },
        { year: '2026', title: 'Deterministic Engines', desc: 'Frame-accurate code-rendered video' },
      ],
    },
  },
  'comparison-grid': {
    id: 'comparison-grid',
    name: 'Side-by-Side Comparison',
    category: 'comparison',
    description: 'Structured comparison between legacy and modern solutions',
    supportedAspectRatios: ['9:16', '16:9', '1:1'],
    component: ComparisonScene,
    defaultProps: {
      leftTitle: 'Legacy Model',
      leftPoints: ['Slow manual editing', 'High render cost'],
      rightTitle: 'Catalyst Engine',
      rightPoints: ['Instant React compositing', 'Deterministic frame timing'],
    },
  },
  'ui-code': {
    id: 'ui-code',
    name: 'UI Code Window',
    category: 'ui-explainer',
    description: 'Realistic software window showing animated code or workflow',
    supportedAspectRatios: ['9:16', '16:9', '1:1'],
    component: UIExplainerScene,
    defaultProps: {
      headline: 'Interactive Agent Interface',
      codeSnippet: 'const video = await catalyst.render();',
    },
  },
  'outro-cta': {
    id: 'outro-cta',
    name: 'Branded Outro & CTA',
    category: 'outro',
    description: 'Closing call to action with channel branding, handle, and pulsing logo badge',
    supportedAspectRatios: ['9:16', '16:9', '1:1'],
    component: OutroScene,
    defaultProps: {
      ctaTitle: 'Follow for Daily Deep Dives',
      handle: '@CatalystStudio',
      subtext: 'Next episode drops tomorrow at 09:00 UTC',
    },
  },
};

export function getTemplateById(id: string): TemplateDefinition {
  return TEMPLATE_REGISTRY[id] || TEMPLATE_REGISTRY['hook-primary'];
}

export function getTemplateForCategory(category: SceneType): TemplateDefinition {
  const match = Object.values(TEMPLATE_REGISTRY).find((t) => t.category === category);
  return match || TEMPLATE_REGISTRY['hook-primary'];
}
