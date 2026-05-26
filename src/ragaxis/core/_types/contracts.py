"""
Frozen dataclass type contracts for ragaxis.core.

Defines all cross-layer shared types. These are the canonical definitions
referenced throughout the codebase.

See: docs/internal/contracts/types.md
Invariants enforced: I1 (Provenance), I3 (ConfidenceScore), I6 (frozen), I7 (Cost)
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

# Type alias — used throughout ragaxis
Vector = list[float]


# ---------------------------------------------------------------------------
# Provenance — I1
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class Provenance:
    """Immutable origin metadata for a Chunk. Required by I1.

    All three fields must be non-empty at construction time.
    Absence of any field raises MissingProvenanceError (enforced by callers).
    """

    parent_doc_id: str
    position: int  # >= 0; unit defined by chunking strategy (byte, token, paragraph index)
    embedding_model_id: str


# ---------------------------------------------------------------------------
# Cost — I7
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class Cost:
    """Resource consumption for a single pipeline stage. Required by I7.

    Every result type embeds a Cost instance. Never optional.
    Zero-cost stages use Cost(tokens_used=0, latency_ms=0, estimated_cost_usd=0.0).
    """

    tokens_used: int  # >= 0
    latency_ms: int  # >= 0
    estimated_cost_usd: float  # >= 0.0; advisory, not authoritative


# ---------------------------------------------------------------------------
# ConfidenceScore — I3
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class ConfidenceUnknown:
    """Sentinel for explicitly unknown confidence. Never use None. See I3.

    Use when a score cannot be computed or is unreliable.
    """

    reason: str = "confidence not computable"


# Union type used in all confidence fields.
# float must be in [0.0, 1.0]; ConfidenceCalibrationError raised otherwise.
ConfidenceScore = float | ConfidenceUnknown


# ---------------------------------------------------------------------------
# CorpusVersion
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class CorpusVersion:
    """Immutable metadata snapshot of an indexed corpus.

    Used for staleness detection and embedder compatibility checks.
    embedding_model_id must match the query embedder's get_model_id() at retrieval time.
    """

    corpus_id: str
    created_at: str  # ISO 8601
    embedding_model_id: str
    embedding_dimension: int  # > 0
    schema_version: str  # e.g. "1.0"


# ---------------------------------------------------------------------------
# Chunk
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class Chunk:
    """Atomic unit of retrieval. A piece of indexed text with embedding and provenance.

    id is deterministic: derived from provenance.parent_doc_id + str(provenance.position).
    embedding length must match CorpusVersion.embedding_dimension.
    metadata may be empty dict but never None.
    """

    id: str
    text: str
    embedding: tuple[float, ...]  # tuple enforces immutability
    provenance: Provenance
    metadata: dict[str, Any] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# IndexedCorpus — I6 cross-stage boundary
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class IndexedCorpus:
    """Index Layer output contract. Frozen. See: docs/internal/contracts/types.md §6.

    corpus_id must equal corpus_version.corpus_id (validated at construction by callers).
    chunks uses tuple (not list) so frozen enforcement extends to the collection.
    """

    corpus_id: str
    corpus_version: CorpusVersion
    chunks: tuple[Chunk, ...]
    cost_report: Cost
    staleness_metadata: dict[str, Any] = field(default_factory=dict)
    # staleness_metadata expected keys: last_updated (ISO 8601 str), refresh_interval_seconds (int)
