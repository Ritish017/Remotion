import type { BrandDNA } from '../video-spec/types';

export const BRAND_PRESETS: Record<string, BrandDNA> = {
  'catalyst-editorial': {
    brandId: 'catalyst-editorial',
    name: 'Catalyst Editorial',
    colors: {
      primary: '#f0522a',
      secondary: '#00c9a7',
      accent: '#ffd166',
      background: '#0b0d13',
      surface: '#161922',
      text: '#f8fafc',
      textMuted: '#94a3b8',
    },
    typography: {
      fontFamilyHeading: 'Inter, system-ui, sans-serif',
      fontFamilyBody: 'Inter, system-ui, sans-serif',
      fontFamilyMono: 'JetBrains Mono, monospace',
      headingWeight: '900',
      bodyWeight: '500',
    },
    motionStyle: 'editorial',
    textures: {
      paperTexture: true,
      grainIntensity: 0.08,
      halftoneEffect: false,
      vignette: true,
    },
    captionStyle: {
      preset: 'vox-editorial',
      fontSize: 44,
      highlightColor: '#ffd166',
      activeTextColor: '#000000',
      inactiveTextColor: '#ffffff',
      boxBackground: 'rgba(11, 13, 19, 0.85)',
    },
  },
  'tech-futurist': {
    brandId: 'tech-futurist',
    name: 'Tech Futurist',
    colors: {
      primary: '#6366f1',
      secondary: '#06b6d4',
      accent: '#a855f7',
      background: '#030712',
      surface: '#0f172a',
      text: '#f8fafc',
      textMuted: '#64748b',
    },
    typography: {
      fontFamilyHeading: 'Inter, sans-serif',
      fontFamilyBody: 'Inter, sans-serif',
      fontFamilyMono: 'JetBrains Mono, monospace',
      headingWeight: '800',
      bodyWeight: '400',
    },
    motionStyle: 'kinetic',
    textures: {
      paperTexture: false,
      grainIntensity: 0.05,
      halftoneEffect: true,
      vignette: true,
    },
    captionStyle: {
      preset: 'karaoke-pill',
      fontSize: 42,
      highlightColor: '#06b6d4',
      activeTextColor: '#030712',
      inactiveTextColor: '#ffffff',
      boxBackground: 'rgba(3, 7, 18, 0.9)',
    },
  },
  'minimal-documentary': {
    brandId: 'minimal-documentary',
    name: 'Minimal Documentary',
    colors: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
      accent: '#38bdf8',
      background: '#09090b',
      surface: '#18181b',
      text: '#fafafa',
      textMuted: '#71717a',
    },
    typography: {
      fontFamilyHeading: 'Inter, sans-serif',
      fontFamilyBody: 'Inter, sans-serif',
      fontFamilyMono: 'monospace',
      headingWeight: '700',
      bodyWeight: '400',
    },
    motionStyle: 'cinematic',
    textures: {
      paperTexture: true,
      grainIntensity: 0.12,
      halftoneEffect: false,
      vignette: true,
    },
    captionStyle: {
      preset: 'minimal-bottom',
      fontSize: 38,
      highlightColor: '#38bdf8',
      activeTextColor: '#09090b',
      inactiveTextColor: '#ffffff',
      boxBackground: 'rgba(9, 9, 11, 0.8)',
    },
  },
};

export function getBrandDNA(brandId?: string): BrandDNA {
  if (brandId && BRAND_PRESETS[brandId]) {
    return BRAND_PRESETS[brandId];
  }
  return BRAND_PRESETS['catalyst-editorial'];
}
