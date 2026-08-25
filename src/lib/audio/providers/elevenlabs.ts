import fs from 'fs';
import path from 'path';
import type { INarrationProvider, NarrationRequest, NarrationResponse, TimedWord } from '../types';

export class ElevenLabsProvider implements INarrationProvider {
  readonly providerId = 'elevenlabs';

  get isConfigured(): boolean {
    return Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY.trim().length > 0);
  }

  async generateNarration(request: NarrationRequest): Promise<NarrationResponse> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API key is missing. Set ELEVENLABS_API_KEY in .env.');
    }

    const voiceId = request.voiceId || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Default Rachel / Editorial
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: request.transcript,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ElevenLabs API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const audioBase64 = data.audio_base64;
    const alignment = data.alignment; // { characters, character_start_times_seconds, character_end_times_seconds }

    // Save audio file locally
    const publicDir = path.resolve(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

    const fileName = `elevenlabs_${Date.now()}.mp3`;
    const filePath = path.join(publicDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(audioBase64, 'base64'));

    // Extract word timestamps from character alignment
    const words: TimedWord[] = [];
    if (alignment && alignment.characters) {
      let currentWord = '';
      let wordStart = 0;
      let wordEnd = 0;

      for (let i = 0; i < alignment.characters.length; i++) {
        const char = alignment.characters[i];
        const start = alignment.character_start_times_seconds[i];
        const end = alignment.character_end_times_seconds[i];

        if (char === ' ' || i === alignment.characters.length - 1) {
          if (i === alignment.characters.length - 1 && char !== ' ') {
            currentWord += char;
            wordEnd = end;
          }
          if (currentWord.trim()) {
            words.push({
              word: currentWord.trim(),
              start: Number(wordStart.toFixed(2)),
              end: Number(wordEnd.toFixed(2)),
              confidence: 0.99,
            });
          }
          currentWord = '';
          wordStart = 0;
        } else {
          if (currentWord === '') wordStart = start;
          currentWord += char;
          wordEnd = end;
        }
      }
    }

    const durationSeconds = words.length > 0 ? words[words.length - 1].end + 0.5 : 45;

    return {
      audioUrl: `/audio/${fileName}`,
      audioPath: filePath,
      durationSeconds,
      transcript: request.transcript,
      words,
      provider: 'elevenlabs',
      isProductionReady: true,
      metadata: { voiceId, model: 'eleven_multilingual_v2' },
    };
  }
}
