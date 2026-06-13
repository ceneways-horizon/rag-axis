---
sidebar_position: 5
title: Your First RAG
---

# Your First RAG

This walkthrough builds a small retrieval pipeline from scratch using the core RAG Axis packages, then inspects the resulting `RunResult` in detail.

## 1. Ingest a Document

```python
from ragaxis.core import Document
from ragaxis.ingestion import load_document

doc = load_document("notes/architecture.md")
```

`load_document` returns a frozen `Document` with metadata such as source path and content hash already populated.

## 2. Chunk It

```python
from ragaxis.chunking import StructuralChunker

chunker = StructuralChunker()
chunks = chunker.split(doc)
```

Each `Chunk` carries `parent_doc_id`, `position`, and (once embedded) `embedding_model_id`, per invariant I1. This provenance is what lets RAG Axis trace a generated answer back to its source.

## 3. Embed and Index

```python
from ragaxis.embedding import BatchEmbedder
from ragaxis.adapters.reference import InMemoryVectorStore

embedder = BatchEmbedder(model="text-embedding-3-small")
embedded = embedder.embed(chunks)

store = InMemoryVectorStore()
store.upsert(embedded)
```

The `BatchEmbedder` records the embedding model version on every chunk, so a later mismatch between index time and query time raises `EmbeddingModelMismatchError` instead of failing silently.

## 4. Retrieve

```python
from ragaxis.retrieval import HybridRetriever

retriever = HybridRetriever(store=store)
result = retriever.query("How does RAG Axis assign chunk provenance?")
```

`result` is a `RetrievalResult`. It always carries a confidence signal, either a score or `ConfidenceUnknown`, per invariant I3.

## 5. Assemble Context and Generate

```python
from ragaxis.context import ContextBudget, assemble
from ragaxis.generation import generate

budget = ContextBudget(max_tokens=4000)
context = assemble(result.chunks, budget=budget)

run_result = generate(query=result.query, context=context)
```

If any chunk had to be dropped to fit the budget, `assemble` emits a `ContextTruncationEvent` rather than dropping it silently, per invariant I2.

## 6. Inspect the RunResult

```python
print(run_result.answer)
print(run_result.cost_report.tokens_consumed)
print(run_result.cost_report.estimated_cost_gbp)
print(run_result.cost_report.latency_ms)
```

Every field on `run_result` is immutable after construction (invariant I7). The `cost_report` breaks down tokens, latency, and estimated cost per stage, so you can see exactly where a query spent its time and budget.

## Next Steps

- Read [RAG System Layers](/docs/concepts/rag-system-layers) to understand where each of these steps fits
- Read [Cost Accountability](/docs/concepts/cost-accountability) for how `CostReport` is structured
- See [Composing Layers](/docs/guides/composing-layers) for configuring this pipeline beyond the defaults
