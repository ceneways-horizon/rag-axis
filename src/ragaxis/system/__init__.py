"""
ragaxis.system: System Layer — pipeline orchestration and RunResult assembly.

Composes Index → Retrieval → Synthesis, aggregates costs and audit trails,
produces the immutable RunResult (single source of truth).

See: docs/internal/contracts/types.md (RunResult)
     docs/internal/contracts/errors.md (PipelineExecutionError)
Phase: 3
"""

from __future__ import annotations

from ragaxis.system._errors.exceptions import PipelineExecutionError
from ragaxis.system._types.contracts import RunResult
from ragaxis.system.pipeline import RAGPipeline

__all__ = [
    "PipelineExecutionError",
    "RAGPipeline",
    "RunResult",
]
