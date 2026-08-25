import fs from 'fs';
import path from 'path';
import type { INarrationProvider, NarrationRequest, NarrationResponse, TimedWord } from '../types';

export class LocalSynthesizerProvider implements INarrationProvider {
  readonly providerId = 'local_synthesizer';
  readonly isConfigured = true;

  async generateNarration(request: NarrationRequest): Promise<NarrationResponse> {
    const cleanTranscript = request.transcript.trim();
    const wordsList = cleanTranscript.split(/\s+/).filter(Boolean);

    // Phonetic duration & punctuation modeling
    let currentTime = 0.2;
    const words: TimedWord[] = [];

    for (let i = 0; i < wordsList.length; i++) {
      const rawWord = wordsList[i];
      const baseDuration = Math.max(0.22, rawWord.length * 0.055);

      let pause = 0.08;
      if (rawWord.endsWith('.') || rawWord.endsWith('!') || rawWord.endsWith('?')) {
        pause = 0.35;
      } else if (rawWord.endsWith(',') || rawWord.endsWith(';') || rawWord.endsWith(':')) {
        pause = 0.18;
      }

      const start = Number(currentTime.toFixed(2));
      const end = Number((currentTime + baseDuration).toFixed(2));
      words.push({
        word: rawWord,
        start,
        end,
        confidence: 0.98,
      });

      currentTime = end + pause;
    }

    const totalDurationSeconds = Number((currentTime + 0.3).toFixed(2));

    // Generate valid 44.1kHz mono WAV audio file
    const publicDir = path.resolve(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const fileName = `local_synth_${Date.now()}.wav`;
    const filePath = path.join(publicDir, fileName);

    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * totalDurationSeconds);
    const dataSize = numSamples * 2;
    const buffer = Buffer.alloc(44 + dataSize);

    // RIFF Header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(1, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    fs.writeFileSync(filePath, buffer);

    return {
      audioUrl: `/audio/${fileName}`,
      audioPath: filePath,
      durationSeconds: totalDurationSeconds,
      transcript: cleanTranscript,
      words,
      provider: 'local_synthesizer',
      isProductionReady: false, // Explicitly marked as local dev fallback
      metadata: { sampleRate: 44100, format: 'pcm_wav' },
    };
  }
}
