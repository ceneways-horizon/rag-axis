"""
Shared error hierarchy for ragaxis.

All fatal errors inherit from RagAxisError.
All degraded (non-fatal) warnings inherit from DegradedError.
No bare Exception raises anywhere in ragaxis (I4).

See: docs/internal/contracts/errors.md
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

# ---------------------------------------------------------------------------
# Base
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class RagAxisError(Exception):
    """Base for all fatal ragaxis errors. Pipeline halts. Always propagates."""

    message: str
    context: dict[str, Any] = field(default_factory=dict)

    def __str__(self) -> str:
        return self.message


@dataclass(frozen=True)
class DegradedError(RagAxisError):
    """Base for non-fatal warnings. Pipeline continues. Recorded in audit_trail."""


# ---------------------------------------------------------------------------
# Shared — may be raised from any package
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class MissingProvenanceError(RagAxisError):
    """Chunk constructed with missing parent_doc_id, position, or embedding_model_id (I1).

    Message pattern: "Chunk provenance incomplete: missing {field}. chunk_id={chunk_id}"
    """


@dataclass(frozen=True)
class ConfidenceCalibrationError(RagAxisError):
    """ConfidenceScore float is outside [0.0, 1.0], or None passed where ConfidenceScore expected (I3).

    Message pattern: "Invalid confidence value {value}: must be float in [0.0, 1.0] or ConfidenceUnknown"
    """


@dataclass(frozen=True)
class ConfigurationError(RagAxisError):
    """Config object failed validation at construction time.

    Message pattern: "Invalid configuration for {component}: {reason}. field={field}, value={value}"
    """


@dataclass(frozen=True)
class ValidationError(RagAxisError):
    """Cross-layer contract validation failed at runtime.

    Message pattern: "Contract validation failed in {layer}: {reason}"
    """


# ---------------------------------------------------------------------------
# Index Layer errors
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class IngestionError(RagAxisError):
    """Document loading failed: file not found, unsupported format, encoding error.

    Message pattern: "Failed to ingest document {doc_id}: {reason}. source={source_path}"
    """


@dataclass(frozen=True)
class ChunkingError(RagAxisError):
    """Chunking strategy failed to produce valid chunks from a document.

    Message pattern: "Chunking failed for document {doc_id} using strategy {strategy}: {reason}"
    """


@dataclass(frozen=True)
class EmbeddingError(RagAxisError):
    """EmbedderAdapter.embed() failed, or returned wrong vector dimension.

    Message pattern: "Embedding failed for batch of {n} chunks: {reason}. model={model_id}"
    """


@dataclass(frozen=True)
class CorpusVersionError(RagAxisError):
    """IndexedCorpus constructed with inconsistent version metadata.

    Message pattern: "Corpus version inconsistency: {reason}. corpus_id={corpus_id}"
    """


# ---------------------------------------------------------------------------
# Additional errors migrated from rag_axis.core.errors (pre-rename codebase)
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class DocumentLoadError(IngestionError):
    """Document loader failed to read or parse a source document.

    More specific subclass of IngestionError for loader-level failures.
    Message pattern: "Failed to load document from {source}: {reason}"
    """


@dataclass(frozen=True)
class UnsupportedFormatError(IngestionError):
    """Loader received a file format it cannot handle.

    Message pattern: "Unsupported format {format} for document {source}"
    """


@dataclass(frozen=True)
class InputGuardError(RagAxisError):
    """An input guard rejected the incoming query before retrieval.

    Message pattern: "Input guard '{guard}' rejected query: {reason}"
    """


@dataclass(frozen=True)
class OutputGuardError(RagAxisError):
    """An output guard rejected the generated response.

    Message pattern: "Output guard '{guard}' rejected response: {reason}"
    """


@dataclass(frozen=True)
class RerankerTimeoutError(RagAxisError):
    """Reranker did not respond within the configured timeout.

    Message pattern: "Reranker timed out after {timeout_ms}ms. model={model_id}"
    """


@dataclass(frozen=True)
class RerankerUnavailableError(RagAxisError):
    """Reranker service is unavailable.

    Message pattern: "Reranker unavailable: {reason}. model={model_id}"
    """


@dataclass(frozen=True)
class LLMTimeoutError(RagAxisError):
    """LLM did not respond within the configured timeout.

    Related to GenerationError (synthesis layer) but defined in core to avoid circular imports.
    Message pattern: "LLM timed out after {timeout_ms}ms. model={model_id}"
    """


@dataclass(frozen=True)
class StaleIndexError(DegradedError):
    """Corpus index age exceeds the configured staleness threshold (warning only).

    Alias for CorpusVersionMismatchError at degraded severity.
    Pipeline continues but staleness is recorded in audit_trail.
    Message pattern: "Corpus {corpus_id} stale: {age_days}d > threshold {threshold_days}d"
    """


@dataclass(frozen=True)
class FallbackActivatedWarning(DegradedError):
    """A guard triggered a fallback strategy instead of raising fatally.

    Named *Warning intentionally — fallback activation is informational.
    Pipeline continues with the fallback response.
    Message pattern: "Fallback '{strategy}' activated by guard '{guard}': {reason}"
    """
