from __future__ import annotations

SCENE_SPECS: list[dict] = [
    # ── tutorial-teaching (landscape 1920×1080) ────────────────────────────
    {"seed": 1001, "scene_id": "tutorial-teaching-hook-a",     "family": "tutorial-teaching", "type": "hook",     "variant": "a", "palette": "tutorial-neon",  "motion_preset": "kinetic",  "format": "landscape"},
    {"seed": 1002, "scene_id": "tutorial-teaching-hook-b",     "family": "tutorial-teaching", "type": "hook",     "variant": "b", "palette": "tutorial-warm",  "motion_preset": "smooth",   "format": "landscape"},
    {"seed": 1003, "scene_id": "tutorial-teaching-hook-c",     "family": "tutorial-teaching", "type": "hook",     "variant": "c", "palette": "dark-bold",      "motion_preset": "dramatic", "format": "landscape"},
    {"seed": 1004, "scene_id": "tutorial-teaching-problem-a",  "family": "tutorial-teaching", "type": "problem",  "variant": "a", "palette": "tutorial-neon",  "motion_preset": "kinetic",  "format": "landscape"},
    {"seed": 1005, "scene_id": "tutorial-teaching-problem-b",  "family": "tutorial-teaching", "type": "problem",  "variant": "b", "palette": "tutorial-warm",  "motion_preset": "smooth",   "format": "landscape"},
    {"seed": 1006, "scene_id": "tutorial-teaching-problem-c",  "family": "tutorial-teaching", "type": "problem",  "variant": "c", "palette": "neon-purple",    "motion_preset": "dramatic", "format": "landscape"},
    {"seed": 1007, "scene_id": "tutorial-teaching-solution-a", "family": "tutorial-teaching", "type": "solution", "variant": "a", "palette": "tutorial-neon",  "motion_preset": "kinetic",  "format": "landscape"},
    {"seed": 1008, "scene_id": "tutorial-teaching-solution-b", "family": "tutorial-teaching", "type": "solution", "variant": "b", "palette": "tutorial-warm",  "motion_preset": "smooth",   "format": "landscape"},
    {"seed": 1009, "scene_id": "tutorial-teaching-solution-c", "family": "tutorial-teaching", "type": "solution", "variant": "c", "palette": "ai-electric",    "motion_preset": "kinetic",  "format": "landscape"},
    {"seed": 1010, "scene_id": "tutorial-teaching-cta-a",      "family": "tutorial-teaching", "type": "cta",      "variant": "a", "palette": "tutorial-neon",  "motion_preset": "dramatic", "format": "landscape"},
    {"seed": 1011, "scene_id": "tutorial-teaching-cta-b",      "family": "tutorial-teaching", "type": "cta",      "variant": "b", "palette": "tutorial-warm",  "motion_preset": "smooth",   "format": "landscape"},
    {"seed": 1012, "scene_id": "tutorial-teaching-cta-c",      "family": "tutorial-teaching", "type": "cta",      "variant": "c", "palette": "dark-bold",      "motion_preset": "kinetic",  "format": "landscape"},

    # ── ai-social (vertical 1080×1920) ─────────────────────────────────────
    {"seed": 2001, "scene_id": "ai-social-hook-a",     "family": "ai-social", "type": "hook",     "variant": "a", "palette": "ai-electric", "motion_preset": "kinetic",  "format": "vertical"},
    {"seed": 2002, "scene_id": "ai-social-hook-b",     "family": "ai-social", "type": "hook",     "variant": "b", "palette": "ai-cyber",    "motion_preset": "dramatic", "format": "vertical"},
    {"seed": 2003, "scene_id": "ai-social-hook-c",     "family": "ai-social", "type": "hook",     "variant": "c", "palette": "neon-purple", "motion_preset": "kinetic",  "format": "vertical"},
    {"seed": 2004, "scene_id": "ai-social-problem-a",  "family": "ai-social", "type": "problem",  "variant": "a", "palette": "ai-electric", "motion_preset": "kinetic",  "format": "vertical"},
    {"seed": 2005, "scene_id": "ai-social-problem-b",  "family": "ai-social", "type": "problem",  "variant": "b", "palette": "ai-cyber",    "motion_preset": "smooth",   "format": "vertical"},
    {"seed": 2006, "scene_id": "ai-social-problem-c",  "family": "ai-social", "type": "problem",  "variant": "c", "palette": "ai-fire",     "motion_preset": "dramatic", "format": "vertical"},
    {"seed": 2007, "scene_id": "ai-social-solution-a", "family": "ai-social", "type": "solution", "variant": "a", "palette": "ai-electric", "motion_preset": "kinetic",  "format": "vertical"},
    {"seed": 2008, "scene_id": "ai-social-solution-b", "family": "ai-social", "type": "solution", "variant": "b", "palette": "neon-cyan",   "motion_preset": "smooth",   "format": "vertical"},
    {"seed": 2009, "scene_id": "ai-social-solution-c", "family": "ai-social", "type": "solution", "variant": "c", "palette": "neon-purple", "motion_preset": "kinetic",  "format": "vertical"},
    {"seed": 2010, "scene_id": "ai-social-cta-a",      "family": "ai-social", "type": "cta",      "variant": "a", "palette": "ai-electric", "motion_preset": "dramatic", "format": "vertical"},
    {"seed": 2011, "scene_id": "ai-social-cta-b",      "family": "ai-social", "type": "cta",      "variant": "b", "palette": "ai-cyber",    "motion_preset": "kinetic",  "format": "vertical"},
    {"seed": 2012, "scene_id": "ai-social-cta-c",      "family": "ai-social", "type": "cta",      "variant": "c", "palette": "vibrant-pop", "motion_preset": "dramatic", "format": "vertical"},

    # ── fifa-sports (square 1080×1080) ──────────────────────────────────────
    {"seed": 3001, "scene_id": "fifa-sports-hook-a",     "family": "fifa-sports", "type": "hook",     "variant": "a", "palette": "fifa-gold",   "motion_preset": "dramatic", "format": "square"},
    {"seed": 3002, "scene_id": "fifa-sports-hook-b",     "family": "fifa-sports", "type": "hook",     "variant": "b", "palette": "fifa-cool",   "motion_preset": "kinetic",  "format": "square"},
    {"seed": 3003, "scene_id": "fifa-sports-hook-c",     "family": "fifa-sports", "type": "hook",     "variant": "c", "palette": "fifa-home",   "motion_preset": "dramatic", "format": "square"},
    {"seed": 3004, "scene_id": "fifa-sports-problem-a",  "family": "fifa-sports", "type": "problem",  "variant": "a", "palette": "fifa-gold",   "motion_preset": "smooth",   "format": "square"},
    {"seed": 3005, "scene_id": "fifa-sports-problem-b",  "family": "fifa-sports", "type": "problem",  "variant": "b", "palette": "fifa-silver", "motion_preset": "dramatic", "format": "square"},
    {"seed": 3006, "scene_id": "fifa-sports-problem-c",  "family": "fifa-sports", "type": "problem",  "variant": "c", "palette": "fifa-red",    "motion_preset": "kinetic",  "format": "square"},
    {"seed": 3007, "scene_id": "fifa-sports-solution-a", "family": "fifa-sports", "type": "solution", "variant": "a", "palette": "fifa-gold",   "motion_preset": "dramatic", "format": "square"},
    {"seed": 3008, "scene_id": "fifa-sports-solution-b", "family": "fifa-sports", "type": "solution", "variant": "b", "palette": "fifa-cool",   "motion_preset": "smooth",   "format": "square"},
    {"seed": 3009, "scene_id": "fifa-sports-solution-c", "family": "fifa-sports", "type": "solution", "variant": "c", "palette": "fifa-away",   "motion_preset": "kinetic",  "format": "square"},
    {"seed": 3010, "scene_id": "fifa-sports-cta-a",      "family": "fifa-sports", "type": "cta",      "variant": "a", "palette": "fifa-gold",   "motion_preset": "dramatic", "format": "square"},
    {"seed": 3011, "scene_id": "fifa-sports-cta-b",      "family": "fifa-sports", "type": "cta",      "variant": "b", "palette": "fifa-home",   "motion_preset": "kinetic",  "format": "square"},
    {"seed": 3012, "scene_id": "fifa-sports-cta-c",      "family": "fifa-sports", "type": "cta",      "variant": "c", "palette": "fifa-red",    "motion_preset": "dramatic", "format": "square"},
]

_INDEX: dict[str, dict] = {spec["scene_id"]: spec for spec in SCENE_SPECS}


class SeedLibrary:
    def get_spec(self, scene_id: str) -> dict | None:
        return _INDEX.get(scene_id)

    def get_family_specs(self, family: str) -> list[dict]:
        return [s for s in SCENE_SPECS if s["family"] == family]

    def list_all_scene_ids(self) -> list[str]:
        return [s["scene_id"] for s in SCENE_SPECS]

    def list_families(self) -> list[str]:
        seen: list[str] = []
        for s in SCENE_SPECS:
            if s["family"] not in seen:
                seen.append(s["family"])
        return seen

    def get_spec_by_seed(self, seed: int) -> dict | None:
        for s in SCENE_SPECS:
            if s["seed"] == seed:
                return s
        return None
