import hashlib
import struct
import re


COLOR_PALETTES: dict[str, dict[str, str]] = {
    "tutorial-neon": {
        "--color-accent": "#00ff88",
        "--color-bg": "#0a0a0a",
        "--color-secondary": "#00cc6a",
        "--color-glow": "rgba(0,255,136,0.2)",
    },
    "tutorial-warm": {
        "--color-accent": "#fbbf24",
        "--color-bg": "#0d0d0d",
        "--color-secondary": "#f59e0b",
        "--color-glow": "rgba(251,191,36,0.2)",
    },
    "ai-electric": {
        "--color-accent": "#00d4ff",
        "--color-bg": "#000000",
        "--color-secondary": "#7b2fff",
        "--color-glow": "rgba(0,212,255,0.2)",
    },
    "ai-cyber": {
        "--color-accent": "#ff00aa",
        "--color-bg": "#050505",
        "--color-secondary": "#00ffcc",
        "--color-glow": "rgba(255,0,170,0.2)",
    },
    "ai-fire": {
        "--color-accent": "#ff6b35",
        "--color-bg": "#0a0000",
        "--color-secondary": "#ff4500",
        "--color-glow": "rgba(255,107,53,0.2)",
    },
    "neon-purple": {
        "--color-accent": "#6c47ff",
        "--color-bg": "#080808",
        "--color-secondary": "#ec4899",
        "--color-glow": "rgba(108,71,255,0.2)",
    },
    "neon-cyan": {
        "--color-accent": "#06b6d4",
        "--color-bg": "#080808",
        "--color-secondary": "#14b8a6",
        "--color-glow": "rgba(6,182,212,0.2)",
    },
    "dark-bold": {
        "--color-accent": "#ff006e",
        "--color-bg": "#1a1a2e",
        "--color-secondary": "#ffbe0b",
        "--color-glow": "rgba(255,0,110,0.2)",
    },
    "fifa-gold": {
        "--color-accent": "#FFD700",
        "--color-bg": "#050a14",
        "--color-secondary": "#FFA500",
        "--color-glow": "rgba(255,215,0,0.25)",
    },
    "fifa-silver": {
        "--color-accent": "#c0c0c0",
        "--color-bg": "#111111",
        "--color-secondary": "#808080",
        "--color-glow": "rgba(192,192,192,0.2)",
    },
    "fifa-home": {
        "--color-accent": "#e63946",
        "--color-bg": "#050a14",
        "--color-secondary": "#ff6b6b",
        "--color-glow": "rgba(230,57,70,0.25)",
    },
    "fifa-away": {
        "--color-accent": "#4361ee",
        "--color-bg": "#050a14",
        "--color-secondary": "#4cc9f0",
        "--color-glow": "rgba(67,97,238,0.25)",
    },
    "fifa-cool": {
        "--color-accent": "#0066FF",
        "--color-bg": "#03050f",
        "--color-secondary": "#00AAFF",
        "--color-glow": "rgba(0,102,255,0.25)",
    },
    "fifa-red": {
        "--color-accent": "#CC0000",
        "--color-bg": "#0a0000",
        "--color-secondary": "#FF4444",
        "--color-glow": "rgba(204,0,0,0.25)",
    },
    "minimal-cool": {
        "--color-accent": "#0EA5E9",
        "--color-bg": "#ffffff",
        "--color-secondary": "#0284C7",
        "--color-glow": "rgba(14,165,233,0.15)",
    },
    "vibrant-pop": {
        "--color-accent": "#FF5733",
        "--color-bg": "#0F0F0F",
        "--color-secondary": "#33FF57",
        "--color-glow": "rgba(255,87,51,0.2)",
    },
}

MOTION_PRESETS: dict[str, dict[str, str]] = {
    "kinetic": {
        "--motion-speed": "1.4",
        "--motion-stagger": "0.06",
        "--motion-ease": "power3.out",
    },
    "smooth": {
        "--motion-speed": "1.0",
        "--motion-stagger": "0.1",
        "--motion-ease": "power2.inOut",
    },
    "dramatic": {
        "--motion-speed": "0.8",
        "--motion-stagger": "0.15",
        "--motion-ease": "back.out(1.7)",
    },
    "minimal": {
        "--motion-speed": "0.6",
        "--motion-stagger": "0.2",
        "--motion-ease": "power1.out",
    },
}

FORMAT_MODES: dict[str, dict[str, str]] = {
    "landscape": {
        "--video-width": "1920px",
        "--video-height": "1080px",
        "--safe-zone-top": "48px",
        "--safe-zone-bottom": "48px",
    },
    "vertical": {
        "--video-width": "1080px",
        "--video-height": "1920px",
        "--safe-zone-top": "120px",
        "--safe-zone-bottom": "200px",
    },
    "square": {
        "--video-width": "1080px",
        "--video-height": "1080px",
        "--safe-zone-top": "60px",
        "--safe-zone-bottom": "60px",
    },
}

FAMILY_PALETTE_GROUPS: dict[str, list[str]] = {
    "tutorial-teaching": ["tutorial-neon", "tutorial-warm", "dark-bold"],
    "ai-social": ["ai-electric", "ai-cyber", "ai-fire", "neon-purple"],
    "fifa-sports": ["fifa-gold", "fifa-silver", "fifa-home", "fifa-away", "fifa-cool", "fifa-red"],
    "saas-kinetic": ["neon-purple", "neon-cyan", "dark-bold", "vibrant-pop"],
}

FAMILY_FORMAT: dict[str, str] = {
    "tutorial-teaching": "landscape",
    "ai-social": "vertical",
    "fifa-sports": "square",
    "saas-kinetic": "landscape",
}

_PALETTES = list(COLOR_PALETTES.keys())
_PRESETS = list(MOTION_PRESETS.keys())


def _lcg(seed_int: int) -> float:
    a, c, m = 1664525, 1013904223, 2**32
    seed_int = (a * seed_int + c) % m
    return seed_int / m, seed_int


def _seed_to_int(seed) -> int:
    digest = hashlib.sha256(str(seed).encode()).digest()
    return struct.unpack(">Q", digest[:8])[0]


class VariationEngine:
    def _resolve(
        self,
        seed,
        motion_preset: str | None,
        color_palette: str | None,
        format_mode: str | None,
        scene_family: str | None,
    ) -> tuple[str, str, str]:
        seed_int = _seed_to_int(seed)

        if color_palette and color_palette in COLOR_PALETTES:
            palette = color_palette
        elif scene_family and scene_family in FAMILY_PALETTE_GROUPS:
            choices = FAMILY_PALETTE_GROUPS[scene_family]
            frac, seed_int = _lcg(seed_int)
            palette = choices[int(frac * len(choices))]
        else:
            frac, seed_int = _lcg(seed_int)
            palette = _PALETTES[int(frac * len(_PALETTES))]

        if motion_preset and motion_preset in MOTION_PRESETS:
            preset = motion_preset
        else:
            frac, seed_int = _lcg(seed_int)
            preset = _PRESETS[int(frac * len(_PRESETS))]

        if format_mode and format_mode in FORMAT_MODES:
            fmt = format_mode
        elif scene_family and scene_family in FAMILY_FORMAT:
            fmt = FAMILY_FORMAT[scene_family]
        else:
            fmt = "landscape"

        return palette, preset, fmt

    def _build_css_vars(self, palette: str, preset: str, fmt: str) -> str:
        tokens: dict[str, str] = {}
        tokens.update(COLOR_PALETTES[palette])
        tokens.update(MOTION_PRESETS[preset])
        tokens.update(FORMAT_MODES[fmt])
        declarations = "".join(f"  {k}: {v};\n" for k, v in tokens.items())
        return f":root {{\n{declarations}}}"

    def _inject_root_css(self, html: str, css_vars: str) -> str:
        existing = re.search(r":root\s*\{[^}]*\}", html, re.DOTALL)
        if existing:
            return html[: existing.start()] + css_vars + html[existing.end() :]
        style_tag = re.search(r"<style[^>]*>", html, re.IGNORECASE)
        if style_tag:
            insert_pos = style_tag.end()
            return html[:insert_pos] + "\n" + css_vars + "\n" + html[insert_pos:]
        head_tag = re.search(r"<head[^>]*>", html, re.IGNORECASE)
        if head_tag:
            insert_pos = head_tag.end()
            return html[:insert_pos] + f"\n<style>\n{css_vars}\n</style>\n" + html[insert_pos:]
        return f"<style>\n{css_vars}\n</style>\n" + html

    def apply_variation(
        self,
        composition_html: str,
        seed,
        content_map: dict | None = None,
        motion_preset: str | None = None,
        color_palette: str | None = None,
        format_mode: str | None = None,
        scene_family: str | None = None,
    ) -> str:
        from catalyst_core.content_injector import ContentInjector

        palette, preset, fmt = self._resolve(seed, motion_preset, color_palette, format_mode, scene_family)
        css_vars = self._build_css_vars(palette, preset, fmt)
        html = self._inject_root_css(composition_html, css_vars)

        if content_map:
            html = ContentInjector().inject(html, content_map)

        return html

    def get_applied_settings(
        self,
        seed,
        motion_preset: str | None = None,
        color_palette: str | None = None,
        format_mode: str | None = None,
        scene_family: str | None = None,
    ) -> dict:
        palette, preset, fmt = self._resolve(seed, motion_preset, color_palette, format_mode, scene_family)
        return {
            "palette": palette,
            "motion_preset": preset,
            "format_mode": fmt,
            "color_tokens": COLOR_PALETTES[palette],
            "motion_tokens": MOTION_PRESETS[preset],
            "format_tokens": FORMAT_MODES[fmt],
        }

    def list_palettes_for_family(self, scene_family: str) -> list[str]:
        return FAMILY_PALETTE_GROUPS.get(scene_family, list(COLOR_PALETTES.keys()))
