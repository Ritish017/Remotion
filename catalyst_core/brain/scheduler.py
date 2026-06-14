"""
CatalystScheduler: Runs the brain and live watchers on a schedule.
Handles ALL campaign types.

Usage (in a FastAPI server.py startup):
    from catalyst_core.brain.scheduler import CatalystScheduler
    scheduler = CatalystScheduler(supabase_client)
    scheduler.start()
"""

import asyncio
import os
from datetime import datetime, date
import aiohttp

from .campaign_brain import CampaignBrain


class CatalystScheduler:

    def __init__(self, supabase_client):
        self.db = supabase_client
        self.brain = CampaignBrain(supabase_client)
        self._setup_scheduler()

    def _setup_scheduler(self):
        try:
            from apscheduler.schedulers.asyncio import AsyncIOScheduler
            from apscheduler.triggers.cron import CronTrigger
            from apscheduler.triggers.interval import IntervalTrigger
            self.scheduler = AsyncIOScheduler()

            self.scheduler.add_job(
                self.morning_brain_run,
                CronTrigger(hour=6, minute=0),
                id="morning_brain",
                name="Morning Campaign Brain Run",
                replace_existing=True
            )
            self.scheduler.add_job(
                self.live_event_check,
                IntervalTrigger(minutes=5),
                id="live_watcher",
                name="Live Event Watcher",
                replace_existing=True
            )
            self.scheduler.add_job(
                self.fetch_analytics,
                CronTrigger(hour=9, minute=0),
                id="analytics_fetch",
                name="Daily Analytics Fetch",
                replace_existing=True
            )
        except ImportError:
            print("[Scheduler] apscheduler not installed — run: pip install apscheduler")
            self.scheduler = None

    def start(self):
        if self.scheduler:
            self.scheduler.start()
            print("[Scheduler] Started. Brain runs daily at 06:00 AM.")
        else:
            print("[Scheduler] Cannot start — apscheduler missing.")

    async def morning_brain_run(self):
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

                for ep_id in result.get("episode_ids", []):
                    asyncio.create_task(self._trigger_episode_pipeline(ep_id))

            except Exception as e:
                print(f"[Brain] Error on campaign '{campaign['name']}': {e}")

    async def live_event_check(self):
        active = self.db.table("campaigns")\
            .select("id, type")\
            .eq("status", "active")\
            .execute().data or []

        campaign_types = set(c["type"] for c in active)

        for ctype in campaign_types:
            if ctype == "football":
                await self._check_football_live(active)

    async def _check_football_live(self, campaigns):
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

                last = self.db.table("live_event_states")\
                    .select("event_data")\
                    .eq("event_key", f"football_{fid}")\
                    .single().execute()

                last_total = 0
                if last.data:
                    last_total = last.data.get("event_data", {}).get("goals_total", 0)

                if total > last_total:
                    for campaign in football_campaigns:
                        asyncio.create_task(
                            self._trigger_goal_reaction(campaign["id"], fixture)
                        )

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
        home = fixture["teams"]["home"]["name"]
        away = fixture["teams"]["away"]["name"]
        hg = fixture["goals"]["home"] or 0
        ag = fixture["goals"]["away"] or 0

        self.db.table("episodes").insert({
            "campaign_id": campaign_id,
            "episode_number": 9000 + int(fixture["fixture"]["id"]) % 1000,
            "title": f"GOAL! {home} {hg}–{ag} {away}",
            "topic": f"Goal reaction: {home} vs {away}",
            "status": "idea",
            "scheduled_date": date.today().isoformat(),
            "urgency": "breaking",
            "auto_triggered": True,
            "episode_type": "goal_reaction",
            "research": {"fixture": fixture, "trigger": "live_goal"},
            "brain_reasoning": f"Auto-triggered: goal detected in {home} vs {away}"
        }).execute()

    async def _trigger_episode_pipeline(self, episode_id: str):
        try:
            async with aiohttp.ClientSession() as session:
                await session.post(
                    f"http://127.0.0.1:8000/pipeline/episode/{episode_id}"
                )
        except Exception as e:
            print(f"[Scheduler] Pipeline trigger failed for {episode_id}: {e}")

    async def fetch_analytics(self):
        pass
