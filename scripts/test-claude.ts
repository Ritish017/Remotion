import dotenv from 'dotenv';
dotenv.config({ override: true });

import { ClaudeProvider } from '../src/lib/providers/ai/claude/ClaudeProvider';
import { validateClaudeConfig, getClaudeConfig } from '../src/lib/providers/ai/claude/config';
import { z } from 'zod';

async function main() {
  console.log('========================================================================');
  console.log('🧠 ANTHROPIC CLAUDE PROVIDER VERIFICATION');
  console.log('========================================================================\n');

  // 1. Validate environment configuration
  console.log('🔍 [Step 1] Validating Configuration...');
  const config = getClaudeConfig();
  const validation = validateClaudeConfig();

  const keyMasked = config.apiKey
    ? `${config.apiKey.slice(0, 7)}...${config.apiKey.slice(-4)} (${config.apiKey.length} chars)`
    : '❌ Not set';

  console.log(`   API Key Configured:     ${keyMasked}`);
  console.log(`   Configured Model:       ${config.primaryModel}`);
  console.log(`   Fast Model:             ${config.fastModel}`);

  if (!validation.valid) {
    console.error(`\n❌ Configuration Errors:`);
    validation.errors.forEach((e) => console.error(`   - ${e}`));
    process.exit(1);
  }
  console.log('   ✅ Configuration format is valid.\n');

  const provider = new ClaudeProvider();

  // 2. Discover / list models
  console.log('🔍 [Step 2] Discovering Available Models via Official SDK...');
  try {
    const models = await provider.listModels();
    console.log(`   ✅ Successfully retrieved ${models.length} model(s) from Anthropic:`);
    models.slice(0, 5).forEach((m) => {
      console.log(`     - [${m.id}] ${m.display_name || ''}`);
    });
  } catch (err: any) {
    console.warn(`   ⚠️ Model listing notice: ${err.message}`);
  }

  // 3. Simple generation request
  console.log(`\n🔍 [Step 3] Executing Minimal Generation with Model [${config.primaryModel}]...`);
  try {
    const res = await provider.generate('Respond with the word "READY" if you can read this.', {
      maxTokens: 20,
      temperature: 0.1,
    });
    console.log(`   ✅ Generation Success! Latency: ${res.latencyMs}ms, Tokens: ${res.usage.outputTokens}`);
    console.log(`   Response: "${res.text.trim()}"`);
  } catch (err: any) {
    console.error(`   ❌ Generation Failed: ${err.message}`);
  }

  // 4. Structured output test
  console.log('\n🔍 [Step 4] Testing 3-Tier Robust Structured Output...');
  const testSchema = z.object({
    status: z.literal('ONLINE'),
    service: z.string(),
    verified: z.boolean(),
  });

  try {
    const structuredRes = await provider.generateStructured(
      'Return JSON with {"status": "ONLINE", "service": "Catalyst Content OS", "verified": true}',
      testSchema,
      { maxTokens: 100 }
    );
    console.log('   ✅ Structured Output Success!');
    console.log(`   Parsed Data:`, structuredRes.data);
  } catch (err: any) {
    console.error(`   ❌ Structured Output Failed: ${err.message}`);
  }

  console.log('\n========================================================================');
  console.log('🏁 CLAUDE VERIFICATION COMPLETE');
  console.log('========================================================================');
}

main().catch((err) => {
  console.error('Fatal Claude verification error:', err.message);
  process.exit(1);
});
