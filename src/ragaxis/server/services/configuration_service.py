from __future__ import annotations

import json
import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from ragaxis.server.database.models import Configuration, Project
from ragaxis.server.services.base_service import BaseService

if TYPE_CHECKING:
    from sqlalchemy.orm import Session


class ConfigurationService(BaseService):
    def __init__(self, db: Session) -> None:
        super().__init__(db)

    def _get_project(self, project_id: str) -> Project:
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if project is None:
            msg = f"Project '{project_id}' not found"
            raise KeyError(msg)
        return project

    def create(
        self,
        project_id: str,
        name: str,
        version: str,
        config: dict,  # type: ignore[type-arg]
    ) -> Configuration:
        self._get_project(project_id)
        now = datetime.now(UTC)
        cfg = Configuration(
            id=str(uuid.uuid4()),
            project_id=project_id,
            name=name,
            version=version,
            config_json=json.dumps(config),
            status="draft",
            created_at=now,
            updated_at=now,
        )
        self.db.add(cfg)
        self.db.commit()
        self.db.refresh(cfg)
        return cfg

    def list_all(self, project_id: str) -> list[Configuration]:
        self._get_project(project_id)
        return list(
            self.db.query(Configuration)
            .filter(Configuration.project_id == project_id)
            .order_by(Configuration.created_at.desc())
            .all()
        )

    def get_by_id(self, project_id: str, config_id: str) -> Configuration:
        self._get_project(project_id)
        cfg = (
            self.db.query(Configuration)
            .filter(Configuration.id == config_id, Configuration.project_id == project_id)
            .first()
        )
        if cfg is None:
            msg = f"Configuration '{config_id}' not found in project '{project_id}'"
            raise KeyError(msg)
        return cfg

    def promote(self, project_id: str, config_id: str) -> Configuration:
        cfg = self.get_by_id(project_id, config_id)
        now = datetime.now(UTC)
        cfg.status = "production"
        cfg.promoted_at = now
        cfg.updated_at = now
        self.db.commit()
        self.db.refresh(cfg)
        return cfg

    def delete(self, project_id: str, config_id: str) -> None:
        cfg = self.get_by_id(project_id, config_id)
        self.db.delete(cfg)
        self.db.commit()
