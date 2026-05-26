"""
Hybrid RRF fusion: combines dense and sparse retrieval results.

Default fusion: Reciprocal Rank Fusion with k=60 (ADR-0003).
This is the primary entry point for the Retrieval Layer.

See: docs/internal/contracts/types.md §8 (RetrievalResult)
     docs/internal/design-decisions/adr-0003-rrf-hybrid-fusion.md
Phase: 1
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from ragaxis.core._types.contracts import IndexedCorpus
    from ragaxis.retrieval._types.contracts import RetrievalResult


async def execute_retrieval(
    query: str,
    corpus: IndexedCorpus,
    config: dict[str, Any] | None = None,
) -> RetrievalResult:
    """Execute hybrid RRF retrieval (dense + sparse fusion).

    Primary entry point for the Retrieval Layer.
    Default: RRF with k=60 (ADR-0003).

    Phase 1 stub — implementation pending.
    """
    raise NotImplementedError  # Phase 1 stub
