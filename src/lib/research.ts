export async function searchYouTube(topic: string, maxResults = 5) {
  const key = process.env.YOUTUBE_API_KEY
  if (!key || key === 'your_youtube_data_api_key') return { items: [] }

  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic)}&type=video&order=viewCount&maxResults=${maxResults}&key=${key}`
    )
    const searchData = await searchRes.json()
    if (!searchData.items?.length) return { items: [] }

    const videoIds = searchData.items.map((i: any) => i.id.videoId).join(',')
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${key}`
    )
    return statsRes.json()
  } catch {
    return { items: [] }
  }
}
