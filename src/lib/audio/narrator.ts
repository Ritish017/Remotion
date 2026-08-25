import { ElevenLabsProvider } from './providers/elevenlabs';
import { OpenAITTSProvider } from './providers/openai';
import { LocalSynthesizerProvider } from './providers/synthesizer';
import type { INarrationProvider, NarrationRequest, NarrationResponse } from './types';

export class NarrationFactory {
  private static providers: INarrationProvider[] = [
    new ElevenLabsProvider(),
    new OpenAITTSProvider(),
    new LocalSynthesizerProvider(),
  ];

  public static getActiveProvider(): INarrationProvider {
    // Return first configured provider in priority order
    for (const provider of this.providers) {
      if (provider.isConfigured) {
        return provider;
      }
    }
    return new LocalSynthesizerProvider();
  }

  public static async generate(request: NarrationRequest): Promise<NarrationResponse> {
    const provider = this.getActiveProvider();
    console.log(`[NarrationFactory] Using narration provider: ${provider.providerId} (Production Ready: ${provider.providerId !== 'local_synthesizer'})`);
    return provider.generateNarration(request);
  }
}

export async function generateNarration(
  transcript: string,
  options: { voiceId?: string; speakingRate?: number } = {}
): Promise<NarrationResponse> {
  return NarrationFactory.generate({
    transcript,
    voiceId: options.voiceId,
    speakingRate: options.speakingRate,
  });
}
