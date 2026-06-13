---
sidebar_position: 4
title: "Example: Custom Adapters"
---

# Example: Custom Adapters

This example wires a custom `EmbedderAdapter` and `VectorStoreAdapter` into a pipeline, in place of the reference implementations used in [Example: Basic RAG](./basic-rag.md).

```python
from ragaxis.core import Chunk
from ragaxis.adapters import EmbedderAdapter, VectorStoreAdapter


class MyEmbedder:
    """Implements the EmbedderAdapter protocol structurally."""

    model_id = "my-embedder-v1"

    def embed(self, texts: list[str]) -> list[list[float]]:
        return [self._encode(text) for text in texts]

    def _encode(self, text: str) -> list[float]:
        ...


class MyVectorStore:
    """Implements the VectorStoreAdapter protocol structurally."""

    def upsert(self, chunks: list[Chunk]) -> None:
        ...

    def search(self, vector: list[float], top_k: int) -> list[Chunk]:
        ...
```

Because `EmbedderAdapter` and `VectorStoreAdapter` are `typing.Protocol` classes, `MyEmbedder` and `MyVectorStore` do not need to inherit from anything in RAG Axis. As long as they implement the required methods with matching signatures, they satisfy the protocol and can be passed directly to a pipeline:

```python
from ragaxis.ldk import build_pipeline

pipeline = build_pipeline(
    embedder=MyEmbedder(),
    vector_store=MyVectorStore(),
)
```

See [Building a Custom Adapter](/docs/guides/building-custom-adapter) for the full guide, including the error types your adapter is expected to raise.
