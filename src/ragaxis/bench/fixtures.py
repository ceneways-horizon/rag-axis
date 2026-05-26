"""
Shared test fixtures for all phases.

Provides factory functions for Provenance, Chunk, IndexedCorpus,
RetrievalResult, and PipelineResult with minimal valid data.

See: docs/internal/testing-strategy/fixtures.md
Phase: 0
"""

from __future__ import annotations

from ragaxis.core._types.contracts import (
    Chunk,
    CorpusVersion,
    Cost,
    IndexedCorpus,
    Provenance,
)


def make_provenance(
    parent_doc_id: str = "test-doc-1",
    position: int = 0,
    embedding_model_id: str = "text-embedding-3-large",
) -> Provenance:
    """Return a minimal valid Provenance instance for testing."""
    return Provenance(
        parent_doc_id=parent_doc_id,
        position=position,
        embedding_model_id=embedding_model_id,
    )


def make_chunk(
    id: str = "chunk-1",
    text: str = "Test chunk text.",
    embedding_dim: int = 4,
    provenance: Provenance | None = None,
) -> Chunk:
    """Return a minimal valid Chunk instance for testing."""
    return Chunk(
        id=id,
        text=text,
        embedding=tuple([0.1] * embedding_dim),
        provenance=provenance or make_provenance(),
    )


def make_corpus(
    corpus_id: str = "test-corpus-1",
    chunks: list[Chunk] | None = None,
    embedding_model_id: str = "text-embedding-3-large",
    embedding_dimension: int = 4,
) -> IndexedCorpus:
    """Return a minimal valid IndexedCorpus instance for testing."""
    _chunks = tuple(chunks or [make_chunk(embedding_dim=embedding_dimension)])
    return IndexedCorpus(
        corpus_id=corpus_id,
        corpus_version=CorpusVersion(
            corpus_id=corpus_id,
            created_at="2026-05-20T00:00:00Z",
            embedding_model_id=embedding_model_id,
            embedding_dimension=embedding_dimension,
            schema_version="1.0",
        ),
        chunks=_chunks,
        cost_report=Cost(tokens_used=0, latency_ms=0, estimated_cost_usd=0.0),
        staleness_metadata={
            "last_updated": "2026-05-20T00:00:00Z",
            "refresh_interval_seconds": 86400,
        },
    )
