---
sidebar_position: 3
title: Composing Layers
---

# Composing Layers

The default pipelines provided by `ragaxis.ldk` are a starting point, not the only way to assemble RAG Axis. Each of the three operational layers (Index, Retrieval, Synthesis) can be configured or replaced independently, as long as the types crossing each boundary still satisfy the contracts described in [The Three Layers](/docs/concepts/layers).

## Configuring the Index Layer

```python
from ragaxis.chunking import SemanticChunker
from ragaxis.embedding import BatchEmbedder

chunker = SemanticChunker(max_chunk_tokens=512, overlap_tokens=64)
embedder = BatchEmbedder(model="text-embedding-3-large")
```

Swapping `SemanticChunker` for `StructuralChunker` or `ParentChildChunker` changes how documents are split, but every chunker still produces `Chunk` objects with `parent_doc_id` and `position` set, per invariant I1.

## Configuring the Retrieval Layer

```python
from ragaxis.retrieval import HybridRetriever
from ragaxis.reranking import CrossEncoderReranker

retriever = HybridRetriever(store=store, rrf_k=60)
reranker = CrossEncoderReranker(model="cross-encoder/ms-marco-MiniLM-L-6-v2")
```

The reranker consumes the `RetrievalResult` produced by the retriever and returns a new `RetrievalResult` with reordered chunks and normalized scores. If the reranked scores collapse into a narrow range, a `ScoreCollapseWarning` is attached to the result.

## Configuring the Synthesis Layer

```python
from ragaxis.context import ContextBudget
from ragaxis.generation import PromptTemplate, generate

budget = ContextBudget(max_tokens=4000, reserve_for_response=1000)
template = PromptTemplate.from_file("prompts/answer.j2")

result = generate(query=query, context=context, template=template, budget=budget)
```

## Wiring It Together

```python
from ragaxis.ldk import build_pipeline

pipeline = build_pipeline(
    chunker=chunker,
    embedder=embedder,
    retriever=retriever,
    reranker=reranker,
    context_budget=budget,
    prompt_template=template,
)
```

`build_pipeline` accepts any combination of layer components, as long as each component satisfies the relevant Protocol or produces the expected result type. Components left unspecified fall back to the same defaults used by `default_pipeline()` in [Example: Basic RAG](/docs/examples/basic-rag).
