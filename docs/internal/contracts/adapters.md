# Adapter Contracts — Protocol Method Signatures

**Purpose:** Formal interface specifications for all `typing.Protocol` adapters. Adapter implementations must satisfy every method signature below. No inheritance from ragaxis base classes — structural compliance only.

**Reference:** [Types](types.md) · [Errors](errors.md) · [Invariants — I4, I5](../../shared/invariants.md) · [ADR-0002: Protocol over ABC](../design-decisions/adr-0002-protocol-adapters.md)

---

## Conventions

- All protocols use `@runtime_checkable` — `isinstance(obj, EmbedderAdapter)` works at runtime
- All provider-facing methods are `async` — synchronous wrappers may be added by implementations
- Cost is returned as part of the result tuple or embedded in the return type — never logged separately (I7)
- Adapters must not suppress provider errors into bare `Exception` — all errors must be typed (I4)
- Core packages (`ragaxis.core`, `ragaxis.retrieval`, `ragaxis.synthesis`) import only the Protocol — never a concrete implementation
- Concrete implementations live in `ragaxis.adapters.<provider>` (e.g., `ragaxis.adapters.openai`)

```python
from __future__ import annotations
from typing import Protocol, runtime_checkable, List, Tuple
from ragaxis.core._types import IndexedCorpus, RankedChunk

Vector = List[float]
```

---

## 1. EmbedderAdapter

**Location:** `ragaxis.core._protocols`
**Purpose:** Converts text into dense vector embeddings. Used by the Index Layer (to embed chunks) and the Retrieval Layer (to embed queries).
**Implementations:** `ragaxis.adapters.openai.OpenAIEmbedder`, `ragaxis.adapters.anthropic.AnthropicEmbedder`, `ragaxis.adapters.huggingface.HuggingFaceEmbedder`

```python
@runtime_checkable
class EmbedderAdapter(Protocol):

    async def embed(self, texts: List[str]) -> Tuple[List[Vector], int, int]:
        """
        Embed a batch of texts into dense vectors.

        Args:
            texts: Non-empty list of strings to embed. All strings must be non-empty.

        Returns:
            Tuple of:
                List[Vector]  — One embedding per input text, same order as input.
                                Each vector length must equal get_embedding_dimension().
                int           — tokens_used: total tokens submitted to the provider.
                int           — latency_ms: wall-clock time of the API call in milliseconds.

        Raises:
            EmbeddingError         — Provider call failed or returned unexpected shape.
            RateLimitError         — Provider returned 429 or equivalent.
            TransportError         — Network-level failure after max retries.
        """
        ...

    def get_model_id(self) -> str:
        """
        Return the canonical identifier for this embedding model.

        Returns:
            str — Stable model identifier, e.g. "text-embedding-3-large".
                  Must be consistent across instances of the same model version.
                  This value is stored in Provenance.embedding_model_id and
                  CorpusVersion.embedding_model_id.

        Raises:
            Never. This is a pure metadata accessor.
        """
        ...

    def get_embedding_dimension(self) -> int:
        """
        Return the dimensionality of vectors produced by this model.

        Returns:
            int — Number of floats in each output vector, e.g. 1536 for
                  text-embedding-3-large. Must match CorpusVersion.embedding_dimension.

        Raises:
            Never. This is a pure metadata accessor.
        """
        ...
```

### EmbedderAdapter — Parameters

| Method | Parameter | Type | Description |
| --- | --- | --- | --- |
| `embed` | `texts` | `List[str]` | Batch of texts to embed. Must be non-empty. Each string must be non-empty. |

### EmbedderAdapter — Return Values

| Method | Return | Description |
| --- | --- | --- |
| `embed` | `List[Vector]` | One embedding per input text, in input order |
| `embed` | `int` (tokens_used) | Tokens submitted to the provider for this batch |
| `embed` | `int` (latency_ms) | Wall-clock time of the API call |
| `get_model_id` | `str` | Canonical model identifier stored in provenance |
| `get_embedding_dimension` | `int` | Vector dimensionality for validation |

### EmbedderAdapter — Cost Reporting

Cost is returned inline from `embed()` as `(vectors, tokens_used, latency_ms)`. The caller constructs `Cost(tokens_used=tokens_used, latency_ms=latency_ms, estimated_cost_usd=...)` and embeds it in the result type.

### EmbedderAdapter — Errors

| Error | Condition |
| --- | --- |
| `EmbeddingError` | Provider returned wrong vector shape, empty result, or non-retryable failure |
| `RateLimitError` | Provider returned 429 — adapter should back off and retry before raising |
| `TransportError` | Network timeout or DNS failure after max retries |

### EmbedderAdapter — Example Implementation

```python
# ragaxis/adapters/openai/embedder.py
from ragaxis.core._protocols import EmbedderAdapter
from ragaxis.adapters._errors import RateLimitError, TransportError
from ragaxis.core._errors import EmbeddingError
import time

class OpenAIEmbedder:  # No inheritance — satisfies EmbedderAdapter structurally
    def __init__(self, api_key: str, model: str = "text-embedding-3-large") -> None:
        self._model = model
        self._client = openai.AsyncOpenAI(api_key=api_key)

    async def embed(self, texts: List[str]) -> Tuple[List[Vector], int, int]:
        start = time.monotonic()
        try:
            response = await self._client.embeddings.create(model=self._model, input=texts)
        except openai.RateLimitError as e:
            raise RateLimitError(f"OpenAI rate limit: {e}", context={"model": self._model}) from e
        latency_ms = int((time.monotonic() - start) * 1000)
        vectors = [item.embedding for item in response.data]
        tokens_used = response.usage.total_tokens
        return vectors, tokens_used, latency_ms

    def get_model_id(self) -> str:
        return self._model

    def get_embedding_dimension(self) -> int:
        return 1536  # text-embedding-3-large
```

---

## 2. VectorStoreAdapter

**Location:** `ragaxis.core._protocols`
**Purpose:** Stores indexed corpora and executes vector similarity search. Used by the Index Layer (to persist chunks) and the Retrieval Layer (to search).
**Implementations:** `ragaxis.adapters.pinecone.PineconeVectorStore`, `ragaxis.adapters.weaviate.WeaviateVectorStore`, `ragaxis.adapters.milvus.MilvusVectorStore`

```python
@runtime_checkable
class VectorStoreAdapter(Protocol):

    async def index(self, corpus: IndexedCorpus) -> Tuple[IndexedCorpus, int]:
        """
        Persist an IndexedCorpus to the vector store.

        Args:
            corpus: Fully constructed IndexedCorpus with all chunks and embeddings.
                    Must be frozen (validated by caller before passing in).

        Returns:
            Tuple of:
                IndexedCorpus — The same corpus, unchanged. Returned for pipeline
                                composability; the vector store must not modify it.
                int           — latency_ms: wall-clock time of the indexing operation.

        Raises:
            CorpusVersionError   — Corpus metadata is inconsistent (e.g., duplicate corpus_id
                                   with different embedding model).
            EmbeddingError       — Vector dimension does not match store's configured dimension.
            TransportError       — Network-level failure after max retries.
        """
        ...

    async def search(
        self,
        query: Vector,
        k: int,
        corpus_version: str,
        filters: dict | None = None,
    ) -> Tuple[List[RankedChunk], int, int]:
        """
        Execute a vector similarity search against the indexed corpus.

        Args:
            query:          Query embedding vector. Length must match corpus dimension.
            k:              Maximum number of results to return. Must be > 0.
            corpus_version: corpus_id of the IndexedCorpus to search. Used to scope
                            the search to a specific corpus version.
            filters:        Optional metadata filter dict. Schema is provider-specific.
                            None means no filtering.

        Returns:
            Tuple of:
                List[RankedChunk] — Ranked results, sorted descending by raw_score.
                                    May be shorter than k if fewer matches exist.
                                    May be empty (caller raises EmptyRetrievalError).
                int               — tokens_used: embedding tokens for query (0 if
                                    query embedding was pre-computed by caller).
                int               — latency_ms: wall-clock time of the search call.

        Raises:
            CorpusVersionMismatchError — corpus_version not found in the store.
            EmbedderMismatchError      — Query vector dimension does not match stored dimension.
            TransportError             — Network-level failure after max retries.
        """
        ...

    def validate_corpus_version(self, expected_version: str) -> bool:
        """
        Check whether a corpus with the given corpus_id exists in this store.

        Args:
            expected_version: corpus_id string to check for.

        Returns:
            bool — True if the corpus exists and is queryable, False otherwise.

        Raises:
            TransportError — Cannot reach the store to check.
        """
        ...
```

### VectorStoreAdapter — Parameters

| Method | Parameter | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `index` | `corpus` | `IndexedCorpus` | Yes | Frozen corpus to persist |
| `search` | `query` | `Vector` | Yes | Pre-computed query embedding |
| `search` | `k` | `int` | Yes | Max results to return; `> 0` |
| `search` | `corpus_version` | `str` | Yes | `corpus_id` scoping the search |
| `search` | `filters` | `dict \| None` | No | Provider-specific metadata filters |
| `validate_corpus_version` | `expected_version` | `str` | Yes | `corpus_id` to check |

### VectorStoreAdapter — Return Values

| Method | Return | Description |
| --- | --- | --- |
| `index` | `IndexedCorpus` | Unchanged input corpus (pass-through) |
| `index` | `int` (latency_ms) | Wall-clock time of the indexing operation |
| `search` | `List[RankedChunk]` | Ranked results; may be empty |
| `search` | `int` (tokens_used) | Query embedding tokens (0 if pre-computed by caller) |
| `search` | `int` (latency_ms) | Wall-clock time of the search call |
| `validate_corpus_version` | `bool` | `True` if corpus exists and is queryable |

### VectorStoreAdapter — Cost Reporting

`search()` returns `(chunks, tokens_used, latency_ms)` inline. The Retrieval Layer assembles `Cost(tokens_used=tokens_used, latency_ms=latency_ms, estimated_cost_usd=...)` for `RetrievalResult.cost_report`.

`index()` returns `(corpus, latency_ms)`. The Index Layer assembles `Cost` for `IndexedCorpus.cost_report` using the latency plus tokens from the preceding `EmbedderAdapter.embed()` call.

### VectorStoreAdapter — Errors

| Error | Condition |
| --- | --- |
| `CorpusVersionError` | Duplicate corpus_id with conflicting metadata during `index()` |
| `CorpusVersionMismatchError` | `corpus_version` not found in store during `search()` |
| `EmbedderMismatchError` | Query vector dimension ≠ stored corpus dimension |
| `EmbeddingError` | Chunk vector dimension ≠ store's configured dimension during `index()` |
| `TransportError` | Network failure after max retries |

### VectorStoreAdapter — Example Implementation

```python
# ragaxis/adapters/pinecone/vector_store.py
from ragaxis.core._protocols import VectorStoreAdapter
from ragaxis.core._types import IndexedCorpus, RankedChunk, Provenance, ConfidenceUnknown

class PineconeVectorStore:  # No inheritance — structural compliance only
    def __init__(self, api_key: str, index_name: str) -> None:
        self._index_name = index_name
        self._client = pinecone.Pinecone(api_key=api_key)

    async def index(self, corpus: IndexedCorpus) -> Tuple[IndexedCorpus, int]:
        start = time.monotonic()
        index = self._client.Index(self._index_name)
        vectors = [
            {"id": chunk.id, "values": chunk.embedding, "metadata": chunk.metadata}
            for chunk in corpus.chunks
        ]
        await index.upsert(vectors=vectors, namespace=corpus.corpus_id)
        latency_ms = int((time.monotonic() - start) * 1000)
        return corpus, latency_ms

    async def search(
        self,
        query: Vector,
        k: int,
        corpus_version: str,
        filters: dict | None = None,
    ) -> Tuple[List[RankedChunk], int, int]:
        start = time.monotonic()
        index = self._client.Index(self._index_name)
        response = await index.query(
            vector=query, top_k=k, namespace=corpus_version,
            filter=filters, include_metadata=True,
        )
        latency_ms = int((time.monotonic() - start) * 1000)
        ranked = [
            RankedChunk(
                chunk_id=match.id,
                text=match.metadata["text"],
                raw_score=match.score,
                confidence=match.score,  # provider score used directly
                rank=i + 1,
                provenance=Provenance(**match.metadata["provenance"]),
            )
            for i, match in enumerate(response.matches)
        ]
        return ranked, 0, latency_ms  # tokens_used=0 (query pre-embedded by caller)

    def validate_corpus_version(self, expected_version: str) -> bool:
        stats = self._client.Index(self._index_name).describe_index_stats()
        return expected_version in stats.namespaces
```

---

## 3. LLMAdapter

**Location:** `ragaxis.core._protocols`
**Purpose:** Executes LLM completions. Used by the Synthesis Layer for answer generation.
**Implementations:** `ragaxis.adapters.openai.OpenAILLM`, `ragaxis.adapters.anthropic.AnthropicLLM`

```python
@runtime_checkable
class LLMAdapter(Protocol):

    async def complete(
        self,
        prompt: str,
        max_tokens: int,
        temperature: float = 0.0,
    ) -> Tuple[str, int, int, int]:
        """
        Execute a single-turn LLM completion.

        Args:
            prompt:     Fully assembled prompt string including system instruction,
                        context, and user query. The Synthesis Layer is responsible
                        for prompt assembly; this method only executes it.
            max_tokens: Maximum tokens in the completion. Must be > 0.
            temperature: Sampling temperature. 0.0 = deterministic. Default: 0.0.

        Returns:
            Tuple of:
                str — completion: The generated text. Never empty (raises GenerationError
                                  if the model returns an empty completion).
                int — prompt_tokens: Tokens consumed by the prompt.
                int — completion_tokens: Tokens in the completion.
                int — latency_ms: Wall-clock time of the API call in milliseconds.

        Raises:
            GenerationError    — Model returned empty completion, refused the prompt,
                                 or returned a malformed response.
            ContextLengthError — Prompt token count exceeds the model's context window.
            RateLimitError     — Provider returned 429 or equivalent.
            TransportError     — Network-level failure after max retries.
        """
        ...

    def get_model_id(self) -> str:
        """
        Return the canonical identifier for this LLM.

        Returns:
            str — Stable model identifier, e.g. "gpt-4o" or "claude-sonnet-4-6".
                  Stored in PipelineResult.generation_metadata["llm_model"] and
                  RunResult.reproducibility_metadata["llm_model_id"].

        Raises:
            Never. This is a pure metadata accessor.
        """
        ...
```

### LLMAdapter — Parameters

| Method | Parameter | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `complete` | `prompt` | `str` | Yes | Fully assembled prompt. Must be non-empty. |
| `complete` | `max_tokens` | `int` | Yes | Completion length cap. `> 0`. |
| `complete` | `temperature` | `float` | No | Sampling temperature. Default `0.0`. Range `[0.0, 2.0]`. |

### LLMAdapter — Return Values

| Method | Return | Description |
| --- | --- | --- |
| `complete` | `str` (completion) | Generated text. Never empty string. |
| `complete` | `int` (prompt_tokens) | Tokens consumed by the prompt |
| `complete` | `int` (completion_tokens) | Tokens in the generated completion |
| `complete` | `int` (latency_ms) | Wall-clock time of the API call |
| `get_model_id` | `str` | Canonical model identifier for reproducibility metadata |

### LLMAdapter — Cost Reporting

`complete()` returns `(completion, prompt_tokens, completion_tokens, latency_ms)` inline. The Synthesis Layer assembles:

```python
tokens_used = prompt_tokens + completion_tokens
cost = Cost(
    tokens_used=tokens_used,
    latency_ms=latency_ms,
    estimated_cost_usd=_calculate_cost(model_id, prompt_tokens, completion_tokens),
)
```

This cost is embedded in `PipelineResult.cost_report` (I7).

### LLMAdapter — Errors

| Error | Condition |
| --- | --- |
| `GenerationError` | Empty completion, refused prompt, malformed response |
| `ContextLengthError` | `prompt` exceeds the model's context window — do not retry without reducing prompt |
| `RateLimitError` | Provider 429 — adapter implements retry with backoff before raising |
| `TransportError` | Network failure after max retries |

### LLMAdapter — Example Implementation

```python
# ragaxis/adapters/anthropic/llm.py
from ragaxis.core._protocols import LLMAdapter
from ragaxis.adapters._errors import RateLimitError, ContextLengthError, TransportError
from ragaxis.synthesis._errors import GenerationError
import anthropic, time

class AnthropicLLM:  # No inheritance — structural compliance only
    def __init__(self, api_key: str, model: str = "claude-sonnet-4-6") -> None:
        self._model = model
        self._client = anthropic.AsyncAnthropic(api_key=api_key)

    async def complete(
        self,
        prompt: str,
        max_tokens: int,
        temperature: float = 0.0,
    ) -> Tuple[str, int, int, int]:
        start = time.monotonic()
        try:
            response = await self._client.messages.create(
                model=self._model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}],
            )
        except anthropic.RateLimitError as e:
            raise RateLimitError(f"Anthropic rate limit: {e}", context={"model": self._model}) from e
        except anthropic.BadRequestError as e:
            if "context_length" in str(e).lower():
                raise ContextLengthError(f"Prompt too long: {e}", context={"model": self._model}) from e
            raise GenerationError(f"Generation failed: {e}", context={"model": self._model}) from e
        latency_ms = int((time.monotonic() - start) * 1000)
        completion = response.content[0].text
        if not completion:
            raise GenerationError(
                "Model returned empty completion",
                context={"model": self._model, "stop_reason": response.stop_reason},
            )
        return (
            completion,
            response.usage.input_tokens,
            response.usage.output_tokens,
            latency_ms,
        )

    def get_model_id(self) -> str:
        return self._model
```

---

## Protocol Compliance Verification

At runtime, use `isinstance` to verify protocol compliance before accepting an adapter:

```python
from ragaxis.core._protocols import EmbedderAdapter, VectorStoreAdapter, LLMAdapter

def validate_adapters(
    embedder: object,
    vector_store: object,
    llm: object,
) -> None:
    if not isinstance(embedder, EmbedderAdapter):
        raise ConfigurationError(
            f"embedder does not satisfy EmbedderAdapter protocol: {type(embedder)}",
            context={"type": str(type(embedder))},
        )
    if not isinstance(vector_store, VectorStoreAdapter):
        raise ConfigurationError(
            f"vector_store does not satisfy VectorStoreAdapter protocol: {type(vector_store)}",
            context={"type": str(type(vector_store))},
        )
    if not isinstance(llm, LLMAdapter):
        raise ConfigurationError(
            f"llm does not satisfy LLMAdapter protocol: {type(llm)}",
            context={"type": str(type(llm))},
        )
```

---

## Adapter Summary

| Protocol | Location | Methods | Implementations |
| --- | --- | --- | --- |
| `EmbedderAdapter` | `ragaxis.core._protocols` | `embed`, `get_model_id`, `get_embedding_dimension` | `OpenAIEmbedder`, `AnthropicEmbedder`, `HuggingFaceEmbedder` |
| `VectorStoreAdapter` | `ragaxis.core._protocols` | `index`, `search`, `validate_corpus_version` | `PineconeVectorStore`, `WeaviateVectorStore`, `MilvusVectorStore` |
| `LLMAdapter` | `ragaxis.core._protocols` | `complete`, `get_model_id` | `OpenAILLM`, `AnthropicLLM` |

## Invariant Checklist for Adapters

| Invariant | Check |
| --- | --- |
| I4 (Typed Errors) | Every provider exception is caught and re-raised as a named `RagAxisError` subclass |
| I5 (No Provider Dependencies in Core) | `ragaxis.core._protocols` imports no provider SDK — only stdlib and `ragaxis.core._types` |
| I7 (Cost Native) | Every adapter method returns cost data inline — no logging, no side channels |
