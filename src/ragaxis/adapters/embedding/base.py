"""
Base embedder adapter logic: validation helpers and cost construction.

Shared utilities for all EmbedderAdapter implementations.

See: docs/internal/contracts/adapters.md §1 (EmbedderAdapter)
Phase: 0
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ragaxis.core._types.contracts import Cost


def build_embedding_cost(tokens_used: int, latency_ms: int, model_id: str) -> Cost:
    """Construct Cost from embedding call metadata. Stub: pricing table pending."""
    raise NotImplementedError  # Phase 0 stub
