/**
 * ScriptVisualPlanner — Script-to-Timeline Documentary Director
 * 
 * Core Production Principle: SCRIPT = TIMELINE
 * Transforms voiceover text and word timestamps into a synchronized timeline storyboard
 * where EVERY SPOKEN IDEA HAS AN INTENTIONAL VISUAL IDEA across 6 spatial layers.
 */

import { z } from 'zod';
import { ModelRouter, modelRouter } from '../modelRouter';
import { getAnthropicClient } from '../client';
import { LockedVisualSystem, DOCUMENTARY_PRESETS } from '@/lib/video-spec/visualSystem';

export const TimelineVisualBeatSchema = z.object({
  id: z.string(),
  startTime: z.number(),
  endTime: z.number(),
  narration: z.string(),
  purpose: z.enum(['hook', 'problem', 'evidence', 'data_proof', 'geography', 'technical_deep_dive', 'human_element', 'outro_cta']),
  visualMetaphor: z.string(),
  visualFamily: z.enum([
    'cinematic-photo',
    'editorial-paper',
    'archival-document',
    'halftone-cutout',
    'technical-diagram',
    'data-story',
    'geographic-story',
    'network-story',
    'human-subject',
    'hardware-macro',
    'environment',
    'kinetic-type',
    'timeline',
    'comparison',
    'newspaper',
    'satellite',
  ]),
  layers: z.object({
    background: z.object({
      type: z.enum(['dark_gradient', 'blueprint_grid', 'archival_paper', 'macro_environment']),
      texture: z.string().optional(),
    }),
    midground: z.array(z.object({
      id: z.string(),
      type: z.enum(['chart', 'map', 'schematic', 'document_card', 'hardware_component']),
      semanticQuery: z.string(),
      scale: z.number().default(1.0),
      x: z.number().default(0),
      y: z.number().default(0),
    })).default([]),
    subject: z.object({
      semanticQuery: z.string(),
      treatment: z.enum(['halftone', 'duotone', 'photographic_macro', 'vector_schematic']),
      canvasCoveragePct: z.number().default(65), // 60-95% coverage requirement
      x: z.number().default(0),
      y: z.number().default(0),
    }),
    foreground: z.array(z.object({
      type: z.enum(['editorial_mark', 'badge', 'telemetry_pill', 'measurement_callout', 'stamp']),
      label: z.string(),
      sublabel: z.string().optional(),
      color: z.string().optional(),
    })).default([]),
    typography: z.object({
      eyebrow: z.string().optional(),
      headline: z.string(),
      giantKeyword: z.string().optional(),
      statistic: z.string().optional(),
      subhead: z.string().optional(),
      source: z.string().optional(),
    }),
  }),
  motion: z.object({
    semanticPrimitive: z.enum([
      'SPRING_IN', 'SPRING_OUT', 'STAGGER_REVEAL', 'CAMERA_PUSH', 'CAMERA_PULL',
      'PARALLAX_TRAVEL', 'SUBJECT_REVEAL', 'MASK_REVEAL', 'TEXT_TAKEOVER', 'MARKER_DRAW',
      'IMAGE_SLIDE', 'FOREGROUND_WIPE', 'DEPTH_SHIFT', 'ORBIT', 'ZOOM_THROUGH', 'MATCH_CUT'
    ]).default('SPRING_IN'),
    intensity: z.number().default(1.0),
  }),
  camera: z.object({
    type: z.enum(['push', 'pull', 'orbit', 'drift', 'pan-left', 'pan-right']),
    intensity: z.number().default(0.20),
  }),
});

export type TimelineVisualBeat = z.infer<typeof TimelineVisualBeatSchema>;

export class ScriptVisualPlanner {
  private router: ModelRouter;

  constructor() {
    this.router = modelRouter;
  }

  /**
   * Plan timeline visual beats from a complete script and optional word timestamps
   */
  public async planTimeline(
    scriptNarration: string,
    topic: string,
    targetDurationSeconds: number = 45,
    visualSystem: LockedVisualSystem = DOCUMENTARY_PRESETS.vox_investigation_dark
  ): Promise<TimelineVisualBeat[]> {
    const client = getAnthropicClient();
    const model = this.router.resolveModel('editorial_planning');
    const thinking = this.router.getThinkingOptions('editorial_planning');

    const prompt = `You are an elite Vox & Bloomberg Documentary Visual Director and Motion Graphics Story Architect.
Your task is to transform this narration into a frame-exact Timeline Storyboard.

PRODUCTION CRITERIA (MANDATORY):
1. SCRIPT = TIMELINE: Every spoken sentence/idea MUST have a dedicated visual idea (VisualBeat).
2. FULL-CANVAS COMPOSITION: Primary subjects must occupy 60% to 95% of meaningful canvas.
3. NO DASHBOARD CARDS: Do NOT produce small cards in empty space. The composition is built spatially across 6 depth layers.
4. VISUAL METAPHORS: For every abstract concept, create a concrete visual metaphor (e.g. semiconductor scaling -> extreme wafer zoom -> giant 3nm logic bus).
5. 16 VISUAL FAMILIES: Use diverse families across beats (cinematic-photo, editorial-paper, halftone-cutout, technical-diagram, data-story, geographic-story, etc.).

TOPIC: "${topic}"
TARGET DURATION: ${targetDurationSeconds} seconds
LOCKED VISUAL SYSTEM: ${visualSystem.name}

SCRIPT NARRATION:
"""
${scriptNarration}
"""

Return a strict JSON array of TimelineVisualBeat objects matching the schema.`;

    try {
      const response = await client.messages.create({
        model,
        max_tokens: 4096,
        thinking: thinking as any,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content.find((c) => c.type === 'text')?.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.warn('[ScriptVisualPlanner] AI planning failed, applying fallback timeline generator:', err);
    }

    return this.generateFallbackTimeline(scriptNarration, targetDurationSeconds);
  }

  private generateFallbackTimeline(script: string, totalDuration: number): TimelineVisualBeat[] {
    const sentences = script.split(/(?<=[.?!])\s+/).filter((s) => s.trim().length > 0);
    const beatDuration = totalDuration / Math.max(1, sentences.length);

    return sentences.map((sentence, idx) => {
      const startTime = idx * beatDuration;
      const endTime = (idx + 1) * beatDuration;

      return {
        id: `beat_${idx + 1}`,
        startTime,
        endTime,
        narration: sentence,
        purpose: idx === 0 ? 'hook' : idx === sentences.length - 1 ? 'outro_cta' : 'evidence',
        visualMetaphor: `Documentary macro evidence for: ${sentence.slice(0, 30)}...`,
        visualFamily: idx % 2 === 0 ? 'technical-diagram' : 'data-story',
        layers: {
          background: { type: 'blueprint_grid' },
          midground: [{ id: `mg_${idx}`, type: 'chart', semanticQuery: 'optical interconnect density', scale: 1.0, x: 0, y: 0 }],
          subject: { semanticQuery: '3nm silicon wafer', treatment: 'halftone', canvasCoveragePct: 75, x: 0, y: 0 },
          foreground: [{ type: 'editorial_mark', label: 'VERIFIED // 2026', color: '#ef4444' }],
          typography: {
            eyebrow: 'DOCUMENTARY EVIDENCE',
            headline: 'EXPONENTIAL SCALING',
            statistic: '24X',
            source: 'IEEE BENCHMARKS',
          },
        },
        motion: { semanticPrimitive: 'SPRING_IN', intensity: 1.0 },
        camera: { type: 'push', intensity: 0.20 },
      };
    });
  }
}

export const scriptVisualPlanner = new ScriptVisualPlanner();
