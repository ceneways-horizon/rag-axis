from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)

_MOCK_EXECUTION_TIME_MS = 450
_MOCK_EMBEDDING_TOKENS = 50
_MOCK_RETRIEVAL_MS = 120
_MOCK_GENERATION_TOKENS = 200
_MOCK_TOTAL_COST_USD = 0.0034


def _build_mock_result(query: str) -> dict[str, Any]:
    now_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
    return {
        "answer": f"Based on the retrieved context: [mock answer for: {query}]",
        "citations": [
            {
                "chunk_id": str(uuid.uuid4()),
                "doc_id": str(uuid.uuid4()),
                "score": 0.91,
                "text": f"Relevant excerpt 1 related to: {query[:40]}...",
            },
            {
                "chunk_id": str(uuid.uuid4()),
                "doc_id": str(uuid.uuid4()),
                "score": 0.85,
                "text": f"Relevant excerpt 2 providing context for: {query[:40]}...",
            },
            {
                "chunk_id": str(uuid.uuid4()),
                "doc_id": str(uuid.uuid4()),
                "score": 0.78,
                "text": f"Supporting information for: {query[:40]}...",
            },
        ],
        "cost_report": {
            "embedding_tokens": _MOCK_EMBEDDING_TOKENS,
            "retrieval_ms": _MOCK_RETRIEVAL_MS,
            "generation_tokens": _MOCK_GENERATION_TOKENS,
            "total_cost_usd": _MOCK_TOTAL_COST_USD,
        },
        "audit_trail": [
            {"event": "retrieval", "timestamp_ms": now_ms, "details": {"chunks_retrieved": 10}},
            {
                "event": "reranking",
                "timestamp_ms": now_ms + 80,
                "details": {"chunks_reranked": 10, "chunks_kept": 3},
            },
            {
                "event": "generation",
                "timestamp_ms": now_ms + 200,
                "details": {"tokens_generated": _MOCK_GENERATION_TOKENS},
            },
        ],
        "execution_time_ms": _MOCK_EXECUTION_TIME_MS,
        "status": "success",
    }


def run_query_execution_job(
    project_id: str,
    experiment_id: str,
    query: str,
    db_url: Any,
) -> None:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    from ragaxis.server.services.experiment_service import ExperimentService

    connect_args = {"check_same_thread": False} if str(db_url).startswith("sqlite") else {}
    engine = create_engine(str(db_url), connect_args=connect_args)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    with SessionLocal() as session:
        svc = ExperimentService(session)
        try:
            run_data = _build_mock_result(query)
            svc.create_run(project_id, experiment_id, query, run_data)
            logger.info(
                "Query execution complete for experiment %s: %s...",
                experiment_id,
                query[:40],
            )
        except Exception:  # noqa: BLE001
            logger.exception("Failed to execute query for experiment %s", experiment_id)
