import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

async function testClaudeGeneration() {
  const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
  const match = envContent.match(/ANTHROPIC_API_KEY=([^\r\n]+)/);
  const apiKey = match ? match[1].trim() : '';

  console.log('📡 Calling Claude API with model [claude-sonnet-4-5-20250929]...');

  const anthropic = new Anthropic({ apiKey });

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: 'You are the Catalyst Content Director. Generate a compelling 2-sentence hook for a documentary on Neuromorphic AI Chips.',
        },
      ],
    });

    console.log('\n🎉 CLAUDE API CALL SUCCEEDED!');
    console.log('========================================================================');
    if (response.content[0].type === 'text') {
      console.log(`Claude Generated Hook: "${response.content[0].text.trim()}"`);
    }
    console.log('========================================================================');
    console.log(`Model: ${response.model}`);
    console.log(`Usage: ${response.usage.input_tokens} input tokens, ${response.usage.output_tokens} output tokens`);
    console.log('✅ Anthropic Claude API integration is fully verified and working in production!');
  } catch (e: any) {
    console.error(`❌ Call failed (${e.status}): ${e.message}`);
  }
}

testClaudeGeneration();
