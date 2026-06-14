# CATALYST CAMPAIGN BRAIN — UNIVERSAL INTELLIGENCE LAYER
## Claude Code Build Prompt
## One brain that reasons correctly for ANY campaign type, now and in the future
## Pass this entire file to Claude Code as your first message

---

## THE PROBLEM WITH THE PREVIOUS APPROACH

The football brain was hardcoded with football logic. The moment you create an
AI Teaching campaign or a Social Branding campaign, it breaks or produces wrong content.

The correct architecture is ONE brain with:
- A universal reasoning core (campaign-type agnostic)
- Pluggable data sources (each campaign type registers its own sources)
- A shared intelligence layer that works for any domain

This means: add a new campaign type in the future (e.g. "Tech Product Reviews",
"Crypto", "Cooking") and the brain works immediately — no code changes needed.

---

## WHAT THIS SYSTEM ADDS TO YOUR EXISTING APP

Your existing stack (Next.js 16, FastAPI, Supabase, AWS Bedrock, Nova models,
HyperFrames, FFmpeg) stays exactly as-is.

This adds ONE new subsystem: `catalyst_core/brain/`

It plugs into your existing:
- Supabase campaigns + episodes tables (adds new columns + new tables)
- FastAPI server.py (registers new endpoints)
- Next.js dashboard (adds Brain tab per campaign)

---

## INSTALL THESE PACKAGES FIRST

```bash
# Python (add to requirements.txt)
pip install apscheduler aiohttp trendspyg newsapi-python

# Node (already have most, add if missing)
npm install swr
```

---

## DATABASE — ADD TO YOUR EXISTING SUPABASE SCHEMA

```sql
-- Brain runs: log every morning decision
CREATE TABLE IF NOT EXISTS brain_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  run_date DATE NOT NULL,
  reasoning TEXT,
  confidence INTEGER CHECK (confidence BETWEEN 0 AND 100),
  today_theme TEXT,
  episodes_created INTEGER DEFAULT 0,
  world_context JSONB DEFAULT '{}',
  full_decision JSONB DEFAULT '{}',
  ran_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brain memory: persistent per-campaign learning
CREATE TABLE IF NOT EXISTS brain_memory (
  campaign_id UUID PRIMARY KEY REFERENCES campaigns(id) ON DELETE CASCADE,
  topics_covered JSONB DEFAULT '[]',
  performance_patterns JSONB DEFAULT '{}',
  learned_preferences JSONB DEFAULT '{}',
  decision_history JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live event tracker: for sports live scores + breaking news
CREATE TABLE IF NOT EXISTS live_event_states (
  event_key TEXT PRIMARY KEY,
  campaign_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  last_processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add to existing episodes table
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS episode_type TEXT DEFAULT 'standard';
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal'
  CHECK (urgency IN ('breaking', 'high', 'normal', 'low'));
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS auto_triggered BOOLEAN DEFAULT FALSE;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS pipeline_completed_at TIMESTAMPTZ;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS world_context_used JSONB DEFAULT '{}';
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS brain_reasoning TEXT;
```

---

## FILE STRUCTURE TO CREATE

```
catalyst_core/
  brain/
    __init__.py
    campaign_brain.py          # Universal orchestrator — the core
    context_registry.py        # Maps campaign types → their data sources
    world_context/
      __init__.py
      base_fetcher.py          # Abstract base class all fetchers inherit
      football_fetcher.py      # Live fixtures, scores, standings (API-Football)
      ai_teaching_fetcher.py   # Trending AI topics (YouTube + Google Trends)
      social_branding_fetcher.py  # Viral content patterns (Trends + YouTube)
      generic_fetcher.py       # Fallback for unknown campaign types
    performance_learner.py     # Reads analytics, extracts patterns
    brain_memory.py            # Persistent memory across days
    episode_factory.py         # Creates episode rows from brain decisions
    scheduler.py               # APScheduler: morning run + live watchers
    live_watchers/
      __init__.py
      base_watcher.py          # Abstract watcher base
      football_watcher.py      # Goal detection, match finish detection
      news_watcher.py          # Breaking news detection (all campaign types)

src/
  app/
    api/
      brain/
        run/route.ts           # POST: manually trigger brain
        status/route.ts        # GET: today's decisions + memory
        history/route.ts       # GET: last 30 brain runs
  components/
    brain/
      BrainPanel.tsx           # Main brain UI (added as tab in campaign page)
      BrainDecisionCard.tsx    # Shows today's reasoning + theme
      WorldContextFeed.tsx     # Live context the brain is seeing
      BrainHistoryLog.tsx      # Last 7 days of decisions
      ManualOverride.tsx       # Override today's plan
```

---

## CORE FILE 1: campaign_brain.py — THE UNIVERSAL ORCHESTRATOR

```python
"""
CampaignBrain: Universal autonomous content strategist.

Works for ANY campaign type by:
1. Loading the campaign's registered data sources via ContextRegistry
2. Fetching live world context from those sources
3. Reasoning with Claude to make content decisions
4. Creating episodes and triggering the existing pipeline

To add a new campaign type (e.g. "crypto", "cooking"):
  1. Create a new fetcher in world_context/
  2. Register it in context_registry.py
  Done. The brain works immediately.
"""

import asyncio
import json
from datetime import date, datetime
from typing import Optional
import anthropic
import boto3
import os

from .context_registry import ContextRegistry
from .performance_learner import PerformanceLearner
from .brain_memory import BrainMemory
from .episode_factory import EpisodeFactory

# ─────────────────────────────────────────────────────
# THE BRAIN'S SYSTEM PROMPT — COMPLETELY CAMPAIGN-AGNOSTIC
# ─────────────────────────────────────────────────────
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
      "title": "Specific compelling title — not generic",
      "episode_type": "preview|reaction|tutorial|explainer|roundup|breaking|analysis|prediction",
      "hook": "Opening line that grabs attention in first 3 words",
      "topic_depth": "Exactly what to cover — be specific, not vague",
      "key_facts": ["concrete fact from live data", "another fact"],
      "unique_angle": "What makes this shareable — the opinion or take",
      "urgency": "breaking|high|normal|low",
      "post_timing": "now|in_2_hours|at_08:00|at_18:00",
      "platform_strategy": {
        "instagram": {"post": true, "angle": "...", "format": "reel|story"},
        "youtube": {"post": true, "angle": "...", "format": "short|long"},
        "x": {"post": true, "angle": "...", "format": "tweet|thread"},
        "linkedin": {"post": false, "reason": "not relevant for this content type"}
      },
      "research_queries": ["exact search string 1", "exact search string 2"],
      "hashtags": ["#Specific", "#Hashtags"],
      "catalyst_style": "tutorial-teaching|ai-social|fifa-sports|saas-kinetic",
      "veo_background_prompt": "Describe the 8s background clip for Veo to generate",
      "script_direction": "Direction for the Script Agent — tone, key points, structure"
    }
  ],
  "tomorrow_preview": "What you expect tomorrow will be about (forward thinking)"
}
"""

class CampaignBrain:
    """Universal campaign brain. Works for any campaign type."""

    def __init__(self, supabase_client):
        self.db = supabase_client
        self.registry = ContextRegistry()
        self.learner = PerformanceLearner(supabase_client)
        self.memory = BrainMemory(supabase_client)
        self.factory = EpisodeFactory(supabase_client)
        # Use AWS Bedrock Nova Pro for brain reasoning (as per your existing stack)
        self.bedrock = boto3.client(
            "bedrock-runtime",
            region_name=os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
        )

    async def run(self, campaign_id: str) -> dict:
        """Main entry point. Call this every morning per active campaign."""
        print(f"[Brain] Running for campaign {campaign_id}")

        # 1. Load campaign config
        campaign = self._load_campaign(campaign_id)
        campaign_type = campaign["type"]  # "football" | "ai-teaching" | "social-branding" | any future type

        # 2. Get the right context fetcher for this campaign type (from registry)
        fetcher = self.registry.get_fetcher(campaign_type)

        # 3. Fetch live world context
        world_context = await fetcher.fetch(campaign)
        print(f"[Brain] Context fetched: {fetcher.__class__.__name__}")

        # 4. Load performance insights from past episodes
        performance = await self.learner.get_insights(campaign_id)

        # 5. Load persistent brain memory
        memory = self.memory.load(campaign_id)

        # 6. Load episode history (last 15 to avoid repetition)
        history = self._load_history(campaign_id, limit=15)

        # 7. Build reasoning prompt
        prompt = self._build_prompt(campaign, world_context, performance, memory, history)

        # 8. Call AI to reason and decide (Nova Pro via Bedrock — your existing model)
        decision = await self._reason(prompt)

        # 9. Create episodes from decision
        episodes_created = []
        if not decision.get("skip_today"):
            for ep_spec in decision.get("episodes", []):
                episode = self.factory.create(campaign_id, ep_spec, world_context)
                episodes_created.append(episode)

        # 10. Save to memory + log run
        self.memory.save(campaign_id, decision, world_context)
        self._log_run(campaign_id, decision, world_context, len(episodes_created))

        return {
            "campaign_id": campaign_id,
            "date": date.today().isoformat(),
            "campaign_type": campaign_type,
            "decision": decision,
            "episodes_created": len(episodes_created),
            "episode_ids": [ep["id"] for ep in episodes_created]
        }

    def _build_prompt(self, campaign, context, performance, memory, history) -> str:
        today = date.today()
        start = date.fromisoformat(campaign["start_date"])
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
  Start: {campaign['start_date']} | Today: {today.isoformat()}

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
        """Use Nova Pro (your existing model) to reason and decide."""
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
            # Strip markdown fences (your existing pattern)
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
```

---

## CORE FILE 2: context_registry.py — THE PLUGIN SYSTEM

```python
"""
ContextRegistry: Maps campaign types to their world context fetchers.

This is what makes the brain universal. Add a new campaign type by:
  1. Creating world_context/your_type_fetcher.py
  2. Registering it here with one line

The brain never needs to change.
"""

from .world_context.football_fetcher import FootballFetcher
from .world_context.ai_teaching_fetcher import AITeachingFetcher
from .world_context.social_branding_fetcher import SocialBrandingFetcher
from .world_context.generic_fetcher import GenericFetcher


class ContextRegistry:

    def __init__(self):
        # Register campaign types → their fetchers
        # To add a new type: one line here + one new fetcher file
        self._registry = {
            "football":         FootballFetcher,
            "ai-teaching":      AITeachingFetcher,
            "social-branding":  SocialBrandingFetcher,
            # Future types — just add them here:
            # "crypto":         CryptoFetcher,
            # "cooking":        CookingFetcher,
            # "tech-reviews":   TechReviewsFetcher,
        }

    def get_fetcher(self, campaign_type: str):
        """Get the right context fetcher for a campaign type."""
        fetcher_class = self._registry.get(campaign_type, GenericFetcher)
        return fetcher_class()

    def register(self, campaign_type: str, fetcher_class):
        """Register a new campaign type at runtime."""
        self._registry[campaign_type] = fetcher_class

    def supported_types(self) -> list:
        return list(self._registry.keys())
```

---

## CORE FILE 3: world_context/base_fetcher.py — THE CONTRACT

```python
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
        """Safe nested dict access"""
        for key in keys:
            if not isinstance(data, dict):
                return default
            data = data.get(key, default)
        return data
```

---

## CORE FILE 4: world_context/football_fetcher.py

```python
"""
FootballFetcher: Live football context for football campaigns.
Uses API-Football (free tier: 100 req/day).
"""

import aiohttp
import asyncio
import os
from datetime import date, timedelta
from .base_fetcher import BaseFetcher


class FootballFetcher(BaseFetcher):

    BASE = "https://v3.football.api-sports.io"
    WC_LEAGUE_ID = 1       # FIFA World Cup
    WC_SEASON = 2026

    async def fetch(self, campaign: dict) -> dict:
        today = self._today()
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        yesterday = (date.today() - timedelta(days=1)).isoformat()

        headers = {
            "x-rapidapi-host": "v3.football.api-sports.io",
            "x-rapidapi-key": os.environ.get("FOOTBALL_API_KEY", "")
        }

        async with aiohttp.ClientSession() as session:
            results = await asyncio.gather(
                self._get(session, "/fixtures", {"league": self.WC_LEAGUE_ID, "season": self.WC_SEASON, "date": today}, headers),
                self._get(session, "/fixtures", {"league": self.WC_LEAGUE_ID, "season": self.WC_SEASON, "date": tomorrow}, headers),
                self._get(session, "/fixtures", {"league": self.WC_LEAGUE_ID, "season": self.WC_SEASON, "date": yesterday}, headers),
                self._get(session, "/fixtures", {"league": self.WC_LEAGUE_ID, "season": self.WC_SEASON, "live": "all"}, headers),
                self._get(session, "/standings", {"league": self.WC_LEAGUE_ID, "season": self.WC_SEASON}, headers),
                return_exceptions=True
            )

        today_fx, tomorrow_fx, yesterday_fx, live_fx, standings = results

        today_matches = self._parse_fixtures(today_fx)
        tomorrow_matches = self._parse_fixtures(tomorrow_fx)
        yesterday_results = self._parse_fixtures(yesterday_fx)
        live_now = self._parse_fixtures(live_fx)

        # Build the primary events list for the brain
        primary_events = []
        for m in live_now:
            primary_events.append({
                "type": "live_match",
                "priority": "breaking",
                "description": f"LIVE NOW: {m['home_team']} {m['home_goals']}-{m['away_goals']} {m['away_team']} (min {m['minute']})",
                "data": m
            })
        for m in today_matches:
            primary_events.append({
                "type": "upcoming_match",
                "priority": "high",
                "description": f"TODAY: {m['home_team']} vs {m['away_team']} at {m['time']}",
                "data": m
            })
        for m in yesterday_results:
            if m["status"] in ["FT", "AET", "PEN"]:
                primary_events.append({
                    "type": "recent_result",
                    "priority": "normal",
                    "description": f"RESULT: {m['home_team']} {m['home_goals']}-{m['away_goals']} {m['away_team']}",
                    "data": m
                })

        stage = self._infer_stage()

        return {
            "date": today,
            "campaign_type": "football",
            "tournament": "FIFA World Cup 2026",
            "tournament_stage": stage,
            "days_to_final": (date(2026, 7, 19) - date.today()).days,
            "primary_events": primary_events,
            "today_matches": today_matches,
            "tomorrow_matches": tomorrow_matches,
            "yesterday_results": yesterday_results,
            "live_now": live_now,
            "trending_topics": [m["home_team"] + " vs " + m["away_team"] for m in today_matches],
            "opportunities": self._find_opportunities(today_matches, yesterday_results, stage),
            "context_summary": self._summarize(today_matches, live_now, yesterday_results, stage)
        }

    def _find_opportunities(self, today, yesterday, stage) -> list:
        ops = []
        if today:
            ops.append(f"Pre-match preview opportunity: {len(today)} matches today")
        if yesterday:
            ops.append(f"Post-match reaction opportunity: {len(yesterday)} results from yesterday")
        if stage in ["quarterfinals", "semifinals", "final"]:
            ops.append(f"High-stakes {stage} content — maximum audience interest")
        return ops

    def _summarize(self, today, live, yesterday, stage) -> str:
        parts = []
        if live:
            parts.append(f"{len(live)} match(es) currently live")
        if today:
            parts.append(f"{len(today)} match(es) today including {today[0]['home_team']} vs {today[0]['away_team']}")
        if yesterday:
            parts.append(f"{len(yesterday)} results from yesterday to react to")
        parts.append(f"Tournament is in the {stage.replace('_', ' ')} stage")
        return ". ".join(parts) + "." if parts else "No live football data available today."

    def _infer_stage(self) -> str:
        d = date.today()
        if d <= date(2026, 6, 27): return "group_stage"
        elif d <= date(2026, 7, 3): return "round_of_32"
        elif d <= date(2026, 7, 7): return "round_of_16"
        elif d <= date(2026, 7, 11): return "quarterfinals"
        elif d <= date(2026, 7, 15): return "semifinals"
        else: return "final"

    def _parse_fixtures(self, data) -> list:
        if not data or isinstance(data, Exception):
            return []
        fixtures = []
        for f in (data.get("response") or []):
            fixtures.append({
                "fixture_id": f["fixture"]["id"],
                "time": f["fixture"]["date"][11:16] + " UTC",
                "status": f["fixture"]["status"]["short"],
                "home_team": f["teams"]["home"]["name"],
                "home_team_id": f["teams"]["home"]["id"],
                "away_team": f["teams"]["away"]["name"],
                "away_team_id": f["teams"]["away"]["id"],
                "home_goals": f["goals"]["home"],
                "away_goals": f["goals"]["away"],
                "minute": f["fixture"]["status"]["elapsed"],
                "venue": f["fixture"]["venue"]["name"],
                "round": f["league"]["round"]
            })
        return fixtures

    async def _get(self, session, path, params, headers) -> dict:
        try:
            async with session.get(self.BASE + path, params=params, headers=headers) as r:
                return await r.json()
        except Exception:
            return {}
```

---

## CORE FILE 5: world_context/ai_teaching_fetcher.py

```python
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

    # AI topics the brain monitors for trending signals
    MONITORED_KEYWORDS = [
        "AI agents", "Claude", "GPT", "Gemini", "LLM", "RAG",
        "fine tuning", "AI coding", "AI tutorial", "machine learning 2026"
    ]

    async def fetch(self, campaign: dict) -> dict:
        yt_key = os.environ.get("YOUTUBE_API_KEY", "")

        async with aiohttp.ClientSession() as session:
            # Fetch recent + popular AI videos
            results = await asyncio.gather(
                self._recent_ai_videos(session, yt_key),
                self._popular_ai_videos(session, yt_key),
                self._search_topic(session, yt_key, campaign.get("topic", "artificial intelligence")),
                return_exceptions=True
            )

        recent, popular, topic_specific = results

        # Get Google Trends data for AI keywords
        trending_scores = await self._get_trends()

        # Parse YouTube results
        recent_videos = self._parse_yt(recent)
        popular_videos = self._parse_yt(popular)
        topic_videos = self._parse_yt(topic_specific)

        # Find trending topics (high trend score + recent YouTube activity)
        trending_topics = self._find_trending(trending_scores, recent_videos)

        # Build primary events (breaking AI news, major releases)
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
        """Get Google Trends scores for AI keywords using trendspyg (free)."""
        try:
            from trendspyg import TrendReq
            pytrends = TrendReq(hl='en-US', tz=360)
            # Check top 5 keywords
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
```

---

## CORE FILE 6: world_context/social_branding_fetcher.py

```python
"""
SocialBrandingFetcher: Live context for social branding campaigns.
Focuses on viral formats, hooks, and trending content patterns.
"""

import aiohttp
import asyncio
import os
from datetime import datetime, timedelta
from .base_fetcher import BaseFetcher


class SocialBrandingFetcher(BaseFetcher):

    YOUTUBE_API = "https://www.googleapis.com/youtube/v3"

    # Format patterns that tend to go viral on short-form platforms
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
            "primary_events": [],  # Social branding is format-driven, not event-driven
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
        """Identify which viral formats appear in trending videos"""
        found = []
        for fmt in self.VIRAL_FORMATS:
            trigger = fmt.split(" ")[1].lower() if " " in fmt else fmt.lower()
            for v in videos:
                if trigger in v["title"].lower():
                    found.append(fmt)
                    break
        return found if found else self.VIRAL_FORMATS[:3]

    def _extract_hooks(self, videos: list) -> list:
        """Extract the opening hook patterns from viral video titles"""
        hooks = []
        for v in videos[:5]:
            title = v["title"]
            if "?" in title:
                hooks.append(title[:60])
            elif any(w in title.lower() for w in ["why", "how", "stop", "never", "always"]):
                hooks.append(title[:60])
        return hooks[:5] if hooks else ["Hook from trending content not available today"]
```

---

## CORE FILE 7: world_context/generic_fetcher.py

```python
"""
GenericFetcher: Fallback for any campaign type not yet registered.
Uses Google Trends + YouTube for the campaign's topic.
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
```

---

## CORE FILE 8: scheduler.py — UNIVERSAL SCHEDULER

```python
"""
CatalystScheduler: Runs the brain and live watchers on a schedule.
Handles ALL campaign types — not football-specific.
"""

import asyncio
import os
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, date
import aiohttp

from .campaign_brain import CampaignBrain


class CatalystScheduler:

    def __init__(self, supabase_client):
        self.db = supabase_client
        self.brain = CampaignBrain(supabase_client)
        self.scheduler = AsyncIOScheduler()

    def start(self):
        # Morning brain run — 6 AM every day
        self.scheduler.add_job(
            self.morning_brain_run,
            CronTrigger(hour=6, minute=0),
            id="morning_brain",
            name="Morning Campaign Brain Run",
            replace_existing=True
        )

        # Live event watcher — every 5 minutes (only active when needed)
        self.scheduler.add_job(
            self.live_event_check,
            IntervalTrigger(minutes=5),
            id="live_watcher",
            name="Live Event Watcher",
            replace_existing=True
        )

        # Analytics fetch — 9 AM daily
        self.scheduler.add_job(
            self.fetch_analytics,
            CronTrigger(hour=9, minute=0),
            id="analytics_fetch",
            name="Daily Analytics Fetch",
            replace_existing=True
        )

        self.scheduler.start()
        print(f"[Scheduler] Started. Next brain run: {self._next_6am()}")

    async def morning_brain_run(self):
        """Run brain for all active campaigns."""
        campaigns = self.db.table("campaigns")\
            .select("id, type, name")\
            .eq("status", "active")\
            .execute().data or []

        print(f"[Brain] Morning run: {len(campaigns)} active campaign(s)")

        for campaign in campaigns:
            try:
                result = await self.brain.run(campaign["id"])
                print(f"[Brain] '{campaign['name']}' ({campaign['type']}): "
                      f"{result['episodes_created']} episode(s) created")

                # Trigger pipeline for each created episode
                for ep_id in result.get("episode_ids", []):
                    asyncio.create_task(self._trigger_episode_pipeline(ep_id))

            except Exception as e:
                print(f"[Brain] Error on campaign '{campaign['name']}': {e}")

    async def live_event_check(self):
        """
        Check for live events across ALL active campaign types.
        Each campaign type has its own live check logic.
        """
        active = self.db.table("campaigns")\
            .select("id, type")\
            .eq("status", "active")\
            .execute().data or []

        campaign_types = set(c["type"] for c in active)

        for ctype in campaign_types:
            if ctype == "football":
                await self._check_football_live(active)
            # Add more live checks here as needed:
            # elif ctype == "crypto":
            #     await self._check_crypto_live(active)

    async def _check_football_live(self, campaigns):
        """Check for live football scores and goal events."""
        football_campaigns = [c for c in campaigns if c["type"] == "football"]
        if not football_campaigns:
            return

        headers = {
            "x-rapidapi-host": "v3.football.api-sports.io",
            "x-rapidapi-key": os.environ.get("FOOTBALL_API_KEY", "")
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    "https://v3.football.api-sports.io/fixtures",
                    params={"league": 1, "season": 2026, "live": "all"},
                    headers=headers
                ) as r:
                    data = await r.json()

            for fixture in (data.get("response") or []):
                fid = fixture["fixture"]["id"]
                home_goals = fixture["goals"]["home"] or 0
                away_goals = fixture["goals"]["away"] or 0
                total = home_goals + away_goals

                # Check last known state
                last = self.db.table("live_event_states")\
                    .select("event_data")\
                    .eq("event_key", f"football_{fid}")\
                    .single().execute()

                last_total = 0
                if last.data:
                    last_total = last.data.get("event_data", {}).get("goals_total", 0)

                # Goal detected
                if total > last_total:
                    for campaign in football_campaigns:
                        asyncio.create_task(
                            self._trigger_goal_reaction(campaign["id"], fixture)
                        )

                # Update state
                self.db.table("live_event_states").upsert({
                    "event_key": f"football_{fid}",
                    "campaign_type": "football",
                    "event_data": {
                        "goals_total": total,
                        "home_goals": home_goals,
                        "away_goals": away_goals,
                        "home_team": fixture["teams"]["home"]["name"],
                        "away_team": fixture["teams"]["away"]["name"],
                        "status": fixture["fixture"]["status"]["short"],
                        "minute": fixture["fixture"]["status"]["elapsed"]
                    },
                    "updated_at": datetime.now().isoformat()
                }).execute()

        except Exception as e:
            print(f"[LiveWatcher Football] Error: {e}")

    async def _trigger_goal_reaction(self, campaign_id: str, fixture: dict):
        """Auto-create a goal reaction episode — no approval needed (template-based)."""
        home = fixture["teams"]["home"]["name"]
        away = fixture["teams"]["away"]["name"]
        hg = fixture["goals"]["home"] or 0
        ag = fixture["goals"]["away"] or 0

        # Create episode directly
        self.db.table("episodes").insert({
            "campaign_id": campaign_id,
            "episode_number": 9000 + int(fixture["fixture"]["id"]) % 1000,
            "title": f"⚽ GOAL! {home} {hg}–{ag} {away}",
            "topic": f"Goal reaction: {home} vs {away}",
            "status": "auto_generating",
            "scheduled_date": date.today().isoformat(),
            "urgency": "breaking",
            "auto_triggered": True,
            "episode_type": "goal_reaction",
            "research": {"fixture": fixture, "trigger": "live_goal"},
            "brain_reasoning": f"Auto-triggered: goal detected in {home} vs {away}"
        }).execute()

    async def _trigger_episode_pipeline(self, episode_id: str):
        """Notify the FastAPI backend to process this episode."""
        try:
            async with aiohttp.ClientSession() as session:
                await session.post(
                    f"http://127.0.0.1:8000/pipeline/episode/{episode_id}"
                )
        except Exception as e:
            print(f"[Scheduler] Pipeline trigger failed for {episode_id}: {e}")

    async def fetch_analytics(self):
        """Fetch analytics for all posted content via Ayrshare."""
        # Implementation same as before — fetch from Ayrshare, save to analytics table
        pass

    def _next_6am(self) -> str:
        from datetime import date, time
        tomorrow = date.today().isoformat()
        return f"{tomorrow} 06:00 AM"
```

---

## WIRE INTO server.py (add these lines to your existing FastAPI)

```python
# In server.py — add at startup

from catalyst_core.brain.scheduler import CatalystScheduler

# After existing startup code:
@app.on_event("startup")
async def startup_event():
    # ... your existing startup code ...

    # Start the universal brain scheduler
    scheduler = CatalystScheduler(supabase_client)
    scheduler.start()
    print("[Server] Campaign Brain scheduler started")

# New manual trigger endpoint
@app.post("/brain/run/{campaign_id}")
async def trigger_brain(campaign_id: str):
    brain = CampaignBrain(supabase_client)
    result = await brain.run(campaign_id)
    return result

@app.get("/brain/status/{campaign_id}")
async def brain_status(campaign_id: str):
    latest = supabase_client.table("brain_runs")\
        .select("*")\
        .eq("campaign_id", campaign_id)\
        .order("ran_at", desc=True)\
        .limit(1)\
        .single().execute()
    memory = supabase_client.table("brain_memory")\
        .select("*")\
        .eq("campaign_id", campaign_id)\
        .single().execute()
    return {
        "latest_run": latest.data,
        "memory": memory.data
    }

@app.get("/brain/history/{campaign_id}")
async def brain_history(campaign_id: str):
    result = supabase_client.table("brain_runs")\
        .select("run_date, reasoning, confidence, today_theme, episodes_created")\
        .eq("campaign_id", campaign_id)\
        .order("ran_at", desc=True)\
        .limit(30)\
        .execute()
    return result.data or []
```

---

## NEXT.JS API ROUTES (src/app/api/brain/)

```typescript
// src/app/api/brain/run/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { campaignId } = await req.json()
  const res = await fetch(`http://127.0.0.1:8000/brain/run/${campaignId}`, {
    method: 'POST'
  })
  return NextResponse.json(await res.json())
}

// src/app/api/brain/status/route.ts
export async function GET(req: NextRequest) {
  const campaignId = req.nextUrl.searchParams.get('campaign')
  const res = await fetch(`http://127.0.0.1:8000/brain/status/${campaignId}`)
  return NextResponse.json(await res.json())
}

// src/app/api/brain/history/route.ts
export async function GET(req: NextRequest) {
  const campaignId = req.nextUrl.searchParams.get('campaign')
  const res = await fetch(`http://127.0.0.1:8000/brain/history/${campaignId}`)
  return NextResponse.json(await res.json())
}
```

---

## IMPLEMENTATION ORDER

1. SQL schema additions to Supabase
2. catalyst_core/brain/world_context/base_fetcher.py
3. catalyst_core/brain/world_context/generic_fetcher.py
4. catalyst_core/brain/world_context/football_fetcher.py
5. catalyst_core/brain/world_context/ai_teaching_fetcher.py
6. catalyst_core/brain/world_context/social_branding_fetcher.py
7. catalyst_core/brain/context_registry.py
8. catalyst_core/brain/performance_learner.py (from previous prompt, unchanged)
9. catalyst_core/brain/brain_memory.py (from previous prompt, unchanged)
10. catalyst_core/brain/episode_factory.py (creates episode rows)
11. catalyst_core/brain/campaign_brain.py (the orchestrator)
12. catalyst_core/brain/scheduler.py
13. Wire into server.py (startup + 3 new endpoints)
14. Next.js API routes (3 files)
15. BrainPanel.tsx UI component (add as tab in campaign page)

pip install apscheduler aiohttp trendspyg