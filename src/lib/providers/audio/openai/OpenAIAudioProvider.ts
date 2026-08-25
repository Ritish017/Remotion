import fs from 'fs';
import path from 'path';
import type { ProviderHealth } from '../../ai/types';
import type { IAudioProvider, NarrationSynthesisRequest, NarrationSynthesisResult, WordTimestamp } from '../types';

export class OpenAIAudioProvider implements IAudioProvider {
  private get apiKey(): string {
    return process.env.OPENAI_API_KEY || '';
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async synthesize(request: NarrationSynthesisRequest): Promise<NarrationSynthesisResult> {
    if (!this.isConfigured) {
      throw new Error('OpenAI is not configured for Audio TTS. Set OPENAI_API_KEY in environment.');
    }

    const voice = request.voice || 'onyx';
    const model = request.model || process.env.OPENAI_TTS_MODEL || 'tts-1';

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        voice,
        input: request.transcript,
        speed: request.speed ?? 1.0,
        response_format: 'mp3',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI TTS API error (${res.status}): ${err}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    const publicAudioDir = path.resolve(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(publicAudioDir)) {
      fs.mkdirSync(publicAudioDir, { recursive: true });
    }

    const fileName = `narration_openai_${Date.now()}.mp3`;
    const filePath = path.join(publicAudioDir, fileName);
    fs.writeFileSync(filePath, audioBuffer);

    let words: WordTimestamp[] = [];
    try {
      words = await this.transcribeWithTimestamps(audioBuffer, request.transcript);
    } catch (e: any) {
      console.warn('[OpenAI] Whisper timestamp extraction fallback:', e.message);
      const wordsList = request.transcript.trim().split(/\s+/).filter(Boolean);
      let currentTime = 0.2;
      for (const w of wordsList) {
        const dur = Math.max(0.22, w.length * 0.055);
        words.push({
          text: w,
          startSeconds: Number(currentTime.toFixed(2)),
          endSeconds: Number((currentTime + dur).toFixed(2)),
          confidence: 0.95,
        });
        currentTime += dur + (w.endsWith('.') || w.endsWith('!') ? 0.3 : 0.08);
      }
    }

    const durationSeconds = words.length > 0 ? words[words.length - 1].endSeconds + 0.4 : 45.0;

    return {
      audioUrl: `/audio/${fileName}`,
      audioPath: filePath,
      durationSeconds: Number(durationSeconds.toFixed(2)),
      transcript: request.transcript,
      words,
      format: 'mp3',
      provider: 'openai',
      createdAt: new Date().toISOString(),
    };
  }

  async transcribeWithTimestamps(audioBuffer: Buffer, originalTranscript?: string): Promise<WordTimestamp[]> {
    if (!this.isConfigured) return [];

    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: 'audio/mp3' });
    formData.append('file', blob, 'audio.mp3');
    formData.append('model', process.env.OPENAI_TRANSCRIPTION_MODEL || 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'word');

    if (originalTranscript) {
      formData.append('prompt', originalTranscript.slice(0, 500));
    }

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Whisper transcription error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const rawWords = data.words || [];

    return rawWords.map((w: any) => ({
      text: w.word,
      startSeconds: Number(w.start.toFixed(2)),
      endSeconds: Number(w.end.toFixed(2)),
      confidence: 0.99,
    }));
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    if (!this.isConfigured) {
      return {
        provider: 'OpenAI Audio (TTS/Whisper)',
        configured: false,
        reachable: false,
        authenticated: false,
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
        error: 'OPENAI_API_KEY is not configured',
      };
    }

    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return {
        provider: 'OpenAI Audio (TTS/Whisper)',
        configured: true,
        reachable: true,
        authenticated: res.ok,
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (e: any) {
      return {
        provider: 'OpenAI Audio (TTS/Whisper)',
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
