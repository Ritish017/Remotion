import { z } from 'zod';
import type { AIGenerateOptions, AIGenerateResult } from '../types';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeGenerateOptions extends AIGenerateOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  schema?: z.ZodType<any>;
}

export interface ClaudeModelInfo {
  id: string;
  display_name?: string;
  created_at?: string;
  type?: string;
}

export interface ClaudeStructuredResponse<T> {
  data: T;
  rawText: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}
