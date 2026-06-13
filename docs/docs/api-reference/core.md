---
sidebar_position: 2
title: Core API Reference
---

# Core API Reference

`ragaxis.core` is the foundation of the project. It defines the domain types shared by every other package, including `Document`, `Chunk`, `RetrievalResult`, `CostReport`, `ContextBudget`, and `PipelineResult`, along with the named error taxonomy used throughout RAG Axis.

Per invariant I5, this package depends only on `aiprims.rag`, `aiprims.core`, and pydantic. It has zero provider-specific runtime dependencies, which is what allows every other package to build on top of it without coupling RAG Axis to any particular LLM, embedding, or vector store provider.

Domain objects such as `Document`, `Chunk`, and `CostReport` are `@dataclass(frozen=True)`. Stage-crossing results such as `RetrievalResult` and `PipelineResult` are Pydantic discriminated unions, as described in [Pydantic Usage Boundaries](/docs/concepts/pydantic-boundaries).

Detailed type-by-type and function-by-function reference will be published as the core package's public API stabilizes.
