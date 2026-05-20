"""
ragaxis.core ingestion: Document loaders and parsers.

Loads raw documents from various sources (files, databases, APIs) and
normalises them into a common representation for chunking.

See: docs/internal/contracts/types.md (Chunk, Provenance)
     docs/internal/contracts/errors.md (IngestionError)
Phase: 0
"""

from __future__ import annotations

from typing import Any

from ragaxis.core._errors.exceptions import IngestionError  # noqa: F401


async def ingest_documents(
    documents: list[dict[str, Any]],
    config: dict[str, Any],
) -> list[dict[str, Any]]:
    """Load and parse raw documents.

    Args:
        documents: List of document descriptors. Each must have 'id' and 'source' keys.
        config: Ingestion configuration dict (format, encoding, batch_size).

    Returns:
        List of normalised document dicts ready for chunking.
        Each dict contains: id, text, metadata.

    Raises:
        IngestionError: Document loading or parsing failed.
    """
    raise NotImplementedError  # Phase 0 stub
