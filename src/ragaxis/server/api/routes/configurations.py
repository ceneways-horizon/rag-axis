from __future__ import annotations

import json
from typing import TYPE_CHECKING, Annotated, Any, cast

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ragaxis.server.api.dependencies import get_db
from ragaxis.server.api.schemas.config_schemas import (
    ConfigurationCreate,
    ConfigurationList,
    ConfigurationResponse,
)
from ragaxis.server.services.configuration_service import ConfigurationService

if TYPE_CHECKING:
    from ragaxis.server.database.models import Configuration

router = APIRouter(tags=["configurations"])

DbDep = Annotated[Session, Depends(get_db)]


def _parse_config(config_json: str) -> dict[str, Any]:
    try:
        result = json.loads(config_json)
    except (json.JSONDecodeError, TypeError):
        return {}
    else:
        return cast("dict[str, Any]", result)


def _cfg_to_response(cfg: Configuration) -> ConfigurationResponse:
    return ConfigurationResponse(
        id=cfg.id,
        project_id=cfg.project_id,
        name=cfg.name,
        version=cfg.version,
        config=_parse_config(cfg.config_json),
        status=cfg.status,
        promoted_at=cfg.promoted_at,
        created_at=cfg.created_at,
        updated_at=cfg.updated_at,
    )


@router.post(
    "/projects/{project_id}/configs",
    response_model=ConfigurationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_configuration(
    project_id: str, body: ConfigurationCreate, db: DbDep
) -> ConfigurationResponse:
    svc = ConfigurationService(db)
    cfg = svc.create(project_id, body.name, body.version, body.config)
    return _cfg_to_response(cfg)


@router.get("/projects/{project_id}/configs", response_model=ConfigurationList)
def list_configurations(project_id: str, db: DbDep) -> ConfigurationList:
    svc = ConfigurationService(db)
    cfgs = svc.list_all(project_id)
    items = [_cfg_to_response(c) for c in cfgs]
    return ConfigurationList(items=items, total=len(items))


@router.get("/projects/{project_id}/configs/{config_id}", response_model=ConfigurationResponse)
def get_configuration(project_id: str, config_id: str, db: DbDep) -> ConfigurationResponse:
    svc = ConfigurationService(db)
    cfg = svc.get_by_id(project_id, config_id)
    return _cfg_to_response(cfg)


@router.post(
    "/projects/{project_id}/configs/{config_id}/promote",
    response_model=ConfigurationResponse,
)
def promote_configuration(project_id: str, config_id: str, db: DbDep) -> ConfigurationResponse:
    svc = ConfigurationService(db)
    cfg = svc.promote(project_id, config_id)
    return _cfg_to_response(cfg)


@router.delete("/projects/{project_id}/configs/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_configuration(project_id: str, config_id: str, db: DbDep) -> None:
    svc = ConfigurationService(db)
    svc.delete(project_id, config_id)
