"""
Synthesis Layer errors.

See: docs/internal/contracts/errors.md (synthesis layer section)
"""

from __future__ import annotations

from dataclasses import dataclass

from ragaxis.core._errors.exceptions import DegradedError, RagAxisError


@dataclass(frozen=True)
class ContextBudgetExceededError(RagAxisError):
    """Smallest chunk exceeds context_token_budget — truncation cannot help.

    Message pattern: "Context budget exhausted: smallest chunk ({min_tokens} tokens) exceeds budget ({budget} tokens)."
    Recovery: increase context_token_budget, use smaller chunking, or switch to larger context model.
    """


@dataclass(frozen=True)
class ContextTruncationWarning(DegradedError):
    """One or more chunks dropped to fit context_token_budget (I2).

    Message pattern: "Context truncated: dropped {n_chunks} chunks ({tokens_dropped} tokens) to fit budget of {budget} tokens."
    Pipeline continues. Event recorded in PipelineResult.truncation_audit.
    """


@dataclass(frozen=True)
class GenerationError(RagAxisError):
    """LLMAdapter.complete() raised, timed out, or returned empty string.

    Message pattern: "LLM generation failed: {reason}. model={model_id}, prompt_tokens={n}"
    Recovery: check LLM credentials and availability; adapter should retry before raising.
    """


@dataclass(frozen=True)
class CitationError(RagAxisError):
    """Citation injection references a chunk_id not in the RetrievalResult.

    Message pattern: "Citation references unknown chunk_id='{chunk_id}'. Available: {available}"
    Recovery: bug in citation injection logic — chunk set must not change between retrieval and synthesis.
    """


@dataclass(frozen=True)
class OutputValidationError(RagAxisError):
    """Generated answer failed post-generation validation: empty, too long, or guard rejected.

    Message pattern: "Output validation failed: {reason}. answer_length={n}, model={model_id}"
    Recovery: check generation config (temperature, max_tokens) and prompt template.
    """
