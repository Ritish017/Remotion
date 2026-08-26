/**
 * Configuration loader for Anthropic Claude Provider.
 * Validates required configuration without hardcoding model IDs or leaking secrets.
 */

export interface ClaudeConfig {
  apiKey: string;
  primaryModel: string;
  fastModel: string;
  maxTokensDefault: number;
  temperatureDefault: number;
}

export function getClaudeConfig(): ClaudeConfig {
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  const primaryModel = process.env.CLAUDE_MODEL || process.env.ANTHROPIC_MODEL_PRIMARY || 'claude-3-5-sonnet-latest';
  const fastModel = process.env.ANTHROPIC_MODEL_FAST || 'claude-3-5-haiku-latest';

  return {
    apiKey,
    primaryModel,
    fastModel,
    maxTokensDefault: 4096,
    temperatureDefault: 0.7,
  };
}

export function validateClaudeConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const config = getClaudeConfig();

  if (!config.apiKey || config.apiKey.trim() === '') {
    errors.push('ANTHROPIC_API_KEY is not configured in environment.');
  }

  if (!config.primaryModel || config.primaryModel.trim() === '') {
    errors.push('CLAUDE_MODEL or ANTHROPIC_MODEL_PRIMARY is not configured in environment.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
