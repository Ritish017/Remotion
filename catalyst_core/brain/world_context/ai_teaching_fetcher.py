"""
AITeachingFetcher: Live context for AI teaching campaigns.
Sources: YouTube Data API (trending AI videos) + trendspyg (Google Trends)
"""

import aiohttp
import asyncio
import os
from datetime import datetime, timedelta
from .base_fetcher import BaseFetcher


class AITeachingFetcher(BaseFetcher):

    YOUTUBE_API = "https://www.googleapis.com/youtube/v3"

    MONITORED_KEYWORDS = [
        "AI agents", "Claude", "GPT", "Gemini", "LLM", "RAG",
        "fine tuning", "AI coding", "AI tutorial", "machine learning 2026"
    ]

    async def fetch(self, campaign: dict) -> dict:
        yt_key = os.environ.get("YOUTUBE_API_KEY", "")

        async with aiohttp.ClientSession() as session:
            results = await asyncio.gather(
                self._recent_ai_videos(session, yt_key),
                self._popular_ai_videos(session, yt_key),
                self._search_topic(session, yt_key, campaign.get("topic", "artificial intelligence")),
                return_exceptions=True
            )

        recent, popular, topic_specific = results

        trending_scores = await self._get_trends()

        recent_videos = self._parse_yt(recent)
        popular_videos = self._parse_yt(popular)
        topic_videos = self._parse_yt(topic_specific)

        trending_topics = self._find_trending(trending_scores, recent_videos)

        primary_events = []
        for vid in recent_videos[:3]:
            if any(kw.lower() in vid["title"].lower()
                   for kw in ["released", "launches", "new", "just dropped", "announces"]):
                primary_events.append({
                    "type": "ai_release_or_news",
                    "priority": "high",
                    "description": f"Recent: {vid['title']} ({vid['views']:,} views)",
                    "data": vid
                })

        return {
            "date": self._today(),
            "campaign_type": "ai-teaching",
            "primary_events": primary_events,
            "trending_topics": trending_topics,
            "recent_ai_videos": recent_videos[:5],
            "popular_ai_videos": popular_videos[:5],
            "topic_specific_videos": topic_videos[:5],
            "google_trends": trending_scores,
            "opportunities": self._find_opportunities(trending_topics, primary_events),
            "context_summary": self._summarize(trending_topics, primary_events, recent_videos)
        }

    async def _recent_ai_videos(self, session, key) -> dict:
        published_after = (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%dT00:00:00Z")
        return await self._yt_search(session, key, "AI tutorial 2026", "date", published_after)

    async def _popular_ai_videos(self, session, key) -> dict:
        return await self._yt_search(session, key, "artificial intelligence explained", "viewCount")

    async def _search_topic(self, session, key, topic: str) -> dict:
        return await self._yt_search(session, key, f"{topic} tutorial", "relevance")

    async def _yt_search(self, session, key, query, order, published_after=None) -> dict:
        params = {
            "key": key, "q": query, "type": "video",
            "order": order, "maxResults": 8, "part": "snippet"
        }
        if published_after:
            params["publishedAfter"] = published_after
        try:
            async with session.get(f"{self.YOUTUBE_API}/search", params=params) as r:
                return await r.json()
        except Exception:
            return {}

    async def _get_trends(self) -> dict:
        try:
            from trendspyg import TrendReq
            pytrends = TrendReq(hl='en-US', tz=360)
            keywords = self.MONITORED_KEYWORDS[:5]
            pytrends.build_payload(keywords, timeframe='now 7-d')
            interest = pytrends.interest_over_time()
            if interest is not None and not interest.empty:
                latest = interest.tail(1).to_dict(orient='records')[0]
                return {k: v for k, v in latest.items() if k != 'isPartial'}
        except Exception:
            pass
        return {}

    def _parse_yt(self, data) -> list:
        if not data or isinstance(data, Exception):
            return []
        videos = []
        for item in (data.get("items") or []):
            snippet = item.get("snippet", {})
            stats = item.get("statistics", {})
            videos.append({
                "title": snippet.get("title", ""),
                "channel": snippet.get("channelTitle", ""),
                "published": snippet.get("publishedAt", "")[:10],
                "description": snippet.get("description", "")[:150],
                "views": int(stats.get("viewCount", 0)) if stats else 0,
                "video_id": item.get("id", {}).get("videoId") if isinstance(item.get("id"), dict) else ""
            })
        return videos

    def _find_trending(self, trend_scores: dict, recent_videos: list) -> list:
        trending = []
        for keyword, score in trend_scores.items():
            if isinstance(score, (int, float)) and score > 60:
                trending.append({
                    "keyword": keyword,
                    "trend_score": score,
                    "signal": "Google Trends rising" if score > 75 else "Steady interest"
                })
        for vid in recent_videos[:3]:
            trending.append({
                "keyword": vid["title"][:50],
                "trend_score": None,
                "signal": f"Recent YouTube: {vid['channel']}"
            })
        return trending[:8]

    def _find_opportunities(self, trending, events) -> list:
        ops = []
        if events:
            ops.append(f"Breaking AI news to react to: {events[0]['description']}")
        for t in trending[:3]:
            if t.get("trend_score") and t["trend_score"] > 70:
                ops.append(f"High-trending topic: '{t['keyword']}' (score: {t['trend_score']})")
        return ops

    def _summarize(self, trending, events, recent) -> str:
        parts = []
        if events:
            parts.append(f"Breaking: {events[0]['description'][:80]}")
        if trending:
            top = trending[0]["keyword"]
            parts.append(f"Top trending AI topic: '{top}'")
        if recent:
            parts.append(f"Recent popular video: '{recent[0]['title'][:60]}'")
        return ". ".join(parts) + "." if parts else "No specific trending signals today — use evergreen AI topics."
