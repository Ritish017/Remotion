import { NextResponse } from 'next/server';
import { ProviderRegistry } from '@/lib/providers';
import { TaskRouter } from '@/lib/router/TaskRouter';

export async function GET() {
  const providerChecks = await ProviderRegistry.runAllHealthChecks();
  const routing = TaskRouter.getRoutingManifest();

  return NextResponse.json({
    platform: 'Catalyst Content OS (Remotion AI Video Platform)',
    version: '2.4.0-production',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    subsystems: {
      database: {
        provider: 'Supabase PostgreSQL',
        configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Missing',
      },
      storage: {
        provider: 'AWS S3',
        bucket: process.env.S3_VIDEO_BUCKET || 'catalyst-videos-759433041913',
        region: process.env.AWS_REGION || 'us-east-1',
      },
      rendering: {
        engine: 'Remotion Lambda / Chromium',
        status: 'Operational',
      },
      aiCreativeDirector: {
        primary: 'Anthropic Claude (claude-sonnet-4-5-20250929)',
        status: ProviderRegistry.ai.claude.isConfigured ? 'Active' : 'Unconfigured',
      },
      multimodalVisualAI: {
        primary: 'Google Gemini (gemini-1.5-flash)',
        status: ProviderRegistry.ai.gemini.isConfigured ? 'Active' : 'Unconfigured',
      },
      audioNarration: {
        primary: 'OpenAI TTS (tts-1 / Onyx) + Whisper Alignment',
        status: ProviderRegistry.audio.openai.isConfigured ? 'Active' : 'Unconfigured',
      },
      webResearch: {
        engine: 'Firecrawl + Apify Datasets',
        status: ProviderRegistry.research.firecrawl.isConfigured ? 'Active' : 'Degraded',
      },
      transactionalEmail: {
        provider: 'Resend',
        status: ProviderRegistry.email.resend.isConfigured ? 'Active' : 'Unconfigured',
      },
    },
    taskRouting: routing,
    providers: providerChecks,
  });
}
