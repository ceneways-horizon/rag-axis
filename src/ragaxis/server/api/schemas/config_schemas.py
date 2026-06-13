from __future__ import annotations

from datetime import datetime  # noqa: TC003 - required at runtime for pydantic validation
from typing import Any

from pydantic import BaseModel, Field


class ConfigurationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    version: str = Field(..., min_length=1, max_length=100)
    config: dict[str, Any] = Field(default_factory=dict)


class ConfigurationResponse(BaseModel):
    id: str
    project_id: str
    name: str
    version: str
    config: dict[str, Any]
    status: str
    promoted_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConfigurationList(BaseModel):
    items: list[ConfigurationResponse]
    total: int
