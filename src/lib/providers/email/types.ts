import type { ProviderHealth } from '../ai/types';

export interface EmailNotificationRequest {
  to?: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailNotificationResult {
  id: string;
  to: string;
  status: 'sent' | 'queued' | 'failed';
  provider: 'resend';
  sentAt: string;
  error?: string;
}

export interface IEmailProvider {
  readonly isConfigured: boolean;
  sendNotification(request: EmailNotificationRequest): Promise<EmailNotificationResult>;
  sendRenderComplete(videoTitle: string, s3Url: string, durationSeconds: number, recipient?: string): Promise<EmailNotificationResult>;
  sendRenderFailed(videoTitle: string, error: string, recipient?: string): Promise<EmailNotificationResult>;
  healthCheck(): Promise<ProviderHealth>;
}
