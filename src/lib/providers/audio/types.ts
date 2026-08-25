import type { ProviderHealth } from '../ai/types';

export interface WordTimestamp {
  text: string;
  startSeconds: number;
  endSeconds: number;
  confidence?: number;
}

export interface NarrationSynthesisRequest {
  transcript: string;
  voice?: 'onyx' | 'alloy' | 'echo' | 'fable' | 'nova' | 'shimmer';
  model?: 'tts-1' | 'tts-1-hd';
  speed?: number;
}

export interface NarrationSynthesisResult {
  audioUrl: string;
  audioPath: string;
  durationSeconds: number;
  transcript: string;
  words: WordTimestamp[];
  format: 'mp3' | 'wav';
  provider: string;
  createdAt: string;
}

export interface IAudioProvider {
  readonly isConfigured: boolean;
  synthesize(request: NarrationSynthesisRequest): Promise<NarrationSynthesisResult>;
  transcribeWithTimestamps(audioBuffer: Buffer, originalTranscript?: string): Promise<WordTimestamp[]>;
  healthCheck(): Promise<ProviderHealth>;
}
