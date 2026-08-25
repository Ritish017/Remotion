import { NextRequest, NextResponse } from 'next/server';
import { anthropic, DEFAULT_MODEL, FAST_MODEL } from '@/lib/ai/claude/client';
import { generateFullVideoSpec } from '@/lib/ai/claude/runtime';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. If requested to generate a full VideoSpec via director agents:
    if (body.action === 'generate_video_spec' || body.generateVideo) {
      const result = await generateFullVideoSpec({
        topic: body.topic || body.prompt,
        targetAudience: body.targetAudience,
        vertical: body.vertical,
        brandVoice: body.brandVoice,
        durationSeconds: body.durationSeconds || 45,
      });
      return NextResponse.json(result);
    }

    // 2. Format A: Content OS format (messages + system)
    if (body.messages && body.system) {
      const { messages, system, model: rawModel = DEFAULT_MODEL, max_tokens = 2048 } = body;
      const model = rawModel.includes('haiku') ? FAST_MODEL : DEFAULT_MODEL;

      const formattedMessages = messages.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
      }));

      const response = await anthropic.messages.create({
        model,
        max_tokens,
        system,
        messages: formattedMessages,
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
      else if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
      if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);
      cleanText = cleanText.trim();

      try {
        return NextResponse.json({ result: JSON.parse(cleanText), raw: text });
      } catch {
        return NextResponse.json({ result: null, raw: text });
      }
    }

    // 3. Format B: Legacy generate page format (prompt/vertical/platform)
    const { prompt, vertical, platform } = body;
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1500,
      system: `You are a content strategist for an AI-powered video system called Catalyst.\n\nGenerate a structured 4-part video narrative in valid JSON only.`,
      messages: [
        {
          role: 'user',
          content: `Brief: "${prompt}"\nVertical: ${vertical}\nPlatform: ${platform}\n\nGenerate a structured narrative with hook, problem, solution, cta, hashtags, and virality score.`,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
    else if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
    if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);
    cleanText = cleanText.trim();

    try {
      return NextResponse.json(JSON.parse(cleanText));
    } catch {
      return NextResponse.json({ error: 'Parse failed', raw: text }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Claude API route error:', error);
    return NextResponse.json({ error: error.message || 'Claude API error' }, { status: 500 });
  }
}
