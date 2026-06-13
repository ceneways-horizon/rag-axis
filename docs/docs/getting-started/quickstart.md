---
sidebar_position: 2
title: Quickstart
---

# Quickstart

This page takes you from a fresh install to your first `PipelineResult` in about five minutes using `ragaxis.ldk`, the launch development kit of pre-wired components.

## 1. Install RAG Axis

```bash
uv pip install "ragaxis[ldk]"
```

See [Installation](./installation.md) for details on extras and supported Python versions.

## 2. Configure Adapters

RAG Axis needs an `LLMAdapter`, an `EmbedderAdapter`, and a `VectorStoreAdapter`. The LDK provides reference implementations so you can get started without writing your own:

```python
from ragaxis.ldk import default_pipeline

pipeline = default_pipeline(
    llm_model="gpt-4o-mini",
    embedding_model="text-embedding-3-small",
)
```

## 3. Ingest a Document

```python
from ragaxis.core import Document

doc = Document(
    id="doc-1",
    text="RAG Axis treats every failure mode as a named, typed result.",
    metadata={"source": "readme"},
)

pipeline.ingest([doc])
```

## 4. Run a Query

```python
result = pipeline.run("What does RAG Axis do with failure modes?")

print(result.answer)
print(result.cost_report)
```

`result` is a `PipelineResult`. It carries the generated answer, the retrieved chunks with provenance, and a `CostReport` with per-stage tokens, latency, and estimated cost.

## Next Steps

- Walk through a complete pipeline in [Your First RAG](./your-first-rag.md)
- Read [What is RAG Axis](./what-is-rag-axis.md) for the guarantees behind these results
- Browse the [API Reference](/docs/api-reference/overview) for the full surface of each package
