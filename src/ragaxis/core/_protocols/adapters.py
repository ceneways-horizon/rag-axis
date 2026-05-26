"""
typing.Protocol definitions for all ragaxis adapter boundaries.

Core packages import these protocols only — never concrete implementations.
Adapters in ragaxis.adapters satisfy protocols structurally (no inheritance).

See: docs/internal/contracts/adapters.md
Invariants enforced: I4 (typed errors), I5 (no provider deps in core)
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Protocol, runtime_checkable

if TYPE_CHECKING:
    # RankedChunk lives in ragaxis.retrieval — import only for type checking,
    # never at runtime, to prevent a circular dependency (I6).
    from ragaxis.core._types.contracts import IndexedCorpus, Vector
    from ragaxis.retrieval._types.contracts import RankedChunk


# ---------------------------------------------------------------------------
# EmbedderAdapter
# ---------------------------------------------------------------------------


@runtime_checkable
class EmbedderAdapter(Protocol):
    """Converts text into dense vector embeddings.

    Used by Index Layer (embed chunks) and Retrieval Layer (embed queries).
    See: docs/internal/contracts/adapters.md §1
    """

    async def embed(self, texts: list[str]) -> tuple[list[Vector], int, int]:
        """Embed a batch of texts.

        Args:
            texts: Non-empty list of non-empty strings.

        Returns:
            (vectors, tokens_used, latency_ms)
            vectors: one embedding per input text, same order.
            tokens_used: total tokens submitted to provider.
            latency_ms: wall-clock time of the API call.

        Raises:
            EmbeddingError, RateLimitError, TransportError
        """
        ...

    def get_model_id(self) -> str:
        """Return stable canonical model identifier, e.g. 'text-embedding-3-large'.

        Stored in Provenance.embedding_model_id and CorpusVersion.embedding_model_id.
        """
        ...

    def get_embedding_dimension(self) -> int:
        """Return vector dimensionality, e.g. 1536.

        Validated against CorpusVersion.embedding_dimension at index and query time.
        """
        ...


# ---------------------------------------------------------------------------
# VectorStoreAdapter
# ---------------------------------------------------------------------------


@runtime_checkable
class VectorStoreAdapter(Protocol):
    """Stores indexed corpora and executes vector similarity search.

    Used by Index Layer (persist) and Retrieval Layer (search).
    See: docs/internal/contracts/adapters.md §2
    """

    async def index(self, corpus: IndexedCorpus) -> tuple[IndexedCorpus, int]:
        """Persist an IndexedCorpus to the vector store.

        Args:
            corpus: Fully constructed, frozen IndexedCorpus.

        Returns:
            (corpus, latency_ms) — corpus is unchanged (pass-through).

        Raises:
            CorpusVersionError, EmbeddingError, TransportError
        """
        ...

    async def search(
        self,
        query: Vector,
        k: int,
        corpus_version: str,
        filters: dict[str, Any] | None = None,
    ) -> tuple[list[RankedChunk], int, int]:
        """Execute vector similarity search.

        Args:
            query: Pre-computed query embedding vector.
            k: Maximum results to return (> 0).
            corpus_version: corpus_id scoping the search.
            filters: Optional provider-specific metadata filters.

        Returns:
            (chunks, tokens_used, latency_ms)
            chunks: ranked results, may be empty (caller raises EmptyRetrievalError).
            tokens_used: 0 if query was pre-embedded by caller.
            latency_ms: wall-clock time of the search call.

        Raises:
            CorpusVersionMismatchError, EmbedderMismatchError, TransportError
        """
        ...

    def validate_corpus_version(self, expected_version: str) -> bool:
        """Check whether a corpus with given corpus_id exists in this store.

        Returns:
            True if corpus exists and is queryable, False otherwise.

        Raises:
            TransportError
        """
        ...


# ---------------------------------------------------------------------------
# LLMAdapter
# ---------------------------------------------------------------------------


@runtime_checkable
class LLMAdapter(Protocol):
    """Executes LLM completions. Used by Synthesis Layer for answer generation.

    See: docs/internal/contracts/adapters.md §3
    """

    async def complete(
        self,
        prompt: str,
        max_tokens: int,
        temperature: float = 0.0,
    ) -> tuple[str, int, int, int]:
        """Execute a single-turn LLM completion.

        Args:
            prompt: Fully assembled prompt string.
            max_tokens: Maximum completion tokens (> 0).
            temperature: Sampling temperature, default 0.0 (deterministic).

        Returns:
            (completion, prompt_tokens, completion_tokens, latency_ms)
            completion: generated text, never empty string.

        Raises:
            GenerationError, ContextLengthError, RateLimitError, TransportError
        """
        ...

    def get_model_id(self) -> str:
        """Return stable canonical model identifier, e.g. 'claude-sonnet-4-6'.

        Stored in PipelineResult.generation_metadata and RunResult.reproducibility_metadata.
        """
        ...


# Forward reference used in VectorStoreAdapter — import here to avoid circular deps
