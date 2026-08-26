import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AIFactory } from '@/lib/providers/ai';
import { repairJsonString } from '@/lib/providers/ai/claude/ClaudeProvider';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, name, type, description, brandVoice, targetAudience, startDate, episodeCount } = body;

    if (!campaignId || !episodeCount || episodeCount <= 0) {
      return NextResponse.json({ error: 'Invalid campaign parameters' }, { status: 400 });
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
]`;

    const ai = AIFactory.getPrimary();
    const response = await ai.generate(systemPrompt, { maxTokens: 4096, temperature: 0.5 });
    const cleanText = repairJsonString(response.text);

    let episodesPlan: any[] = [];
    try {
      episodesPlan = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse AI campaign response:', cleanText);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    if (!Array.isArray(episodesPlan) || episodesPlan.length !== episodeCount) {
      return NextResponse.json({ error: 'AI returned invalid episode count' }, { status: 500 });
    }

    const episodesToInsert = episodesPlan.map((ep, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return {
        campaign_id: campaignId,
        episode_number: i + 1,
        status: 'idea',
        scheduled_date: date.toISOString().split('T')[0],
        title: ep.title,
        topic: ep.title,
        description: ep.description,
        storytelling_prompt: ep.storytelling_prompt,
        video_prompt: ep.video_prompt,
      };
    });

    const { error: insertError } = await supabase
      .from('episodes')
      .insert(episodesToInsert);

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json({ error: 'Failed to insert episodes into database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: episodesToInsert.length });
  } catch (error: any) {
    console.error('Plan route error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
