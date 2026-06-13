from __future__ import annotations

import json
from typing import TYPE_CHECKING, Annotated, Any, cast

from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.engine import Connection
from sqlalchemy.orm import Session

from ragaxis.server.api.dependencies import get_db
from ragaxis.server.api.schemas.common_schemas import JobAccepted
from ragaxis.server.api.schemas.experiment_schemas import (
    AuditEventSchema,
    CitationSchema,
    CostReportSchema,
    ExperimentCreate,
    ExperimentList,
    ExperimentResponse,
    MetricsResponse,
    RunList,
    RunRequest,
    RunResponse,
)
from ragaxis.server.jobs.query_execution_job import run_query_execution_job
from ragaxis.server.jobs.queue import create_job
from ragaxis.server.services.experiment_service import ExperimentService
from ragaxis.server.services.metric_service import MetricService

if TYPE_CHECKING:
    from ragaxis.server.database.models import Run

router = APIRouter(tags=["experiments"])

DbDep = Annotated[Session, Depends(get_db)]


def _parse_config(config_json: str) -> dict[str, Any]:
    try:
        result = json.loads(config_json)
    except (json.JSONDecodeError, TypeError):
        return {}
    else:
        return cast("dict[str, Any]", result)


def _run_to_response(run: Run) -> RunResponse:
    citations: list[CitationSchema] = []
    if run.citations_json:
        try:
            raw = json.loads(run.citations_json)
            citations = [CitationSchema(**c) for c in raw]
        except (json.JSONDecodeError, TypeError, ValueError):
            pass

    cost_report: CostReportSchema | None = None
    if run.cost_report_json:
        try:
            cr = json.loads(run.cost_report_json)
            if cr:
                cost_report = CostReportSchema(**cr)
        except (json.JSONDecodeError, TypeError, ValueError):
            pass

    audit_trail: list[AuditEventSchema] = []
    if run.audit_trail_json:
        try:
            raw_audit = json.loads(run.audit_trail_json)
            audit_trail = [AuditEventSchema(**e) for e in raw_audit]
        except (json.JSONDecodeError, TypeError, ValueError):
            pass

    return RunResponse(
        id=run.id,
        experiment_id=run.experiment_id,
        project_id=run.project_id,
        query=run.query,
        answer=run.answer,
        citations=citations,
        cost_report=cost_report,
        audit_trail=audit_trail,
        execution_time_ms=run.execution_time_ms,
        status=run.status,
        error_message=run.error_message,
        created_at=run.created_at,
    )


@router.post(
    "/projects/{project_id}/experiments",
    response_model=ExperimentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_experiment(project_id: str, body: ExperimentCreate, db: DbDep) -> ExperimentResponse:
    svc = ExperimentService(db)
    exp = svc.create(project_id, body.name, body.description, body.corpus_id, body.config)
    return ExperimentResponse(
        id=exp.id,
        project_id=exp.project_id,
        corpus_id=exp.corpus_id,
        name=exp.name,
        description=exp.description,
        config=_parse_config(exp.config_json),
        status=exp.status,
        created_at=exp.created_at,
        updated_at=exp.updated_at,
    )


@router.get("/projects/{project_id}/experiments", response_model=ExperimentList)
def list_experiments(project_id: str, db: DbDep) -> ExperimentList:
    svc = ExperimentService(db)
    exps = svc.list_all(project_id)
    items = [
        ExperimentResponse(
            id=e.id,
            project_id=e.project_id,
            corpus_id=e.corpus_id,
            name=e.name,
            description=e.description,
            config=_parse_config(e.config_json),
            status=e.status,
            created_at=e.created_at,
            updated_at=e.updated_at,
        )
        for e in exps
    ]
    return ExperimentList(items=items, total=len(items))


@router.get("/projects/{project_id}/experiments/{experiment_id}", response_model=ExperimentResponse)
def get_experiment(project_id: str, experiment_id: str, db: DbDep) -> ExperimentResponse:
    svc = ExperimentService(db)
    exp = svc.get_by_id(project_id, experiment_id)
    return ExperimentResponse(
        id=exp.id,
        project_id=exp.project_id,
        corpus_id=exp.corpus_id,
        name=exp.name,
        description=exp.description,
        config=_parse_config(exp.config_json),
        status=exp.status,
        created_at=exp.created_at,
        updated_at=exp.updated_at,
    )


@router.post(
    "/projects/{project_id}/experiments/{experiment_id}/run",
    response_model=JobAccepted,
    status_code=status.HTTP_202_ACCEPTED,
)
def execute_run(
    project_id: str,
    experiment_id: str,
    body: RunRequest,
    background_tasks: BackgroundTasks,
    db: DbDep,
) -> JobAccepted:
    svc = ExperimentService(db)
    svc.get_by_id(project_id, experiment_id)

    bind = db.get_bind()
    engine = bind.engine if isinstance(bind, Connection) else bind
    db_url = engine.url
    background_tasks.add_task(
        run_query_execution_job, project_id, experiment_id, body.query, db_url
    )

    job_id = create_job(
        "query_execution",
        {"project_id": project_id, "experiment_id": experiment_id, "query": body.query},
    )
    return JobAccepted(job_id=job_id, message="Query accepted, executing in background")


@router.get("/projects/{project_id}/experiments/{experiment_id}/runs", response_model=RunList)
def list_runs(project_id: str, experiment_id: str, db: DbDep) -> RunList:
    svc = ExperimentService(db)
    runs = svc.list_runs(project_id, experiment_id)
    items = [_run_to_response(r) for r in runs]
    return RunList(items=items, total=len(items))


@router.get(
    "/projects/{project_id}/experiments/{experiment_id}/runs/{run_id}",
    response_model=RunResponse,
)
def get_run(project_id: str, experiment_id: str, run_id: str, db: DbDep) -> RunResponse:
    svc = ExperimentService(db)
    run = svc.get_run(project_id, experiment_id, run_id)
    return _run_to_response(run)


@router.get(
    "/projects/{project_id}/experiments/{experiment_id}/metrics",
    response_model=MetricsResponse,
)
def get_metrics(project_id: str, experiment_id: str, db: DbDep) -> MetricsResponse:
    svc = MetricService(db)
    metrics = svc.get_experiment_metrics(project_id, experiment_id)
    return MetricsResponse(**metrics)
