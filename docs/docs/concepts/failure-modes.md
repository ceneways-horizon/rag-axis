---
sidebar_position: 3
title: RAG Failure Modes
---

# RAG Failure Modes

Seven failure classifications documented in production deployments.
RAG Axis makes each one a named, catchable type.

## Missing Content
The correct document does not exist in the corpus.
The model fabricates a plausible answer.
**RAG Axis response**: EmptyRetrievalError with corpus coverage signal.

## Missed Top-K
The correct chunk is indexed but scored too low to survive the top-k cutoff.
The system behaves as if the data is missing.
**RAG Axis response**: BelowThresholdRetrieval with highest_score exposed.

## Out-of-Context Chunk
The chunk is retrieved but the chunking algorithm severed semantic dependencies.
The LLM misinterprets the isolated fragment.
**RAG Axis response**: Chunk provenance (position, parent doc) mandatory via I1.

## Not Extracted
The relevant context is retrieved and injected but the LLM ignores it.
Lost-in-the-middle syndrome.
**RAG Axis response**: Context ordering strategy in ragaxis.context.

## Wrong Format
The LLM ignores output schema constraints.
Downstream services crash on unparseable payloads.
**RAG Axis response**: Schema-enforced output parsing in ragaxis.generation.

## Incorrect Specificity
The response is factually accurate but misaligned with user intent.
**RAG Axis response**: Intent classification hook in query processing.

## Incomplete Generation
The response addresses only part of a multi-intent query.
**RAG Axis response**: Multi-intent decomposition in query processing.

## Silent Failures
The most dangerous class. HTTP 200, normal latency, confident but wrong answer.
Caused by relevance drift, knowledge staleness, and embedding model mismatch.
**RAG Axis response**: corpus_version, content_age_days, EmbeddingModelMismatchError,
and ScoreCollapseWarning are all mandatory signals, never optional.
