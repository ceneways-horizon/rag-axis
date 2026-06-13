---
sidebar_position: 2
title: Building a Custom Adapter
---

# Building a Custom Adapter

RAG Axis defines three adapter contracts as `typing.Protocol` classes with `runtime_checkable`: `LLMAdapter`, `EmbedderAdapter`, and `VectorStoreAdapter`. Implementations are structural, you do not inherit from any RAG Axis base class, you simply implement the required methods with matching signatures.

## Implementing an EmbedderAdapter

```python
from ragaxis.adapters import EmbedderAdapter

class MyEmbedder:
    model_id: str = "my-embedder-v1"

    def embed(self, texts: list[str]) -> list[list[float]]:
        ...
```

## Implementing a VectorStoreAdapter

```python
from ragaxis.core import Chunk

class MyVectorStore:
    def upsert(self, chunks: list[Chunk]) -> None:
        ...

    def search(self, vector: list[float], top_k: int) -> list[Chunk]:
        ...
```

## Implementing an LLMAdapter

```python
class MyLLM:
    model_id: str = "my-llm-v1"

    def generate(self, prompt: str, max_tokens: int) -> str:
        ...
```

## Error Handling (Invariant I4)

Per invariant I4, no adapter may suppress a provider error into a generic `Exception`. Your adapter must catch provider-specific errors and re-raise them as one of the following typed errors:

- `RateLimitError`: the provider rejected the request due to rate limiting
- `ContextLengthError`: the request exceeded the provider's context window
- `ProviderSchemaError`: the provider returned a response that does not match the expected schema
- `TransportError`: the request failed at the network or transport level

```python
from ragaxis.core.errors import RateLimitError, TransportError

class MyLLM:
    def generate(self, prompt: str, max_tokens: int) -> str:
        try:
            return self._client.complete(prompt, max_tokens=max_tokens)
        except ProviderRateLimited as exc:
            raise RateLimitError(str(exc)) from exc
        except ConnectionError as exc:
            raise TransportError(str(exc)) from exc
```

## Verifying Your Adapter

Because the Protocols are `runtime_checkable`, you can verify structural conformance at runtime:

```python
from ragaxis.adapters import EmbedderAdapter

assert isinstance(MyEmbedder(), EmbedderAdapter)
```

A conforming adapter can be passed directly to any RAG Axis pipeline, as shown in [Example: Custom Adapters](/docs/examples/with-adapters).
