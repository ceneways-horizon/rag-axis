---
sidebar_position: 8
title: Using the LDK
---

# Using the LDK

`ragaxis.ldk` (the launch development kit) provides pre-wired components so you can get a working RAG pipeline running without configuring every adapter and layer manually. It is the fastest path from install to a working `PipelineResult`, used throughout [Quickstart](/docs/getting-started/quickstart) and [Example: Basic RAG](/docs/examples/basic-rag).

## default_pipeline()

```python
from ragaxis.ldk import default_pipeline

pipeline = default_pipeline()
```

This returns a pipeline using an in-memory vector store, reference LLM and embedding adapters, and the default chunking, retrieval, and context assembly configuration described in [The Three Layers](/docs/concepts/layers). It requires no external services and is suitable for local development, testing, and the examples in this documentation.

## build_pipeline()

```python
from ragaxis.ldk import build_pipeline

pipeline = build_pipeline(
    embedder=MyEmbedder(),
    vector_store=MyVectorStore(),
)
```

`build_pipeline` accepts any combination of layer components. Anything you do not specify falls back to the same defaults as `default_pipeline()`. This is the recommended entry point once you start replacing individual components, as shown in [Composing Layers](./composing-layers.md).

## When to Move Beyond the LDK

The LDK is a convenience layer over the same typed contracts used everywhere else in RAG Axis. There is no point at which you are forced to "graduate" away from it, every component it wires together is the same `ragaxis.retrieval`, `ragaxis.context`, and `ragaxis.generation` code you would use directly. Most production deployments continue to use `build_pipeline()` with a full set of explicitly configured adapters and layer components.
