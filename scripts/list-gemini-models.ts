import dotenv from 'dotenv';
dotenv.config({ override: true });

async function listGemini() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const data = await res.json();
  console.log('Available Gemini Models:');
  for (const m of data.models || []) {
    if (m.supportedGenerationMethods?.includes('generateContent')) {
      console.log(`- ${m.name} (${m.displayName})`);
    }
  }
}

listGemini();
