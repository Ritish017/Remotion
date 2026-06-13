import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'dummy' })

export async function POST(req: NextRequest) {
  const { prompt, vertical, platform, model = 'claude-sonnet-4-6' } = await req.json()

  const message = await client.messages.create({
    model,
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `You are a content strategist for an AI-powered video system called Catalyst.

Brief: "${prompt}"
Vertical: ${vertical}
Platform: ${platform}

Generate a structured 4-part video narrative. Return JSON ONLY (no markdown, no backticks):
{
  "title": "...",
  "hook": { "headline": "...", "subtext": "...", "stat": "..." },
  "problem": { "headline": "...", "bullets": ["...", "...", "..."], "stat": "..." },
  "solution": { "headline": "...", "key_points": ["...", "...", "..."], "stat": "..." },
  "cta": { "text": "...", "urgency": "..." },
  "hashtags": ["...", "...", "...", "...", "..."],
  "title_variants": ["...", "...", "..."],
  "description": "...",
  "virality_score": 0,
  "virality_label": "Good|Great|Viral"
}`
    }]
  })

  const text = (message.content[0] as { type: string; text: string }).text
  try {
    return NextResponse.json(JSON.parse(text))
  } catch {
    return NextResponse.json({ error: 'Parse failed', raw: text }, { status: 500 })
  }
}
