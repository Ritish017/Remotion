"""
GenericFetcher: Fallback for any campaign type not yet registered.
Uses YouTube Data API for the campaign's topic.
"""

import aiohttp
import os
from .base_fetcher import BaseFetcher


class GenericFetcher(BaseFetcher):

    YOUTUBE_API = "https://www.googleapis.com/youtube/v3"

    async def fetch(self, campaign: dict) -> dict:
        topic = campaign.get("topic") or campaign.get("name") or "content creation"
        yt_key = os.environ.get("YOUTUBE_API_KEY", "")

        videos = []
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    "key": yt_key, "q": f"{topic} 2026",
                    "type": "video", "order": "relevance",
                    "maxResults": 5, "part": "snippet"
                }
                async with session.get(f"{self.YOUTUBE_API}/search", params=params) as r:
                    data = await r.json()
                    for item in (data.get("items") or []):
                        videos.append(item.get("snippet", {}).get("title", ""))
        except Exception:
            pass

        return {
            "date": self._today(),
            "campaign_type": campaign.get("type", "unknown"),
            "primary_events": [],
            "trending_topics": videos,
            "opportunities": [f"Create content about {topic}"] if topic else [],
            "context_summary": f"Generic context for '{topic}'. "
                               f"Trending: {videos[0][:60] if videos else 'No data'}."
        }
