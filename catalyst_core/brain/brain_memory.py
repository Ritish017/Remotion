"""
BrainMemory: Persistent per-campaign learning across days.
"""

from datetime import date


class BrainMemory:

    def __init__(self, supabase_client):
        self.db = supabase_client

    def load(self, campaign_id: str) -> dict:
        try:
            result = self.db.table("brain_memory")\
                .select("*")\
                .eq("campaign_id", campaign_id)\
                .single().execute()
            return result.data or {}
        except Exception:
            return {}

    def save(self, campaign_id: str, decision: dict, world_context: dict):
        try:
            existing = self.load(campaign_id)
            topics_covered = existing.get("topics_covered", [])

            for ep in decision.get("episodes", []):
                topic = ep.get("title") or ep.get("topic")
                if topic and topic not in topics_covered:
                    topics_covered.append(topic)

            decision_history = existing.get("decision_history", [])
            decision_history.append({
                "date": date.today().isoformat(),
                "theme": decision.get("today_theme"),
                "confidence": decision.get("confidence"),
                "episodes_count": len(decision.get("episodes", []))
            })
            # Keep last 30 decisions
            decision_history = decision_history[-30:]

            self.db.table("brain_memory").upsert({
                "campaign_id": campaign_id,
                "topics_covered": topics_covered,
                "decision_history": decision_history,
                "updated_at": date.today().isoformat()
            }).execute()
        except Exception as e:
            print(f"[BrainMemory] Save error: {e}")
