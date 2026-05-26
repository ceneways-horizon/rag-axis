from __future__ import annotations

import json

from sqlalchemy.orm import Session

from ragaxis.server.database.models import Run
from ragaxis.server.services.base_service import BaseService
from ragaxis.server.services.experiment_service import ExperimentService


class MetricService(BaseService):
    def __init__(self, db: Session) -> None:
        super().__init__(db)

    def get_experiment_metrics(
        self, project_id: str, experiment_id: str
    ) -> dict:  # type: ignore[type-arg]
        exp_svc = ExperimentService(self.db)
        exp_svc.get_by_id(project_id, experiment_id)

        runs = list(
            self.db.query(Run)
            .filter(Run.experiment_id == experiment_id, Run.project_id == project_id)
            .all()
        )
        total = len(runs)
        if total == 0:
            return {
                "experiment_id": experiment_id,
                "total_runs": 0,
                "success_rate": 0.0,
                "avg_execution_time_ms": 0.0,
                "avg_cost_usd": 0.0,
                "total_cost_usd": 0.0,
            }

        success_count = sum(1 for r in runs if r.status == "success")
        success_rate = success_count / total

        exec_times = [r.execution_time_ms for r in runs if r.execution_time_ms is not None]
        avg_exec_ms = sum(exec_times) / len(exec_times) if exec_times else 0.0

        costs: list[float] = []
        for run in runs:
            if run.cost_report_json:
                try:
                    cr = json.loads(run.cost_report_json)
                    cost = cr.get("total_cost_usd", 0.0)
                    if isinstance(cost, (int, float)):
                        costs.append(float(cost))
                except (json.JSONDecodeError, TypeError):
                    pass

        total_cost = sum(costs)
        avg_cost = total_cost / len(costs) if costs else 0.0

        return {
            "experiment_id": experiment_id,
            "total_runs": total,
            "success_rate": success_rate,
            "avg_execution_time_ms": avg_exec_ms,
            "avg_cost_usd": avg_cost,
            "total_cost_usd": total_cost,
        }
