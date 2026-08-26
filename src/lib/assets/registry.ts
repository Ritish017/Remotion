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
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1800&q=85',
    source: 'Unsplash / Science & Tech',
    license: 'Unsplash Free Commercial',
    description: 'Massive hyperscale AI cluster with illuminated optical networking cables and server racks',
    tags: ['supercomputer', 'datacenter', 'gpu', 'cloud', 'compute', 'infrastructure', 'ai', 'cluster', 'servers'],
    visualMeaning: 'Massive compute scale, datacenter power, backend infrastructure',
    aspectRatio: '16:9',
    dominantColors: ['#0b0d13', '#00c9a7', '#f0522a'],
    usageRights: 'commercial_allowed',
  },
  // 2. Semiconductor Silicon Wafer & Microchip Architecture
  {
    id: 'photo-silicon-wafer-macro',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1800&q=85',
    source: 'Unsplash / Tech Architecture',
    license: 'Unsplash Free Commercial',
    description: '3nm silicon wafer precision macro photography showing shimmering micro-circuitry',
    tags: ['semiconductor', 'wafer', 'chip', 'silicon', 'hardware', 'transistor', 'processor', 'tsmc', 'microchip'],
    visualMeaning: 'Microscopic engineering, silicon design, physical hardware breakthrough',
    aspectRatio: '16:9',
    dominantColors: ['#0b0d13', '#ffd166', '#00c9a7'],
    usageRights: 'commercial_allowed',
  },
  // 3. Cleanroom Semiconductor Fabrication & EUV Lithography
  {
    id: 'photo-cleanroom-fab',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1800&q=85',
    source: 'Unsplash / Industrial Tech',
    license: 'Unsplash Free Commercial',
    description: 'Cleanroom fab facility with automated robotic wafer handlers under monochromatic yellow lighting',
    tags: ['cleanroom', 'fab', 'lithography', 'asml', 'manufacturing', 'semiconductor', 'hardware', 'lab', 'laboratory'],
    visualMeaning: 'Billion-dollar fabrication precision, sovereign industrial race',
    aspectRatio: '16:9',
    dominantColors: ['#1e293b', '#ffd166'],
    usageRights: 'commercial_allowed',
  },
  // 4. Global Satellite Orbital Grid & Transcontinental Dark Fiber
  {
    id: 'photo-orbital-satellite-map',
    type: 'map',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1800&q=85',
    source: 'NASA / Unsplash',
    license: 'Public Domain',
    description: 'High-resolution satellite view of nocturnal Earth with illuminated transcontinental data arcs',
    tags: ['global', 'network', 'earth', 'map', 'infrastructure', 'fiber', 'telecom', 'satellite', 'orbit', 'world'],
    visualMeaning: 'Global scale, transcontinental dark fiber, worldwide supply chain',
    aspectRatio: '16:9',
    dominantColors: ['#0b0d13', '#00c9a7', '#ffd166'],
    usageRights: 'commercial_allowed',
  },
  // 5. Commercial Fusion Power & Tokamak Magnetic Confinement
  {
    id: 'photo-fusion-tokamak-plasma',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1800&q=85',
    source: 'Unsplash / Physics Research',
    license: 'Unsplash Free Commercial',
    description: 'Thermonuclear fusion chamber with luminescent toroidal magnetic confinement and glowing plasma',
    tags: ['fusion', 'tokamak', 'stellarator', 'plasma', 'reactor', 'physics', 'energy', 'superconducting', 'iter', 'nuclear'],
    visualMeaning: 'Clean infinite energy, thermonuclear containment, extreme physics engineering',
    aspectRatio: '16:9',
    dominantColors: ['#0b0d13', '#64e2c5', '#ffc857'],
    usageRights: 'commercial_allowed',
  },
  // 6. Autonomous Vehicle Sensor Suite & LiDAR Point Cloud
  {
    id: 'photo-autonomous-vehicle-lidar',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1800&q=85',
    source: 'Unsplash / Autonomous Mobility',
    license: 'Unsplash Free Commercial',
    description: 'Autonomous vehicle sensor pod analyzing 3D laser point cloud and road telemetry in real time',
    tags: ['autonomous', 'vehicle', 'lidar', 'radar', 'vision', 'self-driving', 'robotics', 'car', 'perception', 'sensors'],
    visualMeaning: 'Machine perception, spatial AI, real-time autonomous navigation',
    aspectRatio: '16:9',
    dominantColors: ['#090b10', '#00c9a7', '#ef6544'],
    usageRights: 'commercial_allowed',
  },
  // 7. Ultra-Low Latency High-Frequency Trading & Global Financial Rails
  {
    id: 'photo-financial-telemetry-networks',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1800&q=85',
    source: 'Unsplash / Global Markets',
    license: 'Unsplash Free Commercial',
    description: 'High-frequency algorithmic trading telemetry terminals and optical settlement switches',
    tags: ['finance', 'payment', 'transaction', 'millisecond', 'hft', 'banking', 'network', 'settlement', 'fintech', 'money', 'trading'],
    visualMeaning: 'Sub-millisecond financial execution, global liquidity rails, sovereign transactions',
    aspectRatio: '16:9',
    dominantColors: ['#0b0d13', '#ffc857', '#64e2c5'],
    usageRights: 'commercial_allowed',
  },
  // 8. Industrial Robotics & Dexterous Manipulator
  {
    id: 'photo-robotics-actuator',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1800&q=85',
    source: 'Unsplash / Robotics',
    license: 'Unsplash Free Commercial',
    description: 'High-torque precision robotic manipulator assembling semiconductor test packages',
    tags: ['robotics', 'actuator', 'humanoid', 'automation', 'hardware', 'assembly', 'robot'],
    visualMeaning: 'Physical execution, robotics crossover, autonomous manufacturing',
    aspectRatio: '16:9',
    dominantColors: ['#0f172a', '#6366f1', '#00c9a7'],
    usageRights: 'commercial_allowed',
  },
  // 9. Quantum Processor & Dilution Cryostat
  {
    id: 'photo-quantum-cryostat',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1800&q=85',
    source: 'Unsplash / Quantum Physics',
    license: 'Unsplash Free Commercial',
    description: 'Golden quantum computing dilution refrigerator chandelier with gold microwave wiring',
    tags: ['quantum', 'qubit', 'cryostat', 'physics', 'superconducting', 'cryogenic', 'processor'],
    visualMeaning: 'Quantum supremacy, sub-Kelvin computing, physical limits of computation',
    aspectRatio: '16:9',
    dominantColors: ['#0b0d13', '#ffd166', '#f0522a'],
    usageRights: 'commercial_allowed',
  },
];

export function searchAssets(query: string, type?: AssetRecord['type']): AssetRecord[] {
  const q = query.toLowerCase().trim();
  const keywords = q.split(/[\s,_\-+/]+/).filter(w => w.length > 2);

  const scored = ASSET_REGISTRY.map((record) => {
    let score = 0;
    const desc = record.description.toLowerCase();
    const meaning = record.visualMeaning.toLowerCase();
    const id = record.id.toLowerCase();

    for (const kw of keywords) {
      if (record.tags.some(t => t.includes(kw) || kw.includes(t))) score += 10;
      if (desc.includes(kw)) score += 5;
      if (meaning.includes(kw)) score += 4;
      if (id.includes(kw)) score += 8;
    }

    if (type && record.type === type) score += 3;
    return { record, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter(s => s.score > 0).map(s => s.record);

  return matched.length > 0 ? matched : [ASSET_REGISTRY[0]];
}

export function getAssetById(id: string): AssetRecord | undefined {
  return ASSET_REGISTRY.find((a) => a.id === id) || ASSET_REGISTRY[0];
}
