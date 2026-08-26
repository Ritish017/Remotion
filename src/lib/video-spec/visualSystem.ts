/**
 * VisualSystem — Locked Project-Level Documentary Visual Language
 * 
 * Defines the comprehensive visual DNA for Vox-style editorial documentaries:
 * - Color palette: base, paper, ink, accent, secondaryAccent, highlight
 * - Texture & Print: paper grain, halftone dot density, vintage offset
 * - Typography System: display, editorial monospace, subhead, source annotations
 * - Stroke & Annotation Language: red marker, blueprint grid, measurement lines
 */

import { z } from 'zod';

export const DocumentaryPaletteSchema = z.object({
  base: z.string().default('#0b0d13'),          // Deep obsidian base
  paper: z.string().default('#f4ede2'),         // Archival paper tint
  ink: z.string().default('#111827'),           // Deep printing ink
  accent: z.string().default('#ffd166'),        // Golden amber accent
  secondaryAccent: z.string().default('#00c9a7'),// Emerald / cyan secondary
  highlight: z.string().default('#f0522a'),      // Crimson editorial highlight / marker
  mutedText: z.string().default('#94a3b8'),      // Technical muted readout
  white: z.string().default('#ffffff'),
});

export type DocumentaryPalette = z.infer<typeof DocumentaryPaletteSchema>;

export const TypographySystemSchema = z.object({
  displayFont: z.string().default('Inter, system-ui, sans-serif'),
  monoFont: z.string().default('JetBrains Mono, monospace'),
  serifFont: z.string().default('Newsreader, Georgia, serif'),
  displayWeight: z.number().default(900),
  headlineScale: z.number().default(1.0),
  enableTracking: z.boolean().default(true),
});

export type TypographySystem = z.infer<typeof TypographySystemSchema>;

export const LockedVisualSystemSchema = z.object({
  id: z.string().default('vox_editorial_dark'),
  name: z.string().default('Vox Editorial Investigation Dark'),
  palette: DocumentaryPaletteSchema.default({}),
  typography: TypographySystemSchema.default({}),
  textures: z.object({
    paperTexture: z.boolean().default(true),
    paperOpacity: z.number().default(0.08),
    grainIntensity: z.number().default(0.08),
    vignetteOpacity: z.number().default(0.40),
    blueprintGrid: z.boolean().default(true),
  }).default({}),
  halftone: z.object({
    enabled: z.boolean().default(true),
    dotSize: z.number().default(4),
    duotone: z.boolean().default(true),
    contrast: z.number().default(1.35),
    offsetShadow: z.boolean().default(true),
  }).default({}),
  editorialMarks: z.object({
    markerColor: z.string().default('#ef4444'),
    strokeWidth: z.number().default(3.5),
    arrowStyle: z.enum(['hand_drawn', 'technical_callout', 'minimal']).default('hand_drawn'),
    stampStyle: z.enum(['verified_red', 'declassified_amber', 'patent_cyan']).default('verified_red'),
  }).default({}),
  cameraStyle: z.enum(['subtle_drift', 'cinematic_push', 'dynamic_orbit', 'architectural_pan']).default('cinematic_push'),
  captionStyle: z.object({
    bottomOffsetPx: z.number().default(120),
    maxLines: z.number().default(2),
    fontSizePx: z.number().default(34),
    glassmorphism: z.boolean().default(true),
  }).default({}),
});

export type LockedVisualSystem = z.infer<typeof LockedVisualSystemSchema>;

/**
 * Standard Documentary Visual System Presets
 */
export const DOCUMENTARY_PRESETS: Record<string, LockedVisualSystem> = {
  vox_investigation_dark: {
    id: 'vox_investigation_dark',
    name: 'Vox Investigation (Obsidian / Amber / Emerald)',
    palette: {
      base: '#0b0d13',
      paper: '#f4ede2',
      ink: '#0f172a',
      accent: '#ffd166',
      secondaryAccent: '#00c9a7',
      highlight: '#f0522a',
      mutedText: '#94a3b8',
      white: '#ffffff',
    },
    typography: {
      displayFont: 'Inter, system-ui, sans-serif',
      monoFont: 'JetBrains Mono, monospace',
      serifFont: 'Newsreader, serif',
      displayWeight: 900,
      headlineScale: 1.0,
      enableTracking: true,
    },
    textures: {
      paperTexture: true,
      paperOpacity: 0.08,
      grainIntensity: 0.08,
      vignetteOpacity: 0.40,
      blueprintGrid: true,
    },
    halftone: {
      enabled: true,
      dotSize: 4,
      duotone: true,
      contrast: 1.35,
      offsetShadow: true,
    },
    editorialMarks: {
      markerColor: '#ef4444',
      strokeWidth: 3.5,
      arrowStyle: 'hand_drawn',
      stampStyle: 'verified_red',
    },
    cameraStyle: 'cinematic_push',
    captionStyle: {
      bottomOffsetPx: 120,
      maxLines: 2,
      fontSizePx: 34,
      glassmorphism: true,
    },
  },
  bloomberg_cleanroom_cyan: {
    id: 'bloomberg_cleanroom_cyan',
    name: 'Bloomberg Cleanroom (Slate / Cyan / Goldenrod)',
    palette: {
      base: '#080c14',
      paper: '#e2e8f0',
      ink: '#020617',
      accent: '#38bdf8',
      secondaryAccent: '#fbbf24',
      highlight: '#f43f5e',
      mutedText: '#64748b',
      white: '#ffffff',
    },
    typography: {
      displayFont: 'Inter, system-ui, sans-serif',
      monoFont: 'JetBrains Mono, monospace',
      serifFont: 'Georgia, serif',
      displayWeight: 900,
      headlineScale: 1.0,
      enableTracking: true,
    },
    textures: {
      paperTexture: true,
      paperOpacity: 0.06,
      grainIntensity: 0.06,
      vignetteOpacity: 0.35,
      blueprintGrid: true,
    },
    halftone: {
      enabled: true,
      dotSize: 3,
      duotone: true,
      contrast: 1.4,
      offsetShadow: true,
    },
    editorialMarks: {
      markerColor: '#f43f5e',
      strokeWidth: 3.0,
      arrowStyle: 'technical_callout',
      stampStyle: 'declassified_amber',
    },
    cameraStyle: 'dynamic_orbit',
    captionStyle: {
      bottomOffsetPx: 120,
      maxLines: 2,
      fontSizePx: 34,
      glassmorphism: true,
    },
  },
};
