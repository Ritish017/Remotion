import dotenv from 'dotenv';
dotenv.config({ override: true });

import { Anthropic } from '@anthropic-ai/sdk';

async function testClaudeModels() {
  const models = [
    'claude-3-5-sonnet-20241022',
    'claude-3-7-sonnet-20250219',
    'claude-3-haiku-20240307',
    'claude-3-sonnet-20240229',
  ];

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  for (const model of models) {
    try {
      const res = await anthropic.messages.create({
        model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Ping' }],
      });
      console.log(`✅ Anthropic model [${model}] works!`);
    } catch (e: any) {
      console.log(`❌ Model [${model}] failed: ${e.message}`);
    }
  }
}

testClaudeModels().catch(console.error);
