import { z } from 'zod';
import type { AIGenerateOptions, AIGenerateResult, AIMessage, IAIProvider, ProviderHealth } from '../types';

export class OpenAIProvider implements IAIProvider {
  readonly id = 'openai';

  private get apiKey(): string {
    return process.env.OPENAI_API_KEY || '';
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private getModel(options?: AIGenerateOptions): string {
    return options?.model || process.env.OPENAI_MODEL_PRIMARY || 'gpt-4o-mini';
  }

  async generate(prompt: string | AIMessage[], options?: AIGenerateOptions): Promise<AIGenerateResult> {
    if (!this.isConfigured) {
      throw new Error('OpenAI is not configured. Set OPENAI_API_KEY in environment.');
    }

    const startTime = Date.now();
    const model = this.getModel(options);

    let messages: any[] = [];
    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }

    if (typeof prompt === 'string') {
      messages.push({ role: 'user', content: prompt });
    } else {
      messages.push(...prompt);
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options?.maxTokens || 2048,
        temperature: options?.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const latencyMs = Date.now() - startTime;
    const text = data.choices?.[0]?.message?.content || '';

    return {
      text,
      model,
      provider: 'openai',
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
      },
      latencyMs,
    };
  }

  async generateStructured<T>(prompt: string | AIMessage[], schema: z.ZodSchema<T>, options?: AIGenerateOptions): Promise<{ data: T; result: AIGenerateResult }> {
    const jsonPrompt = typeof prompt === 'string'
      ? `${prompt}\n\nRespond with valid JSON ONLY matching the schema.`
      : prompt;

    const result = await this.generate(jsonPrompt, options);
    let raw = result.text.trim();
    if (raw.startsWith('```json')) raw = raw.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (raw.startsWith('```')) raw = raw.replace(/^```/, '').replace(/```$/, '').trim();

    const parsed = JSON.parse(raw);
    const data = schema.parse(parsed);

    return { data, result: { ...result, structured: data } };
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    if (!this.isConfigured) {
      return {
        provider: 'OpenAI',
        configured: false,
        reachable: false,
        authenticated: false,
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
        error: 'OPENAI_API_KEY is not configured',
      };
    }

    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return {
        provider: 'OpenAI',
        configured: true,
        reachable: true,
        authenticated: res.ok,
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: res.ok ? undefined : `HTTP ${res.status}`,
      };
    } catch (e: any) {
      return {
        provider: 'OpenAI',
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
