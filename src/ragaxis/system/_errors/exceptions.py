"""
System Layer errors.

See: docs/internal/contracts/errors.md (system layer section)
"""

from __future__ import annotations

from dataclasses import dataclass

from ragaxis.core._errors.exceptions import RagAxisError


@dataclass(frozen=True)
class PipelineExecutionError(RagAxisError):
    """Cross-layer validation failed, or unexpected error escaped a layer untyped.

    Message pattern: "Pipeline execution failed at {stage}: {reason}. run_id={run_id}"
    Wraps unexpected failures that bypassed layer-level error handling.
    """
