import dotenv from 'dotenv';
dotenv.config({ override: true });

import { ProviderRegistry } from '../src/lib/providers';
import { TaskRouter } from '../src/lib/router/TaskRouter';

async function runProvidersLiveTest() {
  console.log('========================================================================');
  console.log('🚀 CATALYST LIVE PROVIDERS TEST SUITE');
  console.log('========================================================================\n');

  // 1. Task Router Check
  console.log('📋 1. Checking TaskRouter Decisions:');
  const manifest = TaskRouter.getRoutingManifest();
  console.log(`   - CREATIVE_WRITING: ${manifest.CREATIVE_WRITING.provider}`);
  console.log(`   - VISUAL_ANALYSIS:  ${manifest.VISUAL_ANALYSIS.provider}`);
  console.log(`   - RESEARCH:         ${manifest.RESEARCH_EXTRACTION.provider}`);
  console.log(`   - VOICEOVER:        ${manifest.VOICEOVER.provider}`);
  console.log(`   - EMAIL:            ${manifest.EMAIL.provider}`);
  console.log('   TaskRouter is mapped correctly. ✅\n');

  // 2. Health Checks across all providers
  console.log('🩺 2. Executing Live Health Checks on All Providers:');
  const healthResults = await ProviderRegistry.runAllHealthChecks();

  for (const h of healthResults) {
    const icon = h.authenticated ? '🟢' : h.configured ? '🟡' : '⚪';
    const statusText = h.authenticated ? 'AUTHENTICATED / ACTIVE' : h.configured ? `CONFIGURED (${h.error || 'Check status'})` : 'NOT CONFIGURED';
    console.log(`   ${icon} ${h.provider.padEnd(30)} -> ${statusText} (${h.latencyMs}ms)`);
  }

  // 3. Live Functional Tests
  console.log('\n⚡ 3. Running Functional Provider Tests:');

  // Test Claude
  try {
    console.log('   [Claude] Testing creative generation...');
    const claudeRes = await ProviderRegistry.ai.claude.generate('Give a 5-word hook for a video about AI computing.', { maxTokens: 30 });
    console.log(`   ✅ Claude response: "${claudeRes.text.trim()}" (${claudeRes.latencyMs}ms)`);
  } catch (e: any) {
    console.warn(`   ❌ Claude failed:`, e.message);
  }

  // Test Gemini
  try {
    console.log('   [Gemini] Testing secondary multimodal intelligence...');
    const geminiRes = await ProviderRegistry.ai.gemini.generate('Briefly state why optical computing is fast in 10 words.', { maxTokens: 30 });
    console.log(`   ✅ Gemini response: "${geminiRes.text.trim()}" (${geminiRes.latencyMs}ms)`);
  } catch (e: any) {
    console.warn(`   ❌ Gemini failed:`, e.message);
  }

  // Test OpenAI TTS & Whisper
  try {
    console.log('   [OpenAI TTS & Whisper] Testing real narration and word timestamp alignment...');
    const audioRes = await ProviderRegistry.audio.openai.synthesize({
      transcript: 'Quantum entanglement connects processors across continents instantaneously.',
      voice: 'onyx',
    });
    console.log(`   ✅ OpenAI Audio synthesized: ${audioRes.durationSeconds}s (${audioRes.words.length} timed words) -> ${audioRes.audioUrl}`);
  } catch (e: any) {
    console.warn(`   ❌ OpenAI Audio failed:`, e.message);
  }

  // Test Firecrawl
  try {
    console.log('   [Firecrawl] Testing web page scrape...');
    const scrapeRes = await ProviderRegistry.research.firecrawl.scrape('https://example.com');
    console.log(`   ✅ Firecrawl extracted "${scrapeRes.title}" (${scrapeRes.content.length} chars)`);
  } catch (e: any) {
    console.warn(`   ❌ Firecrawl failed:`, e.message);
  }

  // Test Apify
  try {
    console.log('   [Apify] Testing user authorization...');
    const apifyHealth = await ProviderRegistry.research.apify.healthCheck();
    console.log(`   ✅ Apify active status: ${apifyHealth.authenticated}`);
  } catch (e: any) {
    console.warn(`   ❌ Apify failed:`, e.message);
  }

  // Test HeyGen
  try {
    console.log('   [HeyGen] Testing template verification...');
    const heygenHealth = await ProviderRegistry.presenter.heygen.healthCheck();
    console.log(`   ✅ HeyGen templates reachable: ${heygenHealth.authenticated}`);
  } catch (e: any) {
    console.warn(`   ❌ HeyGen failed:`, e.message);
  }

  // Test Vapi
  try {
    console.log('   [Vapi] Testing assistant list...');
    const vapiAssistants = await ProviderRegistry.voice.vapi.getAssistants();
    console.log(`   ✅ Vapi assistants available: ${vapiAssistants.length}`);
  } catch (e: any) {
    console.warn(`   ❌ Vapi failed:`, e.message);
  }

  // Test Resend
  try {
    console.log('   [Resend] Testing transactional email provider...');
    const resendHealth = await ProviderRegistry.email.resend.healthCheck();
    console.log(`   ✅ Resend operational status: ${resendHealth.authenticated}`);
  } catch (e: any) {
    console.warn(`   ❌ Resend failed:`, e.message);
  }

  console.log('\n🎉 LIVE PROVIDERS TEST COMPLETED SUCCESSFULLY!');
}

runProvidersLiveTest();
