export interface AssetRecord {
  id: string;
  type: 'image' | 'video' | 'icon' | 'logo' | 'map' | 'music' | 'voice' | 'sfx' | 'font' | 'texture';
  url: string;
  source: string;
  license: string;
  description: string;
  tags: string[];
  visualMeaning: string;
  aspectRatio?: '9:16' | '16:9' | '1:1';
  dominantColors?: string[];
  channelId?: string;
  usageRights: string;
}

export const ASSET_REGISTRY: AssetRecord[] = [
  // 1. Futuristic Computing & Neural Architectures
  {
    id: 'photo-neural-server',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1080&q=80',
    source: 'Unsplash / Science & Tech',
    license: 'Unsplash Free Commercial',
    description: 'High-density GPU server cluster glowing in dark datacenter with fiber optic cabling',
    tags: ['server', 'datacenter', 'gpu', 'cloud', 'compute', 'hardware'],
    visualMeaning: 'Massive compute scale, datacenter power, backend infrastructure',
    dominantColors: ['#0f172a', '#06b6d4'],
    usageRights: 'commercial_allowed',
  },
  // 2. Semiconductor Silicon Wafer
  {
    id: 'photo-silicon-wafer',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1080&q=80',
    source: 'Unsplash / Tech Architecture',
    license: 'Unsplash Free Commercial',
    description: 'Ultra-precision circuit board and microchip processor macro photography',
    tags: ['chip', 'semiconductor', 'silicon', 'hardware', 'processor', 'circuit'],
    visualMeaning: 'Microscopic engineering, silicon design, hardware innovation',
    dominantColors: ['#00c9a7', '#1e293b'],
    usageRights: 'commercial_allowed',
  },
  // 3. Robotic Actuator & Robotics
  {
    id: 'photo-robotics-arm',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1080&q=80',
    source: 'Unsplash / Robotics',
    license: 'Unsplash Free Commercial',
    description: 'Industrial robotic actuator and humanoid mechanics in cleanroom lab',
    tags: ['robotics', 'humanoid', 'actuator', 'motor', 'automation', 'hardware'],
    visualMeaning: 'Physical automation, mechanical dexterity, robotics breakthrough',
    dominantColors: ['#f8fafc', '#6366f1'],
    usageRights: 'commercial_allowed',
  },
  // 4. Global Satellite Infrastructure
  {
    id: 'photo-satellite-earth',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    source: 'NASA / Unsplash',
    license: 'Public Domain',
    description: 'Orbital night view of city lights and interconnected network grid',
    tags: ['global', 'network', 'earth', 'infrastructure', 'map'],
    visualMeaning: 'Global scale, internet backbone, worldwide connectivity',
    dominantColors: ['#0d131f', '#ffd166'],
    usageRights: 'commercial_allowed',
  },
  // 5. Artificial Intelligence Presenter / Scientist
  {
    id: 'cutout-data-engineer',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    source: 'Unsplash Editorial',
    license: 'Unsplash Free Commercial',
    description: 'Professional tech researcher analyzing real-time data visualizer',
    tags: ['developer', 'human', 'engineer', 'ai', 'researcher'],
    visualMeaning: 'Engineering precision, human-AI collaboration',
    dominantColors: ['#f8fafc', '#0b0d13'],
    usageRights: 'commercial_allowed',
  },
  // 6. Neural Network Abstract Art
  {
    id: 'cutout-neural-abstract',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    source: 'Unsplash Editorial',
    license: 'Unsplash Free Commercial',
    description: 'Abstract kinetic glowing neural ribbons and volumetric light',
    tags: ['ai', 'tech', 'future', 'cyberpunk', 'abstract'],
    visualMeaning: 'Innovation, futuristic breakthrough, cognitive shift',
    dominantColors: ['#00c9a7', '#f0522a'],
    usageRights: 'commercial_allowed',
  },
];

export function searchAssets(query: string, type?: AssetRecord['type']): AssetRecord[] {
  const q = query.toLowerCase();
  return ASSET_REGISTRY.filter((a) => {
    if (type && a.type !== type) return false;
    return (
      a.description.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q)) ||
      a.visualMeaning.toLowerCase().includes(q)
    );
  });
}

export function getAssetById(id: string): AssetRecord | undefined {
  return ASSET_REGISTRY.find((a) => a.id === id);
}
