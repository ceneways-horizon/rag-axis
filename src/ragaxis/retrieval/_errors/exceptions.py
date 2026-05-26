"""
Retrieval Layer errors.

See: docs/internal/contracts/errors.md (retrieval layer section)
"""

from __future__ import annotations

from dataclasses import dataclass

from ragaxis.core._errors.exceptions import DegradedError, RagAxisError


@dataclass(frozen=True)
class EmptyRetrievalError(RagAxisError):
    """Vector store returned zero results for the query (after all filters).

    Message pattern: "Retrieval returned no chunks for query. corpus_id={corpus_id}, k={k}, filters={filters}"
    Recovery: broaden query, increase k, relax filters, verify corpus is non-empty.
    """


@dataclass(frozen=True)
class EmbedderMismatchError(RagAxisError):
    """EmbedderAdapter.get_model_id() != IndexedCorpus.corpus_version.embedding_model_id.

    Message pattern: "Embedder mismatch: query uses '{query_model}' but corpus was indexed with '{corpus_model}'."
    Recovery: re-index corpus with current embedder, or switch to the matching embedder.
    """


@dataclass(frozen=True)
class CorpusVersionMismatchError(RagAxisError):
    """Corpus staleness age exceeds configured max_staleness_seconds threshold.

    Message pattern: "Corpus {corpus_id} is stale: last updated {age_days} days ago, threshold is {threshold_days} days."
    Recovery: re-index corpus or increase staleness threshold.
    """


@dataclass(frozen=True)
class ScoreCollapseWarning(DegradedError):
    """Score range too narrow: max(scores) - min(scores) < score_collapse_threshold (default 0.05).

    Message pattern: "Score collapse detected: score range is {range:.4f} (threshold {threshold})."
    Pipeline continues. Recorded in audit_trail and quality_signals.
    """


@dataclass(frozen=True)
class RetrievalQualityWarning(DegradedError):
    """Chunks fall below min_score_threshold or top_5_diversity_score is below diversity threshold.

    Message pattern: "Retrieval quality degraded: {reason}. best_score={best_score:.4f}"
    Pipeline continues. Flag for human review via RunResult.quality_summary.
    """
