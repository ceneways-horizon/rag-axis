"""
ragaxis.synthesis: Synthesis Layer — answer generation from retrieved context.

Contains:
  - Context assembly (ordering, relationship graph, token budget)
  - Intelligent truncation with audit trails (I2)
  - Cross-encoder reranking (optional)
  - Answer generation via LLMAdapter
  - Citation injection
  - Output validation (guards)

See: docs/internal/contracts/types.md (Citation, PipelineResult)
     docs/internal/contracts/errors.md (synthesis layer errors)
Phase: 2
"""

from __future__ import annotations

from ragaxis.synthesis._errors.exceptions import (
    CitationError,
    ContextBudgetExceededError,
    ContextTruncationWarning,
    GenerationError,
    OutputValidationError,
)
from ragaxis.synthesis._types.contracts import Citation, PipelineResult
from ragaxis.synthesis.generation import synthesize

__all__ = [
    # Types
    "Citation",
    "CitationError",
    # Errors
    "ContextBudgetExceededError",
    "ContextTruncationWarning",
    "GenerationError",
    "OutputValidationError",
    "PipelineResult",
    # Functions
    "synthesize",
]
