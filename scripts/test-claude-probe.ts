import dotenv from 'dotenv';
dotenv.config({ override: true });
import { Anthropic } from '@anthropic-ai/sdk';

async function probe() {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const testModels = [
    'claude-opus-5',
    'claude-sonnet-5',
    'claude-3-5-sonnet-latest',
    'claude-3-5-haiku-latest',
    'claude-3-opus-20240229',
    'claude-3-5-sonnet-20240620',
    'claude-2.1',
    'claude-instant-1.2'
  ];

  for (const m of testModels) {
    try {
      const res = await anthropic.messages.create({
        model: m,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      });
      console.log(`✅ Model [${m}] WORKS! Response:`, res.content[0]);
    } catch (e: any) {
      console.log(`❌ Model [${m}] failed: ${e.status || e.message}`);
    }
  }
}

probe();
