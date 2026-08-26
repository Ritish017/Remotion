/**
 * ==============================================================================
 * Catalyst Content OS — Centralized Model Policy Hub
 * ==============================================================================
 * 
 * CRITICAL MODEL POLICY (PART 4):
 * For all creative intelligence tasks, use ONLY the highest-quality available
 * model configured in this application.
 * 
 * Silent downgrades to small, cheap, fast, or low-quality models are STRICTLY
 * PROHIBITED unless there is an explicit technical failure reported to the user.
 * 
 * All agents and directors throughout Catalyst MUST resolve models through this
 * centralized configuration hub. NEVER scatter model IDs throughout the codebase.
 */

export type CreativeIntelligenceTask =
  | 'campaign_strategy'
  | 'content_planning'
  | 'topic_selection'
  | 'research_reasoning'
  | 'storytelling'
  | 'script_writing'
  | 'hooks'
  | 'narrative_structure'
  | 'scene_planning'
  | 'visual_direction'
  | 'motion_direction'
  | 'editing_decisions'
  | 'transition_decisions'
  | 'image_selection'
  | 'voice_direction'
  | 'caption_direction'
  | 'quality_evaluation'
  | 'visual_critique'
  | 'revision'
  | 'final_production_decisions';

export interface ModelPolicyConfig {
  /** Flagship creative production model (Claude 3.5 Sonnet / Opus 5 / Flock Primary) */
  flagshipModelId: string;
  /** Fast secondary transformation model (for pure schema serialization / token math only) */
  auxiliaryModelId: string;
  /** Adaptive thinking token budget for high-stakes creative direction */
  adaptiveThinkingTokens: number;
  /** Whether silent downgrades are strictly forbidden */
  strictNoDowngrade: boolean;
  /** Provider identifier */
  provider: 'anthropic' | 'google' | 'openai' | 'flock';
}

function resolveDefaultFlagshipModel(): string {
  if (process.env.CLAUDE_PRIMARY_MODEL) return process.env.CLAUDE_PRIMARY_MODEL;
  if (process.env.CLAUDE_MODEL) return process.env.CLAUDE_MODEL;
  if (process.env.ANTHROPIC_MODEL_PRIMARY) return process.env.ANTHROPIC_MODEL_PRIMARY;
  if (process.env.FLOCK_PRIMARY_MODEL) return process.env.FLOCK_PRIMARY_MODEL;
  if (process.env.GEMINI_MODEL_PRIMARY) return process.env.GEMINI_MODEL_PRIMARY;
  return 'claude-3-5-sonnet-latest';
}

function resolveDefaultAuxiliaryModel(): string {
  if (process.env.CLAUDE_FAST_MODEL) return process.env.CLAUDE_FAST_MODEL;
  if (process.env.ANTHROPIC_MODEL_FAST) return process.env.ANTHROPIC_MODEL_FAST;
  return 'claude-3-5-haiku-latest';
}

export class ModelRegistry {
  private static instance: ModelRegistry | null = null;
  private config: ModelPolicyConfig;

  private constructor() {
    this.config = {
      flagshipModelId: resolveDefaultFlagshipModel(),
      auxiliaryModelId: resolveDefaultAuxiliaryModel(),
      adaptiveThinkingTokens: 4096,
      strictNoDowngrade: true,
      provider: 'anthropic',
    };
  }

  public static getInstance(): ModelRegistry {
    if (!ModelRegistry.instance) {
      ModelRegistry.instance = new ModelRegistry();
    }
    return ModelRegistry.instance;
  }

  /**
   * Get the mandatory highest-capability production model for any creative task.
   */
  public getCreativeModel(task: CreativeIntelligenceTask): string {
    // All creative intelligence tasks strictly receive the flagship model
    return this.config.flagshipModelId;
  }

  /**
   * Get the primary production model ID.
   */
  public getPrimaryModel(): string {
    return this.config.flagshipModelId;
  }

  /**
   * Get the auxiliary utility model ID (only for non-creative formatting).
   */
  public getAuxiliaryModel(): string {
    return this.config.auxiliaryModelId;
  }

  /**
   * Get reasoning / thinking parameters for high-stakes director tasks.
   */
  public getThinkingConfig(task: CreativeIntelligenceTask): { type: 'enabled'; budget_tokens: number } | undefined {
    return {
      type: 'enabled',
      budget_tokens: this.config.adaptiveThinkingTokens,
    };
  }

  /**
   * Runtime configuration update if higher-tier models are dynamically injected.
   */
  public updateConfig(updates: Partial<ModelPolicyConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  public getConfig(): Readonly<ModelPolicyConfig> {
    return { ...this.config };
  }
}

export const modelRegistry = ModelRegistry.getInstance();
