# ADR-0005: aiprims.rag as Source of Base RAG Error Primitives

## Status
Accepted

## Context
rag-axis needs named error types for RAG-specific failures:
EmptyRetrievalError, EmbeddingModelMismatchError, ContextBudgetExceededError,
ScoreCollapseWarning, and others. These error types are useful beyond rag-axis —
any RAG tooling in the aiprims ecosystem should be able to raise and catch
the same error types without depending on the full rag-axis library.

## Decision
Base RAG error primitives (errors, enums, constants) are defined in
aiprims.rag and imported into rag-axis. rag-axis may extend these
with pipeline-specific compound errors in rag_axis.core.errors,
but never redefines the base types independently.

## Consequences
- Error types are consistent across the aiprims ecosystem
- Downstream consumers can catch RAG errors without depending on rag-axis
- aiprims.rag must be kept narrow — errors, enums, constants only
- No documents, chunks, or pipeline logic in aiprims.rag (ever)

## Alternatives Considered
- **Define all errors in rag_axis.core**: Rejected. Creates duplication
  if other aiprims-ecosystem libraries need the same error types.
- **No named errors, use generic exceptions**: Rejected. Violates I4 and P1.
  Generic exceptions make silent failures invisible.
