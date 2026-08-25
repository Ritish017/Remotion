import Anthropic from '@anthropic-ai/sdk';

// Initialize the official Anthropic client server-side only
const apiKey = process.env.ANTHROPIC_API_KEY || '';

export const anthropic = new Anthropic({
  apiKey,
  maxRetries: 3,
  timeout: 30000,
});

/**
 * Verified Anthropic Production Model Identifiers for this account
 */
export const PRODUCTION_MODELS = {
  SONNET_5: 'claude-sonnet-5',
  SONNET_4_6: 'claude-sonnet-4-6',
  SONNET_4_5: 'claude-sonnet-4-5-20250929',
  HAIKU_4_5: 'claude-haiku-4-5-20251001',
  OPUS_5: 'claude-opus-5',
} as const;

export const DEFAULT_MODEL = PRODUCTION_MODELS.SONNET_4_5;
export const FAST_MODEL = PRODUCTION_MODELS.HAIKU_4_5;
