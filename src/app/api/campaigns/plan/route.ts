import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime"
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { campaignId, name, type, description, brandVoice, targetAudience, startDate, episodeCount } = body

    if (!campaignId || !episodeCount || episodeCount <= 0) {
      return NextResponse.json({ error: 'Invalid campaign parameters' }, { status: 400 })
    }

    const systemPrompt = `You are an expert AI Content Strategist.
Your task is to plan a ${episodeCount}-day content campaign that progresses from basic/beginner concepts to advanced/expert concepts.

Campaign Details:
- Name: ${name}
- Type: ${type}
- Description: ${description || 'N/A'}
- Brand Voice: ${brandVoice || 'Engaging, clear, professional'}
- Target Audience: ${targetAudience || 'General audience'}

For each episode, provide:
1. title: A catchy, viral-style title.
2. description: A brief summary of what the episode covers.
3. storytelling_prompt: Instructions for the scriptwriter on what narrative angles, hooks, and specific points to cover in this episode to maintain the progression.
4. video_prompt: Instructions for the video generator on the visual style, pacing, and vibe for this episode.

Return ONLY a JSON array of exactly ${episodeCount} objects. No markdown formatting, no backticks, no explanations.
[
  {
    "title": "...",
    "description": "...",
    "storytelling_prompt": "...",
    "video_prompt": "..."
  }
]`

    const command = new ConverseCommand({
      modelId: 'amazon.nova-pro-v1:0',
      messages: [{
        role: 'user',
        content: [{ text: systemPrompt }]
      }],
      inferenceConfig: {
        maxTokens: 8192
      }
    })

    const response = await client.send(command)
    const text = response.output?.message?.content?.[0]?.text || ''

    let cleanText = text.trim()
    if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7)
    else if (cleanText.startsWith('```')) cleanText = cleanText.substring(3)
    if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3)
    cleanText = cleanText.trim()

    let episodesPlan: any[] = []
    try {
      episodesPlan = JSON.parse(cleanText)
    } catch (parseError) {
      console.error('Failed to parse AWS Bedrock response:', cleanText)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    if (!Array.isArray(episodesPlan) || episodesPlan.length !== episodeCount) {
      return NextResponse.json({ error: 'AI returned invalid episode count' }, { status: 500 })
    }

    const episodesToInsert = episodesPlan.map((ep, i) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      return {
        campaign_id: campaignId,
        episode_number: i + 1,
        status: 'idea',
        scheduled_date: date.toISOString().split('T')[0],
        title: ep.title,
        topic: ep.title,          // pre-fill topic so research/script/video panels are enabled
        description: ep.description,
        storytelling_prompt: ep.storytelling_prompt,
        video_prompt: ep.video_prompt
      }
    })

    const { error: insertError } = await supabase
      .from('episodes')
      .insert(episodesToInsert)

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      return NextResponse.json({ error: 'Failed to insert episodes into database' }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: episodesToInsert.length })

  } catch (error: any) {
    console.error('Plan route error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
