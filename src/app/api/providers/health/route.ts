import { NextResponse } from 'next/server';
import { ProviderRegistry } from '@/lib/providers';

export async function GET() {
  try {
    const checks = await ProviderRegistry.runAllHealthChecks();

    const allConfigured = checks.filter((c) => c.configured);
    const allHealthy = checks.filter((c) => c.authenticated);

    return NextResponse.json({
      status: allHealthy.length >= 6 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      summary: {
        totalProviders: checks.length,
        configuredProviders: allConfigured.length,
        activeHealthyProviders: allHealthy.length,
      },
      providers: checks,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: e.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
