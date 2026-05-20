"""
ragaxis.core: Index Layer primitives and shared type contracts.

Contains:
  - Shared types: Provenance, Cost, ConfidenceScore, CorpusVersion, IndexedCorpus, Chunk
  - Adapter protocols: EmbedderAdapter, VectorStoreAdapter, LLMAdapter
  - Shared errors: RagAxisError, DegradedError and all named subclasses
  - Index Layer: ingestion, chunking, corpus versioning

See: docs/internal/contracts/types.md
     docs/internal/contracts/errors.md
     docs/internal/contracts/adapters.md
"""

from __future__ import annotations

from ragaxis.core._errors.exceptions import (
    ChunkingError,
    ConfidenceCalibrationError,
    ConfigurationError,
    CorpusVersionError,
    DegradedError,
    DocumentLoadError,
    EmbeddingError,
    FallbackActivatedWarning,
    IngestionError,
    InputGuardError,
    LLMTimeoutError,
    MissingProvenanceError,
    OutputGuardError,
    RagAxisError,
    RerankerTimeoutError,
    RerankerUnavailableError,
    StaleIndexError,
    UnsupportedFormatError,
    ValidationError,
)
from ragaxis.core._protocols.adapters import (
    EmbedderAdapter,
    LLMAdapter,
    VectorStoreAdapter,
)
from ragaxis.core._types.contracts import (
    Chunk,
    ConfidenceScore,
    ConfidenceUnknown,
    CorpusVersion,
    Cost,
    IndexedCorpus,
    Provenance,
)
from ragaxis.core.chunking import chunk_documents
from ragaxis.core.corpus import prepare_corpus
from ragaxis.core.ingestion import ingest_documents

__all__ = [
    "Chunk",
    "ChunkingError",
    "ConfidenceCalibrationError",
    "ConfidenceScore",
    "ConfidenceUnknown",
    "ConfigurationError",
    "CorpusVersion",
    "CorpusVersionError",
    "Cost",
    "DegradedError",
    # Errors — additional
    "DocumentLoadError",
    # Protocols
    "EmbedderAdapter",
    "EmbeddingError",
    "FallbackActivatedWarning",
    "IndexedCorpus",
    # Errors — index layer
    "IngestionError",
    "InputGuardError",
    "LLMAdapter",
    "LLMTimeoutError",
    # Errors — shared
    "MissingProvenanceError",
    "OutputGuardError",
    # Types
    "Provenance",
    # Errors — base
    "RagAxisError",
    "RerankerTimeoutError",
    "RerankerUnavailableError",
    "StaleIndexError",
    "UnsupportedFormatError",
    "ValidationError",
    "VectorStoreAdapter",
    "chunk_documents",
    # Functions
    "ingest_documents",
    "prepare_corpus",
]
