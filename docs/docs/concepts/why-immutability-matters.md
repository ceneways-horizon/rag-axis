---
sidebar_position: 7
title: Why Immutability Matters
---

# Why Immutability Matters

Every result object that crosses a stage boundary in RAG Axis is immutable after construction (invariant I7). Document, Chunk, CostReport, RetrievalResult, and PipelineResult cannot be modified once they are returned.

This matters for two reasons. First, it makes runs reproducible: the object a caller logs, serializes, or passes to the next stage is guaranteed to be the exact object that stage produced, with no risk of a later step mutating a field and silently invalidating an earlier observation. Second, it prevents a class of bugs where one stage's debugging or post-processing code accidentally changes a value that a different stage already relied on, for example adjusting a chunk's score in place after reranking and corrupting the audit trail of how that score was derived.

Frozen dataclasses enforce this at the type level. Any attempt to set an attribute on a frozen instance raises `FrozenInstanceError` immediately, rather than allowing a quiet mutation that only surfaces as a confusing downstream symptom. Combined with typed, per-stage results, immutability is what allows a `PipelineResult` and its `CostReport` to be trusted as an accurate record of exactly what happened during a run.
