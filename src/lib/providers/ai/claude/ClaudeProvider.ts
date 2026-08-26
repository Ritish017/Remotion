import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { AIGenerateOptions, AIGenerateResult, AIMessage, IAIProvider, ProviderHealth } from '../types';
import { getClaudeConfig } from './config';
import {
  ClaudeError,
  ClaudeAuthenticationError,
  ClaudeStructuredOutputError,
  mapAnthropicError,
} from './errors';
import type { ClaudeModelInfo } from './types';

export { ClaudeStructuredOutputError as StructuredOutputError };

/**
 * Helper to clean and repair malformed JSON string before parsing.
 */
export function repairJsonString(raw: string): string {
  let cleaned = raw.trim();

  // Strip Markdown code blocks
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.includes('```json')) {
    const start = cleaned.indexOf('```json') + 7;
    const end = cleaned.indexOf('```', start);
    if (end !== -1) {
      cleaned = cleaned.substring(start, end);
    }
  } else if (cleaned.includes('```')) {
    const start = cleaned.indexOf('```') + 3;
    const end = cleaned.indexOf('```', start);
    if (end !== -1) {
      cleaned = cleaned.substring(start, end);
    }
  }

  cleaned = cleaned.trim();

  // Find outermost JSON structure
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  } else if (firstBracket !== -1) {
    const lastBracket = cleaned.lastIndexOf(']');
    if (lastBracket !== -1 && lastBracket > firstBracket) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    }
  }

  // Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  return cleaned;
}

export class ClaudeProvider implements IAIProvider {
  readonly id = 'claude';

  private getClient(): Anthropic | null {
    const config = getClaudeConfig();
    if (config.apiKey && config.apiKey.trim().length > 0) {
      return new Anthropic({
        apiKey: config.apiKey,
        maxRetries: 2,
        timeout: 30000,
      });
    }
    return null;
  }

  get isConfigured(): boolean {
    const config = getClaudeConfig();
    return Boolean(config.apiKey && config.apiKey.trim().length > 0);
  }

  private getModel(options?: AIGenerateOptions): string {
    const config = getClaudeConfig();
    return options?.model || config.primaryModel;
  }

  async listModels(): Promise<ClaudeModelInfo[]> {
    const client = this.getClient();
    if (!client) {
      throw new ClaudeAuthenticationError();
    }

    try {
      if (typeof client.models?.list === 'function') {
        const response = await client.models.list();
        return (response.data || []).map((m: any) => ({
          id: m.id,
          display_name: m.display_name || m.id,
          created_at: m.created_at ? new Date(m.created_at).toISOString() : undefined,
          type: m.type || 'model',
        }));
      }
      // Fallback if models.list is not available on legacy endpoints
      return [
        { id: this.getModel(), display_name: 'Configured Primary Model', type: 'model' },
      ];
    } catch (err: any) {
      throw mapAnthropicError(err, this.getModel());
    }
  }

  async generate(prompt: string | AIMessage[], options?: AIGenerateOptions): Promise<AIGenerateResult> {
    const client = this.getClient();
    if (!client) {
      throw new ClaudeAuthenticationError('Anthropic Claude is not configured. Set ANTHROPIC_API_KEY in environment.');
    }

    const startTime = Date.now();
    const model = this.getModel(options);

    let messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    let system = options?.systemPrompt;

    if (typeof prompt === 'string') {
      messages = [{ role: 'user', content: prompt }];
    } else {
      for (const msg of prompt) {
        if (msg.role === 'system') {
          system = msg.content;
        } else {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    try {
      const response = await client.messages.create({
        model,
        max_tokens: options?.maxTokens || 2048,
        temperature: options?.temperature ?? 0.7,
        system,
        messages,
      });

      const latencyMs = Date.now() - startTime;
      let text = '';
      for (const block of response.content) {
        if (block.type === 'text') text += block.text;
      }

      return {
        text,
        model: response.model,
        provider: 'claude',
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        latencyMs,
      };
    } catch (err: any) {
      throw mapAnthropicError(err, model);
    }
  }

  /**
   * 3-Tier Robust Structured Output Generation:
   * Attempt 1: Direct JSON parse + Zod schema validation
   * Attempt 2: JSON repair & substring extraction + Zod schema validation
   * Attempt 3: Stricter retry prompt with error feedback + Zod schema validation
   * If all fail: Typed ClaudeStructuredOutputError
   */
  async generateStructured<T>(
    prompt: string | AIMessage[],
    schema: z.ZodSchema<T>,
    options?: AIGenerateOptions
  ): Promise<{ data: T; result: AIGenerateResult }> {
    const jsonPrompt =
      typeof prompt === 'string'
        ? `${prompt}\n\nIMPORTANT: Respond with pure, valid JSON ONLY. Do not enclose in explanations or markdown commentary.`
        : prompt;

    // Attempt 1: Primary generation
    const result1 = await this.generate(jsonPrompt, options);
    const raw1 = result1.text.trim();

    try {
      const parsed1 = JSON.parse(raw1);
      const validated1 = schema.parse(parsed1);
      return { data: validated1, result: { ...result1, structured: validated1 } };
    } catch (err1: any) {
      // Attempt 2: Automated JSON Repair
      try {
        const repaired = repairJsonString(raw1);
        const parsed2 = JSON.parse(repaired);
        const validated2 = schema.parse(parsed2);
        return { data: validated2, result: { ...result1, structured: validated2 } };
      } catch (err2: any) {
        console.warn(`[ClaudeProvider] JSON repair failed. Retrying with stricter instruction prompt...`);
      }
    }

    // Attempt 3: Retry with explicit error feedback & zero temperature
    const retryPrompt =
      typeof prompt === 'string'
        ? `${prompt}\n\nCRITICAL ERROR: Your previous response was not valid JSON. Output strictly raw valid JSON conforming to the requested schema. No code fences, no preamble.`
        : prompt;

    const result2 = await this.generate(retryPrompt, {
      ...options,
      temperature: 0.1,
    });

    const raw2 = result2.text.trim();
    try {
      const repaired2 = repairJsonString(raw2);
      const parsed3 = JSON.parse(repaired2);
      const validated3 = schema.parse(parsed3);
      return { data: validated3, result: { ...result2, structured: validated3 } };
    } catch (finalErr: any) {
      throw new ClaudeStructuredOutputError(
        `Failed to parse structured output from Claude after 3 attempts: ${finalErr.message}`,
        raw2
      );
    }
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    const client = this.getClient();
    if (!this.isConfigured || !client) {
      return {
        provider: 'Anthropic Claude',
        configured: false,
        reachable: false,
        authenticated: false,
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
        error: 'ANTHROPIC_API_KEY is not configured in environment',
      };
    }

    try {
      const model = this.getModel();
      const res = await client.messages.create({
        model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Ping' }],
      });
      return {
        provider: 'Anthropic Claude',
        configured: true,
        reachable: true,
        authenticated: Boolean(res.id),
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (e: any) {
      const mapped = mapAnthropicError(e, this.getModel());
      return {
        provider: 'Anthropic Claude',
        configured: true,
        reachable: false,
        authenticated: false,
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: mapped.message,
      };
    }
  }
}
