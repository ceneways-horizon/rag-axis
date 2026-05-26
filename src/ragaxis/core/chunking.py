"""
ragaxis.core chunking: Chunking strategies.

Splits normalised document text into Chunks with immutable Provenance.
Supported strategies: fixed-size, semantic, structural, hierarchical (parent-child).

See: docs/internal/contracts/types.md (Chunk, Provenance)
     docs/internal/contracts/errors.md (ChunkingError, MissingProvenanceError)
Phase: 0
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ragaxis.core._errors.exceptions import ChunkingError  # noqa: F401

if TYPE_CHECKING:
    from ragaxis.core._types.contracts import Chunk


async def chunk_documents(
    documents: list[dict[str, Any]],
    config: dict[str, Any],
    embedder_model_id: str,
) -> list[Chunk]:
    """Split documents into Chunks.

    Args:
        documents: Normalised document dicts from ingest_documents().
        config: Chunking config (strategy, chunk_size, overlap, etc.).
        embedder_model_id: Model ID to embed in each Chunk's Provenance (I1).

    Returns:
        List of Chunk instances with fully populated Provenance.

    Raises:
        ChunkingError: Strategy failed to produce valid chunks.
        MissingProvenanceError: Produced chunk missing required provenance field.
    """
    raise NotImplementedError  # Phase 0 stub
