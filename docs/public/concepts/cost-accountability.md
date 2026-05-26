# Cost Accountability

## The Problem

Without cost visibility, engineers cannot make quality-cost tradeoffs.
Without per-stage cost tracking, engineers cannot identify which stage
is responsible for cost explosions.

Common anti-pattern: increasing top-k to improve retrieval quality
without realising it drives quadratic LLM context processing costs.
No mainstream RAG library surfaces this until after the bill arrives.

## The rag-axis Approach

Every pipeline result carries a CostReport. This is not a logging feature.
It is part of the core return type.

CostReport contains:
- tokens_consumed per stage (retrieval, reranking, context assembly, generation)
- latency_ms per stage
- estimated_cost_gbp (configurable currency)
- total_tokens
- cache_hit (bool — was this query served from cache)

## Why Per-Stage

Aggregate cost per query is insufficient.
Per-stage cost tells you:
- Whether reranking a large candidate set is worth the latency
- Whether your chunking strategy is producing oversized chunks
- Whether semantic caching would pay for itself at your query volume

## Non-Optional

CostReport is non-optional because optional cost tracking
is cost tracking that does not exist in production.
