export interface TimedWord {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
  confidence?: number;
}

export type NarrationProviderType = 'elevenlabs' | 'openai' | 'polly' | 'local_synthesizer' | 'custom_upload';

export interface NarrationRequest {
  transcript: string;
  voiceId?: string;
  voiceStyle?: string;
  speakingRate?: number;
  outputFormat?: 'mp3' | 'wav';
}

export interface NarrationResponse {
  audioUrl: string;
  audioPath?: string;
  durationSeconds: number;
  transcript: string;
  words: TimedWord[];
  provider: NarrationProviderType;
  isProductionReady: boolean;
  metadata?: Record<string, any>;
}

export interface INarrationProvider {
  readonly providerId: NarrationProviderType;
  readonly isConfigured: boolean;
  generateNarration(request: NarrationRequest): Promise<NarrationResponse>;
}
