"""
ragaxis.retrieval: Retrieval Layer — query execution and ranked chunk selection.

Contains:
  - Dense retrieval (vector similarity)
  - Sparse retrieval (BM25 / SPLADE)
  - Hybrid RRF fusion (k=60 default)
  - Pre-retrieval validation (embedder match, corpus staleness)
  - Score collapse detection

See: docs/internal/contracts/types.md (RankedChunk, RetrievalResult)
     docs/internal/contracts/errors.md (retrieval layer errors)
Phase: 1
"""

from __future__ import annotations

from ragaxis.retrieval._errors.exceptions import (
    CorpusVersionMismatchError,
    EmbedderMismatchError,
    EmptyRetrievalError,
    RetrievalQualityWarning,
    ScoreCollapseWarning,
)
from ragaxis.retrieval._types.contracts import RankedChunk, RetrievalResult
from ragaxis.retrieval.hybrid import execute_retrieval

__all__ = [
    "CorpusVersionMismatchError",
    "EmbedderMismatchError",
    # Errors
    "EmptyRetrievalError",
    # Types
    "RankedChunk",
    "RetrievalQualityWarning",
    "RetrievalResult",
    "ScoreCollapseWarning",
    # Functions
    "execute_retrieval",
]
