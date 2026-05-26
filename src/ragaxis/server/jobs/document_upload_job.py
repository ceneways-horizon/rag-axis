from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


def run_document_index_job(corpus_id: str, doc_ids: list[str], db_url: Any) -> None:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    from ragaxis.server.services.knowledge_service import KnowledgeService

    connect_args = {"check_same_thread": False} if str(db_url).startswith("sqlite") else {}
    engine = create_engine(str(db_url), connect_args=connect_args)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    with SessionLocal() as session:
        svc = KnowledgeService(session)
        try:
            svc.mark_documents_indexed(doc_ids, corpus_id)
            logger.info("Indexed %d documents for corpus %s", len(doc_ids), corpus_id)
        except Exception:  # noqa: BLE001
            logger.exception("Failed to index documents for corpus %s", corpus_id)
