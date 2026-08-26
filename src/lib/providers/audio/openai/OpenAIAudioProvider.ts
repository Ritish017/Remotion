import type { ProviderHealth } from '../../ai/types';
import type { IAudioProvider, NarrationSynthesisRequest, NarrationSynthesisResult, WordTimestamp } from '../types';
import { validateNarrationTimeline } from '@/lib/audio/validation';
import { StorageFactory } from '@/lib/storage';
import { DatabaseFactory } from '@/lib/database';

export class OpenAIAudioProvider implements IAudioProvider {
  private get apiKey(): string {
    return process.env.OPENAI_API_KEY || '';
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private isProductionEnvironment(): boolean {
    const env = process.env.APP_ENV || process.env.NODE_ENV || 'production';
    const narrationMode = process.env.NARRATION_MODE || env;
    return narrationMode === 'production';
  }

  async synthesize(request: NarrationSynthesisRequest): Promise<NarrationSynthesisResult> {
    if (!this.isConfigured) {
      throw new Error('OpenAI is not configured for Audio TTS. Set OPENAI_API_KEY in environment.');
    }

    const voice = request.voice || 'onyx';
    const model = request.model || process.env.OPENAI_TTS_MODEL || 'tts-1';
    const isProduction = this.isProductionEnvironment();

    // 1. Call OpenAI TTS
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
    const audioId = `narration_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const fileName = `${audioId}.mp3`;

    // 2. Perform Real Whisper Word Timestamp Alignment
    let words: WordTimestamp[] = [];
    try {
      words = await this.transcribeWithTimestamps(audioBuffer, request.transcript);
    } catch (e: any) {
      if (isProduction) {
        throw new Error(
          `Production Narration Failure: Whisper timestamp extraction failed (${e.message}). Estimated timestamps are forbidden in production.`
        );
      }
      console.warn('[OpenAI] Whisper timestamp extraction fallback (dev mode only):', e.message);
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

    if (words.length === 0) {
      if (isProduction) {
        throw new Error('Production Narration Failure: Whisper returned zero word timestamps.');
      }
    }

    // Sanitize timestamps to guarantee start >= 0, end > start, and monotonic start ordering
    const sanitizedWords: WordTimestamp[] = [];
    let prevEnd = 0.0;
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      let start = Math.max(0, w.startSeconds);
      if (start < prevEnd) {
        start = prevEnd;
      }
      let end = Math.max(start + 0.08, w.endSeconds);
      start = Number(start.toFixed(2));
      end = Number(end.toFixed(2));
      if (end <= start) {
        end = Number((start + 0.1).toFixed(2));
      }
      prevEnd = end;
      sanitizedWords.push({
        text: w.text,
        startSeconds: start,
        endSeconds: end,
        confidence: w.confidence || 0.99,
      });
    }

    const lastWord = sanitizedWords[sanitizedWords.length - 1];
    const durationSeconds = lastWord ? Number((lastWord.endSeconds + 0.4).toFixed(2)) : 45.0;

    // 3. Strict Timeline Validation
    const validation = validateNarrationTimeline(
      sanitizedWords.map((w) => ({ word: w.text, start: w.startSeconds, end: w.endSeconds, confidence: w.confidence })),
      durationSeconds,
      request.transcript
    );

    if (!validation.valid && isProduction) {
      throw new Error(`Narration Timeline Validation Failed: ${validation.errors.join('; ')}`);
    }

    // 4. Persistence to Local Storage and SQLite database
    const storage = StorageFactory.getProvider();
    const db = DatabaseFactory.getProvider();

    const relativeAudioPath = `audio/${fileName}`;
    await storage.saveBuffer(relativeAudioPath, audioBuffer);

    await db.saveNarrationArtifact({
      id: audioId,
      audioPath: relativeAudioPath,
      transcript: request.transcript,
      durationSeconds,
      wordsJson: JSON.stringify(sanitizedWords),
    });

    const audioUrl = `/api/media/audio/${audioId}`;

    return {
      audioUrl,
      audioPath: relativeAudioPath,
      durationSeconds,
      transcript: request.transcript,
      words: sanitizedWords,
      format: 'mp3',
      provider: 'openai',
      createdAt: new Date().toISOString(),
    };
  }

  async transcribeWithTimestamps(audioBuffer: Buffer, originalTranscript?: string): Promise<WordTimestamp[]> {
    if (!this.isConfigured) {
      throw new Error('OpenAI is not configured for Whisper transcription.');
    }

    const formData = new FormData();
    const uint8 = new Uint8Array(audioBuffer);
    const blob = new Blob([uint8], { type: 'audio/mpeg' });
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

    if (!Array.isArray(rawWords) || rawWords.length === 0) {
      // If words array is not returned directly, fallback to segments
      if (Array.isArray(data.segments) && data.segments.length > 0) {
        const extracted: WordTimestamp[] = [];
        for (const seg of data.segments) {
          const segWords = (seg.text || '').trim().split(/\s+/).filter(Boolean);
          const segDuration = Math.max(0.1, (seg.end || 0) - (seg.start || 0));
          const perWord = segDuration / (segWords.length || 1);
          let cur = seg.start || 0;
          for (const sw of segWords) {
            extracted.push({
              text: sw,
              startSeconds: Number(cur.toFixed(2)),
              endSeconds: Number((cur + perWord).toFixed(2)),
              confidence: 0.98,
            });
            cur += perWord;
          }
        }
        return extracted;
      }
      throw new Error('Whisper returned empty word array for audio segment.');
    }

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
        error: res.ok ? undefined : `HTTP ${res.status}`,
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
