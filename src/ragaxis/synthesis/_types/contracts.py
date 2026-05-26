"""
Frozen dataclass type contracts for ragaxis.synthesis.

See: docs/internal/contracts/types.md §9 (Citation), §10 (PipelineResult)
Invariants: I2 (truncation_audit), I3 (answer_confidence), I6 (frozen), I7 (cost_report)
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from ragaxis.core._types.contracts import ConfidenceScore, Cost, Provenance


@dataclass(frozen=True)
class Citation:
    """Links a statement in the answer back to a source chunk.

    confidence is plain float (citations with unknown confidence are not emitted).
    chunk_id must reference a chunk present in the RetrievalResult passed to synthesis.
    """

    statement: str  # excerpt from the answer text this citation supports
    chunk_id: str  # references RankedChunk.chunk_id
    chunk_text: str  # full text of the source chunk
    confidence: float  # [0.0, 1.0]
    provenance: Provenance


@dataclass(frozen=True)
class PipelineResult:
    """Synthesis Layer output contract. Frozen. See: docs/internal/contracts/types.md §10.

    answer must not be empty string — OutputValidationError raised if LLM returns empty.
    truncation_audit is non-empty whenever context was dropped (I2).
    answer_confidence is float | ConfidenceUnknown — never None (I3).
    cost_report is always present (I7).
    """

    query: str
    answer: str
    citations: tuple[Citation, ...]
    context_assembly: dict[str, Any]
    # Expected keys: chunks_used (int), total_context_tokens (int),
    #                context_budget (int), chunk_order (list[str])
    truncation_audit: tuple[str, ...]  # non-empty if any chunks were dropped
    reranking_details: dict[str, Any]
    # Expected keys: enabled (bool), chunks_reranked (int),
    #                reranker_model (str), latency_ms (int)
    answer_confidence: ConfidenceScore
    generation_metadata: dict[str, Any]
    # Expected keys: llm_model (str), prompt_tokens (int),
    #                completion_tokens (int), temperature_used (float),
    #                generation_latency_ms (int)
    audit_trail: tuple[str, ...]
    cost_report: Cost
    quality_signals: dict[str, Any]
    # Expected keys: answer_length (int), citation_coverage (float),
    #                confidence_level ("high"|"medium"|"low"),
    #                recommended_review (bool)
