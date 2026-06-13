---
sidebar_position: 4
title: Invariants Explained
---

# Invariants Explained

RAG Axis enforces seven invariants (I1 through I7) on every PR, and relaxing any of them is a breaking change. Each invariant maps to a failure mode that has actually taken down production RAG systems, so understanding why they exist matters as much as knowing what they require.

**I1, chunk provenance.** Every Chunk carries `parent_doc_id`, `position`, and `embedding_model_id`. Without this, a retrieved fragment cannot be traced back to its source document or checked against the embedding model that produced it, which is how out-of-context chunks and silent embedding mismatches go undetected.

**I2, no silent truncation.** If context assembly drops a chunk to fit the token budget, it emits a `ContextTruncationEvent`. Truncation itself is fine; truncation nobody can see is the problem.

**I3, confidence on every retrieval.** Every `RetrievalResult` carries either a real confidence signal or an explicit `ConfidenceUnknown`. This forces downstream code to handle the "we are not sure" case instead of treating every retrieval as equally trustworthy.

**I4, no swallowed provider errors.** Adapters never collapse a provider error into a generic `Exception`. Rate limits, context length errors, schema errors, and transport failures are distinct types so callers can react appropriately.

**I5, zero provider dependencies in core.** `ragaxis.core` depends only on `aiprims.rag`, `aiprims.core`, and pydantic. This keeps the foundational types stable and swappable regardless of which providers a deployment uses.

**I6, one-way dependency direction.** No circular imports between sub-packages. This keeps the system buildable in phases and keeps each layer independently testable.

**I7, immutability after construction.** Result objects cannot be mutated once built. This makes a pipeline run reproducible: the result you log is the result that was returned.
