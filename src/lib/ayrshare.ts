const AYRSHARE_BASE = 'https://api.ayrshare.com/api'

export async function postToSocial(params: {
  platforms: string[]
  mediaUrl: string
  caption: string
  hashtags?: string[]
  scheduleDate?: string
  youTubeOptions?: { title: string; description: string; categoryId?: string }
}) {
  const body: Record<string, unknown> = {
    post: params.caption,
    platforms: params.platforms,
    mediaUrls: [params.mediaUrl],
  }
  if (params.hashtags) body.hashtags = params.hashtags
  if (params.scheduleDate) body.scheduleDate = params.scheduleDate
  if (params.youTubeOptions) {
    body.youTubeOptions = {
      title: params.youTubeOptions.title,
      description: params.youTubeOptions.description,
      categoryId: params.youTubeOptions.categoryId || '28',
    }
  }

  const res = await fetch(`${AYRSHARE_BASE}/post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AYRSHARE_API_KEY}`,
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function getPostAnalytics(postId: string) {
  const res = await fetch(`${AYRSHARE_BASE}/analytics/post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AYRSHARE_API_KEY}`,
    },
    body: JSON.stringify({ id: postId }),
  })
  return res.json()
}

export async function deletePost(postId: string) {
  const res = await fetch(`${AYRSHARE_BASE}/post`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AYRSHARE_API_KEY}`,
    },
    body: JSON.stringify({ id: postId }),
  })
  return res.json()
}
