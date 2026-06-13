from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ragaxis.server.api.dependencies import get_db
from ragaxis.server.api.schemas.project_schemas import ProjectCreate, ProjectList, ProjectResponse
from ragaxis.server.services.project_service import ProjectService

router = APIRouter(tags=["projects"])

DbDep = Annotated[Session, Depends(get_db)]


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(body: ProjectCreate, db: DbDep) -> ProjectResponse:
    svc = ProjectService(db)
    project = svc.create(body.name, body.description, body.owner_id)
    return ProjectResponse.model_validate(project)


@router.get("/projects", response_model=ProjectList)
def list_projects(db: DbDep) -> ProjectList:
    svc = ProjectService(db)
    projects = svc.list_all()
    return ProjectList(
        items=[ProjectResponse.model_validate(p) for p in projects], total=len(projects)
    )


@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: DbDep) -> ProjectResponse:
    svc = ProjectService(db)
    project = svc.get_by_id(project_id)
    return ProjectResponse.model_validate(project)


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, db: DbDep) -> None:
    svc = ProjectService(db)
    svc.delete(project_id)
