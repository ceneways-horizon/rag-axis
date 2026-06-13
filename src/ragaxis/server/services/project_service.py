from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from ragaxis.server.database.models import Project
from ragaxis.server.services.base_service import BaseService

if TYPE_CHECKING:
    from sqlalchemy.orm import Session


class ProjectService(BaseService):
    def __init__(self, db: Session) -> None:
        super().__init__(db)

    def create(self, name: str, description: str | None, owner_id: str | None) -> Project:
        now = datetime.now(UTC)
        project = Project(
            id=str(uuid.uuid4()),
            name=name,
            description=description,
            owner_id=owner_id,
            created_at=now,
            updated_at=now,
        )
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def list_all(self) -> list[Project]:
        return list(self.db.query(Project).order_by(Project.created_at.desc()).all())

    def get_by_id(self, project_id: str) -> Project:
        project = self.db.query(Project).filter(Project.id == project_id).first()
        if project is None:
            msg = f"Project '{project_id}' not found"
            raise KeyError(msg)
        return project

    def delete(self, project_id: str) -> None:
        project = self.get_by_id(project_id)
        self.db.delete(project)
        self.db.commit()
