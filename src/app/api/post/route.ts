import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { platforms, mediaUrl, caption, hashtags, scheduleDate, title, description } = await req.json()

    const ayrshareKey = process.env.AYRSHARE_API_KEY
    if (!ayrshareKey || ayrshareKey === 'your_ayrshare_key') {
      // Mock response when no API key is configured
      return NextResponse.json({
        status: 'success',
        message: 'Post simulated (no Ayrshare API key configured)',
        posts: (platforms as string[]).map((p) => ({
          platform: p,
          status: 'scheduled',
          id: `mock-${p}-${Date.now()}`,
        })),
      })
    }

    const ayrshareBody: Record<string, unknown> = {
      post: caption,
      platforms,
      mediaUrls: [mediaUrl],
    }
    if (hashtags) ayrshareBody.hashtags = hashtags
    if (scheduleDate) ayrshareBody.scheduleDate = scheduleDate
    if (title) {
      ayrshareBody.youTubeOptions = { title, description: description || '', categoryId: '28' }
    }

    const res = await fetch('https://api.ayrshare.com/api/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ayrshareKey}`,
      },
      body: JSON.stringify(ayrshareBody),
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Post failed' }, { status: 500 })
  }
}
