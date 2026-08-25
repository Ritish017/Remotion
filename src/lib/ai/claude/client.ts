import Anthropic from '@anthropic-ai/sdk';

// Initialize the official Anthropic client server-side only
const apiKey = process.env.ANTHROPIC_API_KEY || '';

export const anthropic = new Anthropic({
  apiKey,
  maxRetries: 3,
  timeout: 30000,
});

/**
 * Supported Anthropic Production Model Identifiers
 */
export const PRODUCTION_MODELS = {
  SONNET_3_5: 'claude-3-5-sonnet-20241022',
  SONNET_LATEST: 'claude-3-5-sonnet-latest',
  HAIKU_3_5: 'claude-3-5-haiku-20241022',
  HAIKU_LATEST: 'claude-3-5-haiku-latest',
} as const;

export const DEFAULT_MODEL = PRODUCTION_MODELS.SONNET_3_5;
export const FAST_MODEL = PRODUCTION_MODELS.HAIKU_3_5;
