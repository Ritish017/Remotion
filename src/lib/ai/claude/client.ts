import Anthropic from '@anthropic-ai/sdk';
import { getClaudeConfig } from '@/lib/providers/ai/claude/config';
import { modelRouter, ModelTask } from './modelRouter';

let cachedClient: Anthropic | null = null;
let lastApiKey: string | null = null;

/**
 * Returns an official Anthropic client initialized with the current environment configuration.
 * Instantiated lazily to prevent static load-time failures.
 */
export function getAnthropicClient(): Anthropic {
  const config = getClaudeConfig();
  if (!config.apiKey || config.apiKey.trim().length === 0) {
    throw new Error('Anthropic API key is not configured. Set ANTHROPIC_API_KEY in environment.');
  }

  if (!cachedClient || lastApiKey !== config.apiKey) {
    cachedClient = new Anthropic({
      apiKey: config.apiKey,
      maxRetries: 3,
      timeout: 45000,
    });
    lastApiKey = config.apiKey;
  }

  return cachedClient;
}

/**
 * Proxy object for backwards compatibility with modules expecting `anthropic.messages.create`
 */
export const anthropic = new Proxy({} as Anthropic, {
  get(_target, prop) {
    const client = getAnthropicClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export function getDefaultModel(task: ModelTask = 'editorial_planning'): string {
  return modelRouter.resolveModel(task);
}

export function getFastModel(): string {
  return modelRouter.getFastModel();
}

export function getPrimaryModel(): string {
  return modelRouter.getPrimaryModel();
}

export const DEFAULT_MODEL = modelRouter.getPrimaryModel();
export const FAST_MODEL = modelRouter.getFastModel();
