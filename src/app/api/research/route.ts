import { NextRequest, NextResponse } from 'next/server'
import { searchYouTube } from '@/lib/research'
import { RESEARCH_AGENT_PROMPT } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const { topic, campaignType = 'ai-teaching' } = await req.json()

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // 1. YouTube search for competitor data
    const ytData = await searchYouTube(topic)

    // 2. Claude synthesis via internal API
    const origin = req.nextUrl.origin
    const synthesisRes = await fetch(`${origin}/api/claude`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        system: RESEARCH_AGENT_PROMPT,
        messages: [{
          role: 'user',
          content: `Topic: "${topic}"\nCampaign type: ${campaignType}\n\nYouTube competitor data:\n${JSON.stringify(ytData?.items?.slice(0, 5) || [], null, 2)}`
        }],
      }),
    })

    const synthesis = await synthesisRes.json()
    return NextResponse.json({
      research: synthesis.result || synthesis,
      youtube_data: ytData?.items?.slice(0, 5) || [],
      raw: synthesis.raw,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Research failed' }, { status: 500 })
  }
}
