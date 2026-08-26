import dotenv from 'dotenv';
dotenv.config({ override: true });

import { Anthropic } from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

async function testAPIs() {
  console.log('--- Testing Configured Cloud APIs ---\n');

  // 1. Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const res = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Ping' }],
      });
      console.log('✅ Anthropic Claude API: Authenticated & Functional');
    } catch (e: any) {
      console.log(`❌ Anthropic Claude API Error: ${e.message}`);
    }
  } else {
    console.log('⚠️ Anthropic API key not provided');
  }

  // 2. OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      });
      if (res.ok) {
        console.log('✅ OpenAI API: Authenticated & Functional');
      } else {
        console.log(`❌ OpenAI API Error: HTTP ${res.status}`);
      }
    } catch (e: any) {
      console.log(`❌ OpenAI API Error: ${e.message}`);
    }
  } else {
    console.log('⚠️ OpenAI API key not provided');
  }

  // 3. Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data, error } = await supabase.from('episodes').select('count', { count: 'exact', head: true });
      if (!error) {
        console.log('✅ Supabase: Authenticated & Reachable');
      } else {
        console.log(`❌ Supabase Error: ${error.message}`);
      }
    } catch (e: any) {
      console.log(`❌ Supabase Error: ${e.message}`);
    }
  } else {
    console.log('⚠️ Supabase credentials not provided');
  }
}

testAPIs().catch(console.error);
