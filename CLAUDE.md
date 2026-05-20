# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Setup (uv recommended)
uv venv
uv pip install -e ".[dev]"

# Tests
pytest tests/
pytest tests/path/to/test_file.py::test_name  # single test

# Type checking
mypy src/ragaxis/

# Linting
ruff check src/ragaxis/
```

CI runs `pytest` and `python -m build` on every push and PR. Publishing to PyPI is triggered by version tags (`v*`) and uses OIDC Trusted Publishing.

## Architecture

rag-axis is a **production contract layer for RAG systems** — v0.0.1 pre-alpha, architecture locked, core types in active development. It makes failure modes explicit rather than abstracting them away.

### Three Operational Layers

Every sub-package belongs to exactly one:

| Layer | Runs when | Failure consequence |
|---|---|---|
| **Pre-Retrieval** | Offline / async | Silent quality degradation |
| **Retrieval Core** | Live query path (200ms–2s budget) | Immediate, visible errors |
| **System Layer** | Continuous background | Invisible rot, compounding cost |

### Package Build Order

```
Phase 0 — Foundation
  ragaxis.core       Document, Chunk, RetrievalResult, CostReport, ContextBudget,
                      PipelineResult, named error types
  ragaxis.adapters   LLMAdapter, EmbedderAdapter, VectorStoreAdapter Protocols
                      + reference implementations

Phase 1 — Pre-Retrieval
  ragaxis.ingestion  Loaders, parsers, metadata, document registry
  ragaxis.chunking   Fixed, semantic, structural, parent-child strategies
  ragaxis.embedding  Batch embedding, cost tracking, model version lock

Phase 2 — Retrieval Core
  ragaxis.retrieval  Dense, sparse, hybrid RRF (k=60 default), metadata filters
  ragaxis.reranking  Cross-encoder, score normalisation, ScoreCollapseWarning
  ragaxis.context    Budget enforcement, truncation, deduplication, ordering, provenance
  ragaxis.generation Prompt assembly, LLM call, output parsing, citation injection

Phase 3 — System Layer
  ragaxis.guards     Input/output guards, fallback strategies
  ragaxis.cache      Semantic, exact, embedding cache
  ragaxis.telemetry  OTel spans (non-optional), cost aggregation, structlog
  ragaxis.bench      EvaluationHook Protocol, RAGAS/DeepEval/TruLens bridges

Phase 4 — Advanced
  ragaxis.corpus     Versioning, staleness, incremental updates, model migration
  ragaxis.knowledge  GraphRAG, entity extraction, multi-hop traversal
```

### One-Way Dependency Rules

Violations are rejected at PR review. The critical constraint: `ragaxis.core` depends only on `aiprims.rag`, `aiprims.core`, and pydantic. It has **zero** provider-specific runtime dependencies.

`aiprims` is a separate library. rag-axis uses two of its subpackages:
- `aiprims.core` — deterministic run identity (chunk IDs, run tracing, corpus versioning)
- `aiprims.rag` — base RAG error types and enums (never redefine these in rag_axis)

## Coding Conventions

### Object Type Selection (strict)

| Context | Type to use |
|---|---|
| Internal domain objects (Document, Chunk, CostReport) | `@dataclass(frozen=True)` |
| External boundaries (config, provider responses, user-facing API) | `pydantic.BaseModel` |
| Raw provider responses before validation | `TypedDict` |
| Stage-crossing results (RetrievalResult, PipelineResult) | Pydantic discriminated union |

Pydantic BaseModel is ~8x slower to instantiate than a dataclass. Never use it on the hot path.

### Adapter Contracts

All adapters (`LLMAdapter`, `EmbedderAdapter`, `VectorStoreAdapter`) are `typing.Protocol` with `runtime_checkable`. Users implement structurally — no inheritance from rag-axis base classes. Never use ABC.

### Error Handling

- Base RAG errors come from `aiprims.rag`. Pipeline-specific compound errors live in `ragaxis.core.errors`.
- No adapter may suppress a provider error into generic `Exception`. Always type errors: `RateLimitError`, `ContextLengthError`, `ProviderSchemaError`, `TransportError`.

### Result Objects

Every pipeline result carries a `CostReport` (tokens per stage, latency per stage, estimated cost). This is part of the return type, not optional logging. All result objects are immutable after construction.

## Invariant Checklist (required on every PR)

- **I1**: Every `Chunk` has `parent_doc_id`, `position`, and `embedding_model_id`
- **I2**: No silent truncation — `ContextTruncationEvent` emitted if context is dropped
- **I3**: Every `RetrievalResult` has a confidence signal or `ConfidenceUnknown`
- **I4**: No adapter suppresses a provider error into generic `Exception`
- **I5**: `ragaxis.core` has zero provider-specific runtime dependencies
- **I6**: No circular imports — dependency direction is strictly one-way
- **I7**: No in-place mutation of result objects after construction

Relaxing any invariant is a **breaking change** — requires major version bump and an ADR before writing code.

## Commit Convention

Conventional Commits format required on all commits to main:

```
feat:      new feature
fix:       bug fix
docs:      documentation only
refactor:  no behaviour change
test:      test additions or fixes
chore:     build, tooling, dependencies
breaking:  breaking change (must include BREAKING CHANGE footer)
```

## ADRs

Architecture decisions are in `docs/adr/` — numbered and immutable once merged. Before proposing a change that contradicts an existing ADR, open a new ADR first.
