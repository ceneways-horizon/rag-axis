from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: dict[str, Any] = {}


class ErrorResponse(BaseModel):
    error: ErrorDetail


class JobAccepted(BaseModel):
    job_id: str
    status: str = "accepted"
    message: str = "Job accepted and queued for processing"
