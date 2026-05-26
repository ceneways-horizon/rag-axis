from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

_jobs: dict[str, dict[str, Any]] = {}


def create_job(job_type: str, payload: dict[str, Any]) -> str:
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {
        "id": job_id,
        "type": job_type,
        "payload": payload,
        "status": "queued",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return job_id


def update_job(job_id: str, status: str, result: dict[str, Any] | None = None) -> None:
    if job_id in _jobs:
        _jobs[job_id]["status"] = status
        if result is not None:
            _jobs[job_id]["result"] = result


def get_job(job_id: str) -> dict[str, Any] | None:
    return _jobs.get(job_id)
