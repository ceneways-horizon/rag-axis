from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ExperimentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    corpus_id: str = Field(..., min_length=1)
    config: dict[str, Any] = Field(default_factory=dict)


class ExperimentResponse(BaseModel):
    id: str
    project_id: str
    corpus_id: str
    name: str
    description: str | None
    config: dict[str, Any]
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ExperimentList(BaseModel):
    items: list[ExperimentResponse]
    total: int


class RunRequest(BaseModel):
    query: str = Field(..., min_length=1)


class CitationSchema(BaseModel):
    chunk_id: str
    doc_id: str
    score: float
    text: str


class CostReportSchema(BaseModel):
    embedding_tokens: int
    retrieval_ms: int
    generation_tokens: int
    total_cost_usd: float


class AuditEventSchema(BaseModel):
    event: str
    timestamp_ms: int
    details: dict[str, Any] = {}


class RunResponse(BaseModel):
    id: str
    experiment_id: str
    project_id: str
    query: str
    answer: str | None
    citations: list[CitationSchema]
    cost_report: CostReportSchema | None
    audit_trail: list[AuditEventSchema]
    execution_time_ms: int | None
    status: str
    error_message: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class RunList(BaseModel):
    items: list[RunResponse]
    total: int


class MetricsResponse(BaseModel):
    experiment_id: str
    total_runs: int
    success_rate: float
    avg_execution_time_ms: float
    avg_cost_usd: float
    total_cost_usd: float
