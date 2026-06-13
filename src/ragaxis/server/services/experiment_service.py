from __future__ import annotations

import json
import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from ragaxis.server.database.models import Corpus, Experiment, Project, Run
from ragaxis.server.services.base_service import BaseService

if TYPE_CHECKING:
    from sqlalchemy.orm import Session


class ExperimentService(BaseService):
    def __init__(self, db: Session) -> None:
        super().__init__(db)

    def _get_project(self, project_id: str) -> Project:
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if project is None:
            msg = f"Project '{project_id}' not found"
            raise KeyError(msg)
        return project

    def _get_corpus(self, project_id: str, corpus_id: str) -> Corpus:
        corpus = (
            self.db.query(Corpus)
            .filter(Corpus.id == corpus_id, Corpus.project_id == project_id)
            .first()
        )
        if corpus is None:
            msg = f"Corpus '{corpus_id}' not found in project '{project_id}'"
            raise KeyError(msg)
        return corpus

    def create(
        self,
        project_id: str,
        name: str,
        description: str | None,
        corpus_id: str,
        config: dict,  # type: ignore[type-arg]
    ) -> Experiment:
        self._get_project(project_id)
        self._get_corpus(project_id, corpus_id)
        now = datetime.now(UTC)
        exp = Experiment(
            id=str(uuid.uuid4()),
            project_id=project_id,
            corpus_id=corpus_id,
            name=name,
            description=description,
            config_json=json.dumps(config),
            status="active",
            created_at=now,
            updated_at=now,
        )
        self.db.add(exp)
        self.db.commit()
        self.db.refresh(exp)
        return exp

    def list_all(self, project_id: str) -> list[Experiment]:
        self._get_project(project_id)
        return list(
            self.db.query(Experiment)
            .filter(Experiment.project_id == project_id)
            .order_by(Experiment.created_at.desc())
            .all()
        )

    def get_by_id(self, project_id: str, experiment_id: str) -> Experiment:
        self._get_project(project_id)
        exp = (
            self.db.query(Experiment)
            .filter(Experiment.id == experiment_id, Experiment.project_id == project_id)
            .first()
        )
        if exp is None:
            msg = f"Experiment '{experiment_id}' not found in project '{project_id}'"
            raise KeyError(msg)
        return exp

    def create_run(
        self,
        project_id: str,
        experiment_id: str,
        query: str,
        run_data: dict,  # type: ignore[type-arg]
    ) -> Run:
        exp = self.get_by_id(project_id, experiment_id)
        now = datetime.now(UTC)
        run = Run(
            id=str(uuid.uuid4()),
            experiment_id=exp.id,
            project_id=project_id,
            query=query,
            answer=run_data.get("answer"),
            citations_json=json.dumps(run_data.get("citations", [])),
            run_result_json=json.dumps(run_data),
            cost_report_json=json.dumps(run_data.get("cost_report", {})),
            audit_trail_json=json.dumps(run_data.get("audit_trail", [])),
            execution_time_ms=run_data.get("execution_time_ms"),
            status=run_data.get("status", "success"),
            error_message=run_data.get("error_message"),
            created_at=now,
        )
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)
        return run

    def list_runs(self, project_id: str, experiment_id: str) -> list[Run]:
        self.get_by_id(project_id, experiment_id)
        return list(
            self.db.query(Run)
            .filter(Run.experiment_id == experiment_id, Run.project_id == project_id)
            .order_by(Run.created_at.desc())
            .all()
        )

    def get_run(self, project_id: str, experiment_id: str, run_id: str) -> Run:
        self.get_by_id(project_id, experiment_id)
        run = (
            self.db.query(Run)
            .filter(
                Run.id == run_id,
                Run.experiment_id == experiment_id,
                Run.project_id == project_id,
            )
            .first()
        )
        if run is None:
            msg = f"Run '{run_id}' not found"
            raise KeyError(msg)
        return run
