"""
CampaignBrain: Universal autonomous content strategist.

Works for ANY campaign type by:
1. Loading the campaign's registered data sources via ContextRegistry
2. Fetching live world context from those sources
3. Reasoning with Nova Pro (AWS Bedrock) to make content decisions
4. Creating episodes and triggering the existing pipeline
"""

import asyncio
import json
from datetime import date
import boto3
import os

from .context_registry import ContextRegistry
from .performance_learner import PerformanceLearner
from .brain_memory import BrainMemory
from .episode_factory import EpisodeFactory

BRAIN_SYSTEM_PROMPT = """
You are the Campaign Brain for CATALYST Content OS.

You are an autonomous AI content strategist. Every morning you wake up, look at the
real world, and decide what video content to create today for a specific campaign.

You are given structured context. You reason through it. You make a decision.

UNIVERSAL REASONING RULES (apply to any campaign type):
1. TIMELINESS FIRST — What is happening TODAY matters more than evergreen content
2. SPECIFICITY — Name real things: real matches, real model releases, real events
3. NO REPETITION — Check episode history, never repeat a topic
4. PERFORMANCE AWARENESS — Lean into what's working, away from what isn't
5. PLATFORM FIT — Instagram wants reactive punchy content, YouTube wants depth
6. CAMPAIGN PHASE — Early (educate), Mid (grow), Late (convert/retain)
7. AUDIENCE RESPECT — Never talk down, always add genuine value

CONTENT DECISION LOGIC BY WHAT YOU SEE:
- If LIVE EVENT exists today → make it the primary episode (match, product launch, etc.)
- If BREAKING NEWS in your domain → reactive episode + evergreen context piece
- If TRENDING TOPIC matches campaign → ride the wave with your unique angle
- If nothing special today → pick the highest-value evergreen topic not yet covered
- If audience loved something → do a follow-up or deeper dive
- If approaching campaign end → tie threads together, drive conversion

OUTPUT — return valid JSON only, no markdown:
{
  "reasoning": "2-3 sentences: what you saw, what you decided, why",
  "confidence": 0-100,
  "today_theme": "One sentence: what today's content is about",
  "skip_today": false,
  "skip_reason": null,
  "episodes": [
    {
      "title": "Specific compelling title",
      "episode_type": "preview|reaction|tutorial|explainer|roundup|breaking|analysis|prediction",
      "hook": "Opening line that grabs attention in first 3 words",
      "topic_depth": "Exactly what to cover",
      "key_facts": ["concrete fact from live data", "another fact"],
      "unique_angle": "What makes this shareable",
      "urgency": "breaking|high|normal|low",
      "post_timing": "now|in_2_hours|at_08:00|at_18:00",
      "platform_strategy": {
        "instagram": {"post": true, "angle": "...", "format": "reel|story"},
        "youtube": {"post": true, "angle": "...", "format": "short|long"},
        "x": {"post": true, "angle": "...", "format": "tweet|thread"},
        "linkedin": {"post": false, "reason": "not relevant"}
      },
      "research_queries": ["exact search string 1", "exact search string 2"],
      "hashtags": ["#Specific", "#Hashtags"],
      "catalyst_style": "tutorial-teaching|ai-social|fifa-sports|saas-kinetic",
      "veo_background_prompt": "Describe the 8s background clip for Veo to generate",
      "script_direction": "Direction for the Script Agent — tone, key points, structure"
    }
  ],
  "tomorrow_preview": "What you expect tomorrow will be about"
}
"""


class CampaignBrain:

    def __init__(self, supabase_client):
        self.db = supabase_client
        self.registry = ContextRegistry()
        self.learner = PerformanceLearner(supabase_client)
        self.memory = BrainMemory(supabase_client)
        self.factory = EpisodeFactory(supabase_client)
        self.bedrock = boto3.client(
            "bedrock-runtime",
            region_name=os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
        )

    async def run(self, campaign_id: str) -> dict:
        print(f"[Brain] Running for campaign {campaign_id}")

        campaign = self._load_campaign(campaign_id)
        campaign_type = campaign["type"]

        fetcher = self.registry.get_fetcher(campaign_type)
        world_context = await fetcher.fetch(campaign)

        performance = await self.learner.get_insights(campaign_id)
        memory = self.memory.load(campaign_id)
        history = self._load_history(campaign_id, limit=15)

        prompt = self._build_prompt(campaign, world_context, performance, memory, history)
        decision = await self._reason(prompt)

        episodes_created = []
        if not decision.get("skip_today"):
            for ep_spec in decision.get("episodes", []):
                episode = self.factory.create(campaign_id, ep_spec, world_context)
                episodes_created.append(episode)

        self.memory.save(campaign_id, decision, world_context)
        self._log_run(campaign_id, decision, world_context, len(episodes_created))

        return {
            "campaign_id": campaign_id,
            "date": date.today().isoformat(),
            "campaign_type": campaign_type,
            "decision": decision,
            "world_context": world_context,
            "episodes_created": len(episodes_created),
            "episode_ids": [ep["id"] for ep in episodes_created if "id" in ep]
        }

    def _build_prompt(self, campaign, context, performance, memory, history) -> str:
        today = date.today()
        start = date.fromisoformat(campaign["start_date"]) if campaign.get("start_date") else today
        days_in = max(1, (today - start).days + 1)
        total = campaign.get("duration_days", 30)
        phase = "early" if days_in <= 7 else "mid" if days_in <= 21 else "late"

        return f"""
CAMPAIGN:
  Name: {campaign['name']}
  Type: {campaign['type']}
  Voice: {campaign.get('brand_voice', 'Energetic and engaging')}
  Audience: {campaign.get('target_audience', 'General audience')}
  Platforms: {', '.join(campaign.get('target_platforms', []))}
  Day {days_in} of {total} | Phase: {phase}
  Start: {campaign.get('start_date', 'N/A')} | Today: {today.isoformat()}

LIVE WORLD CONTEXT (fetched right now):
{json.dumps(context, indent=2, default=str)}

WHAT HAS WORKED SO FAR (performance data):
{json.dumps(performance, indent=2, default=str)}

BRAIN MEMORY (what I have learned about this campaign):
{json.dumps(memory, indent=2, default=str)}

EPISODE HISTORY (DO NOT REPEAT THESE TOPICS):
{json.dumps([{"title": ep.get("title"), "date": ep.get("scheduled_date"), "type": ep.get("episode_type")} for ep in history], indent=2)}

---
Today is {today.strftime('%A, %B %d, %Y')}.
Reason through all of the above and decide what content to create today.
Be specific. Use the real data in the context. Return JSON only.
"""

    async def _reason(self, prompt: str) -> dict:
        try:
            response = self.bedrock.invoke_model(
                modelId="amazon.nova-pro-v1:0",
                body=json.dumps({
                    "messages": [
                        {"role": "user", "content": [{"text": prompt}]}
                    ],
                    "system": [{"text": BRAIN_SYSTEM_PROMPT}],
                    "inferenceConfig": {"maxTokens": 2048, "temperature": 0.3}
                })
            )
            body = json.loads(response["body"].read())
            text = body["output"]["message"]["content"][0]["text"]
            text = text.replace("```json", "").replace("```", "").strip()
            return json.loads(text)
        except Exception as e:
            print(f"[Brain] Reasoning error: {e}")
            return {"skip_today": True, "skip_reason": str(e), "episodes": []}

    def _load_campaign(self, campaign_id: str) -> dict:
        result = self.db.table("campaigns").select("*").eq("id", campaign_id).single().execute()
        if not result.data:
            raise ValueError(f"Campaign {campaign_id} not found")
        return result.data

    def _load_history(self, campaign_id: str, limit: int = 15) -> list:
        result = self.db.table("episodes")\
            .select("title, topic, scheduled_date, episode_type, status")\
            .eq("campaign_id", campaign_id)\
            .order("scheduled_date", desc=True)\
            .limit(limit)\
            .execute()
        return result.data or []

    def _log_run(self, campaign_id, decision, context, episodes_created):
        try:
            self.db.table("brain_runs").insert({
                "campaign_id": campaign_id,
                "run_date": date.today().isoformat(),
                "reasoning": decision.get("reasoning"),
                "confidence": decision.get("confidence", 0),
                "today_theme": decision.get("today_theme"),
                "episodes_created": episodes_created,
                "world_context": context,
                "full_decision": decision
            }).execute()
        except Exception as e:
            print(f"[Brain] Log run error: {e}")
