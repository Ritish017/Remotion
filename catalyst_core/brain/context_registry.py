"""
ContextRegistry: Maps campaign types to their world context fetchers.

To add a new campaign type:
  1. Create world_context/your_type_fetcher.py
  2. Register it here with one line
"""

from .world_context.football_fetcher import FootballFetcher
from .world_context.ai_teaching_fetcher import AITeachingFetcher
from .world_context.social_branding_fetcher import SocialBrandingFetcher
from .world_context.generic_fetcher import GenericFetcher


class ContextRegistry:

    def __init__(self):
        self._registry = {
            "football":        FootballFetcher,
            "ai-teaching":     AITeachingFetcher,
            "social-branding": SocialBrandingFetcher,
            # Future types — add here:
            # "crypto":         CryptoFetcher,
            # "cooking":        CookingFetcher,
        }

    def get_fetcher(self, campaign_type: str):
        fetcher_class = self._registry.get(campaign_type, GenericFetcher)
        return fetcher_class()

    def register(self, campaign_type: str, fetcher_class):
        self._registry[campaign_type] = fetcher_class

    def supported_types(self) -> list:
        return list(self._registry.keys())
