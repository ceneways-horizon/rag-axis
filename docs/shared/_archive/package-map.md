---
title: "Package Map"
description: "Complete sub-package dependency graph and build order."
---

# Package Map

Built and consumed in system-building order.

## Phase 0 — Foundation

| Package | Responsibility |
|---|---|
| `rag_axis.core` | Document, Chunk, RetrievalResult, CostReport, ContextBudget, PipelineResult, named error types |
| `rag_axis.adapters` | LLMAdapter, EmbedderAdapter, VectorStoreAdapter Protocols + reference implementations |

## Phase 1 — Pre-Retrieval

| Package | Responsibility |
|---|---|
| `rag_axis.ingestion` | Loaders, parsers, metadata extraction, document registry |
| `rag_axis.chunking` | Fixed, semantic, structural, parent-child strategies |
| `rag_axis.embedding` | Batch embedding, cost tracking, model version lock |

## Phase 2 — Retrieval Core

| Package | Responsibility |
|---|---|
| `rag_axis.retrieval` | Dense, sparse, hybrid RRF, metadata filters |
| `rag_axis.reranking` | Cross-encoder, score normalisation, ScoreCollapseWarning |
| `rag_axis.context` | Budget enforcement, truncation, deduplication, ordering, provenance |
| `rag_axis.generation` | Prompt assembly, LLM call, output parsing, citation injection |

## Phase 3 — System Layer

| Package | Responsibility |
|---|---|
| `rag_axis.guards` | Input guards, output guards, fallback strategies |
| `rag_axis.cache` | Semantic cache, exact cache, embedding cache |
| `rag_axis.telemetry` | OTel spans, cost aggregation, structlog |
| `rag_axis.bench` | Eval hooks, RAGAS, DeepEval, TruLens bridges, drift detection |

## Phase 4 — Advanced

| Package | Responsibility |
|---|---|
| `rag_axis.corpus` | Versioning, staleness, incremental updates, embedding model migration |
| `rag_axis.knowledge` | GraphRAG, entity extraction, multi-hop traversal |

## Dependency Rules
rag_axis.core aiprims.rag + aiprims.core + pydantic only
rag_axis.adapters rag_axis.core
rag_axis.retrieval rag_axis.core + rag_axis.adapters
rag_axis.reranking rag_axis.core + rag_axis.retrieval
rag_axis.context rag_axis.core + rag_axis.retrieval
rag_axis.generation rag_axis.core + rag_axis.adapters
rag_axis.bench rag_axis.core only
rag_axis.telemetry rag_axis.core

```
One-way. No circular imports. No exceptions.
```
