import { z } from 'zod';
import type { AIGenerateOptions, AIGenerateResult, AIMessage, IAIProvider, ImageAnalysisOptions, ProviderHealth } from '../types';
import { repairJsonString } from '../claude/ClaudeProvider';

export class GeminiProvider implements IAIProvider {
  readonly id = 'gemini';

  private get apiKey(): string {
    return process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private getModel(options?: AIGenerateOptions): string {
    return options?.model || process.env.GEMINI_MODEL_PRIMARY || 'gemini-1.5-flash';
  }

  async generate(prompt: string | AIMessage[], options?: AIGenerateOptions): Promise<AIGenerateResult> {
    if (!this.isConfigured) {
      throw new Error('Google Gemini is not configured. Set GOOGLE_GENERATIVE_AI_API_KEY in environment.');
    }

    const startTime = Date.now();
    const model = this.getModel(options);
    // Secure URL without API key in query params - authenticated via x-goog-api-key header
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    let contents: any[] = [];
    if (typeof prompt === 'string') {
      contents = [{ role: 'user', parts: [{ text: prompt }] }];
    } else {
      contents = prompt.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: options?.maxTokens || 2048,
          temperature: options?.temperature ?? 0.7,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google Gemini API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const latencyMs = Date.now() - startTime;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      text,
      model,
      provider: 'gemini',
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount || 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
      },
      latencyMs,
    };
  }

  async generateStructured<T>(
    prompt: string | AIMessage[],
    schema: z.ZodSchema<T>,
    options?: AIGenerateOptions
  ): Promise<{ data: T; result: AIGenerateResult }> {
    const jsonPrompt =
      typeof prompt === 'string'
        ? `${prompt}\n\nRespond with valid JSON ONLY matching the requested structure.`
        : prompt;

    const result = await this.generate(jsonPrompt, options);
    const repaired = repairJsonString(result.text);
    const parsed = JSON.parse(repaired);
    const data = schema.parse(parsed);

    return { data, result: { ...result, structured: data } };
  }

  async analyzeImage(options: ImageAnalysisOptions): Promise<AIGenerateResult> {
    if (!this.isConfigured) {
      throw new Error('Google Gemini is not configured for image analysis.');
    }

    const startTime = Date.now();
    const model = options.model || this.getModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const imgRes = await fetch(options.imageUrl);
    const arrayBuffer = await imgRes.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: options.prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini Vision analysis error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      text,
      model,
      provider: 'gemini',
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount || 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
      },
      latencyMs: Date.now() - startTime,
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    if (!this.isConfigured) {
      return {
        provider: 'Google Gemini',
        configured: false,
        reachable: false,
        authenticated: false,
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
        error: 'GOOGLE_GENERATIVE_AI_API_KEY is not configured',
      };
    }

    try {
      // Secure authenticated health check using header
      const url = `https://generativelanguage.googleapis.com/v1beta/models`;
      const res = await fetch(url, {
        headers: {
          'x-goog-api-key': this.apiKey,
        },
      });

      return {
        provider: 'Google Gemini',
        configured: true,
        reachable: true,
        authenticated: res.ok,
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: res.ok ? undefined : `HTTP ${res.status}`,
      };
    } catch (e: any) {
      return {
        provider: 'Google Gemini',
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
