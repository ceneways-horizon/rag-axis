---
sidebar_position: 1
title: API Reference Overview
---

# API Reference Overview

This section documents the public API of each RAG Axis package. Every package follows the same conventions described in [Pydantic Usage Boundaries](/docs/concepts/pydantic-boundaries) and the [invariants checklist](/docs/concepts/invariants-explained): immutable result objects, typed adapters, and explicit error types.

- **[Core](./core.md)**: the foundational types, including Document, Chunk, RetrievalResult, CostReport, ContextBudget, PipelineResult, and the named error taxonomy.
- **[Retrieval](./retrieval.md)**: query execution, dense and sparse retrieval, hybrid RRF fusion, and the RetrievalResult type.
- **[Synthesis](./synthesis.md)**: context assembly, generation, output parsing, and the PipelineResult type.
- **[Adapters](./adapters.md)**: the LLMAdapter, EmbedderAdapter, and VectorStoreAdapter Protocols, plus reference implementations.
- **[System](./system.md)**: system-layer orchestration, RunResult, telemetry, and evaluation hooks.
- **[Server](./server.md)**: the REST API exposed by ragaxis.server for deploying RAG Axis as a standalone service.

If a package is not yet listed here, it has not reached the part of the build order described in the project's package build order and does not yet have a stable public API.
