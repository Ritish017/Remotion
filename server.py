from __future__ import annotations

import asyncio
import json
import os
import shutil
import time
import uuid
from pathlib import Path
from typing import Any

import uvicorn
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

# ── env loader ───────────────────────────────────────────────────────────────

def _load_env_file() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
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

# ── catalyst_core imports ─────────────────────────────────────────────────────

from catalyst_core.seed_library import SeedLibrary, SCENE_SPECS
from catalyst_core.story_agent import StoryAgent
from catalyst_core.variation_engine import VariationEngine
from catalyst_core.content_injector import ContentInjector
from catalyst_core.sports_data import SportsDataFetcher
from catalyst_core.local_db import router as db_router

# ── paths ────────────────────────────────────────────────────────────────────

ROOT = Path(__file__).resolve().parent
SCENES_DIR = ROOT / "scenes"
JOBS_DIR = ROOT / "jobs"
TEMPLATES_DIR = ROOT / "templates"

JOBS_DIR.mkdir(exist_ok=True)
TEMPLATES_DIR.mkdir(exist_ok=True)

# ── singletons ───────────────────────────────────────────────────────────────

seed_library = SeedLibrary()
variation_engine = VariationEngine()
content_injector = ContentInjector()

_bedrock_client = None
try:
    import boto3
    _bedrock_client = boto3.client("bedrock-runtime", region_name=os.environ.get("AWS_REGION", "us-east-1"))
except Exception:
    pass

story_agent = StoryAgent(bedrock_client=_bedrock_client)
sports_fetcher = SportsDataFetcher()

# ── in-memory job store ───────────────────────────────────────────────────────
# { job_id: { status, created_at, brief, html_path, output_path, error } }

_jobs: dict[str, dict[str, Any]] = {}
_templates: dict[str, dict[str, Any]] = {}

# ── app ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="Catalyst Video Studio", version="4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000",
                   "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(db_router)

# ── request models ────────────────────────────────────────────────────────────

class TutorialRequest(BaseModel):
    brief: str
    duration: int = 60
    palette: str | None = None
    motion_preset: str | None = None
    scene_type: str = "hook"

class SocialRequest(BaseModel):
    brief: str
    platform: str = "reels"
    palette: str | None = None
    motion_preset: str | None = None
    scene_type: str = "hook"

class SportsRequest(BaseModel):
    fixture_id: int
    palette: str = "fifa-gold"
    motion_preset: str = "dramatic"

class BatchRequest(BaseModel):
    briefs: list[str] = Field(..., max_length=20)
    platform: str = "youtube"
    duration: int = 60

class MixRequest(BaseModel):
    scenes: list[str]

class GenerateRequest(BaseModel):
    brief: str
    vertical: str | None = None
    platform: str = "youtube"
    palette: str | None = None
    motion_preset: str | None = None
    duration: int = 60

class TemplateRetrieveRequest(BaseModel):
    brief: str
    family: str | None = None

# ── helpers ───────────────────────────────────────────────────────────────────

def _new_job(brief: str = "") -> str:
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {
        "job_id": job_id,
        "status": "queued",
        "brief": brief,
        "created_at": time.time(),
        "html_path": None,
        "output_path": None,
        "error": None,
    }
    return job_id


def _find_scene_html(family: str, scene_type: str = "hook", variant: str = "a") -> Path | None:
    path = SCENES_DIR / family / f"{scene_type}-{variant}" / "scene.html"
    if path.exists():
        return path
    path = SCENES_DIR / family / scene_type / "scene.html"
    if path.exists():
        return path
    return None


async def _render_job(job_id: str) -> None:
    job = _jobs[job_id]
    job_dir = JOBS_DIR / job_id
    job_dir.mkdir(exist_ok=True)

    html_path = job.get("html_path")
    if not html_path or not Path(html_path).exists():
        job["status"] = "error"
        job["error"] = "HTML source not found"
        return

    output_path = job_dir / "output.mp4"
    job["status"] = "rendering"
    job["output_path"] = str(output_path)

    try:
        cmd = [
            "npx", "hyperframes", "render",
            "--input", str(html_path),
            "--output", str(output_path),
            "--fps", "30",
        ]
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=300)
        if proc.returncode == 0 and output_path.exists():
            job["status"] = "done"
        else:
            job["status"] = "done"
            job["_render_note"] = "HyperFrames not available — HTML ready for preview"
            job["output_path"] = str(html_path)
    except (asyncio.TimeoutError, FileNotFoundError):
        job["status"] = "done"
        job["_render_note"] = "HyperFrames not available — HTML ready for preview"
        job["output_path"] = str(html_path)
    except Exception as exc:
        job["status"] = "error"
        job["error"] = str(exc)


def _prepare_html(family: str, scene_type: str, variant: str, seed: int,
                  content_map: dict, palette: str | None, motion_preset: str | None) -> str:
    scene_html_path = _find_scene_html(family, scene_type, variant)
    if scene_html_path:
        html = scene_html_path.read_text(encoding="utf-8")
    else:
        spec = seed_library.get_family_specs(family)
        matching = [s for s in spec if s["type"] == scene_type]
        if matching:
            p = _find_scene_html(family, matching[0]["type"], matching[0]["variant"])
            html = p.read_text(encoding="utf-8") if p else _fallback_html(family, scene_type)
        else:
            html = _fallback_html(family, scene_type)

    return variation_engine.apply_variation(
        html, seed, content_map,
        motion_preset=motion_preset,
        color_palette=palette,
        scene_family=family,
    )


def _fallback_html(family: str, scene_type: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
:root {{
  --video-width: 1920px; --video-height: 1080px;
  --color-accent: #00ff88; --color-bg: #0a0a0a; --color-text: #ffffff;
}}
body {{ width: var(--video-width); height: var(--video-height);
       background: var(--color-bg); display:flex; align-items:center;
       justify-content:center; margin:0; overflow:hidden; }}
h1 {{ color: var(--color-accent); font-family: sans-serif; font-size: 80px; }}
</style>
</head>
<body>
<h1 data-placeholder="hook_headline">{family} / {scene_type}</h1>
</body>
</html>"""


async def _run_generation(job_id: str, family: str, scene_type: str, variant: str,
                          seed: int, content_map: dict, palette: str | None,
                          motion_preset: str | None) -> None:
    job = _jobs[job_id]
    try:
        html = _prepare_html(family, scene_type, variant, seed, content_map, palette, motion_preset)
        job_dir = JOBS_DIR / job_id
        job_dir.mkdir(exist_ok=True)
        html_path = job_dir / "scene.html"
        html_path.write_text(html, encoding="utf-8")
        job["html_path"] = str(html_path)
        await _render_job(job_id)
    except Exception as exc:
        job["status"] = "error"
        job["error"] = str(exc)

# ── routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "version": "4.0", "scenes_loaded": len(SCENE_SPECS)}


# POST /generate/tutorial
@app.post("/generate/tutorial")
async def generate_tutorial(req: TutorialRequest, background_tasks: BackgroundTasks):
    narrative = story_agent.generate_narrative(req.brief, "youtube")
    content_map = story_agent.narrative_to_content_map(narrative)
    family = narrative.get("recommended_family", "tutorial-teaching")
    seed = hash(req.brief) % 9999 + 1000
    job_id = _new_job(req.brief)
    background_tasks.add_task(
        _run_generation, job_id, family, req.scene_type, "a",
        seed, content_map, req.palette, req.motion_preset,
    )
    return {"job_id": job_id, "status": "queued", "family": family, "narrative": narrative}


# POST /generate/social
@app.post("/generate/social")
async def generate_social(req: SocialRequest, background_tasks: BackgroundTasks):
    narrative = story_agent.generate_narrative(req.brief, req.platform)
    content_map = story_agent.narrative_to_content_map(narrative)
    family = narrative.get("recommended_family", "ai-social")
    seed = hash(req.brief) % 9999 + 2000
    job_id = _new_job(req.brief)
    background_tasks.add_task(
        _run_generation, job_id, family, req.scene_type, "a",
        seed, content_map, req.palette, req.motion_preset,
    )
    return {"job_id": job_id, "status": "queued", "family": family, "platform": req.platform}


# POST /generate/sports/preview
@app.post("/generate/sports/preview")
async def generate_sports_preview(req: SportsRequest, background_tasks: BackgroundTasks):
    preview = sports_fetcher.get_match_preview(req.fixture_id)
    teams = preview.get("teams", {})
    content_map = {
        "hook_headline": f"{teams.get('home', 'HOME')} vs {teams.get('away', 'AWAY')}",
        "hook_subtext": "Match Preview",
        "hook_stat": "Today",
        "home_team": teams.get("home", "HOME"),
        "away_team": teams.get("away", "AWAY"),
        "competition": preview.get("competition", ""),
        "venue": preview.get("venue", ""),
        "match_time": preview.get("kickoff", "")[:10] if preview.get("kickoff") else "",
        "problem_headline": "The Story So Far",
        "problem_1": f"Home: {teams.get('home', 'HOME')}",
        "problem_2": f"Away: {teams.get('away', 'AWAY')}",
        "problem_3": f"Venue: {preview.get('venue', 'TBC')}",
        "solution_headline": "Our Prediction",
        "solution_key_1": "Home advantage is key",
        "solution_key_2": "Watch the midfield battle",
        "cta_text": "Who wins? Comment below!",
        "cta_urgency": "Match day",
        "stat_value": "2 - 1",
        "stat_label": "Predicted Score",
        "channel_name": "@CatalystSports",
    }
    seed = req.fixture_id
    job_id = _new_job(f"sports:{req.fixture_id}")
    background_tasks.add_task(
        _run_generation, job_id, "fifa-sports", "hook", "a",
        seed, content_map, req.palette, req.motion_preset,
    )
    return {"job_id": job_id, "status": "queued", "preview": preview}


# POST /batch/generate
@app.post("/batch/generate")
async def batch_generate(req: BatchRequest, background_tasks: BackgroundTasks):
    briefs = req.briefs[:20]
    job_ids = []
    for brief in briefs:
        narrative = story_agent.generate_narrative(brief, req.platform)
        content_map = story_agent.narrative_to_content_map(narrative)
        family = narrative.get("recommended_family", "tutorial-teaching")
        seed = hash(brief) % 9999 + 1000
        job_id = _new_job(brief)
        background_tasks.add_task(
            _run_generation, job_id, family, "hook", "a",
            seed, content_map, None, None,
        )
        job_ids.append(job_id)
    return {"accepted": len(job_ids), "job_ids": job_ids}


# POST /generate  (legacy free-form)
@app.post("/generate")
async def generate_legacy(req: GenerateRequest, background_tasks: BackgroundTasks):
    narrative = story_agent.generate_narrative(req.brief, req.platform)
    content_map = story_agent.narrative_to_content_map(narrative)
    family = req.vertical or narrative.get("recommended_family", "tutorial-teaching")
    seed = hash(req.brief) % 9999 + 1000
    job_id = _new_job(req.brief)
    background_tasks.add_task(
        _run_generation, job_id, family, "hook", "a",
        seed, content_map, req.palette, req.motion_preset,
    )
    return {"job_id": job_id, "status": "queued", "family": family}


# GET /jobs
@app.get("/jobs")
async def list_jobs():
    jobs = sorted(_jobs.values(), key=lambda j: j["created_at"], reverse=True)
    return {"jobs": [_job_summary(j) for j in jobs]}


# GET /jobs/active
@app.get("/jobs/active")
async def list_active_jobs():
    active = [j for j in _jobs.values() if j["status"] in ("queued", "rendering")]
    return {"jobs": [_job_summary(j) for j in active]}


# GET /status/{job_id}
@app.get("/status/{job_id}")
async def job_status(job_id: str):
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return _job_summary(job)


def _job_summary(job: dict) -> dict:
    return {
        "job_id": job["job_id"],
        "status": job["status"],
        "brief": job.get("brief", ""),
        "created_at": job["created_at"],
        "error": job.get("error"),
        "render_note": job.get("_render_note"),
    }


# GET /download/{job_id}
@app.get("/download/{job_id}")
async def download_job(job_id: str):
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != "done":
        raise HTTPException(status_code=425, detail=f"Job status: {job['status']}")
    output = job.get("output_path")
    if not output or not Path(output).exists():
        raise HTTPException(status_code=404, detail="Output file not found")
    suffix = Path(output).suffix
    media_type = "video/mp4" if suffix == ".mp4" else "text/html"
    return FileResponse(output, media_type=media_type, filename=f"{job_id}{suffix}")


# GET /preview/{job_id}
@app.get("/preview/{job_id}")
async def preview_job(job_id: str):
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    html_path = job.get("html_path")
    if html_path and Path(html_path).exists():
        return FileResponse(html_path, media_type="text/html")
    raise HTTPException(status_code=404, detail="Preview not available yet")


# GET /scenes
@app.get("/scenes")
async def list_scenes(scene_type: str | None = None):
    specs = SCENE_SPECS
    if scene_type:
        specs = [s for s in specs if s["type"] == scene_type]
    result = []
    for spec in specs:
        html_path = _find_scene_html(spec["family"], spec["type"], spec["variant"])
        result.append({
            **spec,
            "html_available": html_path is not None,
        })
    return {"scenes": result, "total": len(result)}


# GET /scenes/{scene_id}
@app.get("/scenes/{scene_id}")
async def get_scene(scene_id: str):
    spec = seed_library.get_spec(scene_id)
    if not spec:
        raise HTTPException(status_code=404, detail="Scene not found")
    html_path = _find_scene_html(spec["family"], spec["type"], spec["variant"])
    if not html_path:
        raise HTTPException(status_code=404, detail="Scene HTML not found on disk")
    return FileResponse(str(html_path), media_type="text/html")


# GET /library/families
@app.get("/library/families")
async def library_families():
    families_data = {}
    for spec in SCENE_SPECS:
        fam = spec["family"]
        if fam not in families_data:
            families_data[fam] = {
                "family": fam,
                "format": spec["format"],
                "scene_count": 0,
                "types": [],
                "palettes": variation_engine.list_palettes_for_family(fam),
            }
        families_data[fam]["scene_count"] += 1
        if spec["type"] not in families_data[fam]["types"]:
            families_data[fam]["types"].append(spec["type"])

    for fam, data in families_data.items():
        meta_path = SCENES_DIR / fam / "metadata.json"
        if meta_path.exists():
            try:
                data["metadata"] = json.loads(meta_path.read_text())
            except Exception:
                pass

    return {"families": list(families_data.values()), "total": len(families_data)}


# GET /templates
@app.get("/templates")
async def list_templates():
    templates = []
    for t_dir in TEMPLATES_DIR.iterdir():
        meta = t_dir / "meta.json"
        if meta.exists():
            try:
                templates.append(json.loads(meta.read_text()))
            except Exception:
                pass
    return {"templates": templates}


# POST /templates/import-job/{job_id}
@app.post("/templates/import-job/{job_id}")
async def import_job_as_template(job_id: str):
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != "done":
        raise HTTPException(status_code=425, detail="Job not finished")
    tpl_id = str(uuid.uuid4())
    tpl_dir = TEMPLATES_DIR / tpl_id
    tpl_dir.mkdir(exist_ok=True)
    html_path = job.get("html_path")
    if html_path and Path(html_path).exists():
        shutil.copy(html_path, tpl_dir / "scene.html")
    meta = {
        "template_id": tpl_id,
        "job_id": job_id,
        "brief": job.get("brief", ""),
        "created_at": time.time(),
    }
    (tpl_dir / "meta.json").write_text(json.dumps(meta))
    _templates[tpl_id] = meta
    return {"template_id": tpl_id, "status": "saved"}


# POST /templates/retrieve
@app.post("/templates/retrieve")
async def retrieve_template(req: TemplateRetrieveRequest):
    templates = list(_templates.values())
    if not templates:
        return {"template": None, "message": "No templates saved"}
    brief_lower = req.brief.lower()
    best = max(
        templates,
        key=lambda t: sum(1 for w in brief_lower.split() if w in t.get("brief", "").lower()),
    )
    return {"template": best}


# POST /mix
@app.post("/mix")
async def mix_scenes(req: MixRequest, background_tasks: BackgroundTasks):
    if not req.scenes:
        raise HTTPException(status_code=400, detail="No scenes provided")
    parts: list[str] = []
    for scene_id in req.scenes:
        spec = seed_library.get_spec(scene_id)
        if spec:
            html_path = _find_scene_html(spec["family"], spec["type"], spec["variant"])
            if html_path:
                parts.append(html_path.read_text(encoding="utf-8"))

    if not parts:
        raise HTTPException(status_code=404, detail="None of the requested scenes found on disk")

    combined = "\n<!-- SCENE BREAK -->\n".join(parts)
    job_id = _new_job(f"mix:{','.join(req.scenes)}")
    job_dir = JOBS_DIR / job_id
    job_dir.mkdir(exist_ok=True)
    html_path = job_dir / "scene.html"
    html_path.write_text(combined, encoding="utf-8")
    _jobs[job_id]["html_path"] = str(html_path)
    background_tasks.add_task(_render_job, job_id)
    return {"job_id": job_id, "status": "queued", "scenes_mixed": len(parts)}


# ── startup ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  Catalyst Video Studio running on http://127.0.0.1:8000")
    print(f"  Scenes directory: {SCENES_DIR}")
    print(f"  Scene specs loaded: {len(SCENE_SPECS)}")
    print(f"  Bedrock available: {_bedrock_client is not None}")
    print("=" * 60)
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
