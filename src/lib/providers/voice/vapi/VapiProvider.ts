import type { ProviderHealth } from '../../ai/types';
import type { IVapiProvider } from '../types';

export class VapiProvider implements IVapiProvider {
  private get apiKey(): string {
    return process.env.VAPI_API_KEY || '';
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async getAssistants(): Promise<any[]> {
    if (!this.isConfigured) return [];
    const res = await fetch('https://api.vapi.ai/assistant', {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) return [];
    return res.json();
  }

  async createWebCall(assistantId?: string): Promise<{ callId: string; webCallUrl?: string }> {
    if (!this.isConfigured) {
      throw new Error('Vapi is not configured. Set VAPI_API_KEY in environment.');
    }

    const res = await fetch('https://api.vapi.ai/call/web', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: assistantId || undefined,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Vapi web call error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return {
      callId: data.id || `vapi_${Date.now()}`,
      webCallUrl: data.webCallUrl,
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    if (!this.isConfigured) {
      return {
        provider: 'Vapi Voice AI',
        configured: false,
        reachable: false,
        authenticated: false,
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
        error: 'VAPI_API_KEY is not configured',
      };
    }

    try {
      const res = await fetch('https://api.vapi.ai/assistant', {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return {
        provider: 'Vapi Voice AI',
        configured: true,
        reachable: true,
        authenticated: res.ok,
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: res.ok ? undefined : `HTTP ${res.status}`,
      };
    } catch (e: any) {
      return {
        provider: 'Vapi Voice AI',
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
