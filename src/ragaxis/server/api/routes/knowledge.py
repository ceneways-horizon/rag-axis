from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from ragaxis.server.api.dependencies import get_db
from ragaxis.server.api.schemas.common_schemas import JobAccepted
from ragaxis.server.api.schemas.knowledge_schemas import (
    CorpusCreate,
    CorpusList,
    CorpusResponse,
    DocumentList,
    DocumentResponse,
)
from ragaxis.server.jobs.document_upload_job import run_document_index_job
from ragaxis.server.services.knowledge_service import KnowledgeService

router = APIRouter(tags=["knowledge"])

DbDep = Annotated[Session, Depends(get_db)]


@router.post(
    "/projects/{project_id}/knowledge/corpus",
    response_model=CorpusResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_corpus(project_id: str, body: CorpusCreate, db: DbDep) -> CorpusResponse:
    svc = KnowledgeService(db)
    corpus = svc.create_corpus(
        project_id, body.name, body.embedding_model_id, body.embedding_model_version
    )
    return CorpusResponse.model_validate(corpus)


@router.get("/projects/{project_id}/knowledge/corpus", response_model=CorpusList)
def list_corpus(project_id: str, db: DbDep) -> CorpusList:
    svc = KnowledgeService(db)
    items = svc.list_corpus(project_id)
    return CorpusList(items=[CorpusResponse.model_validate(c) for c in items], total=len(items))


@router.get(
    "/projects/{project_id}/knowledge/corpus/{corpus_id}", response_model=CorpusResponse
)
def get_corpus(project_id: str, corpus_id: str, db: DbDep) -> CorpusResponse:
    svc = KnowledgeService(db)
    corpus = svc.get_corpus(project_id, corpus_id)
    return CorpusResponse.model_validate(corpus)


@router.post(
    "/projects/{project_id}/knowledge/documents",
    response_model=JobAccepted,
    status_code=status.HTTP_202_ACCEPTED,
)
async def upload_documents(
    project_id: str,
    background_tasks: BackgroundTasks,
    db: DbDep,
    corpus_id: str = Form(...),
    files: list[UploadFile] = File(...),
) -> JobAccepted:
    svc = KnowledgeService(db)
    files_data: list[tuple[str, int, bytes]] = []
    for f in files:
        content = await f.read()
        files_data.append((f.filename or "unknown", len(content), content))

    docs = svc.upload_documents(project_id, corpus_id, files_data)
    doc_ids = [d.id for d in docs]

    background_tasks.add_task(run_document_index_job, corpus_id, doc_ids, svc.db.get_bind().url)

    from ragaxis.server.jobs.queue import create_job

    job_id = create_job("document_index", {"doc_ids": doc_ids, "corpus_id": corpus_id})
    return JobAccepted(
        job_id=job_id,
        message=f"Uploaded {len(docs)} document(s), indexing in background",
    )


@router.get("/projects/{project_id}/knowledge/documents", response_model=DocumentList)
def list_documents(project_id: str, corpus_id: str, db: DbDep) -> DocumentList:
    svc = KnowledgeService(db)
    docs = svc.list_documents(project_id, corpus_id)
    return DocumentList(
        items=[DocumentResponse.model_validate(d) for d in docs], total=len(docs)
    )


@router.delete(
    "/projects/{project_id}/knowledge/documents/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_document(project_id: str, document_id: str, db: DbDep) -> None:
    svc = KnowledgeService(db)
    svc.delete_document(project_id, document_id)
