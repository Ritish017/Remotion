import type { ProviderHealth } from '../ai/types';

export interface PresenterVideoRequest {
  script: string;
  avatarId?: string;
  voiceId?: string;
  templateId?: string;
  title?: string;
}

export interface PresenterVideoResult {
  videoId: string;
  videoUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  provider: 'heygen';
  durationSeconds?: number;
  createdAt: string;
}

export interface IPresenterProvider {
  readonly isConfigured: boolean;
  generatePresenterVideo(request: PresenterVideoRequest): Promise<PresenterVideoResult>;
  getPresenterVideoStatus(videoId: string): Promise<PresenterVideoResult>;
  healthCheck(): Promise<ProviderHealth>;
}
