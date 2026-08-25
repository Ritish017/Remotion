import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { AIGenerateOptions, AIGenerateResult, AIMessage, IAIProvider, ProviderHealth } from '../types';

export class ClaudeProvider implements IAIProvider {
  readonly id = 'claude';

  private getClient(): Anthropic | null {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      return new Anthropic({
        apiKey,
        maxRetries: 3,
        timeout: 30000,
      });
    }
    return null;
  }

  get isConfigured(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim().length > 0);
  }

  private getModel(options?: AIGenerateOptions): string {
    return options?.model || process.env.ANTHROPIC_MODEL_PRIMARY || 'claude-sonnet-4-5-20250929';
  }

  async generate(prompt: string | AIMessage[], options?: AIGenerateOptions): Promise<AIGenerateResult> {
    const client = this.getClient();
    if (!client) {
      throw new Error('Anthropic Claude is not configured. Set ANTHROPIC_API_KEY in environment.');
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
  }

  async generateStructured<T>(prompt: string | AIMessage[], schema: z.ZodSchema<T>, options?: AIGenerateOptions): Promise<{ data: T; result: AIGenerateResult }> {
    const jsonPrompt = typeof prompt === 'string'
      ? `${prompt}\n\nIMPORTANT: Respond with pure, valid JSON ONLY. Do not enclose in markdown code fences.`
      : prompt;

    const result = await this.generate(jsonPrompt, options);
    let rawJson = result.text.trim();
    if (rawJson.startsWith('```json')) rawJson = rawJson.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (rawJson.startsWith('```')) rawJson = rawJson.replace(/^```/, '').replace(/```$/, '').trim();

    const parsed = JSON.parse(rawJson);
    const validated = schema.parse(parsed);

    return {
      data: validated,
      result: {
        ...result,
        structured: validated,
      },
    };
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
        error: 'ANTHROPIC_API_KEY is not configured',
      };
    }

    try {
      const res = await client.messages.create({
        model: this.getModel(),
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Ping' }],
      });
      return {
        provider: 'Anthropic Claude',
        configured: true,
        reachable: true,
        authenticated: true,
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (e: any) {
      return {
        provider: 'Anthropic Claude',
        configured: true,
        reachable: false,
        authenticated: false,
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: e.message,
      };
    }
  }
}
