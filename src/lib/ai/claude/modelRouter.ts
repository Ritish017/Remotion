import { modelRegistry, type CreativeIntelligenceTask } from '@/lib/config/models';

export type ModelTask = 
  | 'editorial_planning'
  | 'visual_art_direction'
  | 'storyboard_generation'
  | 'complex_videospec'
  | 'visual_critique'
  | 'scene_redesign'
  | 'code_architecture'
  | 'render_qa_iteration'
  | 'routine_transformation'
  | 'metadata_extraction'
  | 'fast_caption_alignment';

export interface ModelRoutingConfig {
  primaryModel: string;
  fastModel: string;
  enableAdaptiveThinking: boolean;
  maxThinkingEffort: 'max' | 'high' | 'medium' | 'low';
}

export class ModelRouter {
  private static instance: ModelRouter | null = null;
  private config: ModelRoutingConfig;

  private constructor() {
    this.config = {
      primaryModel: modelRegistry.getPrimaryModel(),
      fastModel: modelRegistry.getAuxiliaryModel(),
      enableAdaptiveThinking: true,
      maxThinkingEffort: 'max',
    };
  }

  public static getInstance(): ModelRouter {
    if (!ModelRouter.instance) {
      ModelRouter.instance = new ModelRouter();
    }
    return ModelRouter.instance;
  }

  /**
   * Update configuration at runtime
   */
  public configure(newConfig: Partial<ModelRoutingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Resolve appropriate model ID based on the production task
   */
  public resolveModel(task: ModelTask): string {
    switch (task) {
      case 'editorial_planning':
      case 'visual_art_direction':
      case 'storyboard_generation':
      case 'complex_videospec':
      case 'visual_critique':
      case 'scene_redesign':
      case 'code_architecture':
      case 'render_qa_iteration':
        return this.config.primaryModel;

      case 'routine_transformation':
      case 'metadata_extraction':
      case 'fast_caption_alignment':
      default:
        return this.config.fastModel;
    }
  }

  /**
   * Returns whether adaptive thinking / max reasoning should be attached to this task
   */
  public getThinkingOptions(task: ModelTask): { type: 'enabled'; budget_tokens: number } | undefined {
    if (!this.config.enableAdaptiveThinking) return undefined;

    const isHighStakes = [
      'editorial_planning',
      'visual_art_direction',
      'storyboard_generation',
      'complex_videospec',
      'visual_critique',
      'scene_redesign',
    ].includes(task);

    if (isHighStakes) {
      return {
        type: 'enabled',
        budget_tokens: 4096,
      };
    }
    return undefined;
  }

  public getPrimaryModel(): string {
    return this.config.primaryModel;
  }

  public getFastModel(): string {
    return this.config.fastModel;
  }
}

export const modelRouter = ModelRouter.getInstance();
