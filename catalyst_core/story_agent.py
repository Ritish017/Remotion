import json
import re


FAMILY_KEYWORDS: dict[str, list[str]] = {
    "tutorial-teaching": [
        "tutorial", "how to", "guide", "learn", "learning", "teach",
        "explain", "code", "coding", "programming", "course", "lesson",
        "step by step", "walkthrough", "beginner", "introduction",
    ],
    "ai-social": [
        "ai ", "artificial intelligence", "gpt", "chatgpt", "claude",
        "gemini", "llm", "model", "automation", "machine learning",
        "neural", "openai", "anthropic", "copilot", "midjourney",
    ],
    "fifa-sports": [
        "fifa", "world cup", "match", " vs ", "football", "soccer",
        "goal", "league", "premier", "champions", "bundesliga",
        "laliga", "seria", "player", "squad", "lineup",
    ],
    "saas-kinetic": [
        "saas", "startup", "product", "launch", "app", "software",
        "platform", "tool", "service", "feature", "update", "release",
    ],
}

FAMILY_TONES: dict[str, str] = {
    "tutorial-teaching": "educational",
    "ai-social": "punchy",
    "fifa-sports": "broadcast",
    "saas-kinetic": "cinematic",
}

PLATFORM_DURATIONS: dict[str, int] = {
    "youtube": 60,
    "shorts": 30,
    "reels": 15,
    "tiktok": 15,
    "linkedin": 60,
    "x": 30,
}

_HEURISTIC_RESPONSES: dict[str, dict] = {
    "tutorial-teaching": {
        "hook": {
            "headline": "Master This in 60 Seconds",
            "subtext": "The simplest way to understand what everyone is talking about",
            "stat": "87% of developers use this daily",
        },
        "problem": {
            "headline": "Here's Why Most People Struggle",
            "bullets": [
                "Too much theory, not enough practice",
                "Documentation is confusing and outdated",
                "No clear starting point",
            ],
            "stat": None,
        },
        "solution": {
            "headline": "The 3-Step Method That Actually Works",
            "key_points": [
                "Start with a working example, not theory",
                "Understand the why before the how",
                "Build something real in under 10 minutes",
            ],
            "stat": "3x faster learning",
        },
        "cta": {
            "text": "Follow for More Tutorials Like This",
            "urgency": "New video every week",
        },
    },
    "ai-social": {
        "hook": {
            "headline": "AI Just Changed Everything",
            "subtext": "And most people haven't noticed yet",
            "stat": "10× faster",
        },
        "problem": {
            "headline": "You're Still Doing It the Old Way",
            "bullets": [
                "Hours wasted on tasks AI does in seconds",
                "Competitors are already ahead of you",
                "Missing out on $0 tools that replace expensive software",
            ],
            "stat": None,
        },
        "solution": {
            "headline": "Here's the Shortcut Everyone's Using",
            "key_points": [
                "One prompt replaces an hour of work",
                "Free tools that outperform paid ones",
            ],
            "stat": "Saves 3h/day",
        },
        "cta": {
            "text": "Follow to Stay Ahead of AI",
            "urgency": "Posted daily",
        },
    },
    "fifa-sports": {
        "hook": {
            "headline": "TEAM A vs TEAM B",
            "subtext": "Match Preview — Who Takes It?",
            "stat": "Kick off 20:00",
        },
        "problem": {
            "headline": "The Story So Far",
            "bullets": [
                "Both teams in strong form heading into this clash",
                "Key injuries could decide the outcome",
                "Head-to-head record is almost perfectly even",
            ],
            "stat": None,
        },
        "solution": {
            "headline": "Our Prediction",
            "key_points": [
                "Home advantage gives the edge",
                "Star striker returns from suspension",
            ],
            "stat": "2 - 1",
        },
        "cta": {
            "text": "Who wins? Comment Below",
            "urgency": "Match day",
        },
    },
    "saas-kinetic": {
        "hook": {
            "headline": "The Tool That Replaces Your Whole Stack",
            "subtext": "One platform, everything you need",
            "stat": "$0/month to start",
        },
        "problem": {
            "headline": "Your Current Setup Is Costing You",
            "bullets": [
                "Too many tools, too much context switching",
                "Data siloed across 5 different platforms",
                "Monthly SaaS bill keeps growing",
            ],
            "stat": None,
        },
        "solution": {
            "headline": "One Platform That Does It All",
            "key_points": [
                "Replace 5 tools with one",
                "All your data in one place",
            ],
            "stat": "Save $400/mo",
        },
        "cta": {
            "text": "Start Free — No Credit Card",
            "urgency": "Limited beta spots",
        },
    },
}


def _detect_family(brief: str) -> str:
    brief_lower = brief.lower()
    scores: dict[str, int] = {}
    for family, keywords in FAMILY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in brief_lower)
        if score > 0:
            scores[family] = score
    if not scores:
        return "tutorial-teaching"
    return max(scores, key=lambda k: scores[k])


def _build_prompt(brief: str, platform: str, family: str) -> str:
    duration = PLATFORM_DURATIONS.get(platform, 60)
    tone = FAMILY_TONES.get(family, "educational")
    return f"""You are a viral video narrative architect.

Brief: {brief}
Platform: {platform} ({duration}s video)
Content family: {family}
Tone: {tone}

Generate a structured narrative JSON for this video. Return ONLY valid JSON, no markdown.

{{
  "content_type": "{family.split('-')[0]}",
  "platform": "{platform}",
  "recommended_family": "{family}",
  "tone": "{tone}",
  "duration_seconds": {duration},
  "sport_context": null,
  "narrative": {{
    "hook": {{
      "headline": "Punchy 4-7 word headline",
      "subtext": "One supporting sentence",
      "stat": "Specific number or null"
    }},
    "problem": {{
      "headline": "Problem statement headline",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "stat": "Supporting stat or null"
    }},
    "solution": {{
      "headline": "Solution headline",
      "key_points": ["Key point 1", "Key point 2", "Key point 3"],
      "stat": "Result stat or null"
    }},
    "cta": {{
      "text": "Call to action text",
      "urgency": "Urgency phrase"
    }}
  }}
}}"""


class StoryAgent:
    def __init__(self, bedrock_client=None):
        self._client = bedrock_client

    def _try_bedrock(self, brief: str, platform: str, family: str) -> dict | None:
        if self._client is None:
            return None
        try:
            prompt = _build_prompt(brief, platform, family)
            body = json.dumps({
                "messages": [{"role": "user", "content": prompt}],
                "inferenceConfig": {"maxTokens": 1024, "temperature": 0.7},
            })
            response = self._client.invoke_model(
                modelId="us.amazon.nova-micro-v1:0",
                body=body,
                contentType="application/json",
                accept="application/json",
            )
            raw = json.loads(response["body"].read())
            text = raw["output"]["message"]["content"][0]["text"].strip()
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
            return json.loads(text)
        except Exception:
            return None

    def _heuristic(self, brief: str, platform: str, family: str) -> dict:
        duration = PLATFORM_DURATIONS.get(platform, 60)
        tone = FAMILY_TONES.get(family, "educational")
        narrative = _HEURISTIC_RESPONSES.get(family, _HEURISTIC_RESPONSES["tutorial-teaching"])
        return {
            "content_type": family.split("-")[0],
            "platform": platform,
            "recommended_family": family,
            "tone": tone,
            "duration_seconds": duration,
            "sport_context": None,
            "narrative": narrative,
        }

    def generate_narrative(self, brief: str, platform: str = "youtube") -> dict:
        family = _detect_family(brief)
        result = self._try_bedrock(brief, platform, family)
        if result and "narrative" in result:
            result.setdefault("recommended_family", family)
            return result
        return self._heuristic(brief, platform, family)

    def narrative_to_content_map(self, narrative_result: dict) -> dict:
        n = narrative_result.get("narrative", {})
        hook = n.get("hook", {})
        problem = n.get("problem", {})
        solution = n.get("solution", {})
        cta = n.get("cta", {})
        bullets = problem.get("bullets", ["", "", ""])
        key_points = solution.get("key_points", ["", ""])

        sport = narrative_result.get("sport_context") or {}

        return {
            "hook_headline": hook.get("headline", ""),
            "hook_subtext": hook.get("subtext", ""),
            "hook_stat": hook.get("stat") or problem.get("stat") or "",
            "problem_headline": problem.get("headline", ""),
            "problem_1": bullets[0] if len(bullets) > 0 else "",
            "problem_2": bullets[1] if len(bullets) > 1 else "",
            "problem_3": bullets[2] if len(bullets) > 2 else "",
            "solution_headline": solution.get("headline", ""),
            "solution_key_1": key_points[0] if len(key_points) > 0 else "",
            "solution_key_2": key_points[1] if len(key_points) > 1 else "",
            "solution_key_3": key_points[2] if len(key_points) > 2 else "",
            "cta_text": cta.get("text", ""),
            "cta_urgency": cta.get("urgency", ""),
            "home_team": sport.get("home_team", "HOME"),
            "away_team": sport.get("away_team", "AWAY"),
            "competition": sport.get("competition", ""),
            "venue": sport.get("venue", ""),
            "match_time": sport.get("match_time", ""),
            "stat_value": solution.get("stat") or hook.get("stat") or "",
            "stat_label": narrative_result.get("tone", ""),
            "channel_name": "@CatalystStudio",
        }
