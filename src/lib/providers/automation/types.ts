import type { ProviderHealth } from '../ai/types';

export interface WorkflowTriggerRequest {
  workflowId?: string;
  webhookPath?: string;
  payload: Record<string, any>;
}

export interface WorkflowTriggerResult {
  executionId?: string;
  status: 'triggered' | 'running' | 'completed' | 'failed' | 'disabled';
  response?: any;
  provider: 'n8n';
  triggeredAt: string;
}

export interface IN8nAutomationProvider {
  readonly isConfigured: boolean;
  triggerWorkflow(request: WorkflowTriggerRequest): Promise<WorkflowTriggerResult>;
  healthCheck(): Promise<ProviderHealth>;
}
