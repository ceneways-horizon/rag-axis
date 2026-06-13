---
sidebar_position: 7
title: FAQ
---

# FAQ

### How is RAG Axis different from LangChain or LlamaIndex?

LangChain and LlamaIndex prioritize rapid prototyping and broad provider coverage. RAG Axis prioritizes production correctness: every failure mode is a named type, every result carries a `CostReport`, and adapter boundaries are `typing.Protocol` contracts rather than class inheritance. See [Why Not LangChain](/docs/getting-started/why-not-langchain) for the full comparison.

### What happens when retrieval finds nothing relevant?

RAG Axis raises `EmptyRetrievalError` with a corpus coverage signal, rather than letting the LLM fabricate an answer from no context. See [RAG Failure Modes](/docs/concepts/failure-modes) for this and the other six failure classifications RAG Axis names.

### How does RAG Axis track cost?

Every `PipelineResult` carries a `CostReport` with tokens consumed, latency, and estimated cost broken down per stage (retrieval, reranking, context assembly, generation). This is part of the core return type, not an optional logging feature. See [Cost Accountability](/docs/concepts/cost-accountability).

### Can I use my own LLM, embedding, or vector store provider?

Yes. `LLMAdapter`, `EmbedderAdapter`, and `VectorStoreAdapter` are `typing.Protocol` classes. Implement the required methods on any class, with no inheritance required, and pass it to your pipeline. See [Building a Custom Adapter](/docs/guides/building-custom-adapter).

### What happens if context assembly has to drop a chunk to fit the token budget?

Context assembly emits a `ContextTruncationEvent` describing what was dropped and why, rather than truncating silently. This is invariant I2, and it cannot be disabled.

### Is RAG Axis stable enough for production today?

RAG Axis is pre-alpha (v0.0.1) with the architecture locked and core types in active development. The invariants and Protocol contracts are stable, but the public API surface of most packages is still settling. Check the package build order in the project README for what is currently available.
