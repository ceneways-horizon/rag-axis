"""
MilvusVectorStore: VectorStoreAdapter implementation for Milvus.

Stub: Implementation pending.
Satisfies VectorStoreAdapter protocol structurally (no inheritance).

See: docs/internal/contracts/adapters.md §2 (VectorStoreAdapter)
Phase: 0
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from ragaxis.core._types.contracts import IndexedCorpus, Vector
    from ragaxis.retrieval._types.contracts import RankedChunk


class MilvusVectorStore:
    """VectorStoreAdapter implementation for Milvus.

    Stub: implementation pending. See docs/internal/contracts/adapters.md §2.
    """

    def __init__(self, api_key: str, index_name: str) -> None:
        raise NotImplementedError  # Phase 0 stub

    async def index(self, corpus: IndexedCorpus) -> tuple[IndexedCorpus, int]:
        raise NotImplementedError  # Phase 0 stub

    async def search(
        self,
        query: Vector,
        k: int,
        corpus_version: str,
        filters: dict[str, Any] | None = None,
    ) -> tuple[list[RankedChunk], int, int]:
        raise NotImplementedError  # Phase 0 stub

    def validate_corpus_version(self, expected_version: str) -> bool:
        raise NotImplementedError  # Phase 0 stub
