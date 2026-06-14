"""
Local SQLite database layer — replaces Supabase for local development.
Exposes /db/{table} REST endpoints that the frontend local-supabase shim calls.
"""
from __future__ import annotations

import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

DB_PATH = Path(__file__).resolve().parent.parent / "local_data.db"

router = APIRouter(prefix="/db", tags=["local-db"])

# ── JSON columns that need ser/deserialisation ────────────────────────────────

JSON_COLS: dict[str, set[str]] = {
    "campaigns":      {"target_platforms"},
    "episodes":       {"research", "script", "virality_score"},
    "platform_posts": {"hashtags", "analytics"},
    "analytics":      {},
    "research_cache": {"data"},
}

ALLOWED_TABLES = set(JSON_COLS.keys())

# ── schema ────────────────────────────────────────────────────────────────────

SCHEMA = """
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'planning',
  description TEXT,
  goal TEXT,
  target_views INTEGER DEFAULT 10000,
  accent_color TEXT DEFAULT '#6c47ff',
  target_platforms TEXT DEFAULT '[]',
  start_date TEXT,
  end_date TEXT,
  episode_count INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  campaign_id TEXT,
  title TEXT,
  status TEXT DEFAULT 'idea',
  episode_number INTEGER,
  topic TEXT,
  research TEXT,
  script TEXT,
  video_job_id TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  virality_score TEXT,
  scheduled_date TEXT,
  scheduled_at TEXT,
  posted_at TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS platform_posts (
  id TEXT PRIMARY KEY,
  episode_id TEXT,
  platform TEXT NOT NULL,
  post_id TEXT,
  status TEXT DEFAULT 'pending',
  caption TEXT,
  hashtags TEXT DEFAULT '[]',
  post_url TEXT,
  posted_at TEXT,
  analytics TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS analytics (
  id TEXT PRIMARY KEY,
  episode_id TEXT,
  platform TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement_rate REAL DEFAULT 0,
  fetched_at TEXT
);

CREATE TABLE IF NOT EXISTS research_cache (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  source TEXT NOT NULL,
  data TEXT,
  expires_at TEXT,
  created_at TEXT
);
"""


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _get_conn() as conn:
        conn.executescript(SCHEMA)


# ── helpers ───────────────────────────────────────────────────────────────────

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _serialise(table: str, row: dict) -> dict:
    json_cols = JSON_COLS.get(table, set())
    out = {}
    for k, v in row.items():
        if k in json_cols and v is not None and not isinstance(v, str):
            out[k] = json.dumps(v)
        else:
            out[k] = v
    return out


def _deserialise(table: str, row: dict) -> dict:
    json_cols = JSON_COLS.get(table, set())
    out = dict(row)
    for col in json_cols:
        if col in out and isinstance(out[col], str):
            try:
                out[col] = json.loads(out[col])
            except Exception:
                pass
    return out


def _rows_to_list(table: str, rows) -> list[dict]:
    return [_deserialise(table, dict(r)) for r in rows]


def _parse_filters(params: dict[str, str]) -> dict[str, str]:
    filters: dict[str, str] = {}
    for k, v in params.items():
        if k.startswith("filter_"):
            col = k[len("filter_"):]
            filters[col] = v
    return filters


# ── routes ────────────────────────────────────────────────────────────────────

@router.get("/{table}")
async def list_rows(table: str, request: Request):
    if table not in ALLOWED_TABLES:
        raise HTTPException(status_code=400, detail=f"Unknown table: {table}")

    params = dict(request.query_params)
    filters = _parse_filters(params)
    order_col = params.get("order_col", "created_at")
    order_dir = params.get("order_dir", "desc").upper()
    if order_dir not in ("ASC", "DESC"):
        order_dir = "DESC"

    where_parts: list[str] = []
    values: list[Any] = []
    for col, val in filters.items():
        where_parts.append(f"{col} = ?")
        values.append(val)

    where_sql = f"WHERE {' AND '.join(where_parts)}" if where_parts else ""

    # validate order_col is a simple identifier
    if not order_col.replace("_", "").isalnum():
        order_col = "created_at"

    sql = f"SELECT * FROM {table} {where_sql} ORDER BY {order_col} {order_dir}"

    with _get_conn() as conn:
        rows = conn.execute(sql, values).fetchall()

    return JSONResponse(_rows_to_list(table, rows))


@router.get("/{table}/{row_id}")
async def get_row(table: str, row_id: str):
    if table not in ALLOWED_TABLES:
        raise HTTPException(status_code=400, detail=f"Unknown table: {table}")

    with _get_conn() as conn:
        row = conn.execute(f"SELECT * FROM {table} WHERE id = ?", [row_id]).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Row not found")

    return JSONResponse(_deserialise(table, dict(row)))


@router.post("/{table}")
async def insert_rows(table: str, request: Request):
    if table not in ALLOWED_TABLES:
        raise HTTPException(status_code=400, detail=f"Unknown table: {table}")

    body = await request.json()
    rows_in = body if isinstance(body, list) else [body]
    now = _now()
    inserted: list[dict] = []

    with _get_conn() as conn:
        for row in rows_in:
            row = dict(row)
            if "id" not in row or not row["id"]:
                row["id"] = str(uuid.uuid4())
            if "created_at" not in row or not row["created_at"]:
                row["created_at"] = now
            if "updated_at" not in row:
                row["updated_at"] = now

            row = _serialise(table, row)
            cols = ", ".join(row.keys())
            placeholders = ", ".join("?" for _ in row)
            conn.execute(
                f"INSERT OR REPLACE INTO {table} ({cols}) VALUES ({placeholders})",
                list(row.values()),
            )
            raw = conn.execute(f"SELECT * FROM {table} WHERE id = ?", [row["id"]]).fetchone()
            if raw:
                inserted.append(_deserialise(table, dict(raw)))

    if isinstance(body, list):
        return JSONResponse(inserted)
    return JSONResponse(inserted[0] if inserted else {})


@router.patch("/{table}/{row_id}")
async def update_row(table: str, row_id: str, request: Request):
    if table not in ALLOWED_TABLES:
        raise HTTPException(status_code=400, detail=f"Unknown table: {table}")

    body = await request.json()
    updates = dict(body)
    updates.pop("id", None)
    updates["updated_at"] = _now()
    updates = _serialise(table, updates)

    set_parts = ", ".join(f"{k} = ?" for k in updates)
    values = list(updates.values()) + [row_id]

    with _get_conn() as conn:
        conn.execute(f"UPDATE {table} SET {set_parts} WHERE id = ?", values)
        row = conn.execute(f"SELECT * FROM {table} WHERE id = ?", [row_id]).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Row not found")

    return JSONResponse(_deserialise(table, dict(row)))


@router.delete("/{table}/{row_id}")
async def delete_row(table: str, row_id: str):
    if table not in ALLOWED_TABLES:
        raise HTTPException(status_code=400, detail=f"Unknown table: {table}")

    with _get_conn() as conn:
        conn.execute(f"DELETE FROM {table} WHERE id = ?", [row_id])

    return JSONResponse({"deleted": row_id})


init_db()
