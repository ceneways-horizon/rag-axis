from __future__ import annotations

import platform
import sys
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def get_health() -> dict[str, Any]:
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "0.0.1",
    }


@router.get("/api/telemetry")
def get_telemetry() -> dict[str, Any]:
    return {
        "python_version": sys.version,
        "platform": platform.system(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": 0,
    }
