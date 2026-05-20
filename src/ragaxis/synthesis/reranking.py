"""
Cross-encoder reranking: fine-tune chunk order with a reranking model.

Optional stage, controlled by SynthesisConfig.reranking_enabled.
Reranks the top-k chunks retrieved before context assembly.

See: docs/internal/contracts/types.md §10 (PipelineResult.reranking_details)
Phase: 2
"""

from __future__ import annotations

raise NotImplementedError  # Phase 2 stub
