"""
Frozen dataclass type contracts for ragaxis.system.

See: docs/internal/contracts/types.md §11 (RunResult)
Invariants: I2 (aggregated_audit_trail), I6 (frozen), I7 (aggregated_cost)
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from ragaxis.core._types.contracts import Cost, IndexedCorpus
    from ragaxis.retrieval._types.contracts import RetrievalResult
    from ragaxis.synthesis._types.contracts import PipelineResult


@dataclass(frozen=True)
class RunResult:
    """System Layer output contract. Single source of truth. Frozen.

    See: docs/internal/contracts/types.md §11

    aggregated_cost = sum of index + retrieval + synthesis stage costs (I7).
    aggregated_audit_trail = all events from all layers in chronological order (I2).
    reproducibility_metadata contains everything needed to replay this run exactly.
    """

    query: str
    indexed_corpus: IndexedCorpus
    retrieval_result: RetrievalResult
    pipeline_result: PipelineResult
    aggregated_cost: Cost
    aggregated_audit_trail: tuple[str, ...]
    reproducibility_metadata: dict[str, Any]
    # Expected keys: ragaxis_version (str), timestamp (ISO 8601 str),
    #                config_snapshot (dict), embedding_model_id (str),
    #                llm_model_id (str), corpus_version (str),
    #                retrieval_strategy_used (str), reranking_enabled (bool)
    quality_summary: dict[str, Any]
    # Expected keys: retrieval_quality (float), answer_quality (float),
    #                citation_quality (float), overall_confidence (float)
    warnings_and_errors: tuple[str, ...]
    # String representations of DegradedError instances that were caught
