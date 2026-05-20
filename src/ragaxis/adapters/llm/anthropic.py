"""
AnthropicLLM: LLMAdapter implementation for Anthropic.

Stub: Implementation pending. Default model hint: claude-sonnet-4-6
Satisfies LLMAdapter protocol structurally (no inheritance).

See: docs/internal/contracts/adapters.md §3 (LLMAdapter)
Phase: 0
"""

from __future__ import annotations


class AnthropicLLM:
    """LLMAdapter implementation for Anthropic.

    Stub: implementation pending. See docs/internal/contracts/adapters.md §3.
    """

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-6") -> None:
        raise NotImplementedError  # Phase 0 stub

    async def complete(
        self,
        prompt: str,
        max_tokens: int,
        temperature: float = 0.0,
    ) -> tuple[str, int, int, int]:
        raise NotImplementedError  # Phase 0 stub

    def get_model_id(self) -> str:
        raise NotImplementedError  # Phase 0 stub
