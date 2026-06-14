"""
BaseFetcher: The contract every context fetcher must follow.

Every fetcher returns a standardized context dict that the brain can read.
The brain doesn't care WHERE the data came from — it just reads the context.
"""

from abc import ABC, abstractmethod
from datetime import date


class BaseFetcher(ABC):

    @abstractmethod
    async def fetch(self, campaign: dict) -> dict:
        """
        Fetch live world context for this campaign.

        Must return a dict with at least:
        {
            "date": "YYYY-MM-DD",
            "campaign_type": "...",
            "primary_events": [],      # Most important things happening today
            "trending_topics": [],     # What's trending in this domain
            "opportunities": [],       # Content opportunities the brain should know about
            "context_summary": "..."   # 2-3 sentence plain English summary for the brain
        }
        """
        pass

    def _today(self) -> str:
        return date.today().isoformat()

    def _safe_get(self, data, *keys, default=None):
        for key in keys:
            if not isinstance(data, dict):
                return default
            data = data.get(key, default)
        return data
