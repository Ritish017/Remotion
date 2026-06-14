"""
SocialBrandingFetcher: Live context for social branding campaigns.
Focuses on viral formats, hooks, and trending content patterns.
"""

import aiohttp
import asyncio
import os
from .base_fetcher import BaseFetcher


class SocialBrandingFetcher(BaseFetcher):

    YOUTUBE_API = "https://www.googleapis.com/youtube/v3"

    VIRAL_FORMATS = [
        "POV: You discovered...", "Nobody talks about this...",
        "You're doing X wrong", "The truth about X",
        "Stop doing X, do this instead", "This changed everything for me",
        "I tested X so you don't have to", "The X nobody tells you about"
    ]

    async def fetch(self, campaign: dict) -> dict:
        yt_key = os.environ.get("YOUTUBE_API_KEY", "")
        topic = campaign.get("topic", "productivity")

        async with aiohttp.ClientSession() as session:
            results = await asyncio.gather(
                self._trending_shorts(session, yt_key, topic),
                self._viral_reels_style(session, yt_key, topic),
                return_exceptions=True
            )

        shorts, viral = results
        shorts_videos = self._parse_yt(shorts)
        viral_videos = self._parse_yt(viral)

        trending_formats = self._identify_formats(shorts_videos + viral_videos)

        return {
            "date": self._today(),
            "campaign_type": "social-branding",
            "primary_events": [],
            "trending_topics": [v["title"][:60] for v in (shorts_videos + viral_videos)[:5]],
            "trending_formats": trending_formats,
            "viral_hooks": self._extract_hooks(shorts_videos + viral_videos),
            "platform_opportunities": {
                "instagram": "Reels 15-30s, hook in first frame, text on screen",
                "youtube": "Shorts under 60s, YouTube algorithm favouring AI topics",
                "x": "Controversial opinion + explanation thread",
                "linkedin": "Story format, professional angle, lesson learned"
            },
            "opportunities": [
                f"Use viral format: '{f}'" for f in trending_formats[:3]
            ],
            "context_summary": f"Social content today. Top format signals: {', '.join(trending_formats[:2])}. "
                               f"Recent viral video: '{shorts_videos[0]['title'][:60] if shorts_videos else 'none'}'."
        }

    async def _trending_shorts(self, session, key, topic) -> dict:
        params = {
            "key": key, "q": f"{topic} shorts viral 2026", "type": "video",
            "videoDuration": "short", "order": "viewCount", "maxResults": 8, "part": "snippet"
        }
        try:
            async with session.get(f"{self.YOUTUBE_API}/search", params=params) as r:
                return await r.json()
        except Exception:
            return {}

    async def _viral_reels_style(self, session, key, topic) -> dict:
        params = {
            "key": key, "q": f"{topic} reels tips", "type": "video",
            "order": "relevance", "maxResults": 8, "part": "snippet"
        }
        try:
            async with session.get(f"{self.YOUTUBE_API}/search", params=params) as r:
                return await r.json()
        except Exception:
            return {}

    def _parse_yt(self, data) -> list:
        if not data or isinstance(data, Exception):
            return []
        items = []
        for item in (data.get("items") or []):
            snippet = item.get("snippet", {})
            items.append({
                "title": snippet.get("title", ""),
                "channel": snippet.get("channelTitle", ""),
                "description": snippet.get("description", "")[:100]
            })
        return items

    def _identify_formats(self, videos: list) -> list:
        found = []
        for fmt in self.VIRAL_FORMATS:
            trigger = fmt.split(" ")[1].lower() if " " in fmt else fmt.lower()
            for v in videos:
                if trigger in v["title"].lower():
                    found.append(fmt)
                    break
        return found if found else self.VIRAL_FORMATS[:3]

    def _extract_hooks(self, videos: list) -> list:
        hooks = []
        for v in videos[:5]:
            title = v["title"]
            if "?" in title:
                hooks.append(title[:60])
            elif any(w in title.lower() for w in ["why", "how", "stop", "never", "always"]):
                hooks.append(title[:60])
        return hooks[:5] if hooks else ["Hook from trending content not available today"]
