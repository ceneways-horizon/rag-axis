from __future__ import annotations

from datetime import datetime  # noqa: TC003 - required at runtime for pydantic validation

from pydantic import BaseModel, Field


class CorpusCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    embedding_model_id: str = Field(..., min_length=1)
    embedding_model_version: str | None = None


class CorpusResponse(BaseModel):
    id: str
    project_id: str
    name: str
    embedding_model_id: str
    embedding_model_version: str | None
    document_count: int
    chunk_count: int
    token_count: int
    status: str
    error_message: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CorpusList(BaseModel):
    items: list[CorpusResponse]
    total: int


class DocumentResponse(BaseModel):
    id: str
    corpus_id: str
    project_id: str
    name: str
    file_size_bytes: int | None
    content_hash: str | None
    status: str
    error_message: str | None
    uploaded_at: datetime
    indexed_at: datetime | None

    model_config = {"from_attributes": True}


class DocumentList(BaseModel):
    items: list[DocumentResponse]
    total: int
