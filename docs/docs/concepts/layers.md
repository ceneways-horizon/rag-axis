---
sidebar_position: 2
title: The Three Layers
---

# The Three Layers

RAG Axis organizes every sub-package into one of three operational layers: Index (pre-retrieval), Retrieval, and Synthesis. Each layer has its own latency budget, failure consequence, and contract with the layers around it.

The **Index layer** runs offline, before any query arrives. It covers ingestion, chunking, embedding, and corpus management. A failure here does not raise an error; it degrades answer quality silently over time, for example through a stale corpus or a mismatched embedding model.

The **Retrieval layer** runs on the live query path, with a latency budget of 200ms to 2 seconds. It covers query processing, dense and sparse retrieval, reranking, and context assembly. Failures here are immediate and visible: empty retrieval, score collapse, or context that does not fit the budget.

The **Synthesis layer** covers generation, output parsing, and citation injection. It takes the assembled context and produces the final `PipelineResult`, including the `CostReport` that accounts for every stage that ran before it.

Each layer's contract is defined by the types it accepts and returns. The Index layer produces embedded chunks with provenance. The Retrieval layer consumes a query and produces a `RetrievalResult` with a confidence signal. The Synthesis layer consumes assembled context and produces a `PipelineResult`. Because these contracts are typed and immutable, each layer can be developed, tested, and replaced independently, see [RAG System Layers](./rag-system-layers.md) for the full operational model behind this split.
