"""
EpisodeFactory: Creates episode rows in Supabase from brain decisions.
"""

from datetime import date


class EpisodeFactory:

    def __init__(self, supabase_client):
        self.db = supabase_client

    def create(self, campaign_id: str, ep_spec: dict, world_context: dict) -> dict:
        # Get next episode number
        result = self.db.table("episodes")\
            .select("episode_number")\
            .eq("campaign_id", campaign_id)\
            .order("episode_number", desc=True)\
            .limit(1).execute()

        last_num = result.data[0]["episode_number"] if result.data else 0
        next_num = last_num + 1

        episode = {
            "campaign_id": campaign_id,
            "episode_number": next_num,
            "title": ep_spec.get("title"),
            "topic": ep_spec.get("topic_depth") or ep_spec.get("title"),
            "status": "idea",
            "scheduled_date": date.today().isoformat(),
            "episode_type": ep_spec.get("episode_type", "standard"),
            "urgency": ep_spec.get("urgency", "normal"),
            "auto_triggered": True,
            "world_context_used": world_context,
            "brain_reasoning": ep_spec.get("script_direction"),
            "research": {
                "hook": ep_spec.get("hook"),
                "key_facts": ep_spec.get("key_facts", []),
                "unique_angle": ep_spec.get("unique_angle"),
                "platform_strategy": ep_spec.get("platform_strategy", {}),
                "research_queries": ep_spec.get("research_queries", []),
                "hashtags": ep_spec.get("hashtags", []),
                "catalyst_style": ep_spec.get("catalyst_style"),
                "veo_background_prompt": ep_spec.get("veo_background_prompt"),
                "post_timing": ep_spec.get("post_timing", "now"),
            }
        }

        inserted = self.db.table("episodes").insert(episode).select().single().execute()
        return inserted.data or episode
