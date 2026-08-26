import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_SHOWCASE_SPEC } from '@/lib/video-spec/sampleSpec';
import { validateVideoSpec } from '@/lib/video-spec/validator';
import { ALLOWLISTED_TOOLS } from '@/lib/ai/claude/tools';
import { anthropic, DEFAULT_MODEL, FAST_MODEL } from '@/lib/ai/claude/client';
import type { VideoSpec } from '@/lib/video-spec/types';

export async function GET() {
  return NextResponse.json({ spec: SAMPLE_SHOWCASE_SPEC });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, spec, sceneNumber, modifications, userPrompt } = body;

    if (action === 'update_scene') {
      let resolvedMods = modifications || {};

      // If userPrompt is provided and Claude API is reachable, query Claude for intelligent scene refinement
      if (userPrompt && process.env.ANTHROPIC_API_KEY) {
        try {
          const currentScene = spec?.scenes?.find((s: any) => s.sceneNumber === sceneNumber) || spec?.scenes?.[0];
          const response = await anthropic.messages.create({
            model: FAST_MODEL,
            max_tokens: 1000,
            system: `You are an expert video director for Remotion video compositions.
Given an existing scene and a user edit instruction, return ONLY a valid JSON object with the updated properties for this scene.
Supported properties:
- headline (string)
- templateId (e.g. hook-primary, editorial-quote, chart-bar, map-geo, cutout-explainer, statistic-big, photo-archive, timeline-flow, comparison-grid, ui-code, outro-cta)
- camera: { type: "push" | "pull" | "pan-left" | "pan-right" | "orbit" | "static", intensity: number (0.1 to 0.5), easing: "linear" | "ease-in" | "ease-out" | "ease-in-out" }
- props: object with updated scene-specific parameters
- narrationText: string
Return JSON only, with no markdown fences or other text.`,
            messages: [
              {
                role: 'user',
                content: `Scene: ${JSON.stringify(currentScene)}\nInstruction: "${userPrompt}"`,
              },
            ],
          });

          const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
          let cleanJson = text;
          if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
          else if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
          if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
          cleanJson = cleanJson.trim();

          const parsed = JSON.parse(cleanJson);
          resolvedMods = {
            ...resolvedMods,
            ...parsed,
            props: {
              ...(resolvedMods.props || {}),
              ...(parsed.props || {}),
            },
            camera: {
              ...(resolvedMods.camera || {}),
              ...(parsed.camera || {}),
            },
          };
        } catch (claudeErr: any) {
          console.warn('Claude refinement fallback to direct mods:', claudeErr.message);
        }
      }

      const result = ALLOWLISTED_TOOLS.scene_update.execute({
        spec,
        sceneNumber: Number(sceneNumber) || 1,
        modifications: resolvedMods,
      });

      return NextResponse.json(result);
    }

    if (action === 'validate') {
      const result = validateVideoSpec(spec);
      return NextResponse.json(result);
    }

    // Default: validate given spec
    const validation = validateVideoSpec(spec || body);
    return NextResponse.json(validation);
  } catch (error: any) {
    console.error('Spec API route error:', error);
    return NextResponse.json({ error: error.message || 'Spec operation failed' }, { status: 500 });
  }
}
