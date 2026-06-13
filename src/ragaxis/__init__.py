"""
ragaxis: Production contract layer for RAG systems.
Typed. Explicit. Observable. Composable.

See: docs/internal/contracts/
"""

from __future__ import annotations

__version__ = "0.0.2"

# Phase 0 public surface — populated as packages are implemented
from ragaxis.core import (
    Chunk,
    ConfidenceScore,
    ConfidenceUnknown,
    ConfigurationError,
    CorpusVersion,
    Cost,
    DegradedError,
    EmbedderAdapter,
    IndexedCorpus,
    LLMAdapter,
    MissingProvenanceError,
    Provenance,
    RagAxisError,
    VectorStoreAdapter,
)
from ragaxis.retrieval import RankedChunk, RetrievalResult
from ragaxis.synthesis import Citation, PipelineResult
from ragaxis.system import RAGPipeline, RunResult

__all__ = [
    "Chunk",
    # Synthesis
    "Citation",
    "ConfidenceScore",
    "ConfidenceUnknown",
    "ConfigurationError",
    "CorpusVersion",
    "Cost",
    "DegradedError",
    # Core protocols
    "EmbedderAdapter",
    "IndexedCorpus",
    "LLMAdapter",
    "MissingProvenanceError",
    "PipelineResult",
    # Core types
    "Provenance",
    "RAGPipeline",
    # Core errors
    "RagAxisError",
    # Retrieval
    "RankedChunk",
    "RetrievalResult",
    # System
    "RunResult",
    "VectorStoreAdapter",
]
