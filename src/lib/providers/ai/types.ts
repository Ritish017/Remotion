import { z } from 'zod';

export type AIProviderId = 'claude' | 'gemini' | 'openai';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIGenerateOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  schema?: z.ZodSchema<any>;
}

export interface AIGenerateResult {
  text: string;
  structured?: any;
  model: string;
  provider: AIProviderId;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  latencyMs: number;
}

export interface ImageAnalysisOptions {
  imageUrl: string;
  prompt: string;
  model?: string;
}

export interface ProviderHealth {
  provider: string;
  configured: boolean;
  reachable: boolean;
  authenticated: boolean;
  latencyMs: number;
  lastChecked: string;
  error?: string;
}

export interface IAIProvider {
  readonly id: AIProviderId;
  readonly isConfigured: boolean;
  generate(prompt: string | AIMessage[], options?: AIGenerateOptions): Promise<AIGenerateResult>;
  generateStructured<T>(prompt: string | AIMessage[], schema: z.ZodSchema<T>, options?: AIGenerateOptions): Promise<{ data: T; result: AIGenerateResult }>;
  analyzeImage?(options: ImageAnalysisOptions): Promise<AIGenerateResult>;
  healthCheck(): Promise<ProviderHealth>;
}
