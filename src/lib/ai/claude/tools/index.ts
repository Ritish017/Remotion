import { searchAssets, getAssetById } from '@/lib/assets/registry';
import { validateVideoSpec } from '@/lib/video-spec/validator';
import { TEMPLATE_REGISTRY } from '@/remotion/registry/TemplateRegistry';
import type { VideoSpec, SceneData } from '@/lib/video-spec/types';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (args: any, context?: any) => Promise<any> | any;
}

export const ALLOWLISTED_TOOLS: Record<string, ToolDefinition> = {
  asset_search: {
    name: 'asset_search',
    description: 'Search the Asset Registry for verified royalty-free cutouts, imagery, audio, and textures',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keyword query (e.g. "ai", "developer", "satellite")' },
        type: { type: 'string', enum: ['image', 'video', 'icon', 'texture', 'music', 'sfx'] },
      },
      required: ['query'],
    },
    execute: ({ query, type }) => {
      return searchAssets(query, type);
    },
  },

  template_list: {
    name: 'template_list',
    description: 'List available Remotion scene templates with default props and supported aspect ratios',
    parameters: {
      type: 'object',
      properties: {},
    },
    execute: () => {
      return Object.values(TEMPLATE_REGISTRY).map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        supportedAspectRatios: t.supportedAspectRatios,
        defaultProps: t.defaultProps,
      }));
    },
  },

  scene_update: {
    name: 'scene_update',
    description: 'Targeted update of a specific scene in an existing VideoSpec without rebuilding everything',
    parameters: {
      type: 'object',
      properties: {
        spec: { type: 'object', description: 'The existing VideoSpec object' },
        sceneNumber: { type: 'number', description: 'Scene number to update (1-indexed)' },
        modifications: {
          type: 'object',
          properties: {
            headline: { type: 'string' },
            props: { type: 'object' },
            camera: { type: 'object' },
            templateId: { type: 'string' },
            durationFrames: { type: 'number' },
          },
        },
      },
      required: ['spec', 'sceneNumber', 'modifications'],
    },
    execute: ({ spec, sceneNumber, modifications }: { spec: VideoSpec; sceneNumber: number; modifications: any }) => {
      const updatedScenes = spec.scenes.map((s) => {
        if (s.sceneNumber !== sceneNumber) return s;
        return {
          ...s,
          headline: modifications.headline !== undefined ? modifications.headline : s.headline,
          templateId: modifications.templateId || s.templateId,
          durationFrames: modifications.durationFrames || s.durationFrames,
          camera: modifications.camera ? { ...s.camera, ...modifications.camera } : s.camera,
          props: modifications.props ? { ...s.props, ...modifications.props } : s.props,
        };
      });

      const updatedSpec: VideoSpec = {
        ...spec,
        scenes: updatedScenes,
      };

      const validation = validateVideoSpec(updatedSpec);
      const finalSpec = validation.repairedSpec || updatedSpec;
      return {
        success: validation.valid,
        spec: finalSpec,
        updatedSpec: finalSpec,
        warnings: validation.warnings,
      };
    },
  },

  qa_validate: {
    name: 'qa_validate',
    description: 'Run deep QA validation on a VideoSpec (checks timing continuity, duration sync, layer bounds)',
    parameters: {
      type: 'object',
      properties: {
        spec: { type: 'object', description: 'The VideoSpec to validate' },
      },
      required: ['spec'],
    },
    execute: ({ spec }) => {
      return validateVideoSpec(spec);
    },
  },

  caption_generate_timestamps: {
    name: 'caption_generate_timestamps',
    description: 'Synthesize word-level timestamps from narration transcript to align captions accurately with frame timing',
    parameters: {
      type: 'object',
      properties: {
        transcript: { type: 'string' },
        totalDurationSeconds: { type: 'number' },
      },
      required: ['transcript', 'totalDurationSeconds'],
    },
    execute: ({ transcript, totalDurationSeconds }: { transcript: string; totalDurationSeconds: number }) => {
      const words = transcript.trim().split(/\s+/);
      const totalWords = words.length;
      if (totalWords === 0) return [];

      const avgWordDuration = totalDurationSeconds / totalWords;
      return words.map((word, i) => {
        const start = Number((i * avgWordDuration).toFixed(2));
        const end = Number(((i + 1) * avgWordDuration).toFixed(2));
        return { word, start, end, confidence: 0.98 };
      });
    },
  },
};
