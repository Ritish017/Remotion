import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime"
import { NextRequest, NextResponse } from 'next/server'

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1" })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Support both legacy format (prompt/vertical/platform) and new Content OS format (messages/system)
    if (body.messages && body.system) {
      // Content OS format — used by Research, Script, and Virality agents
      const { messages, system, model: rawModel = 'amazon.nova-pro-v1:0', max_tokens = 2048 } = body
      let model = rawModel
      if (model === 'claude-sonnet-4-6' || model === 'claude-3-5-sonnet-latest') model = 'amazon.nova-pro-v1:0'
      else if (model === 'claude-haiku-4-5' || model === 'claude-3-5-haiku-latest') model = 'amazon.nova-lite-v1:0'
      else if (model === 'claude-opus-4-8') model = 'amazon.nova-pro-v1:0'
      else if (model === 'nova-micro') model = 'amazon.nova-micro-v1:0'
      else if (model === 'nova-pro') model = 'amazon.nova-pro-v1:0'
      else if (model === 'nova-lite') model = 'amazon.nova-lite-v1:0'

      const convertedMessages = messages.map((m: any) => ({
        role: m.role,
        content: [{ text: m.content }]
      }))

      const command = new ConverseCommand({
        modelId: model,
        system: system ? [{ text: system }] : undefined,
        messages: convertedMessages,
        inferenceConfig: { maxTokens: max_tokens || 2048 }
      })

      const response = await client.send(command)
      const text = response.output?.message?.content?.[0]?.text || ''
      let cleanText = text.trim()
      if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7)
      else if (cleanText.startsWith('```')) cleanText = cleanText.substring(3)
      if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3)
      cleanText = cleanText.trim()
      try {
        return NextResponse.json({ result: JSON.parse(cleanText), raw: text })
      } catch {
        return NextResponse.json({ result: null, raw: text })
      }
    } else {
      // Legacy format — used by original generate pages
      const { prompt, vertical, platform, model: rawModel = 'amazon.nova-pro-v1:0' } = body
      let model = rawModel
      if (model === 'claude-sonnet-4-6' || model === 'claude-3-5-sonnet-latest') model = 'amazon.nova-pro-v1:0'
      else if (model === 'claude-haiku-4-5' || model === 'claude-3-5-haiku-latest') model = 'amazon.nova-lite-v1:0'
      else if (model === 'claude-opus-4-8') model = 'amazon.nova-pro-v1:0'
      else if (model === 'nova-micro') model = 'amazon.nova-micro-v1:0'
      else if (model === 'nova-pro') model = 'amazon.nova-pro-v1:0'
      else if (model === 'nova-lite') model = 'amazon.nova-lite-v1:0'

      const command = new ConverseCommand({
        modelId: model,
        messages: [{
          role: 'user',
          content: [{ text: `You are a content strategist for an AI-powered video system called Catalyst.\n\nBrief: "${prompt}"\nVertical: ${vertical}\nPlatform: ${platform}\n\nGenerate a structured 4-part video narrative. Return JSON ONLY (no markdown, no backticks):\n{\n  "title": "...",\n  "hook": { "headline": "...", "subtext": "...", "stat": "..." },\n  "problem": { "headline": "...", "bullets": ["...", "...", "..."], "stat": "..." },\n  "solution": { "headline": "...", "key_points": ["...", "...", "..."], "stat": "..." },\n  "cta": { "text": "...", "urgency": "..." },\n  "hashtags": ["...", "...", "...", "...", "..."],\n  "title_variants": ["...", "...", "..."],\n  "description": "...",\n  "virality_score": 0,\n  "virality_label": "Good|Great|Viral"\n}` }]
        }],
        inferenceConfig: { maxTokens: 1024 }
      })

      const response = await client.send(command)
      const text = response.output?.message?.content?.[0]?.text || ''
      let cleanText = text.trim()
      if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7)
      else if (cleanText.startsWith('```')) cleanText = cleanText.substring(3)
      if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3)
      cleanText = cleanText.trim()
      try {
        return NextResponse.json(JSON.parse(cleanText))
      } catch {
        return NextResponse.json({ error: 'Parse failed', raw: text }, { status: 500 })
      }
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AWS Bedrock API error' }, { status: 500 })
  }
}
