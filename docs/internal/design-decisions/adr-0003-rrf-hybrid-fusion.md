# ADR-0003: Reciprocal Rank Fusion as Default Hybrid Retrieval Strategy

## Status
Accepted

## Context
Production RAG systems consistently outperform single-strategy retrieval
when combining dense vector search (semantic similarity) with sparse
keyword search (BM25/SPLADE). The fusion method determines result quality.
Multiple fusion strategies exist: linear score combination, CombSUM,
CombMNZ, and Reciprocal Rank Fusion (RRF).

## Decision
RRF is the default hybrid fusion strategy in rag_axis.retrieval.
RRF formula: score(d) = Σ 1/(k + rank(d)) where k=60 by default.
Both dense and sparse stream scores are exposed in every RetrievalResult.
Users can override fusion strategy via RetrievalConfig.

## Consequences
- RRF is robust to score scale differences between dense and sparse streams
- No score normalisation required before fusion
- Both stream scores visible for debugging and evaluation
- k parameter is configurable for domain-specific tuning

## Alternatives Considered
- **Linear score combination**: Rejected. Requires calibrated score normalisation
  across streams with different scales. Brittle in practice.
- **Dense-only retrieval**: Rejected. Misses keyword-heavy queries consistently.
- **Sparse-only retrieval**: Rejected. Misses semantic similarity entirely.
