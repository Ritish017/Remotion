import json
import os
import time
import urllib.request
import urllib.parse
from datetime import date
from pathlib import Path


def _load_env_file() -> None:
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if not env_path.exists():
        return
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


_load_env_file()


class SportsDataFetcher:
    BASE_URL = "https://v3.football.api-sports.io"
    CACHE_TTL = 300

    def __init__(self, api_key: str | None = None):
        self._api_key = api_key or os.environ.get("FOOTBALL_API_KEY", "")
        self._cache: dict[tuple, tuple[float, dict]] = {}

    def _get(self, path: str, params: dict | None = None) -> dict:
        params = params or {}
        query = urllib.parse.urlencode(params)
        url = f"{self.BASE_URL}{path}"
        if query:
            url = f"{url}?{query}"

        cache_key = (path, tuple(sorted(params.items())))
        now = time.time()
        if cache_key in self._cache:
            ts, data = self._cache[cache_key]
            if now - ts < self.CACHE_TTL:
                return data

        req = urllib.request.Request(
            url,
            headers={
                "x-rapidapi-key": self._api_key,
                "x-rapidapi-host": "v3.football.api-sports.io",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except Exception as exc:
            data = {"error": str(exc), "response": []}

        self._cache[cache_key] = (now, data)
        return data

    def get_match_preview(self, fixture_id: int) -> dict:
        raw = self._get("/fixtures", {"id": fixture_id})
        fixtures = raw.get("response", [])
        if not fixtures:
            return {"error": "fixture not found", "fixture_id": fixture_id}

        f = fixtures[0]
        teams = f.get("teams", {})
        league = f.get("league", {})
        venue = f.get("fixture", {}).get("venue", {})
        kickoff = f.get("fixture", {}).get("date", "")

        home_id = teams.get("home", {}).get("id")
        away_id = teams.get("away", {}).get("id")

        h2h_data: list = []
        if home_id and away_id:
            h2h_raw = self._get("/fixtures/headtohead", {
                "h2h": f"{home_id}-{away_id}",
                "last": 5,
            })
            h2h_data = h2h_raw.get("response", [])

        return {
            "fixture_id": fixture_id,
            "teams": {
                "home": teams.get("home", {}).get("name", "Home"),
                "away": teams.get("away", {}).get("name", "Away"),
            },
            "competition": league.get("name", ""),
            "venue": venue.get("name", ""),
            "city": venue.get("city", ""),
            "kickoff": kickoff,
            "h2h_last_5": [
                {
                    "home": m.get("teams", {}).get("home", {}).get("name"),
                    "away": m.get("teams", {}).get("away", {}).get("name"),
                    "score": m.get("score", {}).get("fulltime", {}),
                    "date": m.get("fixture", {}).get("date", ""),
                }
                for m in h2h_data[:5]
            ],
        }

    def get_live_score(self, fixture_id: int) -> dict:
        raw = self._get("/fixtures", {"id": fixture_id, "live": "all"})
        fixtures = raw.get("response", [])
        if not fixtures:
            raw = self._get("/fixtures", {"id": fixture_id})
            fixtures = raw.get("response", [])
        if not fixtures:
            return {"error": "fixture not found", "fixture_id": fixture_id}

        f = fixtures[0]
        status = f.get("fixture", {}).get("status", {})
        goals = f.get("goals", {})
        events = f.get("events", [])

        return {
            "fixture_id": fixture_id,
            "status": status.get("long", "Not Started"),
            "elapsed": status.get("elapsed"),
            "score": {
                "home": goals.get("home"),
                "away": goals.get("away"),
            },
            "events": [
                {
                    "time": e.get("time", {}).get("elapsed"),
                    "team": e.get("team", {}).get("name"),
                    "player": e.get("player", {}).get("name"),
                    "type": e.get("type"),
                    "detail": e.get("detail"),
                }
                for e in events
            ],
        }

    def get_standings(self, league_id: int, season: int) -> dict:
        raw = self._get("/standings", {"league": league_id, "season": season})
        response = raw.get("response", [])
        if not response:
            return {"error": "standings not found", "league_id": league_id}

        league_data = response[0].get("league", {})
        standings_raw = league_data.get("standings", [[]])[0]

        return {
            "league_id": league_id,
            "league_name": league_data.get("name", ""),
            "season": season,
            "standings": [
                {
                    "rank": entry.get("rank"),
                    "team": entry.get("team", {}).get("name"),
                    "points": entry.get("points"),
                    "played": entry.get("all", {}).get("played"),
                    "win": entry.get("all", {}).get("win"),
                    "draw": entry.get("all", {}).get("draw"),
                    "lose": entry.get("all", {}).get("lose"),
                    "goals_for": entry.get("all", {}).get("goals", {}).get("for"),
                    "goals_against": entry.get("all", {}).get("goals", {}).get("against"),
                    "form": entry.get("form"),
                }
                for entry in standings_raw
            ],
        }

    def get_player_stats(self, player_id: int, season: int) -> dict:
        raw = self._get("/players", {"id": player_id, "season": season})
        response = raw.get("response", [])
        if not response:
            return {"error": "player not found", "player_id": player_id}

        player = response[0].get("player", {})
        stats = response[0].get("statistics", [{}])[0]
        games = stats.get("games", {})
        goals = stats.get("goals", {})

        return {
            "player_id": player_id,
            "name": player.get("name", ""),
            "age": player.get("age"),
            "nationality": player.get("nationality"),
            "team": stats.get("team", {}).get("name", ""),
            "appearances": games.get("appearences"),
            "minutes": games.get("minutes"),
            "rating": games.get("rating"),
            "goals": goals.get("total"),
            "assists": goals.get("assists"),
            "yellow_cards": stats.get("cards", {}).get("yellow"),
            "red_cards": stats.get("cards", {}).get("red"),
        }

    def get_today_fixtures(self, league_id: int = 1, season: int = 2026) -> list:
        today = date.today().isoformat()
        raw = self._get("/fixtures", {
            "league": league_id,
            "season": season,
            "date": today,
        })
        fixtures = raw.get("response", [])
        return [
            {
                "fixture_id": f.get("fixture", {}).get("id"),
                "home": f.get("teams", {}).get("home", {}).get("name"),
                "away": f.get("teams", {}).get("away", {}).get("name"),
                "kickoff": f.get("fixture", {}).get("date"),
                "status": f.get("fixture", {}).get("status", {}).get("long"),
                "score": f.get("goals", {}),
            }
            for f in fixtures
        ]
