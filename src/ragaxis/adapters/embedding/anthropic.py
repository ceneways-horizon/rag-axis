"""
AnthropicEmbedder: EmbedderAdapter implementation for Anthropic.

Stub: Implementation pending. Default model hint: voyage-3
Satisfies EmbedderAdapter protocol structurally (no inheritance).

See: docs/internal/contracts/adapters.md §1 (EmbedderAdapter)
Phase: 0
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ragaxis.core._types.contracts import Vector


class AnthropicEmbedder:
    """EmbedderAdapter implementation for Anthropic.

    Stub: implementation pending. See docs/internal/contracts/adapters.md §1.
    """

    def __init__(self, api_key: str, model: str = "voyage-3") -> None:
        raise NotImplementedError  # Phase 0 stub

    async def embed(self, texts: list[str]) -> tuple[list[Vector], int, int]:
        raise NotImplementedError  # Phase 0 stub

    def get_model_id(self) -> str:
        raise NotImplementedError  # Phase 0 stub

    def get_embedding_dimension(self) -> int:
        raise NotImplementedError  # Phase 0 stub
