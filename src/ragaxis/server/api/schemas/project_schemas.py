from __future__ import annotations

from datetime import datetime  # noqa: TC003 - required at runtime for pydantic validation

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    owner_id: str | None = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str | None
    owner_id: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectList(BaseModel):
    items: list[ProjectResponse]
    total: int
