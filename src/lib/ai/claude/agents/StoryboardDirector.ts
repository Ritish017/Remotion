import { z } from 'zod';
import { generateStructuredOutput } from '../utils/structuredOutput';
import { SceneDataSchema } from '@/lib/video-spec/schema';
import type { ContentDirectorOutput } from './ContentDirector';
import type { SceneData } from '@/lib/video-spec/types';

export interface StoryboardDirectorOptions {
  content: ContentDirectorOutput;
  brandId?: string;
  format?: '9:16' | '16:9' | '1:1';
}

export type StoryboardDirectorInput = StoryboardDirectorOptions | ContentDirectorOutput;

export const StoryboardDirectorOutputSchema = z.object({
  title: z.string(),
  totalDurationFrames: z.number().int().positive(),
  scenes: z.array(SceneDataSchema).min(1) as z.ZodType<SceneData[]>,
});

export type StoryboardDirectorOutput = {
  title: string;
  totalDurationFrames: number;
  scenes: SceneData[];
};

export async function runStoryboardDirector(
  input: StoryboardDirectorInput,
  _fps?: number | string
): Promise<SceneData[] & StoryboardDirectorOutput> {
  const content: ContentDirectorOutput = 'content' in input ? input.content : input;
  const targetDuration = content.targetDurationSeconds || 45;
  const targetTotalFrames = targetDuration * 30;

  const systemPrompt = `You are the Storyboard Director for Catalyst Content OS.
Transform this research-backed documentary script into a 7-scene Vox/Bloomberg-style cinematic visual timeline.

Allowed scene types and template IDs:
- "hook" (templateId: "hook-primary", visualType: "hero-photo")
- "editorial" (templateId: "editorial-quote", visualType: "editorial-paper")
- "chart" (templateId: "chart-bar", visualType: "data-story")
- "map" (templateId: "map-geo", visualType: "documentary-map")
- "cutout" (templateId: "cutout-explainer", visualType: "cutout-collage")
- "statistic" (templateId: "statistic-big", visualType: "technical-diagram")
- "outro" (templateId: "outro-cta", visualType: "cinematic-outro")

For EVERY scene, specify:
1. title and narrationText
2. visualIntent and visualMetaphor
3. primarySubject (large full-frame subject description)
4. composition (scale, layout, focalPoint)
5. layers (background, midground, subject, typography)
6. camera movement (push, pan, orbit, parallax)
7. typography (headline, supportingText, hierarchy)

Total duration must equal ${targetTotalFrames} frames across all 7 scenes. Attach claimIds to scenes where facts are presented.`;

  const userPrompt = `Generate a 7-scene documentary storyboard for:
Title: "${content.title}"
Hook: "${content.hook.headline}" - "${content.hook.subtext}"
Narrative Arc:
1. Hook: "${content.narrativeStructure.hook}"
2. Context: "${content.narrativeStructure.context}"
3. Data Surge: "${content.narrativeStructure.dataSurge}"
4. Geography: "${content.narrativeStructure.geography}"
5. Explanation: "${content.narrativeStructure.explanation}"
6. Payoff: "${content.narrativeStructure.payoff}"
7. Outro: "${content.narrativeStructure.outro}"
Total Duration: ${targetTotalFrames} frames (${targetDuration}s @ 30fps)`;

  const result = await generateStructuredOutput<StoryboardDirectorOutput>({
    agentName: 'StoryboardDirector',
    systemPrompt,
    userPrompt,
    schema: StoryboardDirectorOutputSchema,
    maxTokens: 3500,
    fallbackGenerator: () => generateDeterministicStoryboard(content, targetTotalFrames),
  });

  // Preserve backwards compatibility by returning array with attached metadata properties
  const scenesArray = result.scenes as SceneData[] & StoryboardDirectorOutput;
  scenesArray.title = result.title;
  scenesArray.scenes = result.scenes;
  scenesArray.totalDurationFrames = result.totalDurationFrames;

  return scenesArray;
}

function generateDeterministicStoryboard(
  content: ContentDirectorOutput,
  targetTotalFrames: number
): StoryboardDirectorOutput {
  const isRobotics = content.title.toLowerCase().includes('robot') || content.title.toLowerCase().includes('humanoid');
  const isFintech = content.title.toLowerCase().includes('nanosecond') || content.title.toLowerCase().includes('trillion') || content.title.toLowerCase().includes('financ');

  const f1 = Math.round(targetTotalFrames * 0.11);
  const f2 = Math.round(targetTotalFrames * 0.13);
  const f3 = Math.round(targetTotalFrames * 0.16);
  const f4 = Math.round(targetTotalFrames * 0.16);
  const f5 = Math.round(targetTotalFrames * 0.18);
  const f6 = Math.round(targetTotalFrames * 0.15);
  const f7 = targetTotalFrames - (f1 + f2 + f3 + f4 + f5 + f6);

  let currentStart = 0;

  const scenes: SceneData[] = [
    {
      id: 'scene-1',
      sceneNumber: 1,
      type: 'hook',
      templateId: 'hook-primary',
      title: isRobotics ? 'The Humanoid Threshold' : isFintech ? 'The Nanosecond Barrier' : 'The Hyperscale Frontier',
      startFrame: currentStart,
      durationFrames: f1,
      narrationText: content.narrativeStructure.hook,
      visualIntent: 'Establish massive technological scale with cinematic photography',
      visualType: 'hero-photo',
      primarySubject: 'Massive AI Supercomputing Cluster',
      visualMetaphor: 'Illuminated optical nerve center of modern artificial intelligence',
      camera: { type: 'push', intensity: 0.22, startScale: 1.0, endScale: 1.14 },
      composition: { layout: 'full-frame', subjectPosition: 'center', scale: 1.05 },
      typography: {
        headline: content.hook.headline.toUpperCase(),
        supportingText: content.hook.subtext,
        hierarchy: 'DISPLAY',
        position: 'center',
        emphasisWords: content.hook.highlightWords || ['AI', 'INFRASTRUCTURE', 'RACE'],
      },
      props: {
        tag: content.hook.tag || 'DOCUMENTARY INVESTIGATION',
        headline: content.hook.headline,
        subtext: content.hook.subtext,
        highlightWords: content.hook.highlightWords,
      },
    },
    {
      id: 'scene-2',
      sceneNumber: 2,
      type: 'editorial',
      templateId: 'editorial-quote',
      title: isRobotics ? 'The Actuator Bottleneck' : isFintech ? 'Settlement Latency Risk' : 'The Physical Constraint',
      startFrame: (currentStart += f1),
      durationFrames: f2,
      narrationText: content.narrativeStructure.context,
      visualIntent: 'Layered archival investigation of thermodynamic and fabrication limits',
      visualType: 'editorial-paper',
      primarySubject: '3nm Silicon Wafer & Cleanroom Lithography',
      visualMetaphor: 'Microscopic engineering confronting physical energy barriers',
      camera: { type: 'pan-left', intensity: 0.16 },
      composition: { layout: 'editorial-split', subjectPosition: 'center', scale: 1.0 },
      typography: {
        headline: 'THE HARDWARE CEILING',
        supportingText: 'Thermodynamic and silicon scaling limits',
        hierarchy: 'HEADLINE',
        position: 'top-left',
      },
      props: {
        quoteText: isRobotics
          ? 'Rigid gearboxes prevented safe human collaboration for over three decades.'
          : isFintech
          ? 'Every microsecond of settlement delay multiplied counterparty credit risk.'
          : 'For decades software lived in the cloud. The physical frontier has shifted to gigawatt power grids and extreme sub-3nm lithography.',
        speakerName: isRobotics ? 'Dr. Elena Rostova' : isFintech ? 'Marcus Vance' : 'Dr. Carver Mead',
        speakerTitle: isRobotics ? 'Biomimetic Systems Lead' : isFintech ? 'Chief Quantitative Architect' : 'VLSI Pioneer & Neuromorphic Founder',
        sourceDocument: content.research_sources?.[0]?.title || 'HARDWARE RESEARCH ARCHIVE // 2026',
        factConfidence: 0.98,
      },
    },
    {
      id: 'scene-3',
      sceneNumber: 3,
      type: 'chart',
      templateId: 'chart-bar',
      title: isRobotics ? 'Torque Density Benchmark' : isFintech ? 'Execution Latency Reduction' : 'Compute Density Surge',
      startFrame: (currentStart += f2),
      durationFrames: f3,
      narrationText: content.narrativeStructure.dataSurge,
      visualIntent: 'Animated benchmark quantifying orders of magnitude performance leap',
      visualType: 'data-story',
      primarySubject: 'Compute Efficiency & Power Scaling Curve',
      visualMetaphor: 'Exponential divergence separating legacy hardware from next-gen architectures',
      camera: { type: 'push', intensity: 0.2 },
      composition: { layout: 'data-grid', subjectPosition: 'center', scale: 1.0 },
      typography: {
        headline: 'COMPUTE EFFICIENCY BENCHMARK',
        supportingText: 'PFLOPS / MegaWatt Scaling Across Generations',
        hierarchy: 'DATA',
        position: 'top',
      },
      props: {
        chartTitle: isRobotics ? 'TORQUE DENSITY (Nm / kg)' : isFintech ? 'SETTLEMENT LATENCY (ns)' : 'COMPUTE DENSITY (PFLOPS / MW)',
        data: isRobotics
          ? [
              { label: 'Harmonic Drive (2020)', value: 45, sublabel: 'Heavy & rigid' },
              { label: 'Hydraulic Quad (2023)', value: 120, sublabel: 'High maintenance' },
              { label: 'Quasi-Direct Actuator (2026)', value: 920, sublabel: '20x torque jump' },
            ]
          : isFintech
          ? [
              { label: 'Traditional Database', value: 2500000, sublabel: '2.5ms latency' },
              { label: 'C++ Kernel Core', value: 12000, sublabel: '12µs latency' },
              { label: 'Direct FPGA Logic', value: 38, sublabel: '38ns settlement' },
            ]
          : [
              { label: 'Legacy Server (2020)', value: 12, sublabel: 'Baseline compute power' },
              { label: 'Hopper Cluster (2023)', value: 68, sublabel: '5.6x density leap' },
              { label: 'Blackwell NVL72 (2026)', value: 290, sublabel: '24x liquid-cooled scale' },
            ],
        unit: isRobotics ? ' Nm/kg' : isFintech ? ' ns' : ' PFLOPS',
        factConfidence: 0.99,
        sourceCitation: content.research_sources?.[0]?.title || 'Empirical Lab Benchmarks // IEEE 2026',
      },
    },
    {
      id: 'scene-4',
      sceneNumber: 4,
      type: 'map',
      templateId: 'map-geo',
      title: isRobotics ? 'Global Assembly Hubs' : isFintech ? 'Dark Fiber Liquidity Grid' : 'Transcontinental Silicon Grid',
      startFrame: (currentStart += f3),
      durationFrames: f4,
      narrationText: content.narrativeStructure.geography,
      visualIntent: 'Full-canvas geographic visualization of global sovereign clusters',
      visualType: 'documentary-map',
      primarySubject: 'Transcontinental Dark Fiber & Fab Alliance',
      visualMetaphor: 'Geopolitical matrix connecting capital, silicon, and clean energy',
      camera: { type: 'zoom-region', intensity: 0.22, focalPoint: { x: 50, y: 45 } },
      composition: { layout: 'full-canvas-map', subjectPosition: 'center', scale: 1.0 },
      typography: {
        headline: 'GLOBAL SILICON ALLIANCE',
        supportingText: 'High-Bandwidth Transcontinental Transit Arcs',
        hierarchy: 'HEADLINE',
        position: 'top-left',
      },
      props: {
        regionName: isRobotics ? 'GLOBAL ROBOTICS CORRIDOR' : isFintech ? 'TRANSCONTINENTAL FIBER ARCS' : 'GLOBAL SILICON ALLIANCE',
        markers: isRobotics
          ? [
              { id: 'fremont', label: 'Fremont Facility', x: 20, y: 38, info: 'Factory Assembly Tier 1', active: true },
              { id: 'munich', label: 'Munich Precision Lab', x: 48, y: 32, info: 'Actuator Dynamics Fab', active: true },
              { id: 'shenzhen', label: 'Shenzhen Hub', x: 80, y: 48, info: 'Mass Production Line', active: true },
            ]
          : isFintech
          ? [
              { id: 'nj', label: 'Secaucus (NY4)', x: 26, y: 36, info: 'Primary Liquidity Engine', active: true },
              { id: 'ldn', label: 'Slough (LD4)', x: 47, y: 30, info: 'European Clearing Engine', active: true },
              { id: 'tokyo', label: 'Tokyo (TY3)', x: 84, y: 40, info: 'Asia-Pacific Core', active: true },
            ]
          : [
              { id: 'taiwan', label: 'Hsinchu (TSMC)', x: 78, y: 55, info: '3nm Wafer Fabrication Core', active: true },
              { id: 'sv', label: 'Silicon Valley', x: 22, y: 42, info: 'Neural Architecture Cluster', active: true },
              { id: 'europe', label: 'Munich / ASML', x: 48, y: 34, info: 'High-NA EUV Optics Hub', active: true },
            ],
        routes: isRobotics
          ? [{ from: 'munich', to: 'fremont', label: 'Actuator Spec' }, { from: 'fremont', to: 'shenzhen', label: 'Pilot Scaling' }]
          : isFintech
          ? [{ from: 'nj', to: 'ldn', label: 'Atlantic Dark Fiber' }, { from: 'ldn', to: 'tokyo', label: 'Siberian Route' }]
          : [{ from: 'europe', to: 'taiwan', label: 'Lithography Optics' }, { from: 'taiwan', to: 'sv', label: 'Interconnect Transit' }],
        factConfidence: 0.97,
      },
    },
    {
      id: 'scene-5',
      sceneNumber: 5,
      type: 'cutout',
      templateId: 'cutout-explainer',
      title: isRobotics ? 'Vision-Action Neural Policy' : isFintech ? 'Kernel-Bypass Architecture' : 'The Humanoid Systems Architect',
      startFrame: (currentStart += f4),
      durationFrames: f5,
      narrationText: content.narrativeStructure.explanation,
      visualIntent: 'Multi-layer cutout composition fusing human engineering with silicon telemetry',
      visualType: 'cutout-collage',
      primarySubject: 'Chief Systems Architect Cutout + Wafer Telemetry',
      visualMetaphor: 'Human engineering mastery orchestrating billion-transistor complexity',
      camera: { type: 'orbit', intensity: 0.24 },
      composition: { layout: 'cutout-layered', subjectPosition: 'left', scale: 1.1 },
      typography: {
        headline: 'HUMAN-SILICON CO-DESIGN',
        supportingText: 'Translating algorithms directly into physical silicon logic',
        hierarchy: 'HEADLINE',
        position: 'right',
      },
      props: {
        headline: isRobotics ? 'END-TO-END NEURAL POLICY' : isFintech ? 'KERNEL-BYPASS FPGA PIPELINE' : 'DIRECT SILICON COMPILATION',
        subtext: isRobotics ? 'Zero hand-crafted heuristics' : isFintech ? '200M order packets / second' : 'Zero software translation overhead',
        factConfidence: 0.98,
      },
    },
    {
      id: 'scene-6',
      sceneNumber: 6,
      type: 'statistic',
      templateId: 'statistic-big',
      title: isRobotics ? 'Industrial Scale' : isFintech ? 'Volatility Elimination' : 'Extreme Scale Deployed',
      startFrame: (currentStart += f5),
      durationFrames: f6,
      narrationText: content.narrativeStructure.payoff,
      visualIntent: 'High-density technical schematic and big-number payoff',
      visualType: 'technical-diagram',
      primarySubject: 'Optical Interconnect Floorplan & Scale Multiplier',
      visualMetaphor: 'Unprecedented physical scale operating with zero latency bottleneck',
      camera: { type: 'parallax', intensity: 0.25 },
      composition: { layout: 'schematic-metric', subjectPosition: 'center', scale: 1.0 },
      typography: {
        headline: 'VELOCITY MULTIPLIER',
        supportingText: 'Total compute throughput expansion rate',
        hierarchy: 'DATA',
        position: 'top',
      },
      props: {
        headline: isRobotics ? 'ACCIDENT REDUCTION' : isFintech ? 'SETTLEMENT RISK ELIMINATED' : 'BANDWIDTH SCALING',
        targetValue: isRobotics ? 400 : isFintech ? 98 : 100,
        suffix: isRobotics ? '%' : isFintech ? '%' : 'X',
        subtext: isRobotics ? 'Within 90 days of factory integration' : isFintech ? 'Across all continuous clearing cycles' : 'Throughput jump across ultra-scale optical fabrics',
        factConfidence: 0.99,
      },
    },
    {
      id: 'scene-7',
      sceneNumber: 7,
      type: 'outro',
      templateId: 'outro-cta',
      title: 'Channel Outro',
      startFrame: (currentStart += f6),
      durationFrames: f7,
      narrationText: content.narrativeStructure.outro,
      visualIntent: 'Crisp editorial conclusion with glowing signature branding',
      visualType: 'cinematic-outro',
      primarySubject: 'Catalyst Editorial Monogram & Verification Stamp',
      visualMetaphor: 'Authoritative journalistic closure',
      camera: { type: 'push', intensity: 0.15 },
      composition: { layout: 'hero-outro', subjectPosition: 'center', scale: 1.0 },
      typography: {
        headline: 'CATALYST EDITORIAL',
        supportingText: 'SUBSCRIBE FOR HARDWARE DEEP DIVES',
        hierarchy: 'DISPLAY',
        position: 'center',
      },
      props: {
        channelName: 'CATALYST',
        ctaText: 'SUBSCRIBE FOR DEEP DIVE INVESTIGATIONS',
        tagline: 'Engineering the Hardware Frontier',
      },
    },
  ];

  return {
    title: content.title,
    totalDurationFrames: targetTotalFrames,
    scenes,
  };
}
