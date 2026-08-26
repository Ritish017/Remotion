import { createLocalRenderJob, executeLocalRenderAsync } from '../src/lib/rendering/local';
import { DatabaseFactory } from '../src/lib/database';
import type { VideoSpec } from '../src/lib/video-spec/types';

// ── Episode 2 (3D Semiconductor Wafer & Silicon) ───────────────────────────────
const EPISODE_2_SPEC: VideoSpec = {
  version: '2.0.0',
  id: 'ep_20260902_2nm_silicon',
  title: 'Next-Gen 2nm Wafer Silicon & Optical Interconnects',
  description: 'Physical fabrication limits and co-packaged optics.',
  motionSeed: 202,
  composition: {
    format: '9:16',
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 360,
  },
  brand: {
    brandId: 'daily-ai-news',
    name: 'Daily AI News',
    colors: {
      primary: '#00c9a7',
      secondary: '#ffd166',
      accent: '#38bdf8',
      background: '#05070c',
      surface: '#0d131f',
      text: '#f8fafc',
      textMuted: '#94a3b8',
    },
    typography: {
      fontFamilyHeading: 'Inter, system-ui, sans-serif',
      fontFamilyBody: 'Inter, system-ui, sans-serif',
      fontFamilyMono: 'JetBrains Mono, monospace',
      headingWeight: '900',
      bodyWeight: '400',
    },
    motionStyle: 'editorial',
    textures: {
      paperTexture: false,
      grainIntensity: 0.08,
      halftoneEffect: false,
      vignette: true,
    },
    captionStyle: {
      preset: 'karaoke-pill',
      fontSize: 34,
      highlightColor: '#00c9a7',
      activeTextColor: '#05070c',
      inactiveTextColor: '#ffffff',
      boxBackground: 'rgba(5, 7, 12, 0.92)',
    },
  },
  narration: {
    durationSeconds: 12,
    transcript: 'At the two nanometer frontier, copper interconnects generate unsustainable thermal throttling, forcing the entire industry to optical silicon.',
    words: [
      { word: 'At', start: 0.1, end: 0.3 },
      { word: 'the', start: 0.4, end: 0.6 },
      { word: 'two', start: 0.7, end: 1.1 },
      { word: 'nanometer', start: 1.2, end: 1.9 },
      { word: 'frontier,', start: 2.0, end: 2.7 },
      { word: 'copper', start: 3.0, end: 3.5 },
      { word: 'interconnects', start: 3.6, end: 4.5 },
      { word: 'generate', start: 4.6, end: 5.1 },
      { word: 'unsustainable', start: 5.2, end: 6.2 },
      { word: 'thermal', start: 6.3, end: 6.8 },
      { word: 'throttling,', start: 6.9, end: 7.8 },
      { word: 'forcing', start: 8.1, end: 8.6 },
      { word: 'the', start: 8.7, end: 8.9 },
      { word: 'entire', start: 9.0, end: 9.5 },
      { word: 'industry', start: 9.6, end: 10.2 },
      { word: 'to', start: 10.3, end: 10.5 },
      { word: 'optical', start: 10.6, end: 11.1 },
      { word: 'silicon.', start: 11.2, end: 11.8 },
    ],
  },
  audio: {
    voiceoverVolume: 1.0,
    musicVolume: 0.22,
    duckingPercentage: 0.75,
    sfx: [],
  },
  scenes: [
    {
      id: 'sc1_2nm_3d_die',
      sceneNumber: 1,
      type: 'editorial',
      templateId: 'EditorialScene',
      title: '2NM SILICON ARCHITECTURE',
      startFrame: 0,
      durationFrames: 180,
      visualLanguage: '3d-semiconductor',
      visualBeats: [
        {
          id: 'b1_1',
          startFrame: 0,
          durationInFrames: 180,
          narrativePurpose: 'Showcase 3D microchip transistor architecture and photonic bus.',
          visualIntent: '3D WebGL rotating silicon wafer with glowing optical interconnects.',
          primaryVisual: '3d-semiconductor',
          assets: [],
          camera: { movement: 'orbit', intensity: 0.25, easing: 'ease-out', focalPoint: { x: 50, y: 50 } },
          transition: { type: 'linear-blur', durationFrames: 12, sharedGeometry: 'none', direction: 'right' },
          typography: {
            treatment: 'brutalist_display',
            headline: '2NM SILICON ARCHITECTURE',
            position: 'top',
          },
          props: {
            headline: '2NM SILICON ARCHITECTURE',
            subhead: 'TSMC N2 Lithography & Co-Packaged Optics Telemetry',
          },
        },
      ],
    },
    {
      id: 'sc2_2nm_blueprint',
      sceneNumber: 2,
      type: 'chart',
      templateId: 'ChartScene',
      title: 'COPPER VS PHOTONIC ROUTING',
      startFrame: 180,
      durationFrames: 180,
      visualLanguage: 'technical-blueprint',
      visualBeats: [
        {
          id: 'b2_1',
          startFrame: 180,
          durationInFrames: 180,
          narrativePurpose: 'Explain circuit pinout and optical waveguide routing.',
          visualIntent: 'Inverted cyan blueprint diagram with wireframe pinouts.',
          primaryVisual: 'technical-blueprint',
          assets: [],
          camera: { movement: 'zoom-region', intensity: 0.20, easing: 'ease-out', focalPoint: { x: 50, y: 50 } },
          transition: { type: 'fade', durationFrames: 10, sharedGeometry: 'none', direction: 'right' },
          typography: {
            treatment: 'keyword_spotlight',
            headline: 'PHOTONIC WAVEGUIDE ROUTING',
            position: 'top',
          },
          props: {
            nodes: [
              { id: 'n1', label: 'EUV LASER CORE', x: 25, y: 40, status: 'nominal' },
              { id: 'n2', label: 'OPTICAL TRANSCEIVER', x: 75, y: 40, status: 'active' },
              { id: 'n3', label: 'HBM4 BUS MATRIX', x: 50, y: 70, status: 'active' },
            ],
            connections: [
              { from: 'n1', to: 'n2', label: '800 Gbps // Optical' },
              { from: 'n2', to: 'n3', label: '4.8 TB/s Memory' },
            ],
          },
        },
      ],
    },
  ],
  assets: [],
};

// ── Episode 3 (Autonomous Agent Swarms) ─────────────────────────────────────────
const EPISODE_3_SPEC: VideoSpec = {
  version: '2.0.0',
  id: 'ep_20260903_agent_swarms',
  title: 'Autonomous Agent Swarms in Enterprise Logistics',
  description: 'Multi-agent orchestration and global supply chain automation.',
  motionSeed: 303,
  composition: {
    format: '9:16',
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 360,
  },
  brand: {
    brandId: 'daily-ai-news',
    name: 'Daily AI News',
    colors: {
      primary: '#ffd166',
      secondary: '#f0522a',
      accent: '#00c9a7',
      background: '#090b10',
      surface: '#151922',
      text: '#f8fafc',
      textMuted: '#94a3b8',
    },
    typography: {
      fontFamilyHeading: 'Inter, system-ui, sans-serif',
      fontFamilyBody: 'Inter, system-ui, sans-serif',
      fontFamilyMono: 'JetBrains Mono, monospace',
      headingWeight: '900',
      bodyWeight: '400',
    },
    motionStyle: 'kinetic',
    textures: {
      paperTexture: false,
      grainIntensity: 0.10,
      halftoneEffect: false,
      vignette: true,
    },
    captionStyle: {
      preset: 'kinetic-pop',
      fontSize: 42,
      highlightColor: '#ffd166',
      activeTextColor: '#090b10',
      inactiveTextColor: '#ffffff',
      boxBackground: 'rgba(9, 11, 16, 0.90)',
    },
  },
  narration: {
    durationSeconds: 12,
    transcript: 'Autonomous agent swarms have surpassed human logistics teams, synchronizing intercontinental freight corridors in real time without human intervention.',
    words: [
      { word: 'Autonomous', start: 0.1, end: 0.8 },
      { word: 'agent', start: 0.9, end: 1.3 },
      { word: 'swarms', start: 1.4, end: 2.0 },
      { word: 'have', start: 2.1, end: 2.3 },
      { word: 'surpassed', start: 2.4, end: 3.1 },
      { word: 'human', start: 3.2, end: 3.6 },
      { word: 'logistics', start: 3.7, end: 4.4 },
      { word: 'teams,', start: 4.5, end: 5.1 },
      { word: 'synchronizing', start: 5.4, end: 6.3 },
      { word: 'intercontinental', start: 6.4, end: 7.5 },
      { word: 'freight', start: 7.6, end: 8.1 },
      { word: 'corridors', start: 8.2, end: 9.0 },
      { word: 'in', start: 9.1, end: 9.3 },
      { word: 'real', start: 9.4, end: 9.7 },
      { word: 'time.', start: 9.8, end: 11.2 },
    ],
  },
  audio: {
    voiceoverVolume: 1.0,
    musicVolume: 0.25,
    duckingPercentage: 0.75,
    sfx: [],
  },
  scenes: [
    {
      id: 'sc1_swarms_hook',
      sceneNumber: 1,
      type: 'hook',
      templateId: 'HookScene',
      title: 'AUTONOMOUS AGENT SWARMS',
      startFrame: 0,
      durationFrames: 180,
      visualLanguage: 'kinetic-headline',
      visualBeats: [
        {
          id: 'b1_1',
          startFrame: 0,
          durationInFrames: 180,
          narrativePurpose: 'Establish explosive scale of multi-agent swarm coordination.',
          visualIntent: 'Kinetic typography takeover with tracking expansion and strobe spotlight.',
          primaryVisual: 'kinetic-headline',
          assets: [],
          camera: { movement: 'whip-pan', intensity: 0.35, easing: 'snap', focalPoint: { x: 50, y: 50 } },
          transition: { type: 'cross-zoom', durationFrames: 10, sharedGeometry: 'none', direction: 'right' },
          typography: {
            treatment: 'tracking_expansion',
            headline: 'AUTONOMOUS AGENT SWARMS',
            emphasisWords: ['AUTONOMOUS', 'SWARMS'],
            position: 'center',
            fontScale: 'monolith_huge',
          },
          props: {
            headline: 'AUTONOMOUS AGENT SWARMS',
            subtext: 'Zero-Human Intercontinental Routing Engine',
            highlightWords: ['AUTONOMOUS', 'SWARMS'],
          },
        },
      ],
    },
    {
      id: 'sc2_swarms_map',
      sceneNumber: 2,
      type: 'map',
      templateId: 'MapScene',
      title: 'GLOBAL CORRIDOR TELEMETRY',
      startFrame: 180,
      durationFrames: 180,
      visualLanguage: 'geographic-story',
      visualBeats: [
        {
          id: 'b2_1',
          startFrame: 180,
          durationInFrames: 180,
          narrativePurpose: 'Trace real-time autonomous routing corridors across world hubs.',
          visualIntent: 'Geographic map with active vector routes and node telemetry.',
          primaryVisual: 'geographic-story',
          assets: [],
          camera: { movement: 'pan-right', intensity: 0.22, easing: 'ease-out', focalPoint: { x: 50, y: 50 } },
          transition: { type: 'fade', durationFrames: 10, sharedGeometry: 'none', direction: 'right' },
          typography: {
            treatment: 'brutalist_display',
            headline: 'GLOBAL CORRIDOR TELEMETRY',
            position: 'top',
          },
          props: {
            regionName: 'GLOBAL AGENT CORRIDOR',
            markers: [
              { label: 'SHANGHAI PORT (HUB-1)', x: 75, y: 45, status: 'active' },
              { label: 'ROTTERDAM (HUB-2)', x: 48, y: 32, status: 'active' },
              { label: 'LONG BEACH (HUB-3)', x: 22, y: 40, status: 'active' },
            ],
            routes: [
              { from: 'SHANGHAI PORT (HUB-1)', to: 'ROTTERDAM (HUB-2)', traffic: 94 },
              { from: 'ROTTERDAM (HUB-2)', to: 'LONG BEACH (HUB-3)', traffic: 88 },
            ],
          },
        },
      ],
    },
  ],
  assets: [],
};

async function renderSequential() {
  const db = DatabaseFactory.getProvider();
  await db.initialize();

  console.log('Rendering Episode 2 (3D Semiconductor Wafer & Silicon)...');
  const r2 = await executeLocalRenderAsync('render_september_ep02_silicon', EPISODE_2_SPEC);
  console.log(`Episode 2 rendered: ${r2.outputFile} (${(r2.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB, ${r2.renderTimeMs}ms)`);

  console.log('Rendering Episode 3 (Autonomous Agent Swarms)...');
  const r3 = await executeLocalRenderAsync('render_september_ep03_swarms', EPISODE_3_SPEC);
  console.log(`Episode 3 rendered: ${r3.outputFile} (${(r3.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB, ${r3.renderTimeMs}ms)`);

  console.log('\nAll 3 September test episodes rendered successfully!');
}

renderSequential().catch((err) => {
  console.error('Render error:', err);
  process.exit(1);
});
