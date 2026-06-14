"""
PerformanceLearner: Reads analytics from past episodes and extracts patterns
the brain can use to make better content decisions.
"""

from datetime import date, timedelta


class PerformanceLearner:

    def __init__(self, supabase_client):
        self.db = supabase_client

    async def get_insights(self, campaign_id: str) -> dict:
        try:
            episodes = self.db.table("episodes")\
                .select("id, title, topic, episode_type, status, virality_score, scheduled_date")\
                .eq("campaign_id", campaign_id)\
                .eq("status", "analysed")\
                .order("scheduled_date", desc=True)\
                .limit(20)\
                .execute().data or []

            if not episodes:
                return {"message": "No analysed episodes yet — insufficient data for pattern extraction"}

            scores = [ep["virality_score"] for ep in episodes if ep.get("virality_score") is not None]
            avg_score = sum(scores) / len(scores) if scores else 0

            top = sorted(
                [ep for ep in episodes if ep.get("virality_score")],
                key=lambda e: e["virality_score"],
                reverse=True
            )[:3]

            bottom = sorted(
                [ep for ep in episodes if ep.get("virality_score")],
                key=lambda e: e["virality_score"]
            )[:3]

            type_scores: dict = {}
            for ep in episodes:
                t = ep.get("episode_type") or "standard"
                if t not in type_scores:
                    type_scores[t] = []
                if ep.get("virality_score"):
                    type_scores[t].append(ep["virality_score"])

            best_type = max(
                type_scores,
                key=lambda t: sum(type_scores[t]) / len(type_scores[t]) if type_scores[t] else 0,
                default=None
            )

            return {
                "episodes_analysed": len(episodes),
                "average_virality_score": round(avg_score, 1),
                "top_performing": [{"title": e["title"], "score": e["virality_score"]} for e in top],
                "underperforming": [{"title": e["title"], "score": e["virality_score"]} for e in bottom],
                "best_episode_type": best_type,
                "type_performance": {
                    t: round(sum(s) / len(s), 1) for t, s in type_scores.items() if s
                }
            }
        except Exception as e:
            return {"error": str(e)}
