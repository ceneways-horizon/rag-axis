from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from ragaxis.server.services.knowledge_service import KnowledgeService

if TYPE_CHECKING:
    from sqlalchemy.engine import URL

logger = logging.getLogger(__name__)


def run_document_index_job(corpus_id: str, doc_ids: list[str], db_url: URL | str) -> None:
    connect_args = {"check_same_thread": False} if str(db_url).startswith("sqlite") else {}
    engine = create_engine(str(db_url), connect_args=connect_args)
    # SQLAlchemy convention name
    session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    with session_local() as session:
        svc = KnowledgeService(session)
        try:
            svc.mark_documents_indexed(doc_ids, corpus_id)
            logger.info("Indexed %d documents for corpus %s", len(doc_ids), corpus_id)
        except Exception:
            logger.exception("Failed to index documents for corpus %s", corpus_id)
