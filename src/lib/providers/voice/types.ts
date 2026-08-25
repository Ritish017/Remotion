import type { ProviderHealth } from '../ai/types';

export interface VapiVoiceCommand {
  transcript: string;
  assistantId?: string;
  metadata?: Record<string, any>;
}

export interface IVapiProvider {
  readonly isConfigured: boolean;
  getAssistants(): Promise<any[]>;
  createWebCall(assistantId?: string): Promise<{ callId: string; webCallUrl?: string }>;
  healthCheck(): Promise<ProviderHealth>;
}
