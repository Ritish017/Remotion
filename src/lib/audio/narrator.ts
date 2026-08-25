import { OpenAIAudioProvider } from '../providers/audio/openai/OpenAIAudioProvider';
import { LocalSynthesizerProvider } from './providers/synthesizer';
import type { NarrationRequest, NarrationResponse, TimedWord } from './types';

export class NarrationFactory {
  private static openaiAudio = new OpenAIAudioProvider();
  private static localSynth = new LocalSynthesizerProvider();

  public static async generate(request: NarrationRequest): Promise<NarrationResponse> {
    if (this.openaiAudio.isConfigured) {
      console.log(`🎙️ [NarrationFactory] Generating real neural voiceover via OpenAI TTS (${request.voiceId || 'onyx'})...`);
      try {
        const result = await this.openaiAudio.synthesize({
          transcript: request.transcript,
          voice: (request.voiceId as any) || 'onyx',
          speed: request.speakingRate ?? 1.0,
        });

        const words: TimedWord[] = result.words.map((w) => ({
          word: w.text,
          start: w.startSeconds,
          end: w.endSeconds,
          confidence: w.confidence || 0.98,
        }));

        return {
          audioUrl: result.audioUrl,
          audioPath: result.audioPath,
          durationSeconds: result.durationSeconds,
          transcript: result.transcript,
          words,
          provider: 'openai',
          isProductionReady: true,
          metadata: { model: 'tts-1', voice: request.voiceId || 'onyx', transcription: 'whisper-1' },
        };
      } catch (e: any) {
        console.warn(`[NarrationFactory] OpenAI TTS error (${e.message}). Falling back to local synthesizer.`);
      }
    }

    console.log('[NarrationFactory] Using Local Synthesizer fallback.');
    return this.localSynth.generateNarration(request);
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
