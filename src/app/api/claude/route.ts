import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'dummy' })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Support both legacy format (prompt/vertical/platform) and new Content OS format (messages/system)
    if (body.messages && body.system) {
      // Content OS format — used by Research, Script, and Virality agents
      const { messages, system, model = 'claude-sonnet-4-6', max_tokens = 2048 } = body
      const response = await client.messages.create({
        model,
        max_tokens,
        system,
        messages,
      })
      const blocks = response.content as any[]
      const text: string = blocks.find((b) => b.type === 'text')?.text ?? ''
      try {
        return NextResponse.json({ result: JSON.parse(text), raw: text })
      } catch {
        return NextResponse.json({ result: null, raw: text })
      }
    } else {
      // Legacy format — used by original generate pages
      const { prompt, vertical, platform, model = 'claude-sonnet-4-6' } = body
      const message = await client.messages.create({
        model,
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `You are a content strategist for an AI-powered video system called Catalyst.\n\nBrief: "${prompt}"\nVertical: ${vertical}\nPlatform: ${platform}\n\nGenerate a structured 4-part video narrative. Return JSON ONLY (no markdown, no backticks):\n{\n  "title": "...",\n  "hook": { "headline": "...", "subtext": "...", "stat": "..." },\n  "problem": { "headline": "...", "bullets": ["...", "...", "..."], "stat": "..." },\n  "solution": { "headline": "...", "key_points": ["...", "...", "..."], "stat": "..." },\n  "cta": { "text": "...", "urgency": "..." },\n  "hashtags": ["...", "...", "...", "...", "..."],\n  "title_variants": ["...", "...", "..."],\n  "description": "...",\n  "virality_score": 0,\n  "virality_label": "Good|Great|Viral"\n}`
        }]
      })
      const text = (message.content[0] as { type: string; text: string }).text
      try {
        return NextResponse.json(JSON.parse(text))
      } catch {
        return NextResponse.json({ error: 'Parse failed', raw: text }, { status: 500 })
      }
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Claude API error' }, { status: 500 })
  }
}
