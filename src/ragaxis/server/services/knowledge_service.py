from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy.orm import Session

from ragaxis.server.database.models import Corpus, Document, Project
from ragaxis.server.services.base_service import BaseService

if TYPE_CHECKING:
    from fastapi import UploadFile


class KnowledgeService(BaseService):
    def __init__(self, db: Session) -> None:
        super().__init__(db)

    def _get_project(self, project_id: str) -> Project:
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if project is None:
            raise KeyError(f"Project '{project_id}' not found")
        return project

    def create_corpus(
        self,
        project_id: str,
        name: str,
        embedding_model_id: str,
        embedding_model_version: str | None,
    ) -> Corpus:
        self._get_project(project_id)
        now = datetime.now(timezone.utc)
        corpus = Corpus(
            id=str(uuid.uuid4()),
            project_id=project_id,
            name=name,
            embedding_model_id=embedding_model_id,
            embedding_model_version=embedding_model_version,
            status="indexing",
            created_at=now,
            updated_at=now,
        )
        self.db.add(corpus)
        self.db.commit()
        self.db.refresh(corpus)
        return corpus

    def list_corpus(self, project_id: str) -> list[Corpus]:
        self._get_project(project_id)
        return list(
            self.db.query(Corpus)
            .filter(Corpus.project_id == project_id)
            .order_by(Corpus.created_at.desc())
            .all()
        )

    def get_corpus(self, project_id: str, corpus_id: str) -> Corpus:
        self._get_project(project_id)
        corpus = (
            self.db.query(Corpus)
            .filter(Corpus.id == corpus_id, Corpus.project_id == project_id)
            .first()
        )
        if corpus is None:
            raise KeyError(f"Corpus '{corpus_id}' not found in project '{project_id}'")
        return corpus

    def upload_documents(
        self,
        project_id: str,
        corpus_id: str,
        files_data: list[tuple[str, int, bytes]],
    ) -> list[Document]:
        corpus = self.get_corpus(project_id, corpus_id)
        now = datetime.now(timezone.utc)
        docs = []
        for filename, size, content in files_data:
            content_hash = hashlib.sha256(content).hexdigest()
            doc = Document(
                id=str(uuid.uuid4()),
                corpus_id=corpus.id,
                project_id=project_id,
                name=filename,
                file_size_bytes=size,
                content_hash=content_hash,
                status="processing",
                uploaded_at=now,
            )
            self.db.add(doc)
            docs.append(doc)
        self.db.commit()
        for doc in docs:
            self.db.refresh(doc)
        return docs

    def list_documents(self, project_id: str, corpus_id: str) -> list[Document]:
        self.get_corpus(project_id, corpus_id)
        return list(
            self.db.query(Document)
            .filter(Document.corpus_id == corpus_id, Document.project_id == project_id)
            .order_by(Document.uploaded_at.desc())
            .all()
        )

    def delete_document(self, project_id: str, document_id: str) -> None:
        doc = (
            self.db.query(Document)
            .filter(Document.id == document_id, Document.project_id == project_id)
            .first()
        )
        if doc is None:
            raise KeyError(f"Document '{document_id}' not found in project '{project_id}'")
        self.db.delete(doc)
        self.db.commit()

    def mark_documents_indexed(self, doc_ids: list[str], corpus_id: str) -> None:
        now = datetime.now(timezone.utc)
        corpus = self.db.query(Corpus).filter(Corpus.id == corpus_id).first()
        if corpus is None:
            return
        n = len(doc_ids)
        for doc_id in doc_ids:
            doc = self.db.query(Document).filter(Document.id == doc_id).first()
            if doc is not None:
                doc.status = "indexed"
                doc.indexed_at = now
        corpus.document_count = (corpus.document_count or 0) + n
        corpus.chunk_count = (corpus.chunk_count or 0) + n * 15
        corpus.token_count = (corpus.token_count or 0) + n * 3000
        corpus.status = "ready"
        corpus.updated_at = now
        self.db.commit()
