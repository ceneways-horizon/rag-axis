"""
Frozen dataclass type contracts for ragaxis.retrieval.

See: docs/internal/contracts/types.md §7 (RankedChunk), §8 (RetrievalResult)
Invariants: I2 (audit_trail), I3 (confidence), I6 (frozen), I7 (cost_report)
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from ragaxis.core._types.contracts import ConfidenceScore, Cost, Provenance


@dataclass(frozen=True)
class RankedChunk:
    """A retrieved chunk with its ranking signal. Retrieval-time view of a Chunk.

    confidence is float | ConfidenceUnknown — never None (I3).
    rank is 1-based (1 = most relevant).
    provenance carried unchanged from the source Chunk (I1).
    """

    chunk_id: str
    text: str
    raw_score: float  # [0.0, 1.0] after normalisation
    confidence: ConfidenceScore  # float | ConfidenceUnknown, never None
    rank: int  # >= 1
    provenance: Provenance


@dataclass(frozen=True)
class RetrievalResult:
    """Retrieval Layer output contract. Frozen. See: docs/internal/contracts/types.md §8.

    chunks: sorted descending by confidence, may be empty tuple only if EmptyRetrievalError
            was raised and caught at the degraded level (rare — normally fatal).
    audit_trail: non-null, records every retrieval event (I2).
    cost_report: always present (I7).
    """

    query: str
    chunks: tuple[RankedChunk, ...]
    retrieval_metrics: dict[str, Any]
    # Expected keys: chunks_evaluated, chunks_returned, score_range (tuple),
    #                score_collapse_detected (bool), top_5_diversity_score (float)
    validation_result: dict[str, Any]
    # Expected keys: embedder_match (bool), corpus_freshness (bool), corpus_version (str)
    audit_trail: tuple[str, ...]
    cost_report: Cost
    quality_signals: dict[str, Any]
    # Expected keys: best_score (float), worst_score (float),
    #                signal_strength ("strong"|"moderate"|"weak"),
    #                recommended_action (str)
