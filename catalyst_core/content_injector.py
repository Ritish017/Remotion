import re


class ContentInjector:
    PLACEHOLDER_PATTERN = re.compile(
        r'(data-placeholder="([^"]+)">)[^<]*(<)',
        re.DOTALL,
    )

    KNOWN_KEYS = {
        "hook_headline", "hook_subtext", "hook_stat",
        "problem_headline", "problem_1", "problem_2", "problem_3",
        "solution_headline", "solution_key_1", "solution_key_2", "solution_key_3",
        "cta_text", "cta_urgency",
        "home_team", "away_team", "competition", "venue", "match_time",
        "stat_value", "stat_label", "channel_name",
    }

    def inject(self, html: str, content_map: dict) -> str:
        if not content_map:
            return html

        def replacer(m: re.Match) -> str:
            attr_and_gt = m.group(1)
            key = m.group(2)
            close_tag = m.group(3)
            value = content_map.get(key)
            if value is None:
                return m.group(0)
            safe = str(value).replace("<", "&lt;").replace(">", "&gt;")
            return f"{attr_and_gt}{safe}{close_tag}"

        return self.PLACEHOLDER_PATTERN.sub(replacer, html)
