"""
ragaxis.bench: Evaluation and acceptance testing framework.

Provides phase-specific acceptance tests, shared fixtures, and quality metrics.
Depends on ragaxis.core only — never on adapters or system (I6).

See: docs/internal/testing-strategy/
Phase: 0 (used immediately for validation)
"""

from __future__ import annotations

from ragaxis.bench.fixtures import make_chunk, make_corpus, make_provenance
from ragaxis.bench.metrics import measure_retrieval_quality

__all__ = [
    "make_chunk",
    "make_corpus",
    "make_provenance",
    "measure_retrieval_quality",
]
