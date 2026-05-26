"""
RAGPipeline: primary entry point for end-to-end pipeline execution.

Composes Index Layer → Retrieval Layer → Synthesis Layer.
Returns RunResult (the complete, immutable record of the run).

See: docs/internal/contracts/types.md §11 (RunResult)
Phase: 3
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from ragaxis.core._protocols.adapters import EmbedderAdapter, LLMAdapter, VectorStoreAdapter
    from ragaxis.core._types.contracts import IndexedCorpus
    from ragaxis.system._types.contracts import RunResult


class RAGPipeline:
    """End-to-end RAG pipeline. Phase 3 implementation target.

    Usage::

        pipeline = RAGPipeline(embedder=..., vector_store=..., llm=...)
        result = await pipeline.execute(query="...", corpus=indexed_corpus)
    """

    def __init__(
        self,
        embedder: EmbedderAdapter,
        vector_store: VectorStoreAdapter,
        llm: LLMAdapter,
        retrieval_config: dict[str, Any] | None = None,
        synthesis_config: dict[str, Any] | None = None,
    ) -> None:
        raise NotImplementedError  # Phase 3 stub

    async def execute(
        self,
        query: str,
        corpus: IndexedCorpus,
    ) -> RunResult:
        """Execute the full Index → Retrieval → Synthesis pipeline.

        Returns:
            RunResult — frozen, complete, reproducible record of this execution.

        Raises:
            PipelineExecutionError — wraps any unhandled error from a layer.
        """
        raise NotImplementedError  # Phase 3 stub
