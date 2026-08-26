import { NextResponse } from 'next/server';
import { ClaudeProvider } from '@/lib/providers/ai/claude/ClaudeProvider';
import { ClaudeError } from '@/lib/providers/ai/claude/errors';

export async function GET() {
  try {
    const provider = new ClaudeProvider();
    const models = await provider.listModels();

    return NextResponse.json({
      success: true,
      models,
    });
  } catch (error: any) {
    const statusCode = error instanceof ClaudeError ? error.statusCode || 500 : 500;
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to list Claude models',
        code: error.code || 'CLAUDE_ERROR',
      },
      { status: statusCode }
    );
  }
}
