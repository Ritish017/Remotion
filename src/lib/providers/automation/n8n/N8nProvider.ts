import type { ProviderHealth } from '../../ai/types';
import type { IN8nAutomationProvider, WorkflowTriggerRequest, WorkflowTriggerResult } from '../types';

export class N8nProvider implements IN8nAutomationProvider {
  private get apiKey(): string {
    return process.env.N8N_API_KEY || '';
  }
  private get baseUrl(): string {
    return (process.env.N8N_BASE_URL || '').replace(/\/$/, '');
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.baseUrl && this.baseUrl.length > 0);
  }

  async triggerWorkflow(request: WorkflowTriggerRequest): Promise<WorkflowTriggerResult> {
    if (!this.isConfigured) {
      return {
        status: 'disabled',
        provider: 'n8n',
        triggeredAt: new Date().toISOString(),
        response: { message: 'n8n is not configured with N8N_BASE_URL' },
      };
    }

    const endpoint = request.webhookPath
      ? `${this.baseUrl}/webhook/${request.webhookPath}`
      : `${this.baseUrl}/api/v1/workflows/${request.workflowId}/run`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request.payload),
      });

      const data = await res.json();
      return {
        executionId: data.executionId || data.id,
        status: res.ok ? 'triggered' : 'failed',
        response: data,
        provider: 'n8n',
        triggeredAt: new Date().toISOString(),
      };
    } catch (e: any) {
      console.warn('[n8n] Trigger error:', e.message);
      return {
        status: 'failed',
        provider: 'n8n',
        triggeredAt: new Date().toISOString(),
        response: { error: e.message },
      };
    }
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    if (!this.apiKey) {
      return {
        provider: 'n8n Automation Engine',
        configured: false,
        reachable: false,
        authenticated: false,
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
        error: 'N8N_API_KEY is not configured',
      };
    }

    if (!this.baseUrl) {
      return {
        provider: 'n8n Automation Engine',
        configured: true,
        reachable: false,
        authenticated: true, // Valid token format
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
        error: 'N8N_BASE_URL is not set (Requires your custom instance URL)',
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/workflows`, {
        headers: { 'X-N8N-API-KEY': this.apiKey },
      });
      return {
        provider: 'n8n Automation Engine',
        configured: true,
        reachable: true,
        authenticated: res.ok,
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        error: res.ok ? undefined : `HTTP ${res.status}`,
      };
    } catch (e: any) {
      return {
        provider: 'n8n Automation Engine',
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
