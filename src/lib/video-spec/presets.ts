import type { AspectRatio } from './types';

export interface PlatformPreset {
  id: string;
  name: string;
  format: AspectRatio;
  width: number;
  height: number;
  fps: number;
  safeZone: {
    topPaddingPct: number;
    bottomPaddingPct: number;
    horizontalPaddingPct: number;
  };
  uiExclusionZones?: Array<{
    name: string;
    topPct: number;
    leftPct: number;
    widthPct: number;
    heightPct: number;
  }>;
}

export const PLATFORM_PRESETS: Record<string, PlatformPreset> = {
  YouTubeLandscape: {
    id: 'youtube-landscape',
    name: 'YouTube Landscape (16:9)',
    format: '16:9',
    width: 1920,
    height: 1080,
    fps: 30,
    safeZone: {
      topPaddingPct: 5,
      bottomPaddingPct: 8,
      horizontalPaddingPct: 5,
    },
  },

  YouTubeShorts: {
    id: 'youtube-shorts',
    name: 'YouTube Shorts (9:16)',
    format: '9:16',
    width: 1080,
    height: 1920,
    fps: 30,
    safeZone: {
      topPaddingPct: 8,
      bottomPaddingPct: 22, // Space for subscribe & title UI
      horizontalPaddingPct: 8,
    },
    uiExclusionZones: [
      { name: 'Bottom Action Bar', topPct: 80, leftPct: 0, widthPct: 100, heightPct: 20 },
      { name: 'Right Side Buttons', topPct: 40, leftPct: 85, widthPct: 15, heightPct: 45 },
    ],
  },

  InstagramReels: {
    id: 'instagram-reels',
    name: 'Instagram Reels (9:16)',
    format: '9:16',
    width: 1080,
    height: 1920,
    fps: 30,
    safeZone: {
      topPaddingPct: 10,
      bottomPaddingPct: 25, // Space for caption & profile bar
      horizontalPaddingPct: 8,
    },
    uiExclusionZones: [
      { name: 'Bottom Caption Overlay', topPct: 75, leftPct: 0, widthPct: 100, heightPct: 25 },
      { name: 'Right Engagement Icons', topPct: 45, leftPct: 85, widthPct: 15, heightPct: 40 },
    ],
  },

  InstagramSquare: {
    id: 'instagram-square',
    name: 'Instagram Square (1:1)',
    format: '1:1',
    width: 1080,
    height: 1080,
    fps: 30,
    safeZone: {
      topPaddingPct: 8,
      bottomPaddingPct: 8,
      horizontalPaddingPct: 8,
    },
  },
};

export function getPlatformPreset(presetId: string): PlatformPreset {
  return PLATFORM_PRESETS[presetId] || PLATFORM_PRESETS.YouTubeShorts;
}
