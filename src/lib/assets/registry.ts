export interface AssetRecord {
  id: string;
  type: 'image' | 'video' | 'icon' | 'logo' | 'map' | 'music' | 'voice' | 'sfx' | 'font' | 'texture' | 'diagram' | 'cutout' | 'document';
  url: string;
  source: string;
  license: string;
  description: string;
  tags: string[];
  visualMeaning: string;
  aspectRatio?: '9:16' | '16:9' | '1:1' | '4:3';
  dominantColors?: string[];
  channelId?: string;
  usageRights: string;
}

export const ASSET_REGISTRY: AssetRecord[] = [
  // 1. High-Density Supercomputing Cluster & Optical Interconnects
  {
    id: 'photo-datacenter-supercomputer',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=85',
    source: 'Unsplash / Science & Tech',
    license: 'Unsplash Free Commercial',
    description: 'Massive hyperscale AI cluster with illuminated optical networking cables and server racks',
    tags: ['supercomputer', 'datacenter', 'gpu', 'cloud', 'compute', 'infrastructure', 'ai'],
    visualMeaning: 'Massive compute scale, datacenter power, backend infrastructure',
    aspectRatio: '16:9',
    dominantColors: ['#0b0d13', '#00c9a7', '#f0522a'],
    usageRights: 'commercial_allowed',
  },
  // 2. Semiconductor Silicon Wafer & Microchip Architecture
  {
    id: 'photo-silicon-wafer-macro',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=85',
    source: 'Unsplash / Tech Architecture',
    license: 'Unsplash Free Commercial',
    description: '3nm silicon wafer precision macro photography showing shimmering micro-circuitry',
    tags: ['semiconductor', 'wafer', 'chip', 'silicon', 'hardware', 'transistor', 'processor', 'tsmc'],
    visualMeaning: 'Microscopic engineering, silicon design, physical hardware breakthrough',
    aspectRatio: '16:9',
    dominantColors: ['#0b0d13', '#ffd166', '#00c9a7'],
    usageRights: 'commercial_allowed',
  },
  // 3. Cleanroom Semiconductor Fabrication & EUV Lithography
  {
    id: 'photo-cleanroom-fab',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1400&q=85',
    source: 'Unsplash / Industrial Tech',
    license: 'Unsplash Free Commercial',
    description: 'Cleanroom fab facility with automated robotic wafer handlers under monochromatic yellow lighting',
    tags: ['cleanroom', 'fab', 'lithography', 'asml', 'manufacturing', 'semiconductor', 'hardware'],
    visualMeaning: 'Billion-dollar fabrication precision, sovereign industrial race',
    aspectRatio: '16:9',
    dominantColors: ['#1e293b', '#ffd166'],
    usageRights: 'commercial_allowed',
  },
  // 4. Global Satellite Orbital Grid & Transcontinental Dark Fiber
  {
    id: 'photo-orbital-satellite-map',
    type: 'map',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=85',
    source: 'NASA / Unsplash',
    license: 'Public Domain',
    description: 'High-resolution satellite view of nocturnal Earth with illuminated transcontinental data arcs',
    tags: ['global', 'network', 'earth', 'map', 'infrastructure', 'fiber', 'telecom'],
    visualMeaning: 'Global scale, transcontinental dark fiber, worldwide supply chain',
    aspectRatio: '16:9',
    dominantColors: ['#0b0d13', '#00c9a7', '#ffd166'],
    usageRights: 'commercial_allowed',
  },
  // 5. Chief Silicon Architect / Cleanroom Engineer Cutout
  {
    id: 'cutout-silicon-architect',
    type: 'cutout',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
    source: 'Unsplash Editorial',
    license: 'Unsplash Free Commercial',
    description: 'Lead AI systems architect in tech laboratory analyzing real-time neural telemetry',
    tags: ['engineer', 'scientist', 'architect', 'human', 'researcher', 'leadership'],
    visualMeaning: 'Engineering leadership, human ingenuity driving the silicon revolution',
    aspectRatio: '9:16',
    dominantColors: ['#0b0d13', '#f8fafc', '#ffd166'],
    usageRights: 'commercial_allowed',
  },
  // 6. Industrial Robotic Manipulator & Dexterous Actuator
  {
    id: 'photo-robotics-actuator',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1400&q=85',
    source: 'Unsplash / Robotics',
    license: 'Unsplash Free Commercial',
    description: 'High-torque precision robotic manipulator assembling semiconductor test packages',
    tags: ['robotics', 'actuator', 'humanoid', 'automation', 'hardware', 'assembly'],
    visualMeaning: 'Physical execution, robotics crossover, autonomous manufacturing',
    aspectRatio: '16:9',
    dominantColors: ['#0f172a', '#6366f1', '#00c9a7'],
    usageRights: 'commercial_allowed',
  },
  // 7. Liquid Cooling & Thermal Physics Matrix
  {
    id: 'photo-liquid-cooling-rig',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1400&q=85',
    source: 'Unsplash / Tech Hardware',
    license: 'Unsplash Free Commercial',
    description: 'Direct-to-chip liquid cooling block glowing with blue and amber thermal sensors',
    tags: ['cooling', 'thermal', 'power', 'datacenter', 'energy', 'hardware', 'efficiency'],
    visualMeaning: 'Thermodynamic ceiling, extreme power density, cooling innovation',
    aspectRatio: '16:9',
    dominantColors: ['#0b0d13', '#06b6d4', '#f0522a'],
    usageRights: 'commercial_allowed',
  },
  // 8. Abstract Neural Synapse & Vector Flow
  {
    id: 'cutout-neural-ribbon',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=85',
    source: 'Unsplash Editorial',
    license: 'Unsplash Free Commercial',
    description: 'Volumetric glowing neural network ribbons symbolizing trillion-parameter models',
    tags: ['ai', 'neural', 'weights', 'parameters', 'future', 'model'],
    visualMeaning: 'Foundation models, cognitive density, frontier intelligence',
    aspectRatio: '9:16',
    dominantColors: ['#f0522a', '#00c9a7'],
    usageRights: 'commercial_allowed',
  },
];

export function searchAssets(query: string, type?: AssetRecord['type']): AssetRecord[] {
  const q = query.toLowerCase();
  const matched = ASSET_REGISTRY.filter((a) => {
    if (type && a.type !== type && !(type === 'image' && (a.type === 'cutout' || a.type === 'map'))) return false;
    return (
      a.description.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q)) ||
      a.visualMeaning.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q)
    );
  });

  return matched.length > 0 ? matched : [ASSET_REGISTRY[0]];
}

export function getAssetById(id: string): AssetRecord | undefined {
  return ASSET_REGISTRY.find((a) => a.id === id) || ASSET_REGISTRY[0];
}
