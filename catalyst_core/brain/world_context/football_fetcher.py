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
    WC_LEAGUE_ID = 1
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
