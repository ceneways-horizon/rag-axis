# rag-axis — Architecture

> rag-axis is the production contract layer for RAG systems.
> It makes every retrieval decision explicit, every failure mode named,
> every cost visible, and every context assembly traceable.

---

## Table of Contents

1. [Mission](#mission)
2. [What This Is Not](#what-this-is-not)
3. [System Model](#system-model)
4. [Design Principles](#design-principles)
5. [Invariants](#invariants)
6. [Package Map](#package-map)
7. [Dependency Rules](#dependency-rules)
8. [Pydantic Usage Contract](#pydantic-usage-contract)
9. [Relationship to aiprims](#relationship-to-aiprims)
10. [Non-Goals](#non-goals)
11. [Versioning Contract](#versioning-contract)
12. [Architecture Decision Records](#architecture-decision-records)

---

## Mission

Every production RAG system fails in the same ways:
silent retrieval degradation, embedding model mismatch,
untracked cost explosions, and context assembly that drops
critical information without logging it.

rag-axis does not abstract these problems.
It makes them impossible to hide.

---

## What This Is Not

- Not a LangChain replacement by feature parity
- Not a beginner library
- Not a multi-agent orchestration framework
- Not a UI, dashboard, or deployment wrapper
- Not solving LLM-intrinsic hallucination
- Not auto-configuring anything

If a feature does not make a failure mode explicit
or a production constraint enforceable,
it does not belong in rag-axis.

---

## System Model

A complete RAG system has three operational layers.
Every rag-axis sub-package belongs to exactly one.

```
┌─────────────────────────────────────────────┐
│ PRE-RETRIEVAL │
│ Offline. Async. Failure = silent quality │
│ degradation, not user-facing errors. │
│ │
│ ingestion → chunking → embedding │
│ → indexing → corpus management │
└─────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────┐
│ RETRIEVAL CORE │
│ Online. Real-time. Every ms is │
│ user-facing. Latency budget: 200ms–2s. │
│ │
│ retrieval → reranking → context │
│ → generation → guards │
└─────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────┐
│ SYSTEM LAYER │
│ Continuous. Background. Failure = │
│ invisible rot. No direct latency impact │
│ but compounds cost and quality over time. │
│ │
│ cache → telemetry → bench → corpus │
└─────────────────────────────────────────────┘
Cross-cutting (belong to all three layers):
core · adapters · knowledge
```

---

## Design Principles

These are non-negotiable.
Every feature request is evaluated against all six.
If a proposed feature violates one, it is rejected.

**P1 — Zero Silent Failures**
Every failure mode has a name and a type.
`EmptyRetrievalError`, `EmbeddingModelMismatchError`,
`ContextBudgetExceededError`, `ScoreCollapseWarning`
are first-class citizens.
An HTTP 200 that returns wrong content is not a success.

**P2 — Cost Is Not Optional Instrumentation**
Every result object carries a `CostReport`:
tokens consumed per stage, latency per stage, estimated cost.
This is part of the core return type.
It is not a logging feature.

**P3 — Explicit Over Magic**
No hidden routing. No undocumented base class behaviour.
No auto-configuration.
Every pipeline step is a function the user can read,
modify, and reason about independently.

**P4 — Contracts Are Versioned**
Every adapter carries `model_version`, `schema_version`,
and `corpus_version`.
The library validates these at initialisation time.
Embedding model mismatch raises at startup, not mid-query.

**P5 — Composable Primitives, Not Monolithic Pipelines**
Components are small, typed, and independently testable.
Pipelines are explicit compositions the user assembles.
The library provides the typed building blocks
and enforces the contracts between them.

**P6 — Boundaries Absorb Provider Volatility**
The adapter layer shields the core pipeline
from upstream LLM and vector DB API churn.
When OpenAI changes its response schema, the adapter updates.
The `LLMAdapter` Protocol does not change.

---

## Invariants

Rules that cannot be broken by any PR, feature request,
or version release. Relaxing an invariant is a breaking change.

**I1 — Chunk Provenance Is Mandatory**
A `Chunk` that does not know its parent `Document`,
its position within that document,
and its embedding model ID does not exist in rag-axis.

**I2 — No Silent Truncation**
If context is dropped due to budget constraints,
a `ContextTruncationEvent` is emitted with:
the reason, tokens dropped, and stage responsible.
Silent truncation is a contract violation.

**I3 — Every RetrievalResult Has a Confidence Signal**
Acceptable values: a calibrated score,
or the literal type `ConfidenceUnknown`.
Returning results without confidence metadata
is a contract violation.

**I4 — Adapters Must Type Their Errors**
No adapter may suppress a provider error
into a generic `Exception`.
Every error must be typed:
`RateLimitError`, `ContextLengthError`,
`ProviderSchemaError`, `TransportError`.

**I5 — Core Has Zero Provider Dependencies**
`rag_axis.core` must have zero mandatory runtime dependencies
on any specific LLM provider, vector database,
or evaluation framework.
All integration is through the adapter Protocol boundary.

**I6 — Dependency Direction Is One-Way**
`rag_axis.bench` may depend on `rag_axis.core`.
`rag_axis.core` must never depend on `rag_axis.bench`.
Circular imports are an invariant violation. No exceptions.

**I7 — Results Are Immutable After Construction**
Every result object that crosses a pipeline stage boundary
must be immutable after construction.
No in-place mutation of results between stages.

---

## Package Map

Built and consumed in system-building order:
```
Phase 0 — Foundation
rag_axis.core Document, Chunk, RetrievalResult,
CostReport, ContextBudget, PipelineResult,
named error types
rag_axis.adapters LLMAdapter, EmbedderAdapter,
VectorStoreAdapter Protocols
+ reference implementations

Phase 1 — Pre-Retrieval
rag_axis.ingestion Loaders, parsers, metadata, document registry
rag_axis.chunking Fixed, semantic, structural, parent-child
rag_axis.embedding Batch embedding, cost tracking, model version lock

Phase 2 — Retrieval Core
rag_axis.retrieval Dense, sparse, hybrid RRF, metadata filters
rag_axis.reranking Cross-encoder, score normalisation,
ScoreCollapseWarning
rag_axis.context Budget enforcement, truncation,
deduplication, ordering, provenance
rag_axis.generation Prompt assembly, LLM call,
output parsing, citation injection

Phase 3 — System Layer
rag_axis.guards Input guards, output guards, fallback strategies
rag_axis.cache Semantic cache, exact cache, embedding cache
rag_axis.telemetry OTel spans, cost aggregation, structlog
rag_axis.bench EvaluationHook protocol, RAGAS, DeepEval,
TruLens bridges, drift detection

Phase 4 — Advanced
rag_axis.corpus Versioning, staleness, incremental updates,
embedding model migration
rag_axis.knowledge GraphRAG, entity extraction, multi-hop traversal
```

---

## Dependency Rules

One-way. No exceptions. Violations are rejected at PR review.
```
aiprims.rag zero AI framework dependencies
aiprims.core zero AI framework dependencies

rag_axis.core aiprims.rag + aiprims.core + pydantic only
rag_axis.adapters rag_axis.core
rag_axis.ingestion rag_axis.core + rag_axis.adapters
rag_axis.chunking rag_axis.core
rag_axis.embedding rag_axis.core + rag_axis.adapters
rag_axis.retrieval rag_axis.core + rag_axis.adapters
rag_axis.reranking rag_axis.core + rag_axis.retrieval
rag_axis.context rag_axis.core + rag_axis.retrieval
rag_axis.generation rag_axis.core + rag_axis.adapters
rag_axis.guards rag_axis.core
rag_axis.cache rag_axis.core + rag_axis.retrieval
rag_axis.telemetry rag_axis.core
rag_axis.bench rag_axis.core only
rag_axis.corpus rag_axis.core + rag_axis.adapters
rag_axis.knowledge rag_axis.core + rag_axis.retrieval
```

---

## Pydantic Usage Contract

Four rules. No exceptions.

**Rule 1 — Pydantic at Boundaries Only**
`BaseModel` is used only at external boundaries:
config ingestion, provider response parsing,
user-facing API types.
Never inside pipeline logic.

**Rule 2 — Frozen Dataclasses for Domain Objects**
All internal domain objects are `@dataclass(frozen=True)`.
Immutable after construction.
Zero validation overhead on the hot path.

**Rule 3 — TypedDict for Wire Types**
Raw provider responses before validation are `TypedDict`.
Structural typing only. Zero runtime cost.
Parsed once at the adapter boundary before entering the pipeline.

**Rule 4 — Discriminated Unions for Stage Results**
The one exception to Rule 1 inside the pipeline:
`RetrievalResult` and `PipelineResult` are Pydantic
discriminated unions because they cross stage boundaries
and must be pattern-matched by type.

---

## Relationship to aiprims

`aiprims` is a separate library providing AI execution primitives.
rag-axis depends on two of its subpackages:

aiprims.core Deterministic run identity — hash, manifest,
idempotency, config fingerprinting.
Used by rag-axis for chunk IDs, run tracing,
corpus versioning.

aiprims.rag Lowest-level RAG primitives — named error types,
shared enums, minimal Protocol definitions.
rag-axis raises errors from aiprims.rag,
not its own error namespace for base types.


rag-axis does NOT depend on any other aiprims subpackage.
aiprims does NOT depend on rag-axis. Ever.

---

## Non-Goals

Explicit and permanent unless a major version explicitly
revises this section.

- No LangChain feature parity
- No beginner-facing abstractions
- No multi-agent orchestration
- No UI, dashboard, or cloud deployment wrapper
- No LLM-intrinsic hallucination detection
- No authentication, RBAC, or data governance in v0.x
- No auto-magic pipeline assembly

---

## Versioning Contract

- `0.x.y` — active pre-1.0, adapter Protocols may evolve
  with minor version notice in CHANGELOG
- `1.0.0` — adapter Protocols are stable.
  Breaking a Protocol is a major version bump. No exceptions.
- Relaxing an invariant is always a breaking change
  regardless of what else changed in the release.

---

## Architecture Decision Records

Numbered, immutable once merged.
Context → Decision → Consequences → Alternatives Considered.

See `docs/adr/` for all records.

Current ADRs:
- [ADR-0001](docs/adr/0001-dataclass-over-basemodel.md)
  Frozen dataclass over BaseModel for domain objects
- [ADR-0002](docs/adr/0002-protocol-over-abc.md)
  Protocol over ABC for adapter contracts
- [ADR-0003](docs/adr/0003-rrf-hybrid-fusion.md)
  RRF as default hybrid retrieval fusion strategy
- [ADR-0004](docs/adr/0004-otel-native.md)
  OpenTelemetry as native, non-optional telemetry
- [ADR-0005](docs/adr/0005-aiprims-rag-errors.md)
  aiprims.rag as source of base RAG error primitives

---

*For full documentation, API reference, and guides
visit the public docs site.*
